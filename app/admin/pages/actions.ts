"use server";

import { revalidatePath, updateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { db, hasDatabase } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { assertAdmin } from "@/lib/admin-guard";
import { pageSchema, type PageInput } from "@/lib/page-schema";

type PageActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
  slug?: string;
};

/** Expire cached page reads plus every route that shows them (footer is in the layout). */
function refreshPages(...slugs: string[]) {
  updateTag(CACHE_TAGS.pages);
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  for (const slug of slugs) revalidatePath(`/${slug}`);
}

export async function savePage(input: PageInput & { id?: string }): Promise<PageActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can edit pages." };
  }
  if (!hasDatabase) return { ok: false, error: "Connect a database to save pages." };

  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid page", fieldErrors };
  }
  const d = parsed.data;
  const data = { ...d, seoTitle: d.seoTitle || null, seoDescription: d.seoDescription || null };

  try {
    if (input.id) {
      const before = await db.page.findUnique({ where: { id: input.id }, select: { slug: true } });
      if (!before) return { ok: false, error: "This page no longer exists." };
      await db.page.update({ where: { id: input.id }, data });
      refreshPages(before.slug, d.slug);
      return { ok: true, id: input.id, slug: d.slug };
    }
    const created = await db.page.create({ data });
    refreshPages(d.slug);
    return { ok: true, id: created.id, slug: d.slug };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return {
        ok: false,
        error: "Another page already uses this URL.",
        fieldErrors: { slug: "Another page already uses this URL" },
      };
    }
    console.error("savePage failed", err);
    return { ok: false, error: "Couldn't save the page — please try again." };
  }
}

export async function deletePage(id: string): Promise<PageActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can delete pages." };
  }
  if (!hasDatabase) return { ok: false, error: "Database not configured" };
  try {
    const page = await db.page.delete({ where: { id }, select: { slug: true } });
    refreshPages(page.slug);
    return { ok: true };
  } catch (err) {
    console.error("deletePage failed", err);
    return { ok: false, error: "Couldn't delete the page." };
  }
}
