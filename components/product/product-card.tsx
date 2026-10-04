"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { ProductMedia } from "./product-media";
import { AddToCartButton } from "./add-to-cart-button";
import { QuickAddSize } from "./quick-add-size";
import { Badge } from "@/components/ui/badge";
import { formatPrice, discountPercent } from "@/lib/format";
import type { StoreProduct } from "@/lib/types";

export function ProductCard({
  product,
  priority,
}: {
  product: StoreProduct;
  priority?: boolean;
}) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const tint = `color-mix(in oklab, var(--${product.accentColor}) 20%, white)`;

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-black/5 bg-card p-3 shadow-sm hover:shadow-xl"
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-3xl"
        style={{ backgroundColor: tint }}
      >
        <ProductMedia product={product} priority={priority} />
        {off && (
          <Badge className="absolute left-3 top-3 rounded-full bg-brand-cherry px-2.5 py-1 text-white">
            -{off}%
          </Badge>
        )}
        {product.mood && (
          <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-brand-ink backdrop-blur">
            {product.mood}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        {product.tagline && (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {product.tagline}
          </p>
        )}
        <h3 className="mt-1 text-lg font-bold leading-tight">
          <Link href={`/products/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {product.flavor && (
          <p className="mt-0.5 text-sm text-muted-foreground">{product.flavor}</p>
        )}

        <div className="mt-4 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          {product.sizes.length > 0 ? (
            <QuickAddSize product={product} />
          ) : (
            <AddToCartButton
              product={product}
              size="icon"
              className="size-10 shrink-0"
            >
              <Plus className="size-5" />
            </AddToCartButton>
          )}
        </div>
      </div>
    </motion.article>
  );
}
