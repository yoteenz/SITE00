/**
 * P0.VR.REPLICATION.3D boundary — BOUNDARY TRACE (DETAILS).
 */

import type { ReplicationRenderBoundaryReceipt } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3dBoundary/types.js';
import '../../../styles/site00-drift-trace.css';

type Props = {
  report: ReplicationRenderBoundaryReceipt | null | undefined;
};

export function BoundaryTracePanel({ report }: Props) {
  if (!report) {
    return <p className="site00-drift-trace__empty">Run REPLICATE PAGE to generate boundary trace.</p>;
  }

  const v = report.verdict;
  const mount = report.twinMount;
  const coord =
    report.coordinateSpaces.find((c) => c.regionId === 'hero-editorial')?.coordinateOrigin ?? 'UNKNOWN';
  const pageLevelMisbound = report.regionAssignments.some((a) => !a.allowed);

  return (
    <div className="site00-drift-trace site00-drift-trace--boundary">
      <header className="site00-drift-trace__head">
        <h4>BOUNDARY TRACE</h4>
        <p>
          Build {report.buildRef} · status <strong>{report.status}</strong>
        </p>
      </header>

      <section>
        <p>Twin content root: {mount.contentRootSelector}</p>
        <p>Mounted into: {mount.mountNodeSelector}</p>
        <p>Inside shell (host header): {mount.mountInsideShellChrome ? 'YES' : 'NO'}</p>
        <p>Inside hero/media slot: {mount.mountInsideHeroMediaSlot ? 'YES' : 'NO'}</p>
        <p>Page nesting detected: {v.PAGE_NESTING_DETECTED ? 'YES' : 'NO'}</p>
        <p>Coordinate space: {coord}</p>
        <p>Page-level output wrongly bound to region: {pageLevelMisbound ? 'YES' : 'NO'}</p>
      </section>

      {report.typedFailures.length ? (
        <section>
          <h5>TYPED FAILURES</h5>
          <ul className="site00-drift-trace__list">
            {report.typedFailures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.founderMessage ? <p className="site00-drift-trace__hint">{report.founderMessage}</p> : null}

      <p className="site00-drift-trace__hint">
        Append <code>?renderRootsDebug=1</code> to PREVIEW TWIN URL for SHOW RENDER ROOTS overlay.
      </p>
    </div>
  );
}
