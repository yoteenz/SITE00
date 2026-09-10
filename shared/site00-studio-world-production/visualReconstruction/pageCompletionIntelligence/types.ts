/**
 * Page Completion + Interaction Intelligence — core types.
 * P0.VR.7 — system-level page experience completion.
 */

export const PCI_AFFORDANCE_TYPES = [
  'BUTTON',
  'LINK',
  'TAB',
  'TOGGLE',
  'SEGMENTED_CONTROL',
  'DROPDOWN',
  'CHEVRON',
  'CARD_ACTION',
  'EXPANDER',
  'MODAL_TRIGGER',
  'SHEET_TRIGGER',
  'POPOVER_TRIGGER',
  'FILTER',
  'SORT',
  'SEARCH',
  'PAGINATION',
  'NEXT',
  'PREVIOUS',
  'UPLOAD',
  'EDIT',
  'DELETE',
  'VIEW',
  'REVIEW',
  'MANAGE',
  'SUBMIT',
  'CANCEL',
  'BACK',
  'CUSTOM_ACTION',
] as const;

export type PageAffordanceType = (typeof PCI_AFFORDANCE_TYPES)[number];

export const PCI_TARGET_TYPES = [
  'ROUTE',
  'CHILD_ROUTE',
  'NESTED_ROUTE',
  'TAB_STATE',
  'TOGGLE_STATE',
  'MODAL',
  'SHEET',
  'DRAWER',
  'POPOVER',
  'INLINE_EXPANSION',
  'FILTER_STATE',
  'SORT_STATE',
  'EXTERNAL_ACTION',
  'DOWNLOAD',
  'SUBMIT_MUTATION',
  'NO_OP_INTENTIONAL',
] as const;

export type PageInteractionTargetType = (typeof PCI_TARGET_TYPES)[number];

export const PCI_COMPLETION_STATUSES = [
  'PRIMARY_SCREEN_ONLY',
  'INTERACTION_DISCOVERY',
  'CHILD_SURFACES_REQUIRED',
  'IMPLEMENTING_CHILDREN',
  'FUNCTIONAL_QA',
  'VISUAL_QA',
  'COMPLETE',
  'BLOCKED',
] as const;

export type PageCompletionStatus = (typeof PCI_COMPLETION_STATUSES)[number];

export const PCI_CONTRACT_STATUSES = [
  'RESOLVED',
  'PLANNED',
  'IMPLEMENTED',
  'AMBIGUOUS',
  'BLOCKED',
  'NO_OP_INTENTIONAL',
] as const;

export type PageInteractionContractStatus = (typeof PCI_CONTRACT_STATUSES)[number];

export type PageInteractionContract = {
  interactionId: string;
  pageId: string;
  regionId: string;
  label: string;
  affordanceType: PageAffordanceType;
  intent: string;
  targetType: PageInteractionTargetType;
  targetId?: string;
  route?: string;
  stateTransition?: string;
  permissionRequirement?: string;
  dataRequirement?: string;
  childSurfaceRequirement?: string;
  returnPath?: string;
  status: PageInteractionContractStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  mobilePresentation?: 'SHEET' | 'FULL_ROUTE' | 'MODAL';
  desktopPresentation?: 'PANEL' | 'FULL_ROUTE' | 'MODAL' | 'POPOVER';
};

export type PageVisualInheritanceContract = {
  parentAuthorityId: string | null;
  skinId: string | null;
  hostShellRules: string[];
  typographyRules: string[];
  colorRules: string[];
  surfaceRules: string[];
  spacingRules: string[];
  componentRules: string[];
  allowedVariation: string[];
  prohibitedFallbacks: string[];
};

export type RequiredChildSurface = {
  childSurfaceId: string;
  label: string;
  targetType: PageInteractionTargetType;
  route?: string;
  parentInteractionId: string;
  inheritance: PageVisualInheritanceContract;
  implementationStatus: 'MISSING' | 'PLANNED' | 'IMPLEMENTED' | 'QA_PASSED';
  hasAuthority: boolean;
};

export type PageCompletionPlan = {
  pageId: string;
  primaryRoute: string;
  interactionContracts: PageInteractionContract[];
  requiredChildSurfaces: RequiredChildSurface[];
  requiredRoutes: string[];
  requiredStates: string[];
  requiredAssets: string[];
  requiredDataBindings: string[];
  requiredPermissions: string[];
  requiredEmptyStates: string[];
  requiredLoadingStates: string[];
  requiredErrorStates: string[];
  implementationStatus: PageCompletionStatus;
  completionStatus: PageCompletionStatus;
};

export type PageInteractionGraphNode = {
  nodeId: string;
  kind: 'ROUTE' | 'CHILD_SURFACE' | 'STATE';
  label: string;
  route?: string;
};

export type PageInteractionGraphEdge = {
  from: string;
  to: string;
  edgeType: 'CLICK' | 'TOGGLE' | 'SELECT' | 'SUBMIT' | 'BACK' | 'CLOSE' | 'SUCCESS' | 'FAILURE' | 'NEXT' | 'PREVIOUS';
  interactionId?: string;
};

export type PageInteractionGraph = {
  pageId: string;
  nodes: PageInteractionGraphNode[];
  edges: PageInteractionGraphEdge[];
};

export type PageInteractionCoverage = {
  detected: number;
  resolved: number;
  implemented: number;
  qaPassed: number;
  blocked: number;
  coveragePercent: number;
};

export type PageExperienceImplementationJob = {
  projectId: string;
  pageId: string;
  primaryScreenAuthorityId: string | null;
  completionPlan: PageCompletionPlan;
  interactionGraph: PageInteractionGraph;
  childSurfacePlans: RequiredChildSurface[];
  assetJobs: string[];
  implementationStatus: PageCompletionStatus;
  functionalQaStatus: 'NOT_RUN' | 'PASS' | 'FAIL';
  visualQaStatus: 'NOT_RUN' | 'PASS' | 'FAIL';
  completionGate: PageCompletenessGateResult;
};

export type PageCompletenessGateResult = {
  passed: boolean;
  failureCodes: string[];
  unresolvedCount: number;
  orphanCount: number;
  missingChildCount: number;
  missingRouteCount: number;
};

export type PageCompletionInspectorState = {
  pageId: string;
  route: string;
  detectedInteractions: number;
  resolvedInteractions: number;
  childSurfaceCount: number;
  missingChildCount: number;
  routeCount: number;
  orphanCount: number;
  interactionCoverage: PageInteractionCoverage;
  completionStatus: PageCompletionStatus;
  assetJobs: string[];
  visualQaStatus: string;
  ambiguousActions: string[];
};

export const PCI_FAILURE_CODES = [
  'PAGE_INTERACTION_UNRESOLVED',
  'PAGE_VISIBLE_ACTION_NO_IMPLEMENTATION',
  'PAGE_CHILD_SURFACE_MISSING',
  'PAGE_CHILD_ROUTE_MISSING',
  'PAGE_CHILD_ROUTE_DUPLICATE',
  'PAGE_CHILD_NO_RETURN_PATH',
  'PAGE_CHILD_PERMISSION_BREACH',
  'PAGE_CHILD_GENERIC_UI_FALLBACK',
  'PAGE_INTERACTION_GRAPH_ORPHAN',
  'PAGE_ROUTE_GRAPH_ORPHAN',
  'PAGE_COMPLETION_FALSE_PASS',
  'PAGE_CHILD_VISUAL_COHESION_FAILED',
  'PAGE_CHILD_ASSET_PIPELINE_BYPASSED',
  'PAGE_COMPLETION_RECURSION_LOOP',
  'PAGE_CHILD_LINK_MISSING',
  'CHILD_RETURN_PATH_MISSING',
] as const;

export type PciFailureCode = (typeof PCI_FAILURE_CODES)[number];

export type PageExperienceInput = {
  projectId: string;
  pageId: string;
  primaryRoute: string;
  moduleScreenType?: string;
  parentAuthorityId?: string | null;
  skinId?: string | null;
  /** Declared interactions from blueprint / functional contract */
  declaredInteractions?: Array<Partial<PageInteractionContract> & { label: string; affordanceType: PageAffordanceType }>;
  /** Known existing routes in product */
  existingRoutes?: string[];
  /** DOM-detected affordance labels */
  domAffordances?: Array<{ label: string; affordanceType: PageAffordanceType; regionId?: string }>;
  depth?: number;
  visitedPageIds?: string[];
};
