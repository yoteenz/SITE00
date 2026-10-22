/**
 * Digital Foundation board primitives (boards 10–15C). Presentation only — callers pass real contract data.
 * Static labels are uppercase by CSS; wrap case-sensitive values (emails, domains, DNS records) in `DfMachine`.
 */
import { useId, type ReactNode } from 'react';
import { DfIcon, type DfIconName } from './icons';

export type DfPillTone = 'ok' | 'alert' | 'neutral' | 'info' | 'muted';

export function DfPill({ tone = 'neutral', children }: { tone?: DfPillTone; children: ReactNode }) {
  return <span className={`df-pill df-pill--${tone}`}>{children}</span>;
}

/** Case-sensitive user data or machine value (email, domain, DNS record). Never uppercased. */
export function DfMachine({ children, block }: { children: ReactNode; block?: boolean }) {
  return <span className={`df-machine${block ? ' df-machine--block' : ''}`}>{children}</span>;
}

export function DfPanel({
  label,
  aside,
  children,
  className,
  labelId,
}: {
  label?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  labelId?: string;
}) {
  const autoId = useId();
  const id = labelId ?? `df-panel-${autoId.replace(/:/g, '')}`;
  return (
    <section className={['df-panel', className].filter(Boolean).join(' ')} aria-labelledby={label ? id : undefined}>
      {label && (
        <div className="df-panel__head">
          <h2 className="df-panel__label" id={id}>
            {label}
          </h2>
          {aside && <span className="df-panel__aside">{aside}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export function DfBoardList({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul className="df-blist" aria-label={label}>
      {children}
    </ul>
  );
}

export function DfBoardRow({
  icon,
  iconTone,
  title,
  sub,
  meta,
  aside,
  onOpen,
  tone,
  rowId,
  selected,
}: {
  icon?: DfIconName;
  iconTone?: 'danger' | 'success' | 'muted';
  title: ReactNode;
  sub?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  onOpen?: () => void;
  tone?: 'alert';
  rowId?: string;
  /** Choice rows (build path): exposes the pressed state instead of navigation. */
  selected?: boolean;
}) {
  const inner = (
    <>
      {icon && <DfIcon name={icon} className="df-brow__icon" tone={iconTone} />}
      <span className="df-brow__text">
        <span className="df-brow__title">{title}</span>
        {sub && <span className="df-brow__sub">{sub}</span>}
        {meta && <span className="df-brow__meta">{meta}</span>}
      </span>
      {aside && <span className="df-brow__aside">{aside}</span>}
      {onOpen && <DfIcon name="chevron" className="df-brow__chev" />}
    </>
  );
  return (
    <li
      className={`df-brow${tone ? ` df-brow--${tone}` : ''}${icon ? '' : ' df-brow--noicon'}${selected ? ' df-brow--selected' : ''}`}
      data-row-id={rowId}
    >
      {onOpen ? (
        <button type="button" className="df-brow__main" onClick={onOpen} aria-pressed={selected === undefined ? undefined : selected}>
          {inner}
        </button>
      ) : (
        <div className="df-brow__main">{inner}</div>
      )}
    </li>
  );
}

export type DfKvRow = { label: string; value: ReactNode; tone?: 'ok' | 'alert'; icon?: DfIconName };

export function DfKv({ rows }: { rows: DfKvRow[] }) {
  return (
    <dl className="df-kv">
      {rows.map((r) => (
        <div className="df-kv__row" key={r.label}>
          <dt className="df-kv__k">
            {r.icon && <DfIcon name={r.icon} className="df-kv__icon" />}
            {r.label}
          </dt>
          <dd className={`df-kv__v${r.tone ? ` df-kv__v--${r.tone}` : ''}`}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type DfTab<T extends string> = { id: T; label: string; count?: number };

export function DfTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: DfTab<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div className="df-tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={`df-tabs__tab${value === t.id ? ' df-tabs__tab--on' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count !== undefined && <span className="df-tabs__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export type DfStat = { label: string; value: ReactNode; tone?: 'red' | 'ok' | 'info' | 'alert' };

export function DfStatGrid({ items, wide }: { items: DfStat[]; wide?: boolean }) {
  return (
    <ul className={`df-stats${wide ? ' df-stats--wide' : ''}`}>
      {items.map((s) => (
        <li key={s.label} className={`df-stats__cell${s.tone ? ` df-stats__cell--${s.tone}` : ''}`}>
          <span className="df-stats__value">{s.value}</span>
          <span className="df-stats__label">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

export type DfStripCell = { icon?: DfIconName; label: string; value: ReactNode; sub?: ReactNode };

export function DfStrip({ cells }: { cells: DfStripCell[] }) {
  return (
    <ul className="df-strip" style={{ ['--df-strip-cols' as string]: cells.length }}>
      {cells.map((c) => (
        <li key={c.label} className="df-strip__cell">
          {c.icon && <DfIcon name={c.icon} className="df-strip__icon" />}
          <span className="df-strip__text">
            <span className="df-strip__label">{c.label}</span>
            <span className="df-strip__value">{c.value}</span>
            {c.sub && <span className="df-strip__sub">{c.sub}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DfMeter({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="df-meter">
      <DfIcon name="folder" className="df-meter__icon" />
      <div className="df-meter__text">
        <span className="df-meter__label">{label}</span>
        <span className="df-meter__count">
          {done} / {total}
        </span>
      </div>
      <div
        className="df-meter__bar"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <span className="df-meter__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="df-meter__pct">{pct}%</span>
    </div>
  );
}

export function DfBackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="df-backlink" onClick={onClick}>
      <DfIcon name="back" className="df-backlink__icon" />
      <span>{label}</span>
    </button>
  );
}

/** Identity card: large icon, eyebrow, title, sub, optional status on the right (client, record, task). */
export function DfIdCard({
  icon,
  eyebrow,
  title,
  sub,
  aside,
}: {
  icon: DfIconName;
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="df-idcard">
      <DfIcon name={icon} className="df-idcard__icon" />
      <div className="df-idcard__text">
        {eyebrow && <span className="df-idcard__eyebrow">{eyebrow}</span>}
        <span className="df-idcard__title">{title}</span>
        {sub && <span className="df-idcard__sub">{sub}</span>}
      </div>
      {aside && <span className="df-idcard__aside">{aside}</span>}
    </div>
  );
}

/** Red decision line under an action area ("1 ITEM REQUIRES YOUR DECISION"). */
export function DfDecisionLine({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="df-decision" role="status">
      <DfIcon name="alert" className="df-decision__icon" />
      <div className="df-decision__text">
        <span className="df-decision__title">{title}</span>
        {sub && <span className="df-decision__sub">{sub}</span>}
      </div>
    </div>
  );
}

/** Side-by-side primary + secondary decision buttons (APPROVE / REQUEST CHANGE). */
export function DfDuo({ children }: { children: ReactNode }) {
  return <div className="df-duo">{children}</div>;
}

/** Short note under a control explaining why it is unavailable (missing contract, review mode). */
export function DfHonestNote({ children }: { children: ReactNode }) {
  return <p className="df-honest">{children}</p>;
}
