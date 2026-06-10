export function Logo({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id="aitp-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path
        stroke="url(#aitp-logo-grad)"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      />
      <path stroke="url(#aitp-logo-grad)" d="m8.5 12 2.5 2.5L15.5 10" />
    </svg>
  );
}
