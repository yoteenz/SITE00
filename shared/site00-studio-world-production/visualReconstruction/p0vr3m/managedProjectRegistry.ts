/**
 * P0.VR.3M — SITE 00 managed project registry (design subject context).
 */

import type { Site00ManagedProjectRecord } from './types.js';
import { SITE00_DESIGN_PROJECT_ID } from './types.js';

const MANAGED_PROJECTS: Site00ManagedProjectRecord[] = [
  {
    projectId: SITE00_DESIGN_PROJECT_ID,
    displayName: 'SITE 00',
    projectType: 'HOST_PLATFORM',
    websiteDesignAuthority: 'SITE00',
    platformRole: 'NONE',
    managedWebsiteRole: 'SELF',
    designEnabled: true,
    marketingEnabled: true,
    projectAccent: 'SITE00_HOST',
    routeAuthority: 'SITE00',
    status: 'ACTIVE',
    legacyDesignRoutes: ['/studio-world/design'],
  },
  {
    projectId: 'studio-world',
    displayName: 'STUDIO WORLD',
    projectType: 'INFRASTRUCTURE_AND_WEBSITE',
    websiteDesignAuthority: 'SITE00',
    platformRole: 'INFRASTRUCTURE',
    managedWebsiteRole: 'MANAGED_WEBSITE_PROJECT',
    designEnabled: true,
    marketingEnabled: true,
    projectAccent: 'STUDIO_WORLD_WEBSITE',
    sourceRepo: 'external/studio-world',
    routeAuthority: 'SITE00',
    status: 'ACTIVE',
    legacyDesignRoutes: ['/projects/studio-world/design'],
  },
  {
    projectId: 'ndxbook',
    displayName: 'NDXBOOK',
    projectType: 'MANAGED_BRAND',
    websiteDesignAuthority: 'SITE00',
    platformRole: 'MANAGED_BRAND',
    managedWebsiteRole: 'MANAGED_WEBSITE_PROJECT',
    designEnabled: true,
    marketingEnabled: true,
    projectAccent: 'NDX_LIME',
    routeAuthority: 'SITE00',
    status: 'ACTIVE',
    legacyDesignRoutes: ['/projects/ndxbook/design'],
  },
  {
    projectId: 'frontal-slayer',
    displayName: 'FRONTAL SLAYER',
    projectType: 'MANAGED_BRAND',
    websiteDesignAuthority: 'SITE00',
    platformRole: 'MANAGED_BRAND',
    managedWebsiteRole: 'MANAGED_WEBSITE_PROJECT',
    designEnabled: true,
    marketingEnabled: true,
    projectAccent: 'PROJECT_CANONICAL',
    routeAuthority: 'SITE00',
    status: 'ACTIVE',
    legacyDesignRoutes: ['/projects/frontal-slayer/design'],
  },
  {
    projectId: 'all-in-one-enterprises',
    displayName: 'ALL IN ONE ENTERPRISES',
    projectType: 'MANAGED_BRAND',
    websiteDesignAuthority: 'SITE00',
    platformRole: 'MANAGED_BRAND',
    managedWebsiteRole: 'MANAGED_WEBSITE_PROJECT',
    designEnabled: true,
    marketingEnabled: true,
    projectAccent: 'PROJECT_CANONICAL',
    routeAuthority: 'SITE00',
    status: 'ACTIVE',
    legacyDesignRoutes: ['/projects/all-in-one-enterprises/design'],
  },
];

export function listSite00ManagedProjects(): Site00ManagedProjectRecord[] {
  return MANAGED_PROJECTS.filter((p) => p.status === 'ACTIVE');
}

export function getSite00ManagedProject(projectId: string): Site00ManagedProjectRecord | null {
  return listSite00ManagedProjects().find((p) => p.projectId === projectId) ?? null;
}

export function listDesignEnabledManagedProjects(): Site00ManagedProjectRecord[] {
  return listSite00ManagedProjects().filter((p) => p.designEnabled);
}

export function isKnownManagedProject(projectId: string): boolean {
  return Boolean(getSite00ManagedProject(projectId));
}

export function resolveManagedProjectContextAccent(projectId: string): Site00ManagedProjectRecord['projectAccent'] {
  return getSite00ManagedProject(projectId)?.projectAccent ?? 'NEUTRAL';
}

export function managedProjectUsesNdxLimeContext(projectId: string): boolean {
  return resolveManagedProjectContextAccent(projectId) === 'NDX_LIME';
}

export function ndxbookOwnsDesignWorkspace(): boolean {
  return false;
}

export function studioWorldOwnsSite00DesignWorkspace(): boolean {
  return false;
}

export function site00OwnsDesignWorkspace(): boolean {
  return true;
}
