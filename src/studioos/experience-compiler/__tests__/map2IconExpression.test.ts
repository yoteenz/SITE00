import { describe, expect, it } from 'vitest';
import { runGreenfieldMap2Pipeline } from '../map2/map2Orchestrator';
import { buildSite00IngestFixture } from '../map2/site00Ingest';
import { compileIconRequirements, semanticIdsForCapability } from '../icons/iconRequirements';
import { classifyIconRequirement, applyClassification } from '../icons/iconClassifier';
import { runIconPipeline } from '../icons/iconPipeline';
import { canonicalIconFilename } from '../icons/iconManifestCompiler';
import { validateIconCoverage, projectVisualIsolation } from '../icons/iconCoverage';
import { applyIconReviewAction } from '../icons/iconReview';
import { appIconStrategy } from '../icons/iconSurfaceVariants';
import { planOpenArtBatches } from '../map2/openartBatchPlanner';
import { compileAuthorityPlan } from '../map2/authorityPlanner';
import { createGateB, approveFamiliesAndSurfaces } from '../map2/familySurfaceGate';
import { runExperienceCompiler } from '../compilerEngine';

describe('icon requirement compiler', () => {
  it('discovers and collapses duplicate semantics', () => {
    const gf = runGreenfieldMap2Pipeline();
    const reqs = gf.icon_pipeline!.icon_requirements.requirements;
    const ids = reqs.map((r) => r.icon_semantic_id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(reqs.length).toBeGreaterThan(5);
  });

  it('classifies implementation types', () => {
    const live = applyClassification({
      icon_semantic_id: 'SEM_BACK',
      canonical_name: 'BACK',
      meaning: 'back',
      category: 'NAVIGATION',
      usage_context: 'nav',
      experience_units: [],
      families: [],
      routes: [],
      surfaces: ['MOBILE_WEB'],
      required_sizes: [16],
      interaction_states: ['DEFAULT'],
      frequency: 'HIGH',
      prominence: 'UTILITY',
      accessibility_label_requirement: 'Back',
      can_use_live_svg: true,
      brand_expression_required: false,
      micro_asset_candidate: false,
      app_nav_variant_required: false,
      compact_variant_required: false,
      display_variant_required: false,
      notes: '',
    });
    expect(live.implementation_class).toBe('LIVE_CODE_SVG');
    expect(classifyIconRequirement({ ...live, brand_expression_required: true, can_use_live_svg: false, notes: '' })).toBe('BRAND_ICON');
  });
});

describe('multi-surface and app icons', () => {
  it('app strategy and variants', () => {
    const gf = runGreenfieldMap2Pipeline();
    const strat = appIconStrategy(gf.icon_pipeline!.icon_requirements.requirements);
    expect(strat.master_to_app_simplification).toBeGreaterThan(0);
    expect(gf.icon_pipeline!.icon_surface_variants.some((v) => v.variant_type === 'APP_NAV')).toBe(true);
  });
});

describe('icon family authority and OpenArt', () => {
  it('icon batch precedes page batches', () => {
    const gf = runGreenfieldMap2Pipeline();
    expect(gf.openart_batches[0].authority_type).toBe('ICON_FAMILY_AUTHORITY');
    expect(gf.authority_plan[0].generation_prompt).toContain('ICON LANGUAGE');
  });

  it('blocks page authority without icon gate', () => {
    const gf = runGreenfieldMap2Pipeline();
    const gate = createGateB();
    approveFamiliesAndSurfaces(gate, gf.families.map((f) => f.family_id));
    expect(() => compileAuthorityPlan(gf.families, gf.surface_expressions, gate)).toThrow(/ICON/);
  });
});

describe('manifest and grok handoff', () => {
  it('canonical filenames and coverage', () => {
    const gf = runGreenfieldMap2Pipeline();
    const entry = gf.icon_pipeline!.icon_manifest.entries[0];
    expect(entry.filename).toMatch(/^icon-/);
    expect(canonicalIconFilename(gf.icon_pipeline!.icon_requirements.requirements[0], 'app', 'active')).toMatch(/app/);
    const cov = validateIconCoverage(gf.icon_pipeline!.icon_requirements.requirements, gf.icon_pipeline!.icon_manifest);
    expect(cov.complete).toBe(true);
  });

  it('grok handoff lists semantic assets', () => {
    const gf = runGreenfieldMap2Pipeline();
    expect(gf.icon_pipeline!.grok_handoff.icon_family_authority_id).toBeTruthy();
    expect(gf.icon_pipeline!.grok_handoff.assets.every((a) => a.semantic_id)).toBe(true);
  });
});

describe('founder icon review lineage', () => {
  it('refine increments version', () => {
    const gf = runGreenfieldMap2Pipeline();
    const { family } = applyIconReviewAction(gf.icon_pipeline!.icon_family, 'REFINE_FAMILY', 'More dimensional');
    expect(family.version).toBe(2);
  });
});

describe('capability semantics without visual leak', () => {
  it('reuses semantics only', () => {
    expect(semanticIdsForCapability('PRODUCT_ASSEMBLY_CONFIGURATOR').length).toBeGreaterThan(3);
    expect(projectVisualIsolation('site00', 'lumina', 'ICON_A', 'ICON_B')).toBe(true);
  });
});

describe('SITE 00 ingest icon validation', () => {
  it('classifies ingest graph without redesign', () => {
    const ingest = buildSite00IngestFixture();
    const icon = runIconPipeline({ project_id: 'site00', graph: ingest.graph, families: [], surface_expressions: [] });
    expect(icon.icon_requirements.requirements.length).toBeGreaterThan(0);
    expect(runExperienceCompiler().nodes.length).toBe(ingest.map1_node_count);
  });
});

describe('greenfield end-to-end', () => {
  it('pipeline includes approved icon slice before authority plan', () => {
    const gf = runGreenfieldMap2Pipeline();
    expect(gf.icon_pipeline?.icon_expression_approved).toBe(true);
    expect(gf.gate_b.icon_expression_approved).toBe(true);
    expect(gf.authority_plan.length).toBeGreaterThan(0);
  });
});
