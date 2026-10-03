import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "./db";
import { demoProducts, demoReviews } from "./demo-data";
import { demoSlugToType } from "./categories";
import { CACHE_TAGS } from "./cache-tags";
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

/*
 * Cached reads. These throw on DB errors so a failure is never cached; the
 * exported wrappers below decide the fallback. `revalidate` is a safety net
 * for writes made outside Next (seed/import scripts) — admin changes
 * invalidate immediately via updateTag(CACHE_TAGS.catalog).
 */
const CATALOG_TTL = 3600;

const loadProducts = unstable_cache(
  async (type: ProductType | null, featured: boolean | null, categorySlug: string | null) => {
    const rows = await db.product.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(featured !== null ? { featured } : {}),
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return rows.map(toStoreProduct);
  },
  ["products:list:v1"],
  { tags: [CACHE_TAGS.catalog], revalidate: CATALOG_TTL },
);

const loadProductBySlug = unstable_cache(
  async (slug: string) => {
    const row = await db.product.findUnique({ where: { slug } });
    return row ? toStoreProduct(row) : null;
  },
  ["products:by-slug:v1"],
  { tags: [CACHE_TAGS.catalog], revalidate: CATALOG_TTL },
);

const loadProductReviews = unstable_cache(
  async (productId: string) => {
    const rows = await db.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      images: r.images,
      verified: true,
    }));
  },
  ["products:reviews:v1"],
  { tags: [CACHE_TAGS.reviews], revalidate: CATALOG_TTL },
);

export async function getProducts(filter: ProductFilter = {}): Promise<StoreProduct[]> {
  if (!hasDatabase) {
    // Demo mode (no DB configured): a category slug maps back to a product type.
    const catType = filter.categorySlug ? demoSlugToType(filter.categorySlug) : undefined;
    return demoProducts.filter(
      (p) =>
        (!filter.type || p.type === filter.type) &&
        (!catType || p.type === catType) &&
        (filter.featured === undefined || p.featured === filter.featured),
    );
  }
  try {
    return await loadProducts(
      filter.type ?? null,
      filter.featured ?? null,
      filter.categorySlug ?? null,
    );
  } catch (err) {
    console.error("getProducts failed", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  if (!hasDatabase) {
    return demoProducts.find((p) => p.slug === slug) ?? null;
  }
  try {
    return await loadProductBySlug(slug);
  } catch (err) {
    console.error("getProductBySlug failed", err);
    return null;
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
    // Real customer reviews first, then the sample reviews.
    return [...(await loadProductReviews(productId)), ...demo];
  } catch (err) {
    console.error("getProductReviews failed", err);
    return demo;
  }
}

/**
 * Deliberately NOT cached: checkout uses this for authoritative prices, so it
 * must always read the database.
 */
export async function getProductsByIds(ids: string[]): Promise<StoreProduct[]> {
  if (ids.length === 0) return [];
  if (!hasDatabase) {
    return demoProducts.filter((p) => ids.includes(p.id));
  }
  const rows = await db.product.findMany({ where: { id: { in: ids } } });
  return rows.map(toStoreProduct);
}
