import { db, hasDatabase } from "./db";
import { demoProducts } from "./demo-data";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  type: "DRINK" | "GUMMY" | "BUNDLE";
  price: number;
  compareAtPrice: number | null;
  images: string[];
  accentColor: string;
  flavor: string;
  mood: string;
  sizes: string[];
  benefits: string[];
  ingredients: string;
  stock: number;
  featured: boolean;
  isActive: boolean;
  categoryId: string | null;
};

export async function getAdminStats() {
  if (!hasDatabase) {
    return { orders: 0, revenue: 0, products: demoProducts.length, pending: 0 };
  }
  const [orders, revenueAgg, products, pending] = await Promise.all([
    db.order.count({ where: { status: { not: "PENDING" } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "FULFILLED", "SHIPPED", "DELIVERED"] } },
    }),
    db.product.count(),
    db.order.count({ where: { status: "PAID" } }),
  ]);
  return {
    orders,
    revenue: revenueAgg._sum.total ?? 0,
    products,
    pending,
  };
}

function demoToAdmin(p: (typeof demoProducts)[number]): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline ?? "",
    description: p.description,
    type: p.type,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    accentColor: p.accentColor,
    flavor: p.flavor ?? "",
    mood: p.mood ?? "",
    sizes: p.sizes ?? [],
    benefits: p.benefits,
    ingredients: p.ingredients ?? "",
    stock: p.stock,
    featured: p.featured,
    isActive: true,
    categoryId: null,
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  if (!hasDatabase) return demoProducts.map(demoToAdmin);
  const rows = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline ?? "",
    description: p.description,
    type: p.type as AdminProduct["type"],
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    accentColor: p.accentColor,
    flavor: p.flavor ?? "",
    mood: p.mood ?? "",
    sizes: p.sizes ?? [],
    benefits: p.benefits,
    ingredients: p.ingredients ?? "",
    stock: p.stock,
    featured: p.featured,
    isActive: p.isActive,
    categoryId: p.categoryId,
  }));
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  if (!hasDatabase) {
    const p = demoProducts.find((x) => x.id === id);
    return p ? demoToAdmin(p) : null;
  }
  const p = await db.product.findUnique({ where: { id } });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline ?? "",
    description: p.description,
    type: p.type as AdminProduct["type"],
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    accentColor: p.accentColor,
    flavor: p.flavor ?? "",
    mood: p.mood ?? "",
    sizes: p.sizes ?? [],
    benefits: p.benefits,
    ingredients: p.ingredients ?? "",
    stock: p.stock,
    featured: p.featured,
    isActive: p.isActive,
    categoryId: p.categoryId,
  };
}
