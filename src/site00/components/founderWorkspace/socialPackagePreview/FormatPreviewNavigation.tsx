/**
 * B5.8 — Horizontal format switcher (desktop tabs + mobile sticky rail).
 */

import type { SocialFormatFamily, SocialFormatPreviewModel } from './types.js';
import { formatStatusLabel } from './buildSocialPreviewModel.js';

type Props = {
  formats: SocialFormatPreviewModel[];
  active: SocialFormatFamily;
  onSelect: (family: SocialFormatFamily) => void;
  variant?: 'tabs' | 'rail' | 'tiles';
};

function FormatIcon({ family }: { family: SocialFormatFamily }) {
  const paths: Record<SocialFormatFamily, string> = {
    REEL: 'M4 4h16v16H4z M8 8l8 4-8 4z',
    CAROUSEL: 'M3 6h18v12H3z M7 10h4v4H7z M13 10h4v4h-4z',
    STORY: 'M6 2h12v20H6z M8 4h8v2H8z',
    TIKTOK: 'M7 3h10v18H7z M14 7v6l3 2',
    X: 'M4 4l16 16M20 4L4 20',
    HIGHLIGHT: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="site00-spp-fnav__icon">
      <path d={paths[family]} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function FormatPreviewNavigation({ formats, active, onSelect, variant = 'tabs' }: Props) {
  if (variant === 'tiles') {
    return (
      <div className="site00-spp-fnav site00-spp-fnav--tiles" role="list">
        {formats.map((f) => (
          <button
            key={f.formatFamily}
            type="button"
            role="listitem"
            className={`site00-spp-fnav__tile${active === f.formatFamily ? ' is-active' : ''}${f.complete ? ' is-complete' : ''}`}
            onClick={() => onSelect(f.formatFamily)}
          >
            <FormatIcon family={f.formatFamily} />
            <span className="site00-spp-fnav__label">{f.shortLabel}</span>
            <span className="site00-spp-fnav__status">{formatStatusLabel(f.status)}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <nav
      className={`site00-spp-fnav site00-spp-fnav--${variant}`}
      aria-label="Format preview"
    >
      {formats.map((f) => (
        <button
          key={f.formatFamily}
          type="button"
          className={`site00-spp-fnav__tab${active === f.formatFamily ? ' is-active' : ''}`}
          onClick={() => onSelect(f.formatFamily)}
          aria-current={active === f.formatFamily ? 'true' : undefined}
        >
          <FormatIcon family={f.formatFamily} />
          <span>{f.label}</span>
          {variant === 'tabs' && f.formatFamily === 'CAROUSEL' && f.slideCount > 0 && (
            <span className="site00-spp-fnav__meta">{f.slideCount} slides</span>
          )}
          <span className="site00-spp-fnav__chip">{formatStatusLabel(f.status)}</span>
        </button>
      ))}
    </nav>
  );
}
