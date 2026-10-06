import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HubImage } from '../productionHub/HubImage';
import { workspaceMediaAttrs, type WorkspaceMediaProps } from './WorkspaceMediaSlot';

export function agoLabel(iso: string | null | undefined): string {
  if (!iso) return '—';
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (Number.isNaN(m)) return '—';
  if (m < 1) return 'JUST NOW';
  if (m < 60) return `${m}M AGO`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}H AGO` : `${Math.round(h / 24)}D AGO`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Section head: red pipe + title + optional hint + optional action. */
export function Sec({
  title,
  hint,
  to,
  actionLabel = 'VIEW ALL',
  children,
  className = '',
  testId,
}: {
  title: string;
  hint?: string;
  to?: string;
  actionLabel?: string;
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <section className={`pxa-sec ${className}`} data-testid={testId}>
      <header className="pxa-sec__head">
        <h2>
          <i aria-hidden />
          {title}
        </h2>
        {hint ? <small>{hint}</small> : null}
        {to ?
          <Link to={to} className="pxa-sec__all">
            {actionLabel} <span aria-hidden>→</span>
          </Link>
        : null}
      </header>
      {children}
    </section>
  );
}

/** Metric cell used by the live status bars. */
export function StatusCell({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: 'live' | 'alert';
}) {
  return <div className={`pxa-status__cell${tone ? ` is-${tone}` : ''}`}>{children}</div>;
}

export function Dot({ tone = 'green' }: { tone?: 'green' | 'red' | 'gray' }) {
  return <i className={`pxa-dot pxa-dot--${tone}`} aria-hidden />;
}

export function Donut({ percent, label, size = 96 }: { percent: number; label: string; size?: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="pxa-donut" style={{ width: size, height: size }} role="img" aria-label={`${label} ${percent}%`} data-testid="authority-donut">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r={r} className="pxa-donut__track" />
        <circle cx="50" cy="50" r={r} className="pxa-donut__bar" strokeDasharray={`${(c * percent) / 100} ${c}`} transform="rotate(-90 50 50)" />
      </svg>
      <span>
        <b>{percent}%</b>
        <small>{label}</small>
      </span>
    </div>
  );
}

export function Thumb({
  slotId,
  url,
  label,
  plate,
  className = '',
  slot,
  fit,
  focal,
}: {
  slotId?: string | null;
  url?: string | null;
  label?: string;
  /** Existing canonical plate (production-mobile pack) used where no hub slot exists. */
  plate?: string;
  className?: string;
} & WorkspaceMediaProps) {
  // Media slot contract: the slot (when declared) owns the box, the fit decides crop vs contain, focal
  // metadata positions the crop. Undeclared thumbs keep their composed geometry and the default cover fit.
  const media = workspaceMediaAttrs({ slot, fit, focal });
  if (plate)
    return <span className={`pxa-thumb ${className}`} {...media} style={{ ...media.style, backgroundImage: `url(${plate})` }} aria-hidden />;
  return (
    <span className={`pxa-thumb ${className}`} {...media}>
      <HubImage slotId={slotId ?? null} url={url ?? null} label={label ?? ''} />
    </span>
  );
}

export function Priority({ level }: { level: 'HIGH' | 'MED' }) {
  return <span className={`pxa-prio pxa-prio--${level.toLowerCase()}`}>{level}</span>;
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  testId,
  ariaLabel,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  testId?: string;
  ariaLabel: string;
}) {
  return (
    <div className="pxa-tabs" role="tablist" aria-label={ariaLabel} data-testid={testId}>
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === active} className={t.id === active ? 'is-active' : ''} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

