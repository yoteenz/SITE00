/**
 * P0.VR.7 — View contract details (system inspector compact).
 */

import type { DesignReferenceFidelityContract } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr7/browserClient.js';

export type DesignReferenceFidelityContractPanelProps = {
  contract: DesignReferenceFidelityContract;
  onClose?: () => void;
};

function scoreLabel(score: number | null): string {
  return score == null ? 'NOT SCORED' : `${score}%`;
}

export function DesignReferenceFidelityContractPanel({
  contract,
  onClose,
}: DesignReferenceFidelityContractPanelProps) {
  const decomp = contract.decomposition;
  const geo = decomp?.globalGeometry;

  return (
    <details className="site00-dw-v3-fidelity-contract" open>
      <summary>FIDELITY CONTRACT</summary>
      <dl className="site00-dw-v3-fidelity-contract__grid">
        <div>
          <dt>AUTHORITY MODE</dt>
          <dd>{contract.authorityMode}</dd>
        </div>
        <div>
          <dt>FIDELITY MODE</dt>
          <dd>{contract.fidelityMode}</dd>
        </div>
        <div>
          <dt>VIEWPORT</dt>
          <dd>{contract.viewport.toUpperCase()}</dd>
        </div>
        <div>
          <dt>REFERENCE DIMENSIONS</dt>
          <dd>
            {geo ? `${geo.referenceWidth} × ${geo.referenceHeight}` : '—'}
          </dd>
        </div>
        <div>
          <dt>PRESERVE FUNCTION</dt>
          <dd>{contract.preserveFunction ? 'YES' : 'NO'}</dd>
        </div>
        <div>
          <dt>REBUILD LOOK</dt>
          <dd>{contract.allowVisualRebuild ? 'YES' : 'NO'}</dd>
        </div>
        <div>
          <dt>PROTECT CURRENT VISUALS</dt>
          <dd>{contract.allowCurrentVisualProtection ? 'YES' : 'NO'}</dd>
        </div>
        <div>
          <dt>SCREENSHOT QA REQUIRED</dt>
          <dd>{contract.requireScreenshotQA ? 'YES' : 'NO'}</dd>
        </div>
        <div>
          <dt>GEOMETRY PROFILE</dt>
          <dd>{decomp ? 'ANALYZED' : 'PENDING'}</dd>
        </div>
        <div>
          <dt>TYPOGRAPHY PROFILE</dt>
          <dd>{decomp?.typography.length ?? 0} ROLES</dd>
        </div>
        <div>
          <dt>SPACING PROFILE</dt>
          <dd>{decomp ? 'CAPTURED' : 'PENDING'}</dd>
        </div>
        <div>
          <dt>ASSET MANIFEST</dt>
          <dd>{decomp?.assetManifest.length ?? 0}</dd>
        </div>
        <div>
          <dt>LIVE UI REGIONS</dt>
          <dd>{decomp?.liveUiRegionCount ?? 0}</dd>
        </div>
        <div>
          <dt>LATEST FIDELITY STATUS</dt>
          <dd>{contract.latestFidelityStatus}</dd>
        </div>
        <div>
          <dt>FIDELITY SCORE</dt>
          <dd>{scoreLabel(contract.latestScreenshotQa?.numericScore ?? null)}</dd>
        </div>
        <div>
          <dt>ITERATION COUNT</dt>
          <dd>{contract.iterationCount}</dd>
        </div>
        <div>
          <dt>FOUNDER APPROVAL</dt>
          <dd>{contract.founderConfirmedAt ? 'CONFIRMED' : 'PENDING'}</dd>
        </div>
      </dl>

      {contract.driftFindings.length > 0 ? (
        <div className="site00-dw-v3-fidelity-contract__drift">
          <strong>DRIFT FINDINGS</strong>
          <ul>
            {contract.driftFindings.map((d, i) => (
              <li key={`${d.driftType}-${i}`}>
                {d.region}: {d.description}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {onClose ? (
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onClose}>
          CLOSE
        </button>
      ) : null}
    </details>
  );
}
