/**
 * EXPRESSION media-first kit (P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-FORENSIC-AUDIT.PIXEL-PERFECT-REFINEMENT.OPUS2).
 *
 * The authority leads with the creative asset and puts metadata under it. These primitives make the asset the part
 * that grows: a card's image takes every pixel the grid row gives it (flex, never a fixed strip) and the copy stays a
 * compact block; a gallery's primary image fills its pane and the thumbs ride along an internal horizontal rail; a
 * record hero sets the portrait beside the identity block. Every image opens the in-route inspector (provenance in
 * the caption). Records without canonical media render an honest empty slot, never a stand-in.
 */
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HubImage } from '../../productionHub/HubImage';
import { ExpressionMediaInspector } from './ExpressionMediaInspector';
import type { MediaItem } from './expressionMedia';

type Inspect = { items: readonly MediaItem[]; index: number; title: string } | null;

/** One inspector per surface; returns the opener and the overlay element to render. */
export function useMediaInspector() {
  const [state, setState] = useState<Inspect>(null);
  const open = (items: readonly MediaItem[], index: number, title: string) => {
    if (!items.length) return;
    setState({ items, index: Math.min(Math.max(0, index), items.length - 1), title });
  };
  const overlay =
    state ?
      <ExpressionMediaInspector
        slides={state.items.map((m) => ({ url: m.url, label: m.label, meta: m.source }))}
        index={state.index}
        title={state.title}
        onClose={() => setState(null)}
        onStep={(d) => setState((s) => (s ? { ...s, index: Math.min(Math.max(0, s.index + d), s.items.length - 1) } : s))}
      />
    : null;
  return { open, overlay };
}

/** Image box that fills its parent. `focus` = object-position (portraits keep the face in frame). */
export function MediaFrame({
  item,
  label,
  focus = '50% 22%',
  fit = 'cover',
  onInspect,
  testId,
  badge,
}: {
  item: MediaItem | null;
  label: string;
  focus?: string;
  fit?: 'cover' | 'contain';
  onInspect?: () => void;
  testId?: string;
  badge?: ReactNode;
}) {
  const style = { '--exm-focus': focus } as CSSProperties;
  const body = (
    <>
      <HubImage slotId={null} url={item?.url ?? null} label={label} />
      {badge != null ? <span className="exm-frame__badge">{badge}</span> : null}
    </>
  );
  if (item && onInspect)
    return (
      <button type="button" className={`exm-frame exm-frame--${fit}`} style={style} onClick={onInspect} aria-label={`Inspect ${label}`} data-testid={testId} data-media="primary">
        {body}
      </button>
    );
  return (
    <span className={`exm-frame exm-frame--${fit}${item ? '' : ' is-empty'}`} style={style} data-testid={testId} data-media={item ? 'primary' : 'empty'}>
      {body}
    </span>
  );
}

/** Image-first card. Vertical (image above copy) or horizontal (image left) per `dir`. */
export function MediaCard({
  media,
  title,
  num,
  kicker,
  sub,
  chips,
  to,
  dir = 'v',
  focus,
  active,
  emptyLabel,
  emptyAction,
  onInspect,
  testId,
  children,
}: {
  media: MediaItem | null;
  title: ReactNode;
  num?: string;
  kicker?: ReactNode;
  sub?: ReactNode;
  chips?: ReactNode;
  to?: string;
  dir?: 'v' | 'h';
  focus?: string;
  active?: boolean;
  emptyLabel?: string;
  emptyAction?: ReactNode;
  onInspect?: () => void;
  testId?: string;
  children?: ReactNode;
}) {
  return (
    <article className={`exm-card exm-card--${dir}${active ? ' is-active' : ''}${media ? '' : ' is-empty'}`} data-testid={testId}>
      <div className="exm-card__media">
        {media || !emptyAction ?
          <MediaFrame item={media} label={emptyLabel ?? 'NO IMAGE'} focus={focus} onInspect={onInspect} badge={num} />
        : <span className="exm-card__open">{emptyAction}</span>}
      </div>
      <div className="exm-card__copy">
        {kicker ? <small className="exm-card__kicker">{kicker}</small> : null}
        {to ?
          <Link to={to} className="exm-card__title">
            {title}
          </Link>
        : <b className="exm-card__title">{title}</b>}
        {sub ? <span className="exm-card__sub">{sub}</span> : null}
        {chips ? <span className="exm-card__chips">{chips}</span> : null}
        {children}
      </div>
    </article>
  );
}

/** Grid that fills its pane: columns per viewport family, rows share the height equally. */
export function MediaGrid({ cols, children, testId, className = '' }: { cols: { d: number; t: number; m: number }; children: ReactNode; testId?: string; className?: string }) {
  const style = { '--exm-cd': cols.d, '--exm-ct': cols.t, '--exm-cm': cols.m } as CSSProperties;
  return (
    <div className={`exm-grid ${className}`.trim()} style={style} data-testid={testId}>
      {children}
    </div>
  );
}

/**
 * Primary image + selectable thumbs (internal horizontal rail).
 * `railOnPhone`: where a record hero already carries the lead image, phones drop the duplicate primary (it could
 * only be a strip in the remaining row) and the thumbs become a full-height rail — each opens the inspector.
 */
export function Gallery({
  items,
  title,
  testId,
  focus,
  emptyLabel = 'NO CANONICAL MEDIA',
  open,
  railOnPhone = false,
}: {
  items: readonly MediaItem[];
  title: string;
  testId?: string;
  focus?: string;
  emptyLabel?: string;
  open: (items: readonly MediaItem[], index: number, title: string) => void;
  railOnPhone?: boolean;
}) {
  const [i, setI] = useState(0);
  const primary = useRef<HTMLDivElement>(null);
  const cur = items[i] ?? items[0] ?? null;
  const pick = (k: number) => {
    setI(k);
    // primary hidden (phone rail): the thumb itself opens the inspector
    if (primary.current && primary.current.offsetParent === null) open(items, k, title);
  };
  return (
    <div className={`exm-gallery${railOnPhone && items.length > 1 ? ' exm-gallery--rail-m' : ''}`} data-testid={testId} data-count={items.length}>
      <div className="exm-gallery__primary" ref={primary}>
        <MediaFrame item={cur} label={emptyLabel} focus={focus} onInspect={cur ? () => open(items, i, title) : undefined} testId={testId ? `${testId}-primary` : undefined} />
        {cur ? <span className="exm-gallery__cap">{cur.label}</span> : null}
      </div>
      {items.length > 1 ?
        <div className="exm-gallery__thumbs" data-scroll="internal-x" role="tablist" aria-label={`${title} media`}>
          {items.map((m, k) => (
            <button key={m.url + k} type="button" role="tab" aria-selected={k === i} className={k === i ? 'is-active' : undefined} onClick={() => pick(k)} aria-label={m.label}>
              <HubImage slotId={null} url={m.url} label={m.label} />
            </button>
          ))}
        </div>
      : null}
    </div>
  );
}

/** Detail hero: portrait / image beside the identity block (authority detail header). */
export function RecordHero({
  media,
  kicker,
  title,
  sub,
  chips,
  facts,
  actions,
  focus,
  onInspect,
  testId,
}: {
  media: MediaItem | null;
  kicker?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  chips?: ReactNode;
  facts?: ReactNode;
  actions?: ReactNode;
  focus?: string;
  onInspect?: () => void;
  testId?: string;
}) {
  return (
    <div className="exm-hero" data-testid={testId}>
      <div className="exm-hero__media">
        <MediaFrame item={media} label="NO CANONICAL IMAGE" focus={focus} onInspect={onInspect} testId={testId ? `${testId}-media` : undefined} />
      </div>
      <div className="exm-hero__copy">
        {kicker ? <small className="exm-hero__kicker">{kicker}</small> : null}
        <h4 className="exm-hero__title">{title}</h4>
        {sub ? <span className="exm-hero__sub">{sub}</span> : null}
        {chips ? <span className="exm-hero__chips">{chips}</span> : null}
        {facts ? <div className="exm-hero__facts" data-scroll="internal">{facts}</div> : null}
        {actions ? <div className="exm-hero__actions">{actions}</div> : null}
      </div>
    </div>
  );
}

/** Horizontal rail of small portraits (talent pool, cast pool). */
export function FaceRail({ items, testId, label }: { items: readonly { key: string; media: MediaItem | null; name: string; to?: string; sub?: string }[]; testId?: string; label: string }) {
  return (
    <div className="exm-faces" data-scroll="internal-x" aria-label={label} data-testid={testId}>
      {items.map((x) => {
        const inner = (
          <>
            <MediaFrame item={x.media} label={x.name} />
            <b>{x.name}</b>
            {x.sub ? <small>{x.sub}</small> : null}
          </>
        );
        return x.to ?
            <Link key={x.key} to={x.to} className="exm-face" data-testid={testId ? `${testId}-item` : undefined}>
              {inner}
            </Link>
          : <span key={x.key} className="exm-face" data-testid={testId ? `${testId}-item` : undefined}>
              {inner}
            </span>;
      })}
    </div>
  );
}
