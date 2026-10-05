/**
 * P0.VR.REPLICATION.4 — BLUEPRINT TRANSLATION (DETAILS).
 */

import type { ForensicBlueprintExecutionReport } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4/types.js';
import '../../../styles/site00-drift-trace.css';

type Props = {
  report: ForensicBlueprintExecutionReport | null | undefined;
};

export function BlueprintTranslationPanel({ report }: Props) {
  if (!report) {
    return <p className="site00-drift-trace__empty">Run REPLICATE PAGE to ingest forensic blueprint.</p>;
  }

  const unresolved = report.translationReceipts.filter((r) => r.status !== 'PASS' && r.status !== 'PARTIAL');

  return (
    <div className="site00-drift-trace site00-drift-trace--blueprint">
      <header className="site00-drift-trace__head">
        <h4>BLUEPRINT TRANSLATION</h4>
        <p>
          Build {report.buildRef} · {report.status}
        </p>
      </header>

      <section>
        <p>
          MAPPED OBJECTS: {report.mappedObjects} / {report.totalObjects}
        </p>
        <p>REQUIRED COVERAGE: {report.requiredCoverage}%</p>
        <p>GEOMETRY MATCH: {report.geometryMatchPct}%</p>
        <p>TYPOGRAPHY MATCH: {report.typographyMatchPct}%</p>
        <p>ASSET MATCH: {report.assetMatchPct}%</p>
        <p>COLOR MATCH: {report.colorMatchPct}%</p>
        <p>PAGE NESTING CHEAT: {report.wholePageScreenshotCheat ? 'YES' : 'NO'}</p>
        <p>INVALID ROOT: {report.invalidReplicationRoot ? 'YES' : 'NO'}</p>
      </section>

      {report.failureStage ? (
        <section>
          <h5>FAILURE STAGE</h5>
          <p>{report.failureStage}</p>
        </section>
      ) : null}

      {unresolved.length ? (
        <section>
          <h5>UNRESOLVED OBJECTS</h5>
          <ul className="site00-drift-trace__list">
            {unresolved.slice(0, 12).map((r) => (
              <li key={r.objectId}>
                {r.objectId} · {r.status}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="site00-drift-trace__hint">
        PREVIEW TWIN: append <code>?blueprintDebug=overlay</code> (or <code>blink</code>, <code>difference</code>).
      </p>
    </div>
  );
}
