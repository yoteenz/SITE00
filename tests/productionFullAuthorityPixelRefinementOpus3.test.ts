/**
 * P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-PIXEL-PERFECT-REFINEMENT.OPUS3
 *
 * Expression family hero restored to the EXPR2 authority (family / record title as the heading, crumb EXPRESSION /
 * FAMILY, project lead subject on the suspended screen, status band after the family tabs), Design pipeline stage
 * objects at the T12 authority size, and the evidence record (matrix / no-scroll / diff / gaps / sheets).
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { expressionHeroSubject } from '../src/site00/components/productionAuthority/expression/expressionMedia';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const ART = 'artifacts/production-full-authority-pixel-refinement-opus3';
const SHELL = read('src/site00/components/productionAuthority/expression/ExpressionFamilyShell.tsx');
const EXF = strip(read('src/site00/styles/site00-production-expression-family.css'));
const PACK = strip(read('src/site00/styles/site00-production-design-pack.css'));

describe('Expression family hero (EXPR2 authority)', () => {
  it('family / record title is the heading; EXPRESSION stays in the crumb', () => {
    expect(SHELL).toContain("<h1>{route.kind === 'detail' && detailName ? detailName : family.title}</h1>");
    expect(SHELL).not.toContain('<h1>EXPRESSION</h1>');
    expect(SHELL).toMatch(/data-testid="expression-breadcrumb"[\s\S]*?>EXPRESSION<\/Link>/);
  });
  it('status band follows the family tabs (authority order)', () => {
    expect(SHELL.indexOf('<LiveStatusBar')).toBeGreaterThan(SHELL.indexOf('data-testid="expression-family-tabs"'));
    expect(SHELL.indexOf('<LiveStatusBar')).toBeLessThan(SHELL.indexOf('className="exf-stage"'));
  });
  it('suspended-screen subject is project-scoped canonical media (no cross-project borrowing)', () => {
    const s = expressionHeroSubject('ndxbook');
    expect(s?.url).toBe('/site00/production-authority-assets/entry-002/subject-2026-portrait.jpg');
    expect(existsSync(path.join(root, 'public', s!.url))).toBe(true);
    expect(expressionHeroSubject('aurora')).toBeNull();
    expect(SHELL).toContain('data-testid="expression-hero-subject"');
  });
  it('phone media-focus hero is 108px (short phones 64px); hero type holds the 8.5px floor', () => {
    expect(EXF).toMatch(/@media \(max-width: 699px\) \{[^@]*?\.exf--media-focus \.exf-hero \{\s*height: 108px;/);
    expect(EXF).toMatch(/\.exf--media-focus \.exf-hero \{\s*height: 64px;/);
    const sec8 = EXF.slice(EXF.indexOf('.exf-hero .exf-hero__screen'));
    for (const m of sec8.matchAll(/font-size: ([\d.]+)px/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(8.5);
  });
  it('body only: no zoom / scale (monochrome via saturate)', () => {
    expect(EXF).not.toMatch(/\bzoom\s*:|scale\s*\(/);
    expect(EXF).toContain('filter: saturate(0)');
  });
});

describe('Design pipeline stage objects at authority size', () => {
  it('76px desktop (native crop, never upscaled), stepped down for tablet / phone / short viewports', () => {
    const sec = PACK.slice(PACK.lastIndexOf('.pxa .pxa-design .pxa-pipeline__steps .pxa-stage {\n  width: 76px;'));
    expect(sec).toMatch(/width: 76px;\s*height: 76px;/);
    for (const px of [62, 46, 64, 52, 32]) expect(sec).toContain(`width: ${px}px;`);
    for (const m of sec.matchAll(/width: (\d+)px;/g)) expect(Number(m[1])).toBeLessThanOrEqual(76);
  });
});

describe('evidence record', () => {
  it('matrix, reports and seven family contact sheets exist', () => {
    for (const f of ['AUTHORITY_MATRIX.json', 'VISUAL_DIFF_REPORT.json', 'NO_SCROLL_REPORT.json', 'UNRESOLVED_AUTHORITY_GAPS.json'])
      expect(existsSync(path.join(root, ART, f)), f).toBe(true);
    for (const fam of ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'])
      expect(existsSync(path.join(root, ART, 'CONTACT_SHEETS', `${fam}_CONTACT_SHEET.jpg`)), fam).toBe(true);
  });
  it('no regression: detector totals after <= before; no horizontal overflow', () => {
    const vd = JSON.parse(read(`${ART}/VISUAL_DIFF_REPORT.json`));
    for (const k of ['crop', 'type', 'spacing', 'geometry', 'media_strip_rows']) expect(vd.totals.after[k], k).toBeLessThanOrEqual(vd.totals.before[k]);
    const ns = JSON.parse(read(`${ART}/NO_SCROLL_REPORT.json`));
    expect(ns.horizontal_overflow_violations.after).toBe(0);
    expect(ns.page_scroll_violations.after).toBeLessThanOrEqual(ns.page_scroll_violations.before);
  });
  it('unresolved authorities stay unresolved (no synthesized approval)', () => {
    const g = JSON.parse(read(`${ART}/UNRESOLVED_AUTHORITY_GAPS.json`));
    const st = Object.fromEntries(g.items.map((i: { id: string; status: string }) => [i.id, i.status]));
    expect(st['U-07']).toBe('STILL_CONFLICTING');
    expect(st['U-08']).toBe('STILL_CONFLICTING');
    expect(st['PORTAL-GATE']).toBe('MISSING_CANONICAL_SOURCE');
    for (const id of ['U-05', 'U-15', 'U-11', 'U-01']) expect(st[id]).toBe('NO_RECOVERED_AUTHORITY');
  });
});
