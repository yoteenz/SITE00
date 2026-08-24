/**
 * Cinematic Realism Lab service — founder-triggered only, no auto-generation.
 */

import {
  applyJudgmentToLaneRun,
  buildDecisionSummary,
  buildPilotLuxuryCreatorRealismTest01,
  completeLaneWithPlaceholders,
  emptyLabState,
  estimateExperimentCost,
  queueLaneGeneration,
  realismLabEnabledForProject,
  recordFounderJudgmentOnRun,
  upsertExperiment,
} from '../../../../shared/site00-studio-world-production/cinematicRealismLab/index.js';
import type {
  RealismExperiment,
  RealismFounderJudgment,
  RealismLabState,
} from '../../../../shared/site00-studio-world-production/cinematicRealismLab/types.js';
import {
  getRealismLabState,
  saveRealismLabState,
} from './cinematicRealismLabMemoryStore.js';

async function loadOrEmpty(projectId: string): Promise<RealismLabState> {
  return (await getRealismLabState(projectId)) ?? emptyLabState(projectId);
}

export async function getCinematicRealismLabState(params: { projectId: string }): Promise<RealismLabState> {
  if (!realismLabEnabledForProject(params.projectId)) {
    return emptyLabState(params.projectId);
  }
  const state = await loadOrEmpty(params.projectId);
  if (state.experiments.length === 0) {
    const pilot = buildPilotLuxuryCreatorRealismTest01(params.projectId);
    const next = upsertExperiment(state, pilot);
    await saveRealismLabState(next);
    return next;
  }
  return state;
}

export async function initializePilotExperiment(params: { projectId: string }): Promise<RealismLabState> {
  const state = await loadOrEmpty(params.projectId);
  const pilot = buildPilotLuxuryCreatorRealismTest01(params.projectId);
  const next = upsertExperiment(state, pilot);
  await saveRealismLabState(next);
  return next;
}

/** Founder-triggered — queues lanes without external provider calls. */
export async function queueExperimentLanes(params: {
  projectId: string;
  experimentId: string;
}): Promise<RealismLabState> {
  const state = await loadOrEmpty(params.projectId);
  const experiment = state.experiments.find((e) => e.experimentId === params.experimentId);
  if (!experiment) throw new Error('Experiment not found');

  const updated: RealismExperiment = {
    ...experiment,
    status: 'RUNNING',
    laneRuns: experiment.laneRuns.map((run) => queueLaneGeneration(run)),
    updatedAt: new Date().toISOString(),
  };
  const next = upsertExperiment(state, updated);
  next.accounting.totalEstimatedUsd += estimateExperimentCost(updated);
  await saveRealismLabState(next);
  return next;
}

/** Simulates lane completion with placeholders — explicit founder action, no auto on load. */
export async function simulateExperimentOutputs(params: {
  projectId: string;
  experimentId: string;
}): Promise<RealismLabState> {
  const state = await loadOrEmpty(params.projectId);
  const experiment = state.experiments.find((e) => e.experimentId === params.experimentId);
  if (!experiment) throw new Error('Experiment not found');

  const updated: RealismExperiment = {
    ...experiment,
    status: 'REVIEW',
    laneRuns: experiment.laneRuns.map((run) =>
      run.status === 'FAILED' ? run : completeLaneWithPlaceholders({ ...run, status: 'QUEUED' }),
    ),
    updatedAt: new Date().toISOString(),
  };
  const next = upsertExperiment(state, updated);
  await saveRealismLabState(next);
  return next;
}

export async function recordRealismFounderJudgment(params: {
  projectId: string;
  experimentId: string;
  runId: string;
  assetId: string;
  judgment: RealismFounderJudgment;
}): Promise<RealismLabState> {
  const state = await loadOrEmpty(params.projectId);
  const experiment = state.experiments.find((e) => e.experimentId === params.experimentId);
  if (!experiment) throw new Error('Experiment not found');

  const updated: RealismExperiment = {
    ...experiment,
    laneRuns: experiment.laneRuns.map((run) => {
      if (run.runId !== params.runId) return run;
      const withJudgment = recordFounderJudgmentOnRun(run, params.assetId, params.judgment);
      return applyJudgmentToLaneRun(withJudgment, params.assetId, params.judgment);
    }),
    updatedAt: new Date().toISOString(),
  };
  const next = upsertExperiment(state, updated);
  await saveRealismLabState(next);
  return next;
}

export async function finalizeRealismDecision(params: {
  projectId: string;
  experimentId: string;
}): Promise<RealismLabState> {
  const state = await loadOrEmpty(params.projectId);
  const experiment = state.experiments.find((e) => e.experimentId === params.experimentId);
  if (!experiment) throw new Error('Experiment not found');

  const updated: RealismExperiment = {
    ...experiment,
    status: 'DECIDED',
    decisionSummary: buildDecisionSummary(experiment),
    updatedAt: new Date().toISOString(),
  };
  const next = upsertExperiment(state, updated);
  await saveRealismLabState(next);
  return next;
}
