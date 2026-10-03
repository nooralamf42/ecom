import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getAdminAccess } from "@/lib/admin-access";
import { AdminSidebar } from "@/components/admin/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { allowed, demo } = await getAdminAccess();

  if (!allowed) {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h1 className="font-heading text-3xl font-bold">Admins only</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            This area is restricted. Add your email to <code>ADMIN_EMAILS</code>{" "}
            and sign in with that account.
          </p>
          <Link href="/" className={cn(buttonVariants(), "mt-5 rounded-full")}>
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Store admin</h1>
      </div>

      {demo && (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Preview mode.</strong> Connect Clerk + a Neon database to enable
          editing and see live orders. You&apos;re viewing demo data.
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[200px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
