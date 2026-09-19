/**
 * P0.VR.REPLICATION.4R1 — Authority tightening drift summary (DETAILS).
 */

import type { AuthorityTighteningReport } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R1/executeAuthorityTighteningPass.js';
import '../../../styles/site00-drift-trace.css';

type Props = {
  report: AuthorityTighteningReport | null | undefined;
};

export function AuthorityTighteningPanel({ report }: Props) {
  if (!report) {
    return <p className="site00-drift-trace__empty">Run REPLICATE PAGE to apply authority tightening (4R1).</p>;
  }

  return (
    <div className="site00-drift-trace site00-drift-trace--tightening">
      <header className="site00-drift-trace__head">
        <h4>AUTHORITY TIGHTENING (4R1)</h4>
        <p>
          Build {report.buildRef} · {report.mode.replace(/_/g, ' ')}
        </p>
      </header>
      <p>{report.notes}</p>
      <p>Hero subregion isolation: {report.heroSubregionIsolation ? 'YES' : 'NO'}</p>
      <section>
        <h5>REGION DRIFT</h5>
        <ul className="site00-drift-trace__list">
          {report.driftSummary.map((row) => (
            <li key={row.regionId}>
              {row.label}: {row.status} — {row.notes}
            </li>
          ))}
        </ul>
      </section>
      <p className="site00-drift-trace__hint">
        PREVIEW: <code>?blueprintDebug=overlay</code> + compare REVIEW tabs AUTHORITY / BLUEPRINT / TWIN.
      </p>
    </div>
  );
}
