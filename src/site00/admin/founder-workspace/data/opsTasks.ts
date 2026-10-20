/** Operations task model as read from the workbench API (`by_mode` / `buckets`) — read-only helpers. */
import type { WsKind } from '../shell/wsKit';

/** Task as returned by the workbench `by_mode` / `buckets` projections (subset used here). */
export type OpsTask = {
  task_id: string;
  title?: string;
  description?: string;
  task_type?: string;
  status?: string;
  execution_mode?: string;
  project_stage?: string;
  dependency_task_ids?: string[];
  blocker_category?: string | null;
  blocked_reason?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  verified_at?: string | null;
  provider_id?: string | null;
};

export type Workbench = {
  tasks?: OpsTask[];
  by_mode?: Record<string, OpsTask[]>;
  command?: { what_is_blocked?: unknown[]; what_client_owes?: string[]; what_is_happening_now?: string | null; current_forecast?: { current_min_days?: number; current_max_days?: number } | null };
};

export const STAGES = ['DETAILS RECEIVED', 'DOMAIN', 'PROFESSIONAL EMAIL', 'DNS + SECURITY', 'DEVICE + SIGNATURE', 'FINAL VERIFICATION', 'FOUNDATION COMPLETE'];
export const stageIndex = (code: string | null | undefined) => {
  const n = Number.parseInt(String(code ?? '').slice(0, 2), 10);
  return Number.isFinite(n) && n >= 1 && n <= 7 ? n - 1 : -1;
};

export const human = (s: string | null | undefined) => (s ? s.replace(/_/g, ' ').toUpperCase() : '—');
export const DONE = new Set(['COMPLETE', 'VERIFIED', 'SKIPPED']);
export const WAIT = new Set(['WAITING_CLIENT', 'WAITING_PROVIDER', 'NOT_READY']);
/** Task status → authority mark. Unexecuted work never reads as complete. */
export const TASK_KIND: Record<string, WsKind> = {
  COMPLETE: 'done',
  VERIFIED: 'done',
  SKIPPED: 'idle',
  IN_PROGRESS: 'work',
  READY: 'idle',
  NOT_READY: 'idle',
  WAITING_CLIENT: 'client',
  WAITING_PROVIDER: 'blocked',
  BLOCKED: 'blocked',
  FAILED: 'blocked',
  READY_TO_VERIFY: 'founder',
  VERIFYING: 'work',
};

export function flattenTasks(w: Workbench | null): OpsTask[] {
  if (!w) return [];
  const all = w.tasks ?? Object.values(w.by_mode ?? {}).flat();
  return all.filter((t) => t.status !== 'SUPERSEDED');
}

