import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { readFileSync } from "fs";
import path from "path";

neonConfig.webSocketConstructor = ws;
const db = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

type Row = { pid: number; name: string; price: number; mrp: number; img: string };

const SIZES = ["2.2", "2.4", "2.6", "2.8"];
const ACCENTS = [
  "brand-berry",
  "brand-grape",
  "brand-tangerine",
  "brand-cherry",
  "brand-sky",
  "brand-lavender",
  "brand-mint",
  "brand-lemon",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  const file = path.join(process.cwd(), "prisma/data/meesho-bangleish.json");
  const rows: Row[] = JSON.parse(readFileSync(file, "utf8"));

  // Dedupe by product image (catches true duplicate listings).
  const seenImg = new Set<string>();
  const unique = rows.filter((r) => {
    if (seenImg.has(r.img)) return false;
    seenImg.add(r.img);
    return true;
  });

  const category = await db.category.upsert({
    where: { slug: "bangles" },
    update: {},
    create: { name: "Bangles", slug: "bangles" },
  });

  let created = 0;
  let idx = 0;
  for (const r of unique) {
    const slug = `${slugify(r.name)}-${r.pid}`;
    const data = {
      name: r.name,
      description: r.name,
      tagline: "Handcrafted bangles",
      type: "BANGLE" as const,
      price: Math.round(r.price * 100),
      compareAtPrice: r.mrp && r.mrp > r.price ? Math.round(r.mrp * 100) : null,
      images: [r.img],
      accentColor: ACCENTS[idx % ACCENTS.length],
      sizes: SIZES,
      benefits: ["Set of bangles", "Lightweight & shiny", "Sizes 2.2–2.8", "Handpicked design"],
      stock: 100,
      featured: idx < 8,
      isActive: true,
      categoryId: category.id,
    };
    await db.product.upsert({
      where: { slug },
      update: data,
      create: { ...data, slug },
    });
    created++;
    idx++;
  }

  console.log(`Imported ${created} bangle products (from ${rows.length} rows, ${rows.length - unique.length} dupes skipped).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
