/**
 * Authority boundary map — HOST_LOCKED vs AUTHORITY_REBUILD regions.
 * P0.VR.6R6
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { NormalizedBbox } from './types.js';

export const REGION_BOUNDARY_CLASSES = [
  'HOST_LOCKED',
  'AUTHORITY_REBUILD',
  'FUNCTION_PRESERVE_VISUAL_REBUILD',
  'ASSET_SLOT',
  'CONTEXT_ONLY',
] as const;

export type RegionBoundaryClass = (typeof REGION_BOUNDARY_CLASSES)[number];

export type AuthorityBoundaryRegion = {
  regionId: string;
  boundaryClass: RegionBoundaryClass;
  bbox: NormalizedBbox;
  label: string;
};

export type ReferenceAuthorityBoundaryMap = {
  authorityId: string;
  viewport: DesignViewportClass;
  hostShellRegions: AuthorityBoundaryRegion[];
  workspaceAuthorityRegions: AuthorityBoundaryRegion[];
  sharedFunctionalRegions: AuthorityBoundaryRegion[];
  assetRegions: AuthorityBoundaryRegion[];
  ignoredContextRegions: AuthorityBoundaryRegion[];
  hostShellCoverage: number;
  authorityRebuildCoverage: number;
  confidence: number;
  approved: boolean;
  boundaryReviewRequired: boolean;
};

export type RegionFunctionVisualContract = {
  regionId: string;
  functionLocked: boolean;
  dataLocked: boolean;
  routeLocked: boolean;
  permissionLocked: boolean;
  visualLocked: boolean;
  geometryLocked: boolean;
  compositionLocked: boolean;
};

const HOST_SHELL_MAX_COVERAGE = 0.35;

export function buildSkinsMobileAuthorityBoundaryMap(authorityId: string): ReferenceAuthorityBoundaryMap {
  const hostShellRegions: AuthorityBoundaryRegion[] = [
    { regionId: 'global-header', boundaryClass: 'HOST_LOCKED', bbox: { x: 0, y: 0, width: 1, height: 0.06 }, label: 'SITE 00 GLOBAL HEADER' },
    { regionId: 'host-logo', boundaryClass: 'HOST_LOCKED', bbox: { x: 0, y: 0, width: 0.25, height: 0.06 }, label: 'HOST LOGO / MARK' },
    { regionId: 'global-menu-controls', boundaryClass: 'HOST_LOCKED', bbox: { x: 0.85, y: 0, width: 0.15, height: 0.06 }, label: 'ALERT / MENU CONTROLS' },
    { regionId: 'breadcrumb-container', boundaryClass: 'HOST_LOCKED', bbox: { x: 0, y: 0.06, width: 0.72, height: 0.04 }, label: 'BREADCRUMB CONTAINER' },
    { regionId: 'project-selector', boundaryClass: 'HOST_LOCKED', bbox: { x: 0.72, y: 0.06, width: 0.28, height: 0.04 }, label: 'PROJECT SELECTOR' },
  ];

  const sharedFunctionalRegions: AuthorityBoundaryRegion[] = [
    { regionId: 'design-workspace-routing', boundaryClass: 'FUNCTION_PRESERVE_VISUAL_REBUILD', bbox: { x: 0, y: 0.1, width: 1, height: 0.04 }, label: 'DESIGN TAB ROUTING' },
  ];

  const workspaceAuthorityRegions: AuthorityBoundaryRegion[] = [
    { regionId: 'design-reconstruction-hero', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.1, width: 1, height: 0.1 }, label: 'DESIGN RECONSTRUCTION HEADER' },
    { regionId: 'primary-tabs-visual', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.2, width: 1, height: 0.04 }, label: 'PRIMARY TAB STRIP' },
    { regionId: 'viewport-selector', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.24, width: 1, height: 0.03 }, label: 'VIEWPORT SELECTOR' },
    { regionId: 'experience-skins-header', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.27, width: 1, height: 0.05 }, label: 'EXPERIENCE SKINS HEADER' },
    { regionId: 'brand-family-selector', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.32, width: 1, height: 0.12 }, label: 'BRAND FAMILY SELECTOR' },
    { regionId: 'brand-family-cards', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0.02, y: 0.335, width: 0.96, height: 0.1 }, label: 'BRAND FAMILY CARDS' },
    { regionId: 'screen-pack', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.44, width: 1, height: 0.18 }, label: 'SCREEN PACK' },
    { regionId: 'screen-tiles', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0.02, y: 0.45, width: 0.96, height: 0.16 }, label: 'SCREEN TILES' },
    { regionId: 'viewport-status-row', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.62, width: 1, height: 0.04 }, label: 'VIEWPORT / STATUS ROW' },
    { regionId: 'selected-screen-preview', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.66, width: 1, height: 0.2 }, label: 'SELECTED SCREEN PREVIEW' },
    { regionId: 'screen-actions', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0.5, y: 0.78, width: 0.48, height: 0.06 }, label: 'SCREEN ACTIONS' },
    { regionId: 'pagination', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.86, width: 1, height: 0.03 }, label: 'PAGINATION' },
    { regionId: 'recent-activity', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0, y: 0.9, width: 0.5, height: 0.05 }, label: 'RECENT ACTIVITY' },
    { regionId: 'quick-actions', boundaryClass: 'AUTHORITY_REBUILD', bbox: { x: 0.5, y: 0.9, width: 0.5, height: 0.05 }, label: 'QUICK ACTIONS' },
  ];

  const brandKeys = ['NDXBOOK', 'FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'] as const;
  const cardWidth = 0.18;
  const assetRegions: AuthorityBoundaryRegion[] = brandKeys.map((key, i) => ({
    regionId: `family-thumb-${key.toLowerCase()}`,
    boundaryClass: 'ASSET_SLOT' as const,
    bbox: { x: 0.02 + i * (cardWidth + 0.01), y: 0.34, width: cardWidth, height: 0.08 },
    label: `${key.replace(/_/g, ' ')} FAMILY VISUAL`,
  }));

  const ignoredContextRegions: AuthorityBoundaryRegion[] = [
    { regionId: 'browser-chrome', boundaryClass: 'CONTEXT_ONLY', bbox: { x: 0, y: 0, width: 1, height: 0.03 }, label: 'BROWSER CHROME' },
    { regionId: 'device-frame', boundaryClass: 'CONTEXT_ONLY', bbox: { x: 0, y: 0.97, width: 1, height: 0.03 }, label: 'DEVICE FRAME / SAFARI UI' },
  ];

  const hostShellCoverage = sumCoverage(hostShellRegions);
  const authorityRebuildCoverage = sumCoverage(workspaceAuthorityRegions);

  return {
    authorityId,
    viewport: 'mobile',
    hostShellRegions,
    workspaceAuthorityRegions,
    sharedFunctionalRegions,
    assetRegions,
    ignoredContextRegions,
    hostShellCoverage,
    authorityRebuildCoverage,
    confidence: 0.92,
    approved: hostShellCoverage <= HOST_SHELL_MAX_COVERAGE,
    boundaryReviewRequired: hostShellCoverage > HOST_SHELL_MAX_COVERAGE,
  };
}

function sumCoverage(regions: AuthorityBoundaryRegion[]): number {
  return regions.reduce((s, r) => s + r.bbox.width * r.bbox.height, 0);
}

export function buildSkinsMobileFunctionVisualContracts(): RegionFunctionVisualContract[] {
  const authorityRebuild = [
    'brand-family-selector',
    'brand-family-cards',
    'screen-pack',
    'screen-tiles',
    'selected-screen-preview',
    'screen-actions',
    'viewport-selector',
    'experience-skins-header',
  ];

  return authorityRebuild.map((regionId) => ({
    regionId,
    functionLocked: true,
    dataLocked: true,
    routeLocked: false,
    permissionLocked: false,
    visualLocked: false,
    geometryLocked: false,
    compositionLocked: false,
  }));
}

export function detectHostShellOverreach(boundary: ReferenceAuthorityBoundaryMap): {
  overreach: boolean;
  failureCode: 'REFERENCE_HOST_SHELL_OVERCLASSIFIED' | null;
  hostCoveragePercent: number;
} {
  const hostCoveragePercent = Math.round(boundary.hostShellCoverage * 100);
  if (boundary.hostShellCoverage > HOST_SHELL_MAX_COVERAGE) {
    return { overreach: true, failureCode: 'REFERENCE_HOST_SHELL_OVERCLASSIFIED', hostCoveragePercent };
  }
  const authorityInsideHost = boundary.workspaceAuthorityRegions.some((w) =>
    boundary.hostShellRegions.some((h) => regionsOverlap(h.bbox, w.bbox)),
  );
  if (authorityInsideHost) {
    return { overreach: true, failureCode: 'REFERENCE_HOST_SHELL_OVERCLASSIFIED', hostCoveragePercent };
  }
  return { overreach: false, failureCode: null, hostCoveragePercent };
}

function regionsOverlap(a: NormalizedBbox, b: NormalizedBbox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function skinsWorkspaceNotClassifiedAsHost(boundary: ReferenceAuthorityBoundaryMap): boolean {
  const skinsRegions = ['brand-family-cards', 'screen-pack', 'selected-screen-preview'];
  for (const id of skinsRegions) {
    const region = boundary.workspaceAuthorityRegions.find((r) => r.regionId === id);
    if (!region || region.boundaryClass !== 'AUTHORITY_REBUILD') return false;
    const inHost = boundary.hostShellRegions.some((h) => h.regionId === id);
    if (inHost) return false;
  }
  return true;
}
