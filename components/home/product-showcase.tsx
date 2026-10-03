import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import type { StoreProduct } from "@/lib/types";

export function ProductShowcase({
  id,
  eyebrow,
  title,
  description,
  products,
  ctaHref = "/products",
  ctaLabel = "Shop all",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  products: StoreProduct[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section id={id} className="container-page py-16 sm:py-20">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            {eyebrow && (
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-2 max-w-xl text-4xl font-bold sm:text-5xl">{title}</h2>
            {description && (
              <p className="mt-3 max-w-lg text-muted-foreground">{description}</p>
            )}
          </div>
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {ctaLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>

      <StaggerGroup className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((p, i) => (
          <StaggerItem key={p.id}>
            <ProductCard product={p} priority={i < 4} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
