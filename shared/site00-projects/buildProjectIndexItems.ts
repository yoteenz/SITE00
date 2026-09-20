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
export const SITE00_PLATFORM_EXPERIENCE_DEFAULT_PROJECT_ID = 'frontal-slayer';

export function site00PlatformExperienceOpenRoute(): string {
  return `/projects/${SITE00_PLATFORM_EXPERIENCE_DEFAULT_PROJECT_ID}/experience/build-a-wig`;
}

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
    projectType: 'SITE 00 SYSTEM',
    projectClassification: 'DESIGN WORKSPACE',
    entitledCapabilities: ['BUILDER', 'WEBSITE_PRODUCTION', 'IDENTITY', 'EVOLVE', 'PRODUCTION'],
    internalProject: true,
    clientFacing: false,
    founderManaged: true,
    currentPhase: 'DESIGN WORKSPACE ACTIVE',
    lifecycle: 'LIVE',
  });
  const enabledModules = manifest.enabledModules.filter((m) => m !== 'MORE');
  const visual = resolveProjectIndexVisual(SITE00_PLATFORM_DESIGN_PROJECT_ID, 'DESIGN');

  return {
    projectId: SITE00_PLATFORM_DESIGN_PROJECT_ID,
    projectName: 'DESIGN',
    projectType: 'SITE 00 DESIGN WORKSPACE',
    projectClassification: 'SYSTEM · MASTER WORKSPACE',
    projectImage: visual.imageUrl,
    projectInitials: 'D',
    projectCapabilityManifest: manifest,
    primaryModule: 'BUILDER',
    enabledModules,
    secondaryModuleCount: Math.max(0, enabledModules.length - 1),
    ownerType: 'FOUNDER',
    clientName: null,
    currentPhase: 'DESIGN. BUILD. ITERATE.',
    status: 'ACTIVE',
    statusDot: 'green',
    progress: {
      percent: null,
      label: 'SYSTEM WORKSPACE',
      confidence: 'HIGH',
    },
    currentFocus: 'WEBSITE(S) · SITE 00',
    lastUpdatedAt: null,
    lastUpdatedLabel: 'ALWAYS AVAILABLE',
    needsReviewCount: 0,
    activeTaskCount: 0,
    isArchived: false,
    isOnHold: false,
    clientFacing: false,
    internalProject: true,
    openRoute: CANONICAL_SITE00_DESIGN_ROUTE,
    descriptor: 'SITE 00 DESIGN WORKSPACE · WEBSITE(S) · SITE 00',
    repositorySlug: null,
    repositoryStatus: null,
    commitsAhead: null,
    openPullRequests: null,
    designModuleEnabled: true,
    experienceModuleEnabled: false,
  };
}

/** Pinned founder entry — SITE 00 Experience module workspace selector. */
export function buildSite00PlatformExperienceIndexItem(): ProjectIndexItem {
  const designItem = buildSite00PlatformDesignIndexItem();
  return {
    ...designItem,
    projectId: 'site00-experience-module',
    projectName: 'EXPERIENCE',
    projectType: 'SITE 00 EXPERIENCE WORKSPACE',
    projectClassification: 'SYSTEM · PRODUCTION MODULE',
    projectInitials: 'E',
    currentPhase: 'APPS · CONFIGURATORS · WORLDS',
    currentFocus: 'INTERACTIVE · SIMULATIONS · RUNTIME',
    descriptor: 'CONFIGURATORS · WORLDS · SIMULATIONS · INTERACTIVE',
    openRoute: site00PlatformExperienceOpenRoute(),
    designModuleEnabled: false,
    experienceModuleEnabled: true,
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
