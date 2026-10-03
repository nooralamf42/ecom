import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { demoProducts } from "../lib/demo-data";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

/*
 * Sample products for trying the store. Delete them in /admin/products
 * before launch. No reviews are seeded: reviews on a live store must come
 * from real customers.
 */
const CATEGORY_BY_TYPE = {
  DRINK: { name: "Everyday", slug: "everyday" },
  GUMMY: { name: "Home", slug: "home" },
  BUNDLE: { name: "Gift sets", slug: "gift-sets" },
} as const;

async function main() {
  const categoryIds: Record<string, string> = {};
  for (const [type, c] of Object.entries(CATEGORY_BY_TYPE)) {
    const cat = await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    categoryIds[type] = cat.id;
  }

  for (const p of demoProducts) {
    const data = {
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      type: p.type,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      accentColor: p.accentColor,
      flavor: p.flavor,
      mood: p.mood,
      benefits: p.benefits,
      ingredients: p.ingredients,
      stock: p.stock,
      featured: p.featured,
    };
    await db.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: {
        ...data,
        slug: p.slug,
        categoryId: categoryIds[p.type],
      },
    });
  }

  console.log(`Seeded ${demoProducts.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
