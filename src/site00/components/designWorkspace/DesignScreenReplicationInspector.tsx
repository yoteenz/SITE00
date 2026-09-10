/**
 * P0.VR.8-SRF — Screen Replication inspector (structural QA + host boundary).
 */

import {
  buildNdxOverviewMobileFidelityContract,
  runScreenReplicationKernel,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/screenReplicationFidelity/index.js';

export function DesignScreenReplicationInspector() {
  const kernel = runScreenReplicationKernel({
    workspace: 'PAGES',
    pageExperience: {
      projectId: 'ndxbook',
      pageId: 'ndxbook-overview-mobile',
      primaryRoute: '/projects/ndxbook/overview',
      moduleScreenType: 'PROJECT_OVERVIEW',
      parentAuthorityId: buildNdxOverviewMobileFidelityContract().authorityId,
    },
    goldenCaseId: 'NDX_OVERVIEW_MOBILE',
  });

  const sr = kernel.screenReplication;
  if (!sr) {
    return (
      <section className="site00-dw-srf-inspector" data-panel="screen-replication">
        <p>SCREEN REPLICATION — NO GOLDEN CASE</p>
      </section>
    );
  }

  const { inspector, convergence, rebuildMap, contract } = sr;
  const scores = inspector.scores;

  return (
    <section className="site00-dw-srf-inspector" data-panel="screen-replication">
      <header className="site00-dw-srf-inspector__head">
        <h3>SCREEN REPLICATION</h3>
        <span className="site00-dw-srf-inspector__status">{inspector.statusLabel}</span>
      </header>

      <dl className="site00-dw-srf-inspector__grid">
        <div>
          <dt>AUTHORITY</dt>
          <dd>{contract.authorityId}</dd>
        </div>
        <div>
          <dt>VIEWPORT</dt>
          <dd>{inspector.viewport}</dd>
        </div>
        <div>
          <dt>HOST LOCKED</dt>
          <dd>{inspector.hostLockedPercent}%</dd>
        </div>
        <div>
          <dt>AUTHORITY CONTROLLED</dt>
          <dd>{inspector.authorityControlledPercent}%</dd>
        </div>
        <div>
          <dt>ASSET DEFERRED</dt>
          <dd>{inspector.assetDeferredPercent}%</dd>
        </div>
        <div>
          <dt>ASSETS PENDING</dt>
          <dd>{inspector.assetPendingCount}</dd>
        </div>
        <div>
          <dt>CONVERGENCE PASSES</dt>
          <dd>{inspector.convergencePassCount}</dd>
        </div>
        <div>
          <dt>MOBILE PASS</dt>
          <dd>{inspector.mobilePass ? 'YES' : 'NO'}</dd>
        </div>
      </dl>

      {rebuildMap.hostBoundarySuspect ? (
        <p className="site00-dw-srf-inspector__warn">HOST_BOUNDARY_SUSPECT — review host-locked coverage</p>
      ) : null}

      {scores ? (
        <div className="site00-dw-srf-inspector__scores">
          <p>STRUCTURE {scores.STRUCTURE_MATCH} · GEOMETRY {scores.GEOMETRY_MATCH} · SPACING {scores.SPACING_MATCH}</p>
          <p>TYPOGRAPHY {scores.TYPOGRAPHY_MATCH} · COMPOSITION {scores.COMPOSITION_MATCH} · CONTROL {scores.CONTROL_MATCH}</p>
          <p>
            ASSET {scores.ASSET_MATCH} / {scores.assetMatchStatus}
          </p>
        </div>
      ) : null}

      {convergence.captures ? (
        <ul className="site00-dw-srf-inspector__captures">
          <li>
            <a href={convergence.captures.referenceUrl}>REFERENCE</a>
          </li>
          <li>
            <a href={convergence.captures.liveUrl}>LIVE</a>
          </li>
          <li>
            <a href={convergence.captures.overlayUrl}>OVERLAY</a>
          </li>
          <li>
            <a href={convergence.captures.diffUrl}>DIFF</a>
          </li>
        </ul>
      ) : null}

      <div className="site00-dw-srf-inspector__regions">
        <h4>REBUILD REGIONS</h4>
        <ul>
          {rebuildMap.regions.map((r) => (
            <li key={r.regionId}>
              {r.rebuildClass} · {r.regionId}
            </li>
          ))}
        </ul>
      </div>

      {inspector.differenceClasses.length ? (
        <p className="site00-dw-srf-inspector__diffs">DIFFERENCES: {inspector.differenceClasses.join(' · ')}</p>
      ) : null}

      <footer className="site00-dw-srf-inspector__summary">
        <p>SCREEN STRUCTURE {inspector.structuralQaPassed ? 'MATCHED' : 'DRIFT'}</p>
        <p>TYPOGRAPHY {scores && scores.TYPOGRAPHY_MATCH >= 92 ? 'MATCHED' : 'REVIEW'}</p>
        <p>COMPOSITION {scores && scores.COMPOSITION_MATCH >= 95 ? 'MATCHED' : 'REVIEW'}</p>
        <p>INTERACTIONS PRESERVED</p>
        <p>ASSETS {inspector.assetPendingCount} PENDING</p>
      </footer>
    </section>
  );
}
