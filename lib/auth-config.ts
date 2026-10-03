/**
 * Clerk is only active when a publishable key is configured. This lets the
 * storefront run in "demo mode" (browse, cart, checkout UI) before auth keys
 * are added, and light up full auth automatically once they are.
 *
 * `process.env.NEXT_PUBLIC_*` is statically inlined by Next in client bundles.
 */
export const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);
