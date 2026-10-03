import type { ProductType } from "@/lib/types";

/**
 * Branded SVG product illustration used when a product has no photo yet.
 * `accent` is a brand token name (e.g. "brand-berry") mapped to a CSS variable.
 */
export function ProductGraphic({
  type,
  accent,
  className,
  initials,
}: {
  type: ProductType;
  accent: string;
  className?: string;
  initials?: string;
}) {
  const color = `var(--${accent})`;
  const isGummy = type === "GUMMY";

  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`g-${accent}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* soft blob backdrop */}
      <ellipse cx="100" cy="130" rx="86" ry="96" fill={color} opacity="0.14" />

      {isGummy ? (
        <g>
          {/* jar body */}
          <rect x="52" y="70" width="96" height="150" rx="26" fill={`url(#g-${accent})`} />
          {/* lid */}
          <rect x="60" y="46" width="80" height="30" rx="12" fill={color} />
          <rect x="66" y="40" width="68" height="14" rx="7" fill="white" opacity="0.85" />
          {/* gummies */}
          {[
            [78, 120],
            [110, 110],
            [126, 140],
            [82, 158],
            [112, 172],
            [96, 138],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="12"
              fill="white"
              opacity={i % 2 ? 0.55 : 0.8}
            />
          ))}
          {/* highlight */}
          <rect x="62" y="82" width="12" height="120" rx="6" fill="white" opacity="0.22" />
        </g>
      ) : (
        <g>
          {/* can body */}
          <rect x="62" y="40" width="76" height="180" rx="20" fill={`url(#g-${accent})`} />
          {/* top rim */}
          <ellipse cx="100" cy="42" rx="38" ry="10" fill={color} />
          <ellipse cx="100" cy="40" rx="30" ry="7" fill="white" opacity="0.85" />
          {/* label band */}
          <rect x="62" y="104" width="76" height="54" fill="white" opacity="0.92" />
          <text
            x="100"
            y="138"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fontFamily="var(--font-display), system-ui"
            fill={color}
          >
            {initials ?? "JR"}
          </text>
          {/* highlight */}
          <rect x="70" y="52" width="10" height="156" rx="5" fill="white" opacity="0.25" />
          {/* bubbles */}
          <circle cx="150" cy="70" r="6" fill={color} opacity="0.5" />
          <circle cx="44" cy="150" r="5" fill={color} opacity="0.5" />
          <circle cx="158" cy="150" r="4" fill={color} opacity="0.4" />
        </g>
      )}
    </svg>
  );
}
