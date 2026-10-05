/**
 * P0.EXPERIENCE.MODULE-WIRING1 — active project/experience selection (localStorage).
 */

import {
  getFixtureExperienceBundle,
  getFixtureExperienceBySlug,
  listFixtureExperiencesForProject,
} from './fixtures.js';
import { getProjectModuleAvailability } from './moduleAvailability.js';
import type { ExperienceWorkspaceBundle } from './types.js';

const ACTIVE_EXPERIENCE_KEY_PREFIX = 'site00:experience-workspace:v1:active-experience:';

function storageKey(projectId: string): string {
  return `${ACTIVE_EXPERIENCE_KEY_PREFIX}${projectId.toLowerCase()}`;
}

export function getActiveExperienceSlug(projectId: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(storageKey(projectId));
  } catch {
    return null;
  }
}

export function setActiveExperienceSlug(projectId: string, experienceSlug: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey(projectId), experienceSlug.toLowerCase());
  } catch {
    /* ignore quota */
  }
}

export function clearActiveExperienceSlug(projectId: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(storageKey(projectId));
  } catch {
    /* ignore */
  }
}

export function resolveDefaultExperienceSlug(projectId: string): string | null {
  const stored = getActiveExperienceSlug(projectId);
  if (stored && getFixtureExperienceBySlug(projectId, stored)) return stored;
  const list = listFixtureExperiencesForProject(projectId);
  return list[0]?.slug ?? null;
}

export function loadExperienceWorkspaceBundle(
  projectId: string,
  experienceSlug: string | null,
): ExperienceWorkspaceBundle | null {
  const slug = experienceSlug ?? resolveDefaultExperienceSlug(projectId);
  if (!slug) return null;
  const availability = getProjectModuleAvailability(projectId);
  if (!availability.experienceEnabled) return null;
  return getFixtureExperienceBundle(projectId, slug);
}

export function canAccessExperienceModule(projectId: string): boolean {
  return getProjectModuleAvailability(projectId).experienceEnabled;
}

export function toolPlanRequiresApproval(status: string): boolean {
  return status === 'DRAFT' || status === 'READY_FOR_APPROVAL';
}
