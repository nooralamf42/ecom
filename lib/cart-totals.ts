import type { CartLine } from "./types";

// Tier thresholds (paise)
export const FREE_SHIP_THRESHOLD = 99900; // ₹999
export const TIER1_THRESHOLD = 149900; // ₹1499 -> ₹100 off
export const TIER1_DISCOUNT = 10000; // ₹100
export const TIER2_THRESHOLD = 199900; // ₹1999 -> ₹200 off + free ship
export const TIER2_DISCOUNT = 20000; // ₹200
export const BASE_SHIPPING = 4900; // ₹49

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShipping: boolean;
  /** How much more (paise) to unlock the next perk, and its label. */
  nextTier: { remaining: number; label: string } | null;
};

export function computeTotals(lines: { price: number; quantity: number }[]): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  let discount = 0;
  if (subtotal >= TIER2_THRESHOLD) discount = TIER2_DISCOUNT;
  else if (subtotal >= TIER1_THRESHOLD) discount = TIER1_DISCOUNT;

  const freeShipping = subtotal >= FREE_SHIP_THRESHOLD || subtotal >= TIER2_THRESHOLD;
  const shipping = subtotal === 0 || freeShipping ? 0 : BASE_SHIPPING;
  const total = Math.max(0, subtotal - discount) + shipping;

  let nextTier: Totals["nextTier"] = null;
  if (subtotal > 0 && subtotal < FREE_SHIP_THRESHOLD) {
    nextTier = { remaining: FREE_SHIP_THRESHOLD - subtotal, label: "free shipping" };
  } else if (subtotal < TIER1_THRESHOLD) {
    nextTier = { remaining: TIER1_THRESHOLD - subtotal, label: "₹100 off" };
  } else if (subtotal < TIER2_THRESHOLD) {
    nextTier = { remaining: TIER2_THRESHOLD - subtotal, label: "₹200 off + free shipping" };
  }

  return { subtotal, discount, shipping, total, freeShipping, nextTier };
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}
