import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link
          href="/admin/products/new"
          className={cn(buttonVariants(), "rounded-full")}
        >
          <Plus className="size-4" /> New product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  {p.isActive ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                      Hidden
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="font-semibold text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
