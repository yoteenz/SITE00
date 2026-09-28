import type { NarrativeFormatAdaptation, NarrativeMomentumPlan, ReelStoryArchitecture } from './types.js';

function reelArchitectureFromPlan(plan: NarrativeMomentumPlan): ReelStoryArchitecture {
  const beat = (labelPart: string) =>
    plan.beats.find((b) => b.label.toUpperCase().includes(labelPart))?.whatChangesInThisBeat ?? '—';

  return {
    openingMoment: beat('FAMILIAR') || beat('CLAIM') || plan.beats[0]?.whatAudienceKnows || '—',
    firstQuestion: plan.beats[0]?.whatAudienceWantsToKnow ?? '—',
    firstProof: beat('RECEIPT') || beat('PROOF') || '—',
    escalation: beat('CONTRADICTION') || beat('ESCAL') || '—',
    midpointTurn: beat('LENS') || beat('GLITCH') || '—',
    reveal: beat('RECONTEXT') || beat('SYNTH') || beat('REVEL') || '—',
    reframe: plan.reframe.after,
    endingImageOrLine: plan.openLoop.newQuestion,
    openLoop: plan.openLoop.audienceWantsNext,
  };
}

export function adaptNarrativeToReel(plan: NarrativeMomentumPlan): NarrativeFormatAdaptation {
  const reelArchitecture = reelArchitectureFromPlan(plan);
  return {
    format: 'REEL',
    beatsUsed: plan.beats.map((b) => b.beatId),
    beatsMerged: [],
    openingStrategy: 'Hold familiar belief one beat before glitch/receipt.',
    proofPlacement: plan.proofArchitecture.placementPlan.strategy,
    midpointShift: reelArchitecture.midpointTurn,
    closingStrategy: 'End on unresolved cultural question — not CTA.',
    openLoopTreatment: plan.openLoop.newQuestion,
    durationOrSlideCount: '45–60s cinematic reel',
    reelArchitecture,
  };
}

export function buildFormatAdaptations(plan: NarrativeMomentumPlan): readonly NarrativeFormatAdaptation[] {
  const reel = adaptNarrativeToReel(plan);
  return [
    reel,
    {
      format: 'CAROUSEL',
      beatsUsed: plan.beats.map((b) => b.beatId),
      beatsMerged: ['receipt', 'contradiction'],
      openingStrategy: 'Slide 1 = starting belief; slides 2–4 = proof accumulation.',
      proofPlacement: 'ACCUMULATE',
      midpointShift: plan.reframe.before,
      closingStrategy: 'Final slide = open loop question.',
      openLoopTreatment: plan.openLoop.newQuestion,
      durationOrSlideCount: '6–8 slides',
    },
  ];
}
