import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "./db";
import { demoProducts } from "./demo-data";
import { CACHE_TAGS } from "./cache-tags";
import type { ProductType } from "./types";

export type StoreCategory = { name: string; slug: string };

// Fallback categories derived from the demo catalog's product types.
const DEMO_CATEGORY_BY_TYPE: Record<ProductType, StoreCategory> = {
  DRINK: { name: "Everyday", slug: "everyday" },
  GUMMY: { name: "Home", slug: "home" },
  BUNDLE: { name: "Gift sets", slug: "gift-sets" },
};

/** Categories that currently have at least one active product. */
export async function getStoreCategories(): Promise<StoreCategory[]> {
  if (!hasDatabase) {
    const seen = new Set<ProductType>();
    for (const p of demoProducts) seen.add(p.type);
    return (["DRINK", "GUMMY", "BUNDLE"] as ProductType[])
      .filter((t) => seen.has(t))
      .map((t) => DEMO_CATEGORY_BY_TYPE[t]);
  }
  try {
    return await loadStoreCategories();
  } catch (err) {
    console.error("getStoreCategories failed", err);
    return [];
  }
}

// Read by the root layout on every page — cached; throws so errors aren't cached.
const loadStoreCategories = unstable_cache(
  async (): Promise<StoreCategory[]> => {
    const cats = await db.category.findMany({
      where: { products: { some: { isActive: true } } },
      orderBy: { name: "asc" },
    });
    return cats.map((c) => ({ name: c.name, slug: c.slug }));
  },
  ["categories:store:v1"],
  { tags: [CACHE_TAGS.catalog], revalidate: 3600 },
);

/** All categories (for the admin selector). */
export async function getAllCategories() {
  if (!hasDatabase) return [];
  try {
    return await db.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

/** Map a demo category slug back to a product type (demo-mode filtering). */
export function demoSlugToType(slug: string): ProductType | undefined {
  const entry = Object.entries(DEMO_CATEGORY_BY_TYPE).find(
    ([, c]) => c.slug === slug,
  );
  return entry?.[0] as ProductType | undefined;
}
