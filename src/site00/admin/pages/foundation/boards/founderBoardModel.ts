/**
 * Founder boards 13–15C — presentation model over the operations contracts. Every count, label and tone is
 * derived from pipeline rows, the project command snapshot or the runbook view; nothing here mutates state.
 */
import { findAddon } from '../../../../../../shared/site00-digital-foundation/addonCatalog.js';
import type { PipelineRow, pipelineAttentionQueries } from '../../../../../../shared/site00-digital-foundation/operations/contracts/p13Pipeline.js';
import type { ProjectCommandSnapshot } from '../../../../../../shared/site00-digital-foundation/operations/contracts/p14ProjectCommand.js';
import type { FounderRunbookView } from '../../../../../../shared/site00-digital-foundation/operations/contracts/p15RunbookView.js';
import type {
  DigitalFoundationExecutionTask,
  DigitalFoundationVerificationResult,
  DigitalFoundationVerificationRule,
  ExecutionMode,
  ExecutionTaskStatus,
} from '../../../../../../shared/site00-digital-foundation/operations/types.js';
import { FOUNDATION_STAGE_ORDER, stageLabel } from '../../../../../../shared/site00-digital-foundation/projectStages.js';
import type { ProjectStageCode } from '../../../../../../shared/site00-digital-foundation/types.js';
import type { DfPillTone, DfStat } from '../../../../foundation-client/boardKit';
import type { DfIconName } from '../../../../foundation-client/icons';

export type PipelineAttention = ReturnType<typeof pipelineAttentionQueries>;

export function humanize(value: string): string {
  return value.replace(/_/g, ' ').toUpperCase();
}

export function stageName(code: string | null | undefined): string | null {
  if (!code) return null;
  return (FOUNDATION_STAGE_ORDER as string[]).includes(code) ? stageLabel(code as ProjectStageCode).toUpperCase() : humanize(code);
}

// ─── Board 13 · pipeline ────────────────────────────────────────────────────────────────────────

const PRE_QUOTE = new Set(['INVITED', 'OPENED', 'INTAKE_IN_PROGRESS', 'INTAKE_COMPLETE', 'RECOMMENDATION_READY']);
const DELIVERY = new Set(['PAID', 'PROJECT_ACTIVE', 'IN_PROGRESS', 'WAITING_ON_CLIENT', 'WAITING_ON_PROVIDER', 'FINAL_VERIFICATION']);

export function pipelineStats(rows: PipelineRow[], attention: PipelineAttention): DfStat[] {
  return [
    { label: 'OPENED', value: rows.length },
    { label: 'QUOTED', value: rows.filter((r) => r.quote_amount_minor !== null).length },
    { label: 'ACTIVE', value: rows.filter((r) => DELIVERY.has(r.artifact_state)).length, tone: 'red' },
    { label: 'NEEDS YOU', value: attention.needs_founder.length, tone: 'red' },
    { label: 'BLOCKED', value: attention.blocked.length },
    { label: 'BUILD LEADS', value: rows.filter((r) => r.build_interest === 'INTERESTED' || r.build_interest === 'BOOKED').length },
  ];
}

/** Status pill for a pipeline row: blocker first, then payment, then lifecycle. */
export function pipelineRowStatus(row: PipelineRow): { label: string; tone: DfPillTone } {
  if (row.blocker) return { label: humanize(row.blocker), tone: 'alert' };
  if (row.artifact_state === 'AWAITING_PAYMENT' || row.payment_state === 'FAILED' || row.payment_state === 'CHECKOUT_PENDING') {
    return { label: 'AWAITING PAYMENT', tone: 'alert' };
  }
  if (row.artifact_state === 'WAITING_ON_CLIENT') return { label: 'NEEDS CLIENT', tone: 'alert' };
  if (row.artifact_state === 'COMPLETE' || row.artifact_state === 'BUILD_OPPORTUNITY') return { label: 'COMPLETE', tone: 'ok' };
  if (DELIVERY.has(row.artifact_state)) return { label: 'IN PRODUCTION', tone: 'ok' };
  if (PRE_QUOTE.has(row.artifact_state)) return { label: 'DISCOVERY', tone: 'neutral' };
  return { label: humanize(row.artifact_state), tone: 'neutral' };
}

export function pipelineRowSub(row: PipelineRow): string {
  return stageName(row.current_stage) ?? humanize(row.artifact_state);
}

export function pipelineRowIcon(row: PipelineRow): DfIconName {
  if (row.blocker) return 'blocked';
  if (DELIVERY.has(row.artifact_state)) return 'cube';
  if (row.artifact_state === 'COMPLETE' || row.artifact_state === 'BUILD_OPPORTUNITY') return 'check';
  return 'user';
}

export type AttentionItem = { row: PipelineRow; reason: string; icon: DfIconName };

/** Founder attention: blocked first, then founder-owned work, de-duplicated by project. */
export function founderAttention(attention: PipelineAttention, limit = 4): AttentionItem[] {
  const seen = new Set<string>();
  const out: AttentionItem[] = [];
  const push = (row: PipelineRow, reason: string, icon: DfIconName) => {
    if (seen.has(row.artifact_id) || out.length >= limit) return;
    seen.add(row.artifact_id);
    out.push({ row, reason, icon });
  };
  for (const r of attention.blocked) push(r, `BLOCKED · ${humanize(r.blocker ?? 'UNKNOWN')}`, 'blocked');
  for (const r of attention.needs_founder) push(r, r.next_action ? r.next_action.toUpperCase() : 'IN PROGRESS', 'alert');
  for (const r of attention.waiting_clients) push(r, `AWAITING CLIENT · ${(r.next_action ?? '').toUpperCase()}`, 'clock');
  return out;
}

// ─── Runbook (15A / 15B / 15C) ──────────────────────────────────────────────────────────────────

export const MODE_LABEL: Record<ExecutionMode, string> = {
  AUTOMATED: 'AUTO',
  ASSISTED: 'ASSIST',
  CLIENT_ACTION: 'CLIENT',
  EXTERNAL_MANUAL: 'MANUAL',
  VERIFICATION: 'VERIFY',
};

export const MODE_LONG_LABEL: Record<ExecutionMode, string> = {
  AUTOMATED: 'AUTOMATED',
  ASSISTED: 'ASSISTED',
  CLIENT_ACTION: 'CLIENT ACTION',
  EXTERNAL_MANUAL: 'EXTERNAL MANUAL',
  VERIFICATION: 'VERIFICATION',
};

export const MODE_ICON: Record<ExecutionMode, DfIconName> = {
  AUTOMATED: 'gear',
  ASSISTED: 'user',
  CLIENT_ACTION: 'client',
  EXTERNAL_MANUAL: 'layers',
  VERIFICATION: 'checklist',
};

export const EXECUTION_MODES: ExecutionMode[] = ['AUTOMATED', 'ASSISTED', 'CLIENT_ACTION', 'EXTERNAL_MANUAL', 'VERIFICATION'];

export function modeTone(mode: ExecutionMode): DfPillTone {
  return mode === 'CLIENT_ACTION' ? 'alert' : 'muted';
}

const STATUS_LABEL: Record<ExecutionTaskStatus, string> = {
  NOT_READY: 'PENDING',
  READY: 'READY',
  IN_PROGRESS: 'IN PROGRESS',
  WAITING_CLIENT: 'WAITING CLIENT',
  WAITING_PROVIDER: 'WAITING PROVIDER',
  BLOCKED: 'BLOCKED',
  READY_TO_VERIFY: 'TO VERIFY',
  VERIFYING: 'VERIFYING',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  COMPLETE: 'COMPLETE',
  SKIPPED: 'SKIPPED',
  SUPERSEDED: 'SUPERSEDED',
};

export function taskStatusLabel(status: ExecutionTaskStatus): string {
  return STATUS_LABEL[status];
}

export function taskStatusTone(status: ExecutionTaskStatus): DfPillTone {
  switch (status) {
    case 'COMPLETE':
    case 'VERIFIED':
    case 'READY':
      return 'ok';
    case 'IN_PROGRESS':
    case 'BLOCKED':
    case 'FAILED':
    case 'WAITING_CLIENT':
      return 'alert';
    case 'READY_TO_VERIFY':
    case 'VERIFYING':
      return 'info';
    default:
      return 'muted';
  }
}

export function isDone(t: DigitalFoundationExecutionTask): boolean {
  return t.status === 'COMPLETE' || t.status === 'VERIFIED' || t.status === 'SKIPPED';
}

export type RunbookCounts = {
  total: number;
  ready: number;
  in_progress: number;
  blocked: number;
  verifying: number;
  completed: number;
};

export function runbookCounts(tasks: DigitalFoundationExecutionTask[]): RunbookCounts {
  return {
    total: tasks.length,
    ready: tasks.filter((t) => t.status === 'READY').length,
    in_progress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    blocked: tasks.filter((t) => t.status === 'BLOCKED' || t.status === 'FAILED').length,
    verifying: tasks.filter((t) => t.status === 'READY_TO_VERIFY' || t.status === 'VERIFYING').length,
    completed: tasks.filter(isDone).length,
  };
}

export function runbookStats(c: RunbookCounts): DfStat[] {
  return [
    { label: 'TOTAL TASKS', value: c.total },
    { label: 'READY', value: c.ready, tone: 'ok' },
    { label: 'IN PROGRESS', value: c.in_progress, tone: 'red' },
    { label: 'BLOCKED', value: c.blocked, tone: c.blocked ? 'alert' : undefined },
    { label: 'VERIFYING', value: c.verifying, tone: 'info' },
    { label: 'COMPLETED', value: c.completed, tone: 'ok' },
  ];
}

export function modeCounts(tasks: DigitalFoundationExecutionTask[]): Record<ExecutionMode, number> {
  const out = Object.fromEntries(EXECUTION_MODES.map((m) => [m, 0])) as Record<ExecutionMode, number>;
  for (const t of tasks) out[t.execution_mode] += 1;
  return out;
}

/** Runbook order: stage order, then generator order within a stage. Numbering follows this order. */
export function orderedTasks(tasks: DigitalFoundationExecutionTask[]): DigitalFoundationExecutionTask[] {
  const rank = (t: DigitalFoundationExecutionTask) => FOUNDATION_STAGE_ORDER.indexOf(t.project_stage);
  return tasks
    .map((t, i) => ({ t, i }))
    .sort((a, b) => rank(a.t) - rank(b.t) || a.i - b.i)
    .map(({ t }) => t);
}

export function taskNumbers(ordered: DigitalFoundationExecutionTask[]): Map<string, string> {
  const width = Math.max(2, String(ordered.length).length);
  return new Map(ordered.map((t, i) => [t.task_id, String(i + 1).padStart(width, '0')]));
}

export function dependencyLabel(task: DigitalFoundationExecutionTask, numbers: Map<string, string>): string {
  const deps = task.dependency_task_ids.map((id) => numbers.get(id)).filter((n): n is string => Boolean(n));
  return deps.length ? deps.join(', ') : '—';
}

export function dependents(taskId: string, tasks: DigitalFoundationExecutionTask[]): DigitalFoundationExecutionTask[] {
  return tasks.filter((t) => t.dependency_task_ids.includes(taskId));
}

export function currentStage(tasks: DigitalFoundationExecutionTask[]): ProjectStageCode | null {
  const ordered = orderedTasks(tasks);
  return (
    ordered.find((t) => t.status === 'IN_PROGRESS')?.project_stage ??
    ordered.find((t) => !isDone(t))?.project_stage ??
    null
  );
}

const STAGE_PURPOSE: Record<ProjectStageCode, string> = {
  '01_DETAILS_RECEIVED': 'CONFIRM BUSINESS DETAILS AND THE DOMAIN PATH.',
  '02_DOMAIN': 'SECURE, CONNECT OR RECOVER THE BUSINESS DOMAIN.',
  '03_PROFESSIONAL_EMAIL': 'PROVISION MAILBOXES, ALIASES AND MAIL FLOW.',
  '04_DNS_SECURITY': 'CONFIGURE DNS, EMAIL SECURITY AND DOMAIN PROTECTIONS.',
  '05_DEVICE_SIGNATURE': 'CONNECT DEVICES AND APPROVE THE BUSINESS SIGNATURE.',
  '06_FINAL_VERIFICATION': 'VERIFY EVERY RECORD AND ISSUE THE OWNERSHIP RECORD.',
  '07_FOUNDATION_COMPLETE': 'FOUNDATION DELIVERED AND OWNED BY THE CLIENT.',
};

export function stagePurpose(code: ProjectStageCode | null): string | null {
  return code ? STAGE_PURPOSE[code] : null;
}

/** Runbook name from the stages the runbook actually covers. */
export function runbookScopeTitle(tasks: DigitalFoundationExecutionTask[]): string {
  const stages = new Set(tasks.map((t) => t.project_stage));
  const domain = stages.has('02_DOMAIN');
  const email = stages.has('03_PROFESSIONAL_EMAIL');
  if (domain && email) return 'DOMAIN + EMAIL FOUNDATION';
  if (domain) return 'DOMAIN FOUNDATION';
  if (email) return 'EMAIL FOUNDATION';
  return 'DIGITAL FOUNDATION';
}

const TASK_ICON: Record<string, DfIconName> = {
  DOMAIN_PATH_DETERMINED: 'globe',
  DOMAIN_AVAILABILITY: 'globe',
  DOMAIN_REGISTRATION: 'globe',
  DOMAIN_OWNERSHIP: 'globe',
  DOMAIN_RECOVERY: 'globe',
  DOMAIN_TRANSFER: 'globe',
  ADDITIONAL_DOMAIN: 'globe',
  REGISTRAR_SECURITY: 'lock',
  PROVIDER_SELECTION: 'options',
  PRIMARY_MAILBOX: 'email',
  ADDITIONAL_MAILBOXES: 'email',
  ALIASES: 'email',
  SEND_TEST: 'send',
  RECEIVE_TEST: 'inbox',
  MX_CONFIGURE: 'server',
  SPF_CONFIGURE: 'shield',
  DKIM_CONFIGURE: 'shield',
  DMARC_CONFIGURE: 'shield',
  DNS_VERIFICATION: 'dns',
  SIGNATURE_CREATED: 'signature',
  SIGNATURE_APPROVED: 'signature',
  DEVICE_SETUP: 'device',
  OWNERSHIP_RECORD: 'document',
  FINAL_VERIFICATION: 'checklist',
  FOUNDATION_COMPLETION: 'check',
  BUSINESS_DETAILS_VERIFIED: 'building',
};

export function taskIcon(task: DigitalFoundationExecutionTask): DfIconName {
  return TASK_ICON[task.task_type] ?? MODE_ICON[task.execution_mode];
}

// ─── Verification ───────────────────────────────────────────────────────────────────────────────

export function rulesForTask(view: FounderRunbookView, taskId: string): DigitalFoundationVerificationRule[] {
  return view.verification_rules.filter((r) => r.task_id === taskId);
}

export function latestResult(
  view: FounderRunbookView,
  ruleId: string,
): DigitalFoundationVerificationResult | null {
  const list = view.verification_results.filter((r) => r.rule_id === ruleId);
  return list.length ? list.reduce((a, b) => (a.ran_at >= b.ran_at ? a : b)) : null;
}

export type VerificationSummary = { total: number; passed: number; expected: number; observed: number; state: string };

/** Aggregate rule state for the workbench strip and project command row. */
export function verificationSummary(view: FounderRunbookView): VerificationSummary {
  const rules = view.verification_rules;
  const passed = rules.filter((r) => latestResult(view, r.rule_id)?.status === 'PASS' || r.match_state === 'MATCH').length;
  const mismatch = rules.some((r) => r.match_state === 'MISMATCH' || latestResult(view, r.rule_id)?.status === 'FAIL');
  const state = !rules.length
    ? 'NO RULES'
    : mismatch
      ? 'MISMATCH'
      : passed === rules.length
        ? 'MATCHED'
        : passed === 0
          ? 'NOT RUN'
          : 'IN PROGRESS';
  return {
    total: rules.length,
    passed,
    expected: rules.filter((r) => r.expected_value !== null).length,
    observed: rules.filter((r) => r.current_value !== null).length,
    state,
  };
}

export function ruleTone(rule: DigitalFoundationVerificationRule, result: DigitalFoundationVerificationResult | null): DfPillTone {
  if (result?.status === 'PASS' || rule.match_state === 'MATCH') return 'ok';
  if (result?.status === 'FAIL' || rule.match_state === 'MISMATCH') return 'alert';
  if (result?.status === 'RUNNING' || result?.status === 'PARTIAL') return 'info';
  return 'muted';
}

export function ruleStatus(rule: DigitalFoundationVerificationRule, result: DigitalFoundationVerificationResult | null): string {
  if (result) return humanize(result.status);
  if (rule.match_state === 'UNKNOWN') return 'PENDING';
  return humanize(rule.match_state);
}

// ─── Next action (15 / 15C) ─────────────────────────────────────────────────────────────────────

export type TaskActionKind = 'START' | 'MARK_EXECUTED' | 'RUN_VERIFICATION' | 'WAITING' | 'NONE';

/**
 * The single real operation a founder can take on a task. START and MARK_EXECUTED map to `start-task` and
 * `complete-task`. RUN_VERIFICATION has no observed-value contract, so the boards render it disabled.
 */
export function taskAction(task: DigitalFoundationExecutionTask): { kind: TaskActionKind; label: string; detail: string } {
  switch (task.status) {
    case 'READY':
      return { kind: 'START', label: 'START TASK', detail: task.title.toUpperCase() };
    case 'IN_PROGRESS':
      return {
        kind: 'MARK_EXECUTED',
        label: task.execution_mode === 'VERIFICATION' ? 'MARK READY TO VERIFY' : 'MARK EXECUTED',
        detail: task.title.toUpperCase(),
      };
    case 'READY_TO_VERIFY':
    case 'VERIFYING':
      return { kind: 'RUN_VERIFICATION', label: 'RUN VERIFICATION', detail: `CHECK ${task.title.toUpperCase()}` };
    case 'WAITING_CLIENT':
      return { kind: 'WAITING', label: 'WAITING ON CLIENT', detail: task.title.toUpperCase() };
    case 'WAITING_PROVIDER':
      return { kind: 'WAITING', label: 'WAITING ON PROVIDER', detail: task.title.toUpperCase() };
    case 'BLOCKED':
    case 'FAILED':
      return { kind: 'WAITING', label: 'RESOLVE BLOCKER', detail: (task.blocked_reason ?? task.title).toUpperCase() };
    default:
      return { kind: 'NONE', label: isDone(task) ? 'COMPLETE' : 'WAITING ON DEPENDENCIES', detail: task.title.toUpperCase() };
  }
}

/** The task a founder should open next: verify, then continue, then start, then whatever waits on others. */
export function nextTask(tasks: DigitalFoundationExecutionTask[]): DigitalFoundationExecutionTask | null {
  const ordered = orderedTasks(tasks);
  const by = (s: ExecutionTaskStatus[]) => ordered.find((t) => s.includes(t.status));
  return (
    by(['READY_TO_VERIFY', 'VERIFYING']) ??
    by(['IN_PROGRESS']) ??
    by(['READY']) ??
    by(['BLOCKED', 'FAILED', 'WAITING_CLIENT', 'WAITING_PROVIDER']) ??
    null
  );
}

/** Workbench execution list: the current stage's tasks, padded with the next open tasks to a readable set. */
export function workbenchTasks(tasks: DigitalFoundationExecutionTask[], limit = 7): DigitalFoundationExecutionTask[] {
  const ordered = orderedTasks(tasks);
  const stage = currentStage(tasks);
  const inStage = stage ? ordered.filter((t) => t.project_stage === stage) : [];
  if (inStage.length >= limit) return inStage.slice(0, limit);
  const rest = ordered.filter((t) => !inStage.includes(t) && !isDone(t));
  return [...inStage, ...rest].slice(0, limit);
}

// ─── Project command (14) ───────────────────────────────────────────────────────────────────────

export function scopeLine(snapshot: ProjectCommandSnapshot): string {
  const addons = snapshot.purchased_scope?.selected_addons ?? [];
  const names = addons.map((a) => (findAddon(a.addon_id)?.label ?? humanize(a.addon_id)).toUpperCase());
  return ['DIGITAL FOUNDATION', ...names].join(' + ');
}

export function providersLine(tasks: DigitalFoundationExecutionTask[]): string | null {
  const ids = [...new Set(tasks.map((t) => t.provider_id).filter((p): p is string => Boolean(p)))];
  return ids.length ? ids.map(humanize).join(' + ') : null;
}

export function forecastLine(forecast: { current_min_days: number; current_max_days: number } | null): {
  value: string;
  unit: string;
} | null {
  if (!forecast) return null;
  const { current_min_days: min, current_max_days: max } = forecast;
  return { value: min === max ? String(min) : `${min}–${max}`, unit: 'BUSINESS DAYS' };
}
