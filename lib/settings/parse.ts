import type { z } from "zod";
import { settingsSchemas, type SiteSettings } from "./schema";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Parse stored settings without letting one bad field take the store down:
 * any top-level field that fails validation is dropped so its default is used,
 * and the rest of the section is kept. Matters for a template — a code update
 * that tightens a rule must not wipe a buyer's customizations.
 */
export function parseSectionLenient<S extends z.ZodType>(schema: S, raw: unknown): z.output<S> {
  const data: Record<string, unknown> = isPlainObject(raw) ? { ...raw } : {};
  for (let attempt = 0; attempt < 50; attempt++) {
    const result = schema.safeParse(data);
    if (result.success) return result.data;
    // An issue with an empty path is about the section as a whole — give up.
    if (result.error.issues.some((i) => i.path.length === 0)) break;
    for (const issue of result.error.issues) delete data[String(issue.path[0])];
  }
  return schema.parse({});
}

export function defaultSettings(): SiteSettings {
  return {
    identity: settingsSchemas.identity.parse({}),
    theme: settingsSchemas.theme.parse({}),
    commerce: settingsSchemas.commerce.parse({}),
    homepage: settingsSchemas.homepage.parse({}),
  };
}

/** Build settings from stored `{ key, data }` rows. */
export function settingsFromRows(rows: { key: string; data: unknown }[]): SiteSettings {
  const byKey = new Map(rows.map((r) => [r.key, r.data]));
  return {
    identity: parseSectionLenient(settingsSchemas.identity, byKey.get("identity")),
    theme: parseSectionLenient(settingsSchemas.theme, byKey.get("theme")),
    commerce: parseSectionLenient(settingsSchemas.commerce, byKey.get("commerce")),
    homepage: parseSectionLenient(settingsSchemas.homepage, byKey.get("homepage")),
  };
}
