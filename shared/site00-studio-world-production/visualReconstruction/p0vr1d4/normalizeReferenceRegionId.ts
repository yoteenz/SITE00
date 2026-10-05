/**
 * P0.VR.1D.4 — Canonical region ID normalization.
 */

import {
  NDX_DESKTOP_SCREEN_SPECS,
  NDX_MOBILE_SCREEN_SPECS,
  NDX_DESKTOP_BOARD_REGIONS,
} from '../../../site00-brand-lore/visualReconstruction/ndxProjectHubReferenceDecomposition.js';

const DECOMPOSITION_ROLE_MAP: Record<string, string> = {
  'region-global_shell-0': 'ndx.header',
  'region-owner_control-1': 'ndx.header',
  'region-local_nav-2': 'ndx.rail.nav',
  'region-hero-3': 'ndx.overview.hero',
  'region-method_stage-4': 'ndx.experiment.grid',
  'region-experiment_group-5': 'ndx.experiment.grid',
  'region-secondary_nav-6': 'ndx.radar.list',
  'region-bottom_nav-7': 'ndx.bottom-nav',
};

function buildBoardRegionMap(): Record<string, string> {
  return Object.fromEntries(
    NDX_DESKTOP_BOARD_REGIONS.map((r) => {
      switch (r.regionId) {
        case 'LEFT_RAIL':
          return [r.regionId, 'ndx.rail.nav'];
        case 'OVERVIEW_PANEL':
          return [r.regionId, 'ndx.overview.hero'];
        case 'CAMPAIGN_BOARD':
          return [r.regionId, 'ndx.campaign.pages-lane'];
        case 'EXPERIMENT_01':
          return [r.regionId, 'ndx.experiment.grid'];
        case 'CULTURAL_INTELLIGENCE':
          return [r.regionId, 'ndx.cultural-intelligence.radar'];
        case 'CHARACTER_LAB':
          return [r.regionId, 'ndx.character.profile'];
        case 'PERFORMANCE_LEARNING':
          return [r.regionId, 'ndx.performance.learning'];
        case 'CONTENT_OPS_DESK':
          return [r.regionId, 'ndx.content-ops.desk'];
        case 'FOOTER_NAV':
          return [r.regionId, 'ndx.bottom-nav'];
        default:
          return [r.regionId, `ndx.${r.regionId.toLowerCase()}`];
      }
    }),
  );
}

let boardRegionMapCache: Record<string, string> | null = null;

function boardRegionMap(): Record<string, string> {
  if (!boardRegionMapCache) {
    boardRegionMapCache = buildBoardRegionMap();
  }
  return boardRegionMapCache;
}

const SCREEN_ID_MAP: Record<string, string> = {
  MOBILE_OVERVIEW: 'ndx.overview.hero',
  MOBILE_OVERVIEW_MENU_OPEN: 'ndx.overview.hero',
  DESKTOP_COMPOSITE_OVERVIEW: 'ndx.overview.desktop-composite',
  DESKTOP_CAMPAIGN_BOARD: 'ndx.campaign.pages-lane',
  DESKTOP_EXPERIMENT_01: 'ndx.experiment.grid',
  DESKTOP_CONTENT_OPS: 'ndx.content-ops.desk',
  DESKTOP_CULTURAL_INTELLIGENCE: 'ndx.cultural-intelligence.radar',
  DESKTOP_CHARACTER_LAB: 'ndx.character.profile',
  MOBILE_CAMPAIGN: 'ndx.campaign.week-header',
  MOBILE_EXPERIMENT_01: 'ndx.experiment.grid',
  MOBILE_CONTENT_OPS: 'ndx.content-ops.desk',
  MOBILE_CULTURAL_INTELLIGENCE: 'ndx.cultural-intelligence.radar',
  MOBILE_CHARACTER_LAB: 'ndx.character.profile',
};

const LEGACY_DOM_MAP: Record<string, string> = {
  'ndx-header': 'ndx.header',
  'ndx-overview-heading': 'ndx.overview.hero',
  'ndx-metrics': 'ndx.overview.metrics',
  'ndx-production': 'ndx.production.row',
  'ndx-radar': 'ndx.radar.list',
  'ndx-bottom-nav': 'ndx.bottom-nav',
  'ndx-project-menu': 'ndx.project.menu',
};

const LABEL_NORMALIZATION: Array<{ pattern: RegExp; canonicalRegionId: string }> = [
  { pattern: /pages?\s*lane|the pages|pages\s*\(/i, canonicalRegionId: 'ndx.campaign.pages-lane' },
  { pattern: /margins?\s*lane|the margins/i, canonicalRegionId: 'ndx.campaign.margins-lane' },
  { pattern: /book in motion|motion/i, canonicalRegionId: 'ndx.campaign.motion-lane' },
  { pattern: /week\s*0?1|campaign board/i, canonicalRegionId: 'ndx.campaign.week-header' },
  { pattern: /overview|content operations/i, canonicalRegionId: 'ndx.overview.hero' },
  { pattern: /metrics|being made|need your eye/i, canonicalRegionId: 'ndx.overview.metrics' },
  { pattern: /production|in production/i, canonicalRegionId: 'ndx.production.row' },
  { pattern: /radar|on ndx/i, canonicalRegionId: 'ndx.radar.list' },
  { pattern: /experiment/i, canonicalRegionId: 'ndx.experiment.grid' },
  { pattern: /cultural intelligence/i, canonicalRegionId: 'ndx.cultural-intelligence.radar' },
  { pattern: /character lab|character profile/i, canonicalRegionId: 'ndx.character.profile' },
  { pattern: /content ops/i, canonicalRegionId: 'ndx.content-ops.desk' },
  { pattern: /bottom nav|mobile nav/i, canonicalRegionId: 'ndx.bottom-nav' },
  { pattern: /header|rail/i, canonicalRegionId: 'ndx.header' },
];

export function normalizeReferenceRegionId(input: {
  referenceRegionId: string;
  screenId?: string;
  label?: string;
}): { canonicalRegionId: string; mappingSource: 'EXACT_SEMANTIC' | 'MANUAL_CANONICAL_MAP' | 'INFERRED' | 'LEGACY_ALIAS' } {
  const id = input.referenceRegionId.trim();

  if (id.startsWith('ndx.') && !id.includes(' ')) {
    return { canonicalRegionId: id, mappingSource: 'EXACT_SEMANTIC' };
  }

  if (LEGACY_DOM_MAP[id]) {
    return { canonicalRegionId: LEGACY_DOM_MAP[id]!, mappingSource: 'LEGACY_ALIAS' };
  }

  if (DECOMPOSITION_ROLE_MAP[id]) {
    return { canonicalRegionId: DECOMPOSITION_ROLE_MAP[id]!, mappingSource: 'MANUAL_CANONICAL_MAP' };
  }

  const regions = boardRegionMap();
  if (regions[id]) {
    return { canonicalRegionId: regions[id]!, mappingSource: 'MANUAL_CANONICAL_MAP' };
  }

  if (input.screenId && SCREEN_ID_MAP[input.screenId] && id === input.screenId) {
    return { canonicalRegionId: SCREEN_ID_MAP[input.screenId]!, mappingSource: 'MANUAL_CANONICAL_MAP' };
  }

  if (input.label) {
    for (const rule of LABEL_NORMALIZATION) {
      if (rule.pattern.test(input.label)) {
        return { canonicalRegionId: rule.canonicalRegionId, mappingSource: 'INFERRED' };
      }
    }
  }

  const screenSpec = [...NDX_DESKTOP_SCREEN_SPECS, ...NDX_MOBILE_SCREEN_SPECS].find((s) => s.screenId === id);
  if (screenSpec && SCREEN_ID_MAP[screenSpec.screenId]) {
    return { canonicalRegionId: SCREEN_ID_MAP[screenSpec.screenId]!, mappingSource: 'MANUAL_CANONICAL_MAP' };
  }

  return { canonicalRegionId: id.replace(/_/g, '.').toLowerCase(), mappingSource: 'INFERRED' };
}

export function canonicalRegionIdsForScreen(screenId: string): string[] {
  const base = SCREEN_ID_MAP[screenId];
  const shared = ['ndx.header', 'ndx.bottom-nav', 'ndx.project.menu'];
  switch (screenId) {
    case 'MOBILE_OVERVIEW':
    case 'MOBILE_OVERVIEW_MENU_OPEN':
      return [...shared, 'ndx.overview.hero', 'ndx.overview.metrics', 'ndx.production.row', 'ndx.radar.list'];
    case 'DESKTOP_COMPOSITE_OVERVIEW':
      return [...shared, 'ndx.rail.nav', 'ndx.overview.desktop-composite', 'ndx.campaign.pages-lane', 'ndx.experiment.grid'];
    case 'DESKTOP_CAMPAIGN_BOARD':
    case 'MOBILE_CAMPAIGN':
      return [...shared, 'ndx.campaign.week-header', 'ndx.campaign.pages-lane', 'ndx.campaign.margins-lane', 'ndx.campaign.motion-lane'];
    case 'DESKTOP_EXPERIMENT_01':
    case 'MOBILE_EXPERIMENT_01':
      return [...shared, 'ndx.experiment.grid'];
    case 'DESKTOP_CONTENT_OPS':
    case 'MOBILE_CONTENT_OPS':
      return [...shared, 'ndx.content-ops.desk'];
    case 'DESKTOP_CULTURAL_INTELLIGENCE':
    case 'MOBILE_CULTURAL_INTELLIGENCE':
      return [...shared, 'ndx.cultural-intelligence.radar'];
    case 'DESKTOP_CHARACTER_LAB':
    case 'MOBILE_CHARACTER_LAB':
      return [...shared, 'ndx.character.profile', 'ndx.performance.learning'];
    default:
      return base ? [...shared, base] : shared;
  }
}
