/**
 * P0.BRIDGE.1 — Cross-repo design control plane types.
 */

export const P0_BRIDGE_1_LINEAGE = 'P0.BRIDGE.1-SITE00' as const;

export type Site00ChangeExecutionClass = 'RUNTIME_SAFE_BINDING' | 'SOURCE_CODE_MATERIALIZATION';

export type Site00ChangeScope = 'TARGET_ONLY' | 'DESIGN_FAMILY' | 'SHARED_SHELL_GLOBAL';

export type Site00ChangeStatus =
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'FOUNDER_APPROVED'
  | 'READY_FOR_REPO'
  | 'APPLYING'
  | 'PR_CREATED'
  | 'VALIDATED'
  | 'MERGED'
  | 'FAILED'
  | 'BLOCKED'
  | 'BLOCKED_SOURCE_DIVERGENCE'
  | 'SUPERSEDED';

export type Site00ImplementationMode = 'RUNTIME_BINDING' | 'SOURCE_REPO_CHANGE';

export type StructuredChangeOperationType =
  | 'UPDATE_COMPONENT_PROP'
  | 'UPDATE_LAYOUT_REGION'
  | 'ADD_SECTION'
  | 'REMOVE_SECTION'
  | 'REORDER_SECTION'
  | 'UPDATE_DESIGN_TOKEN'
  | 'CHANGE_ASSET_BINDING'
  | 'CHANGE_SHARED_SHELL'
  | 'REGISTER_ROUTE'
  | 'REGISTER_TAB'
  | 'UPDATE_RESPONSIVE_RULE'
  | 'UPDATE_PAGE_METADATA'
  | 'UPDATE_CONTENT_BINDING'
  | 'UPDATE_ALLOWED_COMPONENT_VARIANT';

export type ManagedProjectRuntimeCapability =
  | 'CONTENT_RUNTIME'
  | 'ASSET_RUNTIME'
  | 'TOKEN_RUNTIME'
  | 'SECTION_ORDER_RUNTIME'
  | 'COMPONENT_VARIANT_RUNTIME'
  | 'SOURCE_CODE_REQUIRED';

export type BlastRadiusSummary = {
  affectedPages: string[];
  affectedFamilies: string[];
  affectedRoutes: string[];
  affectedComponents: string[];
  affectedViewports: string[];
  referencesPotentiallyStale: string[];
  snapshotsPotentiallyStale: string[];
};

export type Site00ChangeOperationRecord = {
  id?: string;
  changeRequestId?: string;
  operationOrder: number;
  operationType: StructuredChangeOperationType;
  targetSelector?: string | null;
  targetComponentKey?: string | null;
  payload: Record<string, unknown>;
  expectedBefore?: Record<string, unknown> | null;
  expectedAfter?: Record<string, unknown> | null;
  requiredCapability?: ManagedProjectRuntimeCapability | null;
};

export type Site00ChangeRequestRecord = {
  id?: string;
  projectId: string;
  projectKey?: string;
  repoBindingId?: string | null;
  pageId?: string | null;
  familyId?: string | null;
  shellId?: string | null;
  routeKey?: string | null;
  changeExecutionClass: Site00ChangeExecutionClass;
  changeType: string;
  scope: Site00ChangeScope;
  status: Site00ChangeStatus;
  idempotencyKey: string;
  version: number;
  baseSourceCommit?: string | null;
  expectedSourceBranch?: string | null;
  designVersion?: number | null;
  shellVersion?: number | null;
  familyVersion?: number | null;
  requestedBy?: string | null;
  approvedBy?: string | null;
  implementationMode: Site00ImplementationMode;
  blastRadius: BlastRadiusSummary;
  riskLevel: string;
  metadata?: Record<string, unknown>;
  operations?: Site00ChangeOperationRecord[];
  createdAt?: string;
  approvedAt?: string | null;
  appliedAt?: string | null;
  supersededAt?: string | null;
};

export type Site00ChangeReceiptRecord = {
  id?: string;
  changeRequestId: string;
  eventType: string;
  actor?: string | null;
  repoCommit?: string | null;
  prUrlOrId?: string | null;
  status: string;
  message?: string | null;
  payload?: Record<string, unknown>;
  createdAt?: string;
};

export type Site00ManagedProjectRow = {
  id: string;
  projectKey: string;
  displayName: string;
  designAuthority: string;
  sourceRepo: string | null;
  sourceProjectKey: string | null;
  projectType: string;
  runtimeMode: string;
  designEnabled: boolean;
  metadata: Record<string, unknown>;
};

export type Site00RepoBindingRow = {
  id: string;
  projectId: string;
  repoOwner: string;
  repoName: string;
  defaultBranch: string;
  sourceProjectPath: string | null;
  adapterType: string;
  runtimeBindingMode: string;
  sourceMaterializationEnabled: boolean;
  metadata: Record<string, unknown>;
};

export type PrepareRepoChangeInput = {
  projectKey: string;
  routeKey?: string;
  pageKey?: string;
  changeType: string;
  scope?: Site00ChangeScope;
  operations: Omit<Site00ChangeOperationRecord, 'id' | 'changeRequestId'>[];
  baseSourceCommit?: string;
  requestedBy?: string;
  designVersion?: number;
  shellVersion?: number;
  familyVersion?: number;
};

export type SourceDivergenceCheck = {
  blocked: boolean;
  expectedCommit: string | null;
  currentCommit: string | null;
  status: Site00ChangeStatus;
};
