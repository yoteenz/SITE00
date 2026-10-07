/**
 * P0.JURNL.F09.REFERENCE-REPLICA1 — the SAFE TO SPEND family built as replicas of the founder's nine reference images.
 * Proves: the references and every isolated asset are on disk at their recorded sizes; the runtime layout is the
 * measured one (selection sheets share SELECT A CATEGORY's system); the routes render the reference screens with no
 * device chrome and uppercase-only copy; the replica fonts respect the OFL reserved name; the interim assets are
 * honestly gated and every one has a 4K job; exports in sync.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { GENERATOR_PROMPT_BUDGET, jurnlF09Replica as R, jurnlStsFamily as J } from '../shared/studioos-visual-authority/index';
import { buildJurnlF09ReplicaExports } from '../scripts/studioos/jurnl-f09-reference-replica-export';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { REF_CATEGORY, REF_CHECK } from '../src/projects/jurnl/runtime/layout/referenceLayout';
import { PAY_WITH_ACCOUNTS, PURCHASE_CATEGORIES } from '../src/projects/jurnl/runtime/screens/CheckPurchaseScreens';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
const BASE = '/production/jurnl/runtime';
const render = (route: string) =>
  renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`${BASE}/${route}`] }, createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode: 'design-preview' }) }))),
  );
const REPLICA_SOURCES = ['src/projects/jurnl/runtime/screens/CheckPurchaseScreens.tsx', 'src/projects/jurnl/runtime/screens/AccountScreens.tsx', 'src/projects/jurnl/runtime/screens/SafeToSpendScreens.tsx', 'src/projects/jurnl/runtime/components/ReferenceStage.tsx', 'src/projects/jurnl/runtime/components/ReferenceLockup.tsx'];

describe('references and assets', () => {
  it('the nine founder references are in the repository at their own size', async () => {
    expect(J.REFERENCE_FILES).toHaveLength(9);
    for (const r of J.REFERENCE_FILES) {
      const meta = await sharp(path.join(ROOT, J.JURNL_REFERENCE_DIR, r.file)).metadata();
      expect([meta.width, meta.height], r.file).toEqual(r.file.startsWith('01') ? [852, 1847] : [853, 1844]);
    }
  });

  it('every isolated asset exists at its recorded size and is imported by the runtime', async () => {
    const src = REPLICA_SOURCES.map(read).join('\n');
    for (const a of R.REPLICA_ASSETS) {
      const file = path.join(ROOT, R.REPLICA_RUNTIME_ASSETS, a.file);
      expect(existsSync(file), a.file).toBe(true);
      const meta = await sharp(file).metadata();
      expect([meta.width, meta.height], a.file).toEqual([a.px.w, a.px.h]);
      expect(src, a.file).toContain(path.basename(a.file));
    }
  });

  it('interim assets are gated honestly and each one has a 4K job inside the prompt budget', () => {
    for (const q of R.REPLICA_ASSET_QUALITY) {
      expect(q.result.verdict, q.file).toBe('BLOCK');
      expect(q.result.upscale, q.file).toBeGreaterThan(1);
    }
    expect(R.REGEN_ROUTE.status).toMatch(/^READY_TO_RUN/);
    const targets = R.REPLICA_ASSETS.filter((a) => a.target_px);
    expect(R.REGEN_JOBS.map((j) => j.file)).toEqual(targets.map((a) => a.file));
    for (const j of R.REGEN_JOBS) {
      for (const prompt of [j.grok_isolate, j.openart_sunburst]) expect(prompt.split(/\s+/).length, j.id).toBeLessThanOrEqual(GENERATOR_PROMPT_BUDGET.max_words);
      expect((j.openart_sunburst.match(/\bno\b/g) ?? []).length, j.id).toBeLessThanOrEqual(GENERATOR_PROMPT_BUDGET.max_negatives);
      expect(j.target_px.w, j.id).toBeGreaterThanOrEqual(512);
    }
    const plates = R.REGEN_JOBS.filter((j) => j.file.startsWith('plates/'));
    expect(plates).toHaveLength(5);
    for (const p of plates) expect(p.target_px.h / p.target_px.w).toBeCloseTo(1844 / 853, 2);
  });
});

describe('layout and sibling sheets', () => {
  it('the runtime category grid is the measured system', () => {
    const b = REF_CATEGORY.box;
    expect(b.tiles_x).toEqual([35, 235, 436, 637]);
    expect(b.tile_w / (b.tiles_x[3] + b.tile_w - b.tiles_x[0])).toBeCloseTo(J.CATEGORY_SHEET_SYSTEM.tile.width, 3);
    expect(b.rows_img_h).toEqual([178, 178, 171]);
    expect(b.rows_y[1] - b.rows_y[0] - b.rows_h[0]).toBe(15);
  });

  it('both sheets render through one SelectionSheet with the founder copy', () => {
    const src = read('src/projects/jurnl/runtime/screens/CheckPurchaseScreens.tsx');
    expect(src.match(/<SelectionSheet\b/g)).toHaveLength(2);
    expect(src).toContain("title=\"SELECT AN ACCOUNT\"");
    expect(src).toContain("'CHOOSE THE ACCOUNT YOU WANT TO USE', 'FOR THIS PURCHASE.'");
    expect(PAY_WITH_ACCOUNTS.map((a) => a.label)).toEqual(J.PAY_WITH_ACCOUNTS.map((a) => a.label));
    expect(PURCHASE_CATEGORIES.map((c) => c.label)).toEqual(['FASHION', 'BEAUTY', 'HOME', 'TRAVEL', 'WELLNESS', 'DINING', 'GROCERIES', 'GIFTS', 'TECH', 'TRANSPORT', 'EVENTS', 'OTHER']);
  });

  it('fitted type sits on the measured ink', () => {
    expect(REF_CHECK.text.title.ink).toEqual([141, 432, 736, 477]);
    expect(REF_CHECK.text.title.family).toBe('serif');
    for (const t of Object.values(REF_CHECK.text)) expect(t.size).toBeGreaterThan(8);
  });
});

describe('runtime', () => {
  it('routes render the reference screens', () => {
    const check = render('safe/check');
    for (const s of ['CHECK A PURCHASE', 'PURCHASE AMOUNT', 'PURCHASE CATEGORY', 'PAY WITH', 'SELECT A CATEGORY', 'SELECT ACCOUNT', 'CHECK PURCHASE']) expect(check, s).toContain(s);
    expect(render('safe/why')).toContain('WHY THIS');
    expect(render('account')).toContain('ONE SETTINGS OWNER.');
    const parent = render('safe');
    for (const s of ['SAFE TO SPEND', 'SEE WHY THIS AMOUNT', 'ORGANIZED.', 'WANT TO SPEND ON SOMETHING?', 'safe-check-purchase']) expect(parent, s).toContain(s);
  });

  it('no device chrome and uppercase-only copy in the replica sources', () => {
    for (const f of REPLICA_SOURCES) {
      const src = read(f);
      expect(src, f).not.toMatch(/9:41/);
      const jsxText = [...src.matchAll(/>([^<>{}\n]*[A-Za-z][^<>{}\n]*)</g)].map((m) => m[1]!.trim()).filter(Boolean);
      for (const t of jsxText) expect(t, `${f}: ${t}`).toBe(t.toUpperCase());
    }
  });

  it('replica fonts are licensed and the modified serif does not use its reserved name', () => {
    const css = read('src/projects/jurnl/runtime/jurnl-reference.css');
    for (const f of ['jost-400.woff2', 'jurnl-authority-serif-500.woff2']) expect(css).toContain(f);
    expect(css).not.toMatch(/playfair-display-\d+\.woff2/);
    for (const f of ['jost-OFL.txt', 'jurnl-authority-serif-OFL.txt']) expect(existsSync(path.join(ROOT, 'public/site00/projects/jurnl/fonts', f)), f).toBe(true);
    expect(read('public/site00/projects/jurnl/fonts/jurnl-authority-serif-OFL.txt')).toMatch(/Modified Version of Playfair Display/);
  });
});

describe('exports', () => {
  it('are in sync with the TypeScript source', () => {
    for (const [name, body] of Object.entries(buildJurnlF09ReplicaExports())) expect(read(`${R.REFERENCE_REPLICA_DIR}/${name}`), name).toBe(body);
  });
});
