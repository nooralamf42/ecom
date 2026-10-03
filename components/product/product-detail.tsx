"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Minus, Plus, Star, Truck } from "lucide-react";
import { ProductMedia } from "./product-media";
import { AddToCartButton } from "./add-to-cart-button";
import Image from "next/image";
import { formatPrice, discountPercent } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "./review-form";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import type { StoreProduct, ReviewView } from "@/lib/types";

/** Lowest cart value that unlocks free shipping, from the store's rules. */
function freeShippingText(rules: {
  shippingFee: number;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  tiers: { minSubtotal: number; freeShipping: boolean }[];
}): string {
  if (rules.shippingFee === 0) return "Free shipping";
  const mins = rules.tiers.filter((t) => t.freeShipping).map((t) => t.minSubtotal);
  if (rules.freeShippingEnabled) mins.push(rules.freeShippingThreshold);
  if (mins.length === 0) return "";
  return `Free shipping on orders over ${formatPrice(Math.min(...mins))}`;
}

export function ProductDetail({
  product,
  reviews,
}: {
  product: StoreProduct;
  reviews: ReviewView[];
}) {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { commerce } = useSiteSettings();
  const shippingNote = [freeShippingText(commerce), commerce.deliveryEstimate && `ships in ${commerce.deliveryEstimate}`]
    .filter(Boolean)
    .join(" · ");
  const off = discountPercent(product.price, product.compareAtPrice);
  const tint = `color-mix(in oklab, var(--${product.accentColor}) 22%, white)`;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 5;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Media */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square overflow-hidden rounded-[2rem]"
          style={{ backgroundColor: tint }}
        >
          <ProductMedia product={product} priority sizes="(max-width: 1024px) 100vw, 50vw" />
          {off && (
            <Badge className="absolute left-4 top-4 rounded-full bg-brand-cherry px-3 py-1 text-white">
              Save {off}%
            </Badge>
          )}
        </motion.div>

        {/* Info */}
        <div className="flex flex-col">
          {product.tagline && (
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              {product.tagline}
            </p>
          )}
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(avgRating)
                      ? "size-4 fill-brand-tangerine text-brand-tangerine"
                      : "size-4 text-muted-foreground/30"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {reviews.length} reviews
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-5 max-w-md text-muted-foreground">{product.description}</p>

          {product.flavor && (
            <p className="mt-4 text-sm">
              <span className="font-bold">Flavour:</span> {product.flavor}
            </p>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">
                  Size {selectedSize && <span className="text-primary">· {selectedSize}</span>}
                </span>
                <span className="text-xs text-muted-foreground">Bangle size guide</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={
                      "min-w-14 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors " +
                      (selectedSize === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.benefits.length > 0 && (
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm font-medium">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-mint/40 text-brand-ink">
                    <Check className="size-3.5" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* Quantity + add */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border p-1.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <AddToCartButton
              product={product}
              qty={qty}
              selectedSize={selectedSize}
              size="lg"
              className="flex-1 rounded-full text-base sm:flex-none sm:px-10"
            >
              Add to cart · {formatPrice(product.price * qty)}
            </AddToCartButton>
          </div>

          {shippingNote && (
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="size-4" />
              {shippingNote}
            </div>
          )}

          {product.ingredients && (
            <details className="mt-6 rounded-2xl border bg-card p-5">
              <summary className="cursor-pointer font-bold">Ingredients</summary>
              <p className="mt-2 text-sm text-muted-foreground">{product.ingredients}</p>
            </details>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl font-bold">What customers say</h2>
        {reviews.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.id}
                className="rounded-2xl border border-black/5 bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(r.rating)].map((_, s) => (
                      <Star key={s} className="size-4 fill-brand-tangerine text-brand-tangerine" />
                    ))}
                  </div>
                  {r.verified && (
                    <span className="rounded-full bg-brand-mint/40 px-2 py-0.5 text-[11px] font-bold text-brand-ink">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <blockquote className="mt-2 text-sm text-brand-ink/80">
                  “{r.comment}”
                </blockquote>
                {r.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.images.map((src, k) => (
                      <div
                        key={k}
                        className="relative size-16 overflow-hidden rounded-lg border"
                      >
                        <Image src={src} alt="Customer photo" fill sizes="64px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <figcaption className="mt-3 text-sm font-bold">{r.author}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <ReviewForm productId={product.id} />
      </section>
    </div>
  );
}
