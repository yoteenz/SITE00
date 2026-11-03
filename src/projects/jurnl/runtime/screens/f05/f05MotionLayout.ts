/**
 * F05 MONEY motion pilot — responsive geometry of the layered parent.
 *
 * Everything is laid out in SOURCE px of the founder's 9:16 MONEY reference (941 x 1672; text-free SIDEKICK of the
 * same composition) and drawn inside one board scaled by `u` (screen px per source px). The composition is reproduced
 * exactly at a 9:16 viewport.
 *
 * Phones (taller than 9:16): the board fits the width with at most `crop` source px trimmed from each side (stone and
 * red paper, nothing interactive), and the extra height goes to an elastic panel: the SIDEKICK is drawn as a top slice,
 * a seamless panel tile and a bottom slice, so no pixel is stretched. Papers keep their size; a third row appears only
 * when the panel has room for it with breathing space.
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
  /** rows the panel can hold at this size (2, or 3 on tall phones) */
  capacityRows: number;
  /** rows laid out for this page */
  rows: number;
  /** grid slots for this page, in reading order */
  slots: Slot[];
  /** one paper across both columns (no places yet) */
  wide: Rect;
  /** page indicator row (source px), drawn only with more than one page */
  dots: Rect;
  /** nav paper zone in source px (the live dock sits on it) */
  navZone: Rect;
};

/** How many papers a page holds at this size, before any extra (ADD / MOVE) papers. */
export function capacityFor(W: number, H: number): number {
  const u = Math.min(Math.max(1, W) / (SRC_W - 2 * CROP), Math.max(1, H) / SRC_H);
  const extra = Math.max(0, Math.max(1, H) / u - SRC_H);
  return (extra >= ROW_H[1]! + ROW_GAP + C.thirdRowSlack ? 3 : 2) * 2;
}

/** `items` papers on this page (accounts plus any ADD / MOVE papers). */
export function computeF05MotionLayout(W: number, H: number, items: number): F05MotionLayout {
  const w = Math.max(1, W);
  const h = Math.max(1, H);
  const u = Math.min(w / (SRC_W - 2 * CROP), h / SRC_H);
  const artW = SRC_W * u;
  const ox = (w - artW) / 2;
  const extra = Math.max(0, h / u - SRC_H);
  const sliced = extra >= 1;
  const visibleX: [number, number] = [Math.max(0, -ox / u), Math.min(SRC_W, (w - ox) / u)];
  const capacityRows = extra >= ROW_H[1]! + ROW_GAP + C.thirdRowSlack ? 3 : 2;
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
    navZone: { x: C.nav.x, y: C.nav.y + extra, w: C.nav.w, h: C.nav.h },
  };
}

/** Papers on the page: the accounts, then ADD A PLACE and MOVE MONEY in the free slots when they fit. */
export type PaperItem = { kind: 'account'; index: number } | { kind: 'add' } | { kind: 'move' } | { kind: 'empty' };

export function pageItems(total: number, perPage: number, page: number): PaperItem[] {
  if (total === 0) return [{ kind: 'empty' }];
  const start = page * perPage;
  const onPage = Math.max(0, Math.min(perPage, total - start));
  const items: PaperItem[] = Array.from({ length: onPage }, (_, i) => ({ kind: 'account' as const, index: start + i }));
  const last = start + onPage >= total;
  if (last && items.length < perPage) items.push({ kind: 'add' });
  if (last && total >= 2 && items.length < perPage) items.push({ kind: 'move' });
  return items;
}

/** Screen px rect of a board rect. */
export function toScreen(L: F05MotionLayout, r: Rect): Rect {
  return { x: L.ox + r.x * L.u, y: r.y * L.u, w: r.w * L.u, h: r.h * L.u };
}
