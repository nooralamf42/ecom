"use client";

import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/lib/types";
import type { ComponentProps, ReactNode } from "react";

export function AddToCartButton({
  product,
  qty = 1,
  selectedSize = null,
  className,
  children,
  variant,
  size,
}: {
  product: StoreProduct;
  qty?: number;
  selectedSize?: string | null;
  className?: string;
  children?: ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
}) {
  const add = useCart((s) => s.add);
  const soldOut = product.stock <= 0;
  const needsSize = product.sizes.length > 0 && !selectedSize;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={soldOut}
      className={cn("rounded-full font-semibold", className)}
      onClick={() => {
        if (needsSize) {
          toast.error("Please select a size first");
          return;
        }
        add(
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? null,
            accentColor: product.accentColor,
            size: selectedSize,
          },
          qty,
        );
        toast.success(`${product.name} added to your cart`);
      }}
    >
      {soldOut ? "Sold out" : (children ?? "Add to cart")}
    </Button>
  );
}
