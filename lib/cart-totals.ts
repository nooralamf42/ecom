import type { CartLine } from "./types";
import type { CommerceRules } from "./settings/schema";
import { formatPrice } from "./format";

/*
 * Pure pricing logic shared by the cart preview (browser) and checkout API
 * (server). The server result is authoritative — it sets the Razorpay
 * amount — so both must be given the same CommerceRules from settings.
 */

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShipping: boolean;
  /** How much more (paise) to unlock the next perk, and its label. */
  nextTier: { remaining: number; label: string } | null;
  /** Subtotal at which the last perk unlocks — for progress bars. 0 if none. */
  progressTarget: number;
};

export function computeTotals(
  lines: { price: number; quantity: number }[],
  rules: CommerceRules,
): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const tiers = [...rules.tiers].sort((a, b) => a.minSubtotal - b.minSubtotal);

  // Highest tier the subtotal has reached.
  const reached = tiers.filter((t) => subtotal >= t.minSubtotal).at(-1);
  const discount = reached ? Math.min(reached.discount, subtotal) : 0;

  const freeShipping =
    (rules.freeShippingEnabled && subtotal >= rules.freeShippingThreshold) ||
    Boolean(reached?.freeShipping);
  const shipping = subtotal === 0 || freeShipping ? 0 : rules.shippingFee;
  const total = Math.max(0, subtotal - discount) + shipping;

  // Perks still ahead of the shopper, nearest first.
  const perks: { at: number; label: string }[] = [];
  if (rules.freeShippingEnabled && !freeShipping) {
    perks.push({ at: rules.freeShippingThreshold, label: "free shipping" });
  }
  for (const t of tiers) {
    if (t.minSubtotal <= subtotal) continue;
    const parts = [
      t.discount > 0 ? `${formatPrice(t.discount)} off` : "",
      t.freeShipping && !freeShipping ? "free shipping" : "",
    ].filter(Boolean);
    if (parts.length) perks.push({ at: t.minSubtotal, label: parts.join(" + ") });
  }
  perks.sort((a, b) => a.at - b.at);
  const next = perks.find((p) => p.at > subtotal);

  const progressTarget = Math.max(
    rules.freeShippingEnabled ? rules.freeShippingThreshold : 0,
    ...tiers.map((t) => t.minSubtotal),
  );

  return {
    subtotal,
    discount,
    shipping,
    total,
    freeShipping,
    nextTier: next ? { remaining: next.at - subtotal, label: next.label } : null,
    progressTarget,
  };
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0);
}
