import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validators";
import { getProductsByIds } from "@/lib/products";
import { computeTotals } from "@/lib/cart-totals";
import { getCommerceRules } from "@/lib/settings";
import { razorpay, razorpayEnabled } from "@/lib/razorpay";
import { db, hasDatabase } from "@/lib/db";
import { getDbUser } from "@/lib/current-user";
import { saveUserAddress } from "@/lib/addresses";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { items, address } = parsed.data;

  // Resolve authoritative prices from the catalog (never trust the client).
  let products: Awaited<ReturnType<typeof getProductsByIds>>;
  try {
    products = await getProductsByIds(items.map((i) => i.productId));
  } catch (err) {
    console.error("Checkout: could not load products", err);
    return NextResponse.json(
      { error: "We couldn't reach our store right now. Please try again in a moment." },
      { status: 503 },
    );
  }
  const lineItems = items
    .map((i) => {
      const p = products.find((pr) => pr.id === i.productId);
      if (!p) return null;
      return {
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0] ?? null,
        quantity: i.quantity,
        size: i.size ?? null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (lineItems.length === 0) {
    return NextResponse.json({ error: "No valid items in cart" }, { status: 400 });
  }

  // Shipping/discount rules come from admin settings; this result is what
  // the customer is actually charged.
  const totals = computeTotals(lineItems, await getCommerceRules());

  // Create Razorpay order when configured.
  let razorpayOrderId: string | null = null;
  if (razorpayEnabled && razorpay) {
    try {
      const rzp = await razorpay.orders.create({
        amount: totals.total,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { email: address.email },
      });
      razorpayOrderId = rzp.id;
    } catch (err) {
      console.error("Razorpay order creation failed", err);
      return NextResponse.json(
        { error: "Could not start payment. Please try again." },
        { status: 502 },
      );
    }
  }

  // Persist a pending order when a database is configured.
  let orderId: string | null = null;
  let orderNumber: number | null = null;
  if (hasDatabase) {
    try {
      const user = await getDbUser();

      // Remember this address on the customer's account for next time.
      const addressId = user
        ? await saveUserAddress(address).catch(() => null)
        : null;

      const order = await db.order.create({
        data: {
          userId: user?.id ?? null,
          addressId,
          email: address.email,
          status: "PENDING",
          subtotal: totals.subtotal,
          discount: totals.discount,
          shippingCost: totals.shipping,
          total: totals.total,
          razorpayOrderId,
          shipName: address.name,
          shipPhone: address.phone,
          shipLine1: address.line1,
          shipLine2: address.line2 || null,
          shipCity: address.city,
          shipState: address.state,
          shipPincode: address.pincode,
          items: {
            create: lineItems.map((l) => ({
              productId: l.productId,
              name: l.name,
              image: l.image,
              price: l.price,
              quantity: l.quantity,
              size: l.size,
            })),
          },
        },
      });
      orderId = order.id;
      orderNumber = order.number;
    } catch (err) {
      console.error("Order persistence failed", err);
    }
  }

  return NextResponse.json({
    demo: !razorpayEnabled,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? null,
    amount: totals.total,
    currency: "INR",
    razorpayOrderId,
    orderId,
    orderNumber,
  });
}
