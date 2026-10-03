import { cn } from "@/lib/utils";

/**
 * Bangleish brand lockup — a gold "B" monogram + wordmark.
 * To use the real logo image instead, drop it at `public/bangleish-logo.png`
 * and swap the <svg> below for <Image src="/bangleish-logo.png" .../>.
 */
export function BrandLogo({
  className,
  markOnly = false,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 48 48" className="size-8 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="bangleish-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6c15a" />
            <stop offset="45%" stopColor="#b8860b" />
            <stop offset="70%" stopColor="#f4e19c" />
            <stop offset="100%" stopColor="#9a6a12" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="none" stroke="url(#bangleish-gold)" strokeWidth="3" />
        <text
          x="24"
          y="33"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="26"
          fontWeight="700"
          fontStyle="italic"
          fill="url(#bangleish-gold)"
        >
          B
        </text>
      </svg>
      {!markOnly && (
        <span className="font-heading text-xl font-extrabold tracking-tight">
          Bangle<span className="text-primary">ish</span>
        </span>
      )}
    </span>
  );
}
