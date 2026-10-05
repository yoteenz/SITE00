/**
 * EXPRESSION family shell + primitives (P0.STUDIOOS.PRODUCTION.EXPRESSION.RESPONSIVE-AUTHORITY-CONVERGENCE.OPUS1).
 *
 * One shell for all 40 Expression routes, mounted inside the shared ProductionAuthorityFrame (host header + bottom
 * nav with EXPRESSION active). Anatomy, in authority order:
 *   hero band (breadcrumb · EXPRESSION · FAMILY / ROUTE · tagline · project side list)
 *   → shared live status strip → family tabs → panel grid (fills the remaining height; never scrolls the page).
 *
 * The panel grid is a 12-column (desktop / tablet) or 6-column (mobile) grid whose rows are fractions of the
 * remaining height. Panels declare their span per viewport; a panel whose content exceeds its cell scrolls inside
 * its own body (`data-scroll="internal"`), so every route fits one viewport and nothing is silently clipped.
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HubImage } from '../../productionHub/HubImage';
import { ExpressionMediaInspector, type ExpressionMediaSlide } from './ExpressionMediaInspector';
import { AUTHORITY_ASSETS } from '../authorityAssets';
import { LiveStatusBar } from '../HubBody';
import { useProductionAuthorityData } from '../ProductionAuthorityData';
import { EXPRESSION_FAMILIES, expressionHref, familyTabs, type ExpressionFamilyId, type ResolvedExpressionRoute } from './expressionRoutes';

/* ── shell ─────────────────────────────────────────────────────────────────────────────────────────────── */

export function ExpressionFamilyShell({
  resolved,
  slug,
  entry,
  legacyTestId,
  detailName,
  children,
}: {
  resolved: ResolvedExpressionRoute;
  slug: string;
  entry: string;
  /** Pre-existing sub-screen test id kept on the body (function preservation). */
  legacyTestId?: string;
  /** Display name of the record a detail route shows (role / actor / character / sequence / approval). */
  detailName?: string;
  children: ReactNode;
}) {
  const { family, route, param } = resolved;
  const data = useProductionAuthorityData();
  const project = (data?.project.name ?? slug).toUpperCase();
  const tabs = familyTabs(family.id);
  const activeTab = route.kind === 'detail' ? route.parent : route.id;
  const routeLabel = route.kind === 'root' ? null : route.label;
  const href = (f: ExpressionFamilyId, id = 'root') => expressionHref(slug, f, id, undefined, entry);
  const parentTab = route.kind === 'detail' && route.parent && route.parent !== 'root' ? tabs.find((t) => t.id === route.parent) : null;
  const mediaHeavyFamily = new Set<ExpressionFamilyId>(['casting', 'look', 'performance', 'sets', 'storyboard', 'review', 'format', 'package', 'campaign']);
  const mediaFocus = route.kind !== 'root' || mediaHeavyFamily.has(family.id);

  return (
    <div
      className={`exf${mediaFocus ? ' exf--media-focus' : ''}`}
      data-testid="expression-family"
      data-media-focus={mediaFocus ? 'true' : undefined}
      data-family={family.id}
      data-route={route.id}
      data-kind={route.kind}
      data-authority={route.authority}
      data-entry={entry}
    >
      <header className="pxa-hero exf-hero" data-testid="expression-family-hero">
        <span className="pxa-hero__bg pxa-hero__bg--plate" style={{ backgroundImage: `url(${AUTHORITY_ASSETS.expressionStage})` }} aria-hidden />
        <span className="pxa-hero__wash" aria-hidden />
        <div className="pxa-hero__copy">
          <i aria-hidden />
          <nav className="exf-crumbs" aria-label="Breadcrumb" data-testid="expression-breadcrumb">
            <Link to={`/production/${slug}/expression${entry ? `?entry=${entry}` : ''}`}>EXPRESSION</Link>
            <span aria-hidden>/</span>
            <Link to={href(family.id)} aria-current={route.kind === 'root' ? 'page' : undefined}>
              {family.title}
            </Link>
            {parentTab ?
              <>
                <span aria-hidden>/</span>
                <Link to={href(family.id, parentTab.id)}>{parentTab.label}</Link>
              </>
            : null}
            {routeLabel ?
              <>
                <span aria-hidden>/</span>
                <b aria-current="page">{route.kind === 'detail' && (detailName ?? param) ? `${routeLabel} · ${detailName ?? param}` : routeLabel}</b>
              </>
            : null}
          </nav>
          <h1>EXPRESSION</h1>
          <h2 className="exf-hero__family">
            {family.title}
            {route.kind === 'detail' && detailName ? ` / ${detailName}` : routeLabel ? ` / ${routeLabel}` : ''}
          </h2>
          <p>{family.tagline}</p>
        </div>
        <ul className="pxa-hero__side" aria-hidden>
          <li>
            <b>{project}</b>
          </li>
          {(tabs.length ? tabs.map((t) => t.label) : EXPRESSION_FAMILIES.filter((f) => f.downstream).map((f) => f.title)).slice(0, 7).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </header>
      <LiveStatusBar expressionMode compact={mediaFocus} context={{ title: 'EXPRESSION', sub: `${family.title}${routeLabel ? ` / ${routeLabel}` : ''}` }} />
      {family.downstream ?
        <nav className="exf-tabs exf-tabs--flow" aria-label="Downstream flow" data-testid="expression-family-tabs" data-flow="format-package-campaign" data-scroll="internal-x">
          {EXPRESSION_FAMILIES.filter((f) => f.downstream).map((f, i) => (
            <Link key={f.id} to={href(f.id)} className={f.id === family.id ? 'is-active' : undefined} aria-current={f.id === family.id ? 'page' : undefined} data-testid={`expression-tab-${f.id}`}>
              <em>{f.n}</em> {f.title}
              {i < 2 ? <span aria-hidden> →</span> : null}
            </Link>
          ))}
        </nav>
      : tabs.length ?
        <nav className="exf-tabs" aria-label={`${family.title} sections`} data-testid="expression-family-tabs" data-scroll="internal-x">
          {tabs.map((t) => (
            <Link key={t.id} to={href(family.id, t.id)} className={t.id === activeTab ? 'is-active' : undefined} aria-current={t.id === activeTab ? 'page' : undefined} data-testid={`expression-tab-${t.id}`}>
              {t.label}
            </Link>
          ))}
        </nav>
      : null}
      <div className="exf-stage" data-testid={legacyTestId}>
        {children}
      </div>
    </div>
  );
}

/* ── grid + panels ─────────────────────────────────────────────────────────────────────────────────────── */

type Span = readonly [cols: number, rows: number];
export type At = { d?: Span; t?: Span; m?: Span };

const fr = (s: string) =>
  s
    .trim()
    .split(/\s+/)
    .map((x) => (x.endsWith('fr') ? `minmax(0, ${x})` : x))
    .join(' ');

/** Panel grid. `rows` = row track sizes per viewport family (fractions of the remaining height). */
export function Grid({ rows, children, testId }: { rows: { d: string; t: string; m: string }; children: ReactNode; testId?: string }) {
  const style = { '--exf-rows-d': fr(rows.d), '--exf-rows-t': fr(rows.t), '--exf-rows-m': fr(rows.m) } as CSSProperties;
  return (
    <div className="exf-grid" style={style} data-testid={testId ?? 'expression-grid'}>
      {children}
    </div>
  );
}

export function Panel({
  title,
  meta,
  to,
  toLabel = 'VIEW ALL',
  at,
  hide,
  testId,
  className = '',
  layout,
  children,
}: {
  title: string;
  meta?: ReactNode;
  to?: string;
  toLabel?: string;
  at: At;
  /** Viewport families where this panel is not composed (space it frees goes to the others). */
  hide?: string;
  testId?: string;
  className?: string;
  /** Media-primary panel: image fills the pane; metadata scrolls inside the body if needed. */
  layout?: 'media' | 'rail' | 'compact';
  children: ReactNode;
}) {
  const d = at.d ?? [12, 1];
  const t = at.t ?? d;
  const m = at.m ?? [6, 1];
  const style = { '--dc': d[0], '--dr': d[1], '--tc': t[0], '--tr': t[1], '--mc': m[0], '--mr': m[1] } as CSSProperties;
  return (
    <section className={`exf-panel${layout ? ` exf-panel--${layout}` : ''} ${className}`.trim()} style={style} data-hide={hide} data-testid={testId} data-layout={layout}>
      <header className="exf-panel__head">
        <h3>
          <i aria-hidden />
          {title}
        </h3>
        {meta != null ? <small>{meta}</small> : null}
        {to ?
          <Link to={to} className="exf-panel__all">
            {toLabel} <span aria-hidden>→</span>
          </Link>
        : null}
      </header>
      {/* Every panel body is a bounded pane: content that exceeds the panel scrolls inside it (never the page,
          never silently clipped). Which panes actually scroll per route / viewport is recorded in NO_SCROLL_MATRIX. */}
      <div className="exf-panel__body" data-scroll="internal">
        {children}
      </div>
    </section>
  );
}

/* ── content primitives ────────────────────────────────────────────────────────────────────────────────── */

export type Tone = 'red' | 'green' | 'amber' | 'gray' | 'ink';

export function Chip({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`exf-chip exf-chip--${tone}`}>{children}</span>;
}

export function Kv({ rows, testId, cols }: { rows: readonly (readonly [string, ReactNode])[]; testId?: string; cols?: 1 | 2 }) {
  return (
    <dl className="exf-kv" data-cols={cols ?? 1} data-testid={testId}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Img({ url, label, slotId = null, className = '' }: { url: string | null; label: string; slotId?: string | null; className?: string }) {
  return (
    <span className={`exf-img ${className}`}>
      <HubImage slotId={slotId} url={url} label={label} />
    </span>
  );
}

export type MediaFit = 'contain' | 'cover';

/** Primary creative asset — tappable to inspect; fills available panel space when paired with `exf-media-primary`. */
export function MediaImg({
  url,
  label,
  slotId = null,
  fit = 'contain',
  inspect = true,
  gallery,
  galleryIndex = 0,
  title,
  className = '',
  testId = 'expression-media-primary',
}: {
  url: string | null;
  label: string;
  slotId?: string | null;
  fit?: MediaFit;
  inspect?: boolean;
  gallery?: readonly ExpressionMediaSlide[];
  galleryIndex?: number;
  title?: string;
  className?: string;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(galleryIndex);
  const slides = useMemo(() => {
    if (gallery?.length) return gallery.filter((s) => !!s.url);
    return url ? [{ url, label }] : [];
  }, [gallery, label, url]);
  const canInspect = inspect && slides.length > 0 && !!url;
  const openInspect = () => {
    if (!canInspect) return;
    setIdx(Math.min(Math.max(0, galleryIndex), slides.length - 1));
    setOpen(true);
  };
  return (
    <>
      <button
        type="button"
        className={`exf-media-primary exf-media-primary--${fit} ${className}`.trim()}
        onClick={openInspect}
        disabled={!canInspect}
        aria-label={canInspect ? `Inspect ${label}` : label}
        data-testid={testId}
        data-inspectable={canInspect ? 'true' : 'false'}
      >
        <span className="exf-img exf-media-primary__img">
          <HubImage slotId={slotId} url={url} label={label} />
        </span>
        {canInspect ? <span className="exf-media-primary__hint">TAP TO INSPECT</span> : null}
      </button>
      {open && slides.length ?
        <ExpressionMediaInspector
          slides={slides}
          index={idx}
          title={title ?? label}
          onClose={() => setOpen(false)}
          onStep={(d) => setIdx((i) => Math.min(Math.max(0, i + d), slides.length - 1))}
        />
      : null}
    </>
  );
}

/** Initials tile for a record with no image (actor without a headshot, character without a portrait). */
export function Mono({ text, className = '' }: { text: string; className?: string }) {
  const ini = text
    .split(/[\s/·-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span className={`exf-mono ${className}`} aria-hidden>
      {ini}
    </span>
  );
}

/** Honest empty / unmounted state — never placeholder data. */
export function Empty({ title, body, state = 'EMPTY', testId }: { title: string; body?: string; state?: 'EMPTY' | 'UNMOUNTED' | 'BLOCKED'; testId?: string }) {
  return (
    <div className="exf-empty" data-state={state} data-testid={testId ?? 'expression-empty'}>
      <b>{title}</b>
      {body ? <span>{body}</span> : null}
      <em>{state}</em>
    </div>
  );
}

export function Meter({ value, max = 100, tone = 'red', label }: { value: number; max?: number; tone?: Tone; label?: string }) {
  const pct = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  return (
    <span className={`exf-meter exf-meter--${tone}`} role="img" aria-label={label ? `${label} ${value} of ${max}` : `${value} of ${max}`}>
      <i style={{ width: `${pct}%` }} />
    </span>
  );
}

/** Vertical bars, one per item (values are canonical counts / readings, labelled by the caller). */
export function Bars({ values, labels, max, tones, testId }: { values: readonly number[]; labels: readonly string[]; max?: number; tones?: readonly Tone[]; testId?: string }) {
  const top = max ?? Math.max(1, ...values);
  return (
    <div className="exf-bars" data-testid={testId}>
      {values.map((v, i) => (
        <span key={labels[i] ?? i} className={`exf-bars__col exf-bars__col--${tones?.[i] ?? 'red'}`}>
          <i style={{ height: `${Math.max(4, (v / top) * 100)}%` }} title={`${labels[i]}: ${v}`} />
          <small>{labels[i]}</small>
        </span>
      ))}
    </div>
  );
}

/** Momentum / tension curve: one point per beat (y = canonical tension stage reading). Strokes are SVG; points and
 *  labels are an HTML overlay so they never stretch with the panel's aspect ratio. */
export function Curve({ points, labels, marks, testId }: { points: readonly number[]; labels: readonly string[]; marks?: readonly number[]; testId?: string }) {
  const n = Math.max(points.length, 2);
  const x = (i: number) => 2 + (i * 96) / (n - 1);
  const y = (v: number) => 92 - v * 0.84;
  const line = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(2)},96 L${x(0).toFixed(2)},96 Z`;
  return (
    <div className="exf-curve" role="img" aria-label="Tension by beat" data-testid={testId}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {[25, 50, 75, 100].map((g) => (
          <line key={g} x1={0} x2={100} y1={y(g)} y2={y(g)} className="exf-curve__grid" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} className="exf-curve__area" />
        <path d={line} className="exf-curve__line" vectorEffect="non-scaling-stroke" />
      </svg>
      {points.map((v, i) => {
        const mark = marks?.includes(i);
        return (
          <span key={i} className={`exf-curve__pt${mark ? ' is-mark' : ''}`} style={{ left: `${x(i)}%`, top: `${y(v)}%` }} data-beat={i + 1} data-edge={i === 0 ? 'first' : i === points.length - 1 ? 'last' : undefined}>
            {mark ? <small>{labels[i]}</small> : null}
          </span>
        );
      })}
    </div>
  );
}

export function Donut({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  return (
    <span className="exf-donut" role="img" aria-label={`${label} ${value} of ${max}`}>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} className="exf-donut__track" />
        <circle cx="50" cy="50" r={r} className="exf-donut__bar" strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 50 50)" />
      </svg>
      <span>
        <b>
          {value}/{max}
        </b>
        <small>{label}</small>
      </span>
    </span>
  );
}

/** List row (optionally a link). */
export function Row({
  to,
  onClick,
  media,
  title,
  sub,
  aside,
  active,
  testId,
}: {
  to?: string;
  onClick?: () => void;
  media?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  aside?: ReactNode;
  active?: boolean;
  testId?: string;
}) {
  const inner = (
    <>
      {media}
      <span className="exf-row__text">
        <b>{title}</b>
        {sub ? <small>{sub}</small> : null}
      </span>
      {aside ? <span className="exf-row__aside">{aside}</span> : null}
      {to ? <span className="exf-row__go" aria-hidden>›</span> : null}
    </>
  );
  const cls = `exf-row${active ? ' is-active' : ''}`;
  if (to)
    return (
      <Link to={to} className={cls} data-testid={testId}>
        {inner}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" className={cls} onClick={onClick} data-testid={testId} aria-pressed={active}>
        {inner}
      </button>
    );
  return (
    <div className={cls} data-testid={testId}>
      {inner}
    </div>
  );
}

/** Action / approval control. Disabled controls always carry the reason (no silent dead buttons). */
export function Btn({
  to,
  onClick,
  variant = 'outline',
  disabled,
  reason,
  testId,
  children,
}: {
  to?: string;
  onClick?: () => void;
  variant?: 'red' | 'outline' | 'ink' | 'ghost';
  disabled?: boolean;
  reason?: string;
  testId?: string;
  children: ReactNode;
}) {
  const cls = `exf-btn exf-btn--${variant}`;
  if (to && !disabled)
    return (
      <Link to={to} className={cls} data-testid={testId}>
        {children} <span aria-hidden>→</span>
      </Link>
    );
  return (
    <button type="button" className={cls} disabled={disabled} onClick={onClick} data-testid={testId} title={disabled ? reason : undefined} data-reason={disabled ? reason : undefined}>
      {children}
      {to ? <span aria-hidden> →</span> : null}
    </button>
  );
}

export function Actions({ children, note, testId }: { children: ReactNode; note?: ReactNode; testId?: string }) {
  return (
    <div className="exf-actions" data-testid={testId}>
      <div className="exf-actions__row">{children}</div>
      {note ? <p className="exf-actions__note">{note}</p> : null}
    </div>
  );
}

/** Stat cell for the in-panel stat strips. */
export function Stat({ value, label, tone }: { value: ReactNode; label: string; tone?: Tone }) {
  return (
    <span className={`exf-stat${tone ? ` exf-stat--${tone}` : ''}`}>
      <b>{value}</b>
      <small>{label}</small>
    </span>
  );
}
