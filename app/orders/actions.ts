"use server";

import { revalidatePath } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { getOrderByNumber } from "@/lib/orders";
import { razorpay, razorpayEnabled } from "@/lib/razorpay";

type RetryResult = {
  ok: boolean;
  error?: string;
  demo?: boolean;
  keyId?: string | null;
  amount?: number;
  currency?: string;
  razorpayOrderId?: string | null;
  orderNumber?: number;
};

/**
 * Re-open payment for an order stuck at PENDING (e.g. the customer closed
 * the Razorpay modal before paying). Creates a fresh Razorpay order for the
 * same amount and re-points the order at it.
 */
export async function retryPaymentAction(orderNumber: number): Promise<RetryResult> {
  if (!hasDatabase) return { ok: false, error: "Not available" };

  // getOrderByNumber already enforces the caller owns this order (or is admin).
  const order = await getOrderByNumber(orderNumber);
  if (!order) return { ok: false, error: "Order not found" };
  if (order.status !== "PENDING") {
    return { ok: false, error: "This order is no longer awaiting payment." };
  }

  if (!razorpayEnabled || !razorpay) {
    // Demo mode has no real payment gate — confirm the order directly.
    await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    return { ok: true, demo: true, orderNumber: order.number };
  }

  try {
    const rzp = await razorpay.orders.create({
      amount: order.total,
      currency: "INR",
      receipt: `retry_${order.number}_${Date.now()}`,
      notes: { email: order.email, retry: "true" },
    });
    await db.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzp.id },
    });
    return {
      ok: true,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? null,
      amount: order.total,
      currency: "INR",
      razorpayOrderId: rzp.id,
      orderNumber: order.number,
    };
  } catch (err) {
    console.error("retryPaymentAction failed", err);
    return { ok: false, error: "Could not start payment. Please try again." };
  }
}

export async function cancelOrderAction(
  orderNumber: number,
): Promise<{ ok: boolean; error?: string }> {
  if (!hasDatabase) return { ok: false, error: "Not available" };

  const order = await getOrderByNumber(orderNumber);
  if (!order) return { ok: false, error: "Order not found" };
  if (order.status !== "PENDING") {
    return { ok: false, error: "Only orders awaiting payment can be cancelled here." };
  }

  await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderNumber}`);
  return { ok: true };
}
