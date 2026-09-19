/**
 * P0.VR.DIAG.1 / P0.VR.DIAG.1R1 — Page archetype region profiles (authority-first discovery).
 */

import type { RegionSignificance, VisualCategory, VisualRegionType } from './types.js';

export type PageRegionLayoutDefinition = {
  regionId: string;
  regionName: string;
  regionType: VisualRegionType;
  significance: RegionSignificance;
  category: VisualCategory;
  normalizedY: number;
  normalizedHeight: number;
  componentId?: string | null;
  selectorHint?: string | null;
  hierarchyWeight: number;
  /** Fixed shell-driven region — height from visualShellSpec when available. */
  shellBound?: 'header' | 'bottom-nav' | null;
  childLandmarks?: string[];
};

export type PageRegionLayoutProfile = {
  archetype: string;
  screenId: string;
  regions: PageRegionLayoutDefinition[];
  stackOrder: string[];
};

const MOBILE_PROJECT_OVERVIEW: PageRegionLayoutProfile = {
  archetype: 'mobile-project-overview',
  screenId: 'overview',
  stackOrder: [
    'header',
    'project-identity',
    'project-meta',
    'section-nav',
    'hero-media',
    'progress-band',
    'metric-cells',
    'content-rail',
    'activity-list',
    'bottom-nav',
  ],
  regions: [
    {
      regionId: 'ndx.overview.header-shell',
      regionName: 'HOST HEADER',
      regionType: 'HEADER',
      significance: 'MAJOR',
      category: 'GEOMETRY',
      normalizedY: 0,
      normalizedHeight: 0.062,
      componentId: 'MobileFounderWorkspaceChrome.header',
      selectorHint: '.site00-fws-mobile-chrome__header',
      hierarchyWeight: 0.9,
      shellBound: 'header',
      childLandmarks: ['logo', 'menu-button', 'notification-button', 'bottom-border'],
    },
    {
      regionId: 'ndx.overview.hero',
      regionName: 'PROJECT IDENTITY',
      regionType: 'IDENTITY',
      significance: 'MAJOR',
      category: 'TYPOGRAPHY',
      normalizedY: 0.062,
      normalizedHeight: 0.12,
      componentId: 'OverviewMobileHomeScreen.hero',
      selectorHint: '.site00-fws-mobile-overview__hero',
      hierarchyWeight: 1,
    },
    {
      regionId: 'ndx.overview.metrics',
      regionName: 'PROJECT STATUS / META',
      regionType: 'STATUS',
      significance: 'SUPPORTING',
      category: 'HIERARCHY',
      normalizedY: 0.182,
      normalizedHeight: 0.05,
      componentId: 'OverviewMobileHomeScreen.metrics',
      selectorHint: '.site00-fws-mobile-overview__meta',
      hierarchyWeight: 0.7,
    },
    {
      regionId: 'ndx.overview.kpis',
      regionName: 'SECTION NAVIGATION',
      regionType: 'NAVIGATION',
      significance: 'MAJOR',
      category: 'NAVIGATION',
      normalizedY: 0.232,
      normalizedHeight: 0.08,
      componentId: 'OverviewMobileHomeScreen.kpis',
      selectorHint: '.site00-fws-hub-kpis--mobile',
      hierarchyWeight: 0.85,
      childLandmarks: ['active-indicator', 'item-gap', 'nav-labels'],
    },
    {
      regionId: 'ndx.overview.production',
      regionName: 'HERO / EDITORIAL MEDIA',
      regionType: 'MEDIA',
      significance: 'MAJOR',
      category: 'ASSET',
      normalizedY: 0.312,
      normalizedHeight: 0.14,
      componentId: 'OverviewMobileHomeScreen.production',
      selectorHint: '.site00-fws-hub-carousel--mobile-row',
      hierarchyWeight: 0.8,
    },
    {
      regionId: 'ndx.overview.content-shell',
      regionName: 'PROGRESS / PHASE BAND',
      regionType: 'STATUS',
      significance: 'MAJOR',
      category: 'DENSITY',
      normalizedY: 0.452,
      normalizedHeight: 0.07,
      componentId: 'OverviewMobileHomeScreen.progress',
      selectorHint: '.site00-fws-mobile-overview__progress',
      hierarchyWeight: 0.75,
    },
    {
      regionId: 'ndx.overview.kpi.audience',
      regionName: 'METRIC / STATUS CELLS',
      regionType: 'METRICS',
      significance: 'MAJOR',
      category: 'DENSITY',
      normalizedY: 0.522,
      normalizedHeight: 0.08,
      componentId: 'OverviewMobileHomeScreen.kpiAudience',
      selectorHint: '.site00-fws-hub-kpis__cell',
      hierarchyWeight: 0.72,
    },
    {
      regionId: 'ndx.overview.radar',
      regionName: 'CURRENT FOCUS / ACTIVITY',
      regionType: 'LIST',
      significance: 'MAJOR',
      category: 'DENSITY',
      normalizedY: 0.602,
      normalizedHeight: 0.16,
      componentId: 'OverviewMobileHomeScreen.radar',
      selectorHint: '.site00-fws-mobile-radar-list',
      hierarchyWeight: 0.65,
    },
    {
      regionId: 'ndx.overview.production.card.subscription',
      regionName: 'NEXT MILESTONE / CARD RAIL',
      regionType: 'CARD_RAIL',
      significance: 'SUPPORTING',
      category: 'DENSITY',
      normalizedY: 0.762,
      normalizedHeight: 0.1,
      componentId: 'OverviewMobileHomeScreen.productionCards',
      selectorHint: '.site00-fws-hub-carousel--mobile-row',
      hierarchyWeight: 0.6,
    },
    {
      regionId: 'ndx.overview.bottom-nav-shell',
      regionName: 'BOTTOM NAVIGATION',
      regionType: 'PERSISTENT_NAV',
      significance: 'MAJOR',
      category: 'CONTROL',
      normalizedY: 0.88,
      normalizedHeight: 0.12,
      componentId: 'MobileFounderWorkspaceChrome.bottomNav',
      selectorHint: '.site00-fws-mobile-chrome__nav',
      hierarchyWeight: 0.8,
      shellBound: 'bottom-nav',
      childLandmarks: ['nav-icon', 'nav-label', 'active-fill'],
    },
  ],
};

const GENERIC_MOBILE_PAGE: PageRegionLayoutProfile = {
  archetype: 'generic-mobile-page',
  screenId: 'generic',
  stackOrder: ['header', 'hero', 'content-rail', 'bottom-nav'],
  regions: [
    {
      regionId: 'page.header',
      regionName: 'HEADER',
      regionType: 'HEADER',
      significance: 'MAJOR',
      category: 'GEOMETRY',
      normalizedY: 0,
      normalizedHeight: 0.08,
      hierarchyWeight: 0.9,
      shellBound: 'header',
    },
    {
      regionId: 'page.hero',
      regionName: 'HERO',
      regionType: 'HERO',
      significance: 'MAJOR',
      category: 'HIERARCHY',
      normalizedY: 0.08,
      normalizedHeight: 0.22,
      hierarchyWeight: 1,
    },
    {
      regionId: 'page.content',
      regionName: 'CONTENT RAIL',
      regionType: 'CONTENT',
      significance: 'MAJOR',
      category: 'DENSITY',
      normalizedY: 0.3,
      normalizedHeight: 0.55,
      hierarchyWeight: 0.7,
    },
    {
      regionId: 'page.bottom-nav',
      regionName: 'BOTTOM NAV',
      regionType: 'PERSISTENT_NAV',
      significance: 'MAJOR',
      category: 'NAVIGATION',
      normalizedY: 0.88,
      normalizedHeight: 0.12,
      hierarchyWeight: 0.75,
      shellBound: 'bottom-nav',
    },
  ],
};

export function resolvePageRegionLayoutProfile(input: {
  pageArchetype: string;
  screenId?: string;
  isRootPage?: boolean;
}): PageRegionLayoutProfile {
  if (
    input.pageArchetype.includes('ndxbook') ||
    input.screenId === 'overview' ||
    input.pageArchetype === 'mobile-project-overview'
  ) {
    return MOBILE_PROJECT_OVERVIEW;
  }
  return GENERIC_MOBILE_PAGE;
}

export function discoverAuthorityRegions(profile: PageRegionLayoutProfile): PageRegionLayoutDefinition[] {
  return [...profile.regions];
}
