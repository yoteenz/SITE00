/**
 * P0.VR.REPLICATION.3C — Asset resolution + literal source execution (DETAILS only).
 */

import { useState } from 'react';
import type { Replication3CReport } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3c/types.js';
import '../../../styles/site00-drift-trace.css';

type Props = {
  report: Replication3CReport | null | undefined;
};

export function AssetResolutionPanel({ report }: Props) {
  const [showLiteral, setShowLiteral] = useState(true);

  if (!report) {
    return <p className="site00-drift-trace__empty">Run REPLICATE PAGE to generate asset resolution trace.</p>;
  }

  const heroExec = report.executionReceipts.find((r) => r.regionId === 'hero-editorial');
  const collapsed = heroExec?.collapsed ?? false;

  return (
    <div className="site00-drift-trace site00-drift-trace--asset">
      <header className="site00-drift-trace__head">
        <h4>ASSET RESOLUTION · LITERAL SOURCE</h4>
        <p>
          Build {report.buildRef} · twin {report.newTwinVersionId.slice(0, 24)}…
        </p>
        <p>
          Hero human-recognizable: <strong>{report.heroHumanRecognizable ? 'YES' : 'NO'}</strong>
          {report.capabilityLimit ? (
            <>
              {' '}
              · <strong>LITERAL_EXECUTION_CAPABILITY_LIMIT</strong> ({report.capabilityFailure ?? '—'})
            </>
          ) : null}
        </p>
      </header>

      <section>
        <h5>ASSET RESOLUTION (hero slots)</h5>
        <ul className="site00-drift-trace__list">
          {report.assetSlots.map((slot) => (
            <li key={slot.slotId}>
              <strong>{slot.slotId}</strong> · expected {slot.visualRole} · strategy{' '}
              <strong>{slot.selectedStrategy}</strong>
              {slot.selectedAsset ? (
                <>
                  {' '}
                  · source {slot.selectedAsset.length > 48 ? `${slot.selectedAsset.slice(0, 48)}…` : slot.selectedAsset}
                </>
              ) : null}
              · <strong>{slot.status === 'BOUND' ? 'BOUND' : slot.status}</strong>
              {slot.failureReason ? ` · ${slot.failureReason}` : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h5>RECEIPTS</h5>
        <ul className="site00-drift-trace__list">
          {report.assetReceipts.map((r, i) => (
            <li key={`${r.slotId}-${i}`}>
              {r.slotId}: {r.strategy} · candidates {r.candidateCount} · {r.status} · {r.notes}
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
        onClick={() => setShowLiteral((v) => !v)}
      >
        {showLiteral ? 'HIDE LITERAL SOURCE' : 'LITERAL SOURCE'}
      </button>

      {showLiteral && heroExec ? (
        <section>
          <h5>LITERAL SOURCE (hero-editorial)</h5>
          <p>
            Spec consumed: {heroExec.literalSpecConsumed ? 'YES' : 'NO'} · layout instructions{' '}
            {heroExec.layoutInstructionCount} · asset slots {heroExec.assetSlotCount} · resolved{' '}
            {heroExec.assetResolvedCount} · source elements {heroExec.sourceElementCount}
          </p>
          <p>
            SOURCE_STRUCTURE_COLLAPSE: <strong>{collapsed ? 'FAIL' : 'PASS'}</strong> · vision compared:{' '}
            {heroExec.visionCompared ? 'YES' : 'NO'} · correction passes {heroExec.correctionPasses}
          </p>
          {heroExec.failureCode ? (
            <p>
              Failure: <strong>{heroExec.failureCode}</strong>
            </p>
          ) : null}
          <p>Layout instruction count (trace): {report.layoutInstructions.length}</p>
        </section>
      ) : null}
    </div>
  );
}
