/**
 * P0.VR.DESIGN-INTEGRATION1 + P0.VR.DESIGN-PROJECT-BINDING1R1 — active page target in DESIGN.
 * P0.VR.DESIGN-PAGE-CONCEPT-MODEL1 — default active target is a real site page (Overview), not a campaign entry.
 */

import type { DesignPageDesignStatus } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/types.js';
import { getDesignBoundPageByScreen } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageRegistry.js';
import { buildDesignProjectIntelligence } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/projectIntelligence.js';

export type DesignProductionPageTarget = {
  pageId: string;
  screenId: string;
  /** TARGET band line 1 — project display (not campaign entry id). */
  entryId: string;
  pageLabel: string;
  surfaceLabel: string;
  route: string;
  pageRole: string;
  designStatus: DesignPageDesignStatus;
};

const STORAGE_PREFIX = 'site00:design-production:page-target:v2:';

const LEGACY_CAMPAIGN_AS_PAGE_SCREEN = 'entry-001-concept';

function projectLineForSlug(projectSlug: string): string {
  const slug = projectSlug.toLowerCase();
  const intel = buildDesignProjectIntelligence(slug);
  return intel?.displayName ?? slug.toUpperCase();
}

/** Default DESIGN workspace target: project Overview page. */
export function defaultDesignPageTargetForShell(projectSlug: string): DesignProductionPageTarget {
  const slug = projectSlug.toLowerCase();
  const overviewPage = getDesignBoundPageByScreen(slug, 'overview');
  return {
    pageId: overviewPage?.pageId ?? `${slug}:overview`,
    screenId: 'overview',
    entryId: projectLineForSlug(slug),
    pageLabel: overviewPage?.pageName.toUpperCase() ?? 'OVERVIEW',
    surfaceLabel: 'PROJECT OVERVIEW',
    route: overviewPage?.route ?? `/projects/${slug}`,
    pageRole: 'PROJECT_OVERVIEW',
    designStatus: overviewPage?.designStatus ?? 'APPROVED',
  };
}

/** @deprecated Use defaultDesignPageTargetForShell — kept for tests importing legacy name. */
export const defaultConceptPageTargetForShell = defaultDesignPageTargetForShell;

function isLegacyCampaignPageTarget(target: DesignProductionPageTarget): boolean {
  return (
    target.screenId === LEGACY_CAMPAIGN_AS_PAGE_SCREEN
    || target.pageId.includes(LEGACY_CAMPAIGN_AS_PAGE_SCREEN)
    || target.entryId === 'ENTRY-001'
  );
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

/** TARGET band: project · page · page role (not campaign entry cover). */
export function designPageTargetLines(target: DesignProductionPageTarget): readonly string[] {
  return [
    target.entryId.replace(/-/g, ' '),
    target.pageLabel,
    target.surfaceLabel,
  ];
}

export function resolveDesignPageTargetForShell(projectSlug: string): DesignProductionPageTarget {
  const stored = readDesignPageTarget(projectSlug);
  if (stored) {
    if (isLegacyCampaignPageTarget(stored)) {
      const migrated = defaultDesignPageTargetForShell(projectSlug);
      writeDesignPageTarget(projectSlug, migrated);
      return migrated;
    }
    return stored;
  }
  return defaultDesignPageTargetForShell(projectSlug);
}
