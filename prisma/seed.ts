import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { demoProducts, demoReviews } from "../lib/demo-data";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const drinks = await db.category.upsert({
    where: { slug: "drinks" },
    update: {},
    create: { name: "Sparkling Drinks", slug: "drinks" },
  });
  const gummies = await db.category.upsert({
    where: { slug: "gummies" },
    update: {},
    create: { name: "Mood Gummies", slug: "gummies" },
  });

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
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: {
        ...data,
        slug: p.slug,
        categoryId: p.type === "GUMMY" ? gummies.id : drinks.id,
      },
    });

    if (p.featured && p.type === "DRINK") {
      const existing = await db.review.count({ where: { productId: product.id } });
      if (existing === 0) {
        for (const r of demoReviews.slice(0, 2)) {
          await db.review.create({
            data: {
              productId: product.id,
              author: r.author,
              rating: r.rating,
              comment: r.comment,
            },
          });
        }
      }
    }
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
