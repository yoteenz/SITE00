import { describe, expect, it } from 'vitest';
import { runExperienceCompiler } from '../compilerEngine';
import {
  applyGate0Action,
  applyReviewAction,
  assertAuthorityPlanAllowed,
  assertFunctionalReuseWithoutVisualLeakage,
  assertGraphExpansionAllowed,
  buildGreenfieldConceptSet,
  buildGreenfieldProjectIntelligence,
  buildSite00IngestFixture,
  buildSurfaceExpressionsForFamilies,
  canonicalAuthorityFilename,
  classifyExperienceUnit,
  combineReviews,
  compileAuthorityPlan,
  compileExperienceFamilies,
  computeAuthorityReduction,
  createGate0,
  createReviewFromPlan,
  expandConceptToGraph,
  hybridizeConcepts,
  planOpenArtBatches,
  promoteCapabilityFromCustomExperience,
  pushConceptConceptually,
  refineReview,
  regenerateReview,
  resolveProjectMode,
  runGreenfieldMap2Pipeline,
  validateConceptDistinctness,
  approveExperienceGraph,
  applyGateAAction,
  createGateA,
  approveFamiliesAndSurfaces,
  createGateB,
  advanceCapabilityLifecycle,
  sonnetBatchEligible,
  pipelineReadiness,
} from '../map2';

describe('MAP2 project modes', () => {
  it('GREENFIELD / INGEST / HYBRID', () => {
    expect(resolveProjectMode({ has_existing_product: false, preserve_product_truth: false, requires_reconcept: false })).toBe('GREENFIELD');
    expect(resolveProjectMode({ has_existing_product: true, preserve_product_truth: true, requires_reconcept: false })).toBe('INGEST');
    expect(resolveProjectMode({ has_existing_product: true, preserve_product_truth: false, requires_reconcept: true })).toBe('HYBRID');
  });
});

describe('MAP2 greenfield concepting', () => {
  const intelligence = buildGreenfieldProjectIntelligence();
  const set = buildGreenfieldConceptSet(intelligence);

  it('3-concept schema and distinctness', () => {
    expect(set.concepts).toHaveLength(3);
    expect(validateConceptDistinctness(set.concepts).ok).toBe(true);
  });

  it('blocks graph before GATE_0', () => {
    const gate = createGate0();
    expect(() => assertGraphExpansionAllowed(gate)).toThrow(/GATE_0/);
  });

  it('concept approval expands graph', () => {
    const gate = applyGate0Action(createGate0(), 'SELECT', { concept_id: 'DIR_B_PRODUCT_LAB' });
    const concept = set.concepts.find((c) => c.concept_id === 'DIR_B_PRODUCT_LAB')!;
    const graph = expandConceptToGraph(intelligence.project_id, concept, gate);
    expect(graph.nodes.length).toBeGreaterThan(0);
  });

  it('push and hybrid lineage', () => {
    const base = set.concepts[0];
    const pushed = pushConceptConceptually(base);
    expect(pushed.lineage_parent_id).toBe(base.concept_id);
    const hybrid = hybridizeConcepts(set.concepts[1], set.concepts[2], ['CONCIERGE']);
    expect(hybrid.status).toBe('HYBRID');
  });
});

describe('MAP2 gates and families', () => {
  it('families only after graph approval', () => {
    const state = runGreenfieldMap2Pipeline();
    expect(state.gate_a.status).toBe('APPROVED');
    expect(state.graph?.approved).toBe(true);
    expect(state.families.length).toBeGreaterThan(0);
  });

  it('authority plan blocked before GATE_B', () => {
    const gateB = createGateB();
    expect(() => assertAuthorityPlanAllowed(gateB)).toThrow(/GATE_B/);
  });

  it('authority reduction and leverage', () => {
    const state = runGreenfieldMap2Pipeline();
    const stats = computeAuthorityReduction(state.graph!.nodes.length, state.authority_plan);
    expect(stats.reduction_ratio).toBeGreaterThan(1);
    expect(state.authority_plan[0].routes_unlocked).toBeGreaterThan(0);
  });

  it('surface expressions include mobile/tablet/desktop', () => {
    const state = runGreenfieldMap2Pipeline();
    const surfaces = new Set(state.surface_expressions.map((s) => s.surface));
    expect(surfaces.has('MOBILE_WEB')).toBe(true);
    expect(surfaces.has('TABLET_WEB')).toBe(true);
    expect(surfaces.has('DESKTOP_WEB')).toBe(true);
  });
});

describe('MAP2 authority review lineage', () => {
  it('refine, regenerate, combine', () => {
    const entry = {
      authority_id: '01_TEST_MOBILE',
      surface: 'MOBILE_WEB' as const,
      family_id: 'TEST',
      generation_prompt: 'x',
    };
    const r1 = createReviewFromPlan(entry as never, 1);
    const r2 = refineReview({ ...r1 });
    expect(r2.parent_candidate).toBe(r1.candidate_id);
    const r3 = regenerateReview({ ...r1, version: 1 });
    expect(r3.status).toBe('REGENERATE');
    const combined = combineReviews({ ...r1 }, { ...r1, candidate_id: 'other' });
    expect(combined.combined_from.length).toBe(2);
    applyReviewAction(r1, 'LOVE_IT');
    expect(r1.approved_at).toBeTruthy();
  });
});

describe('MAP2 OpenArt and pack', () => {
  it('batch planning and canonical filenames', () => {
    const state = runGreenfieldMap2Pipeline();
    expect(state.openart_batches.length).toBeGreaterThan(0);
    const name = canonicalAuthorityFilename(1, 'PRODUCT_ASSEMBLY', 'APP', 'HOME');
    expect(name).toMatch(/^01_APP_/);
    const webName = canonicalAuthorityFilename(2, 'FAMILY', 'MOBILE_WEB', 'ENTRY');
    expect(webName).toMatch(/MOBILE/);
    expect(webName).not.toMatch(/^02_APP_/);
  });

  it('manifest pack and sonnet eligibility', () => {
    const state = runGreenfieldMap2Pipeline();
    expect(state.authority_pack?.authorities.length).toBe(state.authority_plan.length);
    expect(sonnetBatchEligible(8, false)).toBe(true);
  });
});

describe('MAP2 capabilities firewall', () => {
  it('functional reuse without visual leakage', () => {
    const state = runGreenfieldMap2Pipeline();
    const cap = state.capabilities[0];
    if (cap) {
      expect(assertFunctionalReuseWithoutVisualLeakage(cap, 'other-client')).toBe(true);
      expect(advanceCapabilityLifecycle(cap)).toBe('CATALOG_CAPABILITY');
    }
  });
});

describe('MAP2 SITE00 ingest', () => {
  it('INGEST fixture uses MAP1 graph without 3 concepts', () => {
    const ingest = buildSite00IngestFixture();
    expect(ingest.mode).toBe('INGEST');
    expect(ingest.pipeline_sketch.concept_set).toBeNull();
    expect(ingest.map1_node_count).toBe(runExperienceCompiler().nodes.length);
    expect(ingest.graph.concept_id).toBe('INGEST_PRODUCT_TRUTH');
  });
});

describe('MAP1 backward compatibility', () => {
  it('MAP1 compiler still runs', () => {
    const r = runExperienceCompiler();
    expect(r.nodes.length).toBeGreaterThan(10);
  });
});

describe('MAP2 experience units', () => {
  it('classifies configurators', () => {
    expect(classifyExperienceUnit('/build/step')).toBe('CONFIGURATOR');
  });
});

describe('MAP2 pipeline readiness', () => {
  it('greenfield ready for openart after gate B', () => {
    const state = runGreenfieldMap2Pipeline();
    const { ready_for_openart, blockers } = pipelineReadiness(state);
    expect(ready_for_openart).toBe(true);
    expect(blockers).toHaveLength(0);
  });
});
