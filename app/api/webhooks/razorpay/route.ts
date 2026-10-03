import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { db, hasDatabase } from "@/lib/db";

// Razorpay server-to-server confirmation (belt-and-suspenders alongside /verify).
export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const raw = await req.text();

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw) as {
    event: string;
    payload?: {
      payment?: { entity?: { order_id?: string; id?: string } };
    };
  };

  if (event.event === "payment.captured" && hasDatabase) {
    const orderId = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;
    if (orderId) {
      try {
        await db.order.updateMany({
          where: { razorpayOrderId: orderId, status: "PENDING" },
          data: { status: "PAID", razorpayPaymentId: paymentId },
        });
      } catch (err) {
        console.error("Webhook order update failed", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
