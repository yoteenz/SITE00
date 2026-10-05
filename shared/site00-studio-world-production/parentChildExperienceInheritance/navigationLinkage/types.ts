/**
 * P0.PCI.2 — Route linkage contract + navigation wiring types.
 */

export const PCI_LINKAGE_RELATIONSHIPS = [
  'DIRECT_CHILD',
  'GRANDCHILD',
  'TAB_CHILD',
  'MODAL_CHILD',
  'DRAWER_CHILD',
  'WORKFLOW_CHILD',
  'DETAIL_CHILD',
  'UTILITY_CHILD',
] as const;

export type LinkageRelationship = (typeof PCI_LINKAGE_RELATIONSHIPS)[number];

export const PCI_NAVIGATION_MODES = [
  'ROUTE',
  'TAB_STATE',
  'MODAL',
  'DRAWER',
  'SHEET',
  'WORKFLOW_STEP',
  'EXTERNAL',
  'OTHER',
] as const;

export type NavigationMode = (typeof PCI_NAVIGATION_MODES)[number];

export const PCI_ROUTE_LINKAGE_STATUSES = [
  'WIRED',
  'PARTIAL',
  'BROKEN',
  'ORPHANED',
  'AMBIGUOUS',
  'UNIMPLEMENTED',
  'EXEMPT',
  'PLANNED',
  'PERMISSION_GATED',
  'STALE',
] as const;

export type RouteLinkageStatus = (typeof PCI_ROUTE_LINKAGE_STATUSES)[number];

export const PCI_INTERACTION_INTENTS = [
  'NAVIGATION',
  'STATE_CHANGE',
  'MUTATION',
  'SUBMISSION',
  'FILTER',
  'SORT',
  'DOWNLOAD',
  'EXTERNAL_LINK',
  'DESTRUCTIVE',
  'OTHER',
] as const;

export type InteractionIntent = (typeof PCI_INTERACTION_INTENTS)[number];

export const PCI_LINKAGE_SOURCE_TYPES = [
  'href',
  'Link',
  'NavLink',
  'router.push',
  'navigate',
  'setTab',
  'setWizardStep',
  'openModal',
  'openDrawer',
  'openSheet',
  'dispatchAction',
  'onClick',
  'customHandler',
] as const;

export type LinkageSourceType = (typeof PCI_LINKAGE_SOURCE_TYPES)[number];

export const PCI_SURFACE_GRAPH_NODE_KINDS = [
  'PAGE',
  'TAB',
  'MODAL',
  'DRAWER',
  'SHEET',
  'WORKFLOW_STEP',
  'DETAIL',
  'EDITOR',
  'UTILITY',
] as const;

export type SurfaceGraphNodeKind = (typeof PCI_SURFACE_GRAPH_NODE_KINDS)[number];

export const PCI_SURFACE_GRAPH_EDGE_KINDS = [
  'NAVIGATES_TO',
  'OPENS',
  'EXPANDS_TO',
  'CONTINUES_TO',
  'RETURNS_TO',
  'BELONGS_TO',
  'INHERITS_FROM',
] as const;

export type SurfaceGraphEdgeKind = (typeof PCI_SURFACE_GRAPH_EDGE_KINDS)[number];

export const PCI_LINKAGE_FAILURE_CODES = [
  'ORPHAN_CHILD_ROUTE',
  'DEAD_PARENT_ACTION',
  'MISWIRED_PARENT_ACTION',
  'PAGE_CHILD_LINK_MISSING',
  'CHILD_RETURN_PATH_MISSING',
  'STALE_LINKAGE',
  'AMBIGUOUS_LINKAGE',
  'TARGET_MISSING',
  'HANDLER_MISSING',
  'PARAM_MISSING',
  'PERMISSION_MISMATCH',
] as const;

export type LinkageFailureCode = (typeof PCI_LINKAGE_FAILURE_CODES)[number];

export type NavigationOrigin = {
  parentRoute: string;
  parentSurfaceId: string;
  originElementId: string;
  originElementLabel: string;
  originInteraction: LinkageSourceType;
  expectedReturnTarget: string;
  preserveState?: string[];
};

export type ParentChildLinkageContract = {
  linkageId: string;
  projectId: string;
  version: string;
  sourceParentRoute: string;
  sourceSurfaceId: string;
  sourceElementId: string;
  sourceElementType: 'CARD' | 'TILE' | 'BUTTON' | 'CTA' | 'TAB' | 'NAV_ITEM' | 'ROW' | 'ICON' | 'CAROUSEL' | 'MODULE' | 'OTHER';
  sourceLabel: string;
  sourceIntent: InteractionIntent;
  expectedRelationship: LinkageRelationship;
  targetChildRoute: string;
  targetSurfaceId: string;
  resolvedRuntimePath: string;
  resolvedNavigationAction: string;
  navigationMode: NavigationMode;
  backTarget: string;
  returnBehavior: string;
  navigationOrigin: NavigationOrigin;
  status: RouteLinkageStatus;
  errors: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  clickThroughVerified?: boolean;
  superseded?: boolean;
};

export type InteractiveSurfaceGraphNode = {
  nodeId: string;
  kind: SurfaceGraphNodeKind;
  route: string;
  surfaceId: string;
  label: string;
};

export type InteractiveSurfaceGraphEdge = {
  from: string;
  to: string;
  edgeKind: SurfaceGraphEdgeKind;
  linkageId?: string;
  navigationMode?: NavigationMode;
};

export type InteractiveSurfaceGraph = {
  graphId: string;
  projectId: string;
  nodes: InteractiveSurfaceGraphNode[];
  edges: InteractiveSurfaceGraphEdge[];
};

export type LinkageRepairPlan = {
  repairId: string;
  sourceRoute: string;
  sourceElement: string;
  currentBehavior: string;
  expectedTarget: string;
  proposedTarget: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  repairType: 'HREF_PREFIX' | 'ROUTE_RENAME' | 'HANDLER_WIRE' | 'RETURN_PATH' | 'OTHER';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  founderReviewRequired: boolean;
  applied?: boolean;
};

export type NavigationChainQAResult = {
  chainId: string;
  hops: string[];
  sourceElementExists: boolean;
  sourceInteractionActive: boolean;
  targetResolves: boolean;
  targetLoads: boolean;
  expectedSurfaceRenders: boolean;
  backPathWorks: boolean;
  statePreserved: boolean;
  passed: boolean;
  failureCodes: LinkageFailureCode[];
};

export type NavigationLinkageQAScore = {
  entryPoint: number;
  targetResolution: number;
  targetRender: number;
  contextPreservation: number;
  returnPath: number;
  grandchildContinuity: number;
  mobile: number;
  desktop: number;
  overall: number;
};

export type LinkageMatrixRow = {
  parent: string;
  sourceControl: string;
  child: string;
  grandchild: string | null;
  navMode: NavigationMode;
  wired: boolean;
  returnPath: string;
  status: RouteLinkageStatus;
  experienceStatus?: string;
  wiringStatus?: string;
};

export type ChildExperienceReadinessStatus =
  | 'CURRENT'
  | 'VISUAL_ONLY'
  | 'WIRED_ONLY'
  | 'PARTIAL'
  | 'BROKEN'
  | 'EXEMPT';

export type ChildExperienceReadiness = {
  childRoute: string;
  childSurfaceId: string;
  experienceInheritanceStatus: 'PASS' | 'FAIL' | 'NOT_RUN' | 'EXEMPT';
  navigationLinkageStatus: 'PASS' | 'FAIL' | 'NOT_RUN' | 'EXEMPT';
  functionalQAStatus: 'PASS' | 'FAIL' | 'NOT_RUN';
  derivedStatus: ChildExperienceReadinessStatus;
};

export type DeclaredParentAction = {
  elementId: string;
  label: string;
  elementType: ParentChildLinkageContract['sourceElementType'];
  intent?: InteractionIntent;
  targetCategory?: string;
  targetStep?: string;
  targetRoute?: string;
  navigationMode?: NavigationMode;
  sourceType?: LinkageSourceType;
  handlerRef?: string;
  relationship?: LinkageRelationship;
  returnLabel?: string;
  returnTarget?: string;
  preserveState?: string[];
  planned?: boolean;
  permissionGated?: boolean;
};

export type LinkageAuditInput = {
  projectId: string;
  parentRoute: string;
  parentSurfaceId: string;
  parentFamily: string;
  declaredActions: DeclaredParentAction[];
  existingRoutes: string[];
  existingSurfaces: string[];
  routerManifestRoutes?: string[];
  clickThroughResults?: Record<string, { loads: boolean; renders: boolean; backWorks: boolean }>;
  viewport?: 'MOBILE' | 'DESKTOP' | 'UNIVERSAL';
};

export type NavigationLinkageAuditResult = {
  auditId: string;
  projectId: string;
  parentRoute: string;
  parentFamily: string;
  contracts: ParentChildLinkageContract[];
  graph: InteractiveSurfaceGraph;
  orphanChildren: string[];
  deadParentActions: ParentChildLinkageContract[];
  miswiredActions: ParentChildLinkageContract[];
  ambiguousLinkages: ParentChildLinkageContract[];
  repairPlans: LinkageRepairPlan[];
  appliedRepairs: LinkageRepairPlan[];
  chainQA: NavigationChainQAResult[];
  matrix: LinkageMatrixRow[];
  readiness: ChildExperienceReadiness[];
  qaScore: NavigationLinkageQAScore;
  passed: boolean;
  evaluatedAt: string;
};

export type ChildPageGenerationNavigationContract = {
  navigationOrigin: NavigationOrigin;
  sourceParentElement: string;
  expectedRuntimeTarget: string;
  returnPath: string;
  navigationMode: NavigationMode;
};
