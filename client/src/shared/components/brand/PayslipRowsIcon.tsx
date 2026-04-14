interface PayslipRowsIconProps {
  size?: number;
  /** Color for the header and total rows */
  primaryColor?: string;
  /** Color for the label columns */
  accentColor?: string;
  /** Opacity for the value columns */
  valueOpacity?: number;
  className?: string;
}

/**
 * Abstract payslip-rows SVG — the פשוט תלוש brand mark.
 * Represents a payslip table: header row, data rows, total row.
 * Designed to work on both dark (navbar) and light (footer) backgrounds.
 */
export function PayslipRowsIcon({
  size = 20,
  primaryColor = 'white',
  accentColor = '#93c5fd',
  valueOpacity = 0.7,
  className,
}: PayslipRowsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Header row */}
      <rect x="5" y="6" width="22" height="4" rx="1.5" fill={primaryColor} />
      {/* Row 1 — label */}
      <rect x="5" y="13" width="13" height="2.5" rx="1.2" fill={accentColor} />
      {/* Row 1 — value */}
      <rect x="21" y="13" width="6" height="2.5" rx="1.2" fill={primaryColor} opacity={valueOpacity} />
      {/* Row 2 — label */}
      <rect x="5" y="18" width="10" height="2.5" rx="1.2" fill={accentColor} />
      {/* Row 2 — value */}
      <rect x="21" y="18" width="6" height="2.5" rx="1.2" fill={primaryColor} opacity={valueOpacity} />
      {/* Total row */}
      <rect x="5" y="24" width="22" height="2.5" rx="1.2" fill={primaryColor} opacity={0.9} />
    </svg>
  );
}
