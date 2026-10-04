import { db, hasDatabase } from "./db";
import { razorpay, razorpayEnabled } from "./razorpay";
import { cancelShiprocketOrder, shiprocketEnabled } from "./shiprocket";
import { queueOrderEmail } from "./email";

export type RefundResult = {
  refundId: string;
  amount: number;
  /** Razorpay's status: usually "pending" at first, "processed" once done. */
  status: string;
  /** Fully refunded before shipping, so the order was cancelled too. */
  cancelled: boolean;
  warning?: string;
};

export class RefundError extends Error {}

/** How much of an order can still be refunded (paise). */
export function refundableAmount(order: { total: number; refundedAmount: number }): number {
  return Math.max(0, order.total - order.refundedAmount);
}

/**
 * Refund part or all of an order's payment through Razorpay. A full refund
 * of an order that hasn't shipped also cancels it (and its Shiprocket order).
 * Emails the customer. Must run inside a request (it queues the email).
 */
export async function refundOrder(orderId: string, amount: number): Promise<RefundResult> {
  if (!hasDatabase) throw new RefundError("Database not configured.");
  if (!razorpayEnabled || !razorpay) throw new RefundError("Razorpay isn't configured.");

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new RefundError("Order not found.");
  if (!order.razorpayPaymentId) throw new RefundError("This order has no captured payment to refund.");

  const remaining = refundableAmount(order);
  if (!Number.isInteger(amount) || amount < 100) throw new RefundError("Refund at least ₹1.");
  if (amount > remaining) throw new RefundError("That's more than the amount left to refund.");

  // Lock: only one refund request per order at a time, so a double click or
  // two admins can't refund twice. NULL needs its own branch in SQL.
  const lock = await db.order.updateMany({
    where: { id: orderId, OR: [{ refundStatus: null }, { refundStatus: { not: "requesting" } }] },
    data: { refundStatus: "requesting" },
  });
  if (lock.count === 0) throw new RefundError("A refund for this order is already in progress.");

  let refund;
  try {
    refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount,
      speed: "normal",
      notes: { orderNumber: String(order.number) },
      receipt: `order_${order.number}_${Date.now()}`.slice(0, 40),
    });
  } catch (err) {
    await db.order.update({ where: { id: orderId }, data: { refundStatus: order.refundStatus } });
    const description =
      (err as { error?: { description?: string } })?.error?.description ??
      (err instanceof Error ? err.message : "Unknown error");
    throw new RefundError(`Razorpay refused the refund: ${description}`);
  }

  const fullyRefunded = order.refundedAmount + amount >= order.total;
  const cancel = fullyRefunded && (order.status === "PAID" || order.status === "FULFILLED");

  await db.order.update({
    where: { id: orderId },
    data: {
      refundedAmount: { increment: amount },
      refundStatus: refund.status,
      razorpayRefundId: refund.id,
      ...(cancel ? { status: "CANCELLED" as const } : {}),
    },
  });

  let warning: string | undefined;
  if (cancel && order.shiprocketOrderId && shiprocketEnabled) {
    try {
      await cancelShiprocketOrder(order.shiprocketOrderId);
    } catch (err) {
      console.error(`Order #${order.number}: Shiprocket cancel failed`, err);
      warning = "Refunded, but the Shiprocket order couldn't be cancelled — cancel it in Shiprocket.";
    }
  }

  queueOrderEmail(orderId, "refunded", { refundAmount: amount, refundId: refund.id });
  return { refundId: refund.id, amount, status: refund.status, cancelled: cancel, warning };
}
