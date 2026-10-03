import { clerkEnabled } from "./auth-config";
import { isAdmin } from "./current-user";
import { hasDatabase } from "./db";

/**
 * Determines whether the current request may view the admin area.
 * - Demo mode (no Clerk keys): read-only preview is allowed.
 * - Configured: requires an ADMIN role.
 */
export async function getAdminAccess(): Promise<{
  allowed: boolean;
  demo: boolean;
}> {
  if (!clerkEnabled) return { allowed: true, demo: true };
  const admin = await isAdmin();
  return { allowed: admin, demo: !hasDatabase };
}
