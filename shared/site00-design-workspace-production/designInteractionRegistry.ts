/**
 * P0.VR.DESIGN-INTERACTION-COVERAGE1 — element-level interaction inventory.
 */

export type DesignInteractionActionType =
  | 'READONLY'
  | 'NAVIGATION'
  | 'OVERLAY'
  | 'STATE_MUTATION'
  | 'COST_BEARING'
  | 'PERMISSION_GATED'
  | 'DISABLED';

export type DesignInteractionSurface =
  | 'header'
  | 'context-bar'
  | 'view-controls'
  | 'target-band'
  | 'viewport-band'
  | 'stage-band'
  | 'hero'
  | 'hero-rail'
  | 'authority-pair'
  | 'gallery'
  | 'candidate-actions'
  | 'structured-output'
  | 'pipeline'
  | 'concept-record'
  | 'bottom-nav'
  | 'primary-nav'
  | 'overlay'
  | 'opus-dock';

export type DesignInteractionEntry = {
  id: string;
  label: string;
  surface: DesignInteractionSurface;
  semanticRole: string;
  actionType: DesignInteractionActionType;
  /** Workspace/production handler key — must exist in coverage allowlist when not readonly. */
  handler: string;
  destination?: string;
  readonly?: boolean;
  permission?: 'founder' | 'any';
};

export const DESIGN_INTERACTION_REGISTRY: readonly DesignInteractionEntry[] = [
  { id: 'header-overflow', label: 'Workspace overflow', surface: 'header', semanticRole: 'utility-menu', actionType: 'OVERLAY', handler: 'openOverflowMenu' },
  { id: 'header-host-nav', label: 'Host module nav', surface: 'header', semanticRole: 'host-navigation', actionType: 'OVERLAY', handler: 'openHostModuleNav' },
  { id: 'view-row-opus', label: 'Open Opus design agent', surface: 'view-controls', semanticRole: 'agent-entry', actionType: 'OVERLAY', handler: 'openOpusDock' },
  { id: 'view-row-grok', label: 'Open Grok asset agent', surface: 'view-controls', semanticRole: 'agent-entry', actionType: 'OVERLAY', handler: 'openGrokDock' },
  { id: 'context-creative', label: 'Project creative context', surface: 'context-bar', semanticRole: 'intelligence-drawer', actionType: 'OVERLAY', handler: 'openCreativeContext' },
  { id: 'view-mode-canonical', label: 'Canonical view', surface: 'view-controls', semanticRole: 'presentation-mode', actionType: 'STATE_MUTATION', handler: 'setViewModeCanonical' },
  { id: 'view-mode-list', label: 'List view', surface: 'view-controls', semanticRole: 'presentation-mode', actionType: 'STATE_MUTATION', handler: 'setViewModeList' },
  { id: 'target-readonly', label: 'Target context', surface: 'target-band', semanticRole: 'readonly-display', actionType: 'READONLY', handler: 'readonly', readonly: true },
  { id: 'viewport-mobile', label: 'Mobile viewport', surface: 'viewport-band', semanticRole: 'preview-mode', actionType: 'STATE_MUTATION', handler: 'selectViewportMobile' },
  { id: 'viewport-tablet', label: 'Tablet viewport', surface: 'viewport-band', semanticRole: 'derived-preview', actionType: 'STATE_MUTATION', handler: 'selectViewportTablet' },
  { id: 'viewport-desktop', label: 'Desktop viewport', surface: 'viewport-band', semanticRole: 'preview-mode', actionType: 'STATE_MUTATION', handler: 'selectViewportDesktop' },
  { id: 'rail-select-mobile', label: 'Select for mobile', surface: 'hero-rail', semanticRole: 'viewport-candidate-select', actionType: 'STATE_MUTATION', handler: 'selectForMobile', permission: 'founder' },
  { id: 'rail-select-desktop', label: 'Select for desktop', surface: 'hero-rail', semanticRole: 'viewport-candidate-select', actionType: 'STATE_MUTATION', handler: 'selectForDesktop', permission: 'founder' },
  { id: 'rail-promote-mobile', label: 'Promote mobile', surface: 'hero-rail', semanticRole: 'authority-promote', actionType: 'PERMISSION_GATED', handler: 'promoteMobile', permission: 'founder' },
  { id: 'rail-promote-desktop', label: 'Promote desktop', surface: 'hero-rail', semanticRole: 'authority-promote', actionType: 'PERMISSION_GATED', handler: 'promoteDesktop', permission: 'founder' },
  { id: 'rail-pair-review', label: 'Pair review', surface: 'hero-rail', semanticRole: 'inspection-overlay', actionType: 'OVERLAY', handler: 'runPairReview' },
  { id: 'rail-review-authority', label: 'Review authority', surface: 'hero-rail', semanticRole: 'authority-decision', actionType: 'OVERLAY', handler: 'openReviewAuthority' },
  { id: 'rail-lock-pair', label: 'Lock authority pair', surface: 'hero-rail', semanticRole: 'authority-lock', actionType: 'PERMISSION_GATED', handler: 'runLockAuthorityPair', permission: 'founder' },
  { id: 'pair-toggle', label: 'Authority pair expand', surface: 'authority-pair', semanticRole: 'disclosure', actionType: 'STATE_MUTATION', handler: 'toggleAuthorityPair' },
  { id: 'pair-replace-desktop', label: 'Replace desktop master', surface: 'authority-pair', semanticRole: 'viewport-candidate-select', actionType: 'STATE_MUTATION', handler: 'selectForDesktop', permission: 'founder' },
  { id: 'gallery-select-candidate', label: 'Select candidate', surface: 'gallery', semanticRole: 'candidate-select', actionType: 'STATE_MUTATION', handler: 'selectCandidate' },
  { id: 'gallery-compare', label: 'Compare concepts', surface: 'gallery', semanticRole: 'compare-overlay', actionType: 'OVERLAY', handler: 'openCompareConcepts' },
  { id: 'gallery-scroll', label: 'Gallery scroll', surface: 'gallery', semanticRole: 'scroll-control', actionType: 'STATE_MUTATION', handler: 'scrollGallery' },
  { id: 'candidate-refine', label: 'Refine concept', surface: 'candidate-actions', semanticRole: 'cost-bearing-refine', actionType: 'COST_BEARING', handler: 'refineConcept', permission: 'founder' },
  { id: 'candidate-regenerate', label: 'Regenerate concept', surface: 'candidate-actions', semanticRole: 'cost-bearing-regenerate', actionType: 'COST_BEARING', handler: 'regenerateConcept', permission: 'founder' },
  { id: 'candidate-inspect', label: 'Inspect candidate', surface: 'candidate-actions', semanticRole: 'inspector-overlay', actionType: 'OVERLAY', handler: 'openInspectCandidate' },
  { id: 'candidate-fullscreen', label: 'View fullscreen', surface: 'candidate-actions', semanticRole: 'fullscreen-viewer', actionType: 'OVERLAY', handler: 'openCandidateFullscreen' },
  { id: 'output-provenance', label: 'Structured output source', surface: 'structured-output', semanticRole: 'provenance-drawer', actionType: 'OVERLAY', handler: 'openProvenance' },
  { id: 'output-inspect', label: 'Inspect structured artifact', surface: 'structured-output', semanticRole: 'artifact-inspector', actionType: 'OVERLAY', handler: 'openStructuredArtifact' },
  { id: 'pipeline-readiness', label: 'Readiness receipt', surface: 'pipeline', semanticRole: 'readiness-drawer', actionType: 'OVERLAY', handler: 'openReadinessReceipt' },
  { id: 'pipeline-next-primary', label: 'Contextual primary action', surface: 'pipeline', semanticRole: 'next-action', actionType: 'STATE_MUTATION', handler: 'runContextualNextAction' },
  { id: 'pipeline-move-build', label: 'Move to build', surface: 'pipeline', semanticRole: 'workflow-transition', actionType: 'PERMISSION_GATED', handler: 'runMoveToBuild', permission: 'founder' },
  { id: 'concept-tab', label: 'Concept record tab', surface: 'concept-record', semanticRole: 'tab-select', actionType: 'STATE_MUTATION', handler: 'selectRecordTab' },
  { id: 'concept-amendment-view', label: 'View amendment', surface: 'concept-record', semanticRole: 'amendment-drawer', actionType: 'OVERLAY', handler: 'openAmendmentDetail' },
  { id: 'dock-workspace', label: 'Workspace', surface: 'bottom-nav', semanticRole: 'navigation', actionType: 'NAVIGATION', handler: 'goWorkspace' },
  { id: 'dock-design-history', label: 'Design history', surface: 'bottom-nav', semanticRole: 'navigation', actionType: 'NAVIGATION', handler: 'goDesignHistory' },
  { id: 'dock-feature-change', label: 'Feature change history', surface: 'bottom-nav', semanticRole: 'navigation', actionType: 'NAVIGATION', handler: 'goChangeHistory' },
  { id: 'dock-master-amendment', label: 'Master amendment status', surface: 'bottom-nav', semanticRole: 'navigation', actionType: 'NAVIGATION', handler: 'goMasterAmendment' },
  { id: 'dock-next-action', label: 'Contextual next action', surface: 'bottom-nav', semanticRole: 'next-action', actionType: 'STATE_MUTATION', handler: 'runContextualNextAction' },
  { id: 'nav-references', label: 'References', surface: 'primary-nav', semanticRole: 'section-route', actionType: 'NAVIGATION', handler: 'goSectionReferences' },
  { id: 'nav-assets', label: 'Assets', surface: 'primary-nav', semanticRole: 'section-route', actionType: 'NAVIGATION', handler: 'goSectionAssets' },
  { id: 'nav-pages', label: 'Pages', surface: 'primary-nav', semanticRole: 'section-route', actionType: 'NAVIGATION', handler: 'goSectionPages' },
  { id: 'nav-skins', label: 'Skins', surface: 'primary-nav', semanticRole: 'section-route', actionType: 'NAVIGATION', handler: 'goSectionSkins' },
  { id: 'nav-history', label: 'History', surface: 'primary-nav', semanticRole: 'section-route', actionType: 'NAVIGATION', handler: 'goSectionHistory' },
  { id: 'nav-more', label: 'More', surface: 'primary-nav', semanticRole: 'section-route', actionType: 'NAVIGATION', handler: 'goSectionMore' },
] as const;

export const DESIGN_INTERACTION_HANDLER_ALLOWLIST = [
  'readonly',
  'openOverflowMenu',
  'openHostModuleNav',
  'openOpusDock',
  'openGrokDock',
  'openCreativeContext',
  'setViewModeCanonical',
  'setViewModeList',
  'selectViewportMobile',
  'selectViewportTablet',
  'selectViewportDesktop',
  'selectForMobile',
  'selectForDesktop',
  'promoteMobile',
  'promoteDesktop',
  'runPairReview',
  'openReviewAuthority',
  'runLockAuthorityPair',
  'toggleAuthorityPair',
  'selectCandidate',
  'openCompareConcepts',
  'scrollGallery',
  'refineConcept',
  'regenerateConcept',
  'openInspectCandidate',
  'openCandidateFullscreen',
  'openProvenance',
  'openStructuredArtifact',
  'openReadinessReceipt',
  'runContextualNextAction',
  'runMoveToBuild',
  'selectRecordTab',
  'openAmendmentDetail',
  'goWorkspace',
  'goDesignHistory',
  'goChangeHistory',
  'goMasterAmendment',
  'goSectionReferences',
  'goSectionAssets',
  'goSectionPages',
  'goSectionSkins',
  'goSectionHistory',
  'goSectionMore',
] as const;
