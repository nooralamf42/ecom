import type { StoreProduct } from "./types";

/**
 * Demo catalog used when no database is configured (DATABASE_URL unset), so
 * the template can be previewed before setup. Once a database is connected
 * the real catalog takes over and none of this is shown.
 * Images are intentionally empty so the branded graphic fallback is used.
 */
const rawDemoProducts: Omit<StoreProduct, "sizes">[] = [
  {
    id: "demo-classic-tote",
    name: "Classic Canvas Tote",
    slug: "classic-canvas-tote",
    tagline: "Carries everything, goes everywhere",
    description: "A roomy everyday tote in heavy cotton canvas with an inner pocket and reinforced handles.",
    type: "DRINK",
    price: 79900,
    compareAtPrice: 99900,
    images: [],
    accentColor: "brand-tangerine",
    flavor: "Natural canvas",
    mood: "Bestseller",
    benefits: ["Heavy cotton canvas", "Inner pocket", "Machine washable"],
    ingredients: "100% cotton canvas. Machine wash cold, line dry.",
    stock: 50,
    featured: true,
  },
  {
    id: "demo-ceramic-mug",
    name: "Stoneware Mug",
    slug: "stoneware-mug",
    tagline: "Your morning, upgraded",
    description: "Hand-glazed stoneware mug that keeps drinks warm and feels great to hold.",
    type: "DRINK",
    price: 49900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-sky",
    flavor: "Sky blue glaze",
    mood: null,
    benefits: ["Microwave safe", "Dishwasher safe", "350 ml"],
    ingredients: "Glazed stoneware.",
    stock: 80,
    featured: true,
  },
  {
    id: "demo-soy-candle",
    name: "Soy Wax Candle",
    slug: "soy-wax-candle",
    tagline: "Slow evenings, bottled",
    description: "Clean-burning soy candle with a cotton wick and a calm, woody scent.",
    type: "GUMMY",
    price: 59900,
    compareAtPrice: 69900,
    images: [],
    accentColor: "brand-peach",
    flavor: "Sandalwood",
    mood: "New",
    benefits: ["40-hour burn", "Cotton wick", "Reusable jar"],
    ingredients: "Soy wax, fragrance oil, cotton wick. Trim wick before lighting.",
    stock: 40,
    featured: true,
  },
  {
    id: "demo-cushion-cover",
    name: "Linen Cushion Cover",
    slug: "linen-cushion-cover",
    tagline: "Soft texture for any sofa",
    description: "Washed linen cushion cover with a hidden zip. Fits standard 16×16 inch inserts.",
    type: "GUMMY",
    price: 69900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-mint",
    flavor: "Sage green",
    mood: null,
    benefits: ["Washed linen", "Hidden zip", "16×16 in"],
    ingredients: "100% linen. Machine wash gentle.",
    stock: 60,
    featured: false,
  },
  {
    id: "demo-gift-set",
    name: "Little Luxuries Gift Set",
    slug: "little-luxuries-gift-set",
    tagline: "A ready-to-give favourite",
    description: "Our mug, candle and tote together in a gift box — the easiest present you'll ever buy.",
    type: "BUNDLE",
    price: 149900,
    compareAtPrice: 179900,
    images: [],
    accentColor: "brand-berry",
    flavor: null,
    mood: "Gift",
    benefits: ["Gift boxed", "Save ₹300", "Ready to give"],
    ingredients: null,
    stock: 25,
    featured: true,
  },
];

export const demoProducts: StoreProduct[] = rawDemoProducts.map((p) => ({
  ...p,
  sizes: [],
}));

/** Sample reviews, shown only in demo mode. */
export const demoReviews = [
  { author: "Aisha K.", rating: 5, comment: "Lovely quality and arrived quickly. Will order again!" },
  { author: "Priya S.", rating: 5, comment: "Exactly as pictured and beautifully packed." },
  { author: "Meena R.", rating: 4, comment: "Great value for the price. Delivery was on time." },
  { author: "Fatima N.", rating: 5, comment: "Bought it as a gift and they loved it." },
];
