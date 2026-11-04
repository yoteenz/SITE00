/**
 * F05 DOT 01 — the per-screen compositions of the account pages (authorities 02 BANK ACCOUNT · 03 RIDESHARE CARD ·
 * 04 CASH ON HAND · 05 CREDIT CARD).
 *
 * The page (AccountPage) owns the data, the actions, the chips, the Pocket hold and accessibility. A composition owns
 * only where things sit, in authority px (941 × 1672): its art layers, the live-text slots (label, figure, caption),
 * the summary rows and the action rows. Nothing here reads money.
 *
 *  02 BANK      the SK02 SIDEKICK: its CURRENT BALANCE paper, summary paper, scenic paper and three strip papers.
 *  03 / 04 / 05 their own authority SCENE BAND (scripts/jurnl/f05-motion-pilot/extract_dot01_account_scenes.py): the
 *               band under the title paper, lifted from the lossless V9 authority with only its live-text pixels
 *               reconstructed. It carries each page's own keychain / amphora / bronze coin on red fabric, summary
 *               parchment, landscape and botanicals at the authority's own scale. 03 also sets its car seal over the
 *               laurel. The action rows are SK02's strip papers at the authority's row positions (live labels).
 * V9 supplied no separate layer for the keychain, the amphora or the coin; see the recovery request in
 * JURNL/MANIFEST/F05_MONEY_DOT01_AUTHORITY_SCENES_V1/07_MAJOR_ARTWORK_SOURCE_RECOVERY.md.
 */
import scenes from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENES.json';
import scene03 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_03.webp';
import scene04 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_04.webp';
import scene05 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE_05.webp';
import seal03 from '../../../../families/F05_MONEY/DOT01/SCENES/F05_DOT01_SEAL_03.webp';
import type { Dot01Kind } from '../../../../data/f05/dot01/accountView';
import { DOT01, DOT01_GEOMETRY } from './dot01Assets';
import { by, type BoardRect, type Dot01Layer, type Dot01Layout } from './Dot01Frame';

export type TextTone = 'ink' | 'cream' | 'gold';
/**
 * A live-text slot: x / y is the top-left of the text box, w its width, size the font size (board px). `on` is the top of
 * the art it is set on: the slot moves with that art on a tall phone (top = by(L, on) + y − on), so text never drifts off
 * its paper or its plate.
 */
export type TextSlot = { x: number; y: number; w: number; size: number; align: 'left' | 'center'; tone: TextTone; lines?: number; on: number; track?: number; leading?: number };
export type AccountComposition = {
  /** the authority this composition answers to */
  authority: '02_BANK_ACCOUNT' | '03_RIDESHARE_CARD' | '04_CASH_ON_HAND' | '05_CREDIT_CARD';
  /** where its art comes from */
  source: 'SK02_SIDEKICK' | 'AUTHORITY_SCENE_BAND';
  /** the art, in paint order; the scene (or 02's balance paper) carries the parent → child shared element */
  layers: Dot01Layer[];
  label: TextSlot;
  value: TextSlot;
  /** OWED (a liability only; 05 sets it between two short rules) */
  caption?: TextSlot;
  /** the balance area: hold it to manage the Pocket (`on` as for a slot) */
  hold: BoardRect & { on: number };
  /** the summary rows: left edge and width, the top of each row, the label size, the figure size (em of the label), the
   * leading of a label that takes two lines; `rules` are drawn rules (null where the art carries its own); `on` as for
   * a slot */
  stats: { x: number; w: number; rows: number[]; size: number; valueEm?: number; leading?: number; track?: number; rules: number[] | null; on: number };
  /** the action rows (buttons) and the strip papers under them, in authority px */
  strips: BoardRect[];
  stripPapers: BoardRect[];
  /** how the rows take a tall phone's extra height (seatActionRows) */
  rowsOnTall: 'zone' | 'block';
  /** the strip label size (board px) where the authority sets it smaller than 02 */
  stripLabel?: number;
};

const G = DOT01_GEOMETRY.SK02;
const box = (b: number[]): BoardRect => ({ x: b[0]!, y: b[1]!, w: b[2]! - b[0]!, h: b[3]! - b[1]! });
const BAL = box(G.balance.box);
const STATS = box(G.stats.box);
const SCENIC = box(G.scenic.box);
const STRIPS = [box(G.strip_1.box), box(G.strip_2.box), box(G.strip_3.box)];
export const STRIP_SRC = [DOT01.SK02_STRIP_1, DOT01.SK02_STRIP_2, DOT01.SK02_STRIP_3];

/**
 * A strip paper seated on an authority action row: the row's width, the paper's own aspect (never squashed), centred on
 * the row. Neighbouring papers overlap a little, as SK02's own strips do (1149–1286 / 1272–1419).
 */
function seatPaper(row: BoardRect, i: number): BoardRect {
  const p = STRIPS[i % 3]!;
  const h = Math.round((p.h / p.w) * row.w);
  return { x: row.x, y: Math.round(row.y + row.h / 2 - h / 2), w: row.w, h };
}

const bank: AccountComposition = {
  authority: '02_BANK_ACCOUNT',
  source: 'SK02_SIDEKICK',
  layers: [
    { id: 'scenic', src: DOT01.SK02_SCENIC, box: SCENIC, order: 2 },
    { id: 'balance', src: DOT01.SK02_BALANCE, box: BAL, order: 0, vt: 'jrn-place' },
    { id: 'stats', src: DOT01.SK02_STATS, box: STATS, order: 1 },
  ],
  label: { x: BAL.x + 20, y: BAL.y + 40, w: BAL.w - 40, size: 42, align: 'center', tone: 'ink', lines: 2, on: BAL.y },
  value: { x: BAL.x + 10, y: BAL.y + 140, w: BAL.w - 20, size: 100, align: 'center', tone: 'ink', on: BAL.y },
  caption: { x: BAL.x, y: BAL.y + 232, w: BAL.w, size: 20, align: 'center', tone: 'ink', on: BAL.y },
  hold: { ...BAL, on: BAL.y },
  stats: { x: STATS.x + 36, w: STATS.w - 78, rows: [0, 1, 2].map((i) => STATS.y + 46 + i * 78), size: 31, rules: [1, 2].map((i) => STATS.y + 46 + i * 78 - 24), on: STATS.y },
  strips: STRIPS,
  stripPapers: STRIPS,
  rowsOnTall: 'zone',
};

type SceneId = '03' | '04' | '05';
type RawSlot = { x: number; y: number; w: number; size: number; align: string; tone: string; lines?: number; track?: number; leading?: number };
type SceneEntry = { band: number[]; seal?: { box: number[] }; slots: { label: RawSlot; value: RawSlot; caption?: RawSlot }; stats: { x: number; w: number; rows: number[]; size: number; value_em?: number; leading?: number; track?: number }; strips: number[][]; strip_label?: number };
const SCENE_SRC: Record<SceneId, string> = { '03': scene03, '04': scene04, '05': scene05 };
const AUTHORITY: Record<SceneId, AccountComposition['authority']> = { '03': '03_RIDESHARE_CARD', '04': '04_CASH_ON_HAND', '05': '05_CREDIT_CARD' };

function slot(s: RawSlot, on: number): TextSlot {
  return { x: s.x, y: s.y, w: s.w, size: s.size, align: s.align === 'center' ? 'center' : 'left', tone: s.tone === 'gold' ? 'gold' : s.tone === 'ink' ? 'ink' : 'cream', lines: s.lines, on, track: s.track, leading: s.leading };
}

function fromScene(id: SceneId, hold: BoardRect): AccountComposition {
  const s = scenes.scenes[id] as SceneEntry;
  const [x0, y0, x1, y1] = s.band as [number, number, number, number];
  const rows = s.strips.map(([x, y, w, h]) => ({ x: x!, y: y!, w: w!, h: h! }));
  return {
    authority: AUTHORITY[id],
    source: 'AUTHORITY_SCENE_BAND',
    layers: [
      { id: `scene-${id}`, src: SCENE_SRC[id], box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, order: 0, className: 'jrn-d01__scene', vt: 'jrn-place' },
      ...(s.seal ? [{ id: `seal-${id}`, src: seal03, box: { x: s.seal.box[0]!, y: s.seal.box[1]!, w: s.seal.box[2]!, h: s.seal.box[3]! }, order: 1 }] : []),
    ],
    label: slot(s.slots.label, y0),
    value: slot(s.slots.value, y0),
    caption: s.slots.caption ? slot(s.slots.caption, y0) : undefined,
    hold: { ...hold, on: y0 },
    stats: { x: s.stats.x, w: s.stats.w, rows: s.stats.rows, size: s.stats.size, valueEm: s.stats.value_em, leading: s.stats.leading, track: s.stats.track, rules: null, on: y0 },
    strips: rows,
    stripPapers: rows.map(seatPaper),
    rowsOnTall: 'block',
    stripLabel: s.strip_label,
  };
}

/** The four account compositions (bank 02 · payout 03 · cash 04 · credit 05). The hold box is the balance area. */
export const ACCOUNT_COMPOSITIONS: Record<Dot01Kind, AccountComposition> = {
  bank,
  payout: fromScene('03', { x: 84, y: 598, w: 300, h: 214 }),
  cash: fromScene('04', { x: 418, y: 588, w: 416, h: 162 }),
  credit: fromScene('05', { x: 84, y: 632, w: 358, h: 252 }),
};

/** The tightest row pitch on a short phone (board px): the next paper's torn top stays clear of this row's label. */
export const MIN_ROW_PITCH = 95;
/** The furthest the first row may rise into the lower edge of its scene (the torn foot of the summary parchment). */
export const MAX_ROW_LIFT = 40;
/** The share of a tall phone's extra height that opens between a scene page's rows (the rest is above the landscape). */
export const BLOCK_SHARE = 0.4;
/** The pitch below which rows are never closed, even when the last row still does not fit. */
export const FLOOR_ROW_PITCH = 84;

/**
 * Where the action rows sit for this viewport: each row's top, in board px after the tall-phone mapping.
 *  tall phone   `zone` (02): every row moves with by(), as SK02's own papers do. `block` (03–05): the first row stays
 *               seated on the foot of its scene, as the authority sets it (it covers the scene's lower edge), and
 *               BLOCK_SHARE of the extra height opens evenly between the rows; the rest goes above the landscape.
 *  short phone  (the board's foot is below the screen): the rows close up toward MIN_ROW_PITCH, then the group rises up
 *               to MAX_ROW_LIFT into the scene's foot, then (only if still needed) closes toward FLOOR_ROW_PITCH, so the
 *               last action stays on screen with no page scroll. Paper sizes never change.
 */
export function seatActionRows(rows: BoardRect[], mode: 'zone' | 'block', L: Dot01Layout): number[] {
  const n = rows.length;
  const tops = rows.map((r, i) => (mode === 'zone' ? by(L, r.y) : r.y + (n > 1 ? (L.extra * BLOCK_SHARE * i) / (n - 1) : 0)));
  if (n < 2) return tops;
  const visible = Math.min(L.boardH, L.h / L.u);
  const foot = tops[n - 1]! + rows[n - 1]!.h - 12; // the last button's bottom
  let over = foot - (visible - 8);
  if (over <= 0.5) return tops;
  const steps = tops.slice(1).map((t, i) => t - tops[i]!);
  const close = (floor: number, need: number) => {
    const slack = steps.map((st) => Math.max(0, st - floor));
    const total = slack.reduce((a, b) => a + b, 0);
    const take = Math.min(need, total);
    if (total > 0) slack.forEach((sl, i) => (steps[i] = steps[i]! - (sl * take) / total));
    return take;
  };
  over -= close(MIN_ROW_PITCH, over);
  const lift = Math.min(Math.max(0, over), MAX_ROW_LIFT);
  over -= lift;
  if (over > 0) close(FLOOR_ROW_PITCH, over);
  const out = [tops[0]! - lift];
  steps.forEach((st, i) => out.push(out[i]! + st));
  return out;
}

/** Rows closer than this (board px) carry smaller icons, so an engraved icon never runs into the next row's. */
export const TIGHT_ROW_PITCH = 112;
