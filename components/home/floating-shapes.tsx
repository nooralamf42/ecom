"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type Shape = {
  className: string;
  size: number;
  color: string;
  x: string;
  y: string;
  depth: number; // parallax multiplier
};

const shapes: Shape[] = [
  { className: "", size: 120, color: "brand-mint", x: "6%", y: "18%", depth: 0.5 },
  { className: "", size: 80, color: "brand-tangerine", x: "82%", y: "12%", depth: 0.9 },
  { className: "", size: 160, color: "brand-sky", x: "88%", y: "62%", depth: 0.35 },
  { className: "", size: 64, color: "brand-lemon", x: "14%", y: "72%", depth: 0.8 },
  { className: "", size: 100, color: "brand-lavender", x: "44%", y: "8%", depth: 0.6 },
];

export function FloatingShapes() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((s, i) => (
        <ParallaxBlob key={i} shape={s} progress={scrollYProgress} index={i} />
      ))}
    </div>
  );
}

function ParallaxBlob({
  shape,
  progress,
  index,
}: {
  shape: Shape;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
}) {
  const y = useTransform(progress, [0, 1], [0, -160 * shape.depth]);

  return (
    <motion.div
      className="absolute"
      style={{ y, left: shape.x, top: shape.y }}
    >
      <motion.div
        className="rounded-full blur-[2px]"
        style={{
          width: shape.size,
          height: shape.size,
          backgroundColor: `color-mix(in oklab, var(--${shape.color}) 55%, white)`,
        }}
        animate={{ y: [0, -14, 0] }}
        transition={{
          duration: 5 + index,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
