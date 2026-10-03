import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Truck, Tag, Gift } from "lucide-react";

const tiers = [
  { icon: Truck, threshold: "₹999+", perk: "Free shipping" },
  { icon: Tag, threshold: "₹1,499+", perk: "₹100 off" },
  { icon: Gift, threshold: "₹1,999+", perk: "₹200 off + free shipping" },
];

export function BundlePromo() {
  return (
    <section className="container-page py-16 sm:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-ink px-6 py-14 text-center text-brand-cream sm:px-12">
          <div
            className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full opacity-40 blur-2xl"
            style={{ backgroundColor: "var(--brand-berry)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full opacity-40 blur-2xl"
            style={{ backgroundColor: "var(--brand-sky)" }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-heading text-4xl font-bold sm:text-5xl">
              Stock up &amp; save more
            </h2>
            <p className="mx-auto mt-3 max-w-md text-brand-cream/70">
              The more joy in your bag, the more you save. It&apos;s that simple.
            </p>

            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              {tiers.map((t) => (
                <div
                  key={t.perk}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
                >
                  <t.icon className="mx-auto size-7 text-brand-tangerine" />
                  <p className="mt-3 text-2xl font-extrabold">{t.threshold}</p>
                  <p className="mt-1 text-sm text-brand-cream/80">{t.perk}</p>
                </div>
              ))}
            </div>

            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-10 rounded-full bg-brand-cream px-8 text-base font-bold text-brand-ink hover:bg-white",
              )}
            >
              Start your box
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
