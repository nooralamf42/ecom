"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Menu, ShoppingBag } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { useCart, useHydrated } from "@/store/cart";
import { useLenisLock } from "@/components/providers/smooth-scroll-provider";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { cartCount } from "@/lib/cart-totals";
import { clerkEnabled } from "@/lib/auth-config";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

export function Navbar({
  categories = [],
  extraLinks = [],
}: {
  categories?: { name: string; slug: string }[];
  /** e.g. the About page, when the store has one. */
  extraLinks?: NavLink[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(lines) : 0;
  const { identity } = useSiteSettings();
  useLenisLock(mobileOpen);

  const links = [
    { href: "/products", label: "Shop All" },
    ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name })),
    ...extraLinks,
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-black/5 bg-brand-cream/80 backdrop-blur-lg"
          : "bg-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={`${identity.storeName} home`}>
          <BrandLogo name={identity.storeName} logoUrl={identity.logoUrl} />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-brand-ink/80 transition-colors hover:bg-white/60 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {clerkEnabled ? (
            <>
              <SignedIn>
                <Link
                  href="/orders"
                  className="hidden rounded-full px-3 py-2 text-sm font-semibold text-brand-ink/80 hover:text-primary sm:block"
                >
                  Orders
                </Link>
                <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="rounded-full font-semibold">
                    Sign in
                  </Button>
                </SignInButton>
              </SignedOut>
            </>
          ) : (
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "rounded-full font-semibold",
              )}
            >
              Sign in
            </Link>
          )}

          <Button
            variant="default"
            className="relative rounded-full"
            size="icon"
            onClick={openCart}
            aria-label="Open cart"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-cherry text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="rounded-full md:hidden" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-heading text-2xl">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-2 flex flex-col gap-1 px-4">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-base font-semibold hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
                {clerkEnabled && (
                  <SignedIn>
                    <Link
                      href="/orders"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-3 text-base font-semibold hover:bg-muted"
                    >
                      My Orders
                    </Link>
                  </SignedIn>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
