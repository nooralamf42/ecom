import type { MetadataRoute } from "next";
import { getSettings, siteBaseUrl } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteBaseUrl(await getSettings());
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/orders", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
