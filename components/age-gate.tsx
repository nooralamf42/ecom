"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLenisLock } from "@/components/providers/smooth-scroll-provider";

const STORAGE_KEY = "joyrush-age-ok";

export function AgeGate() {
  const [show, setShow] = useState(false);
  useLenisLock(show);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function confirm() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-brand-ink/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="w-full max-w-md rounded-[2rem] bg-brand-cream p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-primary/15">
              <Sparkles className="size-7 text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold">Before you sip…</h2>
            <p className="mt-2 text-muted-foreground">
              Joy Rush is crafted for grown-ups. Please confirm you&apos;re 18 or
              older to enter.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                size="lg"
                className="w-full rounded-full text-base font-bold"
                onClick={confirm}
              >
                I&apos;m 18 or older
              </Button>
              <a
                href="https://www.google.com"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                I&apos;m under 18
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
