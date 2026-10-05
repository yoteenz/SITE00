import type { ReactNode } from 'react';
import type { EvolveServiceIconId } from '../../../../../shared/site00-evolve-service/types.js';

const STROKE = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

type EvolveServiceIconProps = {
  id: EvolveServiceIconId;
  title?: string;
  size?: number;
  className?: string;
};

function RedDot({ cx, cy, r = 2.5 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="var(--site-red, #e00000)" stroke="none" />;
}

export function EvolveServiceIcon({ id, title, size = 48, className = '' }: EvolveServiceIconProps) {
  const label = title ?? id.replace(/-/g, ' ').toUpperCase();

  const icons: Record<EvolveServiceIconId, ReactNode> = {
    'existing-property': (
      <>
        <rect {...STROKE} x="5" y="8" width="8" height="8" />
        <rect {...STROKE} x="15" y="8" width="8" height="8" />
        <rect {...STROKE} x="10" y="16" width="8" height="8" />
        <RedDot cx={19} cy={10} />
      </>
    ),
    assessment: (
      <>
        <circle {...STROKE} cx="12" cy="12" r="8" />
        <path {...STROKE} d="M12 4v16M4 12h16" />
        <RedDot cx={12} cy={12} />
      </>
    ),
    'evolution-path': (
      <>
        <circle {...STROKE} cx="12" cy="12" r="8" />
        <path {...STROKE} d="M8 12h8M14 9l3 3-3 3" />
      </>
    ),
    refine: (
      <>
        <rect {...STROKE} x="6" y="6" width="8" height="8" />
        <rect {...STROKE} x="14" y="14" width="8" height="8" opacity="0.55" />
        <RedDot cx={10} cy={10} />
      </>
    ),
    install: (
      <>
        <path {...STROKE} d="M6 18V10l6-4 6 4v8" />
        <path {...STROKE} d="M9 14h6v4H9z" />
        <RedDot cx={12} cy={8} />
      </>
    ),
    transform: (
      <>
        <path {...STROKE} d="M12 4l6 4-6 4-6-4 6-4z" />
        <path {...STROKE} d="M6 14l6 4 6-4" />
        <RedDot cx={12} cy={12} />
      </>
    ),
    property: (
      <>
        <rect {...STROKE} x="5" y="7" width="14" height="12" rx="1" />
        <RedDot cx={8} cy={10} />
      </>
    ),
    diagnose: (
      <>
        <circle {...STROKE} cx="10" cy="10" r="5" />
        <path {...STROKE} d="M14 14l5 5" />
        <path {...STROKE} d="M8 10h4" />
      </>
    ),
    'system-plan': (
      <>
        <path {...STROKE} d="M5 8h14M5 12h14M5 16h10" />
        <RedDot cx={18} cy={16} />
      </>
    ),
    build: (
      <>
        <path {...STROKE} d="M6 18l3-10 3 4 4-8 3 14H6z" />
      </>
    ),
    'launch-measure': (
      <>
        <circle {...STROKE} cx="12" cy="12" r="7" />
        <circle {...STROKE} cx="12" cy="12" r="2" />
        <RedDot cx={12} cy={12} />
      </>
    ),
    experience: (
      <>
        <rect {...STROKE} x="4" y="6" width="16" height="11" rx="1" />
        <path {...STROKE} d="M8 19h8" />
      </>
    ),
    commerce: (
      <>
        <path {...STROKE} d="M6 8h12l-1 10H7L6 8z" />
        <path {...STROKE} d="M9 8V6a3 3 0 016 0v2" />
      </>
    ),
    operations: (
      <>
        <circle {...STROKE} cx="12" cy="12" r="3" />
        <path {...STROKE} d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </>
    ),
    intelligence: (
      <>
        <path {...STROKE} d="M12 4a5 5 0 00-5 5c0 3 2 5 5 9 3-4 5-6 5-9a5 5 0 00-5-5z" />
        <RedDot cx={12} cy={9} />
      </>
    ),
    connections: (
      <>
        <circle {...STROKE} cx="6" cy="12" r="2.5" />
        <circle {...STROKE} cx="18" cy="6" r="2.5" />
        <circle {...STROKE} cx="18" cy="18" r="2.5" />
        <path {...STROKE} d="M8.2 11l7-3.5M8.2 13l7 3.5" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`site00-evolve-service-icon ${className}`.trim()}
      role="img"
      aria-label={`${label} icon`}
    >
      {icons[id]}
    </svg>
  );
}

/** Guard: old raster evolve path icons must not be used on the public service page. */
export const EVOLVE_SERVICE_ICON_SYSTEM = 'evolve-service-svg-v1' as const;
