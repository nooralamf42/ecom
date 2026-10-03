import type { Metadata } from "next";
import { Fredoka, Nunito, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/auth-config";
import { getStoreCategories } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { SiteSettingsProvider } from "@/components/providers/site-settings-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bangleish — Handcrafted Bangles",
    template: "%s · Bangleish",
  },
  description:
    "Beautiful handcrafted bangles for every occasion. Shining designs in sizes 2.2–2.8, delivered across India.",
  metadataBase: new URL("https://bangleish.example"),
  openGraph: {
    title: "Bangleish — Handcrafted Bangles",
    description:
      "Beautiful handcrafted bangles for every occasion, delivered across India.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [categories, settings] = await Promise.all([getStoreCategories(), getSettings()]);
  const clientSettings = {
    identity: settings.identity,
    theme: settings.theme,
    commerce: settings.commerce,
  };

  const tree = (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteSettingsProvider value={clientSettings}>
          <SmoothScrollProvider>
            <Navbar categories={categories} />
            <main className="flex-1">{children}</main>
            <Footer categories={categories} />
            <CartDrawer />
          </SmoothScrollProvider>
        </SiteSettingsProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );

  // Only wrap in ClerkProvider when auth keys are present, so the site runs
  // in demo mode without them.
  return clerkEnabled ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
