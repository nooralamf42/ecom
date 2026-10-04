import { Prisma } from "@prisma/client";
import { db } from "./db";

/** Clerk user IDs/emails granted admin, from ADMIN_EMAILS env (comma-separated). */
export const adminList = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminIdentity(clerkId: string, email: string): boolean {
  return adminList.includes(clerkId.toLowerCase()) || adminList.includes(email.toLowerCase());
}

type ClerkIdentity = {
  clerkId: string;
  /** Primary email; null if the Clerk user has none. */
  email: string | null;
  /** Only a verified email may claim an existing account. */
  emailVerified: boolean;
  name: string | null;
  imageUrl: string | null;
};

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

/**
 * Find or create our user row for a Clerk user.
 *
 * A Clerk user can arrive with a new ID for an email we already have — after
 * switching Clerk instances (development → production), or deleting and
 * re-creating the Clerk account. Then the existing row is re-linked to the
 * new ID (only when the email is verified), keeping its orders, addresses
 * and reviews, instead of failing on the unique email.
 */
export async function syncClerkUser(id: ClerkIdentity) {
  const email = id.email?.trim() || `${id.clerkId}@clerk.local`;
  const admin = isAdminIdentity(id.clerkId, email);

  const byClerkId = await db.user.findUnique({ where: { clerkId: id.clerkId } });
  if (byClerkId) {
    // Keep the email current, unless another row already owns it.
    const emailTaken =
      email.toLowerCase() !== byClerkId.email.toLowerCase() &&
      (await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }));
    return db.user.update({
      where: { id: byClerkId.id },
      data: { name: id.name, imageUrl: id.imageUrl, ...(emailTaken ? {} : { email }) },
    });
  }

  if (id.email && id.emailVerified) {
    const byEmail = await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    if (byEmail) {
      return db.user.update({
        where: { id: byEmail.id },
        data: { clerkId: id.clerkId, name: id.name, imageUrl: id.imageUrl, ...(admin ? { role: "ADMIN" as const } : {}) },
      });
    }
  }

  const data = {
    clerkId: id.clerkId,
    name: id.name,
    imageUrl: id.imageUrl,
    role: admin ? ("ADMIN" as const) : ("CUSTOMER" as const),
  };
  try {
    return await db.user.create({ data: { ...data, email } });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    // Another request created this user at the same moment…
    const again = await db.user.findUnique({ where: { clerkId: id.clerkId } });
    if (again) return again;
    // …or an unverified email collides with someone else's account.
    return db.user.create({ data: { ...data, email: `${id.clerkId}@clerk.local` } });
  }
}
