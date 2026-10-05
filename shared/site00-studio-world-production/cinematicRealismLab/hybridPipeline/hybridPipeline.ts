/**
 * Hybrid still-first pipeline stage model.
 */

import { HYBRID_PIPELINE_STAGES, POST_PIPELINE_SLOTS } from '../constants.js';
import type { HybridPipelineStage, PostPipelineSlot, RealismLaneRun } from '../types.js';

export type HybridStageState = {
  stage: HybridPipelineStage;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'SKIPPED' | 'FAILED';
  notes: string[];
  completedAt: string | null;
};

export function initialHybridStages(): HybridStageState[] {
  return HYBRID_PIPELINE_STAGES.map((stage) => ({
    stage,
    status: stage === 'GENERATE_HERO_STILL' ? 'PENDING' : 'PENDING',
    notes: [],
    completedAt: null,
  }));
}

export function advanceHybridStage(
  stages: HybridStageState[],
  stage: HybridPipelineStage,
  status: HybridStageState['status'] = 'COMPLETE',
): HybridStageState[] {
  return stages.map((s) =>
    s.stage === stage
      ? { ...s, status, completedAt: status === 'COMPLETE' ? new Date().toISOString() : s.completedAt }
      : s,
  );
}

export function hybridPipelineProgress(stages: HybridStageState[]): number {
  const complete = stages.filter((s) => s.status === 'COMPLETE').length;
  return complete / stages.length;
}

export function isHybridLane(run: RealismLaneRun): boolean {
  return run.workflowKind === 'STILL_FIRST' || run.workflowKind === 'MULTI_STEP_HYBRID';
}

export type PostPipelinePlaceholder = {
  slot: PostPipelineSlot;
  status: 'NOT_WIRED' | 'PLANNED' | 'COMPLETE';
  notes: string;
};

export function createPostPipelinePlaceholders(): PostPipelinePlaceholder[] {
  return POST_PIPELINE_SLOTS.map((slot) => ({
    slot,
    status: 'NOT_WIRED',
    notes: 'Post slot reserved — manual or future automation.',
  }));
}

export function inferWorkflowKindFromLane(laneId: RealismLaneRun['laneId']): RealismLaneRun['workflowKind'] {
  if (laneId === 'LANE_F_HYBRID_STILL_VIDEO') return 'STILL_FIRST';
  if (laneId === 'LANE_G_FUTURE') return 'PROVIDER_RELAY';
  return 'DIRECT_VIDEO';
}
