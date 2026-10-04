import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { db, hasDatabase } from "@/lib/db";
import { markOrderPaid } from "@/lib/payments";

type RazorpayWebhook = {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        error_code?: string;
        error_description?: string;
        error_reason?: string;
      };
    };
    order?: { entity?: { id?: string } };
    refund?: { entity?: { id?: string; payment_id?: string; amount?: number; status?: string } };
  };
};

/*
 * Razorpay server-to-server events (backup for /api/razorpay/verify, which
 * runs in the customer's browser and is lost if they close the window).
 * Events: payment.captured, order.paid, payment.failed, and optionally
 * refund.processed / refund.failed (refund status shown in the admin).
 *
 * A non-2xx response makes Razorpay retry, so we only return an error when
 * a retry could help (e.g. the database was briefly unreachable).
 */
export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const raw = await req.text();

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;

  switch (event.event) {
    // Both mean the money is ours; Razorpay usually sends both for one payment.
    case "payment.captured":
    case "order.paid": {
      const razorpayOrderId = event.payload?.order?.entity?.id ?? payment?.order_id;
      if (!razorpayOrderId || !hasDatabase) break;
      try {
        const result = await markOrderPaid(razorpayOrderId, payment?.id);
        if (result.status === "cancelled") {
          console.error(
            `Razorpay ${event.event}: order #${result.orderNumber} was cancelled but payment ${payment?.id} was captured — refund it from the Razorpay dashboard.`,
          );
        } else if (result.status === "unknown-order") {
          // e.g. an old attempt paid after the customer retried with a new Razorpay order.
          console.error(
            `Razorpay ${event.event}: no order for ${razorpayOrderId} (payment ${payment?.id}) — check it in the Razorpay dashboard and refund if needed.`,
          );
        }
      } catch (err) {
        console.error("Razorpay webhook: failed to mark order paid", err);
        return NextResponse.json({ error: "Temporary failure" }, { status: 500 });
      }
      break;
    }

    // Refunds start as "pending"; these report the final outcome.
    case "refund.processed":
    case "refund.failed": {
      const refund = event.payload?.refund?.entity;
      if (!refund?.id || !hasDatabase) break;
      try {
        const failed = event.event === "refund.failed";
        const { count } = await db.order.updateMany({
          where: { razorpayRefundId: refund.id, NOT: { refundStatus: failed ? "failed" : "processed" } },
          data: {
            refundStatus: failed ? "failed" : "processed",
            // A failed refund returned nothing, so it no longer counts as refunded.
            ...(failed && refund.amount ? { refundedAmount: { decrement: refund.amount } } : {}),
          },
        });
        if (failed && count > 0) {
          console.error(`Razorpay refund ${refund.id} failed — the customer was not refunded; retry from the admin.`);
        }
      } catch (err) {
        console.error("Razorpay webhook: failed to update refund", err);
        return NextResponse.json({ error: "Temporary failure" }, { status: 500 });
      }
      break;
    }

    // The order stays "Payment pending": the customer can try again in the
    // same checkout or later from their order page, or cancel it.
    case "payment.failed": {
      console.warn(
        `Razorpay payment failed for ${payment?.order_id ?? "unknown order"}: ${
          payment?.error_description ?? payment?.error_reason ?? payment?.error_code ?? "no reason given"
        }`,
      );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
