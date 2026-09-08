/**
 * C1.5 — Global creative intelligence runtime (MPMD + Senior Judgment mandatory).
 */

import type { MarketingPackageMasterDirectorOutput } from '../../../shared/site00-expression-engine/campaign-narrative/types.js';
import type {
  SeniorCreativeJudgmentInput,
  SeniorCreativeJudgmentOutput,
} from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import type { CreativeRuntimeMode } from './creativeReasoningProvider.js';
import { runCreativeReasoning, isCreativeReasoningProviderConfigured } from './creativeReasoningProvider.js';
import { runSeniorCreativeJudgment, runSeniorCreativeJudgmentFromConcept } from './seniorCreativeJudgmentEngine.js';
import {
  persistSeniorCreativeJudgment,
  persistCreativeCorrection,
  listPersistedJudgments,
  listPersistedCorrections,
  retrieveApplicableCorrectionPrinciples,
} from './creativeIntelligenceStore.js';
import {
  SOLSTICE_AUDIO_LAUNCH_BRIEF,
  buildBlindCampaignResponsibility,
  buildBlindTestInitialConcept,
  type ThinMarketingBrief,
} from './blindTestFixtures.js';
import { runMarketingPackageMasterDirector } from '../marketingPackageMasterDirector/marketingPackageMasterDirector.js';
import { runCinematicContinuityDirector } from '../cinematicContinuity/cinematicContinuityDirector.js';

export type UnitCreativeJudgmentRecord = {
  unitId: string;
  judgment: SeniorCreativeJudgmentOutput;
  runtimeMode: CreativeRuntimeMode;
  reasoningDepthLimited: boolean;
};

export type MarketingPackageCreativeRuntimeOutput = MarketingPackageMasterDirectorOutput & {
  seniorJudgmentRuns: UnitCreativeJudgmentRecord[];
  creativeRuntimeMode: CreativeRuntimeMode;
  reasoningProviderConfigured: boolean;
  textReasoningDispatchCount: number;
};

export type BlindCreativeTestOutput = {
  brief: ThinMarketingBrief;
  campaignResponsibility: ReturnType<typeof buildBlindCampaignResponsibility>;
  initialConcept: SeniorCreativeJudgmentInput;
  judgment: SeniorCreativeJudgmentOutput;
  runtimeMode: CreativeRuntimeMode;
  principlesApplied: string[];
  reasoningDepthLimited: boolean;
  textReasoningDispatchCount: number;
};

async function enrichJudgmentWithReasoning(
  input: SeniorCreativeJudgmentInput,
  campaignResponsibility: string,
): Promise<{ judgment: SeniorCreativeJudgmentOutput; runtimeMode: CreativeRuntimeMode; reasoningDepthLimited: boolean; dispatchCount: number }> {
  const principles = retrieveApplicableCorrectionPrinciples({
    medium: input.formatTarget,
    campaignType: 'launch',
    domains: ['film', 'reel', 'campaign worlds'],
  });

  const reasoning = await runCreativeReasoning({
    input,
    campaignResponsibility,
    retrievedPrinciples: principles.map((p) => p.generalizablePrinciple),
  });

  const base = runSeniorCreativeJudgment(input);

  const judgment: SeniorCreativeJudgmentOutput = {
    ...base,
    qualityTier: reasoning.reasoningDepthLimited ? base.qualityTier : reasoning.qualityTier,
    founderHandholdingRisk: reasoning.founderHandholdingRisk,
    deepReframe: {
      ...base.deepReframe,
      surfaceObservation: reasoning.surfaceObservation,
      firstOrderContradiction: reasoning.firstOrderContradiction,
      secondOrderContradiction: reasoning.secondOrderContradiction,
      humanContradiction: reasoning.humanContradiction,
      mostInterestingLevel: 'secondOrderContradiction',
    },
    firstAnswerChallenge: {
      ...base.firstAnswerChallenge,
      attackVectors: reasoning.attackVectors.length >= 3 ? reasoning.attackVectors : base.firstAnswerChallenge.attackVectors,
    },
    redTeam: {
      ...base.redTeam,
      strongestCriticism: reasoning.redTeamCriticism,
    },
    challenger: {
      ...base.challenger,
      conceptName: reasoning.challengerConceptName,
      oneSentenceIdea: reasoning.challengerIdea,
    },
    seniorDirectorReview: {
      ...base.seniorDirectorReview,
      deeperIdea: reasoning.deeperIdea,
      finalDirection: reasoning.finalDirection,
      qualityTier: reasoning.reasoningDepthLimited ? base.qualityTier : reasoning.qualityTier,
      founderHandholdingRisk: reasoning.founderHandholdingRisk,
    },
    failureClasses: [...new Set([...base.failureClasses, ...reasoning.failureClasses])],
    blocksFounderReview: reasoning.founderHandholdingRisk === 'HIGH' || base.blocksFounderReview,
  };

  await persistSeniorCreativeJudgment({
    judgmentId: judgment.judgmentId,
    projectId: input.projectId,
    campaignId: input.campaignId,
    contentUnitId: input.contentUnitId,
    initialWinner: judgment.seniorDirectorReview.initialWinner,
    finalWinner: judgment.seniorDirectorReview.finalDirection,
    qualityTier: judgment.qualityTier,
    founderHandholdingRisk: judgment.founderHandholdingRisk,
    runtimeMode: reasoning.runtimeMode,
    record: judgment,
  });

  return {
    judgment,
    runtimeMode: reasoning.runtimeMode,
    reasoningDepthLimited: reasoning.reasoningDepthLimited,
    dispatchCount: reasoning.textReasoningDispatchCount,
  };
}

export async function runMarketingPackageMasterDirectorWithCreativeJudgment(args?: {
  brandId?: string;
  campaignId?: string;
}): Promise<MarketingPackageCreativeRuntimeOutput> {
  const mpmd = runMarketingPackageMasterDirector(args);
  const continuity = runCinematicContinuityDirector();
  const winning = continuity.masterFilmDirectorPass.concepts.find(
    (c) => c.conceptName === continuity.masterFilmDirectorPass.winningConceptId,
  )!;

  const entry003Input: SeniorCreativeJudgmentInput = {
    projectId: args?.brandId ?? 'ndxbook',
    campaignId: args?.campaignId ?? 'ndxbook-chapter-01',
    contentUnitId: 'entry-003',
    formatTarget: 'REEL',
    conceptName: winning.conceptName,
    oneSentenceIdea: winning.oneSentenceFilmIdea,
    thesis: continuity.masterFilmDirectorPass.deeperContradiction,
    world: winning.world,
    worldFunction: winning.worldFunction,
    artifact: winning.artifact,
    artifactFunction: winning.artifactFunction,
    interjection: "YOU DIDN'T SKIP STEPS. YOU SKIPPED THE CAMERA.",
    openingImage: winning.openingImage,
    centralReveal: winning.centralReveal,
    turningPoint: winning.turningPoint,
    climaxImage: winning.climaxImage,
    endingImage: winning.endingImage,
    handoffOut: winning.handoffOutToEntry004Candidate,
    entry004Tease: 'Wellness notification — non-canon seed',
    deeperContradiction: continuity.masterFilmDirectorPass.deeperContradiction,
    culturalRead: continuity.entry003Responsibility.whatEntryMustAdd,
  };

  const responsibility = continuity.entry003Responsibility.whatEntryMustAdd;
  const entry003 = await enrichJudgmentWithReasoning(entry003Input, responsibility);

  const seniorJudgmentRuns: UnitCreativeJudgmentRecord[] = [
    {
      unitId: 'entry-003',
      judgment: entry003.judgment,
      runtimeMode: entry003.runtimeMode,
      reasoningDepthLimited: entry003.reasoningDepthLimited,
    },
  ];

  return {
    ...mpmd,
    seniorJudgmentRuns,
    creativeRuntimeMode: entry003.runtimeMode,
    reasoningProviderConfigured: isCreativeReasoningProviderConfigured(),
    textReasoningDispatchCount: entry003.dispatchCount,
  };
}

export async function runBlindCreativeMarketingTest(
  brief: ThinMarketingBrief = SOLSTICE_AUDIO_LAUNCH_BRIEF,
): Promise<BlindCreativeTestOutput> {
  const campaignResponsibility = buildBlindCampaignResponsibility(brief);
  const initialConcept = buildBlindTestInitialConcept(brief);
  const principles = retrieveApplicableCorrectionPrinciples({
    medium: initialConcept.formatTarget,
    campaignType: 'product_launch',
    domains: ['film', 'reel', 'editorial'],
  });

  const enriched = await enrichJudgmentWithReasoning(
    initialConcept,
    JSON.stringify(campaignResponsibility),
  );

  return {
    brief,
    campaignResponsibility,
    initialConcept,
    judgment: enriched.judgment,
    runtimeMode: enriched.runtimeMode,
    principlesApplied: principles.map((p) => p.generalizablePrinciple),
    reasoningDepthLimited: enriched.reasoningDepthLimited,
    textReasoningDispatchCount: enriched.dispatchCount,
  };
}

export async function runEntry003SharedRegression(): Promise<SeniorCreativeJudgmentOutput> {
  const continuity = runCinematicContinuityDirector();
  const winning = continuity.masterFilmDirectorPass.concepts.find(
    (c) => c.conceptName === continuity.masterFilmDirectorPass.winningConceptId,
  )!;
  return runSeniorCreativeJudgmentFromConcept(winning, {
    contentUnitId: 'entry-003',
    interjection: "YOU DIDN'T SKIP STEPS. YOU SKIPPED THE CAMERA.",
    deeperContradiction: continuity.masterFilmDirectorPass.deeperContradiction,
    culturalRead: continuity.entry003Responsibility.whatEntryMustAdd,
    entry004Tease: 'Wellness notification seed — non-canon',
  });
}

export function getCreativeIntelligenceHistory(): {
  judgments: ReturnType<typeof listPersistedJudgments>;
  corrections: ReturnType<typeof listPersistedCorrections>;
} {
  return {
    judgments: listPersistedJudgments(),
    corrections: listPersistedCorrections(),
  };
}

export { persistCreativeCorrection, listPersistedCorrections, listPersistedJudgments };
