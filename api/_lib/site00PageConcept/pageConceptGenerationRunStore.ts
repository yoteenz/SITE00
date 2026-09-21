/**
 * In-memory server run store — survives client disconnect; not tied to fetch AbortSignal.
 */

import type { PageConceptServerRun, PageConceptRunProgress } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';

const runs = new Map<string, PageConceptServerRun>();

const MAX_RUNS = 200;

function pruneOldRuns(): void {
  if (runs.size <= MAX_RUNS) return;
  const sorted = [...runs.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const run of sorted.slice(0, runs.size - MAX_RUNS)) {
    runs.delete(run.runId);
  }
}

export function putPageConceptServerRun(run: PageConceptServerRun): void {
  runs.set(run.runId, run);
  pruneOldRuns();
}

export function getPageConceptServerRun(runId: string): PageConceptServerRun | null {
  return runs.get(runId) ?? null;
}

export function patchPageConceptServerRun(runId: string, patch: PageConceptRunProgress): PageConceptServerRun | null {
  const current = runs.get(runId);
  if (!current) return null;
  const next: PageConceptServerRun = {
    ...current,
    ...patch,
    plan: patch.plan ?? current.plan,
    pipelineSet: patch.pipelineSet ?? current.pipelineSet,
    jobs: patch.jobs ?? current.jobs,
    cgptMeta: patch.cgptMeta !== undefined ? patch.cgptMeta : current.cgptMeta,
    panelProgress: patch.panelProgress !== undefined ? patch.panelProgress : current.panelProgress,
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
  };
  runs.set(runId, next);
  return next;
}

export function listPageConceptServerRunsForPage(projectId: string, pageId: string): PageConceptServerRun[] {
  return [...runs.values()].filter((r) => r.projectId === projectId && r.pageId === pageId);
}

/** Test-only */
export function clearPageConceptServerRuns(): void {
  runs.clear();
}
