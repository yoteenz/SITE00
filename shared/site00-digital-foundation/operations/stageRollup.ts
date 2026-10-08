import type { ProjectStageCode, ProjectStageRecord, ProjectStageStatus } from '../types.js';
import type { DigitalFoundationExecutionTask } from './types.js';
import { FOUNDATION_STAGE_ORDER } from '../projectStages.js';

function rollupOneStage(stageTasks: DigitalFoundationExecutionTask[]): ProjectStageStatus {
  const active = stageTasks.filter((t) => t.status !== 'SUPERSEDED');
  if (active.length === 0) return 'WAITING';
  if (active.every((t) => t.status === 'COMPLETE' || t.status === 'VERIFIED' || t.status === 'SKIPPED')) {
    return 'COMPLETE';
  }
  if (active.some((t) => t.status === 'BLOCKED')) return 'BLOCKED';
  if (active.some((t) => t.status === 'WAITING_PROVIDER')) return 'NEEDS_PROVIDER';
  if (active.some((t) => t.status === 'WAITING_CLIENT')) return 'NEEDS_CLIENT';
  if (
    active.some(
      (t) =>
        t.status === 'IN_PROGRESS' ||
        t.status === 'READY' ||
        t.status === 'VERIFYING' ||
        t.status === 'READY_TO_VERIFY',
    )
  ) {
    return 'IN_PROGRESS';
  }
  return 'WAITING';
}

export function rollupStagesFromTasks(
  tasks: DigitalFoundationExecutionTask[],
  nowIso: string,
): ProjectStageRecord[] {
  const byStage = new Map<ProjectStageCode, DigitalFoundationExecutionTask[]>();
  for (const code of FOUNDATION_STAGE_ORDER) {
    byStage.set(code, []);
  }
  for (const t of tasks) {
    if (t.status === 'SUPERSEDED') continue;
    byStage.get(t.project_stage)?.push(t);
  }

  return FOUNDATION_STAGE_ORDER.map((stage_code) => {
    const stageTasks = byStage.get(stage_code) ?? [];
    if (stageTasks.length === 0) {
      return { stage_code, status: 'WAITING' as ProjectStageStatus, updated_at: nowIso };
    }
    const status = rollupOneStage(stageTasks);
    return { stage_code, status, updated_at: nowIso };
  });
}
