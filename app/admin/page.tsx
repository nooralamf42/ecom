import { IndianRupee, Package, ShoppingCart, Clock } from "lucide-react";
import { getAdminStats } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "Revenue",
      value: formatPrice(stats.revenue),
      icon: IndianRupee,
      color: "brand-mint",
    },
    {
      label: "Orders",
      value: String(stats.orders),
      icon: ShoppingCart,
      color: "brand-sky",
    },
    {
      label: "To fulfill",
      value: String(stats.pending),
      icon: Clock,
      color: "brand-tangerine",
    },
    {
      label: "Products",
      value: String(stats.products),
      icon: Package,
      color: "brand-lavender",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold">Overview</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
            <div
              className="grid size-9 place-items-center rounded-xl sm:size-10"
              style={{
                backgroundColor: `color-mix(in oklab, var(--${c.color}) 40%, white)`,
              }}
            >
              <c.icon className="size-5 text-brand-ink" />
            </div>
            <p className="mt-3 truncate text-xl font-extrabold sm:mt-4 sm:text-2xl">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5 sm:mt-8 sm:p-6">
        <h3 className="font-bold">Getting started</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Add products under <strong>Products → New product</strong>.</li>
          <li>• Paid orders appear under <strong>Orders</strong> ready to fulfill.</li>
          <li>• Hitting <strong>Fulfill</strong> creates a Shiprocket shipment.</li>
        </ul>
      </div>
    </div>
  );
}
