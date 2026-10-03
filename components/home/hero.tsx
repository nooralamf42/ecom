"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FloatingShapes } from "./floating-shapes";
import type { StoreProduct } from "@/lib/types";
import type { HomepageSettings } from "@/lib/settings/schema";

const ease = [0.22, 1, 0.36, 1] as const;
const positions = [
  { x: "-6%", y: "4%", r: -8, delay: 0 },
  { x: "30%", y: "-6%", r: 5, delay: 0.15 },
  { x: "58%", y: "10%", r: -5, delay: 0.3 },
];

export function Hero({
  content,
  products = [],
}: {
  content: HomepageSettings["hero"];
  products?: StoreProduct[];
}) {
  const showcase = products.filter((p) => p.images[0]).slice(0, 3);

  return (
    <section className="relative overflow-hidden">
      <FloatingShapes />
      <div className="container-page relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        {/* Copy */}
        <div className="relative z-10 text-center lg:text-left">
          {content.badge && (
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-brand-ink shadow-sm backdrop-blur"
            >
              <span className="size-2 rounded-full bg-brand-tangerine" />
              {content.badge}
            </motion.span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="mt-5 font-heading text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {content.headline}
            {content.highlight && (
              <>
                {" "}
                <span className="relative whitespace-nowrap text-primary">
                  {content.highlight}
                  <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 20" fill="none">
                    <motion.path
                      d="M4 14C60 4 120 4 180 10C220 14 260 12 296 6"
                      stroke="var(--brand-tangerine)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.6, ease }}
                    />
                  </svg>
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease }}
            className="mx-auto mt-6 max-w-md text-lg text-muted-foreground lg:mx-0"
          >
            {content.subtext}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            {content.primaryCta.label && content.primaryCta.href && (
              <Link
                href={content.primaryCta.href}
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-base font-bold")}
              >
                {content.primaryCta.label}
              </Link>
            )}
            {content.secondaryCta.label && content.secondaryCta.href && (
              <Link
                href={content.secondaryCta.href}
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "rounded-full px-8 text-base font-bold",
                )}
              >
                {content.secondaryCta.label}
              </Link>
            )}
          </motion.div>

          {content.ratingText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 flex items-center justify-center gap-2 lg:justify-start"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-brand-tangerine text-brand-tangerine" />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {content.ratingText}
              </span>
            </motion.div>
          )}
        </div>

        {/* Product composition */}
        <div className="relative h-[360px] sm:h-[440px]">
          {showcase.map((p, i) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-1/2 w-40 sm:w-52"
              style={{ x: positions[i].x, y: positions[i].y }}
              initial={{ opacity: 0, y: 60, rotate: positions[i].r }}
              animate={{ opacity: 1, y: 0, rotate: positions[i].r }}
              transition={{ duration: 0.8, delay: 0.2 + positions[i].delay, ease }}
            >
              <motion.div
                animate={{ y: [0, -16, 0] }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: positions[i].delay,
                }}
              >
                <Link href={`/products/${p.slug}`}>
                  <div
                    className="relative aspect-square overflow-hidden rounded-3xl shadow-xl ring-4 ring-white"
                    style={{
                      backgroundColor: `color-mix(in oklab, var(--${p.accentColor}) 18%, white)`,
                    }}
                  >
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      sizes="220px"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
