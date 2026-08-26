/**
 * P0.VR.3M — Managed project design adapters (website scope vs native pipelines).
 */

import { listDesignScreensForProject } from '../p0vr2/designScreenRegistry.js';
import { STUDIO_WORLD_INTERNAL_ROUTE_PREFIXES } from './constants.js';
import { getSite00ManagedProject } from './managedProjectRegistry.js';
import type { ManagedProjectDesignAdapterScope } from './types.js';

function isInternalStudioWorldRoute(route: string): boolean {
  const normalized = route.startsWith('/') ? route : `/${route}`;
  return STUDIO_WORLD_INTERNAL_ROUTE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function buildManagedProjectDesignAdapterScope(projectId: string): ManagedProjectDesignAdapterScope {
  const managed = getSite00ManagedProject(projectId);
  const screens = listDesignScreensForProject(projectId).map((screen) => ({
    screenId: screen.screenId,
    displayName: screen.displayName,
    route: screen.routePattern,
  }));

  const websiteRoutes = screens
    .map((s) => s.route)
    .filter((route) => !isInternalStudioWorldRoute(route));

  const excludedInternalRoutes =
    projectId === 'studio-world'
      ? [...STUDIO_WORLD_INTERNAL_ROUTE_PREFIXES, '/studio-world/design']
      : [];

  return {
    projectId,
    websiteRoutes,
    excludedInternalRoutes: projectId === 'studio-world' ? excludedInternalRoutes : [],
    screens,
    families: screens.map((s) => s.route.split('/').filter(Boolean)[0] ?? projectId),
    authContexts: managed?.projectId === 'site00' ? ['PUBLIC', 'CUSTOMER'] : ['PROJECT_SPECIFIC_ROLE', 'PUBLIC'],
  };
}

export function studioWorldInternalRoutesImportedAsWebsiteRoutesByDefault(): boolean {
  return false;
}

export function studioWorldNativePipelinesMergedIntoSite00Design(): boolean {
  return false;
}

export function site00CanDesignStudioWorldWebsite(): boolean {
  return Boolean(getSite00ManagedProject('studio-world')?.designEnabled);
}

export function site00CanDesignItsOwnWebsite(): boolean {
  return Boolean(getSite00ManagedProject('site00')?.designEnabled);
}
