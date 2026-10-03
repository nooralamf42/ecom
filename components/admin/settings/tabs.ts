// Plain module (not "use client") so the server page can read these values too.
export const SETTINGS_TABS = [
  { value: "store", label: "Store & SEO" },
  { value: "theme", label: "Theme" },
  { value: "homepage", label: "Homepage" },
  { value: "shipping", label: "Shipping & Discounts" },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]["value"];
