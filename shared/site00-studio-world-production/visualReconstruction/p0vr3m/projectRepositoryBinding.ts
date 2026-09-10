/**
 * P0.VR.8R1 — Project-scoped repository bindings (monorepo / shared repo support).
 */

import { getManagedProjectRepoBinding } from './managedProjectDesignAdapter.js';
import { getSite00ManagedProject } from './managedProjectRegistry.js';

export type ProjectRepositoryBinding = {
  projectId: string;
  repositoryFullName: string;
  rootPath: string | null;
  routePrefixes: string[];
  manifestPaths: string[];
  featureNamespaces: string[];
  deploymentTargets: string[];
  defaultBranch: string;
};

const ROUTE_PREFIX_BY_PROJECT: Record<string, string[]> = {
  site00: ['/', '/projects', '/account'],
  ndxbook: ['/projects/ndxbook'],
  'frontal-slayer': ['/projects/frontal-slayer'],
  'studio-world': ['/projects/studio-world'],
  'all-in-one-enterprises': ['/projects/all-in-one-enterprises'],
  'astral-world': ['/projects/astral-world'],
};

export function resolveProjectRepositoryBinding(projectId: string): ProjectRepositoryBinding | null {
  const managed = getSite00ManagedProject(projectId);
  if (!managed) return null;

  const repo = getManagedProjectRepoBinding(projectId);
  const routePrefixes = ROUTE_PREFIX_BY_PROJECT[projectId] ?? [`/projects/${projectId}`];

  return {
    projectId,
    repositoryFullName: repo?.sourceRepo ?? 'yoteenz/SITE00',
    rootPath: repo?.sourceProjectPath ?? null,
    routePrefixes,
    manifestPaths: projectId === 'site00' ? ['shared/site00-studio-world-production/visualReconstruction/p0vr3/designRouteManifest.ts'] : [],
    featureNamespaces: [projectId],
    deploymentTargets: [projectId === 'site00' ? 'site00.com' : `site00.com/projects/${projectId}`],
    defaultBranch: repo?.defaultBranch ?? 'main',
  };
}

export function listProjectRepositoryBindings(projectIds: string[]): ProjectRepositoryBinding[] {
  return projectIds.map((id) => resolveProjectRepositoryBinding(id)).filter(Boolean) as ProjectRepositoryBinding[];
}
