/**
 * EXPERIENCE_BRAIN_REGISTRY + coverage (sprint §47, §53). One row per contract: project, feature, family, actors,
 * states, earned completion, authority readiness, E2E readiness. Coverage percentages exclude not-applicable
 * perspectives from the denominator (an internal-only feature has no public page to cover).
 */
import { type ExperienceActor, type ExperienceContract } from './schema.js';
import { validateExperienceContract, type ExperienceValidation } from './validate.js';

export type RegistryRow = {
  project: string;
  feature_id: string;
  feature_name: string;
  family: string;
  material: boolean;
  sample: boolean;
  actors: Record<ExperienceActor, string>;
  states: { id: string; class: string }[];
  archetype: string[];
  primary_object: string;
  declared_completion: string;
  earned_completion: string;
  experience_status: ExperienceValidation['status'];
  authority_readiness: 'READY' | 'EXPERIENCE_REQUIRED';
  e2e_readiness: 'READY' | 'INCOMPLETE';
  functional_completion_pct: number | null;
  activation_state: string;
  gate_failures: string[];
  gap_count: number;
};

export function registryRow(c: ExperienceContract): RegistryRow {
  const v = validateExperienceContract(c);
  return {
    project: c.project_id,
    feature_id: c.feature_id,
    feature_name: c.feature_name,
    family: c.family_id,
    material: c.material,
    sample: Boolean(c.sample),
    actors: Object.fromEntries(Object.entries(v.perspectives).map(([a, p]) => [a, p.status])) as Record<ExperienceActor, string>,
    states: c.states.map((s) => ({ id: s.id, class: s.state_class })),
    archetype: c.visual_archetype,
    primary_object: c.primary_visual_object,
    declared_completion: c.declared_completion,
    earned_completion: v.earned_completion,
    experience_status: v.status,
    authority_readiness: v.authority_ready ? 'READY' : 'EXPERIENCE_REQUIRED',
    e2e_readiness: v.e2e_ready ? 'READY' : 'INCOMPLETE',
    functional_completion_pct: c.implementation_refs.functional_completion_pct,
    activation_state: c.implementation_refs.activation_state,
    gate_failures: v.gate_failures,
    gap_count: v.gaps.length,
  };
}

export type CoverageReport = {
  project: string;
  total_material_features: number;
  experience_complete: number;
  experience_partial: number;
  experience_missing: number;
  public_coverage_pct: number;
  client_coverage_pct: number;
  founder_staff_coverage_pct: number;
  system_coverage_pct: number;
  visual_archetype_coverage_pct: number;
  e2e_contract_coverage_pct: number;
  public_not_applicable: string[];
  gaps: { feature_id: string; earned: string; gate_failures: string[]; gaps: string[] }[];
};

const pct = (n: number, d: number) => (d === 0 ? 100 : Math.round((n / d) * 1000) / 10);

export function coverageReport(project: string, contracts: ExperienceContract[]): CoverageReport {
  const material = contracts.filter((c) => c.material && !c.sample);
  const vals = material.map((c) => ({ c, v: validateExperienceContract(c) }));
  const perActor = (a: ExperienceActor) => {
    const applicable = vals.filter(({ v }) => v.perspectives[a].status !== 'NOT_APPLICABLE');
    return pct(applicable.filter(({ v }) => v.perspectives[a].status === 'DEFINED').length, applicable.length);
  };
  return {
    project,
    total_material_features: material.length,
    experience_complete: vals.filter(({ v }) => v.status === 'EXPERIENCE_COMPLETE').length,
    experience_partial: vals.filter(({ v }) => v.status === 'EXPERIENCE_PARTIAL').length,
    experience_missing: vals.filter(({ v }) => v.status === 'EXPERIENCE_MISSING').length,
    public_coverage_pct: perActor('PUBLIC'),
    client_coverage_pct: perActor('CLIENT'),
    founder_staff_coverage_pct: perActor('FOUNDER_STAFF'),
    system_coverage_pct: perActor('SYSTEM'),
    visual_archetype_coverage_pct: pct(vals.filter(({ c }) => c.visual_archetype.length > 0 && c.primary_visual_object.trim()).length, vals.length),
    e2e_contract_coverage_pct: pct(vals.filter(({ v }) => v.e2e_ready).length, vals.length),
    public_not_applicable: vals.filter(({ v }) => v.perspectives.PUBLIC.status === 'NOT_APPLICABLE').map(({ c }) => c.feature_id),
    gaps: vals.filter(({ v }) => v.gaps.length > 0 || v.gate_failures.length > 0).map(({ c, v }) => ({ feature_id: c.feature_id, earned: v.earned_completion, gate_failures: v.gate_failures, gaps: v.gaps })),
  };
}
