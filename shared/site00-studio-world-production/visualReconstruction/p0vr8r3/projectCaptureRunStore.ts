/**
 * P0.VR.8R3 — In-memory project capture run history + active run tracking.
 */

import type { ProjectCaptureRun } from './types.js';

const runs = new Map<string, ProjectCaptureRun>();
const activeRunByProject = new Map<string, string>();

export function createProjectCaptureRun(run: ProjectCaptureRun): ProjectCaptureRun {
  runs.set(run.captureRefreshRunId, run);
  if (['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status)) {
    activeRunByProject.set(run.projectId, run.captureRefreshRunId);
  }
  return run;
}

export function updateProjectCaptureRun(
  runId: string,
  patch: Partial<ProjectCaptureRun>,
): ProjectCaptureRun | null {
  const existing = runs.get(runId);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  runs.set(runId, updated);
  if (['COMPLETE', 'PARTIAL', 'FAILED'].includes(updated.status)) {
    if (activeRunByProject.get(updated.projectId) === runId) {
      activeRunByProject.delete(updated.projectId);
    }
  }
  return updated;
}

export function getProjectCaptureRun(runId: string): ProjectCaptureRun | null {
  return runs.get(runId) ?? null;
}

export function getActiveProjectCaptureRun(projectId: string): ProjectCaptureRun | null {
  const runId = activeRunByProject.get(projectId);
  if (!runId) return null;
  const run = runs.get(runId);
  if (!run || !['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status)) {
    activeRunByProject.delete(projectId);
    return null;
  }
  return run;
}

export function listProjectCaptureRuns(projectId: string, limit = 20): ProjectCaptureRun[] {
  return [...runs.values()]
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit);
}

export function clearProjectCaptureRunsForTest(): void {
  runs.clear();
  activeRunByProject.clear();
}
