/**
 * NDXBOOK Project Workspace hero proof — in-memory store (Vitest + dev).
 */

import type { ProjectWorkspaceHeroRun } from '../../../../../shared/site00-brand-lore/projectWorkspace/types.js';

const runs = new Map<string, ProjectWorkspaceHeroRun>();

export function getProjectWorkspaceHeroRun(projectId: string): ProjectWorkspaceHeroRun | null {
  return runs.get(projectId) ?? null;
}

export function saveProjectWorkspaceHeroRun(run: ProjectWorkspaceHeroRun): ProjectWorkspaceHeroRun {
  runs.set(run.projectId, run);
  return run;
}

export function resetProjectWorkspaceHeroMemory(): void {
  runs.clear();
}
