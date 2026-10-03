import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { Truck, Tag, Gift } from "lucide-react";
import type { CommerceRules, HomepageSettings } from "@/lib/settings/schema";

const GRID_COLS = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"];

/** One card per perk, generated from the same rules checkout uses. */
function perksFrom(rules: CommerceRules) {
  const perks: { icon: typeof Truck; minSubtotal: number; perk: string }[] = [];
  if (rules.freeShippingEnabled) {
    perks.push({ icon: Truck, minSubtotal: rules.freeShippingThreshold, perk: "Free shipping" });
  }
  const tiers = [...rules.tiers].sort((a, b) => a.minSubtotal - b.minSubtotal);
  tiers.forEach((t, i) => {
    const parts = [];
    if (t.discount > 0) parts.push(`${formatPrice(t.discount)} off`);
    if (t.freeShipping) parts.push(parts.length ? "free shipping" : "Free shipping");
    if (parts.length === 0) return;
    const icon = t.discount === 0 ? Truck : i === tiers.length - 1 && tiers.length > 1 ? Gift : Tag;
    perks.push({ icon, minSubtotal: t.minSubtotal, perk: parts.join(" + ") });
  });
  return perks.sort((a, b) => a.minSubtotal - b.minSubtotal).slice(0, 4);
}

export function BundlePromo({
  content,
  rules,
}: {
  content: HomepageSettings["promo"];
  rules: CommerceRules;
}) {
  const perks = perksFrom(rules);
  if (perks.length === 0) return null;

  return (
    <section className="container-page py-16 sm:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-ink px-6 py-14 text-center text-brand-cream sm:px-12">
          <div
            className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full opacity-40 blur-2xl"
            style={{ backgroundColor: "var(--primary)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full opacity-40 blur-2xl"
            style={{ backgroundColor: "var(--brand-sky)" }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-heading text-4xl font-bold sm:text-5xl">
              {content.title}
            </h2>
            {content.subtitle && (
              <p className="mx-auto mt-3 max-w-md text-brand-cream/70">{content.subtitle}</p>
            )}

            <div className={cn("mx-auto mt-10 grid max-w-3xl gap-4", GRID_COLS[perks.length])}>
              {perks.map((t) => (
                <div
                  key={`${t.minSubtotal}-${t.perk}`}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
                >
                  <t.icon className="mx-auto size-7 text-brand-tangerine" />
                  <p className="mt-3 text-2xl font-extrabold">{formatPrice(t.minSubtotal)}+</p>
                  <p className="mt-1 text-sm text-brand-cream/80">{t.perk}</p>
                </div>
              ))}
            </div>

            {content.cta.label && content.cta.href && (
              <Link
                href={content.cta.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-10 rounded-full bg-brand-cream px-8 text-base font-bold text-brand-ink hover:bg-white",
                )}
              >
                {content.cta.label}
              </Link>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
