/**
 * C1.5 — Global creative intelligence runtime (MPMD + Senior Judgment mandatory).
 */

import type { MarketingPackageMasterDirectorOutput } from '../../../shared/site00-expression-engine/campaign-narrative/types.js';
import type {
  SeniorCreativeJudgmentInput,
  SeniorCreativeJudgmentOutput,
} from '../../../shared/site00-expression-engine/senior-creative-judgment/types.js';
import type { CreativeRuntimeMode } from './creativeReasoningProvider.js';
import { runCreativeReasoning, isCreativeReasoningProviderConfigured, checkCreativeReasoningProviderHealth } from './creativeReasoningProvider.js';
import { runSeniorCreativeJudgment, runSeniorCreativeJudgmentFromConcept } from './seniorCreativeJudgmentEngine.js';
import {
  persistSeniorCreativeJudgment,
  persistCreativeCorrection,
  listPersistedJudgments,
  listPersistedCorrections,
  retrieveApplicableCorrectionPrinciples,
  initCreativeIntelligenceStore,
  getCreativeIntelligenceStoreModeSync,
} from './creativeIntelligenceStore.js';
import {
  runMultiUnitBlindCampaignPackage,
  runSeniorJudgmentForAllMpmdUnits,
  type MultiUnitBlindCampaignOutput,
} from './multiUnitCampaignArchitect.js';
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
  await initCreativeIntelligenceStore();
  const mpmd = runMarketingPackageMasterDirector(args);

  const allRuns = await runSeniorJudgmentForAllMpmdUnits(mpmd, async (input, responsibility) =>
    enrichJudgmentWithReasoning(input, responsibility),
  );

  const seniorJudgmentRuns: UnitCreativeJudgmentRecord[] = allRuns.map((r) => ({
    unitId: r.unitId,
    judgment: r.judgment,
    runtimeMode: r.runtimeMode,
    reasoningDepthLimited: r.reasoningDepthLimited,
  }));

  const totalDispatch = seniorJudgmentRuns.reduce(
    (sum, r) => sum + (r.runtimeMode === 'FULL_REASONING' ? 1 : 0),
    0,
  );
  const aggregateMode =
    seniorJudgmentRuns.some((r) => r.runtimeMode === 'FULL_REASONING')
      ? 'FULL_REASONING'
      : seniorJudgmentRuns.some((r) => r.runtimeMode === 'HYBRID')
        ? 'HYBRID'
        : 'DETERMINISTIC_FALLBACK';

  return {
    ...mpmd,
    seniorJudgmentRuns,
    creativeRuntimeMode: aggregateMode,
    reasoningProviderConfigured: isCreativeReasoningProviderConfigured(),
    textReasoningDispatchCount: totalDispatch,
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
export { runMultiUnitBlindCampaignPackage, type MultiUnitBlindCampaignOutput };
export { checkCreativeReasoningProviderHealth, initCreativeIntelligenceStore, getCreativeIntelligenceStoreModeSync };
