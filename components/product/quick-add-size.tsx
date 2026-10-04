"use client";

import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StoreProduct } from "@/lib/types";

/** "+" on a product card for products with sizes: pick a size, add to cart. */
export function QuickAddSize({ product }: { product: StoreProduct }) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const soldOut = product.stock <= 0;

  function addSize(size: string) {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
      accentColor: product.accentColor,
      size,
    });
    toast.success(`${product.name} (size ${size}) added to your cart`, {
      action: { label: "View cart", onClick: openCart },
    });
  }

  if (soldOut) {
    return (
      <Button size="sm" disabled className="shrink-0 rounded-full">
        Sold out
      </Button>
    );
  }

  return (
    // Not modal: a modal menu would lock page scrolling, which fights the smooth-scroll library.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon"
            aria-label={`Add ${product.name} to cart — choose a size`}
            className="size-10 shrink-0 rounded-full transition-transform hover:scale-105"
          >
            <Plus className="size-5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" side="top" className="w-44 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-1.5 pb-1 text-xs text-muted-foreground">Choose a size</DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-1">
            {product.sizes.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => addSize(s)}
                className="justify-center rounded-full border py-2 text-sm font-bold focus:border-primary focus:bg-primary focus:text-primary-foreground"
              >
                {s}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
