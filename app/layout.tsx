import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/auth-config";
import { getStoreCategories } from "@/lib/categories";
import { getFooterPages } from "@/lib/pages";
import { getSettings, siteBaseUrl } from "@/lib/settings";
import { themeToCss } from "@/lib/settings/theme-css";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { SiteSettingsProvider } from "@/components/providers/site-settings-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

// Fonts live in app/fonts (Latin variable fonts from Google Fonts, OFL licence) so builds
// never depend on reaching Google — a failed font download used to break the whole build.
const fredoka = localFont({
  src: "./fonts/fredoka-latin.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const nunito = localFont({
  src: "./fonts/nunito-latin.woff2",
  variable: "--font-body",
  weight: "200 1000",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const { storeName, tagline, seoTitle, seoDescription, ogImageUrl, faviconUrl } =
    settings.identity;
  const title = seoTitle || (tagline ? `${storeName} — ${tagline}` : storeName);
  const description = seoDescription || tagline || undefined;

  return {
    title: { default: title, template: `%s · ${storeName}` },
    description,
    metadataBase: new URL(siteBaseUrl(settings)),
    openGraph: {
      title,
      description,
      siteName: storeName,
      type: "website",
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [categories, settings, footerPages] = await Promise.all([
    getStoreCategories(),
    getSettings(),
    getFooterPages(),
  ]);
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
      <head>
        {/* Theme colors from admin settings; values are validated hex (safe to inline). */}
        <style id="store-theme" dangerouslySetInnerHTML={{ __html: themeToCss(settings.theme) }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteSettingsProvider value={clientSettings}>
          <SmoothScrollProvider>
            <Navbar
              categories={categories}
              extraLinks={footerPages
                .filter((p) => p.slug === "about")
                .map((p) => ({ href: `/${p.slug}`, label: p.title }))}
            />
            <main className="flex-1">{children}</main>
            <Footer categories={categories} identity={settings.identity} pages={footerPages} />
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
