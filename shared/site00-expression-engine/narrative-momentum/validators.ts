import type { NarrativeMomentumPlan, NarrativeMomentumValidationFlag } from './types.js';

const GENERIC_FUNNEL_PATTERNS = [
  /\bhook\b.*\bproblem\b.*\bsolution\b/i,
  /\bcta\b/i,
  /\b3 steps to\b/i,
  /\bunlock your\b/i,
];

const CHEAP_LOOP_PATTERNS = [/want part 2/i, /comment below/i, /smash like/i, /follow for more/i];

export function validateNarrativeMomentumPlan(plan: NarrativeMomentumPlan): readonly NarrativeMomentumValidationFlag[] {
  const flags: NarrativeMomentumValidationFlag[] = [];
  const blob = JSON.stringify(plan).toLowerCase();

  if (GENERIC_FUNNEL_PATTERNS.some((re) => re.test(blob))) {
    flags.push('GENERIC_FUNNEL_DRIFT');
  }
  if (CHEAP_LOOP_PATTERNS.some((re) => re.test(plan.openLoop.newQuestion))) {
    flags.push('CHEAP_OPEN_LOOP_BAIT');
  }
  if (
    plan.selectedGrammarId === 'INVESTIGATION' &&
    plan.transformation.transformationType === 'PRODUCT_TRANSFORMATION'
  ) {
    flags.push('FORCED_TRANSFORMATION');
  }

  return flags;
}

export function narrativeSimilarityValidator(
  plan: NarrativeMomentumPlan,
  prior: readonly NarrativeMomentumPlan[],
): NarrativeMomentumValidationFlag | null {
  for (const p of prior) {
    if (p.selectedGrammarId !== plan.selectedGrammarId) continue;
    const sameOpen = p.openLoop.newQuestion.trim().toLowerCase() === plan.openLoop.newQuestion.trim().toLowerCase();
    const sameFirstBeat = p.beats[0]?.label === plan.beats[0]?.label;
    if (sameOpen && sameFirstBeat) return 'NARRATIVE_REPETITION_WARNING';
  }
  return null;
}

export function requireAudienceShift(plan: NarrativeMomentumPlan): boolean {
  return Boolean(plan.audienceStartingBelief.trim() && plan.audienceDesiredShift.trim() && plan.narrativeGoal.trim());
}
