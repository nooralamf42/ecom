import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

/** True when a real database connection string is configured. */
export const hasDatabase = Boolean(
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("user:password"),
);

// Neon's driver needs a WebSocket constructor in Node runtimes.
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma(): PrismaClient {
  if (hasDatabase) {
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL,
    });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  // No DB configured — a bare client (never actually queried; callers guard on hasDatabase).
  return new PrismaClient();
}

export const db = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
