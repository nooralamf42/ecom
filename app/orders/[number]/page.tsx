import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Star, Truck } from "lucide-react";
import { getOrderByNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PendingOrderActions } from "@/components/orders/pending-order-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return { title: `Order #${number}`, robots: { index: false } };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const order = await getOrderByNumber(Number(number));
  // Missing or not theirs: same response either way, so order numbers can't be probed.
  if (!order) redirect(`/track-order?order=${encodeURIComponent(number)}`);

  // Customers can review items from orders that have been paid or beyond.
  const canReview = ["PAID", "FULFILLED", "SHIPPED", "DELIVERED"].includes(
    order.status,
  );

  return (
    <div className="container-page max-w-3xl py-12 sm:py-16">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold">Order #{order.number}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Placed on{" "}
        {new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {order.status === "PENDING" && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            This order isn&apos;t confirmed yet
          </p>
          <p className="mt-0.5 text-sm text-amber-800">
            We haven&apos;t received your payment. Complete it to confirm your
            order, or cancel if you changed your mind.
          </p>
          <PendingOrderActions
            orderNumber={order.number}
            customerName={order.shipName}
            email={order.email}
            phone={order.shipPhone}
          />
        </div>
      )}

      {order.awbCode && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-brand-mint/30 p-4">
          <Truck className="size-5" />
          <div className="text-sm">
            <p className="font-bold">
              {order.courierName ?? "Courier"} · AWB {order.awbCode}
            </p>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                Track shipment →
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-3xl border bg-card p-6">
        <h2 className="text-lg font-bold">Items</h2>
        <ul className="mt-4 divide-y">
          {order.items.map((i) => (
            <li key={i.id} className="py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex-1">
                  {i.name}
                  {i.size && <span className="text-muted-foreground"> (Size {i.size})</span>}{" "}
                  <span className="text-muted-foreground">× {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
              </div>
              {canReview && i.product?.slug && (
                <Link
                  href={`/products/${i.product.slug}#write-review`}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Star className="size-3.5 fill-primary" /> Write a review
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.discount > 0 && (
            <Row label="Discount" value={`- ${formatPrice(order.discount)}`} />
          )}
          <Row
            label="Shipping"
            value={order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
          />
          <div className="flex justify-between border-t pt-2 text-base font-extrabold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-card p-6">
        <h2 className="text-lg font-bold">Shipping to</h2>
        <address className="mt-2 text-sm not-italic text-muted-foreground">
          {order.shipName}
          <br />
          {order.shipLine1}
          {order.shipLine2 ? `, ${order.shipLine2}` : ""}
          <br />
          {order.shipCity}, {order.shipState} {order.shipPincode}
          <br />
          {order.shipPhone}
        </address>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
