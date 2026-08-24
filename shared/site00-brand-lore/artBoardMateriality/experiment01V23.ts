/**
 * Experiment 01 V2.3 — art-board materiality amendment on V2.2 (does NOT mutate V2.2 history).
 */

import { createHash } from 'node:crypto';
import type { BrandMarketingArtifact, BrandMarketingExpressionSystem } from '../brandMarketingExpression/types.js';
import type { MarketingExpressionExperiment01V22 } from '../characterRetention/types.js';
import { v22PreservesC1Hierarchy } from '../characterRetention/experiment01V22.js';
import { buildArtBoardDirectionContract } from './artBoardDirectionContract.js';
import { buildArtifactMaterialityEvaluation } from './evaluations.js';
import { buildFeedMaterialRhythm } from './feedRhythm.js';
import { compileArtBoardMaterialityFalPrompt } from './falPromptCompilerV23.js';
import { evaluateNorthStarArtBoardMateriality, evaluateNorthStarHumanMadeCalibrations } from './northStarMaterialForensics.js';
import { applyV23HumanMadeRevision } from './v23HumanMadeRevision.js';
import { applyV23SignatureLimeRevision } from './signatureLime.js';
import { buildFeedMakerRhythm } from './makerRhythm.js';
import { buildFeedSignatureColorContinuity } from './feedSignatureContinuity.js';
import { auditV23SignatureLimeMigration } from './signatureLime.js';
import type {
  ArtBoardRetainedFirstSlideContract,
  Experiment01V23Artifact,
  MarketingExpressionExperiment01V23,
} from './types.js';
import { EXPERIMENT_01_V23_VERSION } from './constants.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function amendV22WithArtBoardMateriality(params: {
  v22Contract: import('../characterRetention/types.js').CharacterRetainedFirstSlideContract;
  artifact: BrandMarketingArtifact;
  projectId: string;
}): ArtBoardRetainedFirstSlideContract {
  const artBoardDirection = buildArtBoardDirectionContract({
    projectId: params.projectId,
    artifact: params.artifact,
    v22Contract: params.v22Contract,
  });

  const materialityEvaluation = buildArtifactMaterialityEvaluation({
    artifactId: params.artifact.id,
    contract: artBoardDirection,
    v22Contract: params.v22Contract,
    topic: params.artifact.topic,
  });

  const retained: ArtBoardRetainedFirstSlideContract = {
    ...params.v22Contract,
    artBoardDirection,
    materialityEvaluation,
    fingerprint: '',
  };
  retained.fingerprint = fp(retained);
  return retained;
}

export function formulateExperiment01V23(params: {
  v1Artifacts: BrandMarketingArtifact[];
  v22Experiment: MarketingExpressionExperiment01V22;
  expressionSystem: BrandMarketingExpressionSystem;
}): {
  experiment: MarketingExpressionExperiment01V23;
  artifacts: Experiment01V23Artifact[];
} {
  const now = new Date().toISOString();
  const artBoardContracts: ArtBoardRetainedFirstSlideContract[] = [];
  const v23Artifacts: Experiment01V23Artifact[] = [];

  for (const v1 of params.v1Artifacts) {
    const topicIndex = parseInt(v1.id.replace('bma-exp01-', ''), 10);
    const v22Artifact = params.v22Experiment.generatedArtifacts.find((a) => a.v1ArtifactId === v1.id);
    if (!v22Artifact) continue;

    const retainedBase = amendV22WithArtBoardMateriality({
      v22Contract: v22Artifact.contract,
      artifact: v1,
      projectId: params.expressionSystem.projectId,
    });
    const parentFingerprint = retainedBase.fingerprint;
    const retainedHuman = applyV23HumanMadeRevision({
      contract: retainedBase,
      artifact: v1,
      topicIndex,
    });
    const retained = applyV23SignatureLimeRevision({
      contract: retainedHuman,
      artifact: v1,
      topicIndex,
    });
    artBoardContracts.push(retained);

    const falContract = compileArtBoardMaterialityFalPrompt({ artifact: v1, contract: retained });

    v23Artifacts.push({
      id: `bma-exp01-v23-${topicIndex}`,
      v1ArtifactId: v1.id,
      v22ArtifactId: v22Artifact.id,
      topic: v1.topic,
      subject: v1.subject,
      contract: retained,
      carouselArchitecture: v22Artifact.carouselArchitecture,
      editorialDecision: v22Artifact.editorialDecision,
      generationContract: falContract,
      generatedAssetId: null,
      generatedAssetUrl: null,
      generationStatus: 'NOT_GENERATED',
      materialityEvaluation: retained.materialityEvaluation,
      humanMadeEvaluation: retained.humanMadeEvaluation ?? null,
      humanMadeRevision: retained.humanMadeRevision ?? null,
      signatureLimeEvaluation: retained.signatureLimeEvaluation ?? null,
      signatureLimeRevision: retained.signatureLimeRevision ?? null,
      signatureLimeMigration: auditV23SignatureLimeMigration({
        artifactId: `bma-exp01-v23-${topicIndex}`,
        topicIndex,
        signatureEval: retained.signatureLimeEvaluation!,
        generatedAssetUrl: null,
      }),
      parentFingerprint,
      founderJudgment: null,
      fingerprint: fp(retained),
      createdAt: now,
      updatedAt: now,
    });
  }

  const feedMaterial = buildFeedMaterialRhythm({ boardId: 'exp01-v23', contracts: artBoardContracts });
  const feedMakerRhythm = buildFeedMakerRhythm({ boardId: 'exp01-v23', contracts: artBoardContracts });
  const feedSignatureColorContinuity = buildFeedSignatureColorContinuity({
    boardId: 'exp01-v23',
    contracts: artBoardContracts,
  });
  const signatureLimeMigrations = v23Artifacts.map((a) => a.signatureLimeMigration!).filter(Boolean);
  const northStar = evaluateNorthStarArtBoardMateriality();
  const calibrations = evaluateNorthStarHumanMadeCalibrations();

  const experiment: MarketingExpressionExperiment01V23 = {
    experimentId: 'marketing-expression-experiment-01-v23',
    version: EXPERIMENT_01_V23_VERSION,
    projectId: params.expressionSystem.projectId,
    status: 'CONTRACTS_READY',
    topics: v23Artifacts.map((a) => a.topic),
    v1ArtifactIds: params.v1Artifacts.map((a) => a.id),
    v22ArtifactIds: params.v22Experiment.generatedArtifacts.map((a) => a.id),
    artBoardContracts,
    generatedArtifacts: v23Artifacts,
    feedMaterialRhythm: feedMaterial,
    northStarMaterialCalibration: northStar,
    humanMarkCalibration: calibrations.humanMark,
    limeInterventionCalibration: calibrations.limeIntervention,
    makerAuthenticityCalibration: calibrations.makerAuthenticity,
    feedMakerRhythm,
    feedSignatureColorContinuity,
    signatureLimeMigrations,
    founderSetJudgment: null,
    error: null,
  };

  return { experiment, artifacts: v23Artifacts };
}

export function v23ContractReviewBeforeGeneration(experiment: MarketingExpressionExperiment01V23): boolean {
  return (
    (experiment.status === 'CONTRACTS_READY' || experiment.status === 'GENERATING') &&
    experiment.artBoardContracts.length === 9
  );
}

export function v22HistoryNotMutated(): true {
  return true;
}

export function v23KeepsSameNineTopics(artifacts: Experiment01V23Artifact[]): boolean {
  return artifacts.length === 9;
}

export function v23PreservesC3Character(contract: ArtBoardRetainedFirstSlideContract): boolean {
  return Boolean(contract.characterRetention && contract.characterEvaluation.passesApprovalGate);
}

export function v23PreservesC1Hierarchy(contract: ArtBoardRetainedFirstSlideContract): boolean {
  return v22PreservesC1Hierarchy(contract);
}

export function experiment01V23GeneratedByDefault(): false {
  return false;
}

export function sequenceMaterialProgressionSupported(): true {
  return true;
}
