"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const faqs = [
  {
    q: "How do I choose the right size?",
    a: "Bangles come in standard sizes 2.2, 2.4, 2.6 and 2.8. Measure the widest part of your hand (with fingers together) and match it to the size chart — 2.4 is the most common women's size.",
  },
  {
    q: "How fast is shipping?",
    a: "We ship pan-India via Shiprocket. Most orders arrive in 3–6 business days, and you'll get a tracking link the moment your order leaves us.",
  },
  {
    q: "What's your return policy?",
    a: "If something arrives damaged or you're not happy, reach out within 7 days and we'll make it right — replacement or refund.",
  },
  {
    q: "Are the bangles good for daily wear?",
    a: "Absolutely. Our designs are made to be lightweight and durable for both everyday and festive wear.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="container-page py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold sm:text-5xl">Questions? Answered.</h2>
      </Reveal>

      <div className="mx-auto mt-10 max-w-2xl divide-y divide-black/10 rounded-[1.5rem] border border-black/5 bg-card px-6">
        {faqs.map((f, i) => {
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
