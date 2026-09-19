/**
 * P0.VR.8R3R1 — Project capture run store (persisted + in-memory active pointer).
 */

import {
  loadCaptureOrchestrationRegistry,
  mutateCaptureOrchestrationRegistry,
  type PageCaptureTarget,
  type PersistedCaptureRun,
} from './captureRunPersistentStore.js';
import type { ProjectCaptureRunContractStatus } from './projectCaptureRunContract.js';

export type { PageCaptureTarget, PersistedCaptureRun };

export function bootstrapCaptureRunStore(repoRoot?: string): void {
  loadCaptureOrchestrationRegistry(repoRoot);
}

export function createProjectCaptureRun(run: PersistedCaptureRun, repoRoot?: string): PersistedCaptureRun {
  mutateCaptureOrchestrationRegistry((registry) => {
    registry.runs = registry.runs.filter((r) => r.runId !== run.runId);
    registry.runs.unshift(run);
    if (['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status)) {
      registry.activeRunByProject[run.projectId] = run.runId;
    }
  }, repoRoot);
  return run;
}

export function updateProjectCaptureRun(
  runId: string,
  patch: Partial<PersistedCaptureRun>,
  repoRoot?: string,
): PersistedCaptureRun | null {
  let updated: PersistedCaptureRun | null = null;
  mutateCaptureOrchestrationRegistry((registry) => {
    const idx = registry.runs.findIndex((r) => r.runId === runId);
    if (idx < 0) return;
    updated = { ...registry.runs[idx]!, ...patch, updatedAt: new Date().toISOString() };
    registry.runs[idx] = updated;
    if (['COMPLETE', 'PARTIAL', 'FAILED', 'INVALID'].includes(updated.status)) {
      if (registry.activeRunByProject[updated.projectId] === runId) {
        delete registry.activeRunByProject[updated.projectId];
      }
    }
  }, repoRoot);
  return updated;
}

export function getProjectCaptureRun(runId: string, repoRoot?: string): PersistedCaptureRun | null {
  const registry = loadCaptureOrchestrationRegistry(repoRoot);
  return registry.runs.find((r) => r.runId === runId) ?? null;
}

export function getActiveProjectCaptureRun(projectId: string, repoRoot?: string): PersistedCaptureRun | null {
  const registry = loadCaptureOrchestrationRegistry(repoRoot);
  const runId = registry.activeRunByProject[projectId];
  if (!runId) return null;
  const run = registry.runs.find((r) => r.runId === runId);
  if (!run || !['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status)) {
    mutateCaptureOrchestrationRegistry((r) => {
      delete r.activeRunByProject[projectId];
    }, repoRoot);
    return null;
  }
  return run;
}

export function listProjectCaptureRuns(projectId: string, limit = 20, repoRoot?: string): PersistedCaptureRun[] {
  const registry = loadCaptureOrchestrationRegistry(repoRoot);
  return registry.runs.filter((r) => r.projectId === projectId).slice(0, limit);
}

export function markProjectCaptureRunInvalid(runId: string, reason: string, repoRoot?: string): PersistedCaptureRun | null {
  return updateProjectCaptureRun(
    runId,
    {
      status: 'INVALID' as ProjectCaptureRunContractStatus,
      lastError: reason,
      invalidReason: reason,
      contractValid: false,
      completedAt: new Date().toISOString(),
    },
    repoRoot,
  );
}

export function upsertCaptureTargets(targets: PageCaptureTarget[], repoRoot?: string): void {
  mutateCaptureOrchestrationRegistry((registry) => {
    for (const target of targets) {
      const idx = registry.targets.findIndex((t) => t.targetId === target.targetId);
      if (idx >= 0) registry.targets[idx] = target;
      else registry.targets.push(target);
    }
  }, repoRoot);
}

export function listCaptureTargets(runId: string, repoRoot?: string): PageCaptureTarget[] {
  return loadCaptureOrchestrationRegistry(repoRoot).targets.filter((t) => t.runId === runId);
}

export function updateCaptureTarget(
  targetId: string,
  patch: Partial<PageCaptureTarget>,
  repoRoot?: string,
): PageCaptureTarget | null {
  let updated: PageCaptureTarget | null = null;
  mutateCaptureOrchestrationRegistry((registry) => {
    const idx = registry.targets.findIndex((t) => t.targetId === targetId);
    if (idx < 0) return;
    updated = { ...registry.targets[idx]!, ...patch };
    registry.targets[idx] = updated;
  }, repoRoot);
  return updated;
}

export function persistCaptureJobs(
  jobs: Array<import('../p0vr8/types.js').PageCaptureQueueJob & { runId?: string; targetId?: string }>,
  repoRoot?: string,
): void {
  mutateCaptureOrchestrationRegistry((registry) => {
    const runIds = new Set(jobs.map((j) => j.runId).filter(Boolean));
    registry.jobs = registry.jobs.filter((j) => !runIds.has(j.runId)).concat(jobs);
  }, repoRoot);
}

export function listPersistedCaptureJobs(projectId: string, runId?: string, repoRoot?: string) {
  return loadCaptureOrchestrationRegistry(repoRoot).jobs.filter(
    (j) => j.projectId === projectId && (!runId || j.runId === runId),
  );
}

export function clearProjectCaptureRunsForTest(): void {
  mutateCaptureOrchestrationRegistry((registry) => {
    registry.runs = [];
    registry.targets = [];
    registry.jobs = [];
    registry.events = [];
    registry.dispatchReceipts = [];
    registry.activeRunByProject = {};
  });
}
