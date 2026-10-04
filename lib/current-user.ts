import { auth, currentUser } from "@clerk/nextjs/server";
import { db, hasDatabase } from "./db";
import { clerkEnabled } from "./auth-config";
import { adminList, syncClerkUser } from "./user-sync";

/** Find, link or create the DB user for the signed-in Clerk user, or null. */
export async function getDbUser() {
  if (!clerkEnabled || !hasDatabase) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const cu = await currentUser();
  const primary = cu?.primaryEmailAddress ?? cu?.emailAddresses[0] ?? null;
  return syncClerkUser({
    clerkId: userId,
    email: primary?.emailAddress ?? null,
    emailVerified: primary?.verification?.status === "verified",
    name: cu?.fullName ?? null,
    imageUrl: cu?.imageUrl ?? null,
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
