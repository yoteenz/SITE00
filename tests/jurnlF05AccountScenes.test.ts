/**
 * P0.JURNL.F05-MONEY.DOT01.AUTHORITY-FIRST-SHELL-AND-COMPOSITION-RECONSTRUCTION.OPUS2 — the account pages are four
 * compositions, not one template: 02 keeps SK02, 03 / 04 / 05 set their own authority scene; every action stays on
 * screen on a short phone without a page scroll.
 */
import { describe, expect, it } from 'vitest';
import scenes from '../src/projects/jurnl/families/F05_MONEY/DOT01/SCENES/F05_DOT01_SCENES.json';
import { ACCOUNT_COMPOSITIONS, BLOCK_SHARE, FLOOR_ROW_PITCH, MAX_ROW_LIFT, seatActionRows } from '../src/projects/jurnl/runtime/screens/f05/dot01/accountScenes';
import type { Dot01Layout } from '../src/projects/jurnl/runtime/screens/f05/dot01/Dot01Frame';

/** The phone layout Dot01Frame computes (width-first, 30 px crop each side; the field seam at 1540, zone from 588). */
function phone(w: number, h: number): Dot01Layout {
  const u = w / 881;
  const extra = Math.max(0, h / u - 1672);
  return { u, ox: (w - 941 * u) / 2, extra, boardH: 1672 + extra, w, h, ey: 1540, z0: 588 };
}
const VIEWPORTS: [number, number][] = [[360, 780], [375, 667], [393, 660], [393, 852], [430, 932], [471, 836]];
const ROWS = { bank: 3, payout: 3, cash: 4, credit: 4 } as const;

describe('account compositions', () => {
  it('A1 03 / 04 / 05 each set their own authority scene band; none uses 02’s papers or a parent card thumbnail', () => {
    for (const [kind, id] of [['payout', '03'], ['cash', '04'], ['credit', '05']] as const) {
      const c = ACCOUNT_COMPOSITIONS[kind];
      expect(c.source).toBe('AUTHORITY_SCENE_BAND');
      const ids = c.layers.map((l) => l.id);
      expect(ids[0]).toBe(`scene-${id}`);
      expect(ids).not.toContain('balance');
      expect(ids).not.toContain('stats');
      expect(ids).not.toContain('scenic');
      expect(ids).not.toContain('identity');
      const band = scenes.scenes[id].band;
      expect(c.layers[0]!.box).toEqual({ x: band[0], y: band[1], w: band[2]! - band[0]!, h: band[3]! - band[1]! });
      expect(c.layers[0]!.vt).toBe('jrn-place');
    }
    expect(ACCOUNT_COMPOSITIONS.payout.layers.map((l) => l.id)).toContain('seal-03');
  });
  it('A2 02 BANK keeps the SK02 SIDEKICK composition', () => {
    const c = ACCOUNT_COMPOSITIONS.bank;
    expect(c.source).toBe('SK02_SIDEKICK');
    expect(c.layers.map((l) => l.id)).toEqual(['scenic', 'balance', 'stats']);
    expect(c.rowsOnTall).toBe('zone');
  });
  it('A3 each page has its authority’s number of action rows (02: 3 · 03: 3 · 04: 4 · 05: 4)', () => {
    for (const [kind, n] of Object.entries(ROWS)) expect(ACCOUNT_COMPOSITIONS[kind as keyof typeof ROWS].strips).toHaveLength(n);
  });
  it('A4 live text sits on its scene (inside the band), never baked: only text pixels were reconstructed', () => {
    for (const id of ['03', '04', '05'] as const) {
      const s = scenes.scenes[id];
      // the reconstructed share is the text only: under 10 % of the band
      expect(s.masked_px / s.band_px).toBeLessThan(0.1);
      expect(s.source_sha256).toMatch(/^[0-9a-f]{64}$/);
      const kind = id === '03' ? 'payout' : id === '04' ? 'cash' : 'credit';
      const c = ACCOUNT_COMPOSITIONS[kind];
      for (const slot of [c.label, c.value, ...(c.caption ? [c.caption] : [])]) {
        expect(slot.on).toBe(s.band[1]);
        expect(slot.y).toBeGreaterThan(s.band[1]!);
        expect(slot.y + slot.size).toBeLessThan(s.band[3]!);
      }
      for (const y of c.stats.rows) expect(y).toBeLessThan(s.band[3]!);
    }
  });
  it('A5 strip papers keep their own aspect (never squashed to a row)', () => {
    for (const kind of ['payout', 'cash', 'credit'] as const) {
      const c = ACCOUNT_COMPOSITIONS[kind];
      c.stripPapers.forEach((p, i) => {
        const src = ACCOUNT_COMPOSITIONS.bank.stripPapers[i % 3]!;
        expect(Math.abs(p.h / p.w - src.h / src.w)).toBeLessThan(0.002);
      });
    }
  });
});

describe('action rows on every phone', () => {
  it('R1 at the authority’s own aspect the rows sit exactly where the authority sets them', () => {
    const L = { u: 0.5, ox: 0, extra: 0, boardH: 1672, w: 470.5, h: 836, ey: 1540, z0: 588 } as Dot01Layout;
    for (const kind of ['payout', 'cash', 'credit'] as const) {
      const c = ACCOUNT_COMPOSITIONS[kind];
      expect(seatActionRows(c.strips, c.rowsOnTall, L)).toEqual(c.strips.map((r) => r.y));
    }
  });
  it('R2 on every phone viewport the last action is on screen, no row overlaps past the floor pitch, and the lift is bounded', () => {
    for (const [w, h] of VIEWPORTS) {
      const L = phone(w, h);
      const visible = Math.min(L.boardH, L.h / L.u);
      for (const kind of ['bank', 'payout', 'cash', 'credit'] as const) {
        const c = ACCOUNT_COMPOSITIONS[kind];
        const tops = seatActionRows(c.strips, c.rowsOnTall, L);
        const last = c.strips.length - 1;
        expect(tops[last]! + c.strips[last]!.h - 12, `${kind} ${w}x${h}`).toBeLessThanOrEqual(visible - 8 + 0.01);
        for (let i = 1; i < tops.length; i++) expect(tops[i]! - tops[i - 1]!).toBeGreaterThanOrEqual(FLOOR_ROW_PITCH - 0.01);
        const base = c.rowsOnTall === 'block' ? c.strips[0]!.y : tops[0]!;
        expect(base - tops[0]!).toBeLessThanOrEqual(MAX_ROW_LIFT + 0.01);
      }
    }
  });
  it('R3 on a tall phone a scene page keeps its first row seated on its scene and opens its share evenly between rows', () => {
    const L = phone(393, 852);
    for (const kind of ['payout', 'cash', 'credit'] as const) {
      const c = ACCOUNT_COMPOSITIONS[kind];
      const tops = seatActionRows(c.strips, c.rowsOnTall, L);
      const n = c.strips.length;
      expect(tops[0]).toBe(c.strips[0]!.y);
      tops.forEach((t, i) => expect(t).toBeCloseTo(c.strips[i]!.y + (L.extra * BLOCK_SHARE * i) / (n - 1), 5));
    }
  });
});
