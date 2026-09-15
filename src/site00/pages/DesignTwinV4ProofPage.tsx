import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes.js';
import { compileTwinV4ForensicReconstruction } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/compileTwinV4ForensicReconstruction.js';
import type { TwinV4ForensicReconstructionBundle } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/twinV4Types.js';
import { TwinV4ForensicReconstructionRenderer } from '../components/designWorkspace/TwinV4ForensicReconstructionRenderer.js';
import { P0_VR_TWIN_V40_LINEAGE, TWIN_V4_CSS_NAMESPACE, TWIN_V4_FAL_GENERATION_JOBS } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/constants.js';
import { P0_VR_TWIN_V30_BUILD } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { captureTwinV4LiveDomMeasurements } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/captureTwinV4LiveDomMeasurements.js';
import type { TwinV4DomMeasurementMap } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/twinV4Types.js';
import '../styles/site00-twin-v4-proof.css';

type ViewMode =
  | 'LIVE'
  | 'FORENSIC_AUTHORITY'
  | 'SIDE_BY_SIDE'
  | 'OVERLAY'
  | 'SCENE_GRAPH'
  | 'DOM_MEASUREMENTS';

export function DesignTwinV4ProofPage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const projectId = projectSlug.toLowerCase();
  const [mode, setMode] = useState<ViewMode>('LIVE');
  const [err, setErr] = useState<string | null>(null);
  const [bundle, setBundle] = useState<TwinV4ForensicReconstructionBundle | null>(null);
  const [liveDomMeasurements, setLiveDomMeasurements] = useState<TwinV4DomMeasurementMap | null>(null);
  const liveStageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const result = compileTwinV4ForensicReconstruction({
        projectId,
        sourcePackageId: `v4-package-${projectId}`,
        sourceActualHash: 'v4-founder-actual-hash',
      });
      setBundle(result);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'TWIN_V4_COMPILE_FAILED');
    }
  }, [projectId]);

  useEffect(() => {
    if (!bundle || mode !== 'LIVE') return;
    const stage = liveStageRef.current?.querySelector(`.site00-twin-v4__stage`);
    if (!(stage instanceof HTMLElement)) return;
    const id = requestAnimationFrame(() => {
      setLiveDomMeasurements(captureTwinV4LiveDomMeasurements({ sceneGraph: bundle.sceneGraph, stageElement: stage }));
    });
    return () => cancelAnimationFrame(id);
  }, [bundle, mode, bundle?.correctionIterations.length]);

  const correctionBoost = bundle?.correctionIterations.length ?? 0;
  const authorityUri = bundle?.ingestionReceipt.contentUri ?? '';

  const modes: ViewMode[] = [
    'LIVE',
    'FORENSIC_AUTHORITY',
    'SIDE_BY_SIDE',
    'OVERLAY',
    'SCENE_GRAPH',
    'DOM_MEASUREMENTS',
  ];

  const debugLine = useMemo(() => {
    if (!bundle) return '';
    return `gate=${bundle.gate.status} proof=${bundle.proofAnswer} nodes=${bundle.sceneGraph.nodes.length} falJobs=${TWIN_V4_FAL_GENERATION_JOBS}`;
  }, [bundle]);

  return (
    <div className="site00-page site00-page--twin-v4" data-lineage={P0_VR_TWIN_V40_LINEAGE} data-build={P0_VR_TWIN_V30_BUILD}>
      <header className={`${TWIN_V4_CSS_NAMESPACE}__topbar`} data-testid="twin-v4-topbar">
        <span>TWIN V4 · FORENSIC RECONSTRUCTION PROOF</span>
        <Link to={SITE00_ROUTES.site00Design + `?project=${projectId}`}>← DESIGN WORKSPACE</Link>
      </header>
      <div className={`${TWIN_V4_CSS_NAMESPACE}__modes`} data-testid="twin-v4-modes">
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            className={`${TWIN_V4_CSS_NAMESPACE}__mode-btn${mode === m ? ` ${TWIN_V4_CSS_NAMESPACE}__mode-btn--active` : ''}`}
            onClick={() => setMode(m)}
          >
            {m.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {err ?
        <p data-testid="twin-v4-error">{err}</p>
      : null}
      {!bundle ?
        <p data-testid="twin-v4-loading">Compiling V4 forensic reconstruction…</p>
      : null}
      {bundle && mode === 'LIVE' ?
        <div ref={liveStageRef}>
          <TwinV4ForensicReconstructionRenderer
            sceneGraph={bundle.sceneGraph}
            domPlan={bundle.domPlan}
            correctionBoost={correctionBoost}
          />
        </div>
      : null}
      {bundle && mode === 'FORENSIC_AUTHORITY' ?
        <div className={`${TWIN_V4_CSS_NAMESPACE}__authority-panel`} data-testid="twin-v4-authority-panel">
          <p>Reference only — not used as LIVE DOM substrate.</p>
          {authorityUri.startsWith('http') || authorityUri.startsWith('/') ?
            <img src={authorityUri} alt="" data-testid="twin-v4-authority-image" />
          : <p>{authorityUri}</p>}
        </div>
      : null}
      {bundle && mode === 'SIDE_BY_SIDE' ?
        <div className={`${TWIN_V4_CSS_NAMESPACE}__compare-row`}>
          <TwinV4ForensicReconstructionRenderer sceneGraph={bundle.sceneGraph} domPlan={bundle.domPlan} />
          <div className={`${TWIN_V4_CSS_NAMESPACE}__authority-panel`}>
            {authorityUri.startsWith('http') || authorityUri.startsWith('/') ?
              <img src={authorityUri} alt="" />
            : null}
          </div>
        </div>
      : null}
      {bundle && mode === 'OVERLAY' ?
        <div style={{ position: 'relative' }}>
          <TwinV4ForensicReconstructionRenderer sceneGraph={bundle.sceneGraph} domPlan={bundle.domPlan} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.25 }}>
            {authorityUri.startsWith('http') || authorityUri.startsWith('/') ?
              <img src={authorityUri} alt="" style={{ width: '100%' }} />
            : null}
          </div>
        </div>
      : null}
      {bundle && mode === 'SCENE_GRAPH' ?
        <pre data-testid="twin-v4-scene-graph-debug">{JSON.stringify(bundle.sceneGraph.nodes.slice(0, 24), null, 2)}</pre>
      : null}
      {bundle && mode === 'DOM_MEASUREMENTS' ?
        <pre data-testid="twin-v4-dom-measurements">
          {JSON.stringify(
            (liveDomMeasurements ?? bundle.domMeasurementMap).measurements.slice(0, 20),
            null,
            2,
          )}
        </pre>
      : null}
      {bundle ?
        <div className={`${TWIN_V4_CSS_NAMESPACE}__debug`} data-testid="twin-v4-debug">
          {debugLine} · lock={bundle.authorityLock.forensicBlueprintArtifactId} · hash=
          {bundle.authorityLock.forensicBlueprintHash.slice(0, 12)}
        </div>
      : null}
    </div>
  );
}
