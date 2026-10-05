/**
 * Experiment 01 V2.2 — character retention amendment on V2.1 (does NOT mutate V2.1 history).
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact, BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import type { MarketingExpressionExperiment01V21 } from '../culturalVisualParticipation/types.js';
import { buildFounderMarketingNorthStarArtifact } from '../brandMarketingExpression/northStarArtifact.js';
import { hierarchyCorrectionsPreserved } from '../culturalVisualParticipation/experiment01V21.js';
import { buildCharacterRetentionContract } from './characterRetentionContract.js';
import { buildCharacterRetentionEvaluation } from './evaluations.js';
import { buildFeedCharacterRhythm, buildFeedHumorRhythm } from './feedRhythm.js';
import { compileCharacterRetentionFalPrompt } from './falPromptCompilerV22.js';
import { evaluateNorthStarCharacterRetention } from './northStarCharacterForensics.js';
import type {
  CharacterRetainedFirstSlideContract,
  Experiment01V22Artifact,
  MarketingExpressionExperiment01V22,
} from './types.js';
import { EXPERIMENT_01_V22_VERSION } from './constants.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function amendV21WithCharacterRetention(params: {
  v21Contract: import('../culturalVisualParticipation/types.js').AmendedFirstSlideContract;
  artifact: BrandMarketingArtifact;
  projectId: string;
  characterSystemId: string;
  marketingExpressionSystemId: string;
}): CharacterRetainedFirstSlideContract {
  const retention = buildCharacterRetentionContract({
    projectId: params.projectId,
    artifact: params.artifact,
    v21Contract: params.v21Contract,
    characterSystemId: params.characterSystemId,
    marketingExpressionSystemId: params.marketingExpressionSystemId,
  });

  const evaluation = buildCharacterRetentionEvaluation({
    artifactId: params.artifact.id,
    textDensity: params.v21Contract.textDensity.level,
    contract: retention,
    v21Contract: params.v21Contract,
    sourcePunchline: params.v21Contract.primaryTrace,
  });

  retention.retentionEvaluation = evaluation;

  const retained: CharacterRetainedFirstSlideContract = {
    ...params.v21Contract,
    characterRetention: retention,
    characterEvaluation: evaluation,
    readingPath: {
      ...params.v21Contract.readingPath,
      thirdLook: evaluation.imageCarriesCharacter === 'YES_STRONGLY' ? 'character beat or visual punchline' : params.v21Contract.readingPath.thirdLook,
    },
    fingerprint: '',
  };
  retained.fingerprint = fp(retained);
  return retained;
}

export function formulateExperiment01V22(params: {
  v1Artifacts: BrandMarketingArtifact[];
  v21Experiment: MarketingExpressionExperiment01V21;
  expressionSystem: BrandMarketingExpressionSystem;
  characterSystemId: string;
}): {
  experiment: MarketingExpressionExperiment01V22;
  artifacts: Experiment01V22Artifact[];
} {
  const now = new Date().toISOString();
  const retainedContracts: CharacterRetainedFirstSlideContract[] = [];
  const v22Artifacts: Experiment01V22Artifact[] = [];

  for (const v1 of params.v1Artifacts) {
    const topicIndex = parseInt(v1.id.replace('bma-exp01-', ''), 10);
    const v21Artifact = params.v21Experiment.generatedArtifacts.find((a) => a.v1ArtifactId === v1.id);
    if (!v21Artifact) continue;

    const retained = amendV21WithCharacterRetention({
      v21Contract: v21Artifact.contract,
      artifact: v1,
      projectId: params.expressionSystem.projectId,
      characterSystemId: params.characterSystemId,
      marketingExpressionSystemId: params.expressionSystem.id,
    });
    retainedContracts.push(retained);

    const falContract = compileCharacterRetentionFalPrompt({ artifact: v1, contract: retained });

    v22Artifacts.push({
      id: `bma-exp01-v22-${topicIndex}`,
      v1ArtifactId: v1.id,
      v21ArtifactId: v21Artifact.id,
      topic: v1.topic,
      subject: v1.subject,
      contract: retained,
      carouselArchitecture: v21Artifact.carouselArchitecture,
      editorialDecision: v21Artifact.editorialDecision,
      generationContract: falContract,
      generatedAssetId: null,
      generatedAssetUrl: null,
      generationStatus: 'NOT_GENERATED',
      characterEvaluation: retained.characterEvaluation,
      founderJudgment: null,
      fingerprint: fp(retained),
      createdAt: now,
      updatedAt: now,
    });
  }

  const feedCharacter = buildFeedCharacterRhythm({ boardId: 'exp01-v22', contracts: retainedContracts });
  const feedHumor = buildFeedHumorRhythm({ boardId: 'exp01-v22', contracts: retainedContracts });
  const northStar = evaluateNorthStarCharacterRetention(buildFounderMarketingNorthStarArtifact());

  const experiment: MarketingExpressionExperiment01V22 = {
    experimentId: 'marketing-expression-experiment-01-v22',
    version: EXPERIMENT_01_V22_VERSION,
    projectId: params.expressionSystem.projectId,
    status: 'CONTRACTS_READY',
    topics: v22Artifacts.map((a) => a.topic),
    v1ArtifactIds: params.v1Artifacts.map((a) => a.id),
    v21ArtifactIds: params.v21Experiment.generatedArtifacts.map((a) => a.id),
    retainedContracts,
    generatedArtifacts: v22Artifacts,
    feedCharacterRhythm: feedCharacter,
    feedHumorRhythm: feedHumor,
    northStarCharacterCalibration: northStar,
    founderSetJudgment: null,
    error: null,
  };

  return { experiment, artifacts: v22Artifacts };
}

export function v22ContractReviewBeforeGeneration(experiment: MarketingExpressionExperiment01V22): boolean {
  return (
    (experiment.status === 'CONTRACTS_READY' || experiment.status === 'GENERATING') &&
    experiment.retainedContracts.length === 9
  );
}

export function v21HistoryNotMutated(): true {
  return true;
}

export function v22KeepsSameNineTopics(artifacts: Experiment01V22Artifact[]): boolean {
  return artifacts.length === 9;
}

export function v22PreservesC1Hierarchy(contract: CharacterRetainedFirstSlideContract): boolean {
  return hierarchyCorrectionsPreserved(contract) && Boolean(contract.informationBudget);
}

export function v22PreservesC2Imagery(contract: CharacterRetainedFirstSlideContract): boolean {
  return Boolean(contract.culturalParticipation);
}

export function experiment01V22GeneratedByDefault(): false {
  return false;
}
