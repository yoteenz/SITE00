/**
 * P0.VR.3M.1 — Design workspace host shell completion types.
 */

export const P0_VR_3M1_LINEAGE = 'P0.VR.3M.1-SITE00' as const;

export type DesignHostMenu = 'NONE' | 'NOTIFICATIONS' | 'OVERFLOW';

export type DesignWorkspaceOverflowActionId =
  | 'capture_implementation'
  | 'open_live_route'
  | 'copy_design_link'
  | 'open_review_tab'
  | 'open_pages_tab'
  | 'open_inspect_tab';

export type DesignWorkspaceOverflowAction = {
  id: DesignWorkspaceOverflowActionId;
  label: string;
  enabled: boolean;
  disabledReason?: string;
  externalHref?: string;
};

export type DesignWorkspaceHostIconRecord = {
  controlId: string;
  legacySource: string;
  currentSource: string;
  replacementStatus: 'REPLACED' | 'CANONICAL';
};
