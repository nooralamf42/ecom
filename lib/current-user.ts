import { auth, currentUser } from "@clerk/nextjs/server";
import { db, hasDatabase } from "./db";
import { clerkEnabled } from "./auth-config";

/** Clerk user IDs/emails granted admin, from ADMIN_EMAILS env (comma-separated). */
const adminList = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/** Upsert and return the DB user for the signed-in Clerk user, or null. */
export async function getDbUser() {
  if (!clerkEnabled || !hasDatabase) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const cu = await currentUser();
  const email =
    cu?.emailAddresses[0]?.emailAddress ?? `${userId}@clerk.local`;
  const isAdmin = adminList.includes(userId.toLowerCase()) ||
    adminList.includes(email.toLowerCase());

  return db.user.upsert({
    where: { clerkId: userId },
    update: { email, name: cu?.fullName ?? null, imageUrl: cu?.imageUrl ?? null },
    create: {
      clerkId: userId,
      email,
      name: cu?.fullName ?? null,
      imageUrl: cu?.imageUrl ?? null,
      role: isAdmin ? "ADMIN" : "CUSTOMER",
    },
  });
}

/** True when the current request is from an admin. */
export async function isAdmin(): Promise<boolean> {
  if (!clerkEnabled) return false;
  const { userId } = await auth();
  if (!userId) return false;
  const user = await getDbUser();
  if (user?.role === "ADMIN") return true;
  // Fallback to env allowlist even before a DB user exists.
  const cu = await currentUser();
  const email = cu?.emailAddresses[0]?.emailAddress?.toLowerCase();
  return (
    adminList.includes(userId.toLowerCase()) ||
    (email ? adminList.includes(email) : false)
  );
}
