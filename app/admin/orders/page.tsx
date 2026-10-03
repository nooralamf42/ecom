import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderActions } from "@/components/admin/order-actions";

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
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
