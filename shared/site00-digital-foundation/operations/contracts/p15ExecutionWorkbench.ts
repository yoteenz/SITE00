import type { DigitalFoundationExecutionTask, ExecutionMode } from '../types.js';

export type WorkbenchBuckets = {
  ready_to_execute: DigitalFoundationExecutionTask[];
  in_progress: DigitalFoundationExecutionTask[];
  waiting_on_client: DigitalFoundationExecutionTask[];
  waiting_on_provider: DigitalFoundationExecutionTask[];
  ready_to_verify: DigitalFoundationExecutionTask[];
  blocked: DigitalFoundationExecutionTask[];
  complete: DigitalFoundationExecutionTask[];
};

export function groupWorkbenchTasks(tasks: DigitalFoundationExecutionTask[]): WorkbenchBuckets {
  const active = tasks.filter((t) => t.status !== 'SUPERSEDED');
  return {
    ready_to_execute: active.filter((t) => t.status === 'READY'),
    in_progress: active.filter((t) => t.status === 'IN_PROGRESS'),
    waiting_on_client: active.filter((t) => t.status === 'WAITING_CLIENT'),
    waiting_on_provider: active.filter((t) => t.status === 'WAITING_PROVIDER'),
    ready_to_verify: active.filter((t) => t.status === 'READY_TO_VERIFY' || t.status === 'VERIFYING'),
    blocked: active.filter((t) => t.status === 'BLOCKED'),
    complete: active.filter((t) => t.status === 'COMPLETE' || t.status === 'VERIFIED'),
  };
}

export function tasksByMode(tasks: DigitalFoundationExecutionTask[]): Record<ExecutionMode, DigitalFoundationExecutionTask[]> {
  const modes: ExecutionMode[] = ['AUTOMATED', 'ASSISTED', 'CLIENT_ACTION', 'EXTERNAL_MANUAL', 'VERIFICATION'];
  const out = Object.fromEntries(modes.map((m) => [m, [] as DigitalFoundationExecutionTask[]])) as Record<
    ExecutionMode,
    DigitalFoundationExecutionTask[]
  >;
  for (const t of tasks) {
    out[t.execution_mode].push(t);
  }
  return out;
}
