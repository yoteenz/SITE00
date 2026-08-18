import { Link } from 'react-router-dom';
import type { CSSProperties, ReactNode } from 'react';

type GlassProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'button' | 'a';
  onClick?: () => void;
  href?: string;
  style?: CSSProperties;
  variant?: 'surface' | 'card' | 'panel' | 'float' | 'metric';
  pressable?: boolean;
  'aria-label'?: string;
};

const VARIANT_CLASS: Record<NonNullable<GlassProps['variant']>, string> = {
  surface: 'assts-glass--surface',
  card: 'assts-glass--card',
  panel: 'assts-glass--panel',
  float: 'assts-glass--float',
  metric: 'assts-glass--metric',
};

export function AsstsGlass({
  children,
  className = '',
  as = 'div',
  onClick,
  href,
  style,
  variant = 'surface',
  pressable,
  'aria-label': ariaLabel,
}: GlassProps) {
  const cls = ['assts-glass', VARIANT_CLASS[variant], pressable ? 'assts-glass--pressable' : '', className]
    .filter(Boolean)
    .join(' ');

  if (as === 'a' && href) {
    return (
      <a href={href} className={cls} style={style} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  if (as === 'button' || onClick) {
    return (
      <button type="button" className={cls} style={style} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </button>
    );
  }

  const Tag = as;
  return (
    <Tag className={cls} style={style} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function AsstsSectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="assts-section-header">
      <h2 className="assts-section-header__title">{title}</h2>
      {action ? <div className="assts-section-header__action">{action}</div> : null}
    </div>
  );
}

type MetricTileProps = {
  value: number | string;
  label: string;
  to?: string;
  active?: boolean;
  accent?: 'review' | 'default';
  onClick?: () => void;
};

export function AsstsMetricTile({ value, label, to, active, accent, onClick }: MetricTileProps) {
  const className = [
    'assts-glass',
    'assts-glass--metric',
    'assts-glass--pressable',
    active ? 'assts-metric--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <div className={`assts-metric__value ${accent === 'review' ? 'assts-metric__value--review' : ''}`}>{value}</div>
      <div className="assts-metric__label">{label}</div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

type ProgressProps = {
  value: number;
  max?: number;
  label?: string;
  showRing?: boolean;
  size?: 'sm' | 'md';
};

export function AsstsProgress({ value, max = 100, label, showRing, size = 'md' }: ProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  if (showRing) {
    const r = size === 'sm' ? 18 : 24;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return (
      <div className={`assts-progress-ring assts-progress-ring--${size}`} aria-label={label ?? `${pct}%`}>
        <svg viewBox="0 0 56 56" aria-hidden="true">
          <circle className="assts-progress-ring__track" cx="28" cy="28" r={r} />
          <circle
            className="assts-progress-ring__fill"
            cx="28"
            cy="28"
            r={r}
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="assts-progress-ring__text">{pct}%</span>
      </div>
    );
  }
  return (
    <div className="assts-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      {label ? <span className="assts-progress-bar__label">{label}</span> : null}
      <div className="assts-progress-bar__track">
        <div className="assts-progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="assts-progress-bar__pct">{pct}%</span>
    </div>
  );
}
