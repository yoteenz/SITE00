/**
 * P0.VR.3D — Active DesignRouteSyncContract (v2+ authority).
 */

import { clearManifestV2CacheForTest } from '../p0vr3b/manifestV2Compiler.js';
import { reconcileSite00ManifestV2WithSelfAudit } from './site00AuditReconciliation.js';
import type { DesignRouteSyncContract, ReconciledActiveManifest } from './types.js';

let contractCache: ReconciledActiveManifest | null = null;

export function getActiveDesignRouteSyncContract(): ReconciledActiveManifest {
  return contractCache ?? reconcileSite00ManifestV2WithSelfAudit();
}

export function refreshDesignRouteSyncContract(): ReconciledActiveManifest {
  contractCache = reconcileSite00ManifestV2WithSelfAudit();
  return contractCache;
}

export function getDesignRouteSyncContractSnapshot(): DesignRouteSyncContract {
  const { reconciliationReport: _r, ...contract } = getActiveDesignRouteSyncContract();
  return contract;
}

export function clearDesignRouteSyncContractCacheForTest(): void {
  contractCache = null;
  clearManifestV2CacheForTest();
}
