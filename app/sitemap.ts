import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { getPublishedPageList } from "@/lib/pages";
import { getSettings, siteBaseUrl } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, pages, settings] = await Promise.all([
    getProducts(),
    getPublishedPageList(),
    getSettings(),
  ]);
  const base = siteBaseUrl(settings);

  const productUrls = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const pageUrls = pages.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...productUrls,
    ...pageUrls,
  ];
}
