"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart, useHydrated, lineKey } from "@/store/cart";
import { computeTotals } from "@/lib/cart-totals";
import { useCommerceRules } from "@/components/providers/site-settings-provider";
import { formatPrice } from "@/lib/format";
import { ProductGraphic } from "@/components/product/product-graphic";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { lines, setQty, remove } = useCart();
  const hydrated = useHydrated();
  const totals = computeTotals(lines, useCommerceRules());

  if (!hydrated) {
    return <div className="container-page min-h-[50vh] py-16" />;
  }

  if (lines.length === 0) {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-muted">
            <ShoppingBag className="size-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold">Your bag is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Find something you&apos;ll love.
          </p>
          <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "mt-6 rounded-full")}>
            Shop products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-heading text-4xl font-bold">Your bag</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y rounded-3xl border bg-card">
          {lines.map((line) => (
            <li key={lineKey(line.productId, line.size)} className="flex gap-4 p-4 sm:p-5">
              <div
                className="relative size-24 shrink-0 overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--${line.accentColor}) 20%, white)`,
                }}
              >
                {line.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.image} alt={line.name} className="h-full w-full object-cover" />
                ) : (
                  <ProductGraphic type="DRINK" accent={line.accentColor} className="h-full w-full" />
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/products/${line.slug}`} className="text-lg font-bold hover:text-primary">
                    {line.name}
                  </Link>
                  <button
                    onClick={() => remove(line.productId, line.size)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(line.price)} each
                  {line.size && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">
                      Size {line.size}
                    </span>
                  )}
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-1 rounded-full border p-1">
                    <button
                      onClick={() => setQty(line.productId, line.size, line.quantity - 1)}
                      className="grid size-8 place-items-center rounded-full hover:bg-muted"
                      aria-label="Decrease"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold">{line.quantity}</span>
                    <button
                      onClick={() => setQty(line.productId, line.size, line.quantity + 1)}
                      className="grid size-8 place-items-center rounded-full hover:bg-muted"
                      aria-label="Increase"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="font-bold">{formatPrice(line.price * line.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <div className="h-max rounded-3xl border bg-card p-6">
          <h2 className="text-lg font-bold">Order summary</h2>
          {totals.nextTier && (
            <p className="mt-3 rounded-xl bg-brand-cream px-4 py-3 text-sm">
              Add <span className="font-bold text-primary">{formatPrice(totals.nextTier.remaining)}</span>{" "}
              more to unlock {totals.nextTier.label} 🎉
            </p>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
            {totals.discount > 0 && (
              <Row label="Discount" value={`- ${formatPrice(totals.discount)}`} accent />
            )}
            <Row
              label="Shipping"
              value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
            />
            <div className="my-2 border-t" />
            <div className="flex items-center justify-between text-base font-extrabold">
              <dt>Total</dt>
              <dd>{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full rounded-full text-base font-bold")}
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? "font-semibold text-primary" : "font-medium"}>{value}</dd>
    </div>
  );
}
