/** Format paise (integer) as an INR currency string. */
export function formatPrice(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/** Rupees (number) -> paise (integer). */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Percentage saved between compareAt and price (both paise). */
export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
