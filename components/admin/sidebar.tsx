"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-20 lg:h-max">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <l.icon className="size-4" />
              {l.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Store className="size-4" />
          View store
        </Link>
      </nav>
    </aside>
  );
}
