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
// A centred fan of three cards. Offsets are a % of the card's own size, so
// the layout holds at every card size; the middle card sits highest and on top.
const positions = [
  { x: "-112%", y: "-44%", r: -8, z: 1, delay: 0 },
  { x: "-50%", y: "-58%", r: 3, z: 3, delay: 0.15 },
  { x: "12%", y: "-42%", r: 8, z: 2, delay: 0.3 },
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
      <div className="container-page relative grid items-center gap-6 py-10 sm:gap-10 sm:py-16 lg:grid-cols-2 lg:py-24">
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
            className="mx-auto mt-8 flex max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center lg:justify-start"
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
        {showcase.length > 0 && (
          <div className="relative h-[230px] sm:h-[340px] lg:h-[440px]">
            {showcase.map((p, i) => (
              // Placement lives on a plain wrapper so the entrance/float
              // animations below (which also move on y) can't override it.
              <div
                key={p.id}
                className="absolute left-1/2 top-1/2 w-32 sm:w-44 lg:w-52"
                style={{
                  transform: `translate(${positions[i].x}, ${positions[i].y}) rotate(${positions[i].r}deg)`,
                  zIndex: positions[i].z,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + positions[i].delay, ease }}
                >
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
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
                          sizes="(max-width: 640px) 128px, (max-width: 1024px) 176px, 208px"
                          className="object-cover"
                          priority={i === 0}
                        />
                      </div>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
