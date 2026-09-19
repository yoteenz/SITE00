import type { ReactNode } from 'react';
import type { EvolvePricingPlanIconId } from '../../../../../shared/site00-evolve-pricing/types.js';

const STROKE = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.1,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function RedDot({ cx, cy, r = 2.2 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="var(--site-red, #e00000)" stroke="none" />;
}

type EvolvePricingIconProps = {
  id: EvolvePricingPlanIconId;
  size?: number;
  className?: string;
};

export function EvolvePricingIcon({ id, size = 48, className = '' }: EvolvePricingIconProps) {
  const icons: Record<EvolvePricingPlanIconId, ReactNode> = {
    solo: (
      <>
        <rect {...STROKE} x="5" y="7" width="7" height="7" />
        <rect {...STROKE} x="12" y="12" width="7" height="7" opacity="0.55" />
        <RedDot cx={8.5} cy={10.5} />
      </>
    ),
    studio: (
      <>
        <path {...STROKE} d="M6 16V11l3-2 3 2v5M12 16V9l3-2 3 2v7" />
        <RedDot cx={12} cy={7} />
      </>
    ),
    pro: (
      <>
        <circle {...STROKE} cx="12" cy="12" r="7" />
        <ellipse {...STROKE} cx="12" cy="12" rx="7" ry="3" />
        <path {...STROKE} d="M5 12h14" />
        <RedDot cx={12} cy={12} />
      </>
    ),
    'project-pass': (
      <>
        <rect {...STROKE} x="6" y="5" width="12" height="14" rx="1" />
        <path {...STROKE} d="M9 9h6M9 12h6M9 15h4" />
        <RedDot cx={15} cy={8} />
      </>
    ),
    'agency-enterprise': (
      <>
        <path {...STROKE} d="M12 4l4 2v4l-4 2-4-2V6l4-2z" />
        <path {...STROKE} d="M8 14l4 2 4-2M8 18l4 2 4-2" />
        <RedDot cx={12} cy={8} />
      </>
    ),
    'discovery-sprint': (
      <>
        <rect {...STROKE} x="5" y="7" width="7" height="7" />
        <rect {...STROKE} x="12" y="12" width="7" height="7" />
        <RedDot cx={8.5} cy={10.5} />
      </>
    ),
    'directed-build': (
      <>
        <path {...STROKE} d="M6 17V10l3-2 3 2v7M12 17V8l3-2 3 2v9" />
        <RedDot cx={12} cy={6} />
      </>
    ),
    'growth-partner': (
      <>
        <circle {...STROKE} cx="12" cy="12" r="7" />
        <path {...STROKE} d="M5 12c2-4 4-6 7-6s5 2 7 6" />
        <RedDot cx={12} cy={12} />
      </>
    ),
    'marketing-retainer': (
      <>
        <rect {...STROKE} x="6" y="5" width="12" height="14" rx="1" />
        <path {...STROKE} d="M9 9h6M9 12h6" />
        <RedDot cx={15} cy={8} />
      </>
    ),
    'custom-agency': (
      <>
        <path {...STROKE} d="M12 4l3.5 2v4L12 12l-3.5-2V6L12 4z" />
        <path {...STROKE} d="M8.5 14l3.5 2 3.5-2M8.5 18l3.5 2 3.5-2" />
        <RedDot cx={12} cy={8} />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`site00-evolve-pricing-icon ${className}`.trim()}
      aria-hidden="true"
    >
      {icons[id]}
    </svg>
  );
}

export function EvolvePricingHeroDiagram({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" className="site00-evolve-pricing-hero-diagram" aria-hidden="true">
      <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <circle cx="36" cy="36" r="16" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <path d="M8 36h56M36 8v56" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
      <circle cx="36" cy="36" r="3" fill="var(--site-red, #e00000)" />
      <circle cx="52" cy="24" r="2.5" fill="var(--site-red, #e00000)" />
      <circle cx="20" cy="48" r="2.5" fill="var(--site-red, #e00000)" />
    </svg>
  );
}

export function EvolvePricingModePersonIcon({ directed = false, size = 24 }: { directed?: boolean; size?: number }) {
  if (directed) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="8" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="16" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <path d="M5 18c0-2 2-3 3-3h8c1 0 3 1 3 3" fill="none" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M6 20c0-3 2.5-5 6-5s6 2 6 5" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
