/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — bind DESIGN to ProjectPageRegistry (P0.VR.8).
 */

import { listDesignScreensForProject } from '../../site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import { resolveDesignScreenRoute } from '../../site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import { registerNdxbookDesignPilot } from '../../site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import {
  listProjectPageRecords,
  reconcileProjectPageRegistry,
} from '../../site00-studio-world-production/visualReconstruction/p0vr8/projectPageRegistry.js';
import { getSite00ManagedProject } from '../../site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import type { DesignBoundPageRecord, DesignPageDesignStatus, DesignPageBuildStatus } from './types.js';

const NDX_MOBILE_REFERENCE: Record<string, string> = {
  overview: '/visual-references/founder/ndxbook/mobile-overview-fullscreen-reference-hifi.png',
  'campaign-board': '/visual-references/founder/ndxbook/mobile-campaign-board-reference-p0vr1d13.png',
  'content-ops': '/visual-references/founder/ndxbook/mobile-content-ops-fullscreen-reference.png',
  'cultural-intelligence': '/visual-references/founder/ndxbook/mobile-cultural-intelligence-fullscreen-reference.png',
  'experiment-01': '/visual-references/founder/ndxbook/mobile-lab-experiment-01-reference.png',
  'character-lab': '/visual-references/founder/ndxbook/mobile-character-lab-fullscreen-reference.png',
  'bottom-nav-icons': '/visual-references/founder/ndxbook/ndx-icon-reference-sheet-p0ui3d.jpg',
};

const NDX_DESKTOP_OVERVIEW_REF =
  '/visual-references/founder/ndxbook/desktop-overview-composite-reference.png';

const NDX_DESKTOP_REFERENCE: Partial<Record<string, string>> = {
  overview: NDX_DESKTOP_OVERVIEW_REF,
  'desktop-overview': NDX_DESKTOP_OVERVIEW_REF,
};

/** Parent map derived from NDXBOOK route structure (not invented pages). */
const NDX_PARENT_BY_SCREEN: Record<string, string | null> = {
  overview: null,
  'desktop-overview': null,
  'content-ops': null,
  'campaign-board': 'content-ops',
  'cultural-intelligence': null,
  'experiment-01': null,
  'character-lab': null,
  'bottom-nav-icons': null,
};

function inferDesignStatus(screenId: string, mirrorStatus: string): DesignPageDesignStatus {
  if (mirrorStatus === 'ROUTE_MISSING') return 'PLANNED';
  if (screenId === 'overview' || screenId === 'desktop-overview') return 'APPROVED';
  if (screenId === 'cultural-intelligence') return 'IN_REVIEW';
  if (mirrorStatus === 'STALE') return 'AMENDMENT_REQUIRED';
  if (mirrorStatus === 'CURRENT') return 'APPROVED';
  return 'DESIGN_NEEDED';
}

function inferBuildStatus(designStatus: DesignPageDesignStatus): DesignPageBuildStatus {
  if (designStatus === 'BUILT') return 'BUILT';
  if (designStatus === 'READY_TO_BUILD') return 'IN_BUILD';
  if (designStatus === 'APPROVED') return 'DESIGN';
  if (designStatus === 'IN_REVIEW' || designStatus === 'DESIGNING') return 'DESIGN';
  return 'NOT_STARTED';
}

function pageRoleForScreen(screenId: string, pageType: string): string {
  if (screenId === 'overview') return 'PROJECT_OVERVIEW';
  if (screenId === 'desktop-overview') return 'PROJECT_HUB';
  if (screenId === 'campaign-board') return 'CAMPAIGN_SURFACE';
  if (screenId === 'content-ops') return 'OPERATIONS_HUB';
  if (screenId === 'cultural-intelligence') return 'EDITORIAL_INTELLIGENCE';
  if (screenId === 'experiment-01') return 'MARKETING_EXPERIMENT';
  if (screenId === 'character-lab') return 'CHARACTER_DISCOVERY';
  if (screenId === 'bottom-nav-icons') return 'DESIGN_SYSTEM_ICONS';
  return pageType || 'PAGE';
}

export function buildProjectDesignPageRegistry(projectId: string): DesignBoundPageRecord[] {
  const managed = getSite00ManagedProject(projectId);
  if (!managed?.designEnabled) return [];

  if (projectId === 'ndxbook') {
    registerNdxbookDesignPilot();
  }

  reconcileProjectPageRegistry(projectId, { screenSetMode: 'ALL_DESIGNABLE' });
  const mirrorRecords = listProjectPageRecords(projectId, true);
  const screens = listDesignScreensForProject(projectId, true);

  const byScreen = new Map(mirrorRecords.map((r) => [r.screenId, r]));
  const rows: DesignBoundPageRecord[] = [];

  for (const screen of screens) {
    if (screen.screenId === 'desktop-overview') continue;
    const mirror = byScreen.get(screen.screenId);
    const route = resolveDesignScreenRoute(screen, projectId);
    const designStatus = inferDesignStatus(screen.screenId, mirror?.status ?? 'DISCOVERED');
    const parentScreen = NDX_PARENT_BY_SCREEN[screen.screenId] ?? null;
    const parentMirror = parentScreen ? byScreen.get(parentScreen) : null;

    rows.push({
      projectId,
      pageId: mirror?.pageId ?? `${projectId}:${screen.screenId}`,
      screenId: screen.screenId,
      pageName: screen.displayName,
      route,
      pageRole: pageRoleForScreen(screen.screenId, mirror?.pageType ?? 'PAGE'),
      parentPageId: parentMirror?.pageId ?? null,
      childPageIds: [],
      designStatus,
      buildStatus: inferBuildStatus(designStatus),
      authorityStatus:
        designStatus === 'APPROVED' ? 'AUTHORITY_RECORDED' : designStatus === 'IN_REVIEW' ? 'UNDER_REVIEW' : 'MISSING',
      designAuthorityVersion: designStatus === 'APPROVED' ? 'v1-registry' : null,
      interactionContractVersion: 'composer-freeze-v1',
      assetManifestVersion: null,
      mobilePreviewUrl: NDX_MOBILE_REFERENCE[screen.screenId] ?? null,
      desktopPreviewUrl: NDX_DESKTOP_REFERENCE[screen.screenId] ?? null,
      isConceptOrphan: false,
      mirrorStatus: mirror?.status ?? 'DISCOVERED',
    });
  }

  const byScreenId = new Map(rows.map((r) => [r.screenId, r]));
  for (const row of rows) {
    const parentScreenId = NDX_PARENT_BY_SCREEN[row.screenId];
    if (!parentScreenId) continue;
    const parent = byScreenId.get(parentScreenId);
    if (parent && !parent.childPageIds.includes(row.pageId)) {
      parent.childPageIds = [...parent.childPageIds, row.pageId];
    }
  }

  return rows.sort((a, b) => a.pageName.localeCompare(b.pageName));
}

export function getDesignBoundPage(projectId: string, pageId: string): DesignBoundPageRecord | null {
  return buildProjectDesignPageRegistry(projectId).find((p) => p.pageId === pageId) ?? null;
}

export function getDesignBoundPageByScreen(projectId: string, screenId: string): DesignBoundPageRecord | null {
  return buildProjectDesignPageRegistry(projectId).find((p) => p.screenId === screenId) ?? null;
}

/** Site pages only — campaign entries are not navigable pages. */
export function listSiteDesignPagesForProject(projectId: string): DesignBoundPageRecord[] {
  return buildProjectDesignPageRegistry(projectId).filter((p) => !p.isConceptOrphan);
}
