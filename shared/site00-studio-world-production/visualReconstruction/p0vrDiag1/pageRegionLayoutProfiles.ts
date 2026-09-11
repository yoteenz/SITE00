/**
 * P0.VR.DIAG.1 — Page archetype region profiles (normalized, not NDX-only).
 */

import type { VisualCategory } from './types.js';

export type PageRegionLayoutDefinition = {
  regionId: string;
  regionName: string;
  category: VisualCategory;
  normalizedY: number;
  normalizedHeight: number;
  componentId?: string | null;
  selectorHint?: string | null;
  hierarchyWeight: number;
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
    'project-title',
    'section-nav',
    'hero-media',
    'progress-band',
    'content-rail',
    'cards',
    'activity-list',
    'bottom-nav',
  ],
  regions: [
    {
      regionId: 'ndx.overview.header-shell',
      regionName: 'HEADER',
      category: 'GEOMETRY',
      normalizedY: 0,
      normalizedHeight: 0.062,
      componentId: 'MobileFounderWorkspaceChrome.header',
      selectorHint: '.site00-fws-mobile-chrome__header',
      hierarchyWeight: 0.9,
    },
    {
      regionId: 'ndx.overview.hero',
      regionName: 'PROJECT TITLE BLOCK',
      category: 'TYPOGRAPHY',
      normalizedY: 0.062,
      normalizedHeight: 0.19,
      componentId: 'OverviewMobileHomeScreen.hero',
      selectorHint: '.site00-fws-mobile-overview__hero',
      hierarchyWeight: 1,
    },
    {
      regionId: 'ndx.overview.kpis',
      regionName: 'SECTION NAV / METRICS',
      category: 'NAVIGATION',
      normalizedY: 0.252,
      normalizedHeight: 0.1,
      componentId: 'OverviewMobileHomeScreen.kpis',
      selectorHint: '.site00-fws-hub-kpis--mobile',
      hierarchyWeight: 0.85,
    },
    {
      regionId: 'ndx.overview.production',
      regionName: 'CONTENT RAIL / CARDS',
      category: 'DENSITY',
      normalizedY: 0.36,
      normalizedHeight: 0.28,
      componentId: 'OverviewMobileHomeScreen.production',
      selectorHint: '.site00-fws-hub-carousel--mobile-row',
      hierarchyWeight: 0.75,
    },
    {
      regionId: 'ndx.overview.radar',
      regionName: 'ACTIVITY / LIST',
      category: 'DENSITY',
      normalizedY: 0.64,
      normalizedHeight: 0.18,
      componentId: 'OverviewMobileHomeScreen.radar',
      selectorHint: '.site00-fws-mobile-radar-list',
      hierarchyWeight: 0.65,
    },
    {
      regionId: 'ndx.overview.bottom-nav-shell',
      regionName: 'BOTTOM NAV',
      category: 'CONTROL',
      normalizedY: 0.88,
      normalizedHeight: 0.12,
      componentId: 'MobileFounderWorkspaceChrome.bottomNav',
      selectorHint: '.site00-fws-mobile-chrome__bottom-nav',
      hierarchyWeight: 0.8,
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
      category: 'GEOMETRY',
      normalizedY: 0,
      normalizedHeight: 0.08,
      hierarchyWeight: 0.9,
    },
    {
      regionId: 'page.hero',
      regionName: 'HERO',
      category: 'HIERARCHY',
      normalizedY: 0.08,
      normalizedHeight: 0.22,
      hierarchyWeight: 1,
    },
    {
      regionId: 'page.content',
      regionName: 'CONTENT RAIL',
      category: 'DENSITY',
      normalizedY: 0.3,
      normalizedHeight: 0.55,
      hierarchyWeight: 0.7,
    },
    {
      regionId: 'page.bottom-nav',
      regionName: 'BOTTOM NAV',
      category: 'NAVIGATION',
      normalizedY: 0.88,
      normalizedHeight: 0.12,
      hierarchyWeight: 0.75,
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
