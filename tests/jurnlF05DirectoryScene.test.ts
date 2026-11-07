/**
 * P0.JURNL.F05-MONEY.DOT01.ALL-37-AUTHORITY-SHELL-SIDEKICK-LAYER-AND-ICON-CONVERGENCE.OPUS3 — the ALL ACCOUNTS (06) and
 * EMPTY ACCOUNTS (22) scene-coordinate contract: the pocket count only moves papers inside the card zone, never the
 * action row, landscape or dock; the authority's 2 × 2 lands on its own coordinates; no paper is invented.
 */
import { describe, expect, it } from 'vitest';
import {
  CELL_H,
  CELL_W,
  COL_X,
  DIRECTORY_ACTION,
  DIRECTORY_PAPER,
  EMPTY_SCENE,
  ROW_Y,
  ZONE_BOTTOM,
  ZONE_TOP,
  directoryAbsorb,
  directoryLayout,
  figureSize,
  nameSize,
} from '../src/projects/jurnl/runtime/screens/f05/dot01/directoryScene';
import scene from '../src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENE06.json';

const TALL = 238; // 393 × 852: the board's extra height
const counts = [1, 2, 3, 4, 5, 7, 12];

describe('ALL ACCOUNTS (06) scene coordinates', () => {
  it('C1 four pockets land on the authority 2 × 2 (the papers own top-left corners) at 9:16', () => {
    const D = directoryLayout(4, 0);
    expect(D.scroll).toBe(false);
    expect(D.cells).toEqual([
      { x: COL_X[0], y: ROW_Y[0] },
      { x: COL_X[1], y: ROW_Y[0] },
      { x: COL_X[0], y: ROW_Y[1] },
      { x: COL_X[1], y: ROW_Y[1] },
    ]);
    expect(D.cells[0]).toEqual({ x: DIRECTORY_PAPER.bank.box.x, y: DIRECTORY_PAPER.bank.box.y });
    expect(D.cells[3]!.y).toBe(DIRECTORY_PAPER.cash.box.y);
  });
  it('C2 every count seats exactly that many papers (nothing invented) and none crosses the action row or the title paper', () => {
    for (const n of counts) {
      for (const extra of [-directoryAbsorb(n), 0, TALL]) {
        const D = directoryLayout(n, extra);
        expect(D.cells.length, `n=${n}`).toBe(n);
        const actionsTop = Math.min(DIRECTORY_ACTION.add.box.y, DIRECTORY_ACTION.reorder.box.y) + D.actionsDy;
        if (D.scroll) {
          expect(D.region.y).toBeGreaterThanOrEqual(ZONE_TOP);
          expect(D.region.y + D.region.h).toBeLessThanOrEqual(actionsTop);
          expect(D.region.h).toBeGreaterThanOrEqual(CELL_H * 1.4);
        } else {
          for (const c of D.cells) {
            expect(c.y, `n=${n} extra=${extra}`).toBeGreaterThanOrEqual(ZONE_TOP);
            expect(c.y + CELL_H, `n=${n} extra=${extra}`).toBeLessThanOrEqual(actionsTop);
            expect(c.x).toBeGreaterThanOrEqual(0);
            expect(c.x + CELL_W).toBeLessThanOrEqual(941);
          }
        }
      }
    }
  });
  it('C3 the action row (and with it the landscape and dock) moves only with the phone height, never with the count', () => {
    for (const extra of [-120, 0, TALL]) {
      const dys = counts.map((n) => directoryLayout(n, extra).actionsDy);
      expect(new Set(dys).size).toBe(1);
      expect(dys[0]).toBe(extra);
    }
  });
  it('C4 1–2 pockets: one row centred in the zone; 3: the single paper centred under the pair; ≥ 5: an internal scroller', () => {
    const one = directoryLayout(1, 0);
    expect(one.cells[0]!.x).toBeCloseTo((941 - CELL_W) / 2, 5);
    const two = directoryLayout(2, 0);
    const mid = (two.cells[0]!.y + two.cells[0]!.y + CELL_H) / 2;
    expect(Math.abs(mid - (ZONE_TOP + ZONE_BOTTOM) / 2)).toBeLessThan(4);
    const three = directoryLayout(3, 0);
    expect(three.cells[2]!.x).toBeCloseTo((941 - CELL_W) / 2, 5);
    expect(three.cells[2]!.y).toBe(ROW_Y[1]);
    const many = directoryLayout(7, 0);
    expect(many.scroll).toBe(true);
    expect(many.cells[6]!.y).toBeGreaterThan(many.region.h);
  });
  it('C5 a short screen only closes slack: 3–4 pockets keep the exact 2 × 2 (the board is fitted instead)', () => {
    expect(directoryAbsorb(0)).toBe(0);
    expect(directoryAbsorb(3)).toBe(0);
    expect(directoryAbsorb(4)).toBe(0);
    expect(directoryAbsorb(2)).toBeGreaterThan(150);
    expect(directoryAbsorb(6)).toBeGreaterThan(0);
  });
  it('C6 the four 06 papers are lifted from the V9 06 PNG (hash recorded), one per kind, inside the board', () => {
    expect(scene.source).toBe('06_ALL_ACCOUNTS.png');
    expect(scene.source_sha256).toBe('4161e4075db14d2e7dd324385ab204da7dd052cc18ae8a6a63e5413f48113859');
    expect(Object.keys(DIRECTORY_PAPER).sort()).toEqual(['bank', 'cash', 'credit', 'payout']);
    for (const p of Object.values(DIRECTORY_PAPER)) {
      expect(p.box.x).toBeGreaterThanOrEqual(0);
      expect(p.box.x + p.box.w).toBeLessThanOrEqual(941);
      expect(p.box.w).toBeGreaterThan(400);
      expect(p.box.h).toBeGreaterThan(220);
    }
  });
  it('C7 live type stays on the parchment: long names and figures shrink, never below their floor', () => {
    expect(nameSize(['BANK', 'ACCOUNT'])).toBe(37);
    expect(nameSize(['NEIGHBOURHOOD CREDIT', 'UNION EVERYDAY CHECKING'])).toBe(27);
    expect(figureSize('$1,260')).toBe(62);
    expect(figureSize('$1,234,567.89')).toBeLessThan(62);
    expect(figureSize('$1,234,567,890.00')).toBe(40);
  });
});

describe('EMPTY ACCOUNTS (22) scene coordinates', () => {
  it('E1 the seam is plain sheet between the copy and the type papers; the band is lifted from the V9 22 PNG', () => {
    expect(EMPTY_SCENE.copy.y + EMPTY_SCENE.copy.size * 2.4).toBeLessThan(EMPTY_SCENE.seam);
    expect(EMPTY_SCENE.seam).toBeLessThan(EMPTY_SCENE.papers[0]![1]);
    expect(scene.empty.source_sha256).toBe('4f70fa1e61de3b38d8a01564d9aec7eaf40a93e0cd4cb34c27bcfc0ed8a96a12');
    expect(scene.empty.tile[1]).toBe(EMPTY_SCENE.seam);
  });
  it('E2 the four type papers and the two strips are inside the band, in the authority order', () => {
    const [, y0, , y1] = EMPTY_SCENE.band;
    for (const b of [...EMPTY_SCENE.papers, EMPTY_SCENE.add, EMPTY_SCENE.learn]) {
      expect(b[1]).toBeGreaterThanOrEqual(y0);
      expect(b[3]).toBeLessThanOrEqual(y1);
    }
    expect(EMPTY_SCENE.papers[2]![1]).toBeGreaterThan(EMPTY_SCENE.papers[0]![3]);
    expect(EMPTY_SCENE.add[1]).toBeGreaterThan(EMPTY_SCENE.papers[3]![3]);
    expect(EMPTY_SCENE.learn[1]).toBeGreaterThan(EMPTY_SCENE.add[3]);
  });
});
