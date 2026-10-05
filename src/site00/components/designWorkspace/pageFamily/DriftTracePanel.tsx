/**
 * P0.VR.REPLICATION.3A — Drift trace (under PAGE UPGRADE → DETAILS).
 */

import { useMemo, useState } from 'react';
import type { DriftTriangulationReport } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3a/types.js';
import '../../../styles/site00-drift-trace.css';

type Props = {
  report: DriftTriangulationReport | null | undefined;
};

const STAGE_LABELS = ['REFERENCE', 'DETECT', 'BLUEPRINT', 'DECIDE', 'SOURCE', 'ASSETS', 'RENDER'] as const;

export function DriftTracePanel({ report }: Props) {
  const [regionId, setRegionId] = useState<string>('hero-editorial');
  const [showJson, setShowJson] = useState(false);

  const pipeline = useMemo(
    () => report?.regionPipelineViews.find((v) => v.regionId === regionId),
    [report, regionId],
  );

  const literal = useMemo(
    () => report?.literalScores.find((s) => s.regionId === regionId),
    [report, regionId],
  );

  if (!report) {
    return <p className="site00-drift-trace__empty">Run REPLICATE PAGE to generate drift trace.</p>;
  }

  return (
    <div className="site00-drift-trace">
      <header className="site00-drift-trace__head">
        <h4>DRIFT TRACE</h4>
        <p>
          Primary: <strong>{report.primaryRootCause.replace(/_/g, ' ')}</strong> · Next fix:{' '}
          {report.nextReplicationFix.replace(/_/g, ' ')}
        </p>
        <p className="site00-drift-trace__promo">Twin is NOT promotion ready — triangulation diagnostic only.</p>
      </header>

      <section className="site00-drift-trace__ranking">
        <h5>CULPRIT RANKING</h5>
        <ol>
          {report.culpritRanking.slice(0, 4).map((c) => (
            <li key={c.layer}>
              {c.layer.replace(/_/g, ' ')} · {c.severity} · {c.affectedRegions.length} regions
            </li>
          ))}
        </ol>
      </section>

      <section className="site00-drift-trace__provider">
        <h5>VISUAL MODEL</h5>
        <p>
          {report.visualProviderAudit.provider} / {report.visualProviderAudit.model}
        </p>
        <p>{report.visualProviderAudit.errorOrFallback}</p>
      </section>

      <label className="site00-drift-trace__region-select">
        Region
        <select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          {report.traces.map((t) => (
            <option key={t.regionId} value={t.regionId}>
              {t.regionId.replace(/-/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </label>

      {pipeline ? (
        <section className="site00-drift-trace__pipeline">
          <h5>{regionId.replace(/-/g, ' ').toUpperCase()}</h5>
          <ul>
            {pipeline.stages.map((s, i) => (
              <li key={s.stage} className={`site00-drift-trace__stage site00-drift-trace__stage--${s.status.toLowerCase()}`}>
                <span>{STAGE_LABELS[i] ?? s.stage}</span>
                <span>{s.status}</span>
                <span className="site00-drift-trace__stage-summary">{s.summary}</span>
              </li>
            ))}
          </ul>
          <p>
            Culprit: <strong>{pipeline.culpritLayer.replace(/_/g, ' ')}</strong>
          </p>
        </section>
      ) : null}

      {literal ? (
        <section className="site00-drift-trace__literal">
          <h5>LITERALITY (stage survival)</h5>
          <dl>
            <div>
              <dt>REFERENCE</dt>
              <dd>{literal.referencePct}%</dd>
            </div>
            <div>
              <dt>DETECT</dt>
              <dd>{literal.visualDetectionPct}%</dd>
            </div>
            <div>
              <dt>BLUEPRINT</dt>
              <dd>{literal.blueprintPct}%</dd>
            </div>
            <div>
              <dt>DECIDE</dt>
              <dd>{literal.decisionPct}%</dd>
            </div>
            <div>
              <dt>SOURCE</dt>
              <dd>{literal.sourcePct}%</dd>
            </div>
            <div>
              <dt>RENDER</dt>
              <dd>{literal.renderPct}%</dd>
            </div>
          </dl>
          <p>First loss: {literal.firstLossStage.replace(/_/g, ' ')}</p>
        </section>
      ) : null}

      <button
        type="button"
        className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
        onClick={() => setShowJson((v) => !v)}
      >
        {showJson ? 'HIDE TECHNICAL JSON' : 'TECHNICAL JSON'}
      </button>
      {showJson ? (
        <pre className="site00-drift-trace__json">{JSON.stringify(report.traces.find((t) => t.regionId === regionId), null, 2)}</pre>
      ) : null}
    </div>
  );
}
