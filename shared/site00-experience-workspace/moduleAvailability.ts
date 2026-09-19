/**
 * P0.EXPERIENCE.MODULE-WIRING1 — per-project module availability (data, not visual-only).
 */

import type { ProjectModuleAvailability } from './types.js';
import { getSite00ManagedProject } from '../site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';

const DEFAULTS: Omit<ProjectModuleAvailability, 'projectId'> = {
  designEnabled: false,
  experienceEnabled: false,
  identityEnabled: true,
  productionEnabled: true,
  reviewsEnabled: true,
  libraryEnabled: true,
};

/** Fixture-backed overrides until Supabase module flags exist. */
const MODULE_OVERRIDES: Record<string, Partial<Omit<ProjectModuleAvailability, 'projectId'>>> = {
  'frontal-slayer': { designEnabled: true, experienceEnabled: true },
  'studio-world': { designEnabled: true, experienceEnabled: true },
  'astral-world': { designEnabled: false, experienceEnabled: true },
  'all-in-one-enterprises': { designEnabled: true, experienceEnabled: true },
  ndxbook: { designEnabled: true, experienceEnabled: false },
  site00: { designEnabled: true, experienceEnabled: false },
};

export function getProjectModuleAvailability(projectId: string): ProjectModuleAvailability {
  const slug = projectId.toLowerCase();
  const managed = getSite00ManagedProject(slug);
  const override = MODULE_OVERRIDES[slug] ?? {};
  return {
    projectId: slug,
    designEnabled: override.designEnabled ?? managed?.designEnabled ?? DEFAULTS.designEnabled,
    experienceEnabled: override.experienceEnabled ?? DEFAULTS.experienceEnabled,
    identityEnabled: override.identityEnabled ?? DEFAULTS.identityEnabled,
    productionEnabled: override.productionEnabled ?? DEFAULTS.productionEnabled,
    reviewsEnabled: override.reviewsEnabled ?? DEFAULTS.reviewsEnabled,
    libraryEnabled: override.libraryEnabled ?? DEFAULTS.libraryEnabled,
  };
}

export function listExperienceEnabledProjectIds(): string[] {
  return Object.entries(MODULE_OVERRIDES)
    .filter(([, v]) => v.experienceEnabled)
    .map(([id]) => id)
    .concat(['astral-world', 'frontal-slayer', 'studio-world', 'all-in-one-enterprises'])
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .filter((id) => getProjectModuleAvailability(id).experienceEnabled);
}
