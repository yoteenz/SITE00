/**
 * P0.VR.7 — Compact fidelity authority badge.
 */

import type { DesignReferenceFidelityContract } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr7/browserClient.js';

export type DesignReferenceFidelityBadgeProps = {
  contract: DesignReferenceFidelityContract;
  onViewContract: () => void;
  compact?: boolean;
};

function authorityLabel(mode: DesignReferenceFidelityContract['authorityMode']): string {
  return mode.replace(/_/g, ' ');
}

export function DesignReferenceFidelityBadge({
  contract,
  onViewContract,
  compact = false,
}: DesignReferenceFidelityBadgeProps) {
  const statusSuffix =
    contract.latestFidelityStatus === 'VERIFIED'
      ? ' · VERIFIED'
      : contract.latestFidelityStatus === 'MAJOR_DRIFT'
        ? ' · DRIFT'
        : '';

  return (
    <div
      className={`site00-dw-v3-fidelity-badge${compact ? ' site00-dw-v3-fidelity-badge--compact' : ''}`}
      data-contract-id={contract.contractId}
    >
      <span className="site00-dw-v3-fidelity-badge__label">
        {authorityLabel(contract.authorityMode)} · {contract.fidelityMode}
        {statusSuffix}
      </span>
      <button type="button" className="site00-dw-v3-fidelity-badge__link" onClick={onViewContract}>
        VIEW CONTRACT
      </button>
    </div>
  );
}
