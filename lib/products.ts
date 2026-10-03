import { db, hasDatabase } from "./db";
import { demoProducts, demoReviews } from "./demo-data";
import { demoSlugToType } from "./categories";
import type { ProductType, StoreProduct, ReviewView } from "./types";

type DbProduct = Awaited<ReturnType<typeof db.product.findFirst>>;

function toStoreProduct(p: NonNullable<DbProduct>): StoreProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    type: p.type as ProductType,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    images: p.images,
    accentColor: p.accentColor,
    flavor: p.flavor,
    mood: p.mood,
    sizes: p.sizes ?? [],
    benefits: p.benefits,
    ingredients: p.ingredients,
    stock: p.stock,
    featured: p.featured,
  };
}

export type ProductFilter = {
  type?: ProductType;
  featured?: boolean;
  categorySlug?: string;
};

export async function getProducts(filter: ProductFilter = {}): Promise<StoreProduct[]> {
  if (!hasDatabase) {
    // In demo mode a category slug maps back to a product type.
    const catType = filter.categorySlug ? demoSlugToType(filter.categorySlug) : undefined;
    return demoProducts.filter(
      (p) =>
        (!filter.type || p.type === filter.type) &&
        (!catType || p.type === catType) &&
        (filter.featured === undefined || p.featured === filter.featured),
    );
  }
  try {
    const rows = await db.product.findMany({
      where: {
        isActive: true,
        ...(filter.type ? { type: filter.type } : {}),
        ...(filter.categorySlug ? { category: { slug: filter.categorySlug } } : {}),
        ...(filter.featured !== undefined ? { featured: filter.featured } : {}),
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return rows.map(toStoreProduct);
  } catch {
    // DB unreachable at request time — fall back gracefully.
    return demoProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  if (!hasDatabase) {
    return demoProducts.find((p) => p.slug === slug) ?? null;
  }
  try {
    const row = await db.product.findUnique({ where: { slug } });
    return row ? toStoreProduct(row) : null;
  } catch {
    return demoProducts.find((p) => p.slug === slug) ?? null;
  }
}

export async function getProductReviews(productId: string): Promise<ReviewView[]> {
  const demo: ReviewView[] = demoReviews.map((r, i) => ({
    id: `demo-${i}`,
    author: r.author,
    rating: r.rating,
    comment: r.comment,
    images: [],
    verified: false,
  }));
  if (!hasDatabase) return demo;
  try {
    const rows = await db.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const real: ReviewView[] = rows.map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      images: r.images,
      verified: true,
    }));
    // Real customer reviews first, then the sample reviews.
    return [...real, ...demo];
  } catch {
    return demo;
  }
}

export async function getProductsByIds(ids: string[]): Promise<StoreProduct[]> {
  if (ids.length === 0) return [];
  if (!hasDatabase) {
    return demoProducts.filter((p) => ids.includes(p.id));
  }
  try {
    const rows = await db.product.findMany({ where: { id: { in: ids } } });
    return rows.map(toStoreProduct);
  } catch {
    return demoProducts.filter((p) => ids.includes(p.id));
  }
}

export async function getDrinks() {
  return getProducts({ type: "DRINK" });
}

export async function getGummies() {
  return getProducts({ type: "GUMMY" });
}
