/**
 * P0.SITE00.WORKSPACE-EXPERIENCE-BRAIN.CANONICAL-SCHEMA-AIO-PROOF1 — export the Workspace Experience Brain
 * (single source: shared/studioos-experience-brain) to docs/studioos/experience-brain/.
 *
 *   npx tsx scripts/studioos/experience-brain-export.ts
 *
 * Every JSON here is GENERATED from the typed contracts — edit the TypeScript, never the JSON. A test keeps the
 * exported files in sync (tests/studioosExperienceBrainAioProof1.test.ts).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  CLIENT_PROJECT_ROOM_SLOTS,
  E2E_PHASES,
  EXPERIENCE_ACTORS,
  EXPERIENCE_BRAIN_SCHEMA_VERSION,
  EXPERIENCE_BRAIN_SPRINT,
  EXPERIENCE_COMPLETION_LADDER,
  FOUNDER_HUB_BUCKETS,
  PERSPECTIVE_REQUIRED_KEYS,
  PRODUCTION_LAYERS,
  REQUIRED_CONTRACT_FIELDS,
  SECTION_GRAMMAR,
  STATE_CLASSES,
  VISUAL_ARCHETYPES,
  aio,
  coverageReport,
  deriveE2EContract,
  isNotApplicable,
  queryExperience,
  registryRow,
  samples,
  screenFamilyGate,
  validateExperienceContract,
  type ExperienceContract,
} from '../../shared/studioos-experience-brain/index.js';

export const EXPERIENCE_BRAIN_DOCS_DIR = 'docs/studioos/experience-brain';
const DIR = EXPERIENCE_BRAIN_DOCS_DIR;
const header = { sprint: EXPERIENCE_BRAIN_SPRINT, schema_version: EXPERIENCE_BRAIN_SCHEMA_VERSION, generated_from: 'shared/studioos-experience-brain (TypeScript is the source of truth)' };

export function buildExperienceBrainExports(): Record<string, string> {
  const out: Record<string, string> = {};
  const json = (name: string, data: unknown) => (out[name] = `${JSON.stringify({ ...header, ...(data as object) }, null, 2)}\n`);
  const contracts = aio.AIO_EXPERIENCE_CONTRACTS;
  const ifta = contracts.find((c) => c.feature_id === 'AIO.IFTA')!;
  const per = <K extends keyof ExperienceContract['perspectives']>(k: K) =>
    contracts.map((c) => ({ feature_id: c.feature_id, feature_name: c.feature_name, family: c.family_id, perspective: c.perspectives[k] }));

  // ── core (portable) ────────────────────────────────────────────────────────────────────────────────────
  const str = { type: 'string' };
  const arr = (items: object = str) => ({ type: 'array', items });
  const entry = { oneOf: [{ type: 'object', required: ['surface', 'route', 'trigger'] }, { type: 'object', required: ['applicable', 'reason'], properties: { applicable: { const: false } } }] };
  json('WORKSPACE_EXPERIENCE_BRAIN_SCHEMA.json', {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'studioos://experience-brain/experience-contract/1.0.0',
    title: 'Workspace Experience Brain — Experience Contract',
    description: 'One canonical experience contract per material feature: how it is lived by every actor (PUBLIC · CLIENT · FOUNDER_STAFF · SYSTEM), on every surface, in every state, and how state changes change the experience visually. Portable — no project assumptions.',
    production_layers: PRODUCTION_LAYERS,
    type: 'object',
    required: [...REQUIRED_CONTRACT_FIELDS, 'schema_version', 'project_id', 'material', 'states', 'transitions', 'perspectives', 'visual_relationships', 'structure_refs', 'lineage', 'declared_completion'],
    properties: {
      schema_version: { const: EXPERIENCE_BRAIN_SCHEMA_VERSION },
      project_id: str,
      feature_id: str,
      feature_name: str,
      family_id: str,
      material: { type: 'boolean' },
      sample: { type: 'boolean' },
      purpose: str,
      business_promise: str,
      user_value: str,
      primary_actors: arr({ enum: EXPERIENCE_ACTORS }),
      secondary_actors: arr(),
      public_entry: entry,
      client_entry: entry,
      founder_staff_entry: entry,
      system_entry: entry,
      states: arr({ type: 'object', required: ['id', 'label', 'state_class', 'meaning'], properties: { state_class: { enum: STATE_CLASSES } } }),
      transitions: arr({ type: 'object', required: ['from', 'to', 'trigger', 'actor'] }),
      start_state: str,
      success_state: str,
      blocked_state: str,
      error_states: arr(),
      empty_state: str,
      complete_state: str,
      required_inputs: arr({ type: 'object', required: ['id', 'label', 'methods', 'required_for'] }),
      optional_inputs: arr({ type: 'object' }),
      system_derivations: arr({ type: 'object', required: ['id', 'derives', 'from', 'rule'] }),
      human_review_points: arr({ type: 'object', required: ['id', 'actor', 'at_state', 'decision', 'outcomes'] }),
      client_approval_points: arr({ type: 'object' }),
      founder_override_points: arr({ type: 'object' }),
      output_artifacts: arr({ type: 'object', required: ['id', 'name', 'type', 'owner', 'source', 'status_lifecycle', 'visible_to', 'editable_by', 'vault_destination', 'retention', 'supersession', 'view_behavior'] }),
      vault_destination: { type: ['string', 'null'] },
      inbox_events: arr({ type: 'object', required: ['id', 'channel', 'trigger', 'audience', 'summary'] }),
      activity_events: arr({ type: 'object' }),
      notifications: arr({ type: 'object' }),
      human_tasks: arr({ type: 'object' }),
      next_step: str,
      upstream_systems: arr(),
      downstream_systems: arr(),
      cross_feature_relationships: arr({ type: 'object', required: ['id', 'from_feature', 'from_state', 'to_feature', 'relationship', 'actor_effects', 'surface_effects', 'visual_transition'] }),
      automations: arr({ type: 'object' }),
      perspectives: { type: 'object', required: ['public', 'client', 'founder_staff', 'system'], description: 'Required keys per actor in perspective_required_keys; only PUBLIC may be not-applicable (with reason).' },
      primary_metaphor: str,
      secondary_metaphor: str,
      visual_archetype: arr({ enum: Object.keys(VISUAL_ARCHETYPES) }),
      primary_visual_object: str,
      secondary_visual_objects: arr(),
      composition_rules: arr(),
      information_hierarchy: { type: 'object', description: 'per actor: primary_question, primary_status, primary_task, secondary_status, blocker, next_action, completion_proof' },
      interaction_grammar: arr({ type: 'object', required: ['verb', 'actor', 'meaning'] }),
      emotional_target: { type: 'object' },
      density_target: { enum: ['SPARSE', 'BALANCED', 'DENSE'] },
      mobile_behavior: { type: 'object', required: ['task_model', 'layout', 'primary_object_treatment', 'input_treatment'] },
      tablet_behavior: { type: 'object' },
      desktop_behavior: { type: 'object' },
      public_cta: { type: ['string', 'null'] },
      client_cta: { type: ['string', 'null'] },
      staff_cta: { type: ['string', 'null'] },
      avoid_list: arr(),
      visual_relationships: arr({ type: 'object', required: ['state', 'composition_emphasis', 'emphasis_role', 'panel_density', 'primary_cta', 'artifact_visibility', 'nav_emphasis', 'status_treatment', 'quiet'] }),
      section_overrides: { type: 'object' },
      e2e_proof_contract: { type: 'object', required: ['journey', 'not_applicable', 'steps'] },
      structure_refs: { type: 'object', required: ['routes', 'data_contracts', 'source_evidence'] },
      expression_refs: { type: 'object' },
      implementation_refs: { type: 'object' },
      lineage: { type: 'object', required: ['created', 'revised', 'approved', 'superseded_by', 'source_project_context', 'founder_decision', 'related_features', 'related_authorities'] },
      open_experience_questions: arr(),
      declared_completion: { enum: EXPERIENCE_COMPLETION_LADDER },
    },
    perspective_required_keys: PERSPECTIVE_REQUIRED_KEYS,
    project_dna_shape: ['project_id', 'project_name', 'brand {tagline, positioning, promise, voice}', 'visual_language {register, palette, emphasis_map, imagery, forbidden}', 'actors', 'role_projections', 'shared_surfaces', 'source_repositories'],
  });

  json('WORKSPACE_EXPERIENCE_BRAIN_STATE_MODEL.json', {
    state_classes: STATE_CLASSES,
    rule: 'Every feature-specific state maps onto one class; composition emphasis is defined per state (visual_relationships) and defaults per class.',
    anchors: ['start_state', 'success_state', 'blocked_state', 'error_states', 'empty_state', 'complete_state'],
    experience_completion: {
      ladder: EXPERIENCE_COMPLETION_LADDER,
      separate_from_functional_completion: true,
      earning_rules: {
        UNMAPPED: 'no states or no structure refs',
        STRUCTURED: 'states + structure routes + family',
        EXPERIENCE_DRAFTED: 'structured + archetype + CLIENT / FOUNDER_STAFF / SYSTEM perspectives at least partial',
        EXPERIENCE_COMPLETE: 'every required field, all applicable perspectives DEFINED, a visual relationship for every state, every E2E phase proven or N/A with reason, no open experience questions',
        VISUALIZED: 'experience complete + approved visual authority (expression_refs.authority_status = APPROVED)',
        IMPLEMENTED: 'external evidence (implementation drift test) — never derived from the contract alone',
        E2E_PROVEN: 'experience E2E contract passing in CI',
        APPROVED: 'founder approval recorded in lineage',
      },
      never_exceeds_declared: true,
    },
    section_grammar: SECTION_GRAMMAR,
    founder_hub_buckets: FOUNDER_HUB_BUCKETS,
    client_project_room_slots: CLIENT_PROJECT_ROOM_SLOTS,
  });

  json('WORKSPACE_EXPERIENCE_BRAIN_ACTOR_MODEL.json', {
    actors: {
      PUBLIC: { role: 'potential client discovering the service', perspective_keys: PERSPECTIVE_REQUIRED_KEYS.PUBLIC, may_be_not_applicable: 'only for internal / authenticated-only features, with a reason' },
      CLIENT: { role: 'client workspace user (incl. client-side role projections)', perspective_keys: PERSPECTIVE_REQUIRED_KEYS.CLIENT, may_be_not_applicable: false },
      FOUNDER_STAFF: { role: 'founder / staff workspace — the operational mirror', perspective_keys: PERSPECTIVE_REQUIRED_KEYS.FOUNDER_STAFF, may_be_not_applicable: false, mirror_rule: 'never a copy of the client UI: operational status, review work, exceptions, client needs, automation status, audit history, financial / service status where permitted' },
      SYSTEM: { role: 'automation — ingestion, derivation, transitions, events, vault / inbox movement, next cycle, failure handling', perspective_keys: PERSPECTIVE_REQUIRED_KEYS.SYSTEM, may_be_not_applicable: false },
    },
    experience_complete_requires: 'all four perspectives (PUBLIC may be not-applicable with reason)',
    role_projection_rule: 'Role projections (e.g. SHIPPER, DRIVER, PROVIDER, OFFICE) are views of the same contract, mapped to an actor — not separate features.',
    project_examples: { AIO: aio.AIO_DNA.role_projections },
  });

  json('WORKSPACE_EXPERIENCE_BRAIN_VISUAL_RELATIONSHIP_MODEL.json', {
    principle: 'Visual relationships are first-class data: every state declares how the experience changes when the feature enters it.',
    per_state_fields: ['composition_emphasis', 'emphasis_role', 'panel_density', 'primary_cta (per actor)', 'artifact_visibility', 'nav_emphasis', 'status_treatment', 'quiet'],
    emphasis_roles: ['NEUTRAL', 'PROGRESS', 'ATTENTION', 'BLOCKER', 'REVIEW', 'DECISION', 'SUCCESS', 'ARCHIVED', 'ERROR'],
    emphasis_rule: 'Contracts use semantic roles; each project DNA maps them to its palette (never hard-coded colours).',
    density: ['SPARSE', 'BALANCED', 'DENSE'],
    artifact_visibility: ['HIDDEN', 'PREVIEW', 'PROMINENT', 'ARCHIVED'],
    visual_archetypes: VISUAL_ARCHETYPES,
    cross_feature_visual_transition: 'Each cross-feature relationship carries visual_transition (e.g. active workbench collapses into a sealed folder in the Vault).',
    example: { feature: 'AIO.IFTA', state_relationships: ifta.visual_relationships, project_emphasis_map: aio.AIO_DNA.visual_language.emphasis_map },
  });

  json('WORKSPACE_EXPERIENCE_BRAIN_E2E_MODEL.json', {
    principle: 'E2E proves the lived experience across actors — not only that a route opens, a button works or an API returns.',
    phases: E2E_PHASES,
    step_shape: ['phase', 'actor', 'surface', 'action', 'expect[] (experience assertions)', 'state_after?'],
    derivation: 'deriveE2EContract(contract) merges authored steps with assertions derived from the contract: artifacts → ARTIFACT_CREATION, cross-feature relationships → DOWNSTREAM_MOVEMENT, vault destination → ARCHIVE, next_step → NEXT_STEP, inbox events → SYSTEM_PROCESSING, completion activity → COMPLETION.',
    not_applicable_rule: 'A phase may be skipped only with a reason in e2e_proof_contract.not_applicable.',
    example_derived: deriveE2EContract(ifta),
    coverage: contracts.map((c) => ({ feature_id: c.feature_id, ...deriveE2EContract(c).coverage })),
  });

  const allRows = [...contracts, ...samples.PORTABILITY_SAMPLES].map(registryRow);
  json('WORKSPACE_EXPERIENCE_BRAIN_REGISTRY.json', {
    projects: [
      { project: 'AIO', role: 'first full proof', features: contracts.length },
      { project: 'JURNL', role: 'portability sample (non-implemented)', features: samples.PORTABILITY_SAMPLES.filter((s) => s.project_id === 'JURNL').length },
      { project: 'FRONTAL_SLAYER', role: 'portability sample (non-implemented)', features: samples.PORTABILITY_SAMPLES.filter((s) => s.project_id === 'FRONTAL_SLAYER').length },
      { project: 'SITE00 / ASTRAL_WORLD / future client projects', role: 'supported by the portable schema; not yet mapped', features: 0 },
    ],
    columns: ['project', 'feature_id', 'family', 'actors', 'states', 'earned_completion', 'authority_readiness', 'e2e_readiness'],
    rows: allRows,
  });

  // ── AIO proof ───────────────────────────────────────────────────────────────────────────────────────
  json('AIO_EXPERIENCE_BRAIN_REGISTRY.json', {
    project: aio.AIO_DNA,
    source: aio.AIO_SOURCE_REPO,
    service_inventory: aio.AIO_SERVICE_INVENTORY,
    family_map: aio.AIO_FAMILY_MAP,
    rows: contracts.map(registryRow),
    screen_family_gate: screenFamilyGate(contracts),
    contracts_source: 'import { aio } from shared/studioos-experience-brain — AIO_EXPERIENCE_CONTRACTS (full contracts); IFTA is exported in full as AIO_IFTA_FUEL_TAX_EXPERIENCE_CONTRACT.json; per-actor maps carry every perspective.',
  });
  json('AIO_PUBLIC_EXPERIENCE_MAP.json', { features: contracts.map((c) => ({ feature_id: c.feature_id, feature_name: c.feature_name, public_entry: c.public_entry, public_cta: c.public_cta, perspective: c.perspectives.public, continuity: isNotApplicable(c.perspectives.public) ? null : c.perspectives.public.workspace_continuity })) });
  json('AIO_CLIENT_EXPERIENCE_MAP.json', { features: per('client').map((x, i) => ({ ...x, client_entry: contracts[i]!.client_entry, client_cta: contracts[i]!.client_cta, information_hierarchy: contracts[i]!.information_hierarchy.CLIENT, emotional_target: contracts[i]!.emotional_target.CLIENT })) });
  json('AIO_FOUNDER_STAFF_EXPERIENCE_MAP.json', { founder_hub_buckets: FOUNDER_HUB_BUCKETS, features: per('founder_staff').map((x, i) => ({ ...x, staff_entry: contracts[i]!.founder_staff_entry, staff_cta: contracts[i]!.staff_cta, information_hierarchy: contracts[i]!.information_hierarchy.FOUNDER_STAFF, human_tasks: contracts[i]!.human_tasks })) });
  json('AIO_SYSTEM_EXPERIENCE_MAP.json', { features: per('system').map((x, i) => ({ ...x, system_entry: contracts[i]!.system_entry, derivations: contracts[i]!.system_derivations, automations: contracts[i]!.automations, transitions: contracts[i]!.transitions })) });
  json('AIO_CROSS_FEATURE_EXPERIENCE_RELATIONSHIPS.json', {
    principle: 'Not just “A depends on B”: what each actor and surface experiences when A reaches a state.',
    relationships: aio.aioCrossFeatureRelationships(),
    upstream_downstream: contracts.map((c) => ({ feature_id: c.feature_id, upstream: c.upstream_systems, downstream: c.downstream_systems })),
  });
  json('AIO_VISUAL_ARCHETYPE_MAP.json', {
    features: contracts.map((c) => ({
      feature_id: c.feature_id,
      primary_metaphor: c.primary_metaphor,
      secondary_metaphor: c.secondary_metaphor,
      visual_archetype: c.visual_archetype,
      primary_visual_object: c.primary_visual_object,
      secondary_visual_objects: c.secondary_visual_objects,
      composition_rules: c.composition_rules,
      density_target: c.density_target,
      avoid_list: c.avoid_list,
    })),
  });

  json('AIO_IFTA_FUEL_TAX_EXPERIENCE_CONTRACT.json', { contract: ifta, receipt_classes: aio.AIO_IFTA_RECEIPT_CLASSES, mileage_sources: aio.AIO_IFTA_MILEAGE_SOURCES, validation: validateExperienceContract(ifta) });
  json('AIO_IFTA_FUEL_TAX_E2E_CONTRACT.json', { e2e: deriveE2EContract(ifta) });
  const brief = (actor: 'CLIENT' | 'FOUNDER_STAFF' | 'PUBLIC', state: string, viewport: 'MOBILE' | 'TABLET' | 'DESKTOP') => queryExperience({ contract: ifta, dna: aio.AIO_DNA, actor, state, viewport });
  json('AIO_IFTA_FUEL_TAX_VISUAL_CONTRACT.json', {
    primary_metaphor: ifta.primary_metaphor,
    secondary_metaphor: ifta.secondary_metaphor,
    visual_archetype: ifta.visual_archetype,
    primary_visual_object: ifta.primary_visual_object,
    secondary_visual_objects: ifta.secondary_visual_objects,
    composition_rules: ifta.composition_rules,
    avoid_list: ifta.avoid_list,
    viewports: { MOBILE: ifta.mobile_behavior, TABLET: ifta.tablet_behavior, DESKTOP: ifta.desktop_behavior },
    state_visual_relationships: ifta.visual_relationships,
    section_overrides: ifta.section_overrides,
    brand: aio.AIO_DNA.brand,
    visual_language: aio.AIO_DNA.visual_language,
    generator_briefs: {
      'CLIENT · COLLECTING · MOBILE': brief('CLIENT', 'COLLECTING', 'MOBILE'),
      'CLIENT · AWAITING_APPROVAL · MOBILE': brief('CLIENT', 'AWAITING_APPROVAL', 'MOBILE'),
      'CLIENT · FILED · DESKTOP': brief('CLIENT', 'FILED', 'DESKTOP'),
      'FOUNDER_STAFF · RECONCILING · DESKTOP': brief('FOUNDER_STAFF', 'RECONCILING', 'DESKTOP'),
      'PUBLIC · NOT_ENROLLED · MOBILE': brief('PUBLIC', 'NOT_ENROLLED', 'MOBILE'),
    },
  });

  const cov = coverageReport('AIO', contracts);
  json('AIO_EXPERIENCE_BRAIN_IMPLEMENTATION_BACKLOG.json', {
    principle: 'Author experience first; later visual refinement and implementation consume the contracts. No page redesign happened in this sprint.',
    items: [
      { id: 'XB-01', priority: 'P0', title: 'AIO IFTA experience-driven page refinement', detail: 'Build the client QUARTERLY FILING ROOM + staff Fuel Tax case file from AIO_IFTA_FUEL_TAX_VISUAL_CONTRACT briefs (mobile first).', consumes: ['AIO.IFTA'], repo: 'yoteenz/fsbw (AIO)' },
      { id: 'XB-02', priority: 'P0', title: 'Wire queryExperience into AIO / Studio OS page + authority generation', detail: 'Generators call queryExperience(feature, actor, state, viewport) and refuse EXPERIENCE_REQUIRED features (screen-family gate).', consumes: ['all'], repo: 'yoteenz/SITE00' },
      { id: 'XB-03', priority: 'P0', title: 'Experience E2E harness', detail: 'Turn deriveE2EContract output into Playwright journeys per actor (one browser context per actor), starting with AIO.IFTA.', consumes: ['AIO.IFTA'], repo: 'yoteenz/fsbw (AIO)' },
      { id: 'XB-04', priority: 'P1', title: 'Resolve AIO open experience questions', detail: 'Founder / ops answers for the partial features.', consumes: cov.gaps.map((g) => g.feature_id), repo: 'founder decision' },
      { id: 'XB-05', priority: 'P1', title: 'Split AIO.COMPLIANCE_SAFETY into one contract per service', detail: 'DOT compliance, DQ files, D&A consortium, Clearinghouse, ELD services, DOT audit, new-entrant audit, safety programs.', consumes: ['AIO.COMPLIANCE_SAFETY'], repo: 'yoteenz/SITE00' },
      { id: 'XB-06', priority: 'P1', title: 'Founder hub consumption', detail: 'Founder workspace buckets (NEEDS REVIEW · BLOCKED · AWAITING CLIENT · AWAITING PROVIDER · READY TO FILE · READY TO SEND · READY TO LAUNCH · COMPLETE) read founder_staff.hub_buckets.', consumes: ['all'], repo: 'yoteenz/fsbw (AIO office)' },
      { id: 'XB-07', priority: 'P1', title: 'Client project room consumption', detail: 'Status / needs you / next / decisions / files / messages / approvals / service progress read client.project_room.', consumes: ['all'], repo: 'yoteenz/fsbw (AIO portal)' },
      { id: 'XB-08', priority: 'P2', title: 'Structure drift test', detail: 'CI check that contract structure_refs (routes, state enums, catalog ids) still exist in the AIO repo.', consumes: ['all'], repo: 'yoteenz/SITE00 + yoteenz/fsbw' },
      { id: 'XB-09', priority: 'P2', title: 'Map the next projects', detail: 'Promote JURNL / Frontal Slayer samples to real contracts when those projects schedule experience work; map SITE 00 itself and Astral World.', consumes: ['samples'], repo: 'yoteenz/SITE00' },
      { id: 'XB-10', priority: 'P2', title: 'Founder approval rung', detail: 'Record founder approval per contract in lineage.approved to reach APPROVED.', consumes: ['all'], repo: 'founder decision' },
    ],
  });

  // ── markdown ────────────────────────────────────────────────────────────────────────────────────────
  const rows = contracts.map(registryRow);
  const pct = (n: number) => `${n}%`;
  out['AIO_EXPERIENCE_COVERAGE_REPORT.md'] = `# AIO — Experience coverage report

**Sprint:** ${EXPERIENCE_BRAIN_SPRINT} · **Project:** ${aio.AIO_DNA.project_name} (first full proof) · **Source:** ${aio.AIO_SOURCE_REPO}
_Generated from \`shared/studioos-experience-brain\` — do not edit by hand._

## Coverage

| Metric | Value |
|---|---|
| Total material features | ${cov.total_material_features} |
| Experience complete | ${cov.experience_complete} |
| Experience partial | ${cov.experience_partial} |
| Experience missing | ${cov.experience_missing} |
| Public coverage | ${pct(cov.public_coverage_pct)} (not applicable: ${cov.public_not_applicable.length} internal / authenticated-only features) |
| Client coverage | ${pct(cov.client_coverage_pct)} |
| Founder / staff coverage | ${pct(cov.founder_staff_coverage_pct)} |
| System coverage | ${pct(cov.system_coverage_pct)} |
| Visual archetype coverage | ${pct(cov.visual_archetype_coverage_pct)} |
| E2E contract coverage | ${pct(cov.e2e_contract_coverage_pct)} |

Experience completion is a separate axis from functional completion: a route, data model or readiness engine existing proves nothing about the experience. Functional % below comes from AIO's own family completion matrix and is shown only for contrast.

## Features

| Feature | Family | Archetype | Primary object | Earned | Authority | E2E | Functional % | Activation |
|---|---|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.feature_id} | ${r.family} | ${r.archetype.join(' / ')} | ${r.primary_object} | ${r.earned_completion} | ${r.authority_readiness} | ${r.e2e_readiness} | ${r.functional_completion_pct ?? '—'} | ${r.activation_state} |`).join('\n')}

## Service inventory (sprint §23)

${Object.entries(aio.AIO_SERVICE_INVENTORY).map(([k, v]) => `- **${k}** → \`${v}\``).join('\n')}

## Material experience gaps (explicit)

${cov.gaps.length ? cov.gaps.map((g) => `### ${g.feature_id} — ${g.earned}\n${g.gaps.map((x) => `- ${x}`).join('\n')}`).join('\n\n') : 'None.'}

## Not applicable (public)

${cov.public_not_applicable.map((f) => `- ${f} — ${(() => { const c = contracts.find((x) => x.feature_id === f)!; return isNotApplicable(c.perspectives.public) ? c.perspectives.public.reason : ''; })()}`).join('\n')}

## Screen-family gate

Features a generator may build screens for now: ${screenFamilyGate(contracts).filter((g) => g.status === 'GENERATE').length}. Features that return EXPERIENCE_REQUIRED: ${screenFamilyGate(contracts).filter((g) => g.status === 'EXPERIENCE_REQUIRED').map((g) => g.feature_id).join(', ') || 'none'}.
`;
  return out;
}

if (process.argv[1] && /experience-brain-export\.ts$/.test(process.argv[1])) {
  mkdirSync(DIR, { recursive: true });
  const files = buildExperienceBrainExports();
  for (const [name, body] of Object.entries(files)) writeFileSync(`${DIR}/${name}`, body);
  console.log(`exported ${Object.keys(files).length} files to ${DIR}`);
}

