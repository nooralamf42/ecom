import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getProductReviews, getProducts } from "@/lib/products";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductShowcase } from "@/components/home/product-showcase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.tagline ?? product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getProductReviews(product.id),
    getProducts({ type: product.type }),
  ]);

  const alsoLike = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <ProductDetail product={product} reviews={reviews} />
      {alsoLike.length > 0 && (
        <ProductShowcase
          eyebrow="You might also like"
          title="More to love"
          products={alsoLike}
        />
      )}
    </>
  );
}
