/** Canonical founder project registry — references EVOLVE orgs, does not duplicate data */

import type { Site00FounderProjectSlug } from '../../../shared/site00-projects/types.js';

export type FounderProjectDefinition = {
  slug: Site00FounderProjectSlug;
  name: string;
  displayName: string;
  internalLabel?: string;
  organizationSlug: Site00FounderProjectSlug;
  classification: string;
  currentSystem: string;
  description: string;
  boundaryNote?: string;
};

export const FOUNDER_PROJECTS: FounderProjectDefinition[] = [
  {
    slug: 'frontal-slayer',
    name: 'FRONTAL SLAYER',
    displayName: 'FRONTAL SLAYER',
    organizationSlug: 'frontal-slayer',
    classification: 'INTERNAL_BRAND',
    currentSystem: 'EVOLVE',
    description: 'FLAGSHIP COMMERCE AND MANSION EXPERIENCE BRAND — INDEXED FROM SITE 00 EVOLVE AND CONTENT BRAIN.',
  },
  {
    slug: 'studio-world',
    name: 'STUDIO WORLD',
    displayName: 'STUDIO WORLD',
    organizationSlug: 'studio-world',
    classification: 'PRODUCTION_INFRASTRUCTURE',
    currentSystem: 'PRODUCTION INFRASTRUCTURE',
    description: 'PRODUCTION ENGINE AND CREATIVE PIPELINE — DISTINCT FROM SITE 00 RUNTIME. INDEXED FOR HANDOFFS AND INTEGRATION STATUS.',
    boundaryNote: 'STUDIO WORLD REMAINS A DISTINCT PRODUCT. THIS PROJECT SURFACE INDEXES IMPORTS, HANDOFFS, AND INTEGRATION — NOT RUNTIME MERGE.',
  },
  {
    slug: 'ndxbook',
    name: 'NDXBOOK',
    displayName: 'ndxbook',
    internalLabel: 'INDEX BOOK',
    organizationSlug: 'ndxbook',
    classification: 'MANAGED_BRAND',
    currentSystem: 'EVOLVE',
    description: 'INDEX BOOK FOUNDER PILOT — LEGACY INTELLIGENCE IMPORTED, CREATIVE DIRECTION AWAITING FOUNDER REVIEW.',
  },
];

export const FOUNDER_PROJECT_SLUGS = FOUNDER_PROJECTS.map((p) => p.slug);

export function isFounderProjectSlug(slug: string): slug is Site00FounderProjectSlug {
  return FOUNDER_PROJECT_SLUGS.includes(slug as Site00FounderProjectSlug);
}
