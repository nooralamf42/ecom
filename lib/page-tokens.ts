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

/** Replace {{token}} placeholders with current settings. Unknown tokens are left as written. */
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
  return content.replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (match, name: string) =>
    name in values ? values[name as Token] : match,
  );
}
