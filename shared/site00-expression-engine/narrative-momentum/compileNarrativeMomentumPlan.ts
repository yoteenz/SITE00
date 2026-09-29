/**
 * Compile NarrativeMomentumPlan from territory + entry intelligence (no provider spend).
 */

import { assembleProofArchitecture } from './proofPlacement.js';
import { buildFormatAdaptations } from './formatAdaptation.js';
import { getNarrativeGrammar } from './grammarLibrary.js';
import { selectNarrativeGrammar } from './selectNarrativeGrammar.js';
import {
  assertNoInterpretationClassifiedAsEvidence,
  buildEntry002Evidence,
  evidenceToLegacyProofObjects,
} from './evidenceArchitecture.js';
import { tensionStageForBeatIndex, validateNarrativeTensionSequence } from './tensionSequenceValidator.js';
import {
  narrativeSimilarityValidator,
  requireAudienceShift,
  validateNarrativeMomentumPlan,
  validateNarrativeMomentumPlanIssues,
} from './validators.js';
import type {
  CompileNarrativeMomentumInput,
  CulturalGlitchMechanic,
  NarrativeBeat,
  NarrativeMomentumPlan,
  NarrativeTensionCurve,
  OpenLoopArchitecture,
  TensionCurveStage,
} from './types.js';

const TENSION_SEQUENCE: TensionCurveStage[] = [
  'LOW',
  'RISING',
  'INTERRUPTION',
  'ESCALATION',
  'PEAK',
  'RELEASE',
  'RESIDUAL',
];

function buildCulturalGlitch(input: CompileNarrativeMomentumInput): CulturalGlitchMechanic | null {
  if (!input.chapterMapping) return null;
  const m = input.chapterMapping;
  return {
    familiarReality: m.claim,
    glitchMoment: 'Present-tense praise collides with archived mockery of the same visual codes.',
    temporalDislocation: '2016 labeled in real time vs remembered as iconic era.',
    receiptSource: m.receipt,
    contradiction: m.contradiction,
    culturalLens: m.lens,
    recontextualization: m.synthesis,
    residualQuestion: 'What else did we ridicule before deciding it was an era?',
  };
}

function resolveEvidence(input: CompileNarrativeMomentumInput) {
  if (input.chapterMapping) {
    return buildEntry002Evidence(input);
  }
  return {
    evidence: input.availableProof.map((p) => ({
      id: p.proofId,
      proofType: p.proofType,
      sourceType: 'SCREENSHOT' as const,
      sourceReference: p.source,
      whatIsObserved: p.whatItProves,
      whatItSupports: p.whatItProves,
      strength: p.strength,
      placement: {
        beatId: p.bestPlacement,
        whyNow: p.whenAudienceNeedsIt,
        beliefBefore: '',
        beliefAfter: '',
      },
      status: 'SOURCE_AVAILABLE' as const,
    })),
    interpretations: [] as import('./types.js').NarrativeInterpretation[],
  };
}

function beatCopyForTemplate(
  templateLabel: string,
  input: CompileNarrativeMomentumInput,
): { knows: string; notKnows: string; wants: string; changes: string } {
  const m = input.chapterMapping;
  const upper = templateLabel.toUpperCase();
  if (!m) {
    return {
      knows: 'Entry premise established',
      notKnows: 'Mechanism of shift',
      wants: 'Why the story matters',
      changes: `Beat: ${templateLabel}`,
    };
  }
  if (upper.includes('FAMILIAR') || upper.includes('CLAIM')) {
    return {
      knows: m.claim,
      notKnows: 'That labels flipped without object change',
      wants: 'Whether nostalgia is honest',
      changes: 'Present belief stated',
    };
  }
  if (upper.includes('GLITCH') || upper.includes('DISRUPT')) {
    return {
      knows: m.claim,
      notKnows: 'Archived tone from same era',
      wants: 'Receipt of past ridicule',
      changes: 'Temporal rupture — past voice enters',
    };
  }
  if (upper.includes('RECEIPT')) {
    return {
      knows: 'Past descriptions were harsh',
      notKnows: 'How complete the reversal is',
      wants: 'Side-by-side proof',
      changes: 'Evidence on record',
    };
  }
  if (upper.includes('CONTRADICTION')) {
    return {
      knows: m.receipt,
      notKnows: 'Mechanism of relabeling',
      wants: 'Editorial cut',
      changes: m.contradiction,
    };
  }
  if (upper.includes('LENS')) {
    return {
      knows: m.contradiction,
      notKnows: 'Named mechanism',
      wants: 'NDX editorial frame',
      changes: m.lens,
    };
  }
  if (upper.includes('RECONTEXT') || upper.includes('SYNTH')) {
    return {
      knows: 'Labels changed',
      notKnows: 'What to do with the insight',
      wants: 'Quotable synthesis',
      changes: m.synthesis,
    };
  }
  if (upper.includes('INTERJECTION')) {
    return {
      knows: 'Argument assembled',
      notKnows: '—',
      wants: 'Memorable line',
      changes: m.interjection,
    };
  }
  if (upper.includes('OPEN') || upper.includes('RESIDUAL') || upper.includes('UNRESOLVED')) {
    return {
      knows: m.synthesis,
      notKnows: 'Adjacent cases in culture',
      wants: 'Next cultural question',
      changes: 'Residual curiosity — not clickbait',
    };
  }
  return {
    knows: m.claim,
    notKnows: m.contradiction,
    wants: 'Next beat payoff',
    changes: templateLabel,
  };
}

function buildBeats(
  input: CompileNarrativeMomentumInput,
  grammarId: import('./types.js').NarrativeGrammarId,
  evidenceIds: readonly string[],
): NarrativeBeat[] {
  const grammar = getNarrativeGrammar(grammarId);
  const total = grammar.beatSequence.length;
  return grammar.beatSequence.map((tpl, index) => {
    const motion = beatCopyForTemplate(tpl.label, input);
    const tensionStage = tensionStageForBeatIndex(grammarId, index, total);
    const prevStage = index > 0 ? tensionStageForBeatIndex(grammarId, index - 1, total) : tensionStage;
    const labelUpper = tpl.label.toUpperCase();
    const linkedEvidence =
      labelUpper.includes('RECEIPT') || labelUpper.includes('PROOF') ?
        evidenceIds.filter((id) => id.includes('archival'))
      : labelUpper.includes('CONTRADICTION') ?
        evidenceIds.filter((id) => id.includes('temporal') || id.includes('comparative'))
      : labelUpper.includes('RECONTEXT') ?
        evidenceIds.filter((id) => id.includes('metaphor'))
      : [];
    const linkedInterpretations =
      labelUpper.includes('LENS') ? ['interp-ndx-lens']
      : labelUpper.includes('RECONTEXT') ? ['interp-memory-edit']
      : labelUpper.includes('OPEN') ? []
      : [];
    const nextTpl = grammar.beatSequence[index + 1];
    return {
      beatId: `${grammarId.toLowerCase()}-${tpl.beatId}`,
      order: index + 1,
      label: tpl.label,
      beatRole: tpl.purpose,
      grammarBeatId: tpl.beatId,
      shotFunction: tpl.defaultShotFunction,
      tensionStage,
      tensionBefore: prevStage,
      tensionAfter: tensionStage,
      whatAudienceKnows: motion.knows,
      whatAudienceDoesNotKnow: motion.notKnows,
      whatAudienceWantsToKnow: motion.wants,
      whatChangesInThisBeat: motion.changes,
      proofIds: linkedEvidence,
      evidenceUsed: linkedEvidence,
      interpretationIntroduced: linkedInterpretations,
      whyNextBeatIsNecessary: nextTpl ?
        `Sets up ${nextTpl.label} — ${nextTpl.purpose}`
      : 'Carry residual question forward',
    };
  });
}

function buildTensionArc(beats: readonly NarrativeBeat[]): NarrativeTensionCurve {
  const stages = TENSION_SEQUENCE.map((stage) => ({
    stage,
    beatIds: beats.filter((b) => b.tensionStage === stage).map((b) => b.beatId),
    note: `${stage} tension mapped to narrative beats`,
  })).filter((s) => s.beatIds.length > 0);
  return { stages };
}

function buildOpenLoop(input: CompileNarrativeMomentumInput): OpenLoopArchitecture {
  const glitch = buildCulturalGlitch(input);
  const newQuestion =
    glitch?.residualQuestion ??
    'What adjacent cultural memory is being re-edited right now?';
  return {
    answered: [
      input.chapterMapping?.contradiction ?? 'Present vs past label mismatch',
      input.chapterMapping?.synthesis ?? 'Memory edit mechanism',
    ],
    unresolved: ['Scope of other ridiculed eras', 'Who benefits from nostalgia packaging'],
    newQuestion,
    audienceWantsNext: 'Another case where mockery became mythology',
    continuation: {
      destination: 'NEXT_ENTRY',
      targetEntryId: null,
      targetLabel: 'Future NDXBOOK entry — cultural revision series',
      rationale: 'Open loop invites parallel case studies without forced sequel bait',
    },
  };
}

export function compileNarrativeMomentumPlan(input: CompileNarrativeMomentumInput): NarrativeMomentumPlan {
  const { evidence, interpretations } = resolveEvidence(input);
  assertNoInterpretationClassifiedAsEvidence(evidence);
  const proofs = evidence.length ? evidenceToLegacyProofObjects(evidence) : [...input.availableProof];
  const selection = selectNarrativeGrammar({
    brandId: input.brandId,
    topic: input.topic,
    creativeTerritoryLabel: input.creativeTerritoryLabel,
    contentObjective: input.contentObjective,
    audienceStartingBelief: input.audienceStartingBelief,
    desiredShift: input.audienceDesiredShift,
    availableProofTypes: proofs.map((p) => p.proofType),
    format: 'REEL',
    chapterArgumentLabels: input.chapterMapping ?
      ['CLAIM', 'RECEIPT', 'CONTRADICTION', 'LENS', 'INTERJECTION', 'SYNTHESIS']
    : undefined,
  });

  const beats = buildBeats(input, selection.selectedGrammar, evidence.map((e) => e.id));
  const proofArchitecture = assembleProofArchitecture({
    grammarId: selection.selectedGrammar,
    beats,
    proofs,
  });

  const narrativeGoal =
    input.contentObjective ||
    'Shift how the audience understands cultural memory vs object permanence.';

  const now = new Date().toISOString();
  const plan: NarrativeMomentumPlan = {
    id: `nme-${input.entryId}-${Date.now()}`,
    projectId: input.projectId,
    entryId: input.entryId,
    topic: input.topic,
    creativeTerritoryId: input.creativeTerritoryId,
    creativeTerritoryLabel: input.creativeTerritoryLabel,
    narrativeGoal,
    audienceStartingBelief: input.audienceStartingBelief,
    audienceDesiredShift: input.audienceDesiredShift,
    selectedGrammarId: selection.selectedGrammar,
    grammarReason: selection.selectionReason,
    alternateGrammarId: selection.alternateGrammar,
    grammarDeviationReason: null,
    beats,
    tensionArc: buildTensionArc(beats),
    proofArchitecture,
    evidence,
    interpretations,
    tensionModel: 'CANONICAL',
    culturalGlitch: selection.selectedGrammar === 'CULTURAL_GLITCH' ? buildCulturalGlitch(input) : null,
    reframe: {
      transformationType: 'CULTURAL_REFRAME',
      before: input.audienceStartingBelief,
      after: input.audienceDesiredShift,
    },
    transformation: {
      transformationType: 'CULTURAL_REFRAME',
      before: input.audienceStartingBelief,
      after: input.audienceDesiredShift,
    },
    openLoop: buildOpenLoop(input),
    nextNarrativeOpportunity: buildOpenLoop(input).continuation.targetLabel,
    formatAdaptationNotes: 'Master narrative adapts to reel/carousel/story without reinventing spine.',
    formatAdaptations: [],
    founderStatus: 'GENERATED',
    layerMode: input.layerMode ?? 'STANDARD',
    version: '1.1.0',
    providerDispatchCount: 0,
    validationFlags: [],
    validationIssues: [],
    campaignHandoff: {
      narrativeGoal,
      selectedGrammarId: selection.selectedGrammar,
      openLoopSummary: buildOpenLoop(input).newQuestion,
      continuationTarget: buildOpenLoop(input).continuation.targetLabel,
      proofArchitectureSummary: `${proofs.filter((p) => p.strength === 'PRIMARY').length} primary proofs`,
      audienceShift: input.audienceDesiredShift,
    },
    createdAt: now,
    updatedAt: now,
  };

  plan.formatAdaptations = buildFormatAdaptations(plan);
  const issues = [
    ...validateNarrativeMomentumPlanIssues(plan),
    ...validateNarrativeTensionSequence({ beats: plan.beats, tensionModel: plan.tensionModel }),
  ];
  const repetition = narrativeSimilarityValidator(plan, input.priorPlans ?? []);
  if (repetition) issues.push(repetition);
  plan.validationIssues = issues;
  plan.validationFlags = validateNarrativeMomentumPlan(plan);

  if (!requireAudienceShift(plan)) {
    throw new Error('NARRATIVE_MOMENTUM_REQUIRES_AUDIENCE_SHIFT');
  }

  return plan;
}

/** Storyboard / treatment handoff contract */
export function narrativeMomentumStoryboardHandoff(plan: NarrativeMomentumPlan): {
  narrativeMomentumPlanId: string;
  beats: NarrativeMomentumPlan['beats'];
  beatHandoff: import('./types.js').StoryboardBeatHandoff[];
  audienceShift: string;
  reelArchitecture: import('./types.js').ReelStoryArchitecture | null;
  reelDetail: import('./types.js').ReelNarrativeAdaptation | null;
} {
  const reel = plan.formatAdaptations.find((f) => f.format === 'REEL');
  const beatHandoff = plan.beats.map((b) => ({
    beatId: b.beatId,
    order: b.order,
    label: b.label,
    whatViewerSees: b.whatChangesInThisBeat,
    whatViewerKnows: b.whatAudienceKnows,
    whatChanges: b.whatChangesInThisBeat,
    whyNextShotExists: b.whyNextBeatIsNecessary,
    tensionStage: b.tensionStage,
    evidenceIds: b.evidenceUsed,
  }));
  return {
    narrativeMomentumPlanId: plan.id,
    beats: plan.beats,
    beatHandoff,
    audienceShift: plan.audienceDesiredShift,
    reelArchitecture: reel?.reelArchitecture ?? null,
    reelDetail: reel?.reelDetail ?? null,
  };
}
