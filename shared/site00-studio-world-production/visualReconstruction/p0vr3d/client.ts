/** Browser-safe P0.VR.3D exports. */
export {
  P0_VR_3D_LINEAGE,
  P0_VR_3A_V1_ACTIVE_AUTHORITY,
  P0_VR_3D_FAILURE_CODES,
} from './constants.js';
export {
  reconcileSite00ManifestV2WithSelfAudit,
  buildSite00FounderDesignScreenSet,
  isV1ManifestActiveAuthority,
  getActiveManifestSchema,
} from './site00AuditReconciliation.js';
export {
  getActiveDesignRouteSyncContract,
  refreshDesignRouteSyncContract,
  getDesignRouteSyncContractSnapshot,
  clearDesignRouteSyncContractCacheForTest,
} from './designRouteSyncContract.js';
export { buildReconciledSite00DesignScreens } from './reconciledDesignScreens.js';
export type {
  Site00RouteExperienceScope,
  Site00DesignabilityClass,
  Site00SelfAuditRouteMapping,
  Site00AuditReconciliationReport,
  DesignRouteSyncContract,
  EnrichedDesignScreenRecord,
  Site00FounderDesignScreenSet,
  ReconciledActiveManifest,
} from './types.js';
