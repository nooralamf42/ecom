import Link from "next/link";
import { Package } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getMyOrders } from "@/lib/orders";
import { clerkEnabled } from "@/lib/auth-config";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PendingOrderActions } from "@/components/orders/pending-order-actions";
import { DeviceOrdersPrompt } from "@/components/orders/device-orders-prompt";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "My orders" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [{ orders, deviceOrders }, signedIn] = await Promise.all([
    getMyOrders(),
    clerkEnabled ? auth().then((a) => Boolean(a.userId)) : false,
  ]);

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="font-heading text-4xl font-bold">My orders</h1>

      {!signedIn && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-sm">
          <p className="text-muted-foreground">
            {orders.length > 0
              ? "Showing orders placed on this device. "
              : "Ordered without an account? "}
            Sign in with the email you used to see all your orders anywhere.
          </p>
          <div className="flex gap-2">
            {clerkEnabled && (
              <Link href="/sign-in?redirect_url=/orders" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
                Sign in
              </Link>
            )}
            <Link
              href="/track-order"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-full")}
            >
              Track an order
            </Link>
          </div>
        </div>
      )}

      {signedIn && deviceOrders.length > 0 && (
        <DeviceOrdersPrompt
          orders={deviceOrders.map((o) => ({
            number: o.number,
            total: o.total,
            createdAt: o.createdAt.toISOString(),
            itemCount: o.items.length,
          }))}
        />
      )}

      {orders.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border bg-card py-16 text-center">
          <div className="mb-4 grid size-16 place-items-center rounded-full bg-muted">
            <Package className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-bold">No orders yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {clerkEnabled
              ? "When you place an order, it'll show up here with live tracking."
              : "Sign-in and orders light up once Clerk and the database are configured."}
          </p>
          <Link
            href="/products"
            className={cn(buttonVariants(), "mt-5 rounded-full")}
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-2xl border bg-card transition-colors hover:border-primary"
            >
              <Link
                href={`/orders/${o.number}`}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-bold">Order #{o.number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {o.items.length} item{o.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={o.status} />
                  <span className="font-bold">{formatPrice(o.total)}</span>
                </div>
              </Link>

              {o.status === "PENDING" && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
                  <p className="text-sm text-muted-foreground">
                    Payment not completed
                  </p>
                  <PendingOrderActions
                    orderNumber={o.number}
                    customerName={o.shipName}
                    email={o.email}
                    phone={o.shipPhone}
                    compact
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
