import { site00EvolveIconUrl } from '../../../config/evolve-framework-icons';

/** Hero architectural property linework with approved evolve master icon focal. */
export function EvolveHeroArtwork({ className = '' }: { className?: string }) {
  return (
    <div className={`site00-evolve-mobile-hero__art ${className}`.trim()} aria-hidden="true">
      <svg className="site00-evolve-mobile-hero__linework" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="92" rx="70" ry="24" stroke="rgba(196, 30, 58, 0.1)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <path d="M52 118L68 92L84 108L100 78L116 104L132 88L148 112" stroke="rgba(196, 30, 58, 0.28)" strokeWidth="0.85" vectorEffect="non-scaling-stroke" />
        <rect x="72" y="104" width="18" height="14" stroke="rgba(0,0,0,0.12)" strokeWidth="0.75" transform="skewY(-10)" />
        <rect x="98" y="96" width="22" height="16" stroke="rgba(0,0,0,0.12)" strokeWidth="0.75" transform="skewY(-10)" />
        <rect x="126" y="88" width="16" height="14" stroke="rgba(0,0,0,0.12)" strokeWidth="0.75" transform="skewY(-10)" />
        <line x1="100" y1="78" x2="100" y2="52" stroke="rgba(196, 30, 58, 0.35)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="50" r="4" fill="rgba(196, 30, 58, 0.45)" />
        <line x1="40" y1="132" x2="160" y2="132" stroke="rgba(0,0,0,0.06)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <circle cx="68" cy="92" r="2" fill="rgba(0,0,0,0.25)" />
        <circle cx="132" cy="88" r="2" fill="rgba(0,0,0,0.25)" />
      </svg>
      <img
        className="site00-evolve-mobile-hero__icon"
        src={site00EvolveIconUrl('master')}
        alt=""
        width={80}
        height={80}
        decoding="async"
      />
    </div>
  );
}
