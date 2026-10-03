import type { ThemeSettings } from "./schema";
import { luminance, textOn } from "./color";

/**
 * CSS overriding the design tokens declared in app/globals.css, so a theme
 * change applies site-wide with no rebuild (Tailwind v4 reads these vars).
 * Every input is a schema-validated #rrggbb, so it is safe to inline.
 * `:root:root` raises specificity so this wins whatever the stylesheet order.
 */
export function themeToCss(t: ThemeSettings): string {
  const primaryText = textOn(t.primary, t.background, t.foreground);
  const secondaryText = textOn(t.secondary, t.background, t.foreground);
  const surface =
    luminance(t.background) > 0.5 ? "#ffffff" : `color-mix(in oklab, ${t.background} 88%, white)`;
  const mix = (fgPercent: number) => `color-mix(in oklab, ${t.foreground} ${fgPercent}%, ${t.background})`;

  const vars: Record<string, string> = {
    "--background": t.background,
    "--brand-cream": t.background,
    "--foreground": t.foreground,
    "--brand-ink": t.foreground,
    "--card": surface,
    "--popover": surface,
    "--card-foreground": t.foreground,
    "--popover-foreground": t.foreground,
    "--primary": t.primary,
    "--primary-foreground": primaryText,
    "--ring": t.primary,
    "--secondary": t.secondary,
    "--secondary-foreground": secondaryText,
    "--accent": `color-mix(in oklab, ${t.primary} 10%, ${t.background})`,
    "--accent-foreground": t.foreground,
    "--muted": mix(5),
    "--muted-foreground": mix(68),
    "--border": mix(12),
    "--input": mix(12),
    "--sidebar-primary": t.primary,
    "--sidebar-primary-foreground": primaryText,
    "--sidebar-ring": t.primary,
  };
  return `:root:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;
}
