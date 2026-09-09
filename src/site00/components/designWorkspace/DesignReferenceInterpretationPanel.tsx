/**
 * P0.VR.7 — Founder reference interpretation review before execution.
 */

import type { DesignReferenceFidelityContract } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr7/browserClient.js';
import type { FidelityInterpretation } from './designFidelityApi.js';
import { DesignReferenceFidelityContractPanel } from './DesignReferenceFidelityContractPanel';

export type DesignReferenceInterpretationPanelProps = {
  contract: DesignReferenceFidelityContract;
  interpretation: FidelityInterpretation;
  busy?: boolean;
  showContract?: boolean;
  onConfirm: () => void;
  onEditInterpretation: () => void;
  onCloseContract?: () => void;
};

export function DesignReferenceInterpretationPanel({
  contract,
  interpretation,
  busy = false,
  showContract = false,
  onConfirm,
  onEditInterpretation,
  onCloseContract,
}: DesignReferenceInterpretationPanelProps) {
  const needsConfirm = contract.status === 'INTERPRETATION_REVIEW';

  return (
    <section className="site00-dw-v3-interpretation" aria-label="Reference interpretation">
      <header className="site00-dw-v3-interpretation__head">
        <h3>REFERENCE INTERPRETATION</h3>
        <p>SITE 00 UNDERSTANDS THIS REFERENCE AS:</p>
      </header>

      <dl className="site00-dw-v3-interpretation__grid">
        <div>
          <dt>PAGE TYPE</dt>
          <dd>{interpretation.pageType}</dd>
        </div>
        <div>
          <dt>AUTHORITY</dt>
          <dd>{interpretation.authority}</dd>
        </div>
        <div>
          <dt>PRIMARY REGIONS</dt>
          <dd>{interpretation.primaryRegions}</dd>
        </div>
        <div>
          <dt>SOLO ASSETS</dt>
          <dd>{interpretation.soloAssets}</dd>
        </div>
        <div>
          <dt>LIVE UI</dt>
          <dd>{interpretation.liveUi ? 'YES' : 'NO'}</dd>
        </div>
        <div>
          <dt>PRESERVE</dt>
          <dd>{interpretation.preserve}</dd>
        </div>
        <div>
          <dt>REBUILD</dt>
          <dd>{interpretation.rebuild}</dd>
        </div>
      </dl>

      {showContract ? (
        <DesignReferenceFidelityContractPanel contract={contract} onClose={onCloseContract} />
      ) : null}

      {needsConfirm ? (
        <div className="site00-dw-v3-interpretation__actions">
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--primary"
            disabled={busy}
            onClick={onConfirm}
          >
            CONFIRM
          </button>
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--outline"
            disabled={busy}
            onClick={onEditInterpretation}
          >
            EDIT INTERPRETATION
          </button>
        </div>
      ) : (
        <p className="site00-dw-v3-interpretation__confirmed">
          REFERENCE CONFIRMED · {contract.founderConfirmedAt ? new Date(contract.founderConfirmedAt).toLocaleString() : '—'}
        </p>
      )}
    </section>
  );
}
