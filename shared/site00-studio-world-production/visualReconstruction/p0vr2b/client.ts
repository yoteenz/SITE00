/** Browser-safe P0.VR.2B exports. */
export {
  P0_VR_2B_LINEAGE,
  P0_VR_2B_FAILURE_CODES,
  SITE00_DESIGN_WORKSPACE_REFERENCE_PATH,
  SITE00_DESIGN_NAV_ITEMS,
  DESIGN_WORKSPACE_SUBTITLE,
} from './constants.js';
export type { DesignWorkspaceTab, VisualMatchResult, DesignWorkspaceActivityEntry } from './types.js';
export { MOBILE_TAB_LABELS } from './types.js';
export {
  getSite00DesignWorkspaceVisualAuthority,
  designWorkspaceFullReferenceAuthorityRegistered,
  desktopMobileDesignAuthorityIndependent,
} from './designWorkspaceReferenceRegistry.js';
export {
  getDesignWorkspaceDesktopImplementationSpec,
  getDesignWorkspaceMobileImplementationSpec,
} from './designWorkspaceVisualSpecs.js';
export { computeDesignWorkspaceVisualMatch } from './designWorkspaceVisualMatch.js';
export { buildDesignWorkspaceActivity } from './designWorkspaceActivity.js';
export { buildDesignWorkspaceQuickActions } from './designWorkspaceQuickActions.js';
export {
  parseDesignWorkspaceUrlState,
  buildDesignWorkspaceUrlState,
  designWorkspaceDeepLinkSupported,
} from './designWorkspaceUrlState.js';
