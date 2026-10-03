/**
 * Create starter policy pages, and optionally store settings from a preset.
 *
 *   npm run db:seed-store                                     # starter pages only
 *   npx tsx prisma/seed-settings.ts --preset=bangleish        # + settings, only where missing
 *   npx tsx prisma/seed-settings.ts --preset=bangleish --force  # + overwrite settings
 *
 * Without a preset, the store uses the generic defaults until the owner
 * customizes it in /admin/settings.
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
const presetName = process.argv.find((a) => a.startsWith("--preset="))?.slice("--preset=".length);

async function loadPreset(name: string): Promise<Partial<Record<SettingsSection, unknown>>> {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Invalid preset name "${name}"`);
  const mod = await import(`./presets/${name}`);
  return mod.settings;
}

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
  const settings = presetName ? await loadPreset(presetName) : {};
  if (!presetName) console.log("No --preset given: settings left as they are (defaults apply until edited in admin).");
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
