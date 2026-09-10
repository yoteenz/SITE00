/**
 * SITE 00 route family bootstraps — reusable registries for known product areas.
 */

import type { ProjectSurfaceRegistryInput } from './types.js';
import { buildChildDescriptorFromLegacyPanel } from './parentChildExperienceInheritanceEngine.js';

export function buildSite00ProjectOperatingSystemRegistry(projectSlug: string): ProjectSurfaceRegistryInput {
  const base = `/projects/${projectSlug}`;
  return {
    projectId: projectSlug,
    rootRoute: `${base}/overview`,
    routes: [
      `${base}/overview`,
      `${base}/builder`,
      `${base}/production`,
      `${base}/reviews`,
      `${base}/library`,
      `${base}/more`,
      `${base}/origin`,
      `${base}/identity`,
    ],
    parentSignals: {
      route: `${base}/overview`,
      surfaceId: `pos-overview-${projectSlug}`,
      viewport: 'UNIVERSAL',
      heroPresent: true,
      cardGridPresent: true,
      primaryPanelCount: 2,
      moduleScreenType: 'PROJECT_OVERVIEW',
    },
    childDescriptors: [
      buildChildDescriptorFromLegacyPanel({
        route: `${base}/more`,
        parentRoute: `${base}/overview`,
        label: 'MORE',
        domClassHints: ['site00-pos-panel', 'site00-pos-link-list', 'site00-pos-empty'],
      }),
    ],
    declaredSurfaces: [
      {
        surfaceId: `pos-more-${projectSlug}`,
        route: `${base}/more`,
        label: 'MORE',
        parentRoute: `${base}/overview`,
        relationshipType: 'DIRECT_CHILD',
        moduleScreenType: 'MORE',
      },
    ],
  };
}

export function buildSite00DesignWorkspaceMoreRegistry(projectSlug: string): ProjectSurfaceRegistryInput {
  const base = `/projects/${projectSlug}/design`;
  return {
    projectId: projectSlug,
    rootRoute: `${base}?tab=more`,
    routes: [
      `${base}?tab=more`,
      `${base}?tab=more&category=providers`,
      `${base}?tab=more&category=capture`,
      `${base}?tab=more&category=route-audit`,
      `${base}?tab=more&category=system`,
      `${base}?tab=pages`,
      `${base}?tab=skins`,
      `${base}?tab=assets`,
    ],
    parentSignals: {
      route: `${base}?tab=more`,
      surfaceId: `dw-more-hub-${projectSlug}`,
      viewport: 'UNIVERSAL',
      heroPresent: true,
      cardGridPresent: true,
      controlRoomIndicators: true,
      tabCount: 1,
      primaryPanelCount: 2,
      moduleScreenType: 'MORE',
      designAuthorityId: `auth-dw-more-${projectSlug}`,
    },
    declaredSurfaces: [
      {
        surfaceId: `dw-more-providers-${projectSlug}`,
        route: `${base}?tab=more&category=providers`,
        label: 'PROVIDERS',
        parentRoute: `${base}?tab=more`,
        relationshipType: 'TAB_CHILD',
        kind: 'TAB_STATE',
        moduleScreenType: 'MORE',
      },
      {
        surfaceId: `dw-more-capture-${projectSlug}`,
        route: `${base}?tab=more&category=capture`,
        label: 'CAPTURE',
        parentRoute: `${base}?tab=more`,
        relationshipType: 'TAB_CHILD',
        kind: 'TAB_STATE',
        moduleScreenType: 'MORE',
      },
      {
        surfaceId: `dw-more-route-audit-${projectSlug}`,
        route: `${base}?tab=more&category=route-audit`,
        label: 'ROUTE AUDIT',
        parentRoute: `${base}?tab=more`,
        relationshipType: 'TAB_CHILD',
        kind: 'TAB_STATE',
        moduleScreenType: 'MORE',
      },
      {
        surfaceId: `dw-more-system-${projectSlug}`,
        route: `${base}?tab=more&category=system`,
        label: 'SYSTEM',
        parentRoute: `${base}?tab=more`,
        relationshipType: 'TAB_CHILD',
        kind: 'TAB_STATE',
        moduleScreenType: 'MORE',
      },
    ],
  };
}

export function buildGenericProjectRegistry(input: {
  projectId: string;
  rootRoute: string;
  routes: string[];
  parentSignals?: ProjectSurfaceRegistryInput['parentSignals'];
}): ProjectSurfaceRegistryInput {
  return {
    projectId: input.projectId,
    rootRoute: input.rootRoute,
    routes: input.routes,
    parentSignals: input.parentSignals,
  };
}
