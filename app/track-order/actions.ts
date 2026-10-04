"use server";

import { headers } from "next/headers";
import { db, hasDatabase } from "@/lib/db";
import { grantGuestOrderAccess, guestAccessEnabled, samePhone } from "@/lib/order-access";
import { rateLimit } from "@/lib/rate-limit";

type LookupResult = { ok: true; orderNumber: number } | { ok: false; error: string };

const NOT_FOUND = "We couldn't find an order with those details. Check the order number and use the phone or email you entered at checkout.";

/** Let a guest open an order by proving its number plus the phone or email used at checkout. */
export async function lookupOrderAction(input: {
  orderNumber: string;
  contact: string;
}): Promise<LookupResult> {
  if (!hasDatabase || !guestAccessEnabled) {
    return { ok: false, error: "Order tracking isn't available right now." };
  }

  const number = Number(input.orderNumber.replace(/^#/, "").trim());
  const contact = input.contact.trim();
  if (!Number.isInteger(number) || number <= 0 || !contact) {
    return { ok: false, error: "Enter your order number and the phone or email you used." };
  }

  // Slow down guessing: per visitor, and per order number from anywhere.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`track:ip:${ip}`, 10, 15 * 60_000) || !rateLimit(`track:order:${number}`, 10, 60 * 60_000)) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const order = await db.order.findUnique({
    where: { number },
    select: { number: true, email: true, shipPhone: true },
  });
  const matches =
    order &&
    (contact.includes("@")
      ? order.email.toLowerCase() === contact.toLowerCase()
      : samePhone(order.shipPhone, contact));
  if (!order || !matches) return { ok: false, error: NOT_FOUND };

  await grantGuestOrderAccess(order.number);
  return { ok: true, orderNumber: order.number };
}
