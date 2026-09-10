/**
 * P0.VR.8R1 — Bootstrap design screens + context for all managed projects.
 */

import { registerProjectDesignScreens, listDesignScreensForProject } from '../p0vr2/designScreenRegistry.js';
import { registerNdxbookDesignPilot } from '../p0vr2/ndxPilotRegistration.js';
import { registerSite00DesignPilot } from '../p0vr3a/site00PilotRegistration.js';
import type { DesignScreenDefinition } from '../p0vr2/types.js';
import { syncAstralScreensToDesignRegistry } from '../../../site00-astral-world/screen-masters/vr2Adapter.js';
import { listDesignEnabledManagedProjects } from './managedProjectRegistry.js';
import { SITE00_DESIGN_PROJECT_ID } from './types.js';
import { markProjectPagesSynced } from './projectRouteManifest.js';

const BOOTSTRAPPED = new Set<string>();

function buildManagedBrandScreens(projectId: string, displayName: string): DesignScreenDefinition[] {
  const slug = projectId;
  return [
    {
      screenId: 'overview',
      displayName: `${displayName} Overview`,
      routePattern: '/projects/:projectSlug',
      scopeTargetId: `${slug}-overview`,
      routeFamily: 'OTHER',
      classification: 'FOUNDER_WORKSPACE',
      priority: 'CRITICAL',
      showInDefaultSelector: true,
    },
    {
      screenId: 'content-ops',
      displayName: `${displayName} Content Ops`,
      routePattern: '/projects/:projectSlug/content-operations',
      scopeTargetId: `${slug}-content-ops`,
      routeFamily: 'OTHER',
      classification: 'FOUNDER_WORKSPACE',
      priority: 'PRIMARY',
      showInDefaultSelector: true,
    },
    {
      screenId: 'experience-builder',
      displayName: `${displayName} Experience Builder`,
      routePattern: '/projects/:projectSlug/experience-builder',
      scopeTargetId: `${slug}-builder`,
      routeFamily: 'BUILDER',
      classification: 'FOUNDER_WORKSPACE',
      priority: 'PRIMARY',
      showInDefaultSelector: true,
    },
    {
      screenId: 'production-hub',
      displayName: `${displayName} Production Hub`,
      routePattern: '/projects/:projectSlug/production-hub',
      scopeTargetId: `${slug}-production`,
      routeFamily: 'OTHER',
      classification: 'FOUNDER_WORKSPACE',
      priority: 'PRIMARY',
      showInDefaultSelector: true,
    },
    {
      screenId: 'library',
      displayName: `${displayName} Library`,
      routePattern: '/projects/:projectSlug/library',
      scopeTargetId: `${slug}-library`,
      routeFamily: 'OTHER',
      classification: 'FOUNDER_WORKSPACE',
      priority: 'SECONDARY',
      showInDefaultSelector: true,
    },
  ];
}

const STUDIO_WORLD_WEBSITE_SCREENS: DesignScreenDefinition[] = [
  {
    screenId: 'overview',
    displayName: 'Studio World Overview',
    routePattern: '/projects/:projectSlug',
    scopeTargetId: 'studio-world-overview',
    routeFamily: 'OTHER',
    classification: 'FOUNDER_WORKSPACE',
    priority: 'CRITICAL',
    showInDefaultSelector: true,
  },
  {
    screenId: 'studio-world-home',
    displayName: 'Studio World Home',
    routePattern: '/projects/studio-world',
    scopeTargetId: 'studio-world-home',
    absoluteRoute: true,
    routeFamily: 'OTHER',
    classification: 'CUSTOMER_FACING',
    priority: 'CRITICAL',
    showInDefaultSelector: true,
  },
  {
    screenId: 'studio-world-about',
    displayName: 'Studio World About',
    routePattern: '/projects/studio-world/about',
    scopeTargetId: 'studio-world-about',
    absoluteRoute: true,
    routeFamily: 'OTHER',
    classification: 'CUSTOMER_FACING',
    priority: 'PRIMARY',
    showInDefaultSelector: true,
  },
  {
    screenId: 'studio-world-work',
    displayName: 'Studio World Work',
    routePattern: '/projects/studio-world/work',
    scopeTargetId: 'studio-world-work',
    absoluteRoute: true,
    routeFamily: 'OTHER',
    classification: 'CUSTOMER_FACING',
    priority: 'PRIMARY',
    showInDefaultSelector: true,
  },
  {
    screenId: 'content-ops',
    displayName: 'Studio World Content Ops',
    routePattern: '/projects/:projectSlug/content-operations',
    scopeTargetId: 'studio-world-content-ops',
    routeFamily: 'OTHER',
    classification: 'FOUNDER_WORKSPACE',
    priority: 'PRIMARY',
    showInDefaultSelector: true,
  },
];

function registerManagedBrandProject(projectId: string, displayName: string): void {
  if (listDesignScreensForProject(projectId).length > 0) {
    BOOTSTRAPPED.add(projectId);
    return;
  }
  registerProjectDesignScreens(projectId, buildManagedBrandScreens(projectId, displayName));
  BOOTSTRAPPED.add(projectId);
}

export function bootstrapManagedDesignProject(projectId: string): void {
  if (BOOTSTRAPPED.has(projectId)) return;

  switch (projectId) {
    case SITE00_DESIGN_PROJECT_ID:
      registerSite00DesignPilot();
      markProjectPagesSynced(projectId);
      BOOTSTRAPPED.add(projectId);
      return;
    case 'ndxbook':
      registerNdxbookDesignPilot();
      markProjectPagesSynced(projectId);
      BOOTSTRAPPED.add(projectId);
      return;
    case 'astral-world':
      syncAstralScreensToDesignRegistry();
      BOOTSTRAPPED.add(projectId);
      return;
    case 'studio-world':
      if (listDesignScreensForProject(projectId).length === 0) {
        registerProjectDesignScreens(projectId, STUDIO_WORLD_WEBSITE_SCREENS);
      }
      BOOTSTRAPPED.add(projectId);
      return;
    default: {
      const managed = listDesignEnabledManagedProjects().find((p) => p.projectId === projectId);
      if (managed) {
        registerManagedBrandProject(projectId, managed.displayName);
      }
    }
  }
}

export function bootstrapAllManagedDesignProjects(): void {
  for (const project of listDesignEnabledManagedProjects()) {
    bootstrapManagedDesignProject(project.projectId);
  }
}

export function isManagedDesignProjectBootstrapped(projectId: string): boolean {
  return BOOTSTRAPPED.has(projectId) || listDesignScreensForProject(projectId).length > 0;
}

export function clearManagedDesignBootstrapForTest(): void {
  BOOTSTRAPPED.clear();
}
