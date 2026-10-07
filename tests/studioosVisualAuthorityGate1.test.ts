/**
 * P0.SITE00.PRODUCTION-METHODOLOGY.VISUAL-AUTHORITY-DEVELOPMENT-GATE1 — Visual Authority Development Gate.
 * Territory / reference / authority fixtures below are TEST FIXTURES only (not AIO authorities).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { aio as brain, type ExperienceContract } from '../shared/studioos-experience-brain/index';
import {
  AUTHORITY_PRODUCTION_STATES,
  aio,
  checkDerivation,
  checkLegacyUse,
  checkTerritoryDistinctness,
  classifyDeviation,
  evaluateAuthorityGate,
  guardPageGeneration,
  samples,
  type AuthorityGateInput,
  type CompositionTerritory,
  type PageFamilyAuthority,
  type PageTreeConfirmation,
  type ReferenceAuthority,
} from '../shared/studioos-visual-authority/index';
import { VISUAL_AUTHORITY_DOCS_DIR, buildVisualAuthorityExports } from '../scripts/studioos/visual-authority-export';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
const ifta = brain.AIO_IFTA_CONTRACT;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const territory = (id: string, structure: CompositionTerritory['structure'], extra: Partial<CompositionTerritory> = {}): CompositionTerritory => ({
  territory_id: id, project_id: 'AIO', family_id: ifta.family_id, feature_id: ifta.feature_id, actor: 'CLIENT',
  name: `Fixture ${id}`, concept: 'fixture', core_idea: 'fixture', metaphor: 'fixture', primary_object: 'THE QUARTER',
  page_logic: `fixture page logic ${id}`, major_zones: ['zone-a', 'zone-b'], structure, composition_logic: 'fixture',
  actor_fit: 'fixture', state_fit: 'fixture', mobile_logic: 'fixture', desktop_logic: 'fixture', visual_language: 'fixture',
  risks: ['fixture'], brand_fit: 'fixture', experience_fit: 'fixture', status: 'IN_REVIEW', founder_decision: null, ...extra,
});

const TERRITORIES: CompositionTerritory[] = [
  territory('T_A', { spatial_logic: 'room with walls', primary_zone: 'centre bench', visual_hierarchy: 'object first', interaction_emphasis: 'drag into packet', information_density: 'balanced', media_relationship: 'backdrop' }),
  territory('T_B', { spatial_logic: 'horizontal timeline', primary_zone: 'top rail', visual_hierarchy: 'progress first', interaction_emphasis: 'step forward', information_density: 'sparse', media_relationship: 'inset evidence' }),
  territory('T_C', { spatial_logic: 'ledger columns', primary_zone: 'left index', visual_hierarchy: 'flags first', interaction_emphasis: 'resolve inline', information_density: 'dense', media_relationship: 'none' }),
];
const REFS: ReferenceAuthority[] = TERRITORIES.map((t) => ({
  reference_id: `REF_${t.territory_id}`, territory_id: t.territory_id, format: 'WIREFRAME_PLUS_BRAND_RENDER', reference_paths: [`fixtures/${t.territory_id}.png`],
  viewport: 'MOBILE', states_shown: ['COLLECTING'], shows: ['composition', 'hierarchy', 'zones', 'media_relationship', 'interaction_emphasis', 'actor_intent'],
  role: 'PAGE_LOGIC_COMPOSITION_DIRECTION_CONTRACT', paid_generation: false,
}));
const AUTHORITY: PageFamilyAuthority = {
  authority_id: 'AIO.IFTA.CLIENT.PFA.fixture', project_id: 'AIO', family_id: ifta.family_id, feature_id: ifta.feature_id, actor: 'CLIENT',
  viewports: ['MOBILE', 'DESKTOP'], state_coverage: ifta.states.map((s) => s.id), territory_source: ['T_A'], founder_status: 'APPROVED',
  authority_level: 'PAGE_FAMILY_AUTHORITY',
  core_logic_locks: [
    { kind: 'PRIMARY_OBJECT', value: 'THE QUARTER' }, { kind: 'PRIMARY_COMPOSITION', value: 'room with centre bench' },
    { kind: 'MAJOR_ZONES', value: 'quarter header · bench · flags' }, { kind: 'CORE_HIERARCHY', value: 'object first' },
    { kind: 'CTA_HIERARCHY', value: 'one primary action per state' },
  ],
  flexible_implementation_areas: ['SPACING', 'MOTION', 'ACCESSIBILITY'], reference_paths: ['fixtures/T_A.png'],
  brand_context_id: aio.AIO_BRAND_CONTEXT.brand_context_id, experience_contract_id: 'AIO.IFTA@1.0.0', supersedes: null,
  lineage: { created: '2026-10-06', territory_lineage: ['T_A'], founder_decisions: ['LOVE_IT T_A (fixture)'], superseded_by: null },
};

const TREE_CONFIRMED: PageTreeConfirmation = { tree_id: 'fixture.tree', status: 'FOUNDER_CONFIRMED', produced_at: '2026-10-06', confirmed_at: '2026-10-06', founder_decision: 'fixture confirmed' };

const base = (over: Partial<AuthorityGateInput> = {}): AuthorityGateInput => ({
  project_id: 'AIO', family_id: ifta.family_id, feature_id: ifta.feature_id, actor: 'CLIENT', material: true, family_locked: true,
  experience_contract: ifta, brand_context: aio.AIO_BRAND_CONTEXT, legacy_surfaces: aio.AIO_IFTA_LEGACY_SURFACES, ...over,
});
const reviewed = (over: Partial<AuthorityGateInput> = {}) => base({ territories: TERRITORIES, references: REFS, ...over });
const approved = (over: Partial<AuthorityGateInput> = {}) =>
  reviewed({ founder_decision: { verdict: 'LOVE_IT', territory_ids: ['T_A'], notes: 'fixture', decided_at: '2026-10-06' }, page_tree: TREE_CONFIRMED, ...over });

describe('gate states (sprint tests A–H)', () => {
  it('A. family locked + experience missing → EXPERIENCE_REQUIRED', () => {
    const r = evaluateAuthorityGate(base({ experience_contract: null }));
    expect(r.state).toBe('EXPERIENCE_REQUIRED');
    expect(r.durable_rule).toBe('VISUAL_AUTHORITY_REQUIRED');
    expect(r.implementation_ready).toBe(false);
    const thin = clone(ifta) as ExperienceContract;
    thin.perspectives.client = { applicable: false, reason: 'removed' };
    expect(evaluateAuthorityGate(base({ experience_contract: thin })).state).toBe('EXPERIENCE_REQUIRED');
  });

  it('B. experience complete + brand missing (or thin) → BRAND_CONTEXT_REQUIRED', () => {
    expect(evaluateAuthorityGate(base({ brand_context: null })).state).toBe('BRAND_CONTEXT_REQUIRED');
    const thin = { ...aio.AIO_BRAND_CONTEXT, materials: [], typography: '' };
    const r = evaluateAuthorityGate(base({ brand_context: thin }));
    expect(r.state).toBe('BRAND_CONTEXT_REQUIRED');
    expect(r.reasons.join(' ')).toMatch(/materials/);
    expect(r.conditions.EXPERIENCE_CONTRACT_LOADED).toBe(true);
  });

  it('C. brand + experience + no territories → AUTHORITY_TERRITORIES_REQUIRED', () => {
    expect(evaluateAuthorityGate(base({ territories: [] })).state).toBe('AUTHORITY_TERRITORIES_REQUIRED');
    expect(evaluateAuthorityGate(base({ territories: [] })).guard).toBe('VISUAL_AUTHORITY_REQUIRED');
    // Territories without references are not reviewable yet.
    expect(evaluateAuthorityGate(base({ territories: TERRITORIES })).guard).toBe('REFERENCE_AUTHORITY_REQUIRED');
  });

  it('D. territories + references + no founder decision → AUTHORITY_IN_REVIEW', () => {
    const r = evaluateAuthorityGate(reviewed());
    expect(r.state).toBe('AUTHORITY_IN_REVIEW');
    expect(r.conditions.COMPOSITION_TERRITORIES_EXIST && r.conditions.REFERENCE_AUTHORITY_EXISTS).toBe(true);
    for (const verdict of ['REVISE', 'REJECT', 'REQUEST_FOURTH_TERRITORY'] as const) {
      expect(evaluateAuthorityGate(reviewed({ founder_decision: { verdict, territory_ids: ['T_A'], notes: '', decided_at: '2026-10-06' } })).state).toBe('AUTHORITY_IN_REVIEW');
    }
  });

  it('E. founder approved → AUTHORITY_APPROVED (LOVE_IT or COMBINE hybrid), still not implementation-ready until locked', () => {
    const r = evaluateAuthorityGate(approved());
    expect(r.state).toBe('AUTHORITY_APPROVED');
    expect(r.implementation_ready).toBe(false);
    const hybrid = evaluateAuthorityGate(reviewed({ founder_decision: { verdict: 'COMBINE', territory_ids: ['T_A', 'T_C'], combination: { STRUCTURE: 'T_A', MATERIAL: 'T_C' }, notes: 'A structure + C material', decided_at: '2026-10-06' } }));
    expect(hybrid.state).toBe('AUTHORITY_APPROVED');
  });

  it('F. authority approved + locked + tree confirmed → IMPLEMENTATION_READY (all eight durable conditions)', () => {
    const r = evaluateAuthorityGate(approved({ authority: AUTHORITY }));
    expect(r.state).toBe('IMPLEMENTATION_READY');
    expect(r.implementation_ready).toBe(true);
    expect(r.durable_rule).toBe('SATISFIED');
    expect(Object.values(r.conditions).every(Boolean)).toBe(true);
    // Lock incomplete (core lock missing) stays AUTHORITY_APPROVED.
    const partial = { ...AUTHORITY, core_logic_locks: AUTHORITY.core_logic_locks.filter((l) => l.kind !== 'CTA_HIERARCHY') };
    expect(evaluateAuthorityGate(approved({ authority: partial })).state).toBe('AUTHORITY_APPROVED');
    // Locked but the page / tab / state tree is only produced (or absent) → stays AUTHORITY_APPROVED behind the tree guard.
    for (const page_tree of [null, { ...TREE_CONFIRMED, status: 'PRODUCED' as const, confirmed_at: null }, { ...TREE_CONFIRMED, confirmed_at: null }]) {
      const t = evaluateAuthorityGate(approved({ authority: AUTHORITY, page_tree }));
      expect(t.state).toBe('AUTHORITY_APPROVED');
      expect(t.guard).toBe('PAGE_TREE_CONFIRMATION_REQUIRED');
      expect(t.conditions.PAGE_FAMILY_AUTHORITY_LOCKED && !t.conditions.PAGE_TREE_CONFIRMED).toBe(true);
      expect(t.implementation_ready).toBe(false);
    }
  });

  it('G. legacy functional reference imported as layout → LEGACY_VISUAL_LEAK', () => {
    const r = evaluateAuthorityGate(approved({ authority: AUTHORITY, legacy_uses: [{ surface_id: 'AIO.LEGACY.PUBLIC.SERVICE_DETAIL', uses: ['CONTENT_TRUTH', 'LAYOUT', 'GEOMETRY'] }] }));
    expect(r.guard).toBe('LEGACY_VISUAL_LEAK');
    expect(r.implementation_ready).toBe(false);
    // Function-only use is allowed.
    expect(checkLegacyUse(aio.AIO_IFTA_LEGACY_SURFACES, [{ surface_id: 'AIO.LEGACY.CLIENT.VAULT', uses: ['DATA', 'ROUTING', 'STATE'] }]).status).toBe('LEGACY_STATUS_KNOWN');
    // Promotion without a founder decision does not count.
    const fake = aio.AIO_IFTA_LEGACY_SURFACES.map((s) => ({ ...s, visual_class: 'APPROVED_AUTHORITY' as const, founder_decision: null }));
    expect(checkLegacyUse(fake, [{ surface_id: 'AIO.LEGACY.CLIENT.PORTAL_SHELL', uses: ['PANEL_SYSTEM'] }]).status).toBe('LEGACY_VISUAL_LEAK');
    // Partial promotion allows only the promoted dimensions.
    const partial = [{ ...aio.AIO_IFTA_LEGACY_SURFACES[11], visual_class: 'PARTIAL_AUTHORITY' as const, promoted_dimensions: ['NAV_VISUALS' as const], founder_decision: 'keep nav visuals' }];
    expect(checkLegacyUse(partial, [{ surface_id: partial[0].surface_id, uses: ['NAV_VISUALS'] }]).status).toBe('LEGACY_STATUS_KNOWN');
    expect(checkLegacyUse(partial, [{ surface_id: partial[0].surface_id, uses: ['NAV_VISUALS', 'SPACING'] }]).leaks[0].leaked_dimensions).toEqual(['SPACING']);
    // Every AIO IFTA legacy surface is functional reference only.
    expect(aio.AIO_IFTA_LEGACY_SURFACES.every((s) => s.visual_class === 'FUNCTIONAL_REFERENCE_ONLY' && !s.founder_decision)).toBe(true);
  });

  it('H. implementation changes primary composition → FOUNDER_REVIEW_REQUIRED; flexible improvements pass', () => {
    const declared = evaluateAuthorityGate(approved({ authority: AUTHORITY, implementation: { status: 'IMPLEMENTING', changes: [{ area: 'PRIMARY_COMPOSITION', description: 'bench replaced by card grid' }] } }));
    expect(declared.guard).toBe('FOUNDER_REVIEW_REQUIRED');
    const observed = classifyDeviation(AUTHORITY, { status: 'COMPLETE', changes: [], observed: { PRIMARY_COMPOSITION: 'three equal cards' } });
    expect(observed.status).toBe('FOUNDER_REVIEW_REQUIRED');
    const improved = evaluateAuthorityGate(approved({ authority: AUTHORITY, implementation: { status: 'IMPLEMENTING', changes: [{ area: 'SPACING', description: 'tighter rhythm', explanation: 'mobile density' }, { area: 'ACCESSIBILITY', description: 'focus rings' }], observed: { PRIMARY_OBJECT: 'the quarter' } } }));
    expect(improved.state).toBe('IMPLEMENTING');
    expect(improved.guard).toBeNull();
    expect(evaluateAuthorityGate(approved({ authority: AUTHORITY, implementation: { status: 'COMPLETE', changes: [] } })).state).toBe('LIVE_REVIEW');
    expect(evaluateAuthorityGate(approved({ authority: AUTHORITY, implementation: { status: 'COMPLETE', changes: [], live_founder_approved: true } })).state).toBe('LIVE_AUTHORITY');
  });
});

describe('guards', () => {
  it('territories that differ only cosmetically → TERRITORY_DISTINCTNESS_FAILURE; aesthetic-only territories fail', () => {
    expect(checkTerritoryDistinctness(TERRITORIES).status).toBe('TERRITORIES_DISTINCT');
    const swapped = TERRITORIES.map((t, i) => ({ ...t, structure: TERRITORIES[0].structure, cosmetic: { color: ['gold', 'silver', 'stone'][i], hero_image: `truck-${i}.jpg` } }));
    expect(checkTerritoryDistinctness(swapped).status).toBe('TERRITORY_DISTINCTNESS_FAILURE');
    const aesthetic = [...TERRITORIES.slice(0, 2), { ...TERRITORIES[2], page_logic: '', major_zones: [] }];
    expect(checkTerritoryDistinctness(aesthetic).page_logic_missing).toEqual(['T_C']);
    expect(evaluateAuthorityGate(base({ territories: swapped, references: REFS })).guard).toBe('TERRITORY_DISTINCTNESS_FAILURE');
    expect(evaluateAuthorityGate(base({ territories: TERRITORIES.slice(0, 2), references: REFS })).state).toBe('AUTHORITY_TERRITORIES_REQUIRED');
  });

  it('a reference that is only a mood collage does not count', () => {
    const mood = REFS.map((r, i) => (i === 1 ? { ...r, shows: ['composition' as const] } : r));
    expect(evaluateAuthorityGate(base({ territories: TERRITORIES, references: mood })).guard).toBe('REFERENCE_AUTHORITY_REQUIRED');
  });

  it('page generation: route + copy only is refused; missing authority → VISUAL_AUTHORITY_REQUIRED; responsive + runtime-asset guards', () => {
    const req = { project_id: 'AIO', family_id: ifta.family_id, feature_id: ifta.feature_id, actor: 'CLIENT' as const, state: 'COLLECTING', viewport: 'MOBILE' as const, material: true };
    expect(guardPageGeneration({ ...req, route: 'portal/services/ifta', copy: 'Continue filing' }).status).toBe('EXPERIENCE_REQUIRED');
    expect(guardPageGeneration({ ...req, experience_contract: ifta }).status).toBe('BRAND_CONTEXT_REQUIRED');
    expect(guardPageGeneration({ ...req, experience_contract: ifta, brand_context: aio.AIO_BRAND_CONTEXT }).status).toBe('VISUAL_AUTHORITY_REQUIRED');
    expect(guardPageGeneration({ ...req, experience_contract: ifta, brand_context: aio.AIO_BRAND_CONTEXT, authority: AUTHORITY }).status).toBe('PAGE_TREE_CONFIRMATION_REQUIRED');
    const ok = { ...req, experience_contract: ifta, brand_context: aio.AIO_BRAND_CONTEXT, authority: AUTHORITY, page_tree: TREE_CONFIRMED };
    expect(guardPageGeneration(ok)).toEqual({ status: 'GENERATE', inputs: ['BRAND_DNA', 'EXPERIENCE_CONTRACT', 'PAGE_FAMILY_AUTHORITY', 'PAGE_TREE', 'STATE', 'VIEWPORT'] });
    expect(guardPageGeneration({ ...ok, viewport: 'TABLET' }).status).toBe('RESPONSIVE_AUTHORITY_REQUIRED');
    expect(guardPageGeneration({ ...ok, runtime_assets: ['fixtures/T_A.png'] }).status).toBe('AUTHORITY_AS_RUNTIME_ASSET');
    expect(guardPageGeneration({ ...ok, legacy_surfaces: aio.AIO_IFTA_LEGACY_SURFACES, legacy_uses: [{ surface_id: 'AIO.LEGACY.CLIENT.SERVICES_CENTER', uses: ['COMPOSITION'] }] }).status).toBe('LEGACY_VISUAL_LEAK');
  });

  it('family not locked → FAMILY_LOCK_REQUIRED; non-material families skip authority development', () => {
    expect(evaluateAuthorityGate(base({ family_locked: false })).guard).toBe('FAMILY_LOCK_REQUIRED');
    const nm = evaluateAuthorityGate(base({ material: false }));
    expect(nm.durable_rule).toBe('NOT_REQUIRED_NON_MATERIAL');
    expect(nm.state).toBe('IMPLEMENTATION_READY');
  });

  it('production states are exactly the sprint list', () => {
    expect(AUTHORITY_PRODUCTION_STATES).toEqual(['FAMILY_LOCKED', 'EXPERIENCE_REQUIRED', 'EXPERIENCE_COMPLETE', 'BRAND_CONTEXT_REQUIRED', 'AUTHORITY_TERRITORIES_REQUIRED', 'AUTHORITY_IN_REVIEW', 'AUTHORITY_APPROVED', 'IMPLEMENTATION_READY', 'IMPLEMENTING', 'LIVE_REVIEW', 'LIVE_AUTHORITY']);
  });
});

describe('parent authority precedes actor / viewport derivation (authority-bundle founder decision)', () => {
  const STAFF_AUTHORITY: PageFamilyAuthority = { ...AUTHORITY, authority_id: 'AIO.IFTA.FOUNDER_STAFF.PFA.fixture', actor: 'FOUNDER_STAFF' };
  const staffRefs: ReferenceAuthority[] = [{ ...REFS[0], reference_id: 'REF_STAFF', territory_id: 'T_A' }];
  const derived = (over: Partial<AuthorityGateInput> = {}) => base({
    actor: 'FOUNDER_STAFF', derivation: { parent: AUTHORITY, parent_territories: TERRITORIES, references: staffRefs },
    founder_decision: { verdict: 'LOVE_IT', territory_ids: ['T_A'], notes: 'derived', decided_at: '2026-10-06' }, authority: STAFF_AUTHORITY, page_tree: TREE_CONFIRMED, ...over,
  });

  it('a derived actor inherits the territory step from a locked parent and reaches IMPLEMENTATION_READY', () => {
    const r = evaluateAuthorityGate(derived());
    expect(r.state).toBe('IMPLEMENTATION_READY');
    expect(r.conditions.COMPOSITION_TERRITORIES_EXIST && r.conditions.REFERENCE_AUTHORITY_EXISTS).toBe(true);
    expect(r.reasons.join(' ')).toMatch(/inherited from parent authority/);
    expect(checkDerivation({ family_id: ifta.family_id, feature_id: ifta.feature_id, actor: 'FOUNDER_STAFF' }, derived().derivation).status).toBe('DERIVATION_VALID');
  });

  it('an unlocked parent, a same-actor parent or indistinct parent territories cannot be derived from', () => {
    const unlocked = { ...AUTHORITY, founder_status: 'PENDING' as const };
    expect(evaluateAuthorityGate(derived({ derivation: { parent: unlocked, parent_territories: TERRITORIES, references: staffRefs } })).state).toBe('AUTHORITY_TERRITORIES_REQUIRED');
    expect(evaluateAuthorityGate(derived({ actor: 'CLIENT' })).guard).toBe('VISUAL_AUTHORITY_REQUIRED');
    const flat = TERRITORIES.map((t) => ({ ...t, structure: TERRITORIES[0].structure }));
    expect(evaluateAuthorityGate(derived({ derivation: { parent: AUTHORITY, parent_territories: flat, references: staffRefs } })).state).toBe('AUTHORITY_TERRITORIES_REQUIRED');
  });

  it('derived references must trace to a parent source territory and show all six proofs; the derived actor still needs its own approval + lock', () => {
    expect(evaluateAuthorityGate(derived({ derivation: { parent: AUTHORITY, parent_territories: TERRITORIES, references: [{ ...staffRefs[0], territory_id: 'T_B' }] } })).guard).toBe('REFERENCE_AUTHORITY_REQUIRED');
    expect(evaluateAuthorityGate(derived({ derivation: { parent: AUTHORITY, parent_territories: TERRITORIES, references: [{ ...staffRefs[0], shows: ['composition'] }] } })).guard).toBe('REFERENCE_AUTHORITY_REQUIRED');
    expect(evaluateAuthorityGate(derived({ founder_decision: null })).state).toBe('AUTHORITY_IN_REVIEW');
    expect(evaluateAuthorityGate(derived({ authority: null })).state).toBe('AUTHORITY_APPROVED');
  });

  it('AIO IFTA after the authority bundle: all 3 actors AUTHORITY_APPROVED, held only by PAGE_TREE_CONFIRMATION_REQUIRED', () => {
    for (const a of ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'] as const) {
      const g = aio.aioIftaGateStatus(a);
      expect(g.state, a).toBe('AUTHORITY_APPROVED');
      expect(g.guard, a).toBe('PAGE_TREE_CONFIRMATION_REQUIRED');
      expect(Object.entries(g.conditions).filter(([, v]) => !v).map(([k]) => k), a).toEqual(['PAGE_TREE_CONFIRMED']);
      // Founder confirms the tree → implementation-ready.
      expect(evaluateAuthorityGate({ ...aio.aioIftaGateInput(a), page_tree: TREE_CONFIRMED }).state, a).toBe('IMPLEMENTATION_READY');
    }
    expect(aio.aioIftaGateInput('FOUNDER_STAFF').territories).toBeUndefined();
    expect(aio.aioIftaGateInput('CLIENT').territories).toHaveLength(3);
  });
});

describe('AIO IFTA input packages + portability', () => {
  it('three actor packages carry brand DNA, experience, legacy table and territory brief — and no implementation or spend', () => {
    for (const a of ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'] as const) {
      const p = aio.buildAioIftaActorAuthorityInput(a);
      expect(p.brand_dna.positioning).toMatch(/WHERE BUSINESS MEETS THE ROAD/);
      expect(p.experience_contract.ingest.metaphor).toBe('QUARTERLY FILING ROOM');
      expect(p.experience_contract.state_coverage.length).toBeGreaterThan(0);
      expect(p.legacy_visual_status.surfaces.every((s) => s.visual_class === 'FUNCTIONAL_REFERENCE_ONLY')).toBe(true);
      expect(p.territory_brief.count).toBe(3);
      expect(p.constraints).toEqual({ new_paid_generations: 0, credits_spent: 0, page_implementation: false });
    }
    expect(aio.buildAioIftaActorAuthorityInput('FOUNDER_STAFF').viewport_targets.primary).toBe('DESKTOP');
  });

  it('the gate core is project-agnostic and runs for every portable project', () => {
    for (const f of ['schema.ts', 'gate.ts', 'contracts.ts', 'registry.ts', 'tree.ts']) {
      expect(read(`shared/studioos-visual-authority/${f}`).replace(/AIO IFTA[^'\n]*/g, '').replace(/export const PORTABLE_PROJECTS[^\n]*/, ''), f).not.toMatch(/\bIFTA\b|fuel|truck|JURNL|Frontal/i);
    }
    const projects = new Set(samples.portabilitySamples().map((s) => s.project_id));
    for (const p of ['SITE00', 'JURNL', 'FRONTAL_SLAYER', 'ASTRAL_WORLD', 'FUTURE_CLIENT_PROJECT']) expect(projects.has(p as never), p).toBe(true);
    expect(samples.portabilitySamples().every((s) => !s.result.implementation_ready)).toBe(true);
  });
});

describe('exports stay generated from the TypeScript source', () => {
  it('every exported deliverable on disk matches the generator', () => {
    const files = buildVisualAuthorityExports();
    expect(Object.keys(files)).toHaveLength(25);
    for (const [name, body] of Object.entries(files)) expect(read(`${VISUAL_AUTHORITY_DOCS_DIR}/${name}`), name).toBe(body);
    expect(read(`${VISUAL_AUTHORITY_DOCS_DIR}/VISUAL_AUTHORITY_DEVELOPMENT_GATE.md`)).toMatch(/UPSTREAM DEFINES INTENT\. DOWNSTREAM INCREASES FIDELITY\./);
  });
});
