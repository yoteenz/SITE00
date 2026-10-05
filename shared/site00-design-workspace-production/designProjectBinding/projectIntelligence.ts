/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — active project intelligence for DESIGN module.
 */

import { getSite00ManagedProject } from '../../site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { buildProjectDesignPageRegistry } from './designPageRegistry.js';
import type { DesignProjectIntelligence } from './types.js';

const PROJECT_COPY: Record<
  string,
  { description: string; brandExpression: string; primaryCreativeStream: string }
> = {
  ndxbook: {
    description: 'Cultural intelligence editorial product — index-first publishing system.',
    brandExpression: 'NDX_LIME · archival evidence · signal-as-index grammar',
    primaryCreativeStream: 'CULTURAL_INTELLIGENCE_EDITORIAL',
  },
  'frontal-slayer': {
    description: 'Managed brand website under SITE 00 design authority.',
    brandExpression: 'PROJECT_CANONICAL',
    primaryCreativeStream: 'BRAND_WEB_PRESENCE',
  },
  'studio-world': {
    description: 'Studio World infrastructure and public website surface.',
    brandExpression: 'STUDIO_WORLD_WEBSITE',
    primaryCreativeStream: 'STUDIO_WORLD_PUBLIC',
  },
  'all-in-one-enterprises': {
    description: 'Managed enterprise brand website.',
    brandExpression: 'PROJECT_CANONICAL',
    primaryCreativeStream: 'ENTERPRISE_BRAND',
  },
  'astral-world': {
    description: 'Astral World immersive website project.',
    brandExpression: 'ASTRAL_WORLD',
    primaryCreativeStream: 'IMMERSIVE_WORLD_ENTRY',
  },
};

export function buildDesignProjectIntelligence(projectId: string): DesignProjectIntelligence | null {
  const managed = getSite00ManagedProject(projectId);
  if (!managed?.designEnabled) return null;

  const pages = buildProjectDesignPageRegistry(projectId).filter((p) => !p.isConceptOrphan);
  const copy = PROJECT_COPY[projectId] ?? {
    description: `${managed.displayName} managed project.`,
    brandExpression: managed.projectAccent,
    primaryCreativeStream: 'PROJECT_DEFAULT',
  };

  const pagesApproved = pages.filter((p) => p.designStatus === 'APPROVED' || p.designStatus === 'READY_TO_BUILD').length;
  const pagesNeedingDesign = pages.filter((p) => p.designStatus === 'DESIGN_NEEDED' || p.designStatus === 'PLANNED').length;
  const pagesInReview = pages.filter((p) => p.designStatus === 'IN_REVIEW' || p.designStatus === 'DESIGNING').length;
  const pagesReadyToBuild = pages.filter((p) => p.designStatus === 'READY_TO_BUILD').length;
  const pagesBuilt = pages.filter((p) => p.designStatus === 'BUILT').length;
  const pagesBlocked = pages.filter((p) => p.designStatus === 'AMENDMENT_REQUIRED').length;

  return {
    projectId,
    displayName: managed.displayName,
    projectType: managed.projectType,
    description: copy.description,
    brandExpression: copy.brandExpression,
    primaryCreativeStream: copy.primaryCreativeStream,
    pageRegistryId: `${projectId}:page-registry`,
    totalPages: pages.length,
    pagesApproved,
    pagesNeedingDesign,
    pagesInReview,
    pagesReadyToBuild,
    pagesBuilt,
    pagesBlocked,
  };
}
