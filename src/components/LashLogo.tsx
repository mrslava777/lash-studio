export function LashLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Elegant curved lashes — three graceful strokes */}
      <path
        d="M10 38C12 28 18 18 24 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M18 40C19 30 22 20 28 10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M26 40C26 30 28 22 34 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Lash wand / applicator brush */}
      <line
        x1="8"
        y1="42"
        x2="38"
        y2="42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Brush tip detail */}
      <ellipse
        cx="38"
        cy="42"
        rx="4"
        ry="2"
        fill="currentColor"
        opacity="0.2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Sparkle accent */}
      <circle cx="36" cy="8" r="1.8" fill="currentColor" opacity="0.35" />
      <path
        d="M36 5V11M33 8H39"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
