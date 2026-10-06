/**
 * ACTIVE PROJECT (one of the two workspace state dimensions; the other is the tab).
 *
 * Resolution: URL (path slug or `?project=`) → the project the founder last chose → NONE. There is no default
 * project: with NONE the workspace renders a project picker, never another project's data. Whenever the URL names
 * a project it becomes the remembered choice, so hard refresh / back / forward / direct links all stay on it.
 */
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { projectFromUrl, resolveActiveProject } from '../../../shared/site00-production-graph/projectScope.js';

const KEY = 'site00.production.active-project.v1';

export function readStoredActiveProject(): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writeStoredActiveProject(projectId: string): void {
  try {
    window.localStorage.setItem(KEY, projectId.toLowerCase());
  } catch {
    /* storage unavailable */
  }
}

/** The active project for the current URL (null = none chosen). Remembers a project the URL names. */
export function useActiveProjectId(): string | null {
  const { pathname, search } = useLocation();
  const fromUrl = projectFromUrl(pathname, search);
  useEffect(() => {
    if (fromUrl) writeStoredActiveProject(fromUrl);
  }, [fromUrl]);
  return useMemo(() => resolveActiveProject({ pathname, search, stored: fromUrl ? null : readStoredActiveProject() }), [pathname, search, fromUrl]);
}
