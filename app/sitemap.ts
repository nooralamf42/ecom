import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const productUrls = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...productUrls,
  ];
}
