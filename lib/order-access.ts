import crypto from "node:crypto";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { clerkEnabled } from "./auth-config";

/*
 * Who may see an order:
 *  - the account it belongs to (or an admin);
 *  - anyone signed in with a verified email that matches a guest order's
 *    email (the order is then attached to their account);
 *  - a browser holding a signed "guest orders" cookie for that order number.
 *    The cookie is set when a guest places the order, or after they prove
 *    the order number + phone/email on /track-order.
 */

const COOKIE = "guest_orders";
const MAX_ORDERS = 20;
const MAX_AGE = 60 * 60 * 24 * 180; // 180 days

function secret(): string | null {
  return process.env.ORDER_ACCESS_SECRET || process.env.CLERK_SECRET_KEY || null;
}

/** False when no signing secret is configured; guest access is then off. */
export const guestAccessEnabled = Boolean(secret());

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", secret()!)
    .update(`guest-orders|${payload}`)
    .digest("base64url");
}

/** Order numbers this browser may view without signing in. */
export async function getGuestOrderNumbers(): Promise<number[]> {
  if (!guestAccessEnabled) return [];
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return [];
  const payload = raw.slice(0, dot);
  const given = Buffer.from(raw.slice(dot + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return [];
  return payload
    .split("-")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
}

/** Remember an order on this browser. Only callable from a Route Handler or Server Action. */
export async function grantGuestOrderAccess(orderNumber: number): Promise<void> {
  if (!guestAccessEnabled) return;
  const current = await getGuestOrderNumbers();
  const numbers = [orderNumber, ...current.filter((n) => n !== orderNumber)].slice(0, MAX_ORDERS);
  const payload = numbers.join("-");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** The signed-in user's verified email addresses, lowercased. */
export async function getVerifiedEmails(): Promise<string[]> {
  if (!clerkEnabled) return [];
  const user = await currentUser();
  if (!user) return [];
  return user.emailAddresses
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
}

/** Compare phone numbers by their last 10 digits (ignores +91, spaces, dashes). */
export function samePhone(a: string, b: string): boolean {
  const da = a.replace(/\D/g, "").slice(-10);
  const db = b.replace(/\D/g, "").slice(-10);
  return da.length === 10 && da === db;
}

/**
 * Secret code for an order's link in emails. Opening /orders/{n}/open?t=…
 * remembers the order on that browser, so customers can view it from the
 * email on any device without an account.
 */
export function orderLinkToken(orderNumber: number): string | null {
  if (!guestAccessEnabled) return null;
  return crypto
    .createHmac("sha256", secret()!)
    .update(`order-link|${orderNumber}`)
    .digest("base64url")
    .slice(0, 32);
}

export function isValidOrderLinkToken(orderNumber: number, token: string): boolean {
  const expected = orderLinkToken(orderNumber);
  if (!expected || token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
