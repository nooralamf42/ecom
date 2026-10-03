import Link from "next/link";
import { Plus } from "lucide-react";
import { db, hasDatabase } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pages" };
export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = hasDatabase
    ? await db.page.findMany({
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        select: { id: true, title: true, slug: true, isPublished: true, showInFooter: true, updatedAt: true },
      })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Pages</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Policy pages, About us and anything else you want on your site.
          </p>
        </div>
        <Link href="/admin/pages/new" className={cn(buttonVariants(), "shrink-0 rounded-full")}>
          <Plus className="size-4" /> New page
        </Link>
      </div>

      {pages.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No pages yet. Payment providers usually ask for Terms, Privacy, Refund, Shipping and Contact pages.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">URL</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Footer</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold">{p.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">/{p.slug}</td>
                  <td className="px-4 py-3">
                    {p.isPublished ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.showInFooter ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pages/${p.id}/edit`}
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
      )}
    </div>
  );
}
