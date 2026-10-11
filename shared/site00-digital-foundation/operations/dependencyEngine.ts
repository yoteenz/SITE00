import type { DigitalFoundationExecutionTask, ExecutionTaskStatus } from './types.js';

const TERMINAL: ExecutionTaskStatus[] = ['COMPLETE', 'VERIFIED', 'SKIPPED', 'SUPERSEDED'];

export function dependenciesSatisfied(task: DigitalFoundationExecutionTask, tasksById: Map<string, DigitalFoundationExecutionTask>): boolean {
  if (task.dependency_task_ids.length === 0) return true;
  return task.dependency_task_ids.every((id) => {
    const dep = tasksById.get(id);
    if (!dep) return false;
    return TERMINAL.includes(dep.status);
  });
}

export function refreshTaskReadiness(tasks: DigitalFoundationExecutionTask[]): DigitalFoundationExecutionTask[] {
  const byId = new Map(tasks.map((t) => [t.task_id, t]));
  for (const task of tasks) {
    if (task.status === 'SUPERSEDED' || task.status === 'COMPLETE' || task.status === 'VERIFIED') continue;
    if (!dependenciesSatisfied(task, byId)) {
      if (task.status !== 'NOT_READY' && task.status !== 'BLOCKED') {
        task.status = 'NOT_READY';
      }
      continue;
    }
    if (task.status === 'NOT_READY') {
      task.status = 'READY';
    }
  }
  return tasks;
}
