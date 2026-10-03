import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkEnabled } from "@/lib/auth-config";

const isProtectedRoute = createRouteMatcher(["/orders(.*)", "/admin(.*)"]);

const withClerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// In demo mode (no Clerk keys) middleware is a pass-through.
export default clerkEnabled ? withClerk : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next internals and static files, unless in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ico|webp|avif|woff2?|ttf|otf)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
