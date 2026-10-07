/**
 * P0.JURNL.PARENT-CHILD.VISUAL-DERIVATION.PROTOCOL1 + P0.JURNL.CHECK-PURCHASE.PAY-WITH-DRAWER.MATCH-CATEGORY-DRAWER1.
 * Proves: the parent is the only top visual authority and current screens are information only; sibling sheets are
 * checked against one sizing system; the derivation brief stays inside the prompt budget; the SAFE TO SPEND family tree
 * and the PAY WITH drawer spec are recorded (SELECT A CATEGORY measured from its reference; the current account drawer
 * DRIFTs, the built one MATCHES); exports in sync.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AUTHORITY_HIERARCHY,
  GENERATOR_PROMPT_BUDGET,
  checkSiblingSheets,
  jurnlStsFamily as J,
  type SelectionSheetSystem,
} from '../shared/studioos-visual-authority/index';
import { buildJurnlParentChildExports } from '../scripts/studioos/jurnl-parent-child-derivation-export';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');

const category: SelectionSheetSystem = {
  sheet: 'SELECT A CATEGORY',
  header: { title: 'SELECT A CATEGORY', subtext: 'CHOOSE WHAT THIS PURCHASE IS FOR.', align: 'CENTER', close: true, drag_handle: true },
  grid: { columns: 3, rows_visible: 3, overflow: 'SCROLL' },
  tile: { width: 0.3, aspect: 1, radius: 0.04, crop: 'centered object' },
  gap: { column: 0.05, row: 0.06 },
  label: { cap_height: 0.022, tracking_em: 0.2, position: 'BELOW_TILE', case: 'UPPERCASE' },
  padding: { side: 0.06, top: 0.05, bottom: 0.08 },
};

describe('authority hierarchy', () => {
  it('the approved parent is the only top visual authority; current screens are information only', () => {
    expect(AUTHORITY_HIERARCHY[0]).toMatchObject({ rank: 1, kind: 'APPROVED_PARENT', governs: 'VISUAL' });
    expect(AUTHORITY_HIERARCHY.find((a) => a.kind === 'CURRENT_SCREEN')!.governs).toBe('INFORMATION');
  });
});

describe('sibling sheets', () => {
  it('a sheet built on the same system is MATCHED', () => {
    const account = { ...category, sheet: 'SELECT AN ACCOUNT', header: { ...category.header, title: 'SELECT AN ACCOUNT', subtext: J.PAY_WITH_DRAWER.subtext }, tile: { ...category.tile, width: 0.31 } };
    expect(checkSiblingSheets(category, account)).toEqual({ verdict: 'MATCHED', drift: [] });
  });

  it('larger, looser tiles, bigger labels, other columns or mixed case are DRIFT', () => {
    const loose = { ...category, grid: { ...category.grid, columns: 2 }, tile: { ...category.tile, width: 0.44 }, gap: { column: 0.09, row: 0.1 }, label: { ...category.label, cap_height: 0.03, case: 'MIXED' as never } };
    const r = checkSiblingSheets(category, loose);
    expect(r.verdict).toBe('DRIFT');
    for (const k of ['grid.columns', 'tile.width', 'gap.column', 'label.cap_height', 'UPPERCASE']) expect(r.drift.join(' '), k).toContain(k);
  });
});

describe('SAFE TO SPEND family', () => {
  it('records the parent, the direct descendants and the sibling drawers', () => {
    const byId = Object.fromEntries(J.SAFE_TO_SPEND_FAMILY.map((n) => [n.id, n]));
    expect(byId['F09.00']!.level).toBe('PARENT');
    for (const id of ['F09.WHY', 'F09.CHECK', 'F09.ACCOUNT']) expect(byId[id]!.parent, id).toBe('F09.00');
    expect(byId['F09.ACCOUNT']!.expressions).toEqual(['FULL_PAGE', 'DRAWER']);
    for (const id of ['F09.CHECK.CATEGORY', 'F09.CHECK.PAY_WITH']) expect(byId[id]!.parent, id).toBe('F09.CHECK');
    expect(J.SAFE_TO_SPEND_SIBLING_SHEETS).toContainEqual(['F09.CHECK.CATEGORY', 'F09.CHECK.PAY_WITH']);
    expect(J.JURNL_FAMILY_CONSTANTS.TYPOGRAPHY.join(' ')).toMatch(/Uppercase only/);
    expect(J.JURNL_FAMILY_CONSTANTS.BRAND.join(' ')).toContain('PLAN TODAY. GROW FREELY.');
  });

  it('the PAY WITH drawer has the founder copy, the six accounts, and honest status', () => {
    expect(J.PAY_WITH_DRAWER.title).toBe('SELECT AN ACCOUNT');
    expect(J.PAY_WITH_DRAWER.subtext).toBe('CHOOSE THE ACCOUNT YOU WANT TO USE FOR THIS PURCHASE.');
    expect(J.PAY_WITH_ACCOUNTS.map((a) => a.label)).toEqual(['CHECKING', 'SAVINGS', 'CREDIT CARD', 'DEBIT CARD', 'CASH', 'JOINT ACCOUNT']);
    expect(J.PAY_WITH_DRAWER.sizing_source).toBe('F09.CHECK.CATEGORY');
    expect(J.PAY_WITH_DRAWER.sizing).toMatch(/^MEASURED/);
    expect(J.PAY_WITH_DRAWER.status).toBe('BUILT_IN_RUNTIME');
    expect(J.PAY_WITH_DRAWER.inputs_required).toHaveLength(3);
    for (const i of J.PAY_WITH_DRAWER.inputs_required) expect(J.REFERENCE_FILES.map((r) => `REFERENCES/${r.file}`), i.what).toContain(i.received);
  });

  it('SELECT A CATEGORY is measured; the current account drawer drifts, the built one matches', () => {
    expect(J.CATEGORY_SHEET_SYSTEM.grid.columns).toBe(4);
    expect(J.CATEGORY_SHEET_SYSTEM.tile.width).toBeCloseTo(183 / 785, 3);
    expect(J.PAY_WITH_SIBLING_CHECK.built).toEqual({ verdict: 'MATCHED', drift: [] });
    expect(J.PAY_WITH_SIBLING_CHECK.current.verdict).toBe('DRIFT');
    for (const k of ['grid.columns', 'tile.width', 'gap.column']) expect(J.PAY_WITH_SIBLING_CHECK.current.drift.join(' '), k).toContain(k);
    const byId = Object.fromEntries(J.SAFE_TO_SPEND_FAMILY.map((n) => [n.id, n]));
    expect(byId['F09.CHECK']!.route).toBe('/production/jurnl/runtime/safe/check');
  });

  it('the derivation brief puts references first and stays inside the prompt budget', () => {
    const b = J.PAY_WITH_DERIVATION_BRIEF;
    expect(b.text.split('\n')[0]).toMatch(/^IMAGE 1 .*APPROVED PARENT/);
    expect(b.text).toMatch(/IMAGE 2 .*APPROVED SIBLING/);
    expect(b.text).toMatch(/IMAGE 3 .*CURRENT SCREEN/);
    expect(b.within_budget).toBe(true);
    expect(b.words).toBeLessThanOrEqual(GENERATOR_PROMPT_BUDGET.max_words);
    expect(b.negatives).toBeLessThanOrEqual(GENERATOR_PROMPT_BUDGET.max_negatives);
    expect(b.exact_strings_over_budget).toBe(true);
    expect(b.correction_needed_for).toEqual(['CREDIT CARD', 'DEBIT CARD', 'CASH', 'JOINT ACCOUNT']);
    const quoted = [...b.text.matchAll(/“([^”]+)”/g)].map((m) => m[1]!);
    expect(quoted).toHaveLength(8);
    for (const q of quoted) expect(q, q).toBe(q.toUpperCase());
  });

  it('exports are in sync', () => {
    for (const [name, body] of Object.entries(buildJurnlParentChildExports())) expect(read(`${J.JURNL_FAMILY_DIR}/${name}`), name).toBe(body);
  });
});
