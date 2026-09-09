/**
 * System Inspector → Reference Reconstruction — blueprint + boundary overlay.
 * P0.VR.6R6
 */

import {
  buildBoundaryOverlayRegions,
  buildReferenceReconstructionInspectorState,
  buildSkinsMobileReferenceBlueprint,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/index.js';

const BOUNDARY_CLASS_LABELS: Record<string, string> = {
  HOST_LOCKED: 'HOST LOCKED',
  AUTHORITY_REBUILD: 'AUTHORITY REBUILD',
  FUNCTION_PRESERVE_VISUAL_REBUILD: 'FUNCTION PRESERVE',
  ASSET_SLOT: 'ASSET SLOT',
  CONTEXT_ONLY: 'CONTEXT ONLY',
};

export function DesignReferenceReconstructionInspector() {
  const blueprint = buildSkinsMobileReferenceBlueprint();
  const inspector = buildReferenceReconstructionInspectorState({
    testsPass: true,
    visualQaExecuted: false,
    majorDriftRemaining: blueprint?.assetMismatchCount ?? 0,
    resolvedMismatches: 1,
  });
  const overlayRegions = blueprint ? buildBoundaryOverlayRegions(blueprint.authorityId) : [];

  if (!blueprint || !inspector) {
    return (
      <section className="site00-dw-rri-inspector" data-panel="reference-reconstruction">
        <p>REFERENCE RECONSTRUCTION — NO AUTHORITY REGISTERED</p>
      </section>
    );
  }

  return (
    <section className="site00-dw-rri-inspector" data-panel="reference-reconstruction">
      <header className="site00-dw-rri-inspector__head">
        <h3>REFERENCE RECONSTRUCTION</h3>
        <span className={`site00-dw-rri-inspector__status is-${inspector.blueprintStatus.toLowerCase()}`}>
          BLUEPRINT {inspector.blueprintStatus}
        </span>
      </header>

      <dl className="site00-dw-rri-inspector__grid">
        <div>
          <dt>AUTHORITY</dt>
          <dd>{inspector.authorityId}</dd>
        </div>
        <div>
          <dt>VIEWPORT</dt>
          <dd>{inspector.viewport.toUpperCase()}</dd>
        </div>
        <div>
          <dt>HOST SHELL COVERAGE</dt>
          <dd>{inspector.hostShellCoveragePercent}%</dd>
        </div>
        <div>
          <dt>AUTHORITY REBUILD</dt>
          <dd>{inspector.authorityRebuildCoveragePercent}%</dd>
        </div>
        <div>
          <dt>ASSET MISMATCHES</dt>
          <dd>{inspector.assetMismatchCount}</dd>
        </div>
        <div>
          <dt>MULTI-ASSET JOB</dt>
          <dd>{inspector.multiAssetJobId ? 'CREATED' : 'MISSING'}</dd>
        </div>
        <div>
          <dt>CROP APPROVAL</dt>
          <dd>{inspector.cropApprovalSummary}</dd>
        </div>
        <div>
          <dt>GENERATION</dt>
          <dd>{inspector.generationApprovalSummary}</dd>
        </div>
        <div>
          <dt>PARTIAL-OP GUARD</dt>
          <dd>{inspector.partialOpGuard}</dd>
        </div>
        <div>
          <dt>VERIFICATION</dt>
          <dd>{inspector.verificationStatus}</dd>
        </div>
      </dl>

      <div className="site00-dw-rri-inspector__overlay-wrap">
        <h4>AUTHORITY BOUNDARY OVERLAY</h4>
        <div className="site00-dw-rri-inspector__overlay-canvas" aria-hidden="true">
          {overlayRegions.map((r) => (
            <span
              key={r.regionId}
              className={`site00-dw-rri-inspector__overlay-region is-${r.boundaryClass.toLowerCase().replace(/_/g, '-')}`}
              style={{
                left: `${r.bbox.x * 100}%`,
                top: `${r.bbox.y * 100}%`,
                width: `${r.bbox.width * 100}%`,
                height: `${r.bbox.height * 100}%`,
              }}
              title={r.label}
            />
          ))}
        </div>
        <ul className="site00-dw-rri-inspector__overlay-legend">
          {Object.entries(BOUNDARY_CLASS_LABELS).map(([key, label]) => (
            <li key={key} className={`is-${key.toLowerCase().replace(/_/g, '-')}`}>
              {label}
            </li>
          ))}
        </ul>
        <ul className="site00-dw-rri-inspector__overlay-list">
          {overlayRegions.slice(0, 12).map((r) => (
            <li key={r.regionId} className={`is-${r.boundaryClass.toLowerCase().replace(/_/g, '-')}`}>
              {r.label} — {BOUNDARY_CLASS_LABELS[r.boundaryClass]}
            </li>
          ))}
        </ul>
      </div>

      <details className="site00-dw-rri-inspector__regions" open>
        <summary>REGION TREE ({blueprint.regionTree.length})</summary>
        <ul>
          {blueprint.regionTree.map((r) => (
            <li key={r.regionId}>
              {r.regionId} · {r.role} · {r.expectedPositioning}
            </li>
          ))}
        </ul>
      </details>

      <details className="site00-dw-rri-inspector__assets">
        <summary>ASSET REQUIREMENTS</summary>
        <ul>
          {blueprint.assetRequirements.map((a) => (
            <li key={a.slotId}>
              {a.slotId} — {a.bound ? 'BOUND' : 'PENDING'}
            </li>
          ))}
        </ul>
      </details>

      {inspector.failureCodes.length > 0 ? (
        <p className="site00-dw-rri-inspector__blockers">BLOCKERS: {inspector.failureCodes.join(', ')}</p>
      ) : null}
    </section>
  );
}
