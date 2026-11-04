/**
 * F05 DOT 01 — the shared page frame for every account surface (authorities 02–37).
 *
 * Board (source px of the 941 x 1672 SIDEKICKs, scaled by u):
 *   L0  environment   SK02 / SK03 (their own papers removed → the FIELD variant), top and bottom slices with an
 *                     elastic olive tile between them on tall phones; nothing is stretched
 *   L1  papers        the SIDEKICK's own papers (real alpha) and the motion PNGs, placed in board px; they settle in
 *   L2  live type     JURNL on the permanent tag paper, the title on the heading paper, one sparse cursive subtitle
 *   L3  chips         square-rounded back / search / add chips (no circular tappable controls)
 * Content (screen px, never transformed): a region mapped from the board, so inputs keep ≥ 16 px type and nothing
 * zooms on iOS. The global dock sits under the composition on SK01's torn nav paper (child pages keep the dock).
 */

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { OverlayLayer } from '../../../components/primitives';
import { JurnlProductNav } from '../../../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../../../global/GlobalSheets';
import { useJurnl } from '../../../state/store';
import { JurnlScreen } from '../../JurnlScreen';
import { DOT01, DOT01_GEOMETRY } from './dot01Assets';
import paperTile from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_PAPER_TILE.webp';
import tornEdge from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_TORN_EDGE.webp';
import './jurnl-f05-dot01.css';

export const SRC_W = 941;
export const SRC_H = 1672;
const CROP = 30;
const ELASTIC_Y = DOT01_GEOMETRY.SK02_elastic.y0;
const TILE_H = DOT01_GEOMETRY.SK02_elastic.tile_h;
/** Dock reserve under the composition (screen px, plus the safe area). */
export const DOCK_H = 74;

export type BoardRect = { x: number; y: number; w: number; h: number };
export type Dot01Env = 'SK02' | 'SK02_FIELD' | 'SK03' | 'SK03_FIELD';
export type Dot01Layer = { id: string; src: string; box: BoardRect; order?: number; className?: string; alt?: string; vt?: string };

/** ey: board y where the elastic field tile is inserted (980 by default; a page whose papers are baked into the
 * environment puts it at the board's bottom edge so nothing is cut). */
export type Dot01Layout = { u: number; ox: number; extra: number; boardH: number; w: number; h: number; dockH: number; ey: number };

export function boardToScreen(L: Dot01Layout, r: BoardRect): BoardRect {
  const y = r.y >= L.ey ? r.y + L.extra : r.y;
  return { x: L.ox + r.x * L.u, y: y * L.u, w: r.w * L.u, h: r.h * L.u };
}
export function by(L: Dot01Layout, y: number): number {
  return y >= L.ey ? y + L.extra : y;
}

function useDot01Layout(dock: boolean, crop = CROP, ey = ELASTIC_Y) {
  const ref = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState({ w: 393, h: 852 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => el.clientWidth && el.clientHeight && setVp({ w: el.clientWidth, h: el.clientHeight });
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const L = useMemo<Dot01Layout>(() => {
    const dockH = dock ? DOCK_H : 0;
    const avail = Math.max(1, vp.h - dockH);
    const u = Math.min(Math.max(1, vp.w) / (SRC_W - 2 * crop), avail / SRC_H);
    const ox = (vp.w - SRC_W * u) / 2;
    const extra = Math.max(0, avail / u - SRC_H);
    return { u, ox, extra, boardH: SRC_H + extra, w: vp.w, h: vp.h, dockH, ey };
  }, [vp.w, vp.h, dock, crop, ey]);
  return { ref, L };
}

const ENV_SRC: Record<Dot01Env, string> = { SK02: DOT01.SK02, SK02_FIELD: DOT01.SK02_FIELD, SK03: DOT01.SK03, SK03_FIELD: DOT01.SK03_FIELD };
const TILE_SRC: Record<Dot01Env, string> = { SK02: DOT01.SK02_FIELD_TILE, SK02_FIELD: DOT01.SK02_FIELD_TILE, SK03: DOT01.SK03_FIELD_TILE, SK03_FIELD: DOT01.SK03_FIELD_TILE };

/** Title size: the heading paper holds up to three lines in a 430 px measure (authorities 02, 07, 12). */
function titleSize(lines: string[]): number {
  const longest = Math.max(...lines.map((l) => l.length));
  const cap = lines.length <= 1 ? 82 : lines.length === 2 ? 74 : 56;
  return Math.min(cap, 430 / Math.max(1, longest * 0.69));
}

const STAGE_VARS = {
  '--d01-img-sheet': `url("${DOT01['14_LARGE_PARCHMENT_SHEET']}")`,
  '--d01-img-panel': `url("${DOT01['13_TORN_PARCHMENT_PANEL']}")`,
  '--d01-img-blank': `url("${DOT01['09_BLANK_TORN_PARCHMENT']}")`,
  '--d01-img-strip': `url("${DOT01['19_PARCHMENT_ACTION_STRIP']}")`,
} as CSSProperties;

export type Dot01Chip = { id: string; label: string; icon: 'back' | 'search' | 'plus' | 'close'; onClick: () => void };

type BoardProps = {
  env: Dot01Env;
  /** Title lines (UPPERCASE, live text on the heading paper). */
  title: string[];
  /** One sparse lowercase cursive line under the title, or none. */
  subtitle?: string;
  layers?: Dot01Layer[];
  chips?: Dot01Chip[];
  /** Live content placed in board px (scaled with the board): figures and labels on the SIDEKICK's papers. */
  board?: (L: Dot01Layout) => ReactNode;
  /** Live content in screen px inside contentRect (forms, lists, rows). */
  content?: ReactNode | ((L: Dot01Layout) => ReactNode);
  contentRect?: BoardRect;
  contentScroll?: boolean;
  /** Accessible name of the content region. */
  label?: string;
  testId?: string;
  titleId?: string;
  /** Most board px that may be cropped from each side (default 30). A larger crop lets a tall phone show the whole
   * environment without an elastic insert (used where the papers are baked into the SIDEKICK). */
  maxCrop?: number;
  /** Board y of the elastic insert (default 980). */
  elasticY?: number;
};

function Dot01Board({ env, title, subtitle, layers = [], chips = [], board, content, contentRect, contentScroll = false, label, testId, titleId, dock, onLayout, maxCrop, elasticY }: BoardProps & { dock: boolean; onLayout?: (L: Dot01Layout, el: HTMLDivElement | null) => void }) {
  const { ref, L } = useDot01Layout(dock, maxCrop, elasticY);
  useLayoutEffect(() => onLayout?.(L, ref.current), [L, onLayout, ref]);
  // a page moves focus to its heading on arrival (overlays focus their first control instead)
  useLayoutEffect(() => {
    if (!dock) return;
    const h = ref.current?.querySelector<HTMLElement>('.jrn-d01__title');
    if (h && !ref.current?.contains(document.activeElement)) h.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const S = L.u;
  const envSrc = ENV_SRC[env];
  const tile = TILE_SRC[env];
  const sliced = L.extra >= 1;
  const tSize = titleSize(title);
  const cr = contentRect ? boardToScreen(L, contentRect) : null;
  const boardStyle: CSSProperties = { width: SRC_W, height: L.boardH, transform: `translate(${L.ox}px, 0) scale(${S})`, ['--f05m-u' as string]: String(S) } as CSSProperties;
  return (
    <div ref={ref} className="jrn-d01" data-jrn-f05-dot01-stage data-env={env} data-testid={testId} data-wide={L.ox > 0.5 ? 'true' : 'false'} style={STAGE_VARS}>
      <div className="jrn-d01__board" style={boardStyle} data-jrn-zone="board">
        <div className="jrn-d01__env" aria-hidden data-layer="L0">
          {sliced ?
            <>
              <div className="jrn-d01__slice" style={{ top: 0, height: L.ey, width: SRC_W }}>
                <img src={envSrc} alt="" width={SRC_W} height={SRC_H} draggable={false} />
              </div>
              <div className="jrn-d01__tile" style={{ top: L.ey - 2, height: L.extra + 4, width: SRC_W, backgroundImage: `url("${tile}")`, backgroundSize: `${SRC_W}px ${TILE_H}px` }} />
              <div className="jrn-d01__slice" style={{ top: L.ey + L.extra, height: SRC_H - L.ey, width: SRC_W }}>
                <img src={envSrc} alt="" width={SRC_W} height={SRC_H} draggable={false} style={{ top: -L.ey }} />
              </div>
            </>
          : <div className="jrn-d01__slice" style={{ top: 0, height: SRC_H, width: SRC_W }}>
              <img src={envSrc} alt="" width={SRC_W} height={SRC_H} draggable={false} />
            </div>}
        </div>
        {layers.map((l, i) => (
          <img
            key={l.id}
            className={`jrn-d01__layer ${l.className ?? ''}`}
            data-layer="L1"
            data-layer-id={l.id}
            src={l.src}
            alt={l.alt ?? ''}
            aria-hidden={l.alt ? undefined : true}
            draggable={false}
            style={{ left: l.box.x, top: by(L, l.box.y), width: l.box.w, height: l.box.h, ['--i' as string]: l.order ?? i, viewTransitionName: l.vt } as CSSProperties}
          />
        ))}
        <p className="jrn-d01__mark" aria-label="JURNL">JURNL</p>
        <header className="jrn-d01__heading" data-jrn-zone="intro">
          <h1 id={titleId} className="jrn-d01__title" style={{ fontSize: tSize }} data-lines={title.length} tabIndex={-1}>
            {/* a real space between the lines (a whitespace-only node is not a grid item, so layout is unchanged) */}
            {title.map((t, i) => (
              <Fragment key={`${i}-${t}`}>
                {i ? ' ' : null}
                <span>{t}</span>
              </Fragment>
            ))}
          </h1>
          {subtitle ? <p className="jrn-d01__script" lang="en">{subtitle}</p> : null}
        </header>
        {board ? board(L) : null}
        <div className="jrn-d01__chips">
          {chips.map((c, i) => (
            <button key={c.id} type="button" className="jrn-d01__chip" data-jrn-trigger={c.id} aria-label={c.label} style={{ left: (dock ? 845 - 84 : 845) - (chips.length - 1 - i) * 84 }} onClick={c.onClick}>
              <ChipIcon icon={c.icon} />
            </button>
          ))}
        </div>
      </div>
      {content && cr ?
        <section key={testId} className="jrn-d01__content" data-scroll={contentScroll ? 'true' : 'false'} aria-label={label} style={{ left: cr.x, top: cr.y, width: cr.w, height: cr.h, ['--d01-s' as string]: String(Math.max(0.86, Math.min(1.25, S / 0.44))) } as CSSProperties}>
          {typeof content === 'function' ? content(L) : content}
        </section>
      : null}
    </div>
  );
}

/** A DOT 01 page: the board, the global dock re-seated on SK01's torn nav paper, Quick Add / Ask. */
export function Dot01Frame({ screenId, dock = true, overlays, ...board }: BoardProps & { screenId: string; dock?: boolean; overlays?: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  const [L, setL] = useState<Dot01Layout | null>(null);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const onLayout = useCallback((l: Dot01Layout, el: HTMLDivElement | null) => {
    setL(l);
    setRoot((el?.closest('.jrn') as HTMLElement | null) ?? null);
  }, []);
  useLayoutEffect(() => {
    if (!root || !dock || !L) return;
    root.setAttribute('data-jrn-f05-motion', '');
    root.setAttribute('data-jrn-f05-dot01', '');
    const w = Math.min(L.w, SRC_W * L.u);
    const x = (L.w - w) / 2;
    const vars: Record<string, string> = {
      '--f05m-nav-x': `${x + w * 0.035}px`,
      '--f05m-nav-w': `${w * 0.93}px`,
      '--f05m-nav-h': `${L.dockH - 8}px`,
      '--f05m-nav-b': '4px',
      '--f05m-u': String(L.u),
      '--f05m-nav-gap': '4',
      '--f05m-nav-label': '24',
      '--d01-nav-paper': `url("${DOT01.NAV_PAPER}")`,
      // the global account menu takes the far-right chip square (as on the MONEY parent)
      '--f05m-menu-x': `${L.ox + 845 * L.u}px`,
      '--f05m-menu-y': `${44 * L.u}px`,
      '--f05m-chip': `${64 * L.u}px`,
      '--f05m-paper-url': `url("${paperTile}")`,
      '--f05m-edge-url': `url("${tornEdge}")`,
    };
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => {
      root.removeAttribute('data-jrn-f05-motion');
      root.removeAttribute('data-jrn-f05-dot01');
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [L, dock, root]);
  const envSrc = ENV_SRC[board.env];
  return (
    <JurnlScreen screenId={screenId} familyPlate={{ family: 'F05', scene: `ENV.DOT01.${board.env}`, src: envSrc, assetId: `MONEY.DOT01.${board.env}`, width: SRC_W, height: SRC_H }} family productNav={dock} singlePlate>
      <Dot01Board {...board} dock={dock} onLayout={onLayout} />
      {dock ? <JurnlProductNav marks="parent" current="MONEY" onGo={go} onAdd={() => openOverlay('quick-add')} /> : null}
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F05" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F05" nodeId={screenId} onClose={closeOverlay} /> : null}
      {overlays}
    </JurnlScreen>
  );
}

/**
 * A DOT 01 contextual overlay (authorities 14–20, 23–30, 33, 34, 36, 37): a full paper composition above the page it
 * came from. The page stays mounted underneath (its state, scroll and carousel collection are kept); focus is trapped
 * inside, Escape and the back chip close it, and focus returns to the control that opened it.
 */
export function Dot01Overlay({ onClose, testId, env = 'SK03_FIELD', ...board }: Omit<BoardProps, 'env'> & { env?: Dot01Env; onClose: () => void; testId: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const titleId = `d01-ov-${testId}`;
  useLayoutEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const box = boxRef.current;
    const first = box?.querySelector<HTMLElement>('input, select, textarea, button:not([disabled])');
    (first ?? box?.querySelector<HTMLElement>('h1'))?.focus({ preventScroll: true });
    return () => {
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !boxRef.current) return;
    const f = [...boxRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && (i <= 0)) {
      e.preventDefault();
      f[f.length - 1]!.focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0]!.focus();
    }
  };
  // a flow moves through steps in the same overlay (e.g. RECORD → REVIEW → SAVED): each step starts at its top with
  // focus on its first control, and the original opener still gets focus back when the overlay closes
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const box = boxRef.current;
    (box?.querySelector<HTMLElement>('.jrn-d01__content input, .jrn-d01__content select, .jrn-d01__content button:not([disabled])') ?? box?.querySelector<HTMLElement>('h1'))?.focus({ preventScroll: true });
  }, [testId]);
  const chips = board.chips ?? [{ id: `${testId}-close`, label: 'CLOSE', icon: 'back' as const, onClick: onClose }];
  // portaled to the runtime overlay layer: a focused overlay covers the page, the global dock and the corner menu
  return (
    <OverlayLayer>
      <div ref={boxRef} className="jrn-d01-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} data-jrn-overlay={testId} data-testid={`${testId}-dialog`} onKeyDown={onKeyDown}>
        <Dot01Board {...board} env={env} chips={chips} dock={false} titleId={titleId} testId={testId} />
      </div>
    </OverlayLayer>
  );
}

export function ChipIcon({ icon }: { icon: Dot01Chip['icon'] }) {
  if (icon === 'back') return <svg viewBox="0 0 24 24" aria-hidden><path d="M19 12H6m6-6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (icon === 'search') return <svg viewBox="0 0 24 24" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (icon === 'close') return <svg viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
