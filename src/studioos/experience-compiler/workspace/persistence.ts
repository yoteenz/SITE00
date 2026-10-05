import type { ExperienceCompilerWorkspaceState } from './types';

const KEY_PREFIX = 'site00:experience-compiler:';

export function loadWorkspaceState(projectSlug: string): ExperienceCompilerWorkspaceState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + projectSlug.toLowerCase());
    if (!raw) return null;
    return JSON.parse(raw) as ExperienceCompilerWorkspaceState;
  } catch {
    return null;
  }
}

export function saveWorkspaceState(projectSlug: string, state: ExperienceCompilerWorkspaceState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY_PREFIX + projectSlug.toLowerCase(), JSON.stringify(state));
}

export function clearWorkspaceState(projectSlug: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(KEY_PREFIX + projectSlug.toLowerCase());
}

export function persistWorkspace(state: ExperienceCompilerWorkspaceState): void {
  saveWorkspaceState(state.project_slug, state);
}
