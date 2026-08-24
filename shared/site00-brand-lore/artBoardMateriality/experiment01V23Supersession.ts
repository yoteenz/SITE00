/**
 * P0.5C.4B.1 — Experiment 01 V2.3 generation queue methodology supersession.
 */

import type {
  Experiment01V23Artifact,
  Experiment01V23GenerationJobStatus,
  Experiment01V23SupersessionForensic,
  Experiment01V23SupersessionRecord,
  MarketingExpressionExperiment01V23,
} from './types.js';
import { falPromptHasLimeRestraintSection } from './signatureLimeRestraint.js';
import { materialFalPromptHasVisualAuthoritySection } from './falPromptCompilerV23.js';

export const V23_SUPERSEDED_BY_METHODOLOGY = 'SUPERSEDED_BY_METHODOLOGY' as const;
export const V23_SUPERSESSION_REASON_C4B1 = 'P0.5C.4B.1_SIGNATURE_LIME_RESTRAINT' as const;
export const V23_SUPERSESSION_REASON_C6 = 'P0.5C.6_VISUAL_AUTHORITY' as const;
/** @deprecated use V23_SUPERSESSION_REASON_C4B1 */
export const V23_SUPERSESSION_REASON = V23_SUPERSESSION_REASON_C4B1;

/** Estimated FAL cost per marketing artifact (matches service constant). */
export const V23_ESTIMATED_FAL_COST_USD = 0.05;

export function isV23GenerationRunSuperseded(
  experiment: MarketingExpressionExperiment01V23 | null | undefined,
): boolean {
  return experiment?.generationRunStatus === V23_SUPERSEDED_BY_METHODOLOGY;
}

export function isV23GenerationBlocked(experiment: MarketingExpressionExperiment01V23 | null | undefined): boolean {
  return isV23GenerationRunSuperseded(experiment);
}

export function artifactHasPreC4B1Prompt(artifact: Experiment01V23Artifact): boolean {
  const prompt =
    artifact.promptSnapshots?.find((s) => s.id === artifact.dispatchedPromptSnapshotId)?.prompt ??
    artifact.generationContract?.prompt ??
    '';
  if (!prompt) return true;
  return !falPromptHasLimeRestraintSection(prompt);
}

export function artifactHasPreC6Prompt(artifact: Experiment01V23Artifact): boolean {
  const prompt =
    artifact.promptSnapshots?.find((s) => s.id === artifact.dispatchedPromptSnapshotId)?.prompt ??
    artifact.generationContract?.prompt ??
    '';
  if (!prompt) return true;
  return !materialFalPromptHasVisualAuthoritySection({
    prompt,
    negativePrompt: artifact.generationContract?.negativePrompt ?? '',
    promptHash: '',
    sectionOrder: [],
  });
}

export function countPendingV23Jobs(artifacts: Experiment01V23Artifact[]): number {
  return artifacts.filter(
    (a) =>
      (a.generationStatus === 'NOT_GENERATED' ||
        a.generationStatus === 'GENERATING' ||
        a.generationJobStatus === 'QUEUED') &&
      !a.generatedAssetUrl,
  ).length;
}

export function countInFlightV23Jobs(artifacts: Experiment01V23Artifact[]): number {
  return artifacts.filter((a) => a.generationStatus === 'GENERATING' && !a.generatedAssetUrl).length;
}

export function countCompletedV23Assets(artifacts: Experiment01V23Artifact[]): number {
  return artifacts.filter((a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl).length;
}

export function shouldAutoSupersedeV23Generation(
  experiment: MarketingExpressionExperiment01V23,
): boolean {
  if (process.env.SITE00_V23_SUPERSESSION_DISABLED === '1') return false;
  if (isV23GenerationRunSuperseded(experiment)) return false;
  const active =
    experiment.status === 'GENERATING' ||
    experiment.generatedArtifacts.some((a) => a.generationStatus === 'GENERATING') ||
    countPendingV23Jobs(experiment.generatedArtifacts) > 0;
  if (!active) return false;
  if (experiment.generatedArtifacts.some(artifactHasPreC6Prompt)) return true;
  return experiment.generatedArtifacts.some(artifactHasPreC4B1Prompt);
}

export function buildV23SupersessionForensic(params: {
  experiment: MarketingExpressionExperiment01V23;
  pendingJobsCancelled: number;
  inFlightRequestsAtBoundary: number;
  completedAssetsPreserved: number;
  partialBoardPreserved: boolean;
  providerDispatchesAfterBoundary: number;
}): Experiment01V23SupersessionForensic {
  return {
    activeRunFound: true,
    supersessionBoundary: new Date().toISOString(),
    pendingJobsCancelled: params.pendingJobsCancelled,
    inFlightRequestsAtBoundary: params.inFlightRequestsAtBoundary,
    completedAssetsPreserved: params.completedAssetsPreserved,
    partialBoardPreserved: params.partialBoardPreserved,
    providerDispatchesAfterBoundary: params.providerDispatchesAfterBoundary,
    estimatedSpendPrevented: params.pendingJobsCancelled * V23_ESTIMATED_FAL_COST_USD,
  };
}

export function applyExperiment01V23Supersession(
  experiment: MarketingExpressionExperiment01V23,
): { experiment: MarketingExpressionExperiment01V23; forensic: Experiment01V23SupersessionForensic } {
  const now = new Date().toISOString();
  const inFlight = countInFlightV23Jobs(experiment.generatedArtifacts);
  const completed = countCompletedV23Assets(experiment.generatedArtifacts);
  let pendingCancelled = 0;
  const reason = experiment.generatedArtifacts.some(artifactHasPreC6Prompt)
    ? V23_SUPERSESSION_REASON_C6
    : V23_SUPERSESSION_REASON_C4B1;

  const generatedArtifacts = experiment.generatedArtifacts.map((artifact) => {
    const isCompleted = artifact.generationStatus === 'GENERATED' && artifact.generatedAssetUrl;
    const isInFlight = artifact.generationStatus === 'GENERATING' && !artifact.generatedAssetUrl;

    if (isCompleted) {
      const lineage: Experiment01V23Artifact['generationLineageClass'] =
        reason === V23_SUPERSESSION_REASON_C6 ? 'PRESERVED_PRE_C6' : 'PRESERVED_PRE_C4B1';
      return {
        ...artifact,
        generationLineageClass: lineage,
        generationJobStatus: 'COMPLETED' as Experiment01V23GenerationJobStatus,
        updatedAt: now,
      };
    }

    if (isInFlight) {
      return {
        ...artifact,
        generationLineageClass: 'PRE_P0_5C_4B_1_IN_FLIGHT' as const,
        generationJobStatus: 'IN_FLIGHT_AT_BOUNDARY' as Experiment01V23GenerationJobStatus,
        allowSingleInFlightCompletion: true,
        updatedAt: now,
      };
    }

    if (
      artifact.generationStatus === 'NOT_GENERATED' ||
      artifact.generationStatus === 'GENERATING' ||
      artifact.generationJobStatus === 'QUEUED'
    ) {
      pendingCancelled += 1;
      return {
        ...artifact,
        generationStatus: 'NOT_GENERATED' as const,
        generationJobStatus: 'CANCELLED_SUPERSEDED' as Experiment01V23GenerationJobStatus,
        generationLineageClass: null,
        updatedAt: now,
      };
    }

    return artifact;
  });

  const record: Experiment01V23SupersessionRecord = {
    runId: experiment.experimentId,
    status: V23_SUPERSEDED_BY_METHODOLOGY,
    reason,
    supersededAt: now,
    pendingJobsCancelled: pendingCancelled,
    inFlightRequestsAtBoundary: inFlight,
    completedAssetsPreserved: completed,
    partialBoardPreserved: completed > 0 && completed < 9,
  };

  const forensic = buildV23SupersessionForensic({
    experiment,
    pendingJobsCancelled: pendingCancelled,
    inFlightRequestsAtBoundary: inFlight,
    completedAssetsPreserved: completed,
    partialBoardPreserved: record.partialBoardPreserved,
    providerDispatchesAfterBoundary: 0,
  });

  return {
    experiment: {
      ...experiment,
      status: completed >= 9 ? experiment.status : 'CONTRACTS_READY',
      generationRunStatus: V23_SUPERSEDED_BY_METHODOLOGY,
      generationSupersession: record,
      generationSupersessionForensic: forensic,
      generatedArtifacts,
      error: null,
    },
    forensic,
  };
}

export function markInFlightV23ArtifactPreserved(artifact: Experiment01V23Artifact): Experiment01V23Artifact {
  return {
    ...artifact,
    generationStatus: 'GENERATED',
    generationLineageClass: 'PRESERVED_PRE_C4B1',
    generationJobStatus: 'COMPLETED',
    allowSingleInFlightCompletion: false,
    updatedAt: new Date().toISOString(),
  };
}

export function isV23SupersessionError(message: string): boolean {
  return message.includes('V2.3 GENERATION SUPERSEDED');
}

export function assertV23BatchGenerationAllowed(
  experiment: MarketingExpressionExperiment01V23 | null | undefined,
): void {
  if (isV23GenerationBlocked(experiment)) {
    throw new Error(
      'V2.3 GENERATION SUPERSEDED — P0.5C.4B.1 signature lime restraint active; use REGENERATE CURRENT per slide after governance passes',
    );
  }
}

/** @deprecated use assertV23BatchGenerationAllowed */
export const assertV23GenerationAllowed = assertV23BatchGenerationAllowed;

export function assertV23SingleArtifactGenerationAllowed(params: {
  experiment: MarketingExpressionExperiment01V23 | null | undefined;
  artifact: Experiment01V23Artifact;
  mode: 'REGENERATE_CURRENT' | 'REPLAY_GENERATION';
}): void {
  if (!isV23GenerationBlocked(params.experiment)) return;
  if (params.artifact.allowSingleInFlightCompletion) return;
  if (params.mode === 'REGENERATE_CURRENT' || params.mode === 'REPLAY_GENERATION') return;
  assertV23BatchGenerationAllowed(params.experiment);
}

export function supersededJobIsNotFailure(jobStatus: Experiment01V23GenerationJobStatus | null | undefined): boolean {
  return jobStatus === 'CANCELLED_SUPERSEDED' || jobStatus === 'IN_FLIGHT_AT_BOUNDARY';
}
