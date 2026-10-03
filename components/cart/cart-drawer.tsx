"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart, useHydrated, lineKey } from "@/store/cart";
import { useLenisLock } from "@/components/providers/smooth-scroll-provider";
import { computeTotals } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/format";
import { ProductGraphic } from "@/components/product/product-graphic";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { lines, isOpen, close, setQty, remove } = useCart();
  const hydrated = useHydrated();
  const totals = computeTotals(lines);
  useLenisLock(isOpen);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-heading text-2xl">
            <ShoppingBag className="size-5 text-primary" />
            Your bag
          </SheetTitle>
        </SheetHeader>

        {/* Free-shipping / tier progress */}
        {hydrated && lines.length > 0 && (
          <div className="border-b bg-brand-cream/60 px-5 py-3">
            {totals.nextTier ? (
              <p className="text-sm font-medium">
                Add{" "}
                <span className="font-bold text-primary">
                  {formatPrice(totals.nextTier.remaining)}
                </span>{" "}
                more to unlock {totals.nextTier.label} 🎉
              </p>
            ) : (
              <p className="text-sm font-semibold text-primary">
                You&apos;ve unlocked the best perks! 🎉
              </p>
            )}
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (totals.subtotal / 199900) * 100)}%`,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!hydrated ? null : lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-5">
                <ShoppingBag className="size-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Let&apos;s fix that with something delicious.
              </p>
              <Link
                href="/products"
                onClick={close}
                className={cn(buttonVariants(), "mt-5 rounded-full")}
              >
                Shop drinks
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <motion.li
                    key={lineKey(line.productId, line.size)}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-3"
                  >
                    <div
                      className="relative size-20 shrink-0 overflow-hidden rounded-2xl"
                      style={{
                        backgroundColor: `color-mix(in oklab, var(--${line.accentColor}) 20%, white)`,
                      }}
                    >
                      {line.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.image}
                          alt={line.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ProductGraphic
                          type="DRINK"
                          accent={line.accentColor}
                          className="h-full w-full"
                        />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${line.slug}`}
                          onClick={close}
                          className="font-bold leading-tight hover:text-primary"
                        >
                          {line.name}
                        </Link>
                        <button
                          onClick={() => remove(line.productId, line.size)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(line.price)}
                        {line.size && (
                          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">
                            Size {line.size}
                          </span>
                        )}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-full border p-1">
                          <button
                            onClick={() => setQty(line.productId, line.size, line.quantity - 1)}
                            className="grid size-7 place-items-center rounded-full hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => setQty(line.productId, line.size, line.quantity + 1)}
                            className="grid size-7 place-items-center rounded-full hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="font-bold">
                          {formatPrice(line.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {hydrated && lines.length > 0 && (
          <div className="border-t bg-card px-5 py-4">
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
              {totals.discount > 0 && (
                <Row
                  label="Discount"
                  value={`- ${formatPrice(totals.discount)}`}
                  accent
                />
              )}
              <Row
                label="Shipping"
                value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
              />
              <div className="my-2 border-t" />
              <div className="flex items-center justify-between text-base font-extrabold">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-4 w-full rounded-full text-base font-bold",
              )}
            >
              Checkout
            </Link>
            <button
              onClick={close}
              className="mt-2 flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" /> Continue shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-primary" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
