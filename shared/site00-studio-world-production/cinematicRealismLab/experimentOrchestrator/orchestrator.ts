/**
 * Experiment orchestrator — multi-lane realism runs.
 */

import { randomUUID } from 'node:crypto';
import { compileProviderPrompt } from '../promptCompiler/compiler.js';
import { getProviderCapability, resolveProviderForLane } from '../providerRegistry/registry.js';
import { createEmptyEvaluation } from '../realismEvaluation/evaluation.js';
import { inferWorkflowKindFromLane } from '../hybridPipeline/hybridPipeline.js';
import { HYBRID_PIPELINE_STAGES } from '../constants.js';
import type {
  CinematicRealismLaneId,
  RealismBenchmarkAsset,
  RealismDecisionSummary,
  RealismExperiment,
  RealismFounderJudgment,
  RealismLabState,
  RealismLaneRun,
  RealismReferencePack,
  RealismShotBrief,
  RealismTestType,
} from '../types.js';

export function createShotBrief(params: Partial<RealismShotBrief> & Pick<RealismShotBrief, 'shotType' | 'sceneDescription'>): RealismShotBrief {
  return {
    briefId: params.briefId ?? `brief-${randomUUID().slice(0, 8)}`,
    shotType: params.shotType,
    sceneDescription: params.sceneDescription,
    realismTarget: params.realismTarget ?? 'Indistinguishable from real luxury lifestyle reel footage',
    wardrobe: params.wardrobe ?? 'Editorial luxury — natural fabrics, no costume exaggeration',
    props: params.props ?? ['phone', 'tablet'],
    environment: params.environment ?? 'Premium urban transit interior — golden hour',
    cameraBehavior: params.cameraBehavior ?? 'Medium close, subtle handheld, social-native 9:16',
    performanceBehavior: params.performanceBehavior ?? 'Calm confident founder energy — micro-expressions only',
    voiceMode: params.voiceMode ?? 'VOICEOVER',
    continuityAnchors: params.continuityAnchors ?? ['face', 'wardrobe', 'devices', 'window light'],
    socialFormat: params.socialFormat ?? 'REEL_9_16',
    negativeConstraints: params.negativeConstraints ?? ['plastic skin', 'floating hands', 'fantasy interior', 'platform UI'],
  };
}

export function createLaneRun(params: {
  laneId: CinematicRealismLaneId;
  brief: RealismShotBrief;
  testType: RealismTestType;
  referencePack?: RealismReferencePack | null;
}): RealismLaneRun {
  const providerId = resolveProviderForLane(params.laneId);
  const provider = getProviderCapability(providerId);
  const promptSnapshot = compileProviderPrompt({
    brief: params.brief,
    laneId: params.laneId,
    referencePack: params.referencePack,
    providerId,
  });
  const workflowKind = inferWorkflowKindFromLane(params.laneId);
  const now = new Date().toISOString();

  return {
    runId: `run-${randomUUID().slice(0, 8)}`,
    laneId: params.laneId,
    providerId,
    testType: params.testType,
    workflowKind,
    readiness: provider?.readiness ?? 'DISABLED',
    status: provider?.readiness === 'READY' ? 'PLANNED' : 'SKIPPED',
    promptSnapshot,
    referencePackId: params.referencePack?.packId ?? null,
    settings: { founderTriggeredOnly: true },
    assets: [],
    evaluation: null,
    founderJudgments: [],
    costEstimateUsd: provider?.costEstimateUsdPerClip ?? null,
    costActualUsd: null,
    error:
      provider?.readiness === 'READY'
        ? null
        : `Provider ${providerId} readiness: ${provider?.readiness ?? 'UNKNOWN'} — no live execution wired in P0.CR.1`,
    hybridStages: workflowKind === 'STILL_FIRST' || workflowKind === 'MULTI_STEP_HYBRID' ? [...HYBRID_PIPELINE_STAGES] : [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createExperiment(params: {
  projectId: string;
  name: string;
  brief: RealismShotBrief;
  selectedLanes: CinematicRealismLaneId[];
  testType: RealismTestType;
  referencePack?: RealismReferencePack | null;
}): RealismExperiment {
  const now = new Date().toISOString();
  return {
    experimentId: `exp-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    name: params.name,
    shotBrief: params.brief,
    referencePack: params.referencePack ?? null,
    testType: params.testType,
    selectedLanes: params.selectedLanes,
    laneRuns: params.selectedLanes.map((laneId) =>
      createLaneRun({
        laneId,
        brief: params.brief,
        testType: params.testType,
        referencePack: params.referencePack,
      }),
    ),
    status: 'READY',
    decisionSummary: null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Founder-triggered queue — does NOT call external providers in P0.CR.1. */
export function queueLaneGeneration(run: RealismLaneRun): RealismLaneRun {
  if (run.readiness !== 'READY') {
    return {
      ...run,
      status: 'SKIPPED',
      error: run.error ?? 'Provider not ready for live execution',
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    ...run,
    status: 'QUEUED',
    updatedAt: new Date().toISOString(),
  };
}

/** Simulates completion with placeholder assets — no external API calls. */
export function completeLaneWithPlaceholders(run: RealismLaneRun): RealismLaneRun {
  const assets: RealismBenchmarkAsset[] = [
    {
      assetId: `asset-${run.runId}-still`,
      kind: run.workflowKind === 'STILL_FIRST' || run.workflowKind === 'MULTI_STEP_HYBRID' ? 'STILL' : 'VIDEO',
      url: null,
      thumbnailUrl: null,
      placeholder: true,
      lineageStage: run.workflowKind === 'STILL_FIRST' ? 'GENERATE_HERO_STILL' : 'DIRECT_VIDEO',
      providerId: run.providerId,
      laneId: run.laneId,
    },
  ];
  if (run.workflowKind === 'STILL_FIRST') {
    assets.push({
      assetId: `asset-${run.runId}-video`,
      kind: 'VIDEO',
      url: null,
      thumbnailUrl: null,
      placeholder: true,
      lineageStage: 'ANIMATE_VIDEO',
      providerId: run.providerId,
      laneId: run.laneId,
    });
  }
  const evaluation = createEmptyEvaluation(assets[0]!.assetId);
  return {
    ...run,
    status: 'COMPLETED',
    assets,
    evaluation,
    updatedAt: new Date().toISOString(),
  };
}

export function recordFounderJudgmentOnRun(
  run: RealismLaneRun,
  assetId: string,
  judgment: RealismFounderJudgment,
): RealismLaneRun {
  return {
    ...run,
    founderJudgments: [...run.founderJudgments, { judgment, assetId, at: new Date().toISOString() }],
    updatedAt: new Date().toISOString(),
  };
}

export function buildDecisionSummary(experiment: RealismExperiment): RealismDecisionSummary {
  const runs = experiment.laneRuns.filter((r) => r.evaluation || r.founderJudgments.length);
  const byRealism = [...runs].sort(
    (a, b) =>
      (b.evaluation ? Object.values(b.evaluation.scores).reduce((x, y) => x + y, 0) : 0) -
      (a.evaluation ? Object.values(a.evaluation.scores).reduce((x, y) => x + y, 0) : 0),
  );

  return {
    summaryId: `decision-${experiment.experimentId}`,
    topProviderByRealism: byRealism[0]?.providerId ?? null,
    topProviderByMotion:
      runs.find((r) => r.founderJudgments.some((j) => j.judgment === 'BEST_MOTION'))?.providerId ?? null,
    topProviderByIdentity:
      runs.find((r) => r.founderJudgments.some((j) => j.judgment === 'BEST_FACE'))?.providerId ?? null,
    topProviderByLuxuryTone:
      runs.find((r) => r.founderJudgments.some((j) => j.judgment === 'BEST_SCENE'))?.providerId ?? null,
    bestHybridStack: runs.find((r) => r.laneId === 'LANE_F_HYBRID_STILL_VIDEO')?.laneId ?? null,
    productionReadyRecommendation:
      'Complete founder review across lanes, wire AUTH_REQUIRED providers, then re-run pilot with live execution.',
    useCaseNotes: {
      LUXURY_CAR_SEATED: 'Hybrid still→video likely strongest for device + interior continuity',
      SOCIAL_REEL: 'MiniMax/Hailuo or Kling for motion-native output',
    },
    decidedAt: new Date().toISOString(),
  };
}

export function emptyLabState(projectId: string): RealismLabState {
  return {
    projectId,
    experiments: [],
    accounting: { totalEstimatedUsd: 0, totalActualUsd: 0, providerRequests: 0, falRequests: 0 },
    updatedAt: new Date().toISOString(),
  };
}

export function upsertExperiment(state: RealismLabState, experiment: RealismExperiment): RealismLabState {
  const exists = state.experiments.some((e) => e.experimentId === experiment.experimentId);
  const experiments = exists
    ? state.experiments.map((e) => (e.experimentId === experiment.experimentId ? experiment : e))
    : [...state.experiments, experiment];
  return { ...state, experiments, updatedAt: new Date().toISOString() };
}

export function estimateExperimentCost(experiment: RealismExperiment): number {
  return experiment.laneRuns.reduce((sum, run) => sum + (run.costEstimateUsd ?? 0), 0);
}
