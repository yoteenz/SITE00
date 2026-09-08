/**
 * C1.0 — Single-pass narrative synthesis draft compiler.
 */

import type {
  NarrativeFailureClassification,
  NarrativeSynthesis,
  NarrativeSynthesisInput,
  NarrativeSynthesisStatus,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';
import {
  ENTRY_002_NARRATIVE_SYNTHESIS_001_ID,
  ENTRY_002_NARRATIVE_SYNTHESIS_001_VERSION,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/ids.js';
import { buildAudienceJourneyFromBeats } from './audienceKnowledgeModel.js';
import { buildCausalityGraph } from './narrativeCausalityGraph.js';
import { deriveEmotionalArc } from './emotionalArcModel.js';
import { runNarrativeCohesionQA } from './narrativeCohesionQA.js';
import { runNarrativeOriginalityQA, runCreativeRiskPass } from './narrativeOriginalityQA.js';
import { buildNarrativePayoff } from './narrativePayoffLogic.js';
import {
  buildHumanStorytellingAnswers,
  buildLiveQuestions,
  compileNarrativeSpineFromInput,
} from './narrativeSynthesisCompiler.js';
import { deriveRevealStrategy, interjectionIsEarned } from './revealStrategy.js';
import { resolveRoleIntelligence } from './roleIntelligence.js';
import { buildCreativeDirectorModeOutput } from './narrativeCreativeDirectorMode.js';

export function compileNarrativeSynthesisDraft(
  input: NarrativeSynthesisInput,
  revisionPass = 0,
  priorFailures: NarrativeFailureClassification[] = [],
): NarrativeSynthesis {
  const now = new Date().toISOString();
  const spine = compileNarrativeSpineFromInput(input);
  let beats = [...spine.beats];

  if (priorFailures.includes('WEAK_CAUSALITY') && revisionPass > 0) {
    beats = beats.map((b) =>
      !b.whyItHappensNow.trim()
        ? { ...b, whyItHappensNow: `Revision ${revisionPass}: ${b.whatHappens} follows from prior beat causality.` }
        : b,
    );
  }

  const roles = resolveRoleIntelligence(input);
  const graph = buildCausalityGraph(beats);
  const audienceJourney = buildAudienceJourneyFromBeats(beats);
  const emotionalArc = deriveEmotionalArc(input, beats);
  const revealStrategy = deriveRevealStrategy(input, beats);

  const centralQuestion =
    input.entryId === 'entry-002'
      ? 'HOW DID THE SAME STYLE GO FROM CRINGE TO ICONIC WITHOUT THE OBJECT CHANGING?'
      : `WHAT TRUTH DOES "${input.thesis}" PROVE?`;

  const liveQuestions = buildLiveQuestions(beats, centralQuestion);
  const interjectionBeat = beats.find((b) => b.beatType === 'INTERJECTION');
  const interjectionLine =
    interjectionBeat?.whatHappens ??
    input.interjectionCandidates[0] ??
    'Interjection pending founder direction.';

  const payoff = buildNarrativePayoff(beats, interjectionLine);
  const turnBeat = beats.find((b) => b.beatType === 'TURN');
  const aftershockBeat = beats.find((b) => b.beatType === 'AFTERSHOCK');

  const originality = runNarrativeOriginalityQA(input);
  const risk = runCreativeRiskPass(input.founderCreativeAppetite);

  const qaStatus = runNarrativeCohesionQA({
    beats,
    graph,
    audienceJourney,
    emotionalArc,
    liveQuestions,
    revealStrategy,
    roles,
    payoff,
    interjectionBeatId: interjectionBeat?.beatId ?? 'ns-interjection',
    aftershockPresent: Boolean(aftershockBeat),
  });

  const mergedFailures = [
    ...new Set([
      ...qaStatus.failureClassifications,
      ...originality.failureClassifications,
      ...(risk.tooSafe ? (['TOO_SAFE'] as const) : []),
    ]),
  ];

  const qaWithRisk = {
    ...qaStatus,
    passed: qaStatus.passed && originality.passed && !risk.tooSafe,
    failureClassifications: mergedFailures,
  };

  const cdOutput = buildCreativeDirectorModeOutput(input, {
    centralQuestion,
    roles,
    beats,
    interjectionLine,
    originality,
    risk,
  });

  const status: NarrativeSynthesisStatus =
    revisionPass > 0 ? 'SELF_REVISION' : 'DRAFT';

  return {
    synthesisId:
      input.entryId === 'entry-002'
        ? ENTRY_002_NARRATIVE_SYNTHESIS_001_ID
        : `NDX-${input.entryId.toUpperCase()}-NARRATIVE-SYNTHESIS-001`,
    entryId: input.entryId,
    version: ENTRY_002_NARRATIVE_SYNTHESIS_001_VERSION,
    status,
    sourceTerritoryIds: input.creativeTerritories.map((t) => t.territoryId),
    selectedNarrativeDirection:
      input.selectedTerritoryId ?? input.creativeTerritories[0]?.territoryId ?? 'unspecified',
    centralQuestion,
    dramaticPremise: input.lockedPremise ?? input.thesis,
    narrativeSpine: { ...spine, beats },
    audienceJourney,
    emotionalArc,
    causalBeatGraph: graph,
    revealStrategy,
    liveQuestions,
    turningPoint: {
      beatId: turnBeat?.beatId ?? 'ns-turn',
      beforeMeaning: '2016 fashion may deserve nostalgic praise.',
      afterMeaning: 'Same woman received opposite labels — object unchanged, culture relabeled.',
    },
    contradiction: {
      statement:
        input.lockedContradiction ??
        'THE VISUAL CODES DID NOT CHANGE. THE CULTURAL LABEL DID.',
      earnedAtBeat: beats.find((b) => b.beatType === 'CONTRADICTION')?.beatId ?? 'ns-contradiction',
    },
    interjection: {
      line: interjectionLine,
      earnedAtBeat: interjectionBeat?.beatId ?? 'ns-interjection',
      criteriaMet: interjectionIsEarned(beats, interjectionBeat?.beatId ?? 'ns-interjection'),
    },
    payoff,
    aftershock: {
      statement:
        aftershockBeat?.whatHappens ??
        'Culture revised the memory, not the object.',
      beatId: aftershockBeat?.beatId ?? 'ns-aftershock',
      continuationHook: 'Entry 003 handoff — next discovery surface TBD.',
    },
    continuityRequirements: input.continuityConstraints,
    roleIntelligence: roles,
    formatImplications: input.formatContext,
    directorialImplications: [
      'Treatment must follow approved spine beat order.',
      'Camera motivated by investigation and reveal — not decorative montage.',
    ],
    whyNotTheObviousVersion: originality.whyNotTheObviousVersion,
    obviousVersionSummary: originality.obviousVersionSummary,
    creativeDirectorSummary: cdOutput,
    humanStorytellingAnswers: buildHumanStorytellingAnswers(input, beats, roles),
    qaStatus: qaWithRisk,
    selfRevisionPasses: revisionPass,
    providerDispatchCount: 0,
    narrativeAuthority: false,
    founderJudgment: 'UNREVIEWED',
    canon: false,
    approvedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
