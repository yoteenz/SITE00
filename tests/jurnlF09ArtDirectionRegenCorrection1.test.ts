/**
 * P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1 — authored-authority standard + regen record.
 * Proves: the finish audit and founder verdict now gate composites; the rejected rounds no longer pass; the three concepts
 * keep their territories with distinct art direction; scene prompts are text-free; the render ledger is honest about the
 * blocked retrieval and the resolution exception; no candidate is claimed and no device chrome is assembled.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUTHORED_AUTHORITY_RULE, FINISH_QA, jurnlF09, jurnlF09BP, jurnlF09Regen as R, jurnlGrammar } from '../shared/studioos-visual-authority/index';
import { buildJurnlF09RegenExports } from '../scripts/studioos/jurnl-f09-art-direction-regen-export';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');

describe('authored-authority standard', () => {
  it('records the rule and the finish audit', () => {
    expect(AUTHORED_AUTHORITY_RULE).toMatch(/SCENE PLATE \+ OVERLAY IS NOT/);
    expect(FINISH_QA).toEqual(expect.arrayContaining(['NO_VISIBLE_SCAFFOLDING', 'NO_DEVICE_CHROME', 'WORLD_AT_BENCHMARK', 'UNIFIED_LIGHT_GRADE_GRAIN', 'TYPE_INTEGRITY', 'LOGO_OFFICIAL_INTEGRATED']));
    expect(existsSync(path.join(ROOT, jurnlGrammar.JURNL_RICHNESS_BENCHMARK.path))).toBe(true);
  });

  it('the founder-rejected composite rounds no longer pass the gate', () => {
    expect(jurnlF09BP.JURNL_F09_HYBRID_COMPOSITES.every((c) => c.founder_verdict === 'REJECTED')).toBe(true);
    expect(jurnlF09BP.JURNL_F09_RERUN_COMPOSITES.every((c) => c.founder_verdict === 'REJECTED')).toBe(true);
    expect(jurnlF09BP.jurnlF09HybridStatus().gate.status).toBe('COMPOSITE_AUTHORITY_REQUIRED');
  });
});

describe('regen concepts', () => {
  it('keep the three territories, each with its own art direction, scene prompt and wit', () => {
    expect(R.JURNL_F09_REGEN_CONCEPTS.map((c) => c.territory_id)).toEqual(jurnlF09.JURNL_F09_TERRITORIES.map((t) => t.territory_id));
    expect(new Set(R.JURNL_F09_REGEN_CONCEPTS.map((c) => c.distinct_by)).size).toBe(3);
    for (const c of R.JURNL_F09_REGEN_CONCEPTS) expect(existsSync(path.join(ROOT, c.scene_prompt)), c.scene_prompt).toBe(true);
  });

  it('scene prompts are text-free and name no product copy', () => {
    for (const c of R.JURNL_F09_REGEN_CONCEPTS) {
      const p = read(c.scene_prompt);
      expect(p).toMatch(/DO NOT INCLUDE: any text, letters, numbers, logos/);
      for (const w of ['JURNL', 'SAFE TO SPEND', '$', 'BILLS', 'CHECK A PURCHASE', 'HOME', 'iPhone']) expect(p, w).not.toContain(w);
    }
  });

  it('settles the three open F09 decisions from the founder brief + payload', () => {
    const payload = JSON.parse(read('JURNL/F09_SAFE/F09_FOUNDER_REVIEW_PAYLOAD.json'));
    expect(R.F09_DECISIONS_SETTLED.map((d) => d.id)).toEqual(['D-F09-PRIMARY-ACTION-LABEL', 'D-F09-PURCHASES-BRIDGE', 'D-F09-AVAILABLE-DATE']);
    expect(R.F09_DECISIONS_SETTLED[0]!.decision).toBe(payload.primary_action);
    expect(payload.date_line).toBe('AVAILABLE THROUGH OCT 18');
  });
});

describe('render ledger + status', () => {
  it('is honest: 3 generations, retrieval blocked, below 4K, no candidate claimed', () => {
    const L = R.JURNL_F09_REGEN_RENDER_LEDGER;
    expect(L.primary_generations).toBe(3);
    expect(L.generations.every((g) => g.returned === '864×1536')).toBe(true);
    expect(L.retrieval).toMatch(/^BLOCKED/);
    expect(L.resolution_exception).toMatch(/4K spec cannot be met/);
    expect(R.JURNL_F09_REGEN_STATUS.status).toBe('BLOCKED_ON_SCENE_RETRIEVAL');
    expect(R.JURNL_F09_REGEN_STATUS.candidates_delivered).toBe(0);
    for (const g of L.generations) expect(existsSync(path.join(ROOT, g.preview))).toBe(true);
  });

  it('the assembly sets no device chrome and the layout proof is watermarked', () => {
    const src = read('scripts/jurnl/f09-art-direction-regen-assemble.mjs');
    expect(src).not.toMatch(/9:41|home-indicator|status-bar|statusbar/);
    expect(src).toMatch(/LAYOUT PROOF · NOT AUTHORITY/);
    for (const t of ['T01', 'T02', 'T03']) expect(read(`${R.JURNL_F09_REGEN_DIR}/LAYOUT_PROOF/${t}.html`)).toContain('LAYOUT PROOF · NOT AUTHORITY');
  });

  it('exports are in sync', () => {
    for (const [name, body] of Object.entries(buildJurnlF09RegenExports())) expect(read(`${R.JURNL_F09_REGEN_DIR}/${name}`), name).toBe(body);
  });
});
