/**
 * F05 DOT 01 — ALL ACCOUNTS (authority 06): the scene-coordinate contract of the directory.
 *
 * Board: 941 × 1672 authority px (the V9 06 render), scaled by the frame's `u`; `extra` is the height a phone taller than
 * 9:16 adds (Dot01Layout.extra), inserted by SK01_FIELD's sheet tile at its seam (y 1190).
 *
 *   L0  SK01_FIELD          hero, arch, the large sheet, coastal landscape, laurel, red fabric, torn nav paper
 *   L1  title paper + seal  SK01's own (drawn by the frame)
 *   L1  account papers      the four 06 papers (bank village · rideshare lemon branch · cash amphora · credit coin on
 *                           oxblood), each lifted from 06 with its live text removed; a pocket uses its kind's paper
 *   L1  action surfaces     06's dark-olive ADD and parchment REORDER surfaces, glyphs lifted from 06
 *   L2  live type           pocket names and figures, action labels (board px, never baked)
 *   L3  dock                the global navigation on the baked nav paper
 *
 * Pocket count never moves the rest of the scene: the action row and the landscape keep their authority place (they
 * move only with `extra`), and the papers are seated inside the card zone between the title paper and the action row:
 *   4      the authority's 2 × 2 (cells at the authority's own paper origins)
 *   3      2 + 1, the single paper centred under the pair
 *   1–2    one row, centred in the zone (so the scene stays composed; no paper is invented)
 *   ≥ 5    the zone becomes an internal scroller showing two rows and the top of a third; the page never scrolls
 *   0      authority 22 (EMPTY ACCOUNTS), not this layout
 */
import scene from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE06.json';
import cardBank from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_CARD06_BANK.webp';
import cardPayout from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_CARD06_PAYOUT.webp';
import cardCash from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_CARD06_CASH.webp';
import cardCredit from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_CARD06_CREDIT.webp';
import actionAdd from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_ACTION06_ADD.webp';
import actionReorder from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_ACTION06_REORDER.webp';
import glyphAdd from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_ICON06_ADD.webp';
import glyphReorder from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_ICON06_REORDER.webp';
import type { Dot01Kind } from '../../../../data/f05/dot01/accountView';
import emptyBand from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_22.webp';
import emptyTile from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_22_TILE.webp';
import emptySeal from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_22.webp';

type Box = [number, number, number, number];
const box = (b: number[]) => ({ x: b[0]!, y: b[1]!, w: b[2]! - b[0]!, h: b[3]! - b[1]! });

/** Each kind's 06 paper and its box in the authority (the slot it was drawn in). */
export const DIRECTORY_PAPER: Record<Dot01Kind, { src: string; box: ReturnType<typeof box>; slot: number }> = {
  bank: { src: cardBank, box: box(scene.papers.BANK.box as Box), slot: scene.papers.BANK.slot },
  payout: { src: cardPayout, box: box(scene.papers.PAYOUT.box as Box), slot: scene.papers.PAYOUT.slot },
  cash: { src: cardCash, box: box(scene.papers.CASH.box as Box), slot: scene.papers.CASH.slot },
  credit: { src: cardCredit, box: box(scene.papers.CREDIT.box as Box), slot: scene.papers.CREDIT.slot },
};
export const DIRECTORY_ACTION = {
  add: { src: actionAdd, glyph: glyphAdd, box: box(scene.actions.ADD.box as Box), glyphBox: box(scene.actions.ADD.glyph_box as Box), labelBox: box(scene.actions.ADD.label_box as Box) },
  reorder: { src: actionReorder, glyph: glyphReorder, box: box(scene.actions.REORDER.box as Box), glyphBox: box(scene.actions.REORDER.glyph_box as Box), labelBox: box(scene.actions.REORDER.label_box as Box) },
} as const;

/** Most board px a phone may crop from each side: the papers reach x 28 (left) and 915 (right of 941). */
export const DIRECTORY_MAX_CROP = Math.floor(Math.min(...Object.values(DIRECTORY_PAPER).map((p) => p.box.x), ...Object.values(DIRECTORY_PAPER).map((p) => 941 - (p.box.x + p.box.w)))) - 2;

/** The authority's two columns and two rows (the papers' own top-left corners). */
export const COL_X = [DIRECTORY_PAPER.bank.box.x, DIRECTORY_PAPER.payout.box.x] as const;
export const ROW_Y = [DIRECTORY_PAPER.bank.box.y, DIRECTORY_PAPER.cash.box.y] as const;
/** A cell: as wide and tall as the largest paper, so every kind fits every cell. */
export const CELL_W = Math.max(...Object.values(DIRECTORY_PAPER).map((p) => p.box.w));
export const CELL_H = Math.max(...Object.values(DIRECTORY_PAPER).map((p) => p.box.h));
export const ROW_PITCH = ROW_Y[1] - ROW_Y[0];
/** Height of two rows as drawn (top of row 1 → bottom of row 2). */
const GRID_2 = ROW_PITCH + Math.max(DIRECTORY_PAPER.cash.box.h, DIRECTORY_PAPER.credit.box.h);
const GRID_1 = Math.max(DIRECTORY_PAPER.bank.box.h, DIRECTORY_PAPER.payout.box.h);
/**
 * The card zone: from under the title paper to just above the action row. It is centred so that the authority's two
 * rows land exactly on their own y (ZONE_TOP + (ZONE_H − GRID_2) / 2 = ROW_Y[0]).
 */
export const ZONE_BOTTOM = Math.min(DIRECTORY_ACTION.add.box.y, DIRECTORY_ACTION.reorder.box.y) - 4;
export const ZONE_TOP = 2 * ROW_Y[0] + GRID_2 - ZONE_BOTTOM;

export type DirectoryCell = { x: number; y: number };
export type DirectoryLayout = {
  /** Board-px cells in display order (inside the scroller when `scroll`). */
  cells: DirectoryCell[];
  /** ≥ 5 pockets: the zone scrolls inside itself. */
  scroll: boolean;
  /** The card region (board px): the scroller's box, or the zone the grid is centred in. */
  region: { x: number; y: number; w: number; h: number };
  /** The action row's vertical offset (it moves only with the phone's extra height). */
  actionsDy: number;
};

/** Seat `n` real pockets. `extra` = Dot01Layout.extra (0 at 9:16). Pure: unit-tested. */
export function directoryLayout(n: number, extra: number): DirectoryLayout {
  const zoneTop = ZONE_TOP;
  const zoneBottom = ZONE_BOTTOM + extra;
  const centredX = (941 - CELL_W) / 2;
  if (n >= 5) {
    // two rows and the top of a third visible; rows at the authority's pitch from the authority's first row
    const top = ROW_Y[0] - 4;
    const cells = Array.from({ length: n }, (_, i) => ({ x: COL_X[i % 2]!, y: 4 + Math.floor(i / 2) * ROW_PITCH }));
    return { cells, scroll: true, region: { x: 0, y: top, w: 941, h: zoneBottom - top }, actionsDy: extra };
  }
  const rows = n <= 2 ? 1 : 2;
  const gridH = rows === 1 ? GRID_1 : GRID_2;
  const top = zoneTop + (zoneBottom - zoneTop - gridH) / 2;
  const cells: DirectoryCell[] = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 2);
    const lastAlone = n % 2 === 1 && i === n - 1;
    cells.push({ x: lastAlone ? centredX : COL_X[i % 2]!, y: top + row * ROW_PITCH });
  }
  return { cells, scroll: false, region: { x: 0, y: zoneTop, w: 941, h: zoneBottom - zoneTop }, actionsDy: extra };
}

/**
 * How much height a screen shorter than 9:16 may take out of the sheet (at SK01_FIELD's seam) before the board is
 * fitted to the height: the card zone's slack for this many pockets, so the papers never overlap the action row.
 * 1–2 pockets: one row in the zone (slack 556 − 247 − 40); 3–4: two rows (556 − 494 − 10); ≥ 5: the scroller keeps
 * at least a row and a half.
 */
export function directoryAbsorb(n: number): number {
  const zone = ZONE_BOTTOM - ZONE_TOP;
  if (n <= 0) return 0;
  if (n <= 2) return Math.max(0, zone - GRID_1 - 40);
  if (n <= 4) return 0;
  return Math.max(0, ZONE_BOTTOM - (ROW_Y[0] - 4) - Math.round(ROW_PITCH * 1.5));
}

/**
 * Live type on a paper (board px, relative to the paper's top-left), measured on 06: the name in two lines over the
 * figure, on the plain parchment left of the illustration.
 */
export const PAPER_TYPE = {
  name: { x: 44, y: 44, w: 206, size: 37, min: 27, leading: 0.98, track: 0.02 },
  value: { x: 42, y: 144, w: 214, size: 62, min: 40 },
  caption: { x: 46, y: 214, size: 19 },
  badge: { x: 44, y: 12, size: 17 },
} as const;

/** A name's size: the authority's 37 px unless its longest line would cross into the illustration. */
export function nameSize(lines: string[]): number {
  const longest = Math.max(1, ...lines.map((l) => l.length));
  return Math.max(PAPER_TYPE.name.min, Math.min(PAPER_TYPE.name.size, PAPER_TYPE.name.w / (longest * 0.6)));
}
/** A figure's size: the authority's 62 px, smaller for long figures so it stays on the parchment. */
export function figureSize(text: string): number {
  return Math.max(PAPER_TYPE.value.min, Math.min(PAPER_TYPE.value.size, PAPER_TYPE.value.w / (Math.max(1, text.length) * 0.56)));
}


/**
 * Authority 22 EMPTY ACCOUNTS (board px, measured on the V9 PNG): the lifted band, the seam where a tall phone grows the
 * sheet (between the type papers and the strips), and every live label's place. Boxes are [x0, y0, x1, y1].
 */
export const EMPTY_SCENE = {
  src: emptyBand,
  tile: emptyTile,
  seal: emptySeal,
  sealBox: box(scene.empty_seal.box as Box),
  band: scene.empty.band as Box,
  /** under the copy, above the type papers: the sheet grows (or closes, by at most `absorb`) here */
  seam: 994,
  /** a short screen may close 12 px of plain sheet at the seam; beyond that the board is fitted to the height */
  absorb: 12,
  heading: { y: 806, size: 50 },
  copy: { y: 902, size: 29 },
  papers: [
    [60, 1012, 458, 1140],
    [480, 1012, 878, 1140],
    [60, 1162, 458, 1300],
    [480, 1162, 878, 1300],
  ] as Box[],
  typeSize: 31,
  add: [63, 1332, 875, 1430] as Box,
  addSize: 36,
  learn: [105, 1455, 833, 1537] as Box,
  learnSize: 30,
} as const;
