/**
 * P0.VR.REPLICATION.3B — Vision trace (DETAILS only).
 */

import { useState } from 'react';
import type { VisionReplicationReport } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3b/types.js';
import '../../../styles/site00-drift-trace.css';

type Props = {
  report: VisionReplicationReport | null | undefined;
};

const PIPELINE = ['REFERENCE', 'VISION', 'LITERAL SPEC', 'SOURCE', 'RENDER', 'VISION COMPARE', 'CORRECTION'] as const;

export function VisionTracePanel({ report }: Props) {
  const [regionId, setRegionId] = useState('hero-editorial');
  const [showJson, setShowJson] = useState(false);

  if (!report) {
    return <p className="site00-drift-trace__empty">Run REPLICATE PAGE to generate vision trace.</p>;
  }

  const obs = report.regionObservations.find((o) => o.regionId === regionId);
  const spec = report.literalRegionSpecs.find((s) => s.regionId === regionId);
  const passes = report.correctionPasses.filter((p) => p.regionId === regionId);

  return (
    <div className="site00-drift-trace site00-drift-trace--vision">
      <header className="site00-drift-trace__head">
        <h4>VISION TRACE</h4>
        <p>
          {report.providerAudit.provider} / {report.providerAudit.model} · build {report.buildRef}
        </p>
        <p>
          Hero recognizable: <strong>{report.heroRecognizable ? 'YES' : 'NO'}</strong>
          {report.capabilityLimit ? ' · CAPABILITY LIMIT' : ''}
        </p>
      </header>

      <section className="site00-drift-trace__pipeline">
        <h5>PIPELINE</h5>
        <ul>
          {PIPELINE.map((label) => (
            <li key={label} className="site00-drift-trace__stage site00-drift-trace__stage--pass">
              {label}
            </li>
          ))}
        </ul>
      </section>

      <label className="site00-drift-trace__region-select">
        Region
        <select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          {report.regionObservations.map((o) => (
            <option key={o.regionId} value={o.regionId}>
              {o.regionId}
            </option>
          ))}
        </select>
      </label>

      {obs ? (
        <section>
          <p>
            <strong>Authority:</strong> {obs.authorityDescription.slice(0, 220)}
            {obs.authorityDescription.length > 220 ? '…' : ''}
          </p>
          <p>
            <strong>Status:</strong> {obs.status}
          </p>
          {spec ? (
            <p>
              Literal subregions: {spec.subregions.length} · asset slots:{' '}
              {spec.imageSlots.length + spec.graphicSlots.length}
            </p>
          ) : null}
        </section>
      ) : null}

      {passes.length > 0 ? (
        <section>
          <h5>CORRECTION PASSES</h5>
          <ol>
            {passes.map((p) => (
              <li key={p.passId}>
                {p.passId}: {p.beforeScore} → {p.afterScore} ({p.status})
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <button type="button" className="site00-drift-trace__json-toggle" onClick={() => setShowJson((v) => !v)}>
        {showJson ? 'Hide technical JSON' : 'Technical JSON'}
      </button>
      {showJson ? <pre className="site00-drift-trace__json">{JSON.stringify(report, null, 2)}</pre> : null}
    </div>
  );
}
