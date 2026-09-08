/**
 * B5.9R2 — Build project index items from canonical API entries.
 */

import type { Site00ProjectIndexEntry } from './types.js';
import { buildProjectCapabilityManifest } from './projectCapabilityManifest.js';
import { buildProjectIndexItem, type ProjectIndexItem } from './projectIndexItem.js';
import { projectModulePath } from './projectModules.js';
import { resolveProjectIndexVisual } from './projectIndexVisual.js';
import { CANONICAL_SITE00_DESIGN_ROUTE } from '../site00-studio-world-production/visualReconstruction/p0vr3m/constants.js';

export const SITE00_PLATFORM_DESIGN_PROJECT_ID = 'site00';

export function isSite00PlatformDesignIndexItem(item: ProjectIndexItem): boolean {
  return (
    item.projectId === SITE00_PLATFORM_DESIGN_PROJECT_ID &&
    item.openRoute.startsWith(CANONICAL_SITE00_DESIGN_ROUTE)
  );
}

/** Pinned founder entry — SITE 00 self-design workspace (not a managed brand project). */
export function buildSite00PlatformDesignIndexItem(): ProjectIndexItem {
  const manifest = buildProjectCapabilityManifest({
    projectId: SITE00_PLATFORM_DESIGN_PROJECT_ID,
    organizationId: SITE00_PLATFORM_DESIGN_PROJECT_ID,
    projectType: 'HOST PLATFORM',
    projectClassification: 'SITE 00 PLATFORM',
    entitledCapabilities: ['BUILDER', 'WEBSITE_PRODUCTION', 'IDENTITY', 'EVOLVE', 'PRODUCTION'],
    internalProject: true,
    clientFacing: false,
    founderManaged: true,
    currentPhase: 'DESIGN WORKSPACE ACTIVE',
    lifecycle: 'LIVE',
  });
  const enabledModules = manifest.enabledModules.filter((m) => m !== 'MORE');
  const visual = resolveProjectIndexVisual(SITE00_PLATFORM_DESIGN_PROJECT_ID, 'SITE 00');

  return {
    projectId: SITE00_PLATFORM_DESIGN_PROJECT_ID,
    projectName: 'SITE 00',
    projectType: 'DESIGN WORKSPACE',
    projectClassification: 'SITE 00 PLATFORM',
    projectImage: visual.imageUrl,
    projectInitials: visual.initials,
    projectCapabilityManifest: manifest,
    primaryModule: 'BUILDER',
    enabledModules,
    secondaryModuleCount: Math.max(0, enabledModules.length - 2),
    ownerType: 'FOUNDER',
    clientName: null,
    currentPhase: 'DESIGN WORKSPACE OWNER · SELF-DESIGN ENABLED',
    status: 'ACTIVE',
    statusDot: 'green',
    progress: {
      percent: null,
      label: 'EDIT ENTIRE WEBSITE',
      confidence: 'HIGH',
    },
    currentFocus: 'DESIGN WORKSPACE · ALL ROUTES & SCREENS',
    lastUpdatedAt: null,
    lastUpdatedLabel: 'ALWAYS AVAILABLE',
    needsReviewCount: 0,
    activeTaskCount: 0,
    isArchived: false,
    isOnHold: false,
    clientFacing: false,
    internalProject: true,
    openRoute: CANONICAL_SITE00_DESIGN_ROUTE,
    descriptor: 'SITE 00 PLATFORM · WEBSITE DESIGN AUTHORITY',
    repositorySlug: null,
    repositoryStatus: null,
    commitsAhead: null,
    openPullRequests: null,
  };
}

export function buildProjectIndexItemsFromEntries(
  entries: Site00ProjectIndexEntry[],
): ProjectIndexItem[] {
  return entries.map((entry) => {
    const item = buildProjectIndexItem(entry, {
      ownerType: entry.classification.includes('CLIENT') ? 'CLIENT' : 'FOUNDER',
      openRoute: projectModulePath(entry.slug, 'OVERVIEW'),
    });
    return item;
  });
}

export function buildClientProjectIndexItems(
  clientProjects: Array<{ id: string; slug: string; name: string; studioRoute: string }>,
): ProjectIndexItem[] {
  return clientProjects.map((p) => {
    const syntheticEntry: Site00ProjectIndexEntry = {
      slug: p.slug,
      name: p.name,
      displayName: p.name,
      organizationSlug: p.slug,
      organizationUuid: p.id,
      classification: 'CLIENT_PROJECT',
      currentSystem: 'CLIENT STUDIO',
      currentPhase: 'IN PROGRESS',
      focusNow: null,
      lastActivity: null,
      surfaces: [],
      detailRoute: p.studioRoute,
    };
    return buildProjectIndexItem(syntheticEntry, {
      ownerType: 'CLIENT',
      openRoute: p.studioRoute,
    });
  });
}
