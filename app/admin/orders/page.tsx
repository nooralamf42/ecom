import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderActions } from "@/components/admin/order-actions";
import { OrderExtras } from "@/components/admin/order-extras";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h2 className="text-2xl font-bold">Orders</h2>

      {orders.length === 0 ? (
        <p className="mt-6 rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          No orders yet. Paid orders will appear here ready to fulfill.
        </p>
      ) : (
        <>
          {/* Phones: one card per order */}
          <ul className="mt-4 space-y-3 md:hidden">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">
                      #{o.number}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium">{o.shipName}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <OrderStatusBadge status={o.status} />
                    <span className="font-bold">{formatPrice(o.total)}</span>
                  </div>
                </div>
                <div className="mt-3 border-t pt-3">
                  <OrderActions
                    align="start"
                    orderId={o.id}
                    status={o.status}
                    awbCode={o.awbCode}
                    courierName={o.courierName}
                    labelUrl={o.labelUrl}
                    trackingUrl={o.trackingUrl}
                  />
                  <OrderExtras
                    align="start"
                    orderId={o.id}
                    orderNumber={o.number}
                    status={o.status}
                    total={o.total}
                    refundedAmount={o.refundedAmount}
                    refundStatus={o.refundStatus}
                    hasPayment={Boolean(o.razorpayPaymentId)}
                    emailsSent={o.emailsSent}
                    emailError={o.emailError}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden overflow-x-auto rounded-2xl border bg-card md:block">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold">#{o.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.shipName}</p>
                      <p className="text-xs text-muted-foreground">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <OrderActions
                        orderId={o.id}
                        status={o.status}
                        awbCode={o.awbCode}
                        courierName={o.courierName}
                        labelUrl={o.labelUrl}
                        trackingUrl={o.trackingUrl}
                      />
                      <OrderExtras
                        orderId={o.id}
                        orderNumber={o.number}
                        status={o.status}
                        total={o.total}
                        refundedAmount={o.refundedAmount}
                        refundStatus={o.refundStatus}
                        hasPayment={Boolean(o.razorpayPaymentId)}
                        emailsSent={o.emailsSent}
                        emailError={o.emailError}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
