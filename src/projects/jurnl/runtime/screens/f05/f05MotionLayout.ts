/**
 * F05 MONEY motion pilot — responsive geometry of the layered parent.
 *
 * Everything is laid out in SOURCE px of the founder's 9:16 MONEY reference (941 x 1672; text-free SIDEKICK of the
 * same composition) and drawn inside one board scaled by `u` (screen px per source px). The composition is reproduced
 * exactly at a 9:16 viewport.
 *
 * Phones (taller than 9:16): the board fits the width with at most `crop` source px trimmed from each side (stone and
 * red paper, nothing interactive), and the extra height goes to an elastic panel: the SIDEKICK is drawn as a top slice,
 * a seamless panel tile and a bottom slice, so no pixel is stretched. Papers keep their size and the 2 x 2 grid; the
 * gaps and margins grow.
 * Tablet / desktop (wider than 9:16): the board fits the height and is centred; the sides are an ambient, blurred,
 * darkened copy of the same environment.
 */

import geometry from '../../../families/F05_MONEY/MOTION_PILOT/F05_MOTION_GEOMETRY.json';
import { F05_COMPOSITION as C } from './f05Composition';

export const SRC_W = geometry.source.w;
export const SRC_H = geometry.source.h;
/** Source px that may be cropped from each side on narrow screens. */
export const CROP = C.crop;
export const SEAM_A = geometry.seams.a;
export const SEAM_C = geometry.seams.c;

export type Rect = { x: number; y: number; w: number; h: number };
export type Slot = Rect & { row: number; col: number };

/** The four approved card rects (source px). */
export const APPROVED_SLOTS: Rect[] = [geometry.card_bank, geometry.card_payout, geometry.card_cash, geometry.card_credit].map((c) => {
  const [x0, y0, x1, y1] = c.rect;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
});
const COLS = [APPROVED_SLOTS[0]!.x, APPROVED_SLOTS[1]!.x];
const COL_W = [APPROVED_SLOTS[0]!.w, APPROVED_SLOTS[1]!.w];
const ROW_TOP = APPROVED_SLOTS[0]!.y;
const ROW_H = [Math.max(APPROVED_SLOTS[0]!.h, APPROVED_SLOTS[1]!.h), Math.max(APPROVED_SLOTS[2]!.h, APPROVED_SLOTS[3]!.h)];
const ROW_GAP = APPROVED_SLOTS[2]!.y - (APPROVED_SLOTS[0]!.y + ROW_H[0]!);
const PANEL_BOTTOM = APPROVED_SLOTS[2]!.y + ROW_H[1]!;
const MAX_GAP_GROWTH = 64;

export type F05MotionLayout = {
  /** screen px per source px */
  u: number;
  /** board left edge on screen (negative when the sides are cropped) */
  ox: number;
  /** source px added to the panel by the elastic zone */
  extra: number;
  /** board height in source px */
  boardH: number;
  /** true when the environment is drawn as top slice + tile + bottom slice */
  sliced: boolean;
  /** visible part of the board in source px (x range) */
  visibleX: [number, number];
  /** rows the panel holds: always 2 (the reference grid) */
  capacityRows: number;
  /** rows laid out for this page */
  rows: number;
  /** grid slots for this page, in reading order */
  slots: Slot[];
  /** one paper across both columns (no places yet) */
  wide: Rect;
  /** collection indicator row (source px) */
  dots: Rect;
  /** VIEW ALL ACCOUNTS strip (ACCOUNTS collection) */
  viewAll: Rect;
  /** nav paper zone in source px (the live dock sits on it) */
  navZone: Rect;
};

/**
 * Papers per collection: always the reference's 2 x 2. Every carousel collection (accounts, transfers, commitments,
 * outlook) is four papers in the same four places; a taller screen grows the gaps, it never adds a row, and more than
 * four accounts open the full list from the fourth paper instead of adding pages.
 */
export const PAPERS_PER_COLLECTION = 4;
/** Board px the motion parent may close at the SK01 seam before height-fitting (dock on torn nav paper, same foot as DOT 01). */
export const F05_MOTION_FOOT_ABSORB = 86;
export function capacityFor(_W: number, _H: number): number {
  return PAPERS_PER_COLLECTION;
}

/** Viewports at or below this width always width-fit (crop sides) so mobile browser chrome never pillarboxes. */
export const F05_PHONE_MAX_W = 520;

/** Phones and tall-narrow viewports: fit width and crop the sides. Wider tablets/desktop: fit height and centre. */
export function f05WidthFirstScale(viewportW: number, viewportH: number): boolean {
  const w = Math.max(1, viewportW);
  const h = Math.max(1, viewportH);
  if (w <= F05_PHONE_MAX_W) return true;
  return h / w >= SRC_H / SRC_W;
}

/**
 * Board scale for F05 motion and DOT 01. `contentH` is the vertical space for the board (full viewport, or minus dock).
 */
export function computeF05BoardScale(viewportW: number, viewportH: number, crop = CROP, contentH = viewportH): { u: number; ox: number } {
  const w = Math.max(1, viewportW);
  const vh = Math.max(1, viewportH);
  const ch = Math.max(1, contentH);
  const uW = w / (SRC_W - 2 * crop);
  const uH = ch / SRC_H;
  const widthFirst = f05WidthFirstScale(w, vh);
  const u = widthFirst ? uW : uH;
  const ox = (w - SRC_W * u) / 2;
  return { u, ox };
}

/** `items` papers on this page (accounts plus any ADD / MOVE papers). */
export function computeF05MotionLayout(W: number, H: number, items: number): F05MotionLayout {
  const w = Math.max(1, W);
  const h = Math.max(1, H);
  const avail = h;
  let { u, ox } = computeF05BoardScale(w, h, CROP, avail);
  let extra = Math.max(0, avail / u - SRC_H);
  const deficit = SRC_H - avail / u;
  if (f05WidthFirstScale(w, h) && deficit > 0) {
    const absorb = F05_MOTION_FOOT_ABSORB;
    if (deficit <= absorb) extra = -deficit;
    else {
      extra = -absorb;
      u = avail / (SRC_H - absorb);
      ox = (w - SRC_W * u) / 2;
    }
  }
  const sliced = extra >= 1;
  const visibleX: [number, number] = [Math.max(0, -ox / u), Math.min(SRC_W, (w - ox) / u)];
  const capacityRows = 2;
  const rows = Math.min(capacityRows, Math.max(1, Math.ceil(items / 2)));
  const heights = Array.from({ length: rows }, (_, r) => ROW_H[Math.min(r, 1)]!);
  const contentH = PANEL_BOTTOM - ROW_TOP + extra;
  const free = Math.max(0, contentH - heights.reduce((a, b) => a + b, 0) - ROW_GAP * (rows - 1));
  // The gaps grow first (up to MAX_GAP_GROWTH each); what is left is shared above (42%) and below the papers.
  const gapGrowth = rows > 1 ? Math.min(MAX_GAP_GROWTH, (free * 0.6) / (rows - 1)) : 0;
  const gap = ROW_GAP + gapGrowth;
  const exact = extra < 1 && rows === 2;
  const topPad = exact ? 0 : Math.max(0, (free - gapGrowth * (rows - 1)) * (rows === 1 && extra < 1 ? 0 : 0.42));
  const tops: number[] = [];
  let y = ROW_TOP + topPad;
  for (let r = 0; r < rows; r += 1) {
    tops.push(y);
    y += heights[r]! + gap;
  }
  const slots: Slot[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < 2; c += 1) {
      const approved = extra < 1 && r < 2 ? APPROVED_SLOTS[r * 2 + c]! : null;
      slots.push(approved ? { ...approved, row: r, col: c } : { x: COLS[c]!, y: tops[r]!, w: COL_W[c]!, h: heights[r]!, row: r, col: c });
    }
  }
  const wide = { x: COLS[0]!, y: tops[0]!, w: COLS[1]! + COL_W[1]! - COLS[0]!, h: ROW_H[0]! };
  return {
    u,
    ox,
    extra,
    boardH: SRC_H + extra,
    sliced,
    visibleX,
    capacityRows,
    rows,
    slots,
    wide,
    dots: { x: C.dots.x, y: C.dots.y + extra, w: C.dots.w, h: C.dots.h },
    viewAll: { x: C.viewAll.x, y: C.viewAll.y + extra, w: C.viewAll.w, h: C.viewAll.h },
    navZone: { x: C.nav.x, y: C.nav.y + extra, w: C.nav.w, h: C.nav.h },
  };
}

/**
 * ACCOUNTS collection chrome on the bottom row (authority 01). All places live in the top snap-scroll rail (two visible).
 * 0 places: one wide ADD paper. 1+: ADD A POCKET and (with two or more) MOVE MONEY on the bottom row.
 */
export type PaperItem = { kind: 'account'; index: number } | { kind: 'add' } | { kind: 'move' } | { kind: 'empty' };

/** @deprecated Use {@link bottomRowItems} — accounts render in the horizontal rail, not the 2×2 grid. */
export function accountItems(total: number): PaperItem[] {
  return bottomRowItems(total);
}

export function bottomRowItems(total: number): PaperItem[] {
  if (total === 0) return [{ kind: 'empty' }];
  const items: PaperItem[] = [{ kind: 'add' }];
  if (total >= 2) items.push({ kind: 'move' });
  return items;
}

/** Top-row viewport: exactly two account papers wide (source px). */
export function accountRailViewport(L: F05MotionLayout): Rect {
  const s0 = L.slots[0]!;
  const s1 = L.slots[1]!;
  return { x: s0.x, y: s0.y, w: s1.x + s1.w - s0.x, h: s0.h };
}

/** Horizontal gap between account papers in the rail (source px). */
export function accountRailGap(L: F05MotionLayout): number {
  const s0 = L.slots[0]!;
  const s1 = L.slots[1]!;
  return s1.x - (s0.x + s0.w);
}

/** Board rect of one account paper in the rail; `scrollLeft` is the rail's scroll offset (source px). */
export function accountPaperRect(L: F05MotionLayout, accountIndex: number, scrollLeft = 0): Rect {
  const vp = accountRailViewport(L);
  const s0 = L.slots[0]!;
  const gap = accountRailGap(L);
  const step = s0.w + gap;
  return { x: vp.x + accountIndex * step - scrollLeft, y: vp.y, w: s0.w, h: vp.h };
}

/** Screen px rect of a board rect. */
export function toScreen(L: F05MotionLayout, r: Rect): Rect {
  return { x: L.ox + r.x * L.u, y: r.y * L.u, w: r.w * L.u, h: r.h * L.u };
}
