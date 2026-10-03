import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { ProductShowcase } from "@/components/home/product-showcase";
import { Features } from "@/components/home/features";
import { Testimonials } from "@/components/home/testimonials";
import { BundlePromo } from "@/components/home/bundle-promo";
import { Faq } from "@/components/home/faq";
import { getHomepageReviews, getProducts } from "@/lib/products";
import { getSettings, toCommerceRules } from "@/lib/settings";

export default async function HomePage() {
  const [featured, all, settings, reviews] = await Promise.all([
    getProducts({ featured: true }),
    getProducts(),
    getSettings(),
    getHomepageReviews(),
  ]);
  const home = settings.homepage;
  const show = home.sections;

  // Fall back to newest products if nothing is flagged featured.
  const showcase = (featured.length > 0 ? featured : all).slice(0, 8);
  const heroProducts = all.filter((p) => p.images[0]).slice(0, 3);

  return (
    <>
      {show.hero && <Hero content={home.hero} products={heroProducts} />}
      {show.marquee && <Marquee items={home.marquee} />}
      {show.products && (
        <ProductShowcase
          id="featured"
          eyebrow={home.products.eyebrow}
          title={home.products.title}
          description={home.products.description}
          products={showcase}
          ctaHref="/products"
          ctaLabel="Shop all"
        />
      )}
      {show.features && <Features content={home.features} />}
      {show.testimonials && <Testimonials content={home.testimonials} reviews={reviews} />}
      {show.promo && <BundlePromo content={home.promo} rules={toCommerceRules(settings)} />}
      {show.faq && <Faq content={home.faq} />}
    </>
  );
}
