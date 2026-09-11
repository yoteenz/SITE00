/**
 * P0.VR.AUTH.1 — Apply founder-approved authority versions into canonical registry (without re-seeding pilot).
 */

import {
  getActiveCanonicalReference,
  promoteVisualImplementationCanon,
  registerCanonicalVisualReference,
} from '../p0vr2/canonicalReferenceRegistry.js';
import { CANONICAL_VIEWPORT_DIMENSIONS } from '../p0vr2/constants.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import {
  getCurrentDesignAuthorityVersion,
  hydrateDesignAuthorityVersionsFromStorage,
  listCurrentDesignAuthorityVersionsForProject,
} from './designAuthorityVersion.js';

export function syncFounderAuthorityVersionIntoRegistry(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  route: string;
  viewport: DesignViewportClass;
}): boolean {
  hydrateDesignAuthorityVersionsFromStorage();
  const version = getCurrentDesignAuthorityVersion(input.projectId, input.pageId, input.viewport);
  if (!version || version.status !== 'CURRENT') return false;

  const assetRef = version.assetRef || version.storagePath;
  if (!assetRef) return false;

  const viewport = CANONICAL_VIEWPORT_DIMENSIONS[input.viewport];
  const existing = getActiveCanonicalReference(input.projectId, input.screenId, input.viewport);

  const reference = registerCanonicalVisualReference({
    projectId: input.projectId,
    screenId: input.screenId,
    route: version.route || input.route,
    viewportClass: input.viewport,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    scope: 'FULL_SCREEN_REFERENCE',
    scopeTargetId: input.screenId,
    assetId: `${input.screenId}-${input.viewport}-founder-current`,
    storagePath: assetRef,
    createdBy: 'founder-authority-sync',
    supersedes: existing?.referenceId ?? null,
    status: 'ACTIVE_CANONICAL',
  });

  promoteVisualImplementationCanon({
    projectId: input.projectId,
    screenId: input.screenId,
    route: version.route || input.route,
    viewportClass: input.viewport,
    referenceId: reference.referenceId,
    referenceVersion: reference.version,
    implementationVersion: 'P0.VR.AUTH.1',
    visualScore: 1,
    renderSnapshotPath: null,
    approvalDate: version.approvedAt ?? new Date().toISOString(),
    founderJudgment: 'MATCHES',
  });

  return true;
}

export function syncAllFounderAuthorityVersionsForProject(projectId: string): number {
  hydrateDesignAuthorityVersionsFromStorage();
  let count = 0;
  for (const version of listCurrentDesignAuthorityVersionsForProject(projectId)) {
    const synced = syncFounderAuthorityVersionIntoRegistry({
      projectId: version.projectId,
      pageId: version.pageId,
      screenId: version.screenId,
      route: version.route,
      viewport: version.viewport,
    });
    if (synced) count += 1;
  }
  return count;
}
