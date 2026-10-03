"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { CommerceRules, SiteSettings } from "@/lib/settings/schema";

/** Settings sections client components need. All public — no secrets live in settings. */
export type ClientSettings = Pick<SiteSettings, "identity" | "theme" | "commerce">;

const SiteSettingsContext = createContext<ClientSettings | null>(null);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: ClientSettings;
  children: ReactNode;
}) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): ClientSettings {
  const value = useContext(SiteSettingsContext);
  if (!value) throw new Error("useSiteSettings must be used inside <SiteSettingsProvider>");
  return value;
}

/** Same rules the checkout API uses, so the cart preview matches the real charge. */
export function useCommerceRules(): CommerceRules {
  const { commerce } = useSiteSettings();
  return useMemo(
    () => ({
      shippingFee: commerce.shippingFee,
      freeShippingEnabled: commerce.freeShippingEnabled,
      freeShippingThreshold: commerce.freeShippingThreshold,
      tiers: commerce.tiers,
    }),
    [commerce],
  );
}

/** Store name, logo and brand color for the Razorpay payment modal. */
export function useRazorpayBranding(): { name: string; image?: string; theme: { color: string } } {
  const { identity, theme } = useSiteSettings();
  return {
    name: identity.storeName,
    ...(identity.logoUrl ? { image: identity.logoUrl } : {}),
    theme: { color: theme.primary },
  };
}
