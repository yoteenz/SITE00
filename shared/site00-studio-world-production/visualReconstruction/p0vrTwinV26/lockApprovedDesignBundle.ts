import type { DesignCompilerBundle } from './types.js';

/** Immutable lock after APPROVE_PAIRED_CONCEPT. */
export function lockApprovedDesignBundle(
  bundle: DesignCompilerBundle,
  _approvalType: 'APPROVE_PAIRED_CONCEPT',
): DesignCompilerBundle {
  const now = new Date().toISOString();
  return {
    ...bundle,
    executionIntent: 'TRANSLATION',
    approvedBundleChecksum: bundle.bundleChecksum.checksum,
    approvedAt: now,
    acceptanceStatus: 'FOUNDER_PENDING',
    bundleSyncStatus: 'SYNCED',
    irChain: {
      ...bundle.irChain,
      design: { ...bundle.irChain.design, status: 'LOCKED' },
      visual: { ...bundle.irChain.visual, status: 'LOCKED' },
      asset: { ...bundle.irChain.asset, status: 'LOCKED' },
      function: { ...bundle.irChain.function, status: 'LOCKED' },
    },
  };
}
