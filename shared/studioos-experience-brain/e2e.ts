/**
 * Experience E2E derivation (sprint §39–40). E2E no longer means "route opens / button works / API returns": it
 * proves the lived experience across actors — public discovery → client entry → client action → system processing →
 * staff review → client approval → artifact creation → downstream movement → completion → archive → next step.
 *
 * deriveE2EContract() merges the contract's authored steps with assertions DERIVED from the contract itself
 * (artifacts, events, cross-feature effects, vault destination, next step), so the test contract cannot drift from
 * the experience contract.
 */
import { E2E_PHASES, type E2EPhase, type E2EProofStep, type ExperienceActor, type ExperienceContract } from './schema.js';

export type DerivedE2EContract = {
  feature_id: string;
  journey: string;
  phase_order: E2EPhase[];
  not_applicable: Partial<Record<E2EPhase, string>>;
  steps: (E2EProofStep & { order: number; derived_expect: string[] })[];
  coverage: { required_phases: number; covered_phases: number; missing: E2EPhase[] };
};

export function deriveE2EContract(c: ExperienceContract): DerivedE2EContract {
  const derived: Partial<Record<E2EPhase, string[]>> = {
    ARTIFACT_CREATION: c.output_artifacts.map((a) => `artifact "${a.name}" exists (${a.status_lifecycle.at(-1)}) and is visible to ${a.visible_to.join(' + ')}`),
    DOWNSTREAM_MOVEMENT: c.cross_feature_relationships.map(
      (r) => `${r.to_feature} ${r.relationship.toLowerCase().replace(/_/g, ' ')} — ${Object.entries(r.surface_effects).map(([s, e]) => `${s}: ${e}`).join('; ')}`,
    ),
    ARCHIVE: c.vault_destination ? [`vault destination "${c.vault_destination}" holds the final artifacts`] : [],
    NEXT_STEP: [c.next_step],
    COMPLETION: [...c.activity_events.filter((e) => /complete|filed|closed|done|activated|approved/i.test(e.summary)).map((e) => `activity: ${e.summary}`)],
    SYSTEM_PROCESSING: c.inbox_events.map((e) => `inbox: ${e.summary} → ${e.audience.join(', ')}`),
  };
  const order = (p: E2EPhase) => E2E_PHASES.indexOf(p);
  const steps = [...c.e2e_proof_contract.steps]
    .sort((a, b) => order(a.phase) - order(b.phase))
    .map((s, i, all) => ({
      ...s,
      order: i + 1,
      // derived assertions attach to the FIRST authored step of their phase
      derived_expect: all.findIndex((x) => x.phase === s.phase) === i ? (derived[s.phase] ?? []) : [],
    }));
  const covered = new Set(steps.filter((s) => s.expect.length > 0).map((s) => s.phase));
  const missing = E2E_PHASES.filter((p) => !covered.has(p) && !c.e2e_proof_contract.not_applicable[p]);
  return {
    feature_id: c.feature_id,
    journey: c.e2e_proof_contract.journey,
    phase_order: [...E2E_PHASES],
    not_applicable: c.e2e_proof_contract.not_applicable,
    steps,
    coverage: { required_phases: E2E_PHASES.length - Object.keys(c.e2e_proof_contract.not_applicable).length, covered_phases: covered.size, missing },
  };
}

/** Actors an E2E run must authenticate as (one browser context per actor). */
export function e2eActors(c: ExperienceContract): ExperienceActor[] {
  return [...new Set(c.e2e_proof_contract.steps.map((s) => s.actor))];
}
