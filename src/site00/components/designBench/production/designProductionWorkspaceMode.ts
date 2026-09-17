/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — project overview vs page workspace surface.
 */

import type { DesignWorkspaceSurface } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/types.js';

const STORAGE_PREFIX = 'site00:design-workspace-surface:v1:';

export function readDesignWorkspaceSurface(projectSlug: string): DesignWorkspaceSurface {
  if (typeof window === 'undefined') return 'project-overview';
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${projectSlug.toLowerCase()}`);
    if (raw === 'page-workspace' || raw === 'project-overview') return raw;
    return 'project-overview';
  } catch {
    return 'project-overview';
  }
}

export function writeDesignWorkspaceSurface(projectSlug: string, surface: DesignWorkspaceSurface): void {
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${projectSlug.toLowerCase()}`, surface);
    window.dispatchEvent(new CustomEvent('site00:design-workspace-surface', { detail: { projectSlug } }));
  } catch {
    /* session preference */
  }
}
