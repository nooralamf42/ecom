import { db } from "./db";

export type MarkPaidResult =
  | { status: "paid"; orderNumber: number } // moved PENDING -> PAID now
  | { status: "already-paid"; orderNumber: number } // PAID or further along; nothing to do
  | { status: "cancelled"; orderNumber: number } // money taken for a cancelled order
  | { status: "unknown-order" }; // no order points at this Razorpay order

/**
 * Record a successful payment. Shared by the checkout callback and the
 * webhook, and safe to call repeatedly: Razorpay may report the same payment
 * through both, and through several webhook events. Only a PENDING order
 * moves to PAID, so a replayed confirmation can't pull a shipped order back.
 */
export async function markOrderPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string | undefined,
): Promise<MarkPaidResult> {
  const { count } = await db.order.updateMany({
    where: { razorpayOrderId, status: "PENDING" },
    data: { status: "PAID", ...(razorpayPaymentId ? { razorpayPaymentId } : {}) },
  });

  const order = await db.order.findUnique({
    where: { razorpayOrderId },
    select: { number: true, status: true },
  });
  if (!order) return { status: "unknown-order" };
  if (count > 0) return { status: "paid", orderNumber: order.number };
  if (order.status === "CANCELLED") return { status: "cancelled", orderNumber: order.number };
  return { status: "already-paid", orderNumber: order.number };
}
