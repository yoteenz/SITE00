import type {
  CarouselNarrativeAdaptation,
  NarrativeFormatAdaptation,
  NarrativeMomentumPlan,
  ReelNarrativeAdaptation,
  ReelStoryArchitecture,
} from './types.js';

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

function buildReelDetail(plan: NarrativeMomentumPlan): ReelNarrativeAdaptation {
  const beatSequence = plan.beats.map((b, i) => ({
    sourceNarrativeBeatId: b.beatId,
    screenAction: b.whatChangesInThisBeat,
    viewerKnowledgeState: b.whatAudienceKnows,
    visualPurpose: b.shotFunction,
    narrativePurpose: b.beatRole || b.label,
    proofUsed: b.evidenceUsed.length ? b.evidenceUsed : b.proofIds,
    transitionFunction: b.whyNextBeatIsNecessary || `Advance to beat ${i + 2}`,
    estimatedDurationRange: i === 0 ? '3–5s' : i === plan.beats.length - 1 ? '4–6s' : '5–8s',
  }));

  const find = (part: string) => plan.beats.find((b) => b.label.toUpperCase().includes(part));

  return {
    openingMoment: find('FAMILIAR')?.whatChangesInThisBeat ?? plan.beats[0]?.whatChangesInThisBeat ?? '—',
    beatSequence,
    glitchMoment: find('GLITCH')?.whatChangesInThisBeat ?? '—',
    firstProofMoment: find('RECEIPT')?.whatChangesInThisBeat ?? '—',
    evidenceEscalation: find('CONTRADICTION')?.whatChangesInThisBeat ?? '—',
    contradictionTurn: find('CONTRADICTION')?.whatChangesInThisBeat ?? '—',
    revealMoment: find('LENS')?.whatChangesInThisBeat ?? '—',
    reframeMoment: find('RECONTEXT')?.whatChangesInThisBeat ?? plan.reframe.after,
    releaseMoment: find('RECONTEXT')?.whatChangesInThisBeat ?? '—',
    endingImage: plan.openLoop.newQuestion,
    openLoop: plan.openLoop.audienceWantsNext,
    pacingNotes: 'Hold familiar beat before glitch; proof before peak; no CTA close.',
    soundNotes: 'Archive texture on receipt; silence or cut on contradiction.',
    visualContinuityRequirements: 'Approved Entry 002 cover + edit-suite metaphor preserved.',
  };
}

function buildCarouselDetail(plan: NarrativeMomentumPlan): CarouselNarrativeAdaptation {
  const slides = plan.beats.map((b, idx) => ({
    slideNumber: idx + 1,
    sourceBeatIds: [b.beatId],
    purpose: b.beatRole || b.label,
    contentRole: b.whatChangesInThisBeat,
    proofIds: b.evidenceUsed.length ? b.evidenceUsed : b.proofIds,
    tensionStage: b.tensionStage,
    transition: b.whyNextBeatIsNecessary || 'Swipe — argument advances',
  }));

  const reframeIdx = plan.beats.findIndex((b) => b.label.toUpperCase().includes('RECONTEXT') || b.label.includes('LENS'));

  return {
    slideSequence: slides,
    slidePurpose: 'Same master narrative as reel — slide pacing instead of timecode.',
    proofPlacement: plan.proofArchitecture.placementPlan.strategy,
    argumentEscalation: 'Accumulate receipts slides 2–4; contradiction slide 5; lens slide 6.',
    reframeSlide: reframeIdx >= 0 ? reframeIdx + 1 : slides.length,
    finalOpenLoop: plan.openLoop.newQuestion,
  };
}

export function adaptNarrativeToReel(plan: NarrativeMomentumPlan): NarrativeFormatAdaptation {
  const reelArchitecture = reelArchitectureFromPlan(plan);
  const reelDetail = buildReelDetail(plan);
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
    reelDetail,
  };
}

export function adaptNarrativeToCarousel(plan: NarrativeMomentumPlan): NarrativeFormatAdaptation {
  const carouselDetail = buildCarouselDetail(plan);
  return {
    format: 'CAROUSEL',
    beatsUsed: plan.beats.map((b) => b.beatId),
    beatsMerged: [],
    openingStrategy: 'Slide 1 = starting belief; slides follow beat map 1:1.',
    proofPlacement: plan.proofArchitecture.placementPlan.strategy,
    midpointShift: plan.reframe.before,
    closingStrategy: 'Final slide = open loop question.',
    openLoopTreatment: plan.openLoop.newQuestion,
    durationOrSlideCount: `${plan.beats.length} slides`,
    carouselDetail,
  };
}

export function buildFormatAdaptations(plan: NarrativeMomentumPlan): readonly NarrativeFormatAdaptation[] {
  return [adaptNarrativeToReel(plan), adaptNarrativeToCarousel(plan)];
}
