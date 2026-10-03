"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { CartLine } from "@/lib/types";

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  remove: (productId: string, size: string | null) => void;
  setQty: (productId: string, size: string | null, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

/** A line is unique per product + selected size. */
export function lineKey(productId: string, size: string | null): string {
  return `${productId}::${size ?? ""}`;
}

const sameLine = (l: CartLine, productId: string, size: string | null) =>
  l.productId === productId && (l.size ?? "") === (size ?? "");

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) =>
            sameLine(l, line.productId, line.size),
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line.productId, line.size)
                  ? { ...l, quantity: l.quantity + qty }
                  : l,
              ),
              isOpen: true,
            };
          }
          return { lines: [...state.lines, { ...line, quantity: qty }], isOpen: true };
        }),
      remove: (productId, size) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, productId, size)),
        })),
      setQty: (productId, size, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (sameLine(l, productId, size) ? { ...l, quantity: qty } : l))
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "joyrush-cart",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

/** Guards against SSR/client hydration mismatch for persisted cart values. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
