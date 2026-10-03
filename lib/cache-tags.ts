/**
 * Cache tags for `unstable_cache` data. Invalidate with `updateTag()` from
 * admin Server Actions (the admin sees their change on the next request) or
 * `revalidateTag(tag, "max")` from route handlers / webhooks.
 */
export const CACHE_TAGS = {
  settings: "site-settings",
  pages: "pages",
  catalog: "catalog",
} as const;
