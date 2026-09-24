/**
 * Hybrid run store — in-memory hot path + Supabase durability for Railway restarts.
 */

import { appendPageConceptProgressEvents } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProgressEvents.js';
import type { PageConceptServerRun, PageConceptRunProgress } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import {
  findActivePageConceptServerRunForPage,
  loadPageConceptServerRunDurable,
  upsertPageConceptServerRunDurable,
} from './pageConceptGenerationRunSupabaseStore.js';

const runs = new Map<string, PageConceptServerRun>();

const MAX_RUNS = 200;

function pruneOldRuns(): void {
  if (runs.size <= MAX_RUNS) return;
  const sorted = [...runs.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const run of sorted.slice(0, runs.size - MAX_RUNS)) {
    runs.delete(run.runId);
  }
}

function scheduleDurablePersist(run: PageConceptServerRun): void {
  void upsertPageConceptServerRunDurable(run).catch(() => undefined);
}

export function putPageConceptServerRun(run: PageConceptServerRun): void {
  runs.set(run.runId, run);
  pruneOldRuns();
  scheduleDurablePersist(run);
}

export function getPageConceptServerRun(runId: string): PageConceptServerRun | null {
  return runs.get(runId) ?? null;
}

export async function hydratePageConceptServerRun(runId: string): Promise<PageConceptServerRun | null> {
  const cached = runs.get(runId);
  if (cached) return cached;
  const durable = await loadPageConceptServerRunDurable(runId);
  if (durable) {
    runs.set(runId, durable);
    return durable;
  }
  return null;
}

export async function resolvePageConceptServerRun(input: {
  runId: string;
  projectId?: string;
  pageId?: string;
}): Promise<PageConceptServerRun | null> {
  const fromMemory = runs.get(input.runId);
  if (fromMemory) return fromMemory;

  const fromDurable = await loadPageConceptServerRunDurable(input.runId);
  if (fromDurable) {
    runs.set(fromDurable.runId, fromDurable);
    return fromDurable;
  }

  if (input.projectId && input.pageId) {
    const active = await findActivePageConceptServerRunForPage({
      projectId: input.projectId,
      pageId: input.pageId,
    });
    if (active) {
      runs.set(active.runId, active);
      return active;
    }
  }
  return null;
}

export async function ensurePageConceptServerRunInMemory(runId: string): Promise<PageConceptServerRun | null> {
  const cached = getPageConceptServerRun(runId);
  if (cached) return cached;
  const hydrated = await hydratePageConceptServerRun(runId);
  if (hydrated) {
    putPageConceptServerRun(hydrated);
    return hydrated;
  }
  return null;
}

/** Hydrate from durable store when missing from memory (Railway multi-instance / restart). */
export async function patchPageConceptServerRunDurable(
  runId: string,
  patch: PageConceptRunProgress,
): Promise<PageConceptServerRun | null> {
  await ensurePageConceptServerRunInMemory(runId);
  return patchPageConceptServerRun(runId, patch);
}

export function patchPageConceptServerRun(runId: string, patch: PageConceptRunProgress): PageConceptServerRun | null {
  const current = runs.get(runId);
  if (!current) return null;
  const { events, latestProgressSequence } = appendPageConceptProgressEvents(current, patch);
  const next: PageConceptServerRun = {
    ...current,
    ...patch,
    plan: patch.plan ?? current.plan,
    pipelineSet: patch.pipelineSet ?? current.pipelineSet,
    jobs: patch.jobs ?? current.jobs,
    cgptMeta: patch.cgptMeta !== undefined ? patch.cgptMeta : current.cgptMeta,
    panelProgress: patch.panelProgress !== undefined ? patch.panelProgress : current.panelProgress,
    cgptSubsteps: patch.cgptSubsteps !== undefined ? patch.cgptSubsteps : current.cgptSubsteps,
    progressEvents: events,
    latestProgressSequence,
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
  };
  runs.set(runId, next);
  scheduleDurablePersist(next);
  return next;
}

export function listPageConceptServerRunsForPage(projectId: string, pageId: string): PageConceptServerRun[] {
  return [...runs.values()].filter((r) => r.projectId === projectId && r.pageId === pageId);
}

/** Test-only */
export function clearPageConceptServerRuns(): void {
  runs.clear();
}
