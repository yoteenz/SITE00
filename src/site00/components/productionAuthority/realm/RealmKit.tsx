/**
 * Shared primitives for the EXPERIENCE and LIBRARY family screens. Presentation only: every value comes from a
 * RealmRecord (realmData.ts). Panels never grow the page — a panel body that outgrows its cell scrolls inside itself
 * (`data-scroll="internal"`).
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IaIcon, type IaIconName } from '../iaKit';
import type { RealmRecord, Tone } from './realmData';

export const pad2 = (n: number) => String(n).padStart(2, '0');

export function Dot({ tone }: { tone: Tone }) {
  return <i className={`rk-dot rk-dot--${tone}`} aria-hidden />;
}

export function Status({ r }: { r: Pick<RealmRecord, 'status' | 'tone'> }) {
  return (
    <span className={`rk-status rk-status--${r.tone}`} data-testid="realm-status">
      <Dot tone={r.tone} />
      {r.status}
    </span>
  );
}

/** Record media: mounted image, functional line glyph, colour token, or an honest empty frame. */
export function Media({ r, className = '' }: { r: Pick<RealmRecord, 'img' | 'glyph' | 'title'> & { metric?: string | null }; className?: string }) {
  if (r.img)
    return (
      <span className={`rk-media ${className}`}>
        <img src={r.img} alt="" loading="lazy" decoding="async" draggable={false} />
      </span>
    );
  if (r.glyph?.startsWith('swatch:')) return <span className={`rk-media rk-media--swatch ${className}`} style={{ background: r.glyph.slice(7) }} aria-hidden />;
  if (r.glyph)
    return (
      <span className={`rk-media rk-media--glyph ${className}`}>
        <IaIcon name={r.glyph as IaIconName} />
      </span>
    );
  if (r.metric && r.metric.length <= 3)
    return (
      <span className={`rk-media rk-media--num ${className}`} aria-hidden>
        {r.metric}
      </span>
    );
  return <span className={`rk-media rk-media--none ${className}`} aria-hidden />;
}

export function Panel({ title, extra, children, className = '', testId, scroll = false, area }: { title?: ReactNode; extra?: ReactNode; children: ReactNode; className?: string; testId?: string; scroll?: boolean; area?: string }) {
  return (
    <section className={`rk-panel ${className}`} data-testid={testId} style={area ? { gridArea: area } : undefined}>
      {title ?
        <header className="rk-panel__head">
          <h3>{title}</h3>
          {extra}
        </header>
      : null}
      <div className={`rk-panel__body${scroll ? ' rk-scroll' : ''}`} data-scroll={scroll ? 'internal' : undefined}>
        {children}
      </div>
    </section>
  );
}

export function ViewAll({ to, label = 'VIEW ALL' }: { to: string; label?: string }) {
  return (
    <Link to={to} className="rk-viewall">
      {label} <IaIcon name="next" />
    </Link>
  );
}

export function Kv({ rows, cols = 1, testId }: { rows: readonly (readonly [string, ReactNode])[]; cols?: 1 | 2 | 3 | 4; testId?: string }) {
  return (
    <dl className={`rk-kv rk-kv--${cols}`} data-testid={testId}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Stat({ value, label, icon, tone }: { value: ReactNode; label: string; icon?: IaIconName; tone?: Tone }) {
  return (
    <div className={`rk-stat${tone ? ` rk-stat--${tone}` : ''}`}>
      {icon ? <IaIcon name={icon} /> : null}
      <b>{value}</b>
      <small>{label}</small>
    </div>
  );
}

export function Empty({ title, body, testId = 'realm-empty' }: { title: string; body?: string; testId?: string }) {
  return (
    <div className="rk-empty" data-testid={testId} data-state="EMPTY">
      <b>{title}</b>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

/** Compact record row — thumb · title · type · one line · status · chevron. */
export function Row({ r, to, selected, testId = 'realm-row', aside }: { r: RealmRecord; to: string; selected?: boolean; testId?: string; aside?: ReactNode }) {
  return (
    <Link to={to} replace className="rk-row" aria-current={selected ? 'true' : undefined} data-selected={selected ? 'true' : undefined} data-testid={testId} data-record={r.id}>
      <Media r={r} className="rk-row__media" />
      <span className="rk-row__main">
        <b>{r.title}</b>
        <small>{r.kicker}</small>
        {r.sub ? <em>{r.sub}</em> : null}
      </span>
      <span className="rk-row__aside">{aside ?? <Status r={r} />}</span>
      <IaIcon name="next" className="rk-chev" />
    </Link>
  );
}

/** Image tile — used by rails and catalogue grids. */
export function Tile({ r, to, selected, testId = 'realm-tile' }: { r: RealmRecord; to: string; selected?: boolean; testId?: string }) {
  return (
    <Link to={to} replace className="rk-tile" aria-current={selected ? 'true' : undefined} data-selected={selected ? 'true' : undefined} data-testid={testId} data-record={r.id}>
      <Media r={r} className="rk-tile__media" />
      <span className="rk-tile__cap">
        <b>{r.title}</b>
        <small>{r.kicker}</small>
        <Status r={r} />
      </span>
    </Link>
  );
}

export function Btn({ to, children, variant = 'outline', testId, disabled, title }: { to?: string; children: ReactNode; variant?: 'red' | 'outline' | 'ghost'; testId?: string; disabled?: boolean; title?: string }) {
  if (!to || disabled)
    return (
      <button type="button" className={`rk-btn rk-btn--${variant}`} disabled data-testid={testId} title={title}>
        {children}
      </button>
    );
  return (
    <Link to={to} className={`rk-btn rk-btn--${variant}`} data-testid={testId}>
      {children}
    </Link>
  );
}

/** Lineage chain: ancestors → this → descendants (ids resolved through the realm lookup). */
export function Chain({ r, lookup, href, testId = 'realm-lineage' }: { r: RealmRecord; lookup: (id: string) => RealmRecord | null; href: (id: string) => string; testId?: string }) {
  const from = r.from.map((id) => lookup(id) ?? ({ id, title: id.toUpperCase(), kicker: 'SOURCE', img: null } as RealmRecord));
  const to = r.to.map((id) => lookup(id)).filter((x): x is RealmRecord => !!x);
  const node = (x: RealmRecord, role: string, self = false) => (
    <li key={`${role}-${x.id}`} className={self ? 'is-self' : undefined}>
      <Link to={href(x.id)} replace>
        <Media r={x} className="rk-chain__media" />
        <span>
          <b>{x.title}</b>
          <small>{role}</small>
        </span>
      </Link>
    </li>
  );
  return (
    <ol className="rk-chain" data-testid={testId}>
      {from.length ? from.map((x) => node(x, 'DERIVED FROM')) : <li className="rk-chain__origin">ORIGIN RECORD</li>}
      {node(r, r.status, true)}
      {to.length ? to.slice(0, 6).map((x) => node(x, x.status)) : <li className="rk-chain__origin">NO DERIVED RECORDS</li>}
    </ol>
  );
}
