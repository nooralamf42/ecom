import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { ProductShowcase } from "@/components/home/product-showcase";
import { Features } from "@/components/home/features";
import { Testimonials } from "@/components/home/testimonials";
import { BundlePromo } from "@/components/home/bundle-promo";
import { Faq } from "@/components/home/faq";
import { getProducts } from "@/lib/products";

export default async function HomePage() {
  const [featured, all] = await Promise.all([
    getProducts({ featured: true }),
    getProducts(),
  ]);

  // Fall back to newest products if nothing is flagged featured.
  const showcase = (featured.length > 0 ? featured : all).slice(0, 8);
  const heroProducts = all.filter((p) => p.images[0]).slice(0, 3);

  return (
    <>
      <Hero products={heroProducts} />
      <Marquee />
      <ProductShowcase
        id="bangles"
        eyebrow="Bestsellers"
        title="Shine in every design"
        description="Handcrafted bangles in gorgeous styles and every size — 2.2 to 2.8."
        products={showcase}
        ctaHref="/products"
        ctaLabel="Shop all"
      />
      <Features />
      <Testimonials />
      <BundlePromo />
      <Faq />
    </>
  );
}
