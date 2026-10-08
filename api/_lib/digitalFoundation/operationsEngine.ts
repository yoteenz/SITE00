import { randomUUID } from 'node:crypto';
import { generateRunbookFromScope } from '../../../shared/site00-digital-foundation/operations/runbookGenerator.js';
import { computeScopeHash } from '../../../shared/site00-digital-foundation/operations/scopeHash.js';
import { refreshTaskReadiness } from '../../../shared/site00-digital-foundation/operations/dependencyEngine.js';
import { rollupStagesFromTasks } from '../../../shared/site00-digital-foundation/operations/stageRollup.js';
import { projectBlockerCategory } from '../../../shared/site00-digital-foundation/operations/blockers.js';
import { evaluateVerificationRule } from '../../../shared/site00-digital-foundation/operations/verificationEngine.js';
import { assessCompletionGate } from '../../../shared/site00-digital-foundation/operations/completionGate.js';
import { generateOwnershipRecordFromOperations } from '../../../shared/site00-digital-foundation/operations/ownershipGenerator.js';
import { buildInitialForecast, refineForecast } from '../../../shared/site00-digital-foundation/operations/forecast.js';
import { extractBlockers } from '../../../shared/site00-digital-foundation/operations/blockers.js';
import { buildPipelineRows, pipelineAttentionQueries } from '../../../shared/site00-digital-foundation/operations/contracts/p13Pipeline.js';
import { projectCommandAnswers, type ProjectCommandSnapshot } from '../../../shared/site00-digital-foundation/operations/contracts/p14ProjectCommand.js';
import { groupWorkbenchTasks, tasksByMode } from '../../../shared/site00-digital-foundation/operations/contracts/p15ExecutionWorkbench.js';
import type { ClientActionType } from '../../../shared/site00-digital-foundation/types.js';
import * as mem from './memoryStore.js';
import { listArtifacts, memGetArtifact, memGetLead, memGetQuote } from './memoryStore.js';

function nowIso(): string {
  return new Date().toISOString();
}

function logOpsEvent(artifactId: string, event_type: string, payload: Record<string, unknown> = {}): void {
  mem.memAppendEvent({
    event_id: randomUUID(),
    artifact_id: artifactId,
    event_type: event_type as never,
    actor: 'OPERATIONS',
    payload,
    created_at: nowIso(),
  });
}

function getProjectConfig(artifactId: string) {
  const s = mem.getDfMemoryState();
  if (!s.projectConfig.has(artifactId)) {
    s.projectConfig.set(artifactId, {
      artifact_id: artifactId,
      email_provider_id: null,
      dns_provider_id: null,
      domain_registrar_id: null,
    });
  }
  return s.projectConfig.get(artifactId)!;
}

function taskToClientActionType(taskType: string): ClientActionType | null {
  const map: Record<string, ClientActionType> = {
    DOMAIN_AVAILABILITY: 'CHOOSE_DOMAIN',
    DOMAIN_TRANSFER: 'AUTHORIZE_DOMAIN_TRANSFER',
    DOMAIN_RECOVERY: 'CONFIRM_RECOVERY_EMAIL',
    SIGNATURE_APPROVED: 'APPROVE_SIGNATURE',
    DEVICE_SETUP: 'COMPLETE_DEVICE_SETUP',
  };
  return map[taskType] ?? (taskType.includes('DOMAIN') ? 'PROVIDE_DOMAIN_ACCESS' : null);
}

export function generateRunbookForArtifact(artifactId: string, opts?: { supersede?: boolean }) {
  const a = memGetArtifact(artifactId);
  if (!a?.quote_id) throw new Error('QUOTE_REQUIRED');
  const q = memGetQuote(a.quote_id);
  if (!q) throw new Error('QUOTE_NOT_FOUND');
  const config = getProjectConfig(artifactId);
  const scopeHash = computeScopeHash({ quote: q, intake: a.intake, project_config: config });

  const s = mem.getDfMemoryState();
  const existing = s.runbooks.get(artifactId);
  if (existing && existing.generated_from_scope_hash === scopeHash && !opts?.supersede) {
    return { runbook: existing, tasks: s.tasks.get(artifactId) ?? [] };
  }

  if (existing) {
    existing.status = 'SUPERSEDED';
    const hist = s.runbookHistory.get(artifactId) ?? [];
    hist.push(existing);
    s.runbookHistory.set(artifactId, hist);
    for (const t of s.tasks.get(artifactId) ?? []) {
      t.status = 'SUPERSEDED';
    }
    logOpsEvent(artifactId, 'TASK_SUPERSEDED', { prior_runbook: existing.runbook_id });
  }

  const version = (existing?.runbook_version ?? 0) + 1;
  const generated = generateRunbookFromScope({
    artifact_id: artifactId,
    quote: q,
    intake: a.intake,
    project_config: config,
    runbook_version: version,
  });
  generated.runbook.status = 'READY';
  s.runbooks.set(artifactId, generated.runbook);
  s.tasks.set(artifactId, refreshTaskReadiness(generated.tasks));
  s.verificationRules.set(artifactId, generated.verification_rules);
  s.forecasts.set(artifactId, buildInitialForecast(q, artifactId));
  logOpsEvent(artifactId, 'RUNBOOK_GENERATED', {
    runbook_id: generated.runbook.runbook_id,
    scope_hash: scopeHash,
    task_count: generated.tasks.length,
  });
  return generated;
}

export function activateRunbookForArtifact(artifactId: string) {
  const s = mem.getDfMemoryState();
  let runbook = s.runbooks.get(artifactId);
  if (!runbook) {
    generateRunbookForArtifact(artifactId);
    runbook = s.runbooks.get(artifactId)!;
  }
  runbook.status = 'ACTIVE';
  runbook.activated_at = nowIso();
  const tasks = refreshTaskReadiness(s.tasks.get(artifactId) ?? []);
  s.tasks.set(artifactId, tasks);
  syncDerivedState(artifactId);
  logOpsEvent(artifactId, 'RUNBOOK_ACTIVATED', { runbook_id: runbook.runbook_id });
  return runbook;
}

function ensureClientActionForTask(
  artifactId: string,
  task: import('../../../shared/site00-digital-foundation/operations/types.js').DigitalFoundationExecutionTask,
) {
  if (task.execution_mode !== 'CLIENT_ACTION' || task.client_action_request_id) return;
  const actionType = taskToClientActionType(task.task_type) ?? 'CUSTOM_REQUEST';
  const list = mem.getDfMemoryState().clientActions.get(artifactId) ?? [];
  const req = {
    request_id: randomUUID(),
    artifact_id: artifactId,
    action_type: actionType,
    title: task.title,
    detail: task.description,
    status: 'OPEN' as const,
    created_at: nowIso(),
    completed_at: null,
    response: null,
  };
  list.push(req);
  mem.getDfMemoryState().clientActions.set(artifactId, list);
  task.client_action_request_id = req.request_id;
  task.status = 'WAITING_CLIENT';
  logOpsEvent(artifactId, 'CLIENT_ACTION_CREATED', { task_id: task.task_id, request_id: req.request_id });
}

export function syncDerivedState(artifactId: string) {
  const s = mem.getDfMemoryState();
  const tasks = refreshTaskReadiness([...(s.tasks.get(artifactId) ?? [])]);
  for (const t of tasks) {
    if (t.status === 'READY' && t.execution_mode === 'CLIENT_ACTION') {
      ensureClientActionForTask(artifactId, t);
    }
  }
  s.tasks.set(artifactId, tasks);
  s.stages.set(artifactId, rollupStagesFromTasks(tasks, nowIso()));
  const forecast = s.forecasts.get(artifactId);
  if (forecast) {
    const refined = refineForecast(forecast, tasks, projectBlockerCategory(tasks));
    if (refined.forecast_reason !== forecast.forecast_reason) {
      logOpsEvent(artifactId, 'FORECAST_CHANGED', { reason: refined.forecast_reason });
    }
    s.forecasts.set(artifactId, refined);
  }
}

export function startTask(artifactId: string, taskId: string, actor = 'FOUNDER') {
  const tasks = mem.getDfMemoryState().tasks.get(artifactId) ?? [];
  const task = tasks.find((t) => t.task_id === taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  if (task.status !== 'READY') throw new Error('TASK_NOT_READY');
  task.status = 'IN_PROGRESS';
  task.started_at = nowIso();
  task.assigned_actor = actor;
  logOpsEvent(artifactId, 'TASK_STARTED', { task_id: taskId });
  syncDerivedState(artifactId);
  return task;
}

export function completeTask(artifactId: string, taskId: string, metadata: Record<string, unknown> = {}) {
  const tasks = mem.getDfMemoryState().tasks.get(artifactId) ?? [];
  const task = tasks.find((t) => t.task_id === taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  task.result_metadata = { ...task.result_metadata, ...metadata };
  if (task.execution_mode === 'VERIFICATION') {
    task.status = 'READY_TO_VERIFY';
    logOpsEvent(artifactId, 'TASK_EXECUTED', { task_id: taskId });
  } else {
    task.status = 'COMPLETE';
    task.completed_at = nowIso();
    logOpsEvent(artifactId, 'TASK_COMPLETED', { task_id: taskId });
  }
  syncDerivedState(artifactId);
  return task;
}

export function escalateTaskMode(
  artifactId: string,
  taskId: string,
  to: 'ASSISTED' | 'EXTERNAL_MANUAL',
  reason: string,
) {
  const tasks = mem.getDfMemoryState().tasks.get(artifactId) ?? [];
  const task = tasks.find((t) => t.task_id === taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  task.execution_mode = to;
  task.internal_notes = reason;
  task.blocker_category = to === 'EXTERNAL_MANUAL' ? 'MANUAL_REVIEW' : 'PROVIDER_ERROR';
  logOpsEvent(artifactId, 'PROVIDER_HANDOFF_OPENED', { task_id: taskId, mode: to, reason });
  syncDerivedState(artifactId);
  return task;
}

export function runTaskVerification(
  artifactId: string,
  taskId: string,
  pass: boolean,
  observed?: { current_value?: string },
) {
  const s = mem.getDfMemoryState();
  const tasks = s.tasks.get(artifactId) ?? [];
  const task = tasks.find((t) => t.task_id === taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  const rules = (s.verificationRules.get(artifactId) ?? []).filter((r) => r.task_id === taskId);
  logOpsEvent(artifactId, 'TASK_VERIFICATION_STARTED', { task_id: taskId });
  const results = s.verificationResults.get(artifactId) ?? [];
  for (const rule of rules) {
    const result = evaluateVerificationRule(rule, { pass, current_value: observed?.current_value });
    results.push(result);
    if (result.status === 'PASS') {
      task.status = 'VERIFIED';
      task.verified_at = nowIso();
      logOpsEvent(artifactId, 'TASK_VERIFIED', { task_id: taskId, rule_id: rule.rule_id });
    } else {
      task.status = 'FAILED';
      task.blocker_category = 'TECHNICAL_CONFLICT';
      task.blocked_reason = result.detail ?? 'Verification failed';
      logOpsEvent(artifactId, 'TASK_VERIFICATION_FAILED', { task_id: taskId });
    }
  }
  s.verificationResults.set(artifactId, results);
  if (task.status === 'VERIFIED') task.status = 'COMPLETE';
  syncDerivedState(artifactId);
  return task;
}

export function setBlocker(artifactId: string, taskId: string, category: import('../../../shared/site00-digital-foundation/operations/types.js').BlockerCategory, reason: string) {
  const tasks = mem.getDfMemoryState().tasks.get(artifactId) ?? [];
  const task = tasks.find((t) => t.task_id === taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  task.status = 'BLOCKED';
  task.blocker_category = category;
  task.blocked_reason = reason;
  logOpsEvent(artifactId, 'TASK_BLOCKED', { task_id: taskId, category });
  syncDerivedState(artifactId);
  return task;
}

export function addManualVerificationOverride(artifactId: string, ruleId: string, reason: string, actor: string) {
  const s = mem.getDfMemoryState();
  const list = s.verificationOverrides.get(artifactId) ?? [];
  list.push({ artifact_id: artifactId, rule_id: ruleId, reason, actor, created_at: nowIso() });
  s.verificationOverrides.set(artifactId, list);
  return list;
}

export function getProjectCommandSnapshot(artifactId: string): ProjectCommandSnapshot {
  const s = mem.getDfMemoryState();
  const artifact = memGetArtifact(artifactId)!;
  const lead = memGetLead(artifact.lead_id)!;
  return {
    artifact,
    lead,
    purchased_scope: artifact.quote_id ? memGetQuote(artifact.quote_id) ?? null : null,
    runbook: s.runbooks.get(artifactId) ?? null,
    tasks: s.tasks.get(artifactId) ?? [],
    stages: s.stages.get(artifactId) ?? [],
    client_actions: s.clientActions.get(artifactId) ?? [],
    approvals: s.approvals.get(artifactId) ?? [],
    blockers: extractBlockers(s.tasks.get(artifactId) ?? []),
    forecast: s.forecasts.get(artifactId) ?? null,
    ownership_record: s.ownership.get(artifactId) ?? null,
    verification_results: s.verificationResults.get(artifactId) ?? [],
  };
}

export function getPipelineView() {
  const s = mem.getDfMemoryState();
  const artifacts = listArtifacts();
  const tasksByArtifact = s.tasks;
  const rows = buildPipelineRows({
    artifacts,
    leads: s.leads,
    quotes: s.quotes,
    referrals: s.referralSources,
    tasksByArtifact,
    forecasts: s.forecasts,
    credits: s.credits,
  });
  return { rows, attention: pipelineAttentionQueries(rows) };
}

export function getWorkbenchView(artifactId: string) {
  const tasks = mem.getDfMemoryState().tasks.get(artifactId) ?? [];
  return {
    buckets: groupWorkbenchTasks(tasks),
    by_mode: tasksByMode(tasks),
    command: projectCommandAnswers(getProjectCommandSnapshot(artifactId)),
  };
}

export function assessArtifactCompletion(artifactId: string) {
  const s = mem.getDfMemoryState();
  const overrides = new Set((s.verificationOverrides.get(artifactId) ?? []).map((o) => o.rule_id));
  return assessCompletionGate({
    runbook: s.runbooks.get(artifactId) ?? null,
    tasks: s.tasks.get(artifactId) ?? [],
    rules: s.verificationRules.get(artifactId) ?? [],
    verification_results: s.verificationResults.get(artifactId) ?? [],
    approvals: s.approvals.get(artifactId) ?? [],
    manual_overrides: overrides,
    ownership_present: Boolean(s.ownership.get(artifactId)),
  });
}

export function prepareOwnershipFromOperations(artifactId: string) {
  const a = memGetArtifact(artifactId)!;
  const s = mem.getDfMemoryState();
  const record = generateOwnershipRecordFromOperations({
    artifact: a,
    intake: a.intake,
    tasks: s.tasks.get(artifactId) ?? [],
    verification_results: s.verificationResults.get(artifactId) ?? [],
    project_config: getProjectConfig(artifactId),
  });
  s.ownership.set(artifactId, record);
  return record;
}

export function setProjectProviders(
  artifactId: string,
  patch: { email_provider_id?: string; dns_provider_id?: string; domain_registrar_id?: string },
) {
  const cfg = getProjectConfig(artifactId);
  Object.assign(cfg, patch);
  generateRunbookForArtifact(artifactId, { supersede: true });
  return cfg;
}
