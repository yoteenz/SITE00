/**
 * P0.VR.REPLICATION.4R2 — Hero surgical lock report (DETAILS).
 */

import type { HeroSurgicalLockReport } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication4R2/types.js';
import '../../../styles/site00-drift-trace.css';

type Props = {
  report: HeroSurgicalLockReport | null | undefined;
};

export function HeroSurgicalLockPanel({ report }: Props) {
  if (!report) {
    return <p className="site00-drift-trace__empty">Run REPLICATE PAGE to apply hero surgical lock (4R2).</p>;
  }

  return (
    <div className="site00-drift-trace site00-drift-trace--hero-lock">
      <header className="site00-drift-trace__head">
        <h4>HERO SURGICAL LOCK (4R2)</h4>
        <p>
          Build {report.buildRef} · {report.status} · {report.objectCount} objects · {report.domCoveragePct}% DOM
        </p>
      </header>
      {report.founderMessage ? <p>{report.founderMessage}</p> : null}
      <section>
        <h5>TEXT TRACE</h5>
        <ul className="site00-drift-trace__list">
          {report.textTraces.slice(0, 8).map((t) => (
            <li key={t.objectId}>
              {t.objectId}: render×{t.renderCount} · {t.status}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h5>COLLISIONS</h5>
        <p>{report.collisionAudit.passed ? 'PASS — no unexpected overlaps' : `${report.collisionAudit.collisions.length} flagged`}</p>
      </section>
      <section>
        <h5>CORRECTION PASSES</h5>
        <ul className="site00-drift-trace__list">
          {report.correctionPasses.map((p) => (
            <li key={p.passIndex}>
              Pass {p.passIndex} ({p.focus}): {p.notes}
            </li>
          ))}
        </ul>
      </section>
      <p className="site00-drift-trace__hint">
        REVIEW → tap <strong>INSPECT HERO</strong> (opens hero overlay; no manual URL editing).
      </p>
    </div>
  );
}
