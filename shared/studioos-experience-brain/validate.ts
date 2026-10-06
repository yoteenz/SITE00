/**
 * Experience contract validation. Derives the completion rung a contract EARNS (never trusts the declared one) and
 * the gates a page / authority generator and an E2E designer check before consuming it.
 */
import {
  E2E_PHASES,
  EXPERIENCE_COMPLETION_LADDER,
  NULLABLE_WHEN_NOT_APPLICABLE,
  PERSPECTIVE_REQUIRED_KEYS,
  REQUIRED_CONTRACT_FIELDS,
  isNotApplicable,
  type E2EPhase,
  type ExperienceActor,
  type ExperienceCompletion,
  type ExperienceContract,
} from './schema.js';

export type PerspectiveStatus = 'DEFINED' | 'PARTIAL' | 'MISSING' | 'NOT_APPLICABLE';

export type ExperienceValidation = {
  feature_id: string;
  declared_completion: ExperienceCompletion;
  earned_completion: ExperienceCompletion;
  status: 'EXPERIENCE_COMPLETE' | 'EXPERIENCE_PARTIAL' | 'EXPERIENCE_MISSING';
  experience_ready: boolean;
  authority_ready: boolean;
  e2e_ready: boolean;
  perspectives: Record<ExperienceActor, { status: PerspectiveStatus; missing: string[] }>;
  missing_fields: string[];
  states_without_visual_relationship: string[];
  e2e_missing_phases: E2EPhase[];
  /** Sprint §48 gate reasons (CLIENT FLOW / FOUNDER FLOW / SYSTEM FLOW / VISUAL ARCHETYPE / SUCCESS STATE / E2E CONTRACT). */
  gate_failures: string[];
  /** Explicit material gaps (§24) — what a later sprint must author. */
  gaps: string[];
};

const PERSPECTIVE_KEY: Record<ExperienceActor, keyof ExperienceContract['perspectives']> = {
  PUBLIC: 'public',
  CLIENT: 'client',
  FOUNDER_STAFF: 'founder_staff',
  SYSTEM: 'system',
};

function filled(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.values(v as object).some(filled);
  return true;
}

function perspectiveStatus(c: ExperienceContract, actor: ExperienceActor): { status: PerspectiveStatus; missing: string[] } {
  const p = c.perspectives[PERSPECTIVE_KEY[actor]] as unknown;
  if (p === undefined || p === null) return { status: 'MISSING', missing: [...PERSPECTIVE_REQUIRED_KEYS[actor]] };
  if (isNotApplicable(p)) {
    // only the PUBLIC perspective may be not-applicable (internal-only features), and only with a reason
    return actor === 'PUBLIC' && p.reason.trim() ? { status: 'NOT_APPLICABLE', missing: [] } : { status: 'MISSING', missing: [`${actor} marked not-applicable without a valid reason`] };
  }
  const missing = PERSPECTIVE_REQUIRED_KEYS[actor].filter((k) => !filled((p as Record<string, unknown>)[k]));
  if (missing.length === 0) return { status: 'DEFINED', missing };
  return { status: missing.length === PERSPECTIVE_REQUIRED_KEYS[actor].length ? 'MISSING' : 'PARTIAL', missing };
}

const rung = (c: ExperienceCompletion) => EXPERIENCE_COMPLETION_LADDER.indexOf(c);

export function validateExperienceContract(c: ExperienceContract): ExperienceValidation {
  const missing_fields = REQUIRED_CONTRACT_FIELDS.filter((f) => {
    const v = c[f] as unknown;
    if ((NULLABLE_WHEN_NOT_APPLICABLE as readonly string[]).includes(f)) return v === undefined;
    if (isNotApplicable(v)) return !v.reason.trim();
    return !filled(v);
  });

  const perspectives = Object.fromEntries((['PUBLIC', 'CLIENT', 'FOUNDER_STAFF', 'SYSTEM'] as const).map((a) => [a, perspectiveStatus(c, a)])) as ExperienceValidation['perspectives'];

  const stateIds = new Set(c.states.map((s) => s.id));
  const anchorStates = [c.start_state, c.success_state, c.blocked_state, c.empty_state, c.complete_state, ...c.error_states];
  const unknownAnchors = anchorStates.filter((s) => s && !stateIds.has(s));
  const visualStates = new Set(c.visual_relationships.map((v) => v.state));
  const states_without_visual_relationship = c.states.map((s) => s.id).filter((s) => !visualStates.has(s));
  const badTransitions = c.transitions.filter((t) => !stateIds.has(t.from) || !stateIds.has(t.to)).map((t) => `${t.from}→${t.to}`);

  const coveredPhases = new Set(c.e2e_proof_contract.steps.filter((s) => s.expect.length > 0).map((s) => s.phase));
  const e2e_missing_phases = E2E_PHASES.filter((p) => !coveredPhases.has(p) && !c.e2e_proof_contract.not_applicable[p]);

  const hierarchyMissing = (['CLIENT', 'FOUNDER_STAFF'] as const).filter(
    (a) => perspectives[a].status !== 'NOT_APPLICABLE' && !filled(c.information_hierarchy[a]),
  );
  const emotionMissing = (['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'] as const).filter((a) => perspectives[a].status !== 'NOT_APPLICABLE' && !filled(c.emotional_target[a]));

  // §48 gates
  const gate_failures: string[] = [];
  if (perspectives.CLIENT.status !== 'DEFINED') gate_failures.push('CLIENT FLOW');
  if (perspectives.FOUNDER_STAFF.status !== 'DEFINED') gate_failures.push('FOUNDER FLOW');
  if (perspectives.SYSTEM.status !== 'DEFINED') gate_failures.push('SYSTEM FLOW');
  if (perspectives.PUBLIC.status === 'PARTIAL' || perspectives.PUBLIC.status === 'MISSING') gate_failures.push('PUBLIC FLOW');
  if (c.visual_archetype.length === 0 || !c.primary_visual_object.trim()) gate_failures.push('VISUAL ARCHETYPE');
  if (!c.success_state || !stateIds.has(c.success_state)) gate_failures.push('SUCCESS STATE');
  if (e2e_missing_phases.length > 0) gate_failures.push('E2E CONTRACT');

  const gaps = [
    ...missing_fields.map((f) => `field: ${f}`),
    ...Object.entries(perspectives).flatMap(([a, p]) => p.missing.map((m) => `${a}: ${m}`)),
    ...unknownAnchors.map((s) => `anchor state not in states: ${s}`),
    ...badTransitions.map((t) => `transition references unknown state: ${t}`),
    ...states_without_visual_relationship.map((s) => `no visual relationship for state: ${s}`),
    ...e2e_missing_phases.map((p) => `e2e phase not proven: ${p}`),
    ...hierarchyMissing.map((a) => `information hierarchy missing for ${a}`),
    ...emotionMissing.map((a) => `emotional target missing for ${a}`),
    ...(c.open_experience_questions ?? []).map((q) => `open question: ${q}`),
  ];

  // earned rung
  const structured = c.states.length > 0 && c.structure_refs.routes.length > 0 && filled(c.family_id);
  const drafted =
    structured &&
    c.visual_archetype.length > 0 &&
    (['CLIENT', 'FOUNDER_STAFF', 'SYSTEM'] as const).every((a) => perspectives[a].status === 'DEFINED' || perspectives[a].status === 'PARTIAL');
  const complete = drafted && gaps.length === 0 && gate_failures.length === 0;
  let earned: ExperienceCompletion = complete ? 'EXPERIENCE_COMPLETE' : drafted ? 'EXPERIENCE_DRAFTED' : structured ? 'STRUCTURED' : 'UNMAPPED';
  // higher rungs need external evidence; never exceed what the author declared
  if (complete && c.expression_refs.authority_status === 'APPROVED') earned = 'VISUALIZED';
  if (rung(earned) > rung(c.declared_completion)) earned = c.declared_completion;

  const experience_ready = rung(earned) >= rung('EXPERIENCE_COMPLETE');
  const authority_ready =
    experience_ready && states_without_visual_relationship.length === 0 && c.composition_rules.length > 0 && c.avoid_list.length > 0;
  const e2e_ready = e2e_missing_phases.length === 0 && c.e2e_proof_contract.steps.every((s) => s.expect.length > 0);

  return {
    feature_id: c.feature_id,
    declared_completion: c.declared_completion,
    earned_completion: earned,
    status: experience_ready ? 'EXPERIENCE_COMPLETE' : drafted ? 'EXPERIENCE_PARTIAL' : 'EXPERIENCE_MISSING',
    experience_ready,
    authority_ready,
    e2e_ready,
    perspectives,
    missing_fields,
    states_without_visual_relationship,
    e2e_missing_phases,
    gate_failures,
    gaps,
  };
}
