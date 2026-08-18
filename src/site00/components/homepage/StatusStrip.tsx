import { SITE00_STATUS_STRIP, SITE00_ORIGIN_COPY } from '../../config/status';
import { GeometricIcon } from '../icons/GeometricIcon';

const ICON_MAP = {
  pulse: 'pulse',
  globe: 'globe',
  crosshair: 'crosshair',
  cube: 'cube',
  shield: 'shield',
} as const;

export type StatusStripLayout = 'desktop' | 'mobile';

type StatusStripProps = {
  layout: StatusStripLayout;
};

function StatusStripCells() {
  return SITE00_STATUS_STRIP.map((item) => (
    <div key={item.id} className="site00-status-strip__cell">
      <span className="site00-label">{item.label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {item.id === 'status' ? <span className="site00-diamond" aria-hidden="true" /> : null}
        <GeometricIcon variant={ICON_MAP[item.icon]} size="sm" />
        <span className="site00-status-value">{item.value}</span>
        {item.id === 'system' ? (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--site-success)',
              marginLeft: 4,
            }}
            aria-label="Operational"
          />
        ) : null}
      </div>
    </div>
  ));
}

function StatusStripGuidance() {
  return (
    <button type="button" className="site00-status-strip__guidance" aria-label={SITE00_ORIGIN_COPY.guidance.title}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #888, #ccc)',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      <div>
        <div className="site00-label" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {SITE00_ORIGIN_COPY.guidance.label}
        </div>
        <div className="site00-status-value" style={{ color: '#fff' }}>
          {SITE00_ORIGIN_COPY.guidance.title}
        </div>
      </div>
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true" style={{ marginLeft: 'auto' }}>
        <path d="M0 5H12M12 5L8 1M12 5L8 9" stroke="#fff" strokeWidth="1" />
      </svg>
    </button>
  );
}

/** Origin homepage status strip — single layout variant (no duplicate DOM). */
export function StatusStrip({ layout }: StatusStripProps) {
  if (layout === 'mobile') {
    return (
      <div
        className="site00-status-strip site00-status-strip--layout-mobile"
        role="region"
        aria-label="System status"
      >
        <div className="site00-status-strip__metrics" role="group" aria-label="System metrics">
          <StatusStripCells />
        </div>
        <StatusStripGuidance />
      </div>
    );
  }

  return (
    <div
      className="site00-status-strip site00-status-strip--layout-desktop"
      role="region"
      aria-label="System status"
    >
      <StatusStripCells />
      <StatusStripGuidance />
    </div>
  );
}
