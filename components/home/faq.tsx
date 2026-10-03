"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { HomepageSettings } from "@/lib/settings/schema";

export function Faq({ content }: { content: HomepageSettings["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (content.items.length === 0) return null;

  return (
    <section id="faq" className="container-page py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold sm:text-5xl">{content.title}</h2>
      </Reveal>

      <div className="mx-auto mt-10 max-w-2xl divide-y divide-black/10 rounded-[1.5rem] border border-black/5 bg-card px-6">
        {content.items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="py-2">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="font-bold">{f.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                >
                  <Plus className="size-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
