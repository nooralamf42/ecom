"use client";

import { motion } from "motion/react";

const items = [
  "Handcrafted designs",
  "Sizes 2.2 – 2.8",
  "Free shipping over ₹999",
  "Made in India",
  "Shining finish",
  "Everyday & festive",
  "Loved by thousands",
  "Easy returns",
];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-black/5 bg-primary py-4 text-primary-foreground">
      <motion.div
        className="flex w-max gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-lg font-bold">
            {item}
            <span className="text-primary-foreground/60">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
