"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SuccessCard({
  orderNumber,
  demo,
}: {
  orderNumber?: string;
  demo?: boolean;
}) {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16 text-center">
      <div>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="mx-auto grid size-20 place-items-center rounded-full bg-brand-mint"
        >
          <Check className="size-10 text-brand-ink" strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 font-heading text-4xl font-bold"
        >
          Thank you! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mx-auto mt-3 max-w-md text-muted-foreground"
        >
          {demo
            ? "This is a demo order — add your Razorpay keys to take real payments. "
            : "Your order is confirmed and on its way to being packed with care. "}
          {orderNumber && (
            <>
              Your order number is{" "}
              <span className="font-bold text-foreground">#{orderNumber}</span>.
            </>
          )}
        </motion.p>

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>
            Keep shopping
          </Link>
          <Link
            href="/orders"
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "rounded-full",
            )}
          >
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}
