/**
 * P0.PCI.3 — Page Family Workspace data model.
 */

export const NAVIGATION_PROMISE_STATUSES = [
  'WIRED',
  'MISSING',
  'PROPOSED',
  'AMBIGUOUS',
  'BROKEN',
  'EXEMPT',
] as const;

export type NavigationPromiseStatus = (typeof NAVIGATION_PROMISE_STATUSES)[number];

export const NAVIGATION_TYPES = [
  'ROUTE',
  'TAB',
  'MODAL',
  'DRAWER',
  'SHEET',
  'WORKFLOW_STEP',
  'DETAIL',
  'FULLSCREEN_TOOL',
] as const;

export type NavigationType = (typeof NAVIGATION_TYPES)[number];

export const DERIVATIVE_STATUSES = [
  'PROPOSED',
  'STRUCTURE_CONFIRMED',
  'DESIGN_PENDING',
  'DESIGN_READY',
  'APPROVED',
  'BUILDING',
  'BUILT',
  'WIRED',
  'CAPTURE_PENDING',
  'CURRENT',
  'NEEDS_REVIEW',
  'BROKEN',
  'EXEMPT',
] as const;

export type DerivativeStatus = (typeof DERIVATIVE_STATUSES)[number];

export const LINKAGE_STATUSES = [
  'WIRED',
  'UNWIRED',
  'MISWIRED',
  'AMBIGUOUS',
  'PERMISSION_GATED',
  'EXEMPT',
] as const;

export type LinkageStatus = (typeof LINKAGE_STATUSES)[number];

export const PAGE_FAMILY_STATUSES = [
  'DETECTING',
  'DRAFT',
  'STRUCTURE_CONFIRMED',
  'DESIGN_IN_PROGRESS',
  'COMPLETE',
  'UPDATE_AVAILABLE',
] as const;

export type PageFamilyStatus = (typeof PAGE_FAMILY_STATUSES)[number];

export const RECONSTRUCTION_WORKFLOW_STEPS = [
  'DETECT_LINKS',
  'CONFIRM_FAMILY',
  'REVIEW_CHILD',
  'APPROVE_DESIGN',
  'VERIFY_WIRING',
] as const;

export type ReconstructionWorkflowStep = (typeof RECONSTRUCTION_WORKFLOW_STEPS)[number];

export type NavigationPromise = {
  promiseId: string;
  sourceElement: string;
  sourceLabel: string;
  sourceIntent: string;
  navigationType: NavigationType;
  expectedChildRoute: string;
  expectedChildLabel: string;
  currentTarget: string | null;
  status: NavigationPromiseStatus;
  confidence: number;
  targetNodeId: string | null;
};

export type PageFamilyNode = {
  nodeId: string;
  route: string;
  surfaceId: string;
  label: string;
  level: number;
  archetype: string;
  inheritanceMode: string | null;
  existing: boolean;
  designStatus: DerivativeStatus;
  buildStatus: DerivativeStatus;
  linkageStatus: LinkageStatus;
  captureStatus: DerivativeStatus;
  parentNodeId: string | null;
  childCount: number;
  previewUrl: string | null;
  referenceUrl: string | null;
  screenId: string | null;
  statusVisual: 'ready' | 'attention' | 'neutral' | 'offline' | 'proposed';
  statusLabel: string;
  derivedFromLabel: string | null;
};

export type PageFamilyEdge = {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceElementId: string;
  sourceElementLabel: string;
  navigationMode: NavigationType;
  linkageStatus: LinkageStatus;
  entryPointCount: number;
};

export type PageFamily = {
  familyId: string;
  projectId: string;
  rootParentRoute: string;
  rootParentSurfaceId: string;
  familyName: string;
  authorityVersion: string;
  nodeCount: number;
  childCount: number;
  grandchildCount: number;
  status: PageFamilyStatus;
  approvedAt: string | null;
  nodes: PageFamilyNode[];
  edges: PageFamilyEdge[];
  promises: NavigationPromise[];
};

export type PageDesignApproval = {
  approvalId: string;
  nodeId: string;
  route: string;
  approvedAt: string;
  approvedBy: string;
  structureConfirmed: boolean;
  designApproved: boolean;
  wiringVerified: boolean;
};

export type DerivativeReviewState = {
  activeNodeId: string;
  siblingIndex: number;
  siblingIds: string[];
  workflowStep: ReconstructionWorkflowStep;
  detecting: boolean;
  structureConfirmed: boolean;
  familyApproved: boolean;
};

export type PageFamilyReadiness = {
  structureStatus: 'READY' | 'NEEDS_CONFIRMATION' | 'IN_PROGRESS';
  designStatus: 'READY' | 'IN_PROGRESS' | 'PENDING';
  wiringStatus: 'READY' | 'IN_PROGRESS' | 'ISSUES';
  buildStatus: 'READY' | 'IN_PROGRESS';
  linkageStatus: 'READY' | 'ISSUES';
  captureStatus: 'READY' | 'PENDING' | 'UNAVAILABLE';
  approvedCount: number;
  needsDesignCount: number;
  wiringIssueCount: number;
  capturePendingCount: number;
  completionPct: number | null;
  attentionCount: number;
  summaryLabel: string;
  dimensions: {
    structure: string;
    design: string;
    wiring: string;
    capture: string;
  };
};

export type ProjectProgressSummary = {
  totalPages: number;
  familyCount: number | null;
  current: number | null;
  needReview: number | null;
  needDesignReview: number | null;
  wiringIssues: number | null;
  notCaptured: number | null;
  stale: number | null;
  chips: Array<{ label: string; value: number | null; tone: 'ready' | 'attention' | 'neutral' | 'offline' }>;
};

export type PageFamilyRowInput = {
  screenId: string;
  displayName: string;
  route?: string;
  normalizedRoute?: string;
  mobile?: { publicUrl: string | null; status: string } | null;
  referenceUrl?: string | null;
  neverCaptured?: boolean;
  resolvedCaptureState?: string;
  pageCaptureStatus?: string;
  isStale?: boolean;
  missingImplementation?: boolean;
};

export const P0_PCI_3_BUILD = 'v267' as const;
export const P0_PCI_3R1_BUILD = 'v269' as const;
