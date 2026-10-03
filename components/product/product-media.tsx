import Image from "next/image";
import { ProductGraphic } from "./product-graphic";
import type { StoreProduct } from "@/lib/types";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProductMedia({
  product,
  priority,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: {
  product: StoreProduct;
  priority?: boolean;
  sizes?: string;
}) {
  const img = product.images?.[0];
  if (img) {
    return (
      <Image
        src={img}
        alt={product.name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <ProductGraphic
        type={product.type}
        accent={product.accentColor}
        initials={initialsOf(product.name)}
        className="h-full w-full drop-shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2"
      />
    </div>
  );
}
