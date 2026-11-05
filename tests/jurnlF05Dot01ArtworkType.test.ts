/**
 * P0.JURNL.F05-MONEY.DOT01 OPUS3A (interactive artwork) + OPUS3B (typography, parchment geometry, text containment):
 * the contracts behind the browser checks — every overlay title fits its paper's text-safe zone line by line, the safe
 * zones lie inside the drawn papers, content type follows the board, the actions draw the SIDEKICK's own pills (never a
 * CSS rounded rectangle), and every lifted surface exists with its recorded provenance.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OVERLAY_CONTENT, OVERLAY_CONTENT_WIDE, OVERLAY_HEADINGS, contentScale, titleSize } from '../src/projects/jurnl/runtime/screens/f05/dot01/Dot01Frame';

const ROOT = join(__dirname, '..');
const DOT01 = join(ROOT, 'src/projects/jurnl/families/F05_MONEY/DOT01');
const CSS = readFileSync(join(ROOT, 'src/projects/jurnl/runtime/screens/f05/dot01/jurnl-f05-dot01.css'), 'utf8');
/** Every overlay title (14–37) as the sheets set it, with the paper it is drawn on. */
const TITLES: [string[], 'env' | 'wide'][] = [
  [['ADD', 'ACCOUNT'], 'env'], [['ACCOUNT SETUP'], 'wide'], [['EDIT', 'ACCOUNT'], 'env'], [['RENAME', 'POCKET'], 'env'],
  [['RECORD', 'TRANSACTION'], 'wide'], [['RECORD CASH', 'SPENDING'], 'env'], [['RECORD CARD', 'PURCHASE'], 'env'], [['REVIEW', 'PURCHASE'], 'env'],
  [['ADD CASH'], 'env'], [['RECORD CARD', 'PAYMENT'], 'wide'], [['ACCOUNT', 'PURPOSES'], 'env'], [['BALANCE', 'ADJUSTMENT'], 'env'],
  [['CORRECT', 'TRANSACTION'], 'env'], [['CONFIRM', 'CORRECTION'], 'env'], [['CORRECTION', 'SAVED'], 'env'], [['ARCHIVE', 'ACCOUNT'], 'env'],
  [['DELETE THIS', 'POCKET?'], 'env'], [['DELETE', 'POCKET'], 'env'], [['CAPTURE', 'RECEIPT'], 'env'], [['SCANNING', 'RECEIPT'], 'env'],
  [['REVIEW RECEIPT'], 'wide'], [['RECEIPT', 'CAPTURE'], 'env'], [['TRANSACTION', 'REVIEW'], 'env'], [['PURCHASE', 'RECORDED'], 'env'],
];
const ADVANCE = 0.66;
const inside = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;

describe('OPUS3B · overlay titles fit their paper, line by line', () => {
  it("T1 each line of every overlay title fits that line's measure on its paper, at no more than the authority cap", () => {
    for (const [lines, head] of TITLES) {
      const size = titleSize(lines, true, head);
      const H = OVERLAY_HEADINGS[head];
      lines.forEach((l, i) => expect(l.length * ADVANCE * size, `${lines.join(' ')} line ${i + 1}`).toBeLessThanOrEqual(H.lines[Math.min(i, H.lines.length - 1)]! + 0.01));
      expect(size).toBeLessThanOrEqual(lines.length <= 1 ? 80 : lines.length === 2 ? 68 : 50);
      // the block (lines at the 0.94 leading) fits the safe zone's height
      expect(lines.length * size * 0.94).toBeLessThanOrEqual(H.safe.h);
    }
  });
  it('T2 a lower line never gets more width than the line above it (the SK03 paper narrows toward its torn corner)', () => {
    for (const H of Object.values(OVERLAY_HEADINGS)) for (let i = 1; i < H.lines.length; i++) expect(H.lines[i]!).toBeLessThanOrEqual(H.lines[i - 1]!);
  });
  it('T3 the safe zones lie inside the visible papers; the wide paper is drawn at uniform scale (never stretched)', () => {
    expect(inside(OVERLAY_HEADINGS.env.safe, { x: 50, y: 318, w: 590, h: 237 })).toBe(true);
    expect(inside(OVERLAY_HEADINGS.wide.safe, OVERLAY_HEADINGS.wide.paper)).toBe(true);
    const p = OVERLAY_HEADINGS.wide.paper;
    expect(Math.abs(p.w / p.h - 1200 / 330)).toBeLessThan(0.02);
    // the content starts under the paper it belongs to
    expect(OVERLAY_CONTENT_WIDE.y).toBeGreaterThanOrEqual(p.y + p.h);
    expect(OVERLAY_CONTENT.y).toBeGreaterThanOrEqual(OVERLAY_HEADINGS.env.safe.y + OVERLAY_HEADINGS.env.safe.h);
    expect(OVERLAY_CONTENT_WIDE.y + OVERLAY_CONTENT_WIDE.h).toBe(OVERLAY_CONTENT.y + OVERLAY_CONTENT.h);
  });
  it('T4 RECORD TRANSACTION is set larger on its wide paper than it could be on the SK03 paper (the paper, not the type, was the fault)', () => {
    expect(titleSize(['RECORD', 'TRANSACTION'], true, 'wide')).toBeGreaterThan(titleSize(['RECORD', 'TRANSACTION'], true, 'env'));
  });
});

describe('OPUS3B · content type follows the board', () => {
  it('R1 authority-relative between the phone floor and the tablet cap', () => {
    expect(contentScale(0.3)).toBe(0.86);
    expect(contentScale(0.44)).toBeCloseTo(1, 5);
    expect(contentScale(0.5346)).toBeCloseTo(0.5346 / 0.44, 5);
    // 834 x 1194 (board fitted to the height: 1194 / 1672) keeps the phone's proportions
    expect(contentScale(1194 / 1672)).toBeCloseTo(1194 / 1672 / 0.44, 5);
    expect(contentScale(2)).toBe(1.75);
    for (let s = 0.3; s < 2; s += 0.05) expect(contentScale(s + 0.05)).toBeGreaterThanOrEqual(contentScale(s));
  });
});

describe('OPUS3A · actions draw the SIDEKICK pills, never a CSS rounded rectangle', () => {
  const block = CSS.slice(CSS.indexOf('OPUS3A — DOT 01 actions drawn with'));
  it('A1 the last word on .d01-btn is the dark pill as a 9-slice on its caps, with a grounding shadow', () => {
    expect(block.length).toBeGreaterThan(0);
    const rule = block.slice(block.indexOf('.jrn .d01-btn {'), block.indexOf('}', block.indexOf('.jrn .d01-btn {')));
    expect(rule).toMatch(/border-image: url\('[^']*F05_DOT01_PILL_SK03_DARK\.webp'\) 0 58 fill \/ 0 var\(--d01-btn-cap\) \/ 0 stretch/);
    expect(rule).toMatch(/background: none/);
    expect(rule).toMatch(/border-radius: 0/);
    expect(rule).toMatch(/drop-shadow/);
    expect(rule).toMatch(/--d01-btn-cap: calc\(var\(--d01-btn-h\) \* 0\.513\)/);
  });
  it('A2 quiet actions draw the cream pill; the destructive action keeps the authority dark pill (25)', () => {
    const quiet = block.slice(block.indexOf('.jrn .d01-btn--quiet {'), block.indexOf('}', block.indexOf('.jrn .d01-btn--quiet {')));
    expect(quiet).toMatch(/F05_DOT01_PILL_SK03_CREAM\.webp/);
    expect(quiet).toMatch(/border-image-slice: 0 48 fill/);
    const danger = block.slice(block.indexOf('.jrn .d01-btn--danger {'), block.indexOf('}', block.indexOf('.jrn .d01-btn--danger {')));
    expect(danger).not.toMatch(/linear-gradient|border-image: none/);
  });
  it('A3 the cap width keeps each pill at its own aspect (cap slice ÷ source height)', () => {
    const meta = JSON.parse(readFileSync(join(DOT01, 'SCENES/F05_DOT01_PILL_SK03.json'), 'utf8'));
    expect(meta.pills.DARK.cap_slice / meta.pills.DARK.size[1]).toBeCloseTo(0.513, 2);
    expect(meta.pills.CREAM.cap_slice / meta.pills.CREAM.size[1]).toBeCloseTo(0.522, 2);
  });
});

describe('OPUS3A · every lifted surface exists with its provenance (no generated pixel)', () => {
  const meta = JSON.parse(readFileSync(join(DOT01, 'SCENES/F05_DOT01_PILL_SK03.json'), 'utf8'));
  it('L1 pills, the SK03 seal, the record-flow seals and 16 scan art are on disk at their recorded size', () => {
    const files = [meta.pills.DARK, meta.pills.CREAM, meta.seal, ...Object.values(meta.seals), meta.scan_art_16] as { runtime: string; bytes: number }[];
    expect(files.length).toBe(9);
    for (const f of files) {
      const p = join(DOT01, 'SCENES', f.runtime);
      expect(existsSync(p), f.runtime).toBe(true);
      expect(statSync(p).size, f.runtime).toBe(f.bytes);
    }
    expect(meta.source).toBe('F05_DOT01_SK03_SHEET.webp');
    expect(Object.keys(meta.seals).sort()).toEqual(['16', '17', '18', '19', '20']);
    for (const s of Object.values(meta.seals) as { source: string; source_sha256: string }[]) {
      expect(s.source).toMatch(/^(16|17|18|19|20)_.*\.png$/);
      expect(s.source_sha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });
  it('L2 the wide title paper is the approved V9 motion asset 12, mounted (never a generated banner)', () => {
    expect(existsSync(join(DOT01, 'F05_DOT01_12_WIDE_TORN_BANNER.webp'))).toBe(true);
    expect(readFileSync(join(ROOT, 'src/projects/jurnl/runtime/screens/f05/dot01/Dot01Frame.tsx'), 'utf8')).toMatch(/DOT01\['12_WIDE_TORN_BANNER'\]/);
  });
});
