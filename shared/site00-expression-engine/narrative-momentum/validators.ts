import type {
  NarrativeMomentumPlan,
  NarrativeMomentumValidationFlag,
  NarrativeValidationIssue,
} from './types.js';

const GENERIC_FUNNEL_PATTERNS = [
  /\bhook\b.*\bproblem\b.*\bsolution\b/i,
  /\bcta\b/i,
  /\b3 steps to\b/i,
  /\bunlock your\b/i,
];

const CHEAP_LOOP_PATTERNS = [/want part 2/i, /comment below/i, /smash like/i, /follow for more/i];

function issueFromFlag(
  flagId: NarrativeMomentumValidationFlag,
  partial: Omit<NarrativeValidationIssue, 'flagId'>,
): NarrativeValidationIssue {
  return { flagId, ...partial };
}

export function validateNarrativeMomentumPlanIssues(plan: NarrativeMomentumPlan): readonly NarrativeValidationIssue[] {
  const issues: NarrativeValidationIssue[] = [];
  const blob = JSON.stringify(plan).toLowerCase();

  if (GENERIC_FUNNEL_PATTERNS.some((re) => re.test(blob))) {
    const beatIds = plan.beats
      .filter((b) => /claim|hook|solution/i.test(b.label + b.whatChangesInThisBeat))
      .map((b) => b.beatId);
    issues.push(
      issueFromFlag('GENERIC_FUNNEL_DRIFT', {
        severity: 'WARNING',
        trigger: 'Copy or beat rhythm matches generic hook → problem → solution funnel.',
        affectedBeatIds: beatIds.length ? beatIds : plan.beats.slice(0, 3).map((b) => b.beatId),
        explanation:
          'Sequence over-relies on predictable marketing rhythm instead of NDXBOOK investigative proof-first architecture.',
        suggestedCorrection: 'Introduce archival proof earlier or delay reframe until contradiction + lens beats land.',
        blocking: false,
      }),
    );
  }

  if (CHEAP_LOOP_PATTERNS.some((re) => re.test(plan.openLoop.newQuestion))) {
    issues.push(
      issueFromFlag('CHEAP_OPEN_LOOP_BAIT', {
        severity: 'BLOCKING',
        trigger: 'Open-loop copy matches engagement-bait patterns.',
        affectedBeatIds: [plan.beats[plan.beats.length - 1]?.beatId ?? 'open_loop'],
        explanation: 'Residual question reads as platform CTA bait, not editorial continuity.',
        suggestedCorrection: 'Rewrite open loop as a genuine cultural question tied to evidence.',
        blocking: true,
      }),
    );
  }

  if (
    plan.selectedGrammarId === 'INVESTIGATION' &&
    plan.transformation.transformationType === 'PRODUCT_TRANSFORMATION'
  ) {
    issues.push(
      issueFromFlag('FORCED_TRANSFORMATION', {
        severity: 'ADVISORY',
        trigger: 'Investigation grammar paired with product transformation type.',
        affectedBeatIds: plan.beats.map((b) => b.beatId),
        explanation: 'Investigation stories should not collapse into product-demo transformation.',
        suggestedCorrection: 'Use CULTURAL_REFRAME or SYSTEM_UNDERSTANDING transformation types.',
        blocking: false,
      }),
    );
  }

  for (const e of plan.evidence ?? []) {
    if (e.status === 'SOURCE_REQUIRED' && e.strength === 'PRIMARY') {
      issues.push(
        issueFromFlag('PROOF_SOURCE_GAP', {
          severity: 'ADVISORY',
          trigger: `Primary evidence ${e.id} lacks verified source.`,
          affectedBeatIds: [e.placement.beatId],
          explanation: e.whatIsObserved,
          suggestedCorrection: 'Attach founder archive, screenshot, or mark as FOUNDER_SUPPLIED when sourced.',
          blocking: false,
        }),
      );
    }
  }

  return issues;
}

export function validateNarrativeMomentumPlan(plan: NarrativeMomentumPlan): readonly NarrativeMomentumValidationFlag[] {
  const fromIssues = validateNarrativeMomentumPlanIssues(plan).map((i) => i.flagId);
  const merged = new Set(fromIssues);
  if (plan.validationIssues?.length) {
    for (const i of plan.validationIssues) merged.add(i.flagId);
  }
  return [...merged];
}

export function narrativeSimilarityValidator(
  plan: NarrativeMomentumPlan,
  prior: readonly NarrativeMomentumPlan[],
): NarrativeValidationIssue | null {
  for (const p of prior) {
    if (p.selectedGrammarId !== plan.selectedGrammarId) continue;
    const sameOpen = p.openLoop.newQuestion.trim().toLowerCase() === plan.openLoop.newQuestion.trim().toLowerCase();
    const sameFirstBeat = p.beats[0]?.label === plan.beats[0]?.label;
    if (sameOpen && sameFirstBeat) {
      return issueFromFlag('NARRATIVE_REPETITION_WARNING', {
        severity: 'ADVISORY',
        trigger: 'Open loop + opening beat match a prior plan for this entry.',
        affectedBeatIds: [plan.beats[0]?.beatId ?? 'beat-1'],
        explanation: 'Narrative may repeat a recently compiled arc without meaningful variation.',
        suggestedCorrection: 'Shift open loop question or alternate grammar before founder review.',
        blocking: false,
      });
    }
  }
  return null;
}

export function requireAudienceShift(plan: NarrativeMomentumPlan): boolean {
  return Boolean(plan.audienceStartingBelief.trim() && plan.audienceDesiredShift.trim() && plan.narrativeGoal.trim());
}
