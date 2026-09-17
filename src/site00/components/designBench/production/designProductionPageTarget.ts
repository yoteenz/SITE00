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

/** Approved twin TARGET band default (concept workspace — not a live site page row). */
export function defaultConceptPageTargetForShell(projectSlug: string): DesignProductionPageTarget {
  const slug = projectSlug.toLowerCase();
  return {
    pageId: `${slug}:entry-001-concept`,
    screenId: 'entry-001-concept',
    entryId: 'ENTRY-001',
    pageLabel: 'ENTRY COVER',
    surfaceLabel: 'HOMEPAGE HERO',
    route: `/projects/${slug}`,
    pageRole: 'CONCEPT_CANDIDATE',
    designStatus: 'IN_REVIEW',
  };
}

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

/** Matches pre–PROJECT-BINDING1R1 TARGET band copy geometry. */
export function designPageTargetLines(target: DesignProductionPageTarget): readonly string[] {
  return [target.entryId.replace(/-/g, ' '), target.pageLabel, target.surfaceLabel];
}

export function resolveDesignPageTargetForShell(projectSlug: string): DesignProductionPageTarget {
  return readDesignPageTarget(projectSlug) ?? defaultConceptPageTargetForShell(projectSlug);
}
