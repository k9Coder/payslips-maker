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
      <rect width="32" height="32" rx="7" fill="#1B2A4A" />
      {/* Heart shape */}
      <path
        d="M16 24C16 24 6 17.5 6 11.5A5.5 5.5 0 0 1 16 10.2A5.5 5.5 0 0 1 26 11.5C26 17.5 16 24 16 24Z"
        fill="white"
      />
      {/* Plus mark — top-right of icon */}
      <rect x="23" y="4" width="5.5" height="2" rx="1" fill="#3b82f6" />
      <rect x="25" y="2" width="2" height="5.5" rx="1" fill="#3b82f6" />
    </svg>
  );
}
