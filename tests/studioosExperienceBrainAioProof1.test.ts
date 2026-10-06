/**
 * P0.SITE00.WORKSPACE-EXPERIENCE-BRAIN.CANONICAL-SCHEMA-AIO-PROOF1 — Workspace Experience Brain guards.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  E2E_PHASES,
  PRODUCTION_LAYERS,
  REQUIRED_CONTRACT_FIELDS,
  aio,
  coverageReport,
  deriveE2EContract,
  isNotApplicable,
  queryExperience,
  samples,
  screenFamilyGate,
  validateExperienceContract,
  type ExperienceContract,
} from '../shared/studioos-experience-brain/index';
import { EXPERIENCE_BRAIN_DOCS_DIR, buildExperienceBrainExports } from '../scripts/studioos/experience-brain-export';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
const contracts = aio.AIO_EXPERIENCE_CONTRACTS;
const ifta = contracts.find((c) => c.feature_id === 'AIO.IFTA')!;
const clone = (c: ExperienceContract): ExperienceContract => JSON.parse(JSON.stringify(c));

describe('canonical schema', () => {
  it('distinguishes STRUCTURE / EXPERIENCE / EXPRESSION / IMPLEMENTATION and reconciles existing systems', () => {
    expect(PRODUCTION_LAYERS.map((l) => l.layer)).toEqual(['STRUCTURE', 'EXPERIENCE', 'EXPRESSION', 'IMPLEMENTATION']);
    const expression = PRODUCTION_LAYERS.find((l) => l.layer === 'EXPRESSION')!;
    expect(expression.existing_systems.join(' ')).toMatch(/experience-compiler/);
    expect(expression.existing_systems.join(' ')).toMatch(/site00-experience-engine/);
  });

  it('requires every sprint §2 experience-contract field', () => {
    for (const f of ['feature_id', 'family_id', 'business_promise', 'public_entry', 'client_entry', 'founder_staff_entry', 'system_entry', 'start_state', 'success_state', 'blocked_state', 'error_states', 'empty_state', 'complete_state', 'required_inputs', 'system_derivations', 'human_review_points', 'client_approval_points', 'founder_override_points', 'output_artifacts', 'vault_destination', 'inbox_events', 'activity_events', 'notifications', 'next_step', 'cross_feature_relationships', 'automations', 'primary_metaphor', 'visual_archetype', 'primary_visual_object', 'composition_rules', 'information_hierarchy', 'interaction_grammar', 'emotional_target', 'density_target', 'mobile_behavior', 'tablet_behavior', 'desktop_behavior', 'public_cta', 'client_cta', 'staff_cta', 'avoid_list', 'e2e_proof_contract'] as const)
      expect(REQUIRED_CONTRACT_FIELDS as readonly string[]).toContain(f);
  });

  it('core schema modules carry no project assumptions (portability)', () => {
    for (const f of ['schema.ts', 'validate.ts', 'query.ts', 'e2e.ts', 'registry.ts']) {
      const src = read(`shared/studioos-experience-brain/${f}`).replace(/\/\*[\s\S]*?\*\//g, '').replace(/EXPERIENCE_BRAIN_SPRINT = '[^']*'/, ''); // provenance id only
      expect(src, f).not.toMatch(/\bAIO\b|IFTA|trucking|JURNL|Frontal/i);
    }
  });
});

describe('validator: experience completion is earned, never assumed', () => {
  it('IFTA earns EXPERIENCE_COMPLETE with all four perspectives, every state visualised and every E2E phase', () => {
    const v = validateExperienceContract(ifta);
    expect(v.earned_completion).toBe('EXPERIENCE_COMPLETE');
    expect(v.gaps).toEqual([]);
    expect(Object.values(v.perspectives).map((p) => p.status)).toEqual(['DEFINED', 'DEFINED', 'DEFINED', 'DEFINED']);
    expect(v.authority_ready && v.e2e_ready).toBe(true);
  });

  it('fails the §48 gates when a flow, the archetype, the success state or E2E is missing', () => {
    const noClient = clone(ifta);
    noClient.perspectives.client = { applicable: false, reason: 'x' };
    expect(validateExperienceContract(noClient).gate_failures).toContain('CLIENT FLOW');
    const noStaff = clone(ifta);
    (noStaff.perspectives.founder_staff as { blockers: string[] }).blockers = [];
    expect(validateExperienceContract(noStaff).gate_failures).toContain('FOUNDER FLOW');
    const noArch = clone(ifta);
    noArch.visual_archetype = [];
    expect(validateExperienceContract(noArch).gate_failures).toContain('VISUAL ARCHETYPE');
    const noSuccess = clone(ifta);
    noSuccess.success_state = 'NOPE';
    expect(validateExperienceContract(noSuccess).gate_failures).toContain('SUCCESS STATE');
    const noE2e = clone(ifta);
    noE2e.e2e_proof_contract.steps = noE2e.e2e_proof_contract.steps.filter((s) => s.phase !== 'ARCHIVE');
    expect(validateExperienceContract(noE2e).gate_failures).toContain('E2E CONTRACT');
  });

  it('a state without a visual relationship, or an open question, blocks completion', () => {
    const v1 = clone(ifta);
    v1.visual_relationships = v1.visual_relationships.filter((r) => r.state !== 'FILED');
    expect(validateExperienceContract(v1).earned_completion).toBe('EXPERIENCE_DRAFTED');
    const v2 = clone(ifta);
    v2.open_experience_questions = ['who pays?'];
    expect(validateExperienceContract(v2).status).toBe('EXPERIENCE_PARTIAL');
  });

  it('never exceeds the declared rung and keeps functional completion a separate axis', () => {
    const c = clone(ifta);
    c.declared_completion = 'STRUCTURED';
    expect(validateExperienceContract(c).earned_completion).toBe('STRUCTURED');
    expect(ifta.implementation_refs.functional_completion_pct).toBeNull();
  });
});

describe('AIO proof — inventory and coverage', () => {
  it('maps every sprint §23 service and every canonical family + role projection', () => {
    const ids = new Set(contracts.map((c) => c.feature_id));
    for (const f of Object.values(aio.AIO_SERVICE_INVENTORY)) expect(ids.has(f), f).toBe(true);
    expect(Object.keys(aio.AIO_SERVICE_INVENTORY)).toHaveLength(20);
    for (let i = 1; i <= 18; i++) expect(Object.keys(aio.AIO_FAMILY_MAP).some((k) => k.startsWith(`F${String(i).padStart(2, '0')} `)), `F${i}`).toBe(true);
    for (const r of ['SHIPPER', 'DRIVER', 'FLEETCARE PROVIDER', 'AIO OFFICE']) expect(aio.AIO_FAMILY_MAP[`ROLE: ${r}`]?.length, r).toBeGreaterThan(0);
  });

  it('every material feature has four perspectives, an archetype, a success state and an E2E contract', () => {
    for (const c of contracts) {
      const v = validateExperienceContract(c);
      expect(v.perspectives.CLIENT.status, c.feature_id).toBe('DEFINED');
      expect(v.perspectives.FOUNDER_STAFF.status, c.feature_id).toBe('DEFINED');
      expect(v.perspectives.SYSTEM.status, c.feature_id).toBe('DEFINED');
      expect(['DEFINED', 'NOT_APPLICABLE'], c.feature_id).toContain(v.perspectives.PUBLIC.status);
      expect(c.visual_archetype.length, c.feature_id).toBeGreaterThan(0);
      expect(v.e2e_ready, c.feature_id).toBe(true);
      expect(c.structure_refs.source_evidence.length, c.feature_id).toBeGreaterThan(0);
    }
  });

  it('reports partial features with explicit gaps (no silent invention)', () => {
    const cov = coverageReport('AIO', contracts);
    expect(cov.total_material_features).toBe(contracts.length);
    expect(cov.experience_complete + cov.experience_partial + cov.experience_missing).toBe(cov.total_material_features);
    for (const g of cov.gaps) expect(g.gaps.length, g.feature_id).toBeGreaterThan(0);
    for (const g of screenFamilyGate(contracts).filter((x) => x.status === 'EXPERIENCE_REQUIRED')) expect(cov.gaps.map((x) => x.feature_id)).toContain(g.feature_id);
  });
});

describe('AIO IFTA / Fuel Tax — canonical deepest proof', () => {
  it('follows QUARTER → COLLECT → REVIEW → RECONCILE → APPROVE → FILED → VAULT → next quarter', () => {
    const ids = ifta.states.map((s) => s.id);
    for (const s of ['QUARTER_OPEN', 'COLLECTING', 'AIO_REVIEW', 'RECONCILING', 'AWAITING_APPROVAL', 'FILED', 'ARCHIVED']) expect(ids).toContain(s);
    expect(ifta.primary_metaphor).toBe('QUARTERLY FILING ROOM');
    expect(ifta.secondary_metaphor).toBe('BUILDING A COMPLETE FILING PACKET');
    expect(ifta.visual_archetype[0]).toBe('PACKET_BUILDER');
  });

  it('includes receipt upload / import with classification, and every mileage source', () => {
    const receipts = ifta.required_inputs.find((i) => i.id === 'FUEL_RECEIPTS')!;
    for (const m of ['TAKE PHOTO', 'UPLOAD FILES', 'IMPORT FROM VAULT']) expect(receipts.methods).toContain(m);
    expect(receipts.methods.join(' ')).toMatch(/CONTINUOUS QUARTER CAPTURE/);
    expect(Object.keys(aio.AIO_IFTA_RECEIPT_CLASSES)).toEqual(['READY', 'NEEDS_YOU', 'DUPLICATE', 'POSSIBLE_MISSING', 'UNREADABLE']);
    const mileage = aio.AIO_IFTA_MILEAGE_SOURCES.map((m) => m.id);
    for (const m of ['ELD_GPS_IMPORT', 'ELD_REPORT_UPLOAD', 'MANUAL_STATE_ENTRY', 'SPREADSHEET', 'AIO_ASSISTANCE']) expect(mileage).toContain(m);
    // source quality comes from the real structure enum (MileageSourceType)
    for (const m of aio.AIO_IFTA_MILEAGE_SOURCES) expect(['eld_verified', 'manual_verified', 'driver_reported', 'loaded_miles']).toContain(m.structure_source);
  });

  it('includes staff review, client approval, filing, vault archive and next-quarter continuity', () => {
    expect(ifta.human_review_points.map((p) => p.at_state)).toEqual(expect.arrayContaining(['AIO_REVIEW', 'RECONCILING', 'FILING']));
    expect(ifta.client_approval_points[0]!.at_state).toBe('AWAITING_APPROVAL');
    expect(ifta.vault_destination).toMatch(/tax_fuel/);
    const staff = ifta.perspectives.founder_staff;
    if (isNotApplicable(staff)) throw new Error('staff perspective required');
    expect(staff.operational_actions).toEqual(expect.arrayContaining(['RECORD FILING CONFIRMATION', 'RECORD PAYMENT STATUS']));
    const filed = ifta.cross_feature_relationships.filter((r) => r.from_state === 'FILED').map((r) => r.to_feature);
    expect(filed).toEqual(expect.arrayContaining(['AIO.VAULT', 'AIO.INBOX', 'AIO.MY_OFFICE', 'AIO.ROAD_READY']));
    expect(ifta.cross_feature_relationships.some((r) => r.from_state === 'ARCHIVED' && r.relationship === 'OPENS' && r.to_feature === 'AIO.IFTA')).toBe(true);
  });
});

describe('page generation consumption (§17–18, §41–42)', () => {
  it('answers the §18 query: AIO.IFTA · CLIENT · COLLECTING · MOBILE', () => {
    const b = queryExperience({ contract: ifta, dna: aio.AIO_DNA, actor: 'CLIENT', state: 'COLLECTING', viewport: 'MOBILE' });
    if (b.status !== 'READY') throw new Error(b.reason);
    expect(b.required_sections).toEqual(['QUARTER', 'NEXT_ITEM', 'RECEIPTS', 'MILEAGE', 'VEHICLES', 'SEND_TO_AIO']);
    expect(b.primary_object).toMatch(/THE QUARTER/);
    expect(b.recommended_composition.archetype).toBe('PACKET_BUILDER');
    expect(b.visual_rules.emphasis_token).toMatch(/CHAMPAGNE/);
    expect(b.input_types.map((i) => i.id)).toContain('FUEL_RECEIPTS');
    expect(b.next_action).toBeTruthy();
    expect(b.must_not_appear).toEqual(expect.arrayContaining(['generic dashboard', 'Frontal Slayer typography']));
  });

  it('returns EXPERIENCE_REQUIRED instead of inventing (missing / partial contract)', () => {
    expect(queryExperience({ contract: null, dna: aio.AIO_DNA, actor: 'CLIENT', state: 'X', viewport: 'MOBILE' }).status).toBe('EXPERIENCE_REQUIRED');
    const partial = contracts.find((c) => !validateExperienceContract(c).experience_ready)!;
    expect(queryExperience({ contract: partial, dna: aio.AIO_DNA, actor: 'CLIENT', state: partial.start_state, viewport: 'MOBILE' }).status).toBe('EXPERIENCE_REQUIRED');
  });
});

describe('experience E2E derivation (§39–40)', () => {
  it('derives an 11-phase experience journey for IFTA with derived assertions', () => {
    const e = deriveE2EContract(ifta);
    expect(e.coverage.missing).toEqual([]);
    expect(new Set(e.steps.map((s) => s.phase))).toEqual(new Set(E2E_PHASES));
    expect(e.steps.find((s) => s.phase === 'ARCHIVE')!.derived_expect.join(' ')).toMatch(/tax_fuel/);
    expect(e.steps.find((s) => s.phase === 'DOWNSTREAM_MOVEMENT')!.derived_expect.length).toBeGreaterThan(3);
  });
});

describe('portability (§50–52)', () => {
  it('maps JURNL and Frontal Slayer samples with the same schema, non-implemented', () => {
    const arch = Object.fromEntries(samples.PORTABILITY_SAMPLES.map((s) => [s.feature_id, s.visual_archetype[0]]));
    expect(arch).toMatchObject({ 'JURNL.SAFE_TO_SPEND': 'THRESHOLD', 'JURNL.PURCHASES': 'DECISION_WINDOW', 'JURNL.AHEAD': 'HORIZON', 'JURNL.RECORDS': 'ARCHIVE', 'FS.BUILD_A_WIG': 'ATELIER', 'FS.HAIR_ANALYSIS': 'CONSULTATION', 'FS.SHOWROOM': 'SHOWCASE', 'FS.SLAY_CAM': 'GALLERY' });
    for (const s of samples.PORTABILITY_SAMPLES) {
      expect(s.sample && !s.material).toBe(true);
      expect(validateExperienceContract(s).earned_completion).toBe('STRUCTURED');
      expect(s.implementation_refs.activation_state).toMatch(/NOT IMPLEMENTED/);
    }
  });
});

describe('exports stay generated from the TypeScript source', () => {
  it('every exported deliverable on disk matches the generator', () => {
    const files = buildExperienceBrainExports();
    expect(Object.keys(files)).toHaveLength(18);
    for (const [name, body] of Object.entries(files)) expect(read(`${EXPERIENCE_BRAIN_DOCS_DIR}/${name}`), name).toBe(body);
    expect(read(`${EXPERIENCE_BRAIN_DOCS_DIR}/WORKSPACE_EXPERIENCE_BRAIN_CONTRACT.md`)).toMatch(/Workspace Experience Brain — canonical contract/);
  });
});
