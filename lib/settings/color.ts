/** Pure color helpers for theme settings (hex in, CSS out). */

function channel(hex: string, i: number): number {
  const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function luminance(hex: string): number {
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
}

/** WCAG contrast ratio, 1–21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Text color for a filled surface (e.g. a button): prefer the lighter of the
 * theme's background/foreground when it's legible (≥ 3:1, the WCAG bar for
 * bold UI text), otherwise the darker one.
 */
export function textOn(surface: string, background: string, foreground: string): string {
  const [light, dark] =
    luminance(background) >= luminance(foreground) ? [background, foreground] : [foreground, background];
  return contrastRatio(light, surface) >= 3 ? light : dark;
}
