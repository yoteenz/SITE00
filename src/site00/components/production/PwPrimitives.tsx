/**
 * SITE 00 mobile production primitives — dark host surfaces, thin rules, red as system signal.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M20 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
export function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
export function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}
export function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
export function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}
export function IconDots() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}
export function IconGlyph({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** Screen title block: optional back link + parent label + right numeral, then title + strapline. */
export function PwScreenHead({
  backTo,
  backLabel,
  numeral,
  title,
  sub,
  action,
}: {
  backTo?: string;
  backLabel?: string;
  numeral?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <header className="pw-head">
      {backTo || numeral || action ?
        <div className="pw-head__bar">
          {backTo ?
            <Link to={backTo} className="pw-head__back">
              <IconBack />
              <span>{backLabel}</span>
            </Link>
          : <span />}
          {numeral ?
            <span className="pw-head__numeral">{numeral}</span>
          : action ?? null}
        </div>
      : null}
      <h1 className="pw-head__title">{title}</h1>
      {sub ? <p className="pw-head__sub">{sub}</p> : null}
    </header>
  );
}

export function PwTabs<T extends string>({
  tabs,
  active,
  onChange,
  badge,
}: {
  tabs: readonly { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  badge?: Partial<Record<T, number>>;
}) {
  return (
    <div className="pw-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className={`pw-tabs__tab${active === t.id ? ' is-active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {badge?.[t.id] ? <i className="pw-tabs__badge">{badge[t.id]}</i> : null}
        </button>
      ))}
    </div>
  );
}

export type PwChipTone = 'green' | 'amber' | 'orange' | 'red' | 'gray' | 'blue';

export function PwChip({ tone = 'gray', children }: { tone?: PwChipTone; children: ReactNode }) {
  return <span className={`pw-chip pw-chip--${tone}`}>{children}</span>;
}

export function PwButton({
  to,
  onClick,
  variant = 'light',
  children,
  disabled,
  testId,
}: {
  to?: string;
  onClick?: () => void;
  variant?: 'light' | 'ghost' | 'red';
  children: ReactNode;
  disabled?: boolean;
  testId?: string;
}) {
  const cls = `pw-btn pw-btn--${variant}`;
  if (to && !disabled) {
    return (
      <Link to={to} className={cls} data-testid={testId}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} data-testid={testId}>
      {children}
    </button>
  );
}

/** Image-led list row: [thumb | title + sub | chevron]. */
export function PwRow({
  to,
  onClick,
  thumb,
  thumbSide = 'left',
  icon,
  title,
  sub,
  chip,
  testId,
}: {
  to?: string;
  onClick?: () => void;
  thumb?: string | null;
  thumbSide?: 'left' | 'right';
  icon?: ReactNode;
  title: string;
  sub?: string;
  chip?: ReactNode;
  testId?: string;
}) {
  const body = (
    <>
      {thumb && thumbSide === 'left' ?
        <span className="pw-row__thumb" style={{ backgroundImage: `url(${thumb})` }} aria-hidden />
      : null}
      {icon ? <span className="pw-row__icon">{icon}</span> : null}
      <span className="pw-row__text">
        <span className="pw-row__title">{title}</span>
        {sub ? <span className="pw-row__sub">{sub}</span> : null}
      </span>
      {chip}
      {thumb && thumbSide === 'right' ?
        <span className="pw-row__thumb pw-row__thumb--right" style={{ backgroundImage: `url(${thumb})` }} aria-hidden>
          <IconChevron />
        </span>
      : (
        <span className="pw-row__chev">
          <IconChevron />
        </span>
      )}
    </>
  );
  const cls = `pw-row${thumbSide === 'right' ? ' pw-row--thumb-right' : ''}`;
  if (to) {
    return (
      <Link to={to} className={cls} data-testid={testId}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} data-testid={testId}>
      {body}
    </button>
  );
}

export function PwKV({ rows }: { rows: readonly { k: string; v: ReactNode }[] }) {
  return (
    <dl className="pw-kv">
      {rows.map((r) => (
        <div key={r.k} className="pw-kv__row">
          <dt>{r.k}</dt>
          <dd>{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Bottom sheet (project action menu etc.). */
export function PwSheet({
  open,
  title,
  onClose,
  children,
  testId,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
}) {
  if (!open) return null;
  return (
    <div className="pw-sheet" data-testid={testId}>
      <button type="button" className="pw-sheet__scrim" aria-label="Close" onClick={onClose} />
      <div className="pw-sheet__panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="pw-sheet__head">
          <h2>{title}</h2>
          <button type="button" className="pw-sheet__x" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
