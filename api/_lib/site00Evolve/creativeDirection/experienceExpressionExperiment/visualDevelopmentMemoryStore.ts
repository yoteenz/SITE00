/**
 * In-memory store for visual development runs.
 */

import type { ProjectWorkspaceVisualDevelopmentRun } from '../../../../../shared/site00-brand-lore/experienceExpression/designProofTypes.js';

let run: ProjectWorkspaceVisualDevelopmentRun | null = null;

export function getVisualDevelopmentRun(): ProjectWorkspaceVisualDevelopmentRun | null {
  return run;
}

export function saveVisualDevelopmentRun(next: ProjectWorkspaceVisualDevelopmentRun): ProjectWorkspaceVisualDevelopmentRun {
  run = next;
  return run;
}

export function resetVisualDevelopmentMemory(): void {
  run = null;
}
