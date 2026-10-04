import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { hasDatabase } from "@/lib/db";
import { markOrderPaid } from "@/lib/payments";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let orderNumber: number | null = null;
  if (hasDatabase) {
    try {
      const result = await markOrderPaid(razorpay_order_id, razorpay_payment_id);
      if (result.status !== "unknown-order") orderNumber = result.orderNumber;
      if (result.status === "cancelled") {
        console.error(
          `Payment ${razorpay_payment_id} received for cancelled order #${result.orderNumber} — refund it from the Razorpay dashboard.`,
        );
      }
    } catch (err) {
      console.error("Failed to mark order paid", err);
    }
  }

  return NextResponse.json({ ok: true, orderNumber });
}
