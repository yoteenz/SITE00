/**
 * P0.BRIDGE.1 — Browser-safe client exports.
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

export { P0_BRIDGE_1_LINEAGE } from './types.js';
