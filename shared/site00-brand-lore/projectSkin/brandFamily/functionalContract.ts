/**
 * ModuleFunctionalContract — same semantics, different skin grammar.
 */

import type { ModuleFunctionalContract, StandardScreenType } from './types.js';

const PROJECT_OVERVIEW_CONTRACT: ModuleFunctionalContract = {
  moduleId: 'OVERVIEW',
  screenType: 'PROJECT_OVERVIEW',
  mustPreserve: [
    'PROJECT_IDENTITY',
    'PROJECT_PROGRESS',
    'VIEW_AS',
    'ENABLED_MODULES',
    'PROJECT_SIGNALS',
    'CURRENT_FOCUS',
    'NEXT_MILESTONE',
    'RECENT_RELEVANT_ACTIVITY',
    'PRIMARY_CTA',
  ],
  canVary: [
    'REGION_ORDER',
    'COLUMN_ROW_RELATIONSHIPS',
    'PANEL_SHAPES',
    'HERO_PLACEMENT',
    'METRIC_GROUPING',
    'STATUS_PRESENTATION',
    'ACTIVITY_PRESENTATION',
    'CARD_LAYOUT',
  ],
  moduleSpecificFreedom: ['skinCompositionFreedom=HIGH'],
};

const MODULE_CONTRACTS: Record<string, ModuleFunctionalContract> = {
  PROJECT_OVERVIEW: PROJECT_OVERVIEW_CONTRACT,
  IDENTITY: {
    moduleId: 'IDENTITY',
    screenType: 'IDENTITY',
    mustPreserve: ['BRAND_IDENTITY', 'FIELD_TAGS', 'PRIMARY_COLOR', 'EXPRESSION_PROFILE'],
    canVary: ['LAYOUT', 'HERO', 'PANEL_SYSTEM', 'IMAGE_TREATMENT'],
    moduleSpecificFreedom: ['skinCompositionFreedom=HIGH'],
  },
  BUILDER: {
    moduleId: 'BUILDER',
    screenType: 'BUILDER',
    mustPreserve: ['PAGE_STRUCTURE', 'MODULE_ENTITLEMENTS', 'BUILD_ACTIONS'],
    canVary: ['PANEL_GRAMMAR', 'WORKSPACE_DENSITY', 'TOOL_PRESENTATION'],
    moduleSpecificFreedom: ['skinCompositionFreedom=HIGH'],
  },
  EVOLVE: {
    moduleId: 'EVOLVE',
    screenType: 'EVOLVE',
    mustPreserve: ['EVOLVE_PIPELINE', 'CAMPAIGN_LOGIC', 'CONTENT_OPS', 'SPECIALIZED_SUBSHELL'],
    canVary: ['SUBSHELL_LAYOUT', 'PANEL_DENSITY', 'SIGNAL_PRESENTATION'],
    moduleSpecificFreedom: ['skinCompositionFreedom=HIGH', 'PRESERVE_NDX_SPECIALIZATION'],
  },
  PRODUCTION: {
    moduleId: 'PRODUCTION',
    screenType: 'PRODUCTION',
    mustPreserve: ['PRODUCTION_QUEUE', 'STATUS_SIGNALS', 'OUTPUT_ACTIONS'],
    canVary: ['GRID_VS_LIST', 'METRIC_TILES', 'HERO_PLACEMENT'],
    moduleSpecificFreedom: ['skinCompositionFreedom=HIGH'],
  },
  REVIEWS: {
    moduleId: 'REVIEWS',
    screenType: 'REVIEWS',
    mustPreserve: ['REVIEW_QUEUE', 'APPROVAL_ACTIONS', 'FEEDBACK_LOOP'],
    canVary: ['CARD_SYSTEM', 'TIMELINE_VS_GRID'],
    moduleSpecificFreedom: ['skinCompositionFreedom=HIGH'],
  },
  LIBRARY: {
    moduleId: 'LIBRARY',
    screenType: 'LIBRARY',
    mustPreserve: ['ASSET_BROWSE', 'FILTER', 'PREVIEW'],
    canVary: ['GRID_DENSITY', 'THUMBNAIL_TREATMENT'],
    moduleSpecificFreedom: ['skinCompositionFreedom=HIGH'],
  },
  CONTROL_ROOM: {
    moduleId: 'CONTROL_ROOM',
    screenType: 'CONTROL_ROOM',
    mustPreserve: ['SYSTEM_SIGNALS', 'ADMIN_CONTROLS', 'PERMISSION_GATES'],
    canVary: ['DASHBOARD_LAYOUT', 'METRIC_GROUPING'],
    moduleSpecificFreedom: ['skinCompositionFreedom=HIGH'],
  },
};

export function getModuleFunctionalContract(screenType: StandardScreenType | string): ModuleFunctionalContract {
  const key = String(screenType).toUpperCase().replace(/\s+/g, '_');
  return (
    MODULE_CONTRACTS[key] ?? {
      moduleId: key,
      screenType: key,
      mustPreserve: ['MODULE_SEMANTICS'],
      canVary: ['COMPOSITION', 'SURFACE', 'DENSITY'],
      moduleSpecificFreedom: ['skinCompositionFreedom=HIGH'],
    }
  );
}

export function moduleLogicSurvivesSkinChange(contract: ModuleFunctionalContract): boolean {
  return contract.mustPreserve.length > 0 && contract.moduleSpecificFreedom.includes('skinCompositionFreedom=HIGH');
}
