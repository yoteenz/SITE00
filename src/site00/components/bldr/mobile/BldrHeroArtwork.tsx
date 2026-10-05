import { site00OriginBldrPanelIconUrl } from '../../../config/origin-panel-icons';

type BldrHeroArtworkProps = {
  className?: string;
};

/** Large hero composition — technical linework with approved BLDR panel icon focal. */
export function BldrHeroArtwork({ className = '' }: BldrHeroArtworkProps) {
  return (
    <div className={`site00-bldr-mobile-hero__art ${className}`.trim()} aria-hidden="true">
      <svg
        className="site00-bldr-mobile-hero__linework"
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="90" rx="72" ry="28" stroke="rgba(0,0,0,0.06)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <ellipse cx="100" cy="90" rx="52" ry="20" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="20" x2="100" y2="160" stroke="rgba(0,0,0,0.08)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <line x1="28" y1="90" x2="172" y2="90" stroke="rgba(0,0,0,0.08)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <path d="M52 130L72 110L92 124L112 98L132 112L148 96" stroke="var(--site-red)" strokeWidth="0.85" vectorEffect="non-scaling-stroke" />
        <rect x="68" y="118" width="18" height="14" stroke="rgba(0,0,0,0.14)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" transform="skewY(-12)" />
        <rect x="96" y="108" width="20" height="16" stroke="rgba(0,0,0,0.14)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" transform="skewY(-12)" />
        <rect x="124" y="100" width="16" height="14" stroke="rgba(0,0,0,0.14)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" transform="skewY(-12)" />
        <line x1="72" y1="110" x2="100" y2="72" stroke="var(--site-red)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <line x1="112" y1="98" x2="100" y2="72" stroke="var(--site-red)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <line x1="132" y1="112" x2="100" y2="72" stroke="var(--site-red)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="72" r="5" fill="var(--site-red)" className="site00-bldr-mobile-hero__node" />
        <circle cx="72" cy="110" r="2" fill="rgba(0,0,0,0.35)" />
        <circle cx="112" cy="98" r="2" fill="rgba(0,0,0,0.35)" />
        <circle cx="132" cy="112" r="2" fill="rgba(0,0,0,0.35)" />
        <circle cx="148" cy="96" r="2" fill="rgba(0,0,0,0.35)" />
        <circle cx="52" cy="130" r="2" fill="rgba(0,0,0,0.35)" />
        <path d="M40 52H160M40 128H160" stroke="rgba(0,0,0,0.05)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      </svg>
      <img
        className="site00-bldr-mobile-hero__icon"
        src={site00OriginBldrPanelIconUrl()}
        alt=""
        width={88}
        height={88}
        decoding="async"
      />
    </div>
  );
}
