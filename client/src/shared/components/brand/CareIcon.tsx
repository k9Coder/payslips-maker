interface CareIconProps {
  size?: number;
  className?: string;
}

export function CareIcon({ size = 28, className }: CareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="6" fill="#1e3a8a" />
      {/* Header row */}
      <rect x="5" y="6" width="22" height="4" rx="1.5" fill="white" />
      {/* Row 1 — label */}
      <rect x="5" y="13" width="13" height="2.5" rx="1.2" fill="#93c5fd" />
      {/* Row 1 — value */}
      <rect x="21" y="13" width="6" height="2.5" rx="1.2" fill="white" opacity="0.7" />
      {/* Row 2 — label */}
      <rect x="5" y="18" width="10" height="2.5" rx="1.2" fill="#93c5fd" />
      {/* Row 2 — value */}
      <rect x="21" y="18" width="6" height="2.5" rx="1.2" fill="white" opacity="0.7" />
      {/* Total row */}
      <rect x="5" y="24" width="22" height="2.5" rx="1.2" fill="white" opacity="0.9" />
    </svg>
  );
}
