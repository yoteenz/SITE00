/** Abstract identity/network schematic — low-opacity SITE 00 red linework. */
export function IdntyControlCenterHeroArtwork({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`site00-idnty-control-hero__art ${className}`.trim()}
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M36 120L68 88L100 108L132 72L164 96"
        stroke="rgba(196, 30, 58, 0.22)"
        strokeWidth="0.85"
        vectorEffect="non-scaling-stroke"
      />
      <rect x="56" y="96" width="22" height="18" stroke="rgba(196, 30, 58, 0.18)" strokeWidth="0.75" transform="skewY(-12)" />
      <rect x="88" y="84" width="26" height="20" stroke="rgba(196, 30, 58, 0.24)" strokeWidth="0.75" transform="skewY(-12)" />
      <rect x="124" y="72" width="20" height="16" stroke="rgba(196, 30, 58, 0.18)" strokeWidth="0.75" transform="skewY(-12)" />
      <line x1="100" y1="108" x2="100" y2="48" stroke="rgba(196, 30, 58, 0.28)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="100" cy="44" r="4" fill="rgba(196, 30, 58, 0.4)" />
      <ellipse cx="100" cy="132" rx="72" ry="20" stroke="rgba(196, 30, 58, 0.1)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="28" y1="132" x2="172" y2="132" stroke="rgba(0,0,0,0.06)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="68" cy="88" r="2" fill="rgba(196, 30, 58, 0.3)" />
      <circle cx="132" cy="72" r="2" fill="rgba(196, 30, 58, 0.3)" />
      <path d="M148 52L160 44L172 56" stroke="rgba(196, 30, 58, 0.16)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <path d="M40 64L52 56L64 68" stroke="rgba(196, 30, 58, 0.14)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
