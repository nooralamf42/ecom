import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
import { BrandLogo } from "./brand-logo";

type Category = { name: string; slug: string };

const staticColumns = [
  {
    title: "Learn",
    links: [
      { label: "Our story", href: "/#story" },
      { label: "Reviews", href: "/#reviews" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "My orders", href: "/orders" },
      { label: "Shipping", href: "/#faq" },
      { label: "Contact", href: "mailto:hello@joyrush.example" },
      { label: "Admin", href: "/admin" },
    ],
  },
];

export function Footer({ categories = [] }: { categories?: Category[] }) {
  const shopColumn = {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      ...categories.map((c) => ({ label: c.name, href: `/products?category=${c.slug}` })),
    ],
  };
  const columns = [shopColumn, ...staticColumns];

  return (
    <footer className="mt-24 border-t border-black/5 bg-brand-cream">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Bangleish home">
            <BrandLogo className="text-2xl" />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Beautiful handcrafted bangles for every occasion — shining designs
            delivered across India.
          </p>
          <NewsletterForm />
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wide">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-black/5">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Bangleish. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/#" className="hover:text-foreground">
              Terms
            </Link>
            <span>Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
