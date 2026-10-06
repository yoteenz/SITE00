/**
 * Visual Authority Development Gate — evaluators and guards. Pure functions over data; no project assumptions.
 */
import { validateExperienceContract } from '../studioos-experience-brain/validate.js';
import { isNotApplicable, type ExperienceActor, type ExperienceContract, type Viewport } from '../studioos-experience-brain/schema.js';
import {
  APPROVING_VERDICTS,
  CORE_LOGIC_LOCK_KINDS,
  DEFAULT_LEGACY_VISUAL_CLASS,
  DEFAULT_TERRITORY_COUNT,
  LEGACY_VISUAL_CLASSES,
  LEGACY_VISUAL_DIMENSIONS,
  MIN_DISTINCT_STRUCTURAL_DIMENSIONS,
  RECOMMENDED_BRAND_FIELDS,
  REFERENCE_AUTHORITY_MUST_SHOW,
  REQUIRED_BRAND_FIELDS,
  REQUIRED_CORE_LOCKS,
  REQUIRED_EXPERIENCE_INGEST_FIELDS,
  TERRITORY_STRUCTURAL_DIMENSIONS,
  type AuthorityGateInput,
  type AuthorityGuardStatus,
  type AuthorityProductionState,
  type BrandContext,
  type CompositionTerritory,
  type CoreLogicLockKind,
  type DurableGateCondition,
  type ExperienceIngest,
  type ImplementationReport,
  type LegacySurface,
  type LegacyUse,
  type LegacyVisualClass,
  type LegacyVisualDimension,
  type PageFamilyAuthority,
  type ReferenceAuthority,
} from './schema.js';

const filled = (v: unknown): boolean =>
  v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '') && !(Array.isArray(v) && v.length === 0) &&
  !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0);

/* ─────────────────────────────── 01 brand ─────────────────────────────── */

export type BrandCheck = { status: 'BRAND_CONTEXT_LOADED' | 'BRAND_CONTEXT_REQUIRED'; missing: string[]; thin: string[]; open_questions: string[] };

export function checkBrandContext(b: BrandContext | null | undefined): BrandCheck {
  if (!b) return { status: 'BRAND_CONTEXT_REQUIRED', missing: [...REQUIRED_BRAND_FIELDS], thin: [], open_questions: [] };
  const missing = REQUIRED_BRAND_FIELDS.filter((k) => !filled(b[k]));
  const thin = RECOMMENDED_BRAND_FIELDS.filter((k) => !filled(b[k]));
  return { status: missing.length ? 'BRAND_CONTEXT_REQUIRED' : 'BRAND_CONTEXT_LOADED', missing, thin, open_questions: b.open_brand_questions ?? [] };
}

/* ─────────────────────────────── 02 experience ─────────────────────────────── */

/** Project the gate's minimum experience ingest for one actor from a Workspace Experience Brain contract. */
export function experienceIngest(c: ExperienceContract, actor: ExperienceActor): ExperienceIngest {
  const ih = c.information_hierarchy[actor];
  const fs = c.perspectives.founder_staff;
  return {
    experience_contract_id: `${c.feature_id}@${c.schema_version}`,
    purpose: c.purpose,
    promise: c.business_promise,
    primary_actor: actor,
    primary_task: ih?.primary_task ?? '',
    start_state: c.start_state,
    success_state: c.success_state,
    blocked_state: c.blocked_state,
    system_relationships: [...c.upstream_systems, ...c.downstream_systems],
    client_founder_mirror: isNotApplicable(fs) ? '' : fs.mirror_not_copy,
    metaphor: c.primary_metaphor,
    archetype: c.visual_archetype,
    information_hierarchy: ih ? { ...ih } : null,
    e2e_path: c.e2e_proof_contract.steps.map((s) => `${s.phase}: ${s.action}`),
  };
}

export type ExperienceCheck = { status: 'EXPERIENCE_COMPLETE' | 'EXPERIENCE_REQUIRED'; missing: string[]; gaps: string[] };

export function checkExperience(c: ExperienceContract | null | undefined, actor: ExperienceActor): ExperienceCheck {
  if (!c) return { status: 'EXPERIENCE_REQUIRED', missing: ['experience_contract'], gaps: [] };
  const v = validateExperienceContract(c);
  const ingest = experienceIngest(c, actor);
  const missing = REQUIRED_EXPERIENCE_INGEST_FIELDS.filter((k) => !filled(ingest[k])).map(String);
  const ok = v.experience_ready && missing.length === 0;
  return { status: ok ? 'EXPERIENCE_COMPLETE' : 'EXPERIENCE_REQUIRED', missing, gaps: [...v.gate_failures, ...v.gaps] };
}

/* ─────────────────────────────── 03 legacy firewall ─────────────────────────────── */

export const legacyClassOf = (s: LegacySurface): LegacyVisualClass => {
  // Promotion needs a founder decision; a class claimed without one falls back to the default.
  if ((s.visual_class === 'APPROVED_AUTHORITY' || s.visual_class === 'PARTIAL_AUTHORITY') && !filled(s.founder_decision)) return DEFAULT_LEGACY_VISUAL_CLASS;
  return s.visual_class ?? DEFAULT_LEGACY_VISUAL_CLASS;
};

export type LegacyLeak = { surface_id: string; visual_class: LegacyVisualClass; leaked_dimensions: LegacyVisualDimension[] };
export type LegacyCheck = { status: 'LEGACY_STATUS_KNOWN' | 'LEGACY_STATUS_UNKNOWN' | 'LEGACY_VISUAL_LEAK'; leaks: LegacyLeak[]; unknown_surfaces: string[] };

const isVisualDim = (d: string): d is LegacyVisualDimension => (LEGACY_VISUAL_DIMENSIONS as readonly string[]).includes(d);

export function checkLegacyUse(surfaces: LegacySurface[] | null | undefined, uses: LegacyUse[] = []): LegacyCheck {
  if (!surfaces) return { status: 'LEGACY_STATUS_UNKNOWN', leaks: [], unknown_surfaces: [] };
  const byId = new Map(surfaces.map((s) => [s.surface_id, s]));
  const leaks: LegacyLeak[] = [];
  const unknown: string[] = [];
  for (const u of uses) {
    const s = byId.get(u.surface_id);
    // A surface the gate has never classified is treated with the default class (functional reference only).
    if (!s) unknown.push(u.surface_id);
    const cls = s ? legacyClassOf(s) : DEFAULT_LEGACY_VISUAL_CLASS;
    const rule = LEGACY_VISUAL_CLASSES[cls].may_control_visuals;
    const visual = u.uses.filter(isVisualDim);
    const leaked = rule === 'ALL' ? [] : rule === 'PROMOTED_DIMENSIONS_ONLY' ? visual.filter((d) => !(s?.promoted_dimensions ?? []).includes(d)) : visual;
    if (leaked.length) leaks.push({ surface_id: u.surface_id, visual_class: cls, leaked_dimensions: leaked });
  }
  return { status: leaks.length ? 'LEGACY_VISUAL_LEAK' : 'LEGACY_STATUS_KNOWN', leaks, unknown_surfaces: unknown };
}

/* ─────────────────────────────── 04 territory distinctness ─────────────────────────────── */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export type TerritoryPairDiff = { a: string; b: string; differing: string[]; distinct: boolean };
export type TerritoryCheck = {
  status: 'TERRITORIES_DISTINCT' | 'AUTHORITY_TERRITORIES_REQUIRED' | 'TERRITORY_DISTINCTNESS_FAILURE';
  count: number;
  pairs: TerritoryPairDiff[];
  page_logic_missing: string[];
  reasons: string[];
};

/**
 * Territories must differ in page logic, not paint. Each pair must differ on ≥ MIN_DISTINCT_STRUCTURAL_DIMENSIONS of the
 * six structural dimensions, including spatial_logic or primary_zone. Swapping hero image / color / typeface / one card
 * changes no structural dimension → TERRITORY_DISTINCTNESS_FAILURE. A territory without page logic is purely aesthetic.
 */
export function checkTerritoryDistinctness(ts: CompositionTerritory[] | undefined, required = DEFAULT_TERRITORY_COUNT): TerritoryCheck {
  const list = (ts ?? []).filter((t) => t.status !== 'REJECTED' && t.status !== 'SUPERSEDED');
  const reasons: string[] = [];
  if (list.length < required) {
    return { status: 'AUTHORITY_TERRITORIES_REQUIRED', count: list.length, pairs: [], page_logic_missing: [], reasons: [`${list.length} of ${required} territories`] };
  }
  const page_logic_missing = list
    .filter((t) => !filled(t.page_logic) || !filled(t.major_zones) || !filled(t.primary_object) || TERRITORY_STRUCTURAL_DIMENSIONS.some((d) => !filled(t.structure?.[d])))
    .map((t) => t.territory_id);
  if (page_logic_missing.length) reasons.push(`no page logic (purely aesthetic): ${page_logic_missing.join(', ')}`);
  const pairs: TerritoryPairDiff[] = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      const differing = TERRITORY_STRUCTURAL_DIMENSIONS.filter((d) => norm(a.structure?.[d] ?? '') !== norm(b.structure?.[d] ?? ''));
      const anchor = differing.includes('spatial_logic') || differing.includes('primary_zone');
      const distinct = anchor && differing.length >= MIN_DISTINCT_STRUCTURAL_DIMENSIONS;
      if (!distinct) reasons.push(`${a.territory_id} ↔ ${b.territory_id} differ structurally on ${differing.length} (${differing.join(', ') || 'none — cosmetic only'})`);
      pairs.push({ a: a.territory_id, b: b.territory_id, differing, distinct });
    }
  }
  const ok = !page_logic_missing.length && pairs.every((p) => p.distinct);
  return { status: ok ? 'TERRITORIES_DISTINCT' : 'TERRITORY_DISTINCTNESS_FAILURE', count: list.length, pairs, page_logic_missing, reasons };
}

/* ─────────────────────────────── 05 reference authorities ─────────────────────────────── */

export type ReferenceCheck = { status: 'REFERENCES_COMPLETE' | 'REFERENCE_AUTHORITY_REQUIRED'; missing_territories: string[]; insufficient: { reference_id: string; missing_proof: string[] }[] };

export function checkReferences(ts: CompositionTerritory[] | undefined, refs: ReferenceAuthority[] | undefined): ReferenceCheck {
  const live = (ts ?? []).filter((t) => t.status !== 'REJECTED' && t.status !== 'SUPERSEDED');
  const missing_territories = live.filter((t) => !(refs ?? []).some((r) => r.territory_id === t.territory_id)).map((t) => t.territory_id);
  const insufficient = (refs ?? [])
    .map((r) => ({ reference_id: r.reference_id, missing_proof: REFERENCE_AUTHORITY_MUST_SHOW.filter((p) => !r.shows.includes(p)) as string[] }))
    .filter((x) => x.missing_proof.length > 0);
  return { status: missing_territories.length || insufficient.length ? 'REFERENCE_AUTHORITY_REQUIRED' : 'REFERENCES_COMPLETE', missing_territories, insufficient };
}

/* ─────────────────────────────── 07 lock ─────────────────────────────── */

export type LockCheck = { locked: boolean; missing: string[] };

export function checkAuthorityLock(a: PageFamilyAuthority | null | undefined): LockCheck {
  if (!a) return { locked: false, missing: ['page_family_authority'] };
  const missing: string[] = [];
  if (a.founder_status !== 'APPROVED') missing.push('founder_status APPROVED');
  if (a.authority_level === 'CONCEPT_AUTHORITY' || a.authority_level === 'COMPOSITION_AUTHORITY') missing.push('authority_level ≥ PAGE_FAMILY_AUTHORITY');
  for (const k of REQUIRED_CORE_LOCKS) if (!a.core_logic_locks.some((l) => l.kind === k && filled(l.value))) missing.push(`core lock ${k}`);
  if (!filled(a.flexible_implementation_areas)) missing.push('flexible_implementation_areas');
  if (!filled(a.viewports)) missing.push('viewports');
  if (!filled(a.state_coverage)) missing.push('state_coverage');
  if (!filled(a.territory_source)) missing.push('territory_source');
  if (!filled(a.lineage?.founder_decisions)) missing.push('lineage.founder_decisions');
  return { locked: missing.length === 0, missing };
}

/* ─────────────────────────────── 08–09 deviation ─────────────────────────────── */

export type DeviationCheck = {
  status: 'WITHIN_AUTHORITY' | 'FOUNDER_REVIEW_REQUIRED';
  material: { kind: CoreLogicLockKind; reason: string }[];
  improvements: { area: string; description: string; explained: boolean }[];
};

const isCoreKind = (k: string): k is CoreLogicLockKind => (CORE_LOGIC_LOCK_KINDS as readonly string[]).includes(k);

/** Implementation may improve anything flexible; touching a core lock (declared or observed) needs founder review. */
export function classifyDeviation(a: PageFamilyAuthority, impl: ImplementationReport): DeviationCheck {
  const material: DeviationCheck['material'] = [];
  const improvements: DeviationCheck['improvements'] = [];
  for (const c of impl.changes) {
    if (isCoreKind(c.area)) material.push({ kind: c.area, reason: `declared change: ${c.description}` });
    else improvements.push({ area: c.area, description: c.description, explained: filled(c.explanation) });
  }
  for (const [kind, value] of Object.entries(impl.observed ?? {}) as [CoreLogicLockKind, string][]) {
    const lock = a.core_logic_locks.find((l) => l.kind === kind);
    if (lock && norm(lock.value) !== norm(value) && !material.some((m) => m.kind === kind)) {
      material.push({ kind, reason: `observed “${value}” ≠ locked “${lock.value}”` });
    }
  }
  return { status: material.length ? 'FOUNDER_REVIEW_REQUIRED' : 'WITHIN_AUTHORITY', material, improvements };
}

/* ─────────────────────────────── the gate ─────────────────────────────── */

export type AuthorityGateResult = {
  feature_id: string;
  actor: ExperienceActor;
  material: boolean;
  /** Furthest production state earned. */
  state: AuthorityProductionState;
  /** A guard that stops the line (null when none). */
  guard: AuthorityGuardStatus | null;
  /** The durable-rule verdict: VISUAL_AUTHORITY_REQUIRED until all seven conditions hold. */
  durable_rule: 'SATISFIED' | 'VISUAL_AUTHORITY_REQUIRED' | 'NOT_REQUIRED_NON_MATERIAL';
  conditions: Record<DurableGateCondition, boolean>;
  implementation_ready: boolean;
  next_step: string;
  reasons: string[];
};

/**
 * Evaluate one actor's page family through the gate. Order follows the canonical sequence; the first unmet step sets the
 * state. Material families cannot reach IMPLEMENTATION_READY without an approved, locked page-family authority.
 */
export function evaluateAuthorityGate(i: AuthorityGateInput): AuthorityGateResult {
  const reasons: string[] = [];
  const conditions: Record<DurableGateCondition, boolean> = {
    BRAND_CONTEXT_LOADED: false, EXPERIENCE_CONTRACT_LOADED: false, LEGACY_VISUAL_STATUS_KNOWN: false, COMPOSITION_TERRITORIES_EXIST: false,
    REFERENCE_AUTHORITY_EXISTS: false, FOUNDER_APPROVAL_EXISTS: false, PAGE_FAMILY_AUTHORITY_LOCKED: false,
  };
  const out = (state: AuthorityProductionState, guard: AuthorityGuardStatus | null, next: string): AuthorityGateResult => {
    const all = Object.values(conditions).every(Boolean);
    const implementation_ready =
      guard === null && (!i.material || all) && ['IMPLEMENTATION_READY', 'IMPLEMENTING', 'LIVE_REVIEW', 'LIVE_AUTHORITY'].includes(state);
    return {
      feature_id: i.feature_id, actor: i.actor, material: i.material, state, guard,
      durable_rule: !i.material ? 'NOT_REQUIRED_NON_MATERIAL' : all ? 'SATISFIED' : 'VISUAL_AUTHORITY_REQUIRED',
      conditions, implementation_ready, next_step: next, reasons,
    };
  };

  if (!i.family_locked) {
    reasons.push('product tree / family not locked');
    return out('EXPERIENCE_REQUIRED', 'FAMILY_LOCK_REQUIRED', 'Lock the product tree / family first.');
  }

  const exp = checkExperience(i.experience_contract, i.actor);
  if (exp.status !== 'EXPERIENCE_COMPLETE') {
    reasons.push(...exp.missing.map((m) => `experience: missing ${m}`), ...exp.gaps);
    return out('EXPERIENCE_REQUIRED', i.material ? 'VISUAL_AUTHORITY_REQUIRED' : null, 'Author / complete the experience contract (Workspace Experience Brain).');
  }
  conditions.EXPERIENCE_CONTRACT_LOADED = true;

  const brand = checkBrandContext(i.brand_context);
  if (brand.status !== 'BRAND_CONTEXT_LOADED') {
    reasons.push(...brand.missing.map((m) => `brand: missing ${m}`));
    return out('BRAND_CONTEXT_REQUIRED', i.material ? 'VISUAL_AUTHORITY_REQUIRED' : null, 'Supply brand DNA (positioning, audience, voice, color, materials, typography, mood, architecture, avoid list).');
  }
  conditions.BRAND_CONTEXT_LOADED = true;

  const legacy = checkLegacyUse(i.legacy_surfaces, [...(i.legacy_uses ?? []), ...(i.implementation?.legacy_uses ?? [])]);
  if (legacy.status === 'LEGACY_VISUAL_LEAK') {
    conditions.LEGACY_VISUAL_STATUS_KNOWN = true;
    reasons.push(...legacy.leaks.map((l) => `${l.surface_id} (${l.visual_class}) leaked ${l.leaked_dimensions.join(', ')}`));
    return out(i.implementation && i.implementation.status !== 'NOT_STARTED' ? 'IMPLEMENTING' : 'EXPERIENCE_COMPLETE', 'LEGACY_VISUAL_LEAK',
      'Remove legacy visual structure; legacy FUNCTIONAL_REFERENCE_ONLY surfaces inform function only.');
  }
  conditions.LEGACY_VISUAL_STATUS_KNOWN = legacy.status === 'LEGACY_STATUS_KNOWN';
  if (!conditions.LEGACY_VISUAL_STATUS_KNOWN) reasons.push('legacy visual status unknown — classify existing surfaces (default FUNCTIONAL_REFERENCE_ONLY)');

  if (!i.material) {
    reasons.push('non-material family: authority development optional');
    return out(i.implementation?.status === 'COMPLETE' ? 'LIVE_REVIEW' : i.implementation?.status === 'IMPLEMENTING' ? 'IMPLEMENTING' : 'IMPLEMENTATION_READY', null, 'Implement against experience contract + brand DNA.');
  }

  if (!conditions.LEGACY_VISUAL_STATUS_KNOWN) return out('EXPERIENCE_COMPLETE', 'VISUAL_AUTHORITY_REQUIRED', 'Classify legacy surfaces, then author 3 composition territories.');

  const terr = checkTerritoryDistinctness(i.territories);
  if (terr.status === 'AUTHORITY_TERRITORIES_REQUIRED') {
    reasons.push(...terr.reasons);
    return out('AUTHORITY_TERRITORIES_REQUIRED', 'VISUAL_AUTHORITY_REQUIRED', 'Author 3 distinct composition territories.');
  }
  if (terr.status === 'TERRITORY_DISTINCTNESS_FAILURE') {
    reasons.push(...terr.reasons);
    return out('AUTHORITY_TERRITORIES_REQUIRED', 'TERRITORY_DISTINCTNESS_FAILURE', 'Rebuild territories so they differ in page logic, not paint.');
  }
  conditions.COMPOSITION_TERRITORIES_EXIST = true;

  const refs = checkReferences(i.territories, i.references);
  if (refs.status !== 'REFERENCES_COMPLETE') {
    reasons.push(...refs.missing_territories.map((t) => `no reference authority for ${t}`), ...refs.insufficient.map((x) => `${x.reference_id} does not show ${x.missing_proof.join(', ')}`));
    return out('AUTHORITY_TERRITORIES_REQUIRED', 'REFERENCE_AUTHORITY_REQUIRED', 'Generate / assemble one reference authority per territory.');
  }
  conditions.REFERENCE_AUTHORITY_EXISTS = true;

  const d = i.founder_decision;
  if (!d || !APPROVING_VERDICTS.includes(d.verdict)) {
    reasons.push(d ? `founder verdict ${d.verdict}` : 'awaiting founder decision');
    return out('AUTHORITY_IN_REVIEW', 'VISUAL_AUTHORITY_REQUIRED', d?.verdict === 'REQUEST_FOURTH_TERRITORY' ? 'Author a fourth territory.' : 'Founder chooses / revises / combines.');
  }
  conditions.FOUNDER_APPROVAL_EXISTS = true;

  const lock = checkAuthorityLock(i.authority);
  if (!lock.locked) {
    reasons.push(...lock.missing.map((m) => `lock: missing ${m}`));
    return out('AUTHORITY_APPROVED', 'VISUAL_AUTHORITY_REQUIRED', 'Lock the page-family authority (core logic locks + flexible areas + lineage).');
  }
  conditions.PAGE_FAMILY_AUTHORITY_LOCKED = true;

  const impl = i.implementation;
  if (!impl || impl.status === 'NOT_STARTED') return out('IMPLEMENTATION_READY', null, 'Implement against the locked page-family authority.');

  const dev = classifyDeviation(i.authority!, impl);
  if (dev.status === 'FOUNDER_REVIEW_REQUIRED') {
    reasons.push(...dev.material.map((m) => `${m.kind}: ${m.reason}`));
    return out(impl.status === 'COMPLETE' ? 'LIVE_REVIEW' : 'IMPLEMENTING', 'FOUNDER_REVIEW_REQUIRED', 'Founder reviews the material deviation (approve → new authority version, or revert).');
  }
  if (impl.status === 'IMPLEMENTING') return out('IMPLEMENTING', null, 'Increase fidelity without violating core logic.');
  if (!impl.live_founder_approved) return out('LIVE_REVIEW', null, 'Founder reviews the live implementation.');
  return out('LIVE_AUTHORITY', null, 'Live implementation is the authority; lineage retained.');
}

/* ─────────────────────────────── generation guard ─────────────────────────────── */

export type PageGenerationRequest = {
  project_id: string;
  family_id: string;
  feature_id: string;
  actor: ExperienceActor;
  state: string;
  viewport: Viewport;
  material: boolean;
  brand_context?: BrandContext | null;
  experience_contract?: ExperienceContract | null;
  authority?: PageFamilyAuthority | null;
  legacy_surfaces?: LegacySurface[];
  legacy_uses?: LegacyUse[];
  /** Assets the generated page will ship at runtime — an authority reference image is never one. */
  runtime_assets?: string[];
  route?: string;
  copy?: string;
};

export type PageGenerationVerdict =
  | { status: 'GENERATE'; inputs: string[] }
  | { status: 'EXPERIENCE_REQUIRED' | 'BRAND_CONTEXT_REQUIRED' | AuthorityGuardStatus; missing: string[] };

/** Generators receive BRAND DNA + EXPERIENCE CONTRACT + PAGE-FAMILY AUTHORITY + STATE + VIEWPORT — never route + copy only. */
export function guardPageGeneration(r: PageGenerationRequest): PageGenerationVerdict {
  const exp = checkExperience(r.experience_contract, r.actor);
  if (exp.status !== 'EXPERIENCE_COMPLETE') return { status: 'EXPERIENCE_REQUIRED', missing: exp.missing.length ? exp.missing : exp.gaps };
  const brand = checkBrandContext(r.brand_context);
  if (brand.status !== 'BRAND_CONTEXT_LOADED') return { status: 'BRAND_CONTEXT_REQUIRED', missing: brand.missing };
  const legacy = checkLegacyUse(r.legacy_surfaces ?? [], r.legacy_uses ?? []);
  if (legacy.status === 'LEGACY_VISUAL_LEAK') return { status: 'LEGACY_VISUAL_LEAK', missing: legacy.leaks.map((l) => `${l.surface_id}: ${l.leaked_dimensions.join(', ')}`) };
  if (r.material) {
    const lock = checkAuthorityLock(r.authority);
    if (!lock.locked) return { status: 'VISUAL_AUTHORITY_REQUIRED', missing: lock.missing };
    const a = r.authority!;
    if (!a.viewports.includes(r.viewport) && !(a.scales_to ?? []).includes(r.viewport)) {
      return { status: 'RESPONSIVE_AUTHORITY_REQUIRED', missing: [`${r.viewport} authority (do not shrink / stretch ${a.viewports.join('/')})`] };
    }
    if (!a.state_coverage.includes(r.state)) return { status: 'VISUAL_AUTHORITY_REQUIRED', missing: [`state coverage for ${r.state}`] };
    const leaked = (r.runtime_assets ?? []).filter((p) => a.reference_paths.includes(p));
    if (leaked.length) return { status: 'AUTHORITY_AS_RUNTIME_ASSET', missing: leaked };
  }
  return { status: 'GENERATE', inputs: ['BRAND_DNA', 'EXPERIENCE_CONTRACT', ...(r.material ? ['PAGE_FAMILY_AUTHORITY'] : []), 'STATE', 'VIEWPORT'] };
}
