import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildBlueprint, OUT_DIR, renderArtifacts } from '../scripts/jurnl/structural-blueprint/build';
import { FAMILY_CANON } from '../scripts/jurnl/structural-blueprint/model';

const FAMILY_FILE_KEYS = [
  'family_id', 'name', 'purpose', 'product_job', 'parent', 'children', 'grandchildren', 'drawers', 'sheets', 'modals', 'states', 'interactions', 'routes',
  'global_dependencies', 'data_dependencies', 'owned_data', 'read_data', 'write_data', 'shared_primitives', 'responsive_contract', 'accessibility_contract',
  'analytics_hooks', 'security_requirements', 'functional_status', 'visual_status', 'expression_status', 'plate_policy', 'icon_requirements',
  'reference_requirements', 'generation_requirements', 'approval_requirements', 'functional_blockers', 'implementation_dependencies', 'reusable_capability_candidates',
];

const NODE_KEYS = [
  'node_id', 'family_id', 'parent_id', 'node_type', 'name', 'purpose', 'route', 'route_status', 'implementation_status', 'functional_status', 'visual_status',
  'approval_status', 'launch_status', 'data_dependencies', 'interaction_dependencies', 'auth_requirements', 'responsive_requirements', 'accessibility_requirements',
  'analytics_events', 'SEO_requirement', 'expression_status', 'reference_requirement', 'generation_requirement', 'plate_policy', 'icon_requirements',
  'reusable_capability_candidate', 'notes',
];

describe('JURNL structural blueprint', () => {
  const files = renderArtifacts();
  const B = buildBlueprint();

  it('committed artifacts match the generator (run build.ts after changing the model or the contracts)', () => {
    for (const [name, body] of Object.entries(files)) {
      const path = join(OUT_DIR, name);
      expect(existsSync(path), name).toBe(true);
      expect(readFileSync(path, 'utf8'), name).toBe(body);
    }
  });

  it('keeps the F01–F16 canon and writes one structural blueprint per family', () => {
    expect(FAMILY_CANON.map(([id]) => id)).toEqual(Array.from({ length: 16 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`));
    for (const [id] of FAMILY_CANON) {
      const name = Object.keys(files).find((f) => f.startsWith(`${id}_`) && f.endsWith('_STRUCTURAL_BLUEPRINT.json'));
      expect(name, id).toBeTruthy();
      const fam = JSON.parse(files[name!]!) as Record<string, unknown>;
      for (const key of FAMILY_FILE_KEYS) expect(fam, `${id}.${key}`).toHaveProperty(key);
      expect(B.nodes.filter((n) => n.family_id === id && n.node_type === 'FAMILY_PARENT')).toHaveLength(1);
    }
  });

  it('every node carries the canonical fields', () => {
    const graph = JSON.parse(files['JURNL_CANONICAL_PRODUCT_GRAPH.json']!) as { nodes: Record<string, unknown>[] };
    for (const n of graph.nodes) for (const key of NODE_KEYS) expect(n, `${String(n.node_id)}.${key}`).toHaveProperty(key);
  });

  it('graph validates: no orphans, no dangling targets, every target route reachable, every gap has a wave', () => {
    const v = B.summary.validation;
    expect(v.orphans).toEqual([]);
    expect(v.dangling_opens).toEqual([]);
    expect(v.target_unreachable).toEqual([]);
    expect(v.incomplete_nodes_without_wave).toEqual([]);
  });

  it('reports the families the product cannot reach today', () => {
    expect(B.summary.validation.family_parents_unreachable_today).toEqual(['F06.00', 'F07.00', 'F09.00', 'F10.00', 'F11.00', 'F13.00', 'F14.00', 'F15.00', 'F16.00']);
  });

  it('a placeholder is never functional', () => {
    for (const n of B.nodes.filter((x) => x.functional_status === 'PLACEHOLDER')) expect(n.functional_score, n.node_id).toBeLessThan(1);
    for (const id of ['F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16']) expect(B.nodes.find((n) => n.node_id === `${id}.00`)!.functional_status).toBe('PLACEHOLDER');
  });

  it('reaches 100% functional without any generation', () => {
    expect(B.summary.generation.GENERATION_REQUIRED_TO_REACH_100_PERCENT_FUNCTIONAL).toBe('NO');
    expect(B.summary.generation.NEW_PAID_GENERATIONS).toBe(0);
    expect(B.nodes.every((n) => n.generation_requirement.required_for_functional === false)).toBe(true);
    const sim = B.summary.simulation.map((s) => s.functional_completion);
    expect(sim[sim.length - 1]).toBe(100);
    for (let i = 1; i < sim.length; i++) expect(sim[i]!).toBeGreaterThanOrEqual(sim[i - 1]!);
  });

  it('keeps the four progress axes in range and separate', () => {
    const c = B.summary.completion;
    for (const v of [c.FUNCTIONAL, c.VISUAL, c.APPROVAL, c.LAUNCH]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(100);
    }
    expect(c.APPROVAL).toBeLessThan(c.VISUAL);
  });
});
