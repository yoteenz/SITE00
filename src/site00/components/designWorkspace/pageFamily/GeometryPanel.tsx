/**
 * P0.VR.REPLICATION.3D — Geometry fidelity summary (DETAILS only).
 */

import { useState } from 'react';
import type { GeometryLockReport } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3d/types.js';
import '../../../styles/site00-drift-trace.css';

type Props = {
  report: GeometryLockReport | null | undefined;
};

export function GeometryPanel({ report }: Props) {
  const [showGrid, setShowGrid] = useState(false);

  if (!report) {
    return <p className="site00-drift-trace__empty">Run REPLICATE PAGE to generate geometry lock report.</p>;
  }

  const heroReceipt = report.fidelityReceipts.find((r) => r.regionId === 'hero-editorial');

  return (
    <div className="site00-drift-trace site00-drift-trace--geometry">
      <header className="site00-drift-trace__head">
        <h4>GEOMETRY</h4>
        <p>
          Build {report.buildRef} · hero pass <strong>{report.heroGeometryPass ? 'YES' : 'NO'}</strong>
        </p>
      </header>

      {heroReceipt ? (
        <section>
          <h5>HERO</h5>
          <p>
            {heroReceipt.withinToleranceCount}/{heroReceipt.targetCount} within tolerance · max position{' '}
            {heroReceipt.maxPositionError.toFixed(1)}px · max size {heroReceipt.maxSizeError.toFixed(1)}px · passes{' '}
            {heroReceipt.passes}
          </p>
          <p>Status: {heroReceipt.status}</p>
        </section>
      ) : null}

      <section>
        <h5>REGIONS MEASURED</h5>
        <ul className="site00-drift-trace__list">
          {report.coordinateMap.regions.map((r) => (
            <li key={r.regionId}>
              {r.regionId} · {r.role}
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
        onClick={() => setShowGrid((v) => !v)}
      >
        {showGrid ? 'HIDE GRID HINT' : 'VIEW GRID'}
      </button>
      {showGrid ? (
        <p className="site00-drift-trace__hint">
          Append <code>?geometryDebug=1</code> to PREVIEW TWIN URL to overlay authority hero bounds (debug only).
        </p>
      ) : null}
    </div>
  );
}
