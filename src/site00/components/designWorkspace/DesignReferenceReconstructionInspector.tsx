/**
 * System Inspector → Reference Reconstruction — blueprint + convergence state.
 */

import {
  buildReferenceReconstructionInspectorState,
  buildSkinsMobileReferenceBlueprint,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/index.js';

export function DesignReferenceReconstructionInspector() {
  const blueprint = buildSkinsMobileReferenceBlueprint();
  const inspector = buildReferenceReconstructionInspectorState({
    testsPass: true,
    visualQaExecuted: false,
    majorDriftRemaining: blueprint?.assetRequirements.filter((a) => a.required && !a.bound).length ?? 0,
  });

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
          <dt>CONTENT CANVAS</dt>
          <dd>
            {inspector.contentCanvas.width}×{inspector.contentCanvas.height}
          </dd>
        </div>
        <div>
          <dt>REGION COUNT</dt>
          <dd>{inspector.regionCount}</dd>
        </div>
        <div>
          <dt>LAYOUT INFERENCE</dt>
          <dd>{inspector.layoutInferenceStatus}</dd>
        </div>
        <div>
          <dt>ASSET REQUIREMENTS</dt>
          <dd>{inspector.assetRequirementCount}</dd>
        </div>
        <div>
          <dt>EXECUTION CONFLICTS</dt>
          <dd>{inspector.styleConflictCount}</dd>
        </div>
        <div>
          <dt>CAPTURE READY</dt>
          <dd>{inspector.captureReadyStatus}</dd>
        </div>
        <div>
          <dt>NO-OP GUARD</dt>
          <dd>{inspector.noOpGuard}</dd>
        </div>
        <div>
          <dt>FALSE-PASS GUARD</dt>
          <dd>{inspector.falsePassGuard}</dd>
        </div>
        <div>
          <dt>VERIFICATION</dt>
          <dd>{inspector.verificationStatus}</dd>
        </div>
      </dl>

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

      <details className="site00-dw-rri-inspector__layout">
        <summary>LAYOUT PLAN</summary>
        <ul>
          {Object.entries(blueprint.layoutPlan.regionLayoutModes).map(([id, mode]) => (
            <li key={id}>
              {id}: {mode}
            </li>
          ))}
        </ul>
      </details>

      <details className="site00-dw-rri-inspector__typography">
        <summary>TYPOGRAPHY SPEC ({blueprint.typographySpecs.length})</summary>
        <ul>
          {blueprint.typographySpecs.slice(0, 8).map((t) => (
            <li key={t.regionId}>
              {t.regionId}: {t.fontSize}px / {t.lineCount} lines
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

      {inspector.captureBlockers.length > 0 ? (
        <p className="site00-dw-rri-inspector__blockers">BLOCKERS: {inspector.captureBlockers.join(', ')}</p>
      ) : null}
    </section>
  );
}
