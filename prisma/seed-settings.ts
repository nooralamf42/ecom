/**
 * Seed store settings + starter policy pages.
 *
 *   npx tsx prisma/seed-settings.ts          # fill only what's missing
 *   npx tsx prisma/seed-settings.ts --force  # overwrite settings with these values
 *
 * Pages are only ever created when their slug is missing, so admin edits are
 * never overwritten. Page content supports {{storeName}}, {{contactEmail}},
 * {{contactPhone}}, {{address}}, {{returnWindowDays}} and {{deliveryEstimate}},
 * filled in from settings at render time.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { settingsSchemas, type SettingsSection } from "../lib/settings/schema";

neonConfig.webSocketConstructor = ws;
const db = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const force = process.argv.includes("--force");

// This deployment's content (Bangleish). Template buyers replace it in /admin/settings.
const settings: Record<SettingsSection, unknown> = {
  identity: {
    storeName: "Bangleish",
    tagline: "Handcrafted Bangles",
    seoTitle: "Bangleish — Handcrafted Bangles",
    seoDescription:
      "Beautiful handcrafted bangles for every occasion. Shining designs in sizes 2.2–2.8, delivered across India.",
    footerNote: "Made in India",
    shopHeading: "Shop all bangles",
    shopDescription: "Handcrafted bangles in gorgeous designs and every size — 2.2 to 2.8.",
  },
  theme: { preset: "berry" },
  commerce: {
    shippingFee: 4900,
    freeShippingEnabled: true,
    freeShippingThreshold: 99900,
    tiers: [
      { minSubtotal: 149900, discount: 10000, freeShipping: false },
      { minSubtotal: 199900, discount: 20000, freeShipping: true },
    ],
    deliveryEstimate: "3–6 days",
    returnWindowDays: 7,
  },
  homepage: {
    hero: {
      badge: "Now delivering across India",
      headline: "Bangles that",
      highlight: "shine",
      subtext:
        "Handcrafted bangles in gorgeous designs and every size (2.2–2.8). Picked with love, delivered to your door.",
      primaryCta: { label: "Shop bangles", href: "/products" },
      secondaryCta: { label: "New arrivals", href: "/products?category=bangles" },
      ratingText: "Loved by thousands of happy customers",
    },
    marquee: [
      "Handcrafted designs",
      "Sizes 2.2 – 2.8",
      "Free shipping over ₹999",
      "Made in India",
      "Shining finish",
      "Everyday & festive",
      "Loved by thousands",
      "Easy returns",
    ],
    products: {
      eyebrow: "Bestsellers",
      title: "Shine in every design",
      description: "Handcrafted bangles in gorgeous styles and every size — 2.2 to 2.8.",
    },
    features: {
      eyebrow: "Why Bangleish",
      title: "Bangles you'll love to wear",
      items: [
        { icon: "sparkles", title: "Handpicked designs", copy: "Fresh, on-trend styles added regularly." },
        { icon: "ruler", title: "Every size", copy: "Sizes 2.2 to 2.8 for the perfect fit." },
        { icon: "truck", title: "Pan-India shipping", copy: "Fast, tracked delivery to your door." },
        { icon: "shield-check", title: "Secure payments", copy: "Pay safely with UPI, cards & more." },
      ],
    },
    testimonials: {
      title: "Loved across India",
      subtitle: "Over 170 five-star reviews and counting.",
    },
    promo: {
      title: "Stock up & save more",
      subtitle: "The more joy in your bag, the more you save. It's that simple.",
      cta: { label: "Start your box", href: "/products" },
    },
    faq: {
      title: "Questions? Answered.",
      items: [
        {
          q: "How do I choose the right size?",
          a: "Bangles come in standard sizes 2.2, 2.4, 2.6 and 2.8. Measure the widest part of your hand (with fingers together) and match it to the size chart — 2.4 is the most common women's size.",
        },
        {
          q: "How fast is shipping?",
          a: "We ship pan-India via Shiprocket. Most orders arrive in 3–6 business days, and you'll get a tracking link the moment your order leaves us.",
        },
        {
          q: "What's your return policy?",
          a: "If something arrives damaged or you're not happy, reach out within 7 days and we'll make it right — replacement or refund.",
        },
        {
          q: "Are the bangles good for daily wear?",
          a: "Absolutely. Our designs are made to be lightweight and durable for both everyday and festive wear.",
        },
      ],
    },
  },
};

const pages = [
  {
    slug: "about",
    title: "About Us",
    sortOrder: 1,
    content: `## Our story

{{storeName}} started with a simple idea: beautiful products, honest prices, and service you can count on.

Every piece in our collection is handpicked, quality-checked and packed with care before it ships to you.

Have a question? Visit our [Contact](/contact) page — we'd love to hear from you.`,
  },
  {
    slug: "contact",
    title: "Contact Us",
    sortOrder: 2,
    content: `## Get in touch

We usually reply within one business day.

- **Email:** {{contactEmail}}
- **Phone / WhatsApp:** {{contactPhone}}
- **Address:** {{address}}

For order questions, please include your order number.`,
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    sortOrder: 3,
    content: `## Shipping

- We ship across India through trusted courier partners.
- Orders are typically dispatched within 1–2 business days.
- Estimated delivery: **{{deliveryEstimate}}** after dispatch.
- You'll receive a tracking link as soon as your order ships.

Delivery times can vary during sales, festivals and in remote areas.`,
  },
  {
    slug: "refund-policy",
    title: "Refund & Return Policy",
    sortOrder: 4,
    content: `## Returns & refunds

If your order arrives damaged, defective or not as described, contact us within **{{returnWindowDays}} days** of delivery at {{contactEmail}} with your order number and photos.

- Approved returns are refunded to the original payment method within 5–7 business days of us receiving the item.
- Items must be unused and in their original packaging.
- Orders can be cancelled free of charge before they are shipped.`,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    sortOrder: 5,
    content: `## Privacy

{{storeName}} collects only the information needed to process and deliver your orders — your name, contact details and shipping address.

- Payments are processed securely by our payment partner; we never store your card details.
- We share your shipping details only with our courier partners to deliver your order.
- We do not sell your personal information.

Questions about your data? Write to {{contactEmail}}.`,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    sortOrder: 6,
    content: `## Terms & conditions

By placing an order with {{storeName}} you agree to these terms.

- Prices are in Indian Rupees and include applicable taxes unless stated otherwise.
- We may cancel an order if a product is unavailable or a pricing error occurs; any payment will be refunded in full.
- Product colours may vary slightly from photos due to screen settings.
- See our [Shipping Policy](/shipping-policy) and [Refund Policy](/refund-policy) for delivery and returns.`,
  },
];

async function main() {
  for (const [key, data] of Object.entries(settings) as [SettingsSection, unknown][]) {
    const parsed = settingsSchemas[key].parse(data); // fail loudly on a typo
    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (existing && !force) {
      console.log(`settings.${key}: exists, skipped`);
      continue;
    }
    await db.siteSetting.upsert({
      where: { key },
      update: { data: parsed },
      create: { key, data: parsed },
    });
    console.log(`settings.${key}: ${existing ? "overwritten" : "created"}`);
  }

  for (const page of pages) {
    const existing = await db.page.findUnique({ where: { slug: page.slug } });
    if (existing) {
      console.log(`page /${page.slug}: exists, skipped`);
      continue;
    }
    await db.page.create({ data: { ...page, isPublished: true, showInFooter: true } });
    console.log(`page /${page.slug}: created`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
