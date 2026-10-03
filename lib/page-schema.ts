import { z } from "zod";

/** Paths a content page can never take, because a real route or file lives there. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "trpc",
  "cart",
  "checkout",
  "orders",
  "products",
  "sign-in",
  "sign-up",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "_next",
]);

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const pageSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Add a URL")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes, like about-us")
    .refine((s) => !RESERVED_SLUGS.has(s), "This URL is used by the store — pick another"),
  content: z.string().max(50_000, "Page is too long"),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(170),
  isPublished: z.boolean(),
  showInFooter: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
});

export type PageInput = z.infer<typeof pageSchema>;
