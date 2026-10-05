import { loadActiveDesignWorkspaceFeatureManifest } from './designWorkspaceFeatureManifestV1.js';
import type { ViewportMasterAuthority } from '../designWorkspaceAuthorityTypes.js';

export type MasterFeatureStaleStatus = 'CURRENT' | 'FEATURE_STALE' | 'NO_MASTER';

export function resolveMasterFeatureStaleStatus(
  master: ViewportMasterAuthority | null | undefined,
): MasterFeatureStaleStatus {
  if (!master) return 'NO_MASTER';
  const active = loadActiveDesignWorkspaceFeatureManifest();
  const masterVersion = master.designWorkspaceFeatureManifestVersion;
  if (!masterVersion || masterVersion !== active.version) return 'FEATURE_STALE';
  return 'CURRENT';
}

export function assertMasterNotFeatureStale(master: ViewportMasterAuthority | null | undefined): void {
  if (resolveMasterFeatureStaleStatus(master) === 'FEATURE_STALE') {
    throw new Error('MASTER_AMENDMENT_REQUIRED');
  }
}

export function masterAmendmentStatusLabel(master: ViewportMasterAuthority | null | undefined): string {
  const status = resolveMasterFeatureStaleStatus(master);
  if (status === 'FEATURE_STALE') return 'MASTER UPDATE REQUIRED';
  if (status === 'NO_MASTER') return 'NO VIEWPORT MASTER';
  return 'FEATURE MANIFEST CURRENT';
}
