/**
 * P0.BRIDGE.1 — Browser-safe client exports.
 * P0.BRIDGE.1B — Project authority + execution target resolution.
 */

export {
  FORBIDDEN_OPERATION_TYPES,
  RUNTIME_SAFE_CHANGE_TYPES,
  SOURCE_CODE_CHANGE_TYPES,
  ALLOWED_RUNTIME_COMPONENT_KEYS,
  STUDIO_WORLD_NATIVE_ROUTE_PREFIXES,
  BRIDGE_MIGRATION_HINT,
  BRIDGE_SCHEMA_TABLES,
} from './constants.js';

export {
  classifyChangeExecution,
  listProjectRuntimeCapabilities,
  studioWorldNativeInfrastructureTargetable,
} from './capabilityRegistry.js';

export { validateChangeOperations, arbitraryCodeOperationBlocked } from './operationValidator.js';

export { calculateBlastRadius, markReferenceAndSnapshotStaleness } from './blastRadius.js';

export { Site00DesignControlPlane, initDesignControlPlaneForTest } from './designControlPlane.js';

export {
  P0_BRIDGE_1B_LINEAGE,
  getProjectAuthority,
  listSite00NativeProjectKeys,
  listFsbwBridgeProjectKeys,
  isFsbwBridgeProject,
  isSite00NativeProject,
} from './projectAuthorityRegistry.js';

export {
  REPO_BRANCH_AUTHORITY,
  getRepoDefaultBranch,
  validateRepoBindingBranch,
  normalizeBindingDefaultBranch,
} from './repoBranchAuthority.js';

export {
  resolveChangeExecutionTarget,
  resolveImplementationMode,
  assertReadyForRepoAuthority,
  fsbwConsumerMayConsumeRequest,
} from './resolveChangeExecutionTarget.js';

export type {
  Site00ChangeExecutionClass,
  Site00ChangeScope,
  Site00ChangeStatus,
  Site00ImplementationMode,
  StructuredChangeOperationType,
  ManagedProjectRuntimeCapability,
  BlastRadiusSummary,
  Site00ChangeOperationRecord,
  Site00ChangeRequestRecord,
  Site00ChangeReceiptRecord,
  PrepareRepoChangeInput,
  SourceDivergenceCheck,
} from './types.js';

export type { ManagedProjectExecutionMode, ProjectAuthorityRecord } from './projectAuthorityRegistry.js';
export type { ChangeExecutionTarget } from './resolveChangeExecutionTarget.js';

export { P0_BRIDGE_1_LINEAGE } from './types.js';
