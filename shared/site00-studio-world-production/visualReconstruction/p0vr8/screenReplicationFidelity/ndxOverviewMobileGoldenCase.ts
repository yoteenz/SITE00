/**
 * P0.VR.8-SRF — NDXBOOK PROJECT OVERVIEW mobile golden authority test case.
 */

import { GOLDEN_NDX_OVERVIEW_MOBILE } from './constants.js';
import type {
  AuthorityRebuildRegionMap,
  CompositionRelationshipMap,
  ScreenAuthorityBlueprint,
  ScreenReplicationFidelityContract,
} from './types.js';

export function buildNdxOverviewMobileFidelityContract(): ScreenReplicationFidelityContract {
  const g = GOLDEN_NDX_OVERVIEW_MOBILE;
  return {
    contractId: `srf-${g.projectId}-${g.screenId}-${g.viewport}`,
    projectId: g.projectId,
    brandFamilyId: g.brandFamilyId,
    moduleId: g.moduleId,
    screenId: g.screenId,
    viewport: g.viewport,
    authorityId: g.authorityId,
    authorityVersion: '1',
    fidelityMode: 'EXACT',
    assetPolicy: 'ASSET_DEFERRED_ALLOWED',
    structurePolicy: 'PARENT_GEOMETRY_FIRST',
    interactionPolicy: 'PRESERVE_FUNCTION',
    responsivePolicy: 'INDEPENDENT_VIEWPORT',
    qaPolicy: 'STRUCTURAL_THEN_FULL',
    convergenceRequired: true,
    route: g.route,
    referencePath: g.referencePath,
  };
}

export function buildNdxOverviewMobileAuthorityBlueprint(): ScreenAuthorityBlueprint {
  const g = GOLDEN_NDX_OVERVIEW_MOBILE;
  const regions = [
    region('host-header', 'HOST_SHELL', 'HOST_LOCKED', { x: 0, y: 0, width: 1, height: 0.07 }),
    region('host-bottom-nav', 'BOTTOM_NAV', 'HOST_LOCKED', { x: 0, y: 0.92, width: 1, height: 0.08 }),
    region('overview-hero', 'HERO', 'AUTHORITY_CONTROLLED', { x: 0.04, y: 0.08, width: 0.92, height: 0.18 }),
    region('overview-kpis', 'KPI_GRID', 'AUTHORITY_CONTROLLED', { x: 0.04, y: 0.27, width: 0.92, height: 0.08, gap: 0 }),
    region('production-head', 'SECTION_HEAD', 'AUTHORITY_CONTROLLED', { x: 0.04, y: 0.36, width: 0.92, height: 0.04 }),
    region('production-expr-link', 'LINK', 'FUNCTIONAL_ONLY', { x: 0.04, y: 0.4, width: 0.92, height: 0.03 }),
    region('production-carousel', 'CAROUSEL', 'AUTHORITY_CONTROLLED', { x: 0.04, y: 0.44, width: 0.92, height: 0.16 }),
    region('production-card-art-1', 'IMAGE', 'ASSET_DEFERRED', { x: 0.04, y: 0.44, width: 0.42, height: 0.1 }, 'ASSET_PENDING'),
    region('production-card-art-2', 'IMAGE', 'ASSET_DEFERRED', { x: 0.5, y: 0.44, width: 0.42, height: 0.1 }, 'ASSET_PENDING'),
    region('radar-head', 'SECTION_HEAD', 'AUTHORITY_CONTROLLED', { x: 0.04, y: 0.62, width: 0.92, height: 0.04 }),
    region('radar-list', 'LIST', 'AUTHORITY_CONTROLLED', { x: 0.04, y: 0.67, width: 0.92, height: 0.22 }),
  ];

  return {
    blueprintId: `blueprint-${g.authorityId}`,
    authorityId: g.authorityId,
    viewport: g.viewport,
    pageBounds: { width: g.viewportWidth, height: g.viewportHeight },
    regions,
    scrollBehavior: 'PAGE_SCROLL',
    firstViewportRegions: [
      'overview-hero',
      'overview-kpis',
      'production-head',
      'production-carousel',
    ],
  };
}

function region(
  regionId: string,
  role: string,
  rebuildClass: ScreenAuthorityBlueprint['regions'][0]['rebuildClass'],
  geometry: ScreenAuthorityBlueprint['regions'][0]['geometry'],
  assetState?: ScreenAuthorityBlueprint['regions'][0]['assetState'],
) {
  return { regionId, role, rebuildClass, geometry, assetState, typographyRole: role === 'HERO' ? 'DISPLAY' : 'LABEL' };
}

export function buildNdxOverviewCompositionMap(): CompositionRelationshipMap {
  return {
    mapId: 'ndx-overview-mobile-composition',
    authorityId: GOLDEN_NDX_OVERVIEW_MOBILE.authorityId,
    relationships: [
      rel('hero-to-kpis', 'overview-hero', 'overview-kpis', 'HERO BASELINE ALIGNS KPI GRID LEFT EDGE'),
      rel('kpis-to-production', 'overview-kpis', 'production-head', 'KPI GRID TO PRODUCTION SECTION RHYTHM'),
      rel('production-to-carousel', 'production-head', 'production-carousel', 'SECTION LABEL TO CARD ROW'),
      rel('carousel-art-to-card', 'production-card-art-1', 'production-carousel', 'ART BOX INSIDE CARD GEOMETRY'),
      rel('carousel-to-radar', 'production-carousel', 'radar-head', 'PRODUCTION BLOCK TO RADAR BLOCK SPACING'),
    ],
  };
}

function rel(id: string, from: string, to: string, relationship: string) {
  return { relationshipId: id, fromRegionId: from, toRegionId: to, relationship };
}

export function buildNdxOverviewRebuildRegionMap(): AuthorityRebuildRegionMap {
  const blueprint = buildNdxOverviewMobileAuthorityBlueprint();
  const total = blueprint.regions.length;
  const host = blueprint.regions.filter((r) => r.rebuildClass === 'HOST_LOCKED').length;
  const authority = blueprint.regions.filter((r) => r.rebuildClass === 'AUTHORITY_CONTROLLED').length;
  const deferred = blueprint.regions.filter((r) => r.rebuildClass === 'ASSET_DEFERRED').length;
  const hostPct = Math.round((host / total) * 100);
  const authorityPct = Math.round((authority / total) * 100);
  const deferredPct = Math.round((deferred / total) * 100);

  return {
    mapId: 'ndx-overview-mobile-rebuild-map',
    authorityId: blueprint.authorityId,
    regions: blueprint.regions.map((r) => ({
      regionId: r.regionId,
      rebuildClass: r.rebuildClass,
      label: r.role,
    })),
    hostLockedPercent: hostPct,
    authorityControlledPercent: authorityPct,
    assetDeferredPercent: deferredPct,
    hostBoundarySuspect: hostPct >= 55,
  };
}

export function ndxOverviewUsesScreenAuthorityRoute(): boolean {
  return true;
}

export function ndxOverviewMustNotRouteToAssetPipeline(purpose: string): boolean {
  return purpose === 'SCREEN_AUTHORITY';
}
