/**
 * P0.VR.DESIGN-INTEGRATION1 — founder page target selection (PAGES surface).
 * TARGET band on the main workspace stays readonly; switching happens on PAGES.
 */

export type DesignProductionPageTarget = {
  entryId: string;
  pageLabel: string;
  surfaceLabel: string;
};

const STORAGE_PREFIX = 'site00:design-production:page-target:v1:';

export const DEFAULT_DESIGN_PAGE_TARGET: DesignProductionPageTarget = {
  entryId: 'ENTRY-001',
  pageLabel: 'ENTRY COVER',
  surfaceLabel: 'HOMEPAGE HERO',
};

export function readDesignPageTarget(projectSlug: string): DesignProductionPageTarget {
  if (typeof window === 'undefined') return DEFAULT_DESIGN_PAGE_TARGET;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${projectSlug.toLowerCase()}`);
    if (!raw) return DEFAULT_DESIGN_PAGE_TARGET;
    const parsed = JSON.parse(raw) as DesignProductionPageTarget;
    if (!parsed.entryId || !parsed.pageLabel || !parsed.surfaceLabel) return DEFAULT_DESIGN_PAGE_TARGET;
    return parsed;
  } catch {
    return DEFAULT_DESIGN_PAGE_TARGET;
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

export function designPageTargetLines(target: DesignProductionPageTarget): readonly string[] {
  return [target.entryId.replace(/-/g, ' '), target.pageLabel, target.surfaceLabel];
}
