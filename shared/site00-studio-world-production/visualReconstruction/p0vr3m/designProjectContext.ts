/**
 * P0.VR.8R1 — DesignProjectContext — single project-scoped authority for Design workspace.
 */

import { PROJECT_LIVE_BASE_URLS } from '../p0vr8/constants.js';
import { getSite00ManagedProject } from './managedProjectRegistry.js';
import { resolveBrandFamilyKeyForProject, buildDesignProjectThemeTokens, type DesignProjectThemeTokens } from './designProjectThemeTokens.js';
import { buildProjectRouteManifest, type ProjectPageRegistrySyncState, type ProjectRouteManifest } from './projectRouteManifest.js';
import { resolveProjectRepositoryBinding, type ProjectRepositoryBinding } from './projectRepositoryBinding.js';
import { SITE00_DESIGN_PROJECT_ID } from './types.js';

export type DesignProjectContextStatus =
  | 'PROJECT_CONTEXT_LOADING'
  | 'PROJECT_CONTEXT_READY'
  | 'PROJECT_CONTEXT_ERROR';

export type DesignProjectContext = {
  projectId: string;
  projectSlug: string;
  projectName: string;
  brandFamilySkinId: string | null;
  brandAccent: string;
  pageRegistryId: string;
  routeManifestId: string;
  assetRegistryId: string;
  referenceRegistryId: string;
  screenAuthorityRegistryId: string;
  captureRegistryId: string;
  pageCompletionRegistryId: string;
  repositoryBindings: ProjectRepositoryBinding[];
  deploymentTargets: string[];
  liveBaseUrl: string;
  activeViewport: 'mobile' | 'tablet' | 'desktop';
  loadedAt: string;
  status: DesignProjectContextStatus;
  syncState: ProjectPageRegistrySyncState;
  routeManifest: ProjectRouteManifest;
  themeTokens: DesignProjectThemeTokens;
  errorMessage: string | null;
};

export function resolveDesignProjectContext(
  projectId: string,
  options?: {
    activeViewport?: 'mobile' | 'tablet' | 'desktop';
    screenSetMode?: 'PRIMARY' | 'ALL_DESIGNABLE';
  },
): DesignProjectContext {
  const managed = getSite00ManagedProject(projectId);
  if (!managed?.designEnabled) {
    return buildDesignProjectContextError(projectId, `${projectId.toUpperCase()} CONTEXT COULD NOT LOAD`);
  }

  const routeManifest = buildProjectRouteManifest(projectId, { screenSetMode: options?.screenSetMode });
  const repoBinding = resolveProjectRepositoryBinding(projectId);
  const themeTokens = buildDesignProjectThemeTokens(projectId);
  const brandFamilySkinId = resolveBrandFamilyKeyForProject(projectId);

  return {
    projectId,
    projectSlug: projectId,
    projectName: managed.displayName,
    brandFamilySkinId,
    brandAccent: themeTokens.primaryAccent,
    pageRegistryId: `${projectId}:page-registry`,
    routeManifestId: routeManifest.manifestId,
    assetRegistryId: `${projectId}:asset-registry`,
    referenceRegistryId: `${projectId}:reference-registry`,
    screenAuthorityRegistryId: `${projectId}:screen-authority-registry`,
    captureRegistryId: `${projectId}:capture-registry`,
    pageCompletionRegistryId: `${projectId}:page-completion-registry`,
    repositoryBindings: repoBinding ? [repoBinding] : [],
    deploymentTargets: repoBinding?.deploymentTargets ?? [projectId],
    liveBaseUrl: PROJECT_LIVE_BASE_URLS[projectId] ?? 'https://site00.com',
    activeViewport: options?.activeViewport ?? 'mobile',
    loadedAt: new Date().toISOString(),
    status: 'PROJECT_CONTEXT_READY',
    syncState: routeManifest.syncState,
    routeManifest,
    themeTokens,
    errorMessage: null,
  };
}

function buildDesignProjectContextError(projectId: string, message: string): DesignProjectContext {
  const themeTokens = buildDesignProjectThemeTokens(SITE00_DESIGN_PROJECT_ID);
  return {
    projectId,
    projectSlug: projectId,
    projectName: projectId.toUpperCase(),
    brandFamilySkinId: null,
    brandAccent: themeTokens.primaryAccent,
    pageRegistryId: `${projectId}:page-registry`,
    routeManifestId: `${projectId}:route-manifest`,
    assetRegistryId: `${projectId}:asset-registry`,
    referenceRegistryId: `${projectId}:reference-registry`,
    screenAuthorityRegistryId: `${projectId}:screen-authority-registry`,
    captureRegistryId: `${projectId}:capture-registry`,
    pageCompletionRegistryId: `${projectId}:page-completion-registry`,
    repositoryBindings: [],
    deploymentTargets: [],
    liveBaseUrl: 'https://site00.com',
    activeViewport: 'mobile',
    loadedAt: new Date().toISOString(),
    status: 'PROJECT_CONTEXT_ERROR',
    syncState: 'NEVER_SYNCED',
    routeManifest: {
      manifestId: `${projectId}:route-manifest`,
      projectId,
      routes: [],
      routeCount: 0,
      syncState: 'NEVER_SYNCED',
      lastSyncedAt: null,
      discoveredAt: new Date().toISOString(),
    },
    themeTokens,
    errorMessage: message,
  };
}

export function createLoadingDesignProjectContext(projectId: string): DesignProjectContext {
  const base = resolveDesignProjectContext(projectId);
  return { ...base, status: 'PROJECT_CONTEXT_LOADING', loadedAt: new Date().toISOString() };
}
