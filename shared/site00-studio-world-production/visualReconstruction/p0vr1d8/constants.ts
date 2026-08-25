/**
 * P0.VR.1D.8 — Lab / Experiment 01 correction constants.
 */

export const P0_VR_1D8_LINEAGE = 'P0.VR.1D.8' as const;

export const FAIL_LAB_HEADER_DRIFT = 'FAIL_LAB_HEADER_DRIFT' as const;
export const FAIL_LAB_BREADCRUMB_DRIFT = 'FAIL_LAB_BREADCRUMB_DRIFT' as const;
export const FAIL_LAB_TITLE_STATUS_ALIGNMENT = 'FAIL_LAB_TITLE_STATUS_ALIGNMENT' as const;
export const FAIL_LAB_METRICS_GEOMETRY_DRIFT = 'FAIL_LAB_METRICS_GEOMETRY_DRIFT' as const;
export const FAIL_LAB_METRIC_DIVIDER_MISSING = 'FAIL_LAB_METRIC_DIVIDER_MISSING' as const;
export const FAIL_EXPERIMENT_GRID_GEOMETRY_DRIFT = 'FAIL_EXPERIMENT_GRID_GEOMETRY_DRIFT' as const;
export const FAIL_EXPERIMENT_CARD_ARTWORK_MISSING = 'FAIL_EXPERIMENT_CARD_ARTWORK_MISSING' as const;
export const FAIL_SELECTED_CARD_BORDER_DRIFT = 'FAIL_SELECTED_CARD_BORDER_DRIFT' as const;
export const FAIL_CURRENT_DIRECTION_GEOMETRY_DRIFT = 'FAIL_CURRENT_DIRECTION_GEOMETRY_DRIFT' as const;
export const FAIL_RATING_ALIGNMENT_DRIFT = 'FAIL_RATING_ALIGNMENT_DRIFT' as const;
export const FAIL_INSPECT_BUTTON_DRIFT = 'FAIL_INSPECT_BUTTON_DRIFT' as const;
export const FAIL_LAB_BOTTOM_NAV_ACTIVE_STATE_DRIFT = 'FAIL_LAB_BOTTOM_NAV_ACTIVE_STATE_DRIFT' as const;

export const NDX_EXPERIMENT_01_REFERENCE_PATH =
  'visual-references/founder/ndxbook/mobile-lab-experiment-01-reference.png' as const;

export const NDX_EXPERIMENT_01_ROUTE =
  '/projects/ndxbook/marketing-expression/experiment-01' as const;

export const NDX_EXPERIMENT_01_ROUTE_SEARCH = '?site00MobileLayout=1' as const;

export const NDX_EXPERIMENT_01_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
} as const;

export const NDX_EXPERIMENT_01_VR_REGION_IDS = [
  'ndx.lab.header',
  'ndx.lab.breadcrumb',
  'ndx.lab.title',
  'ndx.lab.subject',
  'ndx.lab.metrics',
  'ndx.lab.grid',
  'ndx.lab.card.1',
  'ndx.lab.card.2',
  'ndx.lab.card.3',
  'ndx.lab.card.4',
  'ndx.lab.card.5',
  'ndx.lab.card.6',
  'ndx.lab.card.7',
  'ndx.lab.card.8',
  'ndx.lab.card.9',
  'ndx.lab.direction',
  'ndx.lab.inspect',
  'ndx.lab.bottom-nav',
] as const;
