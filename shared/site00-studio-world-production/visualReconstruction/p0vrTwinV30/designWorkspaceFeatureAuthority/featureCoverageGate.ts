import type { FeatureCoverageReceipt } from './types.js';
import { loadActiveDesignWorkspaceFeatureManifest } from './designWorkspaceFeatureManifestV1.js';

export type FeatureCoverageGateResult = {
  pass: boolean;
  errors: string[];
  receipt: FeatureCoverageReceipt | null;
};

export function runFeatureCoverageGate(receipt: FeatureCoverageReceipt | null | undefined): FeatureCoverageGateResult {
  const errors: string[] = [];
  if (!receipt) {
    errors.push('FEATURE_MANIFEST_MISSING');
    return { pass: false, errors, receipt: null };
  }
  const active = loadActiveDesignWorkspaceFeatureManifest();
  if (receipt.manifestVersion !== active.version) {
    errors.push('FEATURE_MANIFEST_VERSION_STALE');
  }
  if (receipt.result !== 'PASS') {
    errors.push('MASTER_FEATURE_COVERAGE_INCOMPLETE');
  }
  if (receipt.unapprovedFeatureIdsPresent.length) {
    errors.push('UNAPPROVED_FEATURE_INTRODUCED');
  }
  if (receipt.removedFeatureIdsPresent.length) {
    errors.push('REMOVED_FEATURE_STILL_PRESENT');
  }
  if (receipt.missingFeatureIds.length) {
    errors.push('VIEWPORT_MASTER_FEATURE_COVERAGE_FAILED');
  }
  return { pass: errors.length === 0, errors, receipt };
}

export function assertFeatureCoverageForPromotion(receipt: FeatureCoverageReceipt | null | undefined): void {
  const gate = runFeatureCoverageGate(receipt);
  if (!gate.pass) {
    throw new Error(gate.errors[0] ?? 'MASTER_FEATURE_COVERAGE_INCOMPLETE');
  }
}
