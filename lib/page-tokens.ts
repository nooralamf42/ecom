import type { SiteSettings } from "./settings/schema";

/** Placeholders page content can use, so policy pages stay right when settings change. */
export const PAGE_TOKENS = [
  { token: "storeName", label: "Store name" },
  { token: "contactEmail", label: "Contact email" },
  { token: "contactPhone", label: "Contact phone" },
  { token: "address", label: "Address" },
  { token: "returnWindowDays", label: "Return window (days)" },
  { token: "deliveryEstimate", label: "Delivery time" },
] as const;

type Token = (typeof PAGE_TOKENS)[number]["token"];

const TOKEN_RE = /\{\{\s*([a-zA-Z]+)\s*\}\}/g;

/** Used mid-sentence when the store hasn't set an email yet. */
const EMAIL_FALLBACK = "our [contact page](/contact)";

/**
 * Replace {{token}} placeholders with current settings. Unknown tokens are
 * left as written. A list item whose placeholder is empty (e.g. "- Phone:
 * {{contactPhone}}" with no phone set) is dropped rather than shown blank.
 */
export function fillPageTokens(
  content: string,
  settings: Pick<SiteSettings, "identity" | "commerce">,
): string {
  const values: Record<Token, string> = {
    storeName: settings.identity.storeName,
    contactEmail: settings.identity.contactEmail,
    contactPhone: settings.identity.contactPhone,
    address: settings.identity.address,
    returnWindowDays: String(settings.commerce.returnWindowDays),
    deliveryEstimate: settings.commerce.deliveryEstimate,
  };
  const isEmpty = (name: string) => name in values && !values[name as Token].trim();

  return content
    .split("\n")
    .filter((line) => {
      if (!/^\s*([-*+]|\d+\.)\s/.test(line)) return true;
      return ![...line.matchAll(TOKEN_RE)].some((m) => isEmpty(m[1]));
    })
    .join("\n")
    .replace(TOKEN_RE, (match, name: string) => {
      if (!(name in values)) return match;
      if (name === "contactEmail" && isEmpty(name)) return EMAIL_FALLBACK;
      return values[name as Token];
    });
}

/** Contact details policy pages rely on that the store hasn't filled in yet. */
export function missingContactDetails(settings: Pick<SiteSettings, "identity">): string[] {
  const { contactEmail, contactPhone, address } = settings.identity;
  return [
    !contactEmail && "email",
    !contactPhone && "phone",
    !address && "address",
  ].filter((x): x is string => Boolean(x));
}
