import { clerkEnabled } from "./auth-config";
import { isAdmin } from "./current-user";

/**
 * Throws unless the request comes from a signed-in admin. Without Clerk
 * configured nobody can sign in, so every write is refused — otherwise a
 * store deployed before adding auth keys would be editable by anyone.
 */
export async function assertAdmin() {
  if (!clerkEnabled || !(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}
