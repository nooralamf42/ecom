import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "./db";
import { CACHE_TAGS } from "./cache-tags";
import { RESERVED_SLUGS } from "./page-schema";

export type PageLink = { slug: string; title: string };

export type PublicPage = {
  slug: string;
  title: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string; // ISO — cached values are JSON-serialized
};

// Cached reads throw on DB errors so failures are never cached; the exported
// wrappers choose the fallback. Admin page edits call updateTag(CACHE_TAGS.pages).
const PAGES_TTL = 3600;

const loadFooterPages = unstable_cache(
  async (): Promise<PageLink[]> =>
    db.page.findMany({
      where: { isPublished: true, showInFooter: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { slug: true, title: true },
    }),
  ["pages:footer:v1"],
  { tags: [CACHE_TAGS.pages], revalidate: PAGES_TTL },
);

const loadPublishedPage = unstable_cache(
  async (slug: string): Promise<PublicPage | null> => {
    const p = await db.page.findUnique({ where: { slug } });
    if (!p || !p.isPublished) return null;
    return {
      slug: p.slug,
      title: p.title,
      content: p.content,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      updatedAt: p.updatedAt.toISOString(),
    };
  },
  ["pages:by-slug:v1"],
  { tags: [CACHE_TAGS.pages], revalidate: PAGES_TTL },
);

const loadPublishedPageList = unstable_cache(
  async (): Promise<{ slug: string; updatedAt: string }[]> => {
    const rows = await db.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt.toISOString() }));
  },
  ["pages:published-list:v1"],
  { tags: [CACHE_TAGS.pages], revalidate: PAGES_TTL },
);

export async function getFooterPages(): Promise<PageLink[]> {
  if (!hasDatabase) return [];
  try {
    return await loadFooterPages();
  } catch (err) {
    console.error("getFooterPages failed", err);
    return [];
  }
}

export async function getPublishedPage(slug: string): Promise<PublicPage | null> {
  if (!hasDatabase || RESERVED_SLUGS.has(slug)) return null;
  try {
    return await loadPublishedPage(slug);
  } catch (err) {
    console.error("getPublishedPage failed", err);
    return null;
  }
}

/** For the sitemap. */
export async function getPublishedPageList(): Promise<{ slug: string; updatedAt: string }[]> {
  if (!hasDatabase) return [];
  try {
    return await loadPublishedPageList();
  } catch (err) {
    console.error("getPublishedPageList failed", err);
    return [];
  }
}
