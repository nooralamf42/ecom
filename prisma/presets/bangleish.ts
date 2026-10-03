/**
 * Bangleish's store settings, used to seed this deployment:
 *   npx tsx prisma/seed-settings.ts --preset=bangleish
 * Not needed by template buyers — delete this file before handing the code over.
 */
import type { SettingsSection } from "../../lib/settings/schema";

export const settings: Record<SettingsSection, unknown> = {
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
