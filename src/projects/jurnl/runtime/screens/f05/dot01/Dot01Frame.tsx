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
 * zooms on iOS.
 * Every page is full-bleed like its authority: no strip is reserved under the composition. Only the screens whose
 * authority draws the global navigation (06 ALL ACCOUNTS, 31 TRANSACTIONS; the parent 01 has its own) seat the dock on
 * SK01's torn nav paper inside the composition, at its authority position (board y 1459–1662). The extra height of a
 * tall phone goes into an olive-field seam just above the bottom landscape (inside the field-reconstructed region),
 * so the papers keep the authority's vertical rhythm.
 */

import type React from 'react';
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { OverlayLayer } from '../../../components/primitives';
import { JurnlProductNav } from '../../../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../../../global/GlobalSheets';
import { useJurnl } from '../../../state/store';
import { JurnlScreen } from '../../JurnlScreen';
import { DOT01, DOT01_GEOMETRY } from './dot01Assets';
import sk03Seal from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_SK03.webp';
import { microAssetSrc } from '../microAssets';
import paperTile from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_PAPER_TILE.webp';
import tornEdge from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_TORN_EDGE.webp';
import sk01Field from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_SIDEKICK.webp';
import sk01SheetTile from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_PANEL_TILE.webp';
import sk01TitlePaper from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_TITLE_PAPER.webp';
import sk01Seal from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_WAX_SEAL.webp';
import motionGeometry from '../../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_GEOMETRY.json';
import { f05BoardType } from '../CarouselPanelPaper';
import { CROP as F05_CROP, SEAM_A as SK01_SEAM_A, SEAM_C as SK01_SEAM_C, computeF05BoardScale } from '../f05MotionLayout';
import './jurnl-f05-dot01.css';

export const SRC_W = 941;
export const SRC_H = 1672;
const CROP = 30;
const TILE_H = DOT01_GEOMETRY.SK02_elastic.tile_h;
/**
 * Where each environment takes the extra height of a tall phone: below the last paper and above the bottom landscape,
 * inside the region the extraction rebuilt as plain field (SK02 22–919 × 588–1548, SK03 22–919 × 568–1530). The full
 * SK03 (papers baked) uses the gap between its frame (ends y 1040) and its strip (starts y 1042).
 */
/**
 * SK01_FIELD (the parent's text-free SK01, F05_MOTION_SIDEKICK: its account papers, title paper and seal removed, its
 * large sheet, coastal landscape, botanicals and torn nav paper kept) grows inside that sheet at the parent's own seam
 * (y 1190), with the parent's sheet tile (the sheet between y 900 and 1190), exactly as authority 01 does.
 */
const SEAM: Record<Dot01Env, number> = { SK01_FIELD: SK01_SEAM_C, SK02: 1540, SK02_FIELD: 1540, SK03: 1041, SK03_FIELD: 1520 };
/**
 * Top of the zone whose papers share the extra height (as the parent's papers do: sizes kept, gaps grow). Only the
 * FIELD variants have one: their papers are layers over plain field. The full SIDEKICKs keep every baked paper fixed.
 * SK01_FIELD has none: the page that uses it (06) seats its own papers from the extra height it is given.
 */
const ZONE_TOP: Record<Dot01Env, number | null> = { SK01_FIELD: null, SK02: null, SK02_FIELD: 588, SK03: null, SK03_FIELD: 568 };
/** The parent's title paper and laurel seal (SK01's own, lifted with alpha): drawn wherever SK01_FIELD is the ground. */
const SK01_TITLE_BOX = { x: motionGeometry.title_paper.box[0]!, y: motionGeometry.title_paper.box[1]!, w: motionGeometry.title_paper.w, h: motionGeometry.title_paper.h };
const SK01_SEAL_BOX = { x: motionGeometry.wax_seal.box[0]!, y: motionGeometry.wax_seal.box[1]!, w: motionGeometry.wax_seal.w, h: motionGeometry.wax_seal.h };
/** With the dock: above SK01's torn nav paper (board y 1459). */
const NAV_SEAM = 1452;
const NAV_PAPER_BOX = { x: 19, y: 1459, w: 911, h: 203 };
/** The five dock cells on the nav paper (the parent's composition rect, f05Composition.ts nav). */
const NAV_RECT = { x: 34, y: 1478, w: 870, h: 138 };

export type BoardRect = { x: number; y: number; w: number; h: number };
/**
 * The overlay title papers and their text-safe zones (board px), measured on the PNGs (OPUS3B doc 04).
 * `env`: the SK03 SIDEKICK's own heading paper, as baked (visible paper x 50–640, y 318–555). The wax seal takes its
 *   left end; its torn lower-right corner, with the foliage over it, rises from y 470 (right edge 607 at y 480, 590 at
 *   y 500, 550 at y 520), so each lower title line has less width: `lines` is the measure of line 1, 2, 3.
 * `wide`: authorities whose title paper runs further right, sits higher and is shorter (16 RECORD TRANSACTION: paper
 *   x ≈ 90–715, y 296–500, title x 192–685). Drawn with the approved V9 wide torn banner (motion asset 12, 1200 × 330,
 *   aspect 3.64 against the authority's 3.4), mirrored so its torn end is on the right and its cut end bleeds off the
 *   board's left edge under the wax seal — never stretched (uniform scale).
 */
export const OVERLAY_HEADINGS = {
  env: { safe: { x: 196, y: 340, w: 410, h: 200 }, lines: [410, 380, 350] },
  wide: { paper: { x: 0, y: 298, w: 724, h: 199 }, safe: { x: 192, y: 308, w: 492, h: 184 }, lines: [492, 480, 460] },
} as const satisfies Record<string, { safe: BoardRect; lines: readonly number[]; paper?: BoardRect }>;
/** The SK03 SIDEKICK's own laurel seal, lifted with a disc alpha (lift_dot01_sk03_parts.py): the wide title paper covers
 * the SIDEKICK's heading, so the frame draws this seal over it unless the screen mounts its own seal layer. */
const SK03_SEAL_BOX: BoardRect = { x: 25, y: 324, w: 154, h: 154 };
export type Dot01Heading = keyof typeof OVERLAY_HEADINGS;
/** Mean advance of an uppercase letter of the title face at the overlay tracking (em), measured on the runtime. */
const TITLE_ADVANCE = 0.66;
/** The content region of every overlay (authorities 14–37): under the overlay heading paper (board y ≈ 552) down onto
 * the top of the bottom landscape, where the authorities seat their primary action (≈ 1574). It grows with the seam. */
export const OVERLAY_CONTENT: BoardRect = { x: 30, y: 552, w: 881, h: 1022 };
/** Under the wide title paper (it ends at board y ≈ 497, authority 16's scan block starts at 524): the content starts
 * just below it, so the SK03 paper's lower band is covered by the first content paper, as the authority layers it. */
export const OVERLAY_CONTENT_WIDE: BoardRect = { x: 30, y: 512, w: 881, h: 1062 };
export type Dot01Env = 'SK01_FIELD' | 'SK02' | 'SK02_FIELD' | 'SK03' | 'SK03_FIELD';
export type Dot01Layer = { id: string; src: string; box: BoardRect; order?: number; className?: string; alt?: string; vt?: string };

/** ey: board y where the elastic field tile is inserted (see SEAM); z0: top of the zone that shares it (or null). */
export type Dot01Layout = { u: number; ox: number; extra: number; boardH: number; w: number; h: number; ey: number; z0: number | null };

/**
 * Board y on the stretched board. Below the seam everything moves by the whole extra height; inside the zone a
 * position moves in proportion to how far down the zone it is, so the gaps between papers grow evenly. Place a paper
 * by its top (`by(L, top)`) and anything on it relative to that top (`by(L, top) + dy`), so nothing drifts on its paper.
 */
export function by(L: Dot01Layout, y: number): number {
  if (y >= L.ey) return y + L.extra;
  if (L.z0 != null && y > L.z0) return y + (L.extra * (y - L.z0)) / (L.ey - L.z0);
  return y;
}

/** Board rect → screen px. Its top and bottom are both mapped, so a region that reaches the seam grows with it. */
export function boardToScreen(L: Dot01Layout, r: BoardRect): BoardRect {
  const top = by(L, r.y);
  const bottom = r.y < L.ey && r.y + r.h >= L.ey - 2 ? by(L, L.ey) + (r.y + r.h - L.ey) : top + r.h;
  return { x: L.ox + r.x * L.u, y: top * L.u, w: r.w * L.u, h: (bottom - top) * L.u };
}

/**
 * `absorb` (board px; null = off, the board's foot may fall below the fold): on a screen SHORTER than 9:16 a phone's width-first board would put its foot (the
 * landscape, the nav paper, the dock) below the fold. A page that allows it takes up to `absorb` px out at its seam
 * instead (the lower slice overlaps the upper one inside plain sheet / field: `extra` goes negative), and only if the
 * foot still does not fit is the board fitted to the height (a few px of side margin, nothing cropped below).
 */
function useDot01Layout(crop: number, ey: number, z0: number | null, absorb: number | null = null) {
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
    const avail = Math.max(1, vp.h);
    let { u, ox } = computeF05BoardScale(vp.w, vp.h, crop as typeof F05_CROP, avail);
    let extra = Math.max(0, avail / u - SRC_H);
    const deficit = SRC_H - avail / u;
    if (absorb != null && deficit > 0) {
      if (deficit <= absorb) extra = -deficit;
      else {
        extra = -absorb;
        u = avail / (SRC_H - absorb);
        ox = (vp.w - SRC_W * u) / 2;
      }
    }
    return { u, ox, extra, boardH: SRC_H + extra, w: vp.w, h: vp.h, ey, z0: z0 != null && z0 < ey ? z0 : null };
  }, [vp.w, vp.h, crop, ey, z0, absorb]);
  return { ref, L };
}

const ENV_SRC: Record<Dot01Env, string> = { SK01_FIELD: sk01Field, SK02: DOT01.SK02, SK02_FIELD: DOT01.SK02_FIELD, SK03: DOT01.SK03, SK03_FIELD: DOT01.SK03_FIELD };
const TILE_SRC: Record<Dot01Env, string> = { SK01_FIELD: sk01SheetTile, SK02: DOT01.SK02_FIELD_TILE, SK02_FIELD: DOT01.SK02_FIELD_TILE, SK03: DOT01.SK03_FIELD_TILE, SK03_FIELD: DOT01.SK03_FIELD_TILE };
/** The elastic insert per environment: tile height and how it is seated (the SK01 sheet tile is bottom-aligned on the
 * seam with a 48 px overlap above it, as the parent seats it; the SK02 / SK03 field tiles repeat from the seam). */
function tileStyle(env: Dot01Env, L: Dot01Layout, tile: string): CSSProperties {
  if (env === 'SK01_FIELD') {
    return { top: L.ey - 48, height: L.extra + 48 + 6, width: SRC_W, backgroundImage: `url("${tile}")`, backgroundSize: `${SRC_W}px ${SK01_SEAM_C - SK01_SEAM_A}px`, backgroundPosition: '0 calc(100% - 6px)' };
  }
  return { top: L.ey - 2, height: L.extra + 4, width: SRC_W, backgroundImage: `url("${tile}")`, backgroundSize: `${SRC_W}px ${TILE_H}px` };
}

/**
 * Title size. Pages (SK02): the heading paper holds up to three lines in a 430 px measure (authorities 02, 07, 12).
 * Overlays (SK03): the authorities set a heavier, tighter title further right on a smaller heading paper, in a 500 px
 * measure (authorities 14–37; measured on 16 RECORD TRANSACTION, 17 ADD CASH, 23 BALANCE ADJUSTMENT, 26 CAPTURE RECEIPT).
 */
/**
 * Content type scale (× 13 px): authority-relative — it follows the board (S / 0.44: 1 at a 393-wide phone), floored at
 * 0.86 for legibility on the smallest phones and capped at 1.75 so a tablet keeps the phone's proportions (834 × 1194: 1.62;
 * before OPUS3B the cap was 1.25, so tablets drew the forms 23 % smaller than their papers and left an olive void).
 */
export function contentScale(S: number): number {
  return Math.max(0.86, Math.min(1.75, S / 0.44));
}

export function titleSize(lines: string[], overlay: boolean, heading: Dot01Heading = 'env'): number {
  const longest = Math.max(...lines.map((l) => l.length));
  if (overlay) {
    // each line is fitted to its own measure on the heading paper (OVERLAY_HEADINGS: the torn lower-right corner of the
    // SK03 paper narrows the lower lines), at the authority's cap for its line count — never to overrun the paper
    const H = OVERLAY_HEADINGS[heading];
    const cap = lines.length <= 1 ? 80 : lines.length === 2 ? 68 : 50;
    const fit = lines.map((l, i) => H.lines[Math.min(i, H.lines.length - 1)]! / Math.max(1, l.length * TITLE_ADVANCE));
    return Math.min(cap, ...fit);
  }
  const cap = lines.length <= 1 ? 82 : lines.length === 2 ? 74 : 56;
  return Math.min(cap, 430 / Math.max(1, longest * 0.69));
}

const STAGE_VARS = {
  '--d01-img-sheet': `url("${DOT01['14_LARGE_PARCHMENT_SHEET']}")`,
  '--d01-img-panel': `url("${DOT01['13_TORN_PARCHMENT_PANEL']}")`,
  '--d01-img-blank': `url("${DOT01['09_BLANK_TORN_PARCHMENT']}")`,
  '--d01-img-strip': `url("${DOT01['19_PARCHMENT_ACTION_STRIP']}")`,
} as CSSProperties;

/** A chip's surface, as each authority draws it: `paper` = small torn parchment tile with an ink glyph (02–05, 11–29),
 * `amber` = glossy amber square-rounded tile with a light glyph (06–10, and the add tile of 01 / 30–37),
 * `bare` = the glyph alone on the scene (search on 01 / 30–37). */
export type Dot01ChipTone = 'paper' | 'amber' | 'bare';
export type Dot01Chip = { id: string; label: string; icon: 'back' | 'search' | 'plus' | 'close' | 'more'; onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void; tone?: Dot01ChipTone; menu?: { open: boolean } };
/** Chip widths in board px (authority tiles: paper ≈ 88 × 78, amber ≈ 72 × 66, search glyph ≈ 50) and their gap. */
const CHIP_W: Record<Dot01ChipTone, number> = { paper: 88, amber: 72, bare: 56 };
const CHIP_RIGHT = 902;
const CHIP_GAP = 26;

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
  /** Keep the board's foot on a screen shorter than 9:16: take up to this many board px out at the seam, then fit the
   * board to the height (0 = fit at once). Omitted: the foot may fall below the fold (content regions scroll instead). */
  absorb?: number;
  /** Surface of the back chip on this screen (authority: amber on 06–10, paper elsewhere). */
  chipTone?: Dot01ChipTone;
  /** Field rows as separate torn strips at the authority pitch (17, 20), dense strips for the seven-row purchase form
   * (16, 18, 19: one row more than drawn, so the action stays on screen), or rows on one sheet (default). */
  fields?: 'sheet' | 'strips' | 'strips-dense';
  /** Icons in field rows and content strips: bare ink glyphs (default) or alternating moss / terracotta tiles. */
  fieldIcons?: 'ink' | 'tiles';
  stripIcons?: 'ink' | 'tiles';
  /** Overlay title paper: the SK03 SIDEKICK's own (default) or the wide torn banner where the authority's title paper
   * is wider and shorter (OVERLAY_HEADINGS). */
  heading?: Dot01Heading;
};

function Dot01Board({ env, title, subtitle, layers = [], chips = [], board, content, contentRect, contentScroll = false, label, testId, titleId, page, nav = false, onLayout, maxCrop = CROP, elasticY, absorb, chipTone = 'paper', fields = 'sheet', fieldIcons = 'ink', stripIcons = 'ink', heading = 'env' }: BoardProps & { page: boolean; nav?: boolean; onLayout?: (L: Dot01Layout, el: HTMLDivElement | null) => void }) {
  // SK01_FIELD carries its own torn nav paper below its seam, so a page with the dock still grows at that seam
  const { ref, L } = useDot01Layout(maxCrop, elasticY ?? (nav && env !== 'SK01_FIELD' ? NAV_SEAM : SEAM[env]), elasticY != null ? null : ZONE_TOP[env], absorb ?? null);
  useLayoutEffect(() => onLayout?.(L, ref.current), [L, onLayout, ref]);
  // a page moves focus to its heading on arrival (overlays focus their first control instead)
  useLayoutEffect(() => {
    if (!page) return;
    const h = ref.current?.querySelector<HTMLElement>('.jrn-d01__title');
    if (h && !ref.current?.contains(document.activeElement)) h.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const S = L.u;
  const envSrc = ENV_SRC[env];
  const tile = TILE_SRC[env];
  const sliced = L.extra >= 1;
  // a short screen took height out at the seam: the lower slice overlaps the upper one, feathered into it
  const overlapped = L.extra <= -1;
  const overlayHead = env === 'SK03' || env === 'SK03_FIELD';
  const head: Dot01Heading = overlayHead ? heading : 'env';
  const tSize = titleSize(title, overlayHead, head);
  // the content region follows the title paper: under the wide paper it starts where that paper ends
  const region = head === 'wide' && contentRect === OVERLAY_CONTENT ? OVERLAY_CONTENT_WIDE : contentRect;
  const mapped = region ? boardToScreen(L, region) : null;
  // a short phone (width-first, so the board's foot is below the screen) never puts a control below the fold: the
  // content region ends on screen and scrolls inside itself; a tall phone, a tablet or a desktop never clamps
  const clamped = !!mapped && mapped.y + mapped.h > L.h - 4;
  const cr = mapped && clamped ? { ...mapped, h: Math.max(0, L.h - 4 - mapped.y) } : mapped;
  const boardStyle: CSSProperties = { width: SRC_W, height: L.boardH, transform: `translate(${L.ox}px, 0) scale(${S})`, ['--f05m-u' as string]: String(S) } as CSSProperties;
  return (
    <div ref={ref} className="jrn-d01" data-jrn-f05-dot01-stage data-env={env} data-heading={overlayHead ? head : undefined} data-testid={testId} data-wide={L.ox > 0.5 ? 'true' : 'false'} style={STAGE_VARS}>
      <div className="jrn-d01__board" style={boardStyle} data-jrn-zone="board">
        <div className="jrn-d01__env" aria-hidden data-layer="L0">
          {sliced ?
            <>
              <div className="jrn-d01__slice" style={{ top: 0, height: L.ey, width: SRC_W }}>
                <img src={envSrc} alt="" width={SRC_W} height={SRC_H} draggable={false} />
              </div>
              <div className="jrn-d01__tile" style={tileStyle(env, L, tile)} />
              <div className="jrn-d01__slice" style={{ top: L.ey + L.extra, height: SRC_H - L.ey, width: SRC_W }}>
                <img src={envSrc} alt="" width={SRC_W} height={SRC_H} draggable={false} style={{ top: -L.ey }} />
              </div>
            </>
          : overlapped ?
            <>
              <div className="jrn-d01__slice" style={{ top: 0, height: L.ey, width: SRC_W }}>
                <img src={envSrc} alt="" width={SRC_W} height={SRC_H} draggable={false} />
              </div>
              <div className="jrn-d01__slice" data-overlap="true" style={{ top: L.ey + L.extra, height: SRC_H - L.ey, width: SRC_W }}>
                <img src={envSrc} alt="" width={SRC_W} height={SRC_H} draggable={false} style={{ top: -L.ey }} />
              </div>
            </>
          : <div className="jrn-d01__slice" style={{ top: 0, height: SRC_H, width: SRC_W }}>
              <img src={envSrc} alt="" width={SRC_W} height={SRC_H} draggable={false} />
            </div>}
        </div>
        {env === 'SK01_FIELD' ?
          <>
            <img className="jrn-d01__layer" data-layer="L1" data-layer-id="sk01_title_paper" src={sk01TitlePaper} alt="" aria-hidden draggable={false} style={{ left: SK01_TITLE_BOX.x, top: SK01_TITLE_BOX.y, width: SK01_TITLE_BOX.w, height: SK01_TITLE_BOX.h, ['--i' as string]: 0 } as CSSProperties} />
            <img className="jrn-d01__layer" data-layer="L1" data-layer-id="sk01_seal" src={sk01Seal} alt="" aria-hidden draggable={false} style={{ left: SK01_SEAL_BOX.x, top: SK01_SEAL_BOX.y, width: SK01_SEAL_BOX.w, height: SK01_SEAL_BOX.h, ['--i' as string]: 1 } as CSSProperties} />
          </>
        : null}
        {head === 'wide' ? (
          <>
            <img className="jrn-d01__layer jrn-d01__headpaper" data-layer="L1" data-layer-id="heading_paper_wide" src={DOT01['12_WIDE_TORN_BANNER']} alt="" aria-hidden draggable={false} style={{ left: OVERLAY_HEADINGS.wide.paper.x, top: OVERLAY_HEADINGS.wide.paper.y, width: OVERLAY_HEADINGS.wide.paper.w, height: OVERLAY_HEADINGS.wide.paper.h }} />
            {layers.some((l) => l.id.startsWith('seal')) ? null : (
              <img className="jrn-d01__layer" data-layer="L1" data-layer-id="seal_sk03" src={sk03Seal} alt="" aria-hidden draggable={false} style={{ left: SK03_SEAL_BOX.x, top: SK03_SEAL_BOX.y, width: SK03_SEAL_BOX.w, height: SK03_SEAL_BOX.h }} />
            )}
          </>
        ) : null}
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
          <h1 id={titleId} className="jrn-d01__title" style={{ fontSize: f05BoardType(tSize) }} data-lines={title.length} tabIndex={-1}>
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
        {/* the torn nav paper has one owner: SK01_FIELD has it baked (drawing it again would double it), so there only an
            empty marker of its box is placed, for the dock's geometry */}
        {nav && env === 'SK01_FIELD' ? <span className="jrn-d01__layer jrn-d01__navpaper" data-baked="SK01_FIELD" aria-hidden style={{ left: NAV_PAPER_BOX.x, top: by(L, NAV_PAPER_BOX.y), width: NAV_PAPER_BOX.w, height: NAV_PAPER_BOX.h }} /> : null}
        {nav && env !== 'SK01_FIELD' ? <img className="jrn-d01__layer jrn-d01__navpaper" data-layer="L1" data-layer-id="nav_paper" src={DOT01.NAV_PAPER} alt="" aria-hidden draggable={false} style={{ left: NAV_PAPER_BOX.x, top: by(L, NAV_PAPER_BOX.y), width: NAV_PAPER_BOX.w, height: NAV_PAPER_BOX.h }} /> : null}
        <div className="jrn-d01__chips">
          {(() => {
            // laid out from the right edge, each at its authority width
            const tones = chips.map((c) => c.tone ?? (c.icon === 'search' ? 'bare' : c.icon === 'plus' ? 'amber' : chipTone));
            let right = CHIP_RIGHT;
            const lefts = tones.map(() => 0);
            for (let i = chips.length - 1; i >= 0; i--) {
              lefts[i] = right - CHIP_W[tones[i]!];
              right = lefts[i]! - CHIP_GAP;
            }
            return chips.map((c, i) => (
              <button key={c.id} type="button" className={`jrn-d01__chip jrn-d01__chip--${tones[i]}`} data-tone={tones[i]} data-jrn-trigger={c.id} aria-label={c.label} aria-haspopup={c.menu ? 'menu' : undefined} aria-expanded={c.menu ? c.menu.open : undefined} style={{ left: lefts[i] }} onClick={(e) => c.onClick(e)}>
                <ChipIcon icon={c.icon} tone={tones[i]!} />
              </button>
            ));
          })()}
        </div>
      </div>
      {content && cr ?
        <section key={testId} className="jrn-d01__content" data-scroll={contentScroll || clamped ? 'true' : 'false'} data-clamped={clamped ? 'true' : undefined} data-fields={fields} data-field-icons={fieldIcons} data-strip-icons={stripIcons} aria-label={label} style={{ left: cr.x, top: cr.y, width: cr.w, height: cr.h, ['--d01-s' as string]: String(contentScale(S)) } as CSSProperties}>
          {typeof content === 'function' ? content(L) : content}
        </section>
      : null}
    </div>
  );
}

/**
 * A DOT 01 page. Full-bleed like its authority; `nav` (06, 31 only) seats the global dock on SK01's torn nav paper inside
 * the composition. The shell's corner chrome is hidden: each page shows only its authority's own chips.
 */
export function Dot01Frame({ screenId, nav = false, overlays, ...board }: BoardProps & { screenId: string; nav?: boolean; overlays?: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  const [L, setL] = useState<Dot01Layout | null>(null);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const onLayout = useCallback((l: Dot01Layout, el: HTMLDivElement | null) => {
    setL(l);
    setRoot((el?.closest('.jrn') as HTMLElement | null) ?? null);
  }, []);
  useLayoutEffect(() => {
    if (!root || !L) return;
    root.setAttribute('data-jrn-f05-dot01', '');
    const vars: Record<string, string> = {};
    if (nav) {
      root.setAttribute('data-jrn-f05-motion', '');
      const r = boardToScreen(L, NAV_RECT);
      Object.assign(vars, {
        '--f05m-nav-x': `${r.x}px`,
        '--f05m-nav-w': `${r.w}px`,
        '--f05m-nav-h': `${r.h}px`,
        '--f05m-nav-b': `${L.h - (r.y + r.h)}px`,
        '--f05m-u': String(L.u),
        '--f05m-nav-gap': '10',
        '--f05m-nav-label': '28',
        '--f05m-paper-url': `url("${paperTile}")`,
        '--f05m-edge-url': `url("${tornEdge}")`,
      });
    }
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => {
      root.removeAttribute('data-jrn-f05-dot01');
      if (nav) root.removeAttribute('data-jrn-f05-motion');
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [L, nav, root]);
  const envSrc = ENV_SRC[board.env];
  return (
    <JurnlScreen screenId={screenId} familyPlate={{ family: 'F05', scene: `ENV.DOT01.${board.env}`, src: envSrc, assetId: `MONEY.DOT01.${board.env}`, width: SRC_W, height: SRC_H }} family productNav={nav} singlePlate>
      <Dot01Board {...board} page nav={nav} onLayout={onLayout} />
      {nav ? <JurnlProductNav marks="parent" current="MONEY" onGo={go} onAdd={() => openOverlay('quick-add')} /> : null}
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F05" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F05" nodeId={screenId} onClose={closeOverlay} /> : null}
      {overlays}
    </JurnlScreen>
  );
}

/** An overlay's first focus: its first content control (a form's first field; a confirmation's safe choice). */
const FIRST_CONTENT_CONTROL = '.jrn-d01__content input, .jrn-d01__content select, .jrn-d01__content textarea, .jrn-d01__content button:not([disabled])';

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
    // the overlay opens on its first CONTENT control (a form's first field; the safe choice of a confirmation, e.g.
    // KEEP POCKET), as each later step does; only an overlay with no content region falls back to its first control
    // (its board buttons render before its chips). Before, a production build focused the corner CLOSE chip first.
    const first = box?.querySelector<HTMLElement>(FIRST_CONTENT_CONTROL) ?? box?.querySelector<HTMLElement>('input, select, textarea, button:not([disabled])');
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
    (box?.querySelector<HTMLElement>(FIRST_CONTENT_CONTROL) ?? box?.querySelector<HTMLElement>('h1'))?.focus({ preventScroll: true });
  }, [testId]);
  const chips = board.chips ?? [{ id: `${testId}-close`, label: 'CLOSE', icon: 'back' as const, onClick: onClose }];
  // portaled to the runtime overlay layer: a focused overlay covers the page (and the dock where a page has one)
  return (
    <OverlayLayer>
      <div ref={boxRef} className="jrn-d01-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} data-jrn-overlay={testId} data-testid={`${testId}-dialog`} onKeyDown={onKeyDown}>
        <Dot01Board {...board} env={env} chips={chips} page={false} titleId={titleId} testId={testId} />
      </div>
    </OverlayLayer>
  );
}

/** The search + add chips that authorities 01, 30–37 draw in place of a back chip. */
export function useSearchAddChips(): Dot01Chip[] {
  const { go, openOverlay } = useJurnl();
  return [
    { id: 'd01-search', label: 'SEARCH TRANSACTIONS', icon: 'search', onClick: () => go('money/transactions') },
    { id: 'd01-add', label: 'ADD', icon: 'plus', onClick: () => openOverlay('quick-add') },
  ];
}

export function ChipIcon({ icon, tone = 'paper' }: { icon: Dot01Chip['icon']; tone?: Dot01ChipTone }) {
  // Batch 05 / 01: the whole torn back tile with its ink arrow, as 02 / 14 / 26 / 27 draw it (a candidate mounted for
  // the founder's review; the 9-sliced blank paper + Batch 01 arrow below stays as the fallback). Only BACK / CLOSE:
  // the tile carries an arrow, so other paper chips (MANAGE POCKET) keep the blank paper.
  const tile = icon === 'back' && tone === 'paper' ? microAssetSrc('F05.D01.CTRL.BACK.PARCHMENT.LIGHT') : null;
  if (tile) return <img className="jrn-d01__chip-tile" src={tile} alt="" aria-hidden draggable={false} data-micro-asset="F05.D01.CTRL.BACK.PARCHMENT.LIGHT" />;
  // founder art where the authority draws it: the ink back arrow on the paper tile (Batch 01 / 01) and the amber add
  // tile (Batch 01 / 04, which carries its own tile); the amber back tile stays CSS (Batch 05 / 02 needs correction)
  const art = icon === 'back' && tone === 'paper' ? microAssetSrc('F05.D01.ICON.ARROW.HANDINK') : icon === 'plus' && tone === 'amber' ? microAssetSrc('F05.D01.ICON.PLUS.FRAMED') : null;
  if (art) return <img className="jrn-d01__chip-art" src={art} alt="" aria-hidden draggable={false} data-micro-asset={icon === 'back' ? 'F05.D01.ICON.ARROW.HANDINK' : 'F05.D01.ICON.PLUS.FRAMED'} />;
  // MANAGE POCKET: three ink dots on the paper tile (no overflow glyph in Batches 01–04; line glyph until one exists)
  if (icon === 'more') return <svg viewBox="0 0 24 24" aria-hidden><circle cx="5" cy="12" r="1.9" fill="currentColor" /><circle cx="12" cy="12" r="1.9" fill="currentColor" /><circle cx="19" cy="12" r="1.9" fill="currentColor" /></svg>;
  if (icon === 'back') return <svg viewBox="0 0 24 24" aria-hidden><path d="M19 12H6m6-6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (icon === 'search') return <svg viewBox="0 0 24 24" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (icon === 'close') return <svg viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
