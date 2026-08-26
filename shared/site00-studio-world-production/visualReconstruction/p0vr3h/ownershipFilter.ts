/**
 * P0.VR.3H — Repo ownership filter.
 */

import { EXTERNAL_REPO_OWNED_PROJECTS, SITE00_REPO_OWNED_PROJECTS } from './constants.js';
import type { ExternalRepoOwnedProjectId, MissingPageSourceRepo, RepoOwnedProjectId } from './types.js';

export function isSite00RepoOwnedProject(projectId: string): projectId is RepoOwnedProjectId {
  return (SITE00_REPO_OWNED_PROJECTS as readonly string[]).includes(projectId);
}

export function isExternalRepoOwnedProject(projectId: string): projectId is ExternalRepoOwnedProjectId {
  return (EXTERNAL_REPO_OWNED_PROJECTS as readonly string[]).includes(projectId);
}

export function resolveMissingPageSourceRepo(projectId: string): MissingPageSourceRepo | 'EXTERNAL_REPO_OWNED' {
  if (isSite00RepoOwnedProject(projectId)) return 'SITE00_REPO';
  if (isExternalRepoOwnedProject(projectId)) return 'EXTERNAL_REPO_OWNED';
  return 'EXTERNAL_REPO_OWNED';
}

export function shouldProcessMissingPage(projectId: string): boolean {
  return resolveMissingPageSourceRepo(projectId) === 'SITE00_REPO';
}

export function listExternalSkippedProjects(): { projectId: ExternalRepoOwnedProjectId; reason: string }[] {
  return EXTERNAL_REPO_OWNED_PROJECTS.map((projectId) => ({
    projectId,
    reason: 'Owned by external repo — SITE00 repo must not modify routes.',
  }));
}
