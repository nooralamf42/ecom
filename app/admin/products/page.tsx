import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatusPill({ active }: { active: boolean }) {
  return active ? (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
      Hidden
    </span>
  );
}

function Thumb({ src }: { src?: string }) {
  return (
    <span className="block size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      )}
    </span>
  );
}

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link
          href="/admin/products/new"
          className={cn(buttonVariants(), "shrink-0 rounded-full")}
        >
          <Plus className="size-4" /> New product
        </Link>
      </div>

      {/* Phones: tappable rows */}
      <ul className="mt-4 divide-y rounded-2xl border bg-card md:hidden">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3 p-3 active:bg-muted/60">
              <Thumb src={p.images[0]} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(p.price)} · {p.stock} in stock
                </p>
              </div>
              <StatusPill active={p.isActive} />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb src={p.images[0]} />
                    <span className="font-semibold">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <StatusPill active={p.isActive} />
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
