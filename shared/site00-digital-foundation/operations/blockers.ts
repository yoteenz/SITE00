import type { BlockerCategory, DigitalFoundationExecutionTask } from './types.js';

export type BlockerSummary = {
  category: BlockerCategory;
  reason: string;
  task_id: string;
  artifact_id: string;
  project_stage: DigitalFoundationExecutionTask['project_stage'];
};

export function extractBlockers(tasks: DigitalFoundationExecutionTask[]): BlockerSummary[] {
  return tasks
    .filter((t) => t.status === 'BLOCKED' || t.blocker_category)
    .map((t) => ({
      category: t.blocker_category ?? 'UNKNOWN',
      reason: t.blocked_reason ?? 'Blocked',
      task_id: t.task_id,
      artifact_id: t.artifact_id,
      project_stage: t.project_stage,
    }));
}

export function projectBlockerCategory(tasks: DigitalFoundationExecutionTask[]): BlockerCategory | null {
  const blockers = extractBlockers(tasks);
  if (blockers.length === 0) return null;
  return blockers[0]!.category;
}
