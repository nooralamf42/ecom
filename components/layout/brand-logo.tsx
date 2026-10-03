import { cn } from "@/lib/utils";

/**
 * Store brand lockup: the uploaded logo when set (Admin → Settings → Store),
 * otherwise a monogram of the store name's first letter plus the name.
 * Uses <img>, not next/image, so logos from any https host work without
 * editing next.config's remotePatterns.
 */
export function BrandLogo({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl?: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={name} className={cn("h-9 w-auto max-w-[180px] object-contain", className)} />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "S";
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-primary font-heading text-base font-bold italic text-primary"
      >
        {initial}
      </span>
      <span className="font-heading text-xl font-extrabold tracking-tight">{name}</span>
    </span>
  );
}
