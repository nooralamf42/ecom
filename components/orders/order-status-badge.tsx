import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-sky-100 text-sky-800",
  FULFILLED: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

// Customer-friendly wording matching common ecommerce conventions (Amazon,
// Flipkart, etc.) — avoids claiming an order is "Fulfilled"/done before the
// courier has actually picked it up. The underlying OrderStatus enum value
// (FULFILLED) is unchanged in the database; only the displayed label differs.
const labels: Record<string, string> = {
  PENDING: "Payment pending",
  PAID: "Order confirmed",
  FULFILLED: "Preparing to ship",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
