import { z } from "zod";

/*
 * Store settings, edited from /admin/settings and stored as one JSON row per
 * section in the SiteSetting table. These schemas are the single source of
 * truth for validation, TypeScript types and the template's generic defaults.
 *
 * zod 4 note: nested objects use `.prefault({})`, not `.default({})` —
 * `.default` returns the value as-is without filling inner defaults.
 */

// ---------- field helpers ----------

const text = (max: number, fallback = "") => z.string().trim().max(max).default(fallback);

/** Empty, or an https:// URL (logos, images). */
const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\//i.test(v), "Must be an https:// URL")
  .default("");

/** Empty, an on-site path ("/products", "#faq"), or an http(s) URL. Blocks javascript: etc. */
const link = (fallback = "") =>
  z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || /^(\/(?!\/)|#|https?:\/\/)/i.test(v),
      "Use a path like /products or a full https:// link",
    )
    .default(fallback);

const hexColor = (fallback: string) =>
  z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #e04196")
    .default(fallback);

/** Amount in paise (₹1 = 100). */
const paise = (max: number, fallback: number) => z.number().int().min(0).max(max).default(fallback);

const cta = (label: string, href: string) =>
  z.object({ label: text(40, label), href: link(href) }).prefault({});

// ---------- identity & SEO ----------

export const identitySchema = z.object({
  storeName: text(60, "My Store"),
  tagline: text(120, "Quality products, delivered to your door."),
  logoUrl: imageUrl,
  faviconUrl: imageUrl,
  contactEmail: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email")
    .default(""),
  contactPhone: text(30),
  whatsapp: text(30),
  address: text(300),
  socials: z
    .object({
      instagram: link(),
      facebook: link(),
      youtube: link(),
      x: link(),
    })
    .prefault({}),
  seoTitle: text(70),
  seoDescription: text(170),
  ogImageUrl: imageUrl,
  siteUrl: link(),
  footerNote: text(80, "Made in India"),
  shopHeading: text(80, "Shop all products"),
  shopDescription: text(200, "Browse our full collection."),
});

// ---------- theme ----------

export const THEME_PRESETS = {
  berry: {
    label: "Berry Pink",
    primary: "#e04196",
    secondary: "#c9f3e1",
    background: "#fbf9ed",
    foreground: "#3b1c34",
  },
  royal: {
    label: "Gold & Maroon",
    primary: "#8b1c3d",
    secondary: "#f3e2b3",
    background: "#fffaf0",
    foreground: "#2b1b17",
  },
  emerald: {
    label: "Emerald",
    primary: "#047857",
    secondary: "#d1fae5",
    background: "#f8fbf9",
    foreground: "#0f2a22",
  },
  midnight: {
    label: "Midnight",
    primary: "#4f46e5",
    secondary: "#e0e7ff",
    background: "#f8fafc",
    foreground: "#0f172a",
  },
} as const;

export type ThemePresetKey = keyof typeof THEME_PRESETS;

export const themeSchema = z.object({
  preset: z.enum(["berry", "royal", "emerald", "midnight", "custom"]).default("berry"),
  primary: hexColor(THEME_PRESETS.berry.primary),
  secondary: hexColor(THEME_PRESETS.berry.secondary),
  background: hexColor(THEME_PRESETS.berry.background),
  foreground: hexColor(THEME_PRESETS.berry.foreground),
});

// ---------- commerce rules ----------

export const discountTierSchema = z.object({
  minSubtotal: z.number().int().min(100).max(100_000_000),
  discount: z.number().int().min(0).max(100_000_000),
  freeShipping: z.boolean().default(false),
});

export const commerceSchema = z.object({
  shippingFee: paise(1_000_000, 4900),
  freeShippingEnabled: z.boolean().default(true),
  freeShippingThreshold: paise(100_000_000, 99900),
  tiers: z
    .array(discountTierSchema)
    .max(5, "Up to 5 discount tiers")
    .default([])
    .superRefine((tiers, ctx) => {
      tiers.forEach((t, i) => {
        if (t.discount >= t.minSubtotal) {
          ctx.addIssue({
            code: "custom",
            path: [i, "discount"],
            message: "Discount must be less than the order amount it applies to",
          });
        }
        if (i > 0 && t.minSubtotal <= tiers[i - 1].minSubtotal) {
          ctx.addIssue({
            code: "custom",
            path: [i, "minSubtotal"],
            message: "Each tier must start at a higher amount than the one before",
          });
        }
      });
    }),
  deliveryEstimate: text(40, "3–6 business days"),
  returnWindowDays: z.number().int().min(0).max(365).default(7),
});

// ---------- homepage ----------

export const FEATURE_ICONS = [
  "sparkles",
  "ruler",
  "truck",
  "shield-check",
  "gift",
  "heart",
  "star",
  "leaf",
  "clock",
  "badge-check",
  "refresh-ccw",
  "headphones",
] as const;

const featureItem = z.object({
  icon: z.enum(FEATURE_ICONS).default("sparkles"),
  title: text(60),
  copy: text(160),
});

const faqItem = z.object({
  q: text(160),
  a: text(1000),
});

export const homepageSchema = z.object({
  sections: z
    .object({
      hero: z.boolean().default(true),
      marquee: z.boolean().default(true),
      products: z.boolean().default(true),
      features: z.boolean().default(true),
      testimonials: z.boolean().default(true),
      promo: z.boolean().default(true),
      faq: z.boolean().default(true),
    })
    .prefault({}),
  hero: z
    .object({
      badge: text(60, "Now delivering across India"),
      headline: text(80, "Products you'll"),
      highlight: text(40, "love"),
      subtext: text(300, "Discover our handpicked collection, delivered to your door."),
      primaryCta: cta("Shop now", "/products"),
      secondaryCta: cta("New arrivals", "/products"),
      ratingText: text(80, "Loved by happy customers"),
    })
    .prefault({}),
  marquee: z
    .array(text(60))
    .max(12)
    .default(["Free shipping on eligible orders", "Secure payments", "Easy returns", "Made in India"]),
  products: z
    .object({
      eyebrow: text(40, "Bestsellers"),
      title: text(80, "Our favourites"),
      description: text(200, "Handpicked products our customers love."),
    })
    .prefault({}),
  features: z
    .object({
      eyebrow: text(40, "Why shop with us"),
      title: text(80, "Made for you"),
      items: z
        .array(featureItem)
        .max(8)
        .default([
          { icon: "sparkles", title: "Handpicked designs", copy: "Fresh styles added regularly." },
          { icon: "truck", title: "Pan-India shipping", copy: "Fast, tracked delivery to your door." },
          { icon: "shield-check", title: "Secure payments", copy: "Pay safely with UPI, cards & more." },
          { icon: "refresh-ccw", title: "Easy returns", copy: "Not happy? We'll make it right." },
        ]),
    })
    .prefault({}),
  testimonials: z
    .object({
      title: text(80, "Loved by our customers"),
      subtitle: text(160, "Real reviews from real shoppers."),
    })
    .prefault({}),
  promo: z
    .object({
      title: text(80, "Stock up & save more"),
      subtitle: text(200, "The more you add to your bag, the more you save."),
      cta: cta("Start shopping", "/products"),
    })
    .prefault({}),
  faq: z
    .object({
      title: text(80, "Questions? Answered."),
      items: z
        .array(faqItem)
        .max(20)
        .default([
          {
            q: "How fast is shipping?",
            a: "Most orders arrive in 3–6 business days, and you'll get a tracking link as soon as your order ships.",
          },
          {
            q: "What's your return policy?",
            a: "If something arrives damaged or you're not happy, reach out within 7 days and we'll make it right.",
          },
        ]),
    })
    .prefault({}),
});

// ---------- registry ----------

export const settingsSchemas = {
  identity: identitySchema,
  theme: themeSchema,
  commerce: commerceSchema,
  homepage: homepageSchema,
} as const;

export type SettingsSection = keyof typeof settingsSchemas;
export const SETTINGS_SECTIONS = Object.keys(settingsSchemas) as SettingsSection[];

export type IdentitySettings = z.infer<typeof identitySchema>;
export type ThemeSettings = z.infer<typeof themeSchema>;
export type CommerceSettings = z.infer<typeof commerceSchema>;
export type HomepageSettings = z.infer<typeof homepageSchema>;
export type FeatureIcon = (typeof FEATURE_ICONS)[number];

export type SiteSettings = {
  identity: IdentitySettings;
  theme: ThemeSettings;
  commerce: CommerceSettings;
  homepage: HomepageSettings;
};

/** The rules checkout totals depend on — shared by client preview and server. */
export type CommerceRules = Pick<
  CommerceSettings,
  "shippingFee" | "freeShippingEnabled" | "freeShippingThreshold" | "tiers"
>;
