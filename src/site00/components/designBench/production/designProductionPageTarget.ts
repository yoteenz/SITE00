/**
 * P0.VR.DESIGN-INTEGRATION1 + P0.VR.DESIGN-PROJECT-BINDING1R1 — active page target in DESIGN.
 */

import type { DesignPageDesignStatus } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/types.js';

export type DesignProductionPageTarget = {
  pageId: string;
  screenId: string;
  entryId: string;
  pageLabel: string;
  surfaceLabel: string;
  route: string;
  pageRole: string;
  designStatus: DesignPageDesignStatus;
};

const STORAGE_PREFIX = 'site00:design-production:page-target:v2:';

export function readDesignPageTarget(projectSlug: string): DesignProductionPageTarget | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${projectSlug.toLowerCase()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DesignProductionPageTarget;
    if (!parsed.pageId || !parsed.pageLabel) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDesignPageTarget(projectSlug: string, target: DesignProductionPageTarget): void {
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${projectSlug.toLowerCase()}`, JSON.stringify(target));
    window.dispatchEvent(new CustomEvent('site00:design-page-target', { detail: { projectSlug } }));
  } catch {
    /* session preference */
  }
}

export function clearDesignPageTarget(projectSlug: string): void {
  try {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${projectSlug.toLowerCase()}`);
    window.dispatchEvent(new CustomEvent('site00:design-page-target', { detail: { projectSlug } }));
  } catch {
    /* session preference */
  }
}

export function designPageTargetLines(target: DesignProductionPageTarget): readonly string[] {
  return [target.pageLabel.toUpperCase(), target.pageRole.replace(/_/g, ' '), target.route];
}
