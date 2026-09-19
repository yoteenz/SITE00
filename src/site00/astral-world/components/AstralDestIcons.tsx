/** Bespoke Astréa destination icons — traced from reference design language */

type IconProps = { size?: number; className?: string };

export function TarotSuiteIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="24" cy="22" rx="5" ry="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="22" r="2" fill="currentColor" />
    </svg>
  );
}

export function AstralMallIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="10" y="16" width="28" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 20h28M18 16V12h12v4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="26" width="6" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="26" y="26" width="6" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function CoffeeShopIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M14 18h16v14a4 4 0 01-4 4H18a4 4 0 01-4-4V18z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M30 22h4a3 3 0 010 6h-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 14c0-2 2-4 4-4h8c2 0 4 2 4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function NavIconHome({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function NavIconWorld({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function NavIconJournal({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 4h10a2 2 0 012 2v14H8a2 2 0 01-2-2V4z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4v16M12 8h4M12 12h4" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function NavIconFriends({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 19c0-2.5 2-4.5 5-4.5s5 2 5 4.5M13 19c0-1.8 1.5-3.2 3.5-3.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function NavIconProfile({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function NavIconReaders({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
