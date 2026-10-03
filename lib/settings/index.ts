import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { defaultSettings, settingsFromRows } from "./parse";
import type { CommerceRules, SiteSettings } from "./schema";

const loadSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    if (!hasDatabase) return defaultSettings();
    return settingsFromRows(await db.siteSetting.findMany());
  },
  ["site-settings:v1"],
  // revalidate: safety net for writes made outside Next (seed script);
  // admin saves invalidate immediately via updateTag(CACHE_TAGS.settings).
  { tags: [CACHE_TAGS.settings], revalidate: 3600 },
);

/**
 * All store settings. Cached across requests (invalidated on admin save) and
 * deduped within a request, since the layout, metadata and page all read it.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return await loadSettings();
  } catch (err) {
    console.error("Failed to load site settings; using defaults", err);
    return defaultSettings();
  }
});

export function toCommerceRules(settings: SiteSettings): CommerceRules {
  const { shippingFee, freeShippingEnabled, freeShippingThreshold, tiers } = settings.commerce;
  return { shippingFee, freeShippingEnabled, freeShippingThreshold, tiers };
}

export async function getCommerceRules(): Promise<CommerceRules> {
  return toCommerceRules(await getSettings());
}
