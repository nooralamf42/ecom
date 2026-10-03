import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getStoreCategories } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { ProductType } from "@/lib/types";

export const metadata = { title: "Shop all" };
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const { category, type } = await searchParams;
  const [categories, { identity }] = await Promise.all([getStoreCategories(), getSettings()]);

  const activeType = ["DRINK", "GUMMY", "BUNDLE"].includes(type ?? "")
    ? (type as ProductType)
    : undefined;

  const products = await getProducts({
    categorySlug: category,
    type: activeType,
  });

  return (
    <div className="container-page py-12 sm:py-16">
      <Reveal>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Shop
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{identity.shopHeading}</h1>
        {identity.shopDescription && (
          <p className="mt-3 max-w-lg text-muted-foreground">{identity.shopDescription}</p>
        )}
      </Reveal>

      {/* Filter pills (from the database) */}
      <div className="mt-8 flex flex-wrap gap-2">
        <FilterPill href="/products" label="All" active={!category && !activeType} />
        {categories.map((c) => (
          <FilterPill
            key={c.slug}
            href={`/products?category=${c.slug}`}
            label={c.name}
            active={category === c.slug}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          No products here yet — check back soon!
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-5 py-2 text-sm font-bold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "hover:border-primary hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}
