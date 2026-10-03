"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { assertAdmin } from "@/lib/admin-guard";
import { settingsSchemas, type SettingsSection, type SiteSettings } from "@/lib/settings/schema";

export type SaveSettingsResult<K extends SettingsSection = SettingsSection> =
  | { ok: true; data: SiteSettings[K] }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Validate and store one settings section, then refresh every page that shows it. */
export async function saveSettingsSection<K extends SettingsSection>(
  section: K,
  input: unknown,
): Promise<SaveSettingsResult<K>> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can change settings." };
  }
  if (!hasDatabase) return { ok: false, error: "Connect a database to save settings." };

  const schema = settingsSchemas[section];
  if (!schema) return { ok: false, error: "Unknown settings section." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.map(String).join(".");
      fieldErrors[key] ??= issue.message;
    }
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Some fields are invalid.",
      fieldErrors,
    };
  }

  try {
    const data = JSON.parse(JSON.stringify(parsed.data));
    await db.siteSetting.upsert({
      where: { key: section },
      update: { data },
      create: { key: section, data },
    });
  } catch (err) {
    console.error("Failed to save settings", err);
    return { ok: false, error: "Couldn't save — please try again." };
  }

  updateTag(CACHE_TAGS.settings);
  revalidatePath("/", "layout");
  return { ok: true, data: parsed.data as SiteSettings[K] };
}

/** Drop every cached storefront read — e.g. after a bulk product import. */
export async function refreshStoreCache(): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can do this." };
  }
  for (const tag of Object.values(CACHE_TAGS)) updateTag(tag);
  revalidatePath("/", "layout");
  return { ok: true };
}
