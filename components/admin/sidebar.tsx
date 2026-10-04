"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Package, Settings, ShoppingCart, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-w-0 lg:sticky lg:top-20 lg:h-max">
      {/* Phones: every section visible as a 3×2 grid. Desktop: a vertical sidebar. */}
      <nav className="grid grid-cols-3 gap-1.5 lg:flex lg:flex-col lg:gap-1">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-2 text-xs font-semibold transition-colors sm:text-sm lg:justify-start lg:gap-2.5 lg:px-4 lg:py-2.5",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground lg:bg-transparent",
              )}
            >
              <l.icon className="size-4" />
              {l.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-muted/60 px-2 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground sm:text-sm lg:justify-start lg:gap-2.5 lg:bg-transparent lg:px-4 lg:py-2.5"
        >
          <Store className="size-4" />
          View store
        </Link>
      </nav>
    </aside>
  );
}
