/**
 * Canonical SITE 00 project classification — P0.B project core.
 */

import type { ProjectExperienceClass } from '../site00-world-intake/constants.js';

/** What is being created — target four-value model. */
export const SITE00_PROJECT_TYPES = ['IDENTITY', 'SITE', 'PRODUCT', 'WORLD'] as const;

export type Site00ProjectType = (typeof SITE00_PROJECT_TYPES)[number];

/** Lifecycle status for project registration (not creative production state). */
export const SITE00_PROJECT_STATUSES = [
  'ACTIVE',
  'PRE_INGESTION',
  'ORIGIN_INGESTED',
  'INGESTION',
  'PRODUCTION',
  'ARCHIVED',
] as const;

export type Site00ProjectStatus = (typeof SITE00_PROJECT_STATUSES)[number];

export type Site00CanonicalProject = {
  id: string;
  slug: string;
  displayName: string;
  organizationId: string | null;
  projectType: Site00ProjectType | null;
  experienceClass: ProjectExperienceClass;
  status: Site00ProjectStatus;
  metadata: Record<string, unknown>;
};

export function normalizeProjectType(value: string | null | undefined): Site00ProjectType | null {
  if (!value) return null;
  const upper = value.trim().toUpperCase();
  if (upper === 'APPLICATION') return 'PRODUCT';
  if ((SITE00_PROJECT_TYPES as readonly string[]).includes(upper)) {
    return upper as Site00ProjectType;
  }
  return null;
}

export function projectTypeToDefaultExperienceClass(
  projectType: Site00ProjectType | null,
): ProjectExperienceClass {
  switch (projectType) {
    case 'WORLD':
      return 'WORLD';
    case 'PRODUCT':
      return 'APPLICATION';
    case 'IDENTITY':
      return 'IMMERSIVE_SITE';
    case 'SITE':
    default:
      return 'SITE';
  }
}
