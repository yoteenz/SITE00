import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes.js';
import { compileTwinV41PixelExtraction } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/compileTwinV41PixelExtraction.js';
import type { TwinV41PixelExtractionBundle } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41Types.js';
import {
  P0_VR_TWIN_V41_LINEAGE,
  PIXEL_EXTRACTION_REVIEW_REQUIRED,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/constants.js';
import { findFounderApprovedForensicBlueprintInStorage } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/forensicBlueprintCache.js';
import { TwinV41PixelExtractionOverlay } from '../components/designWorkspace/TwinV41PixelExtractionOverlay.js';
import { P0_VR_TWIN_V30_BUILD } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { TWIN_V4_CSS_NAMESPACE } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/constants.js';
import '../styles/site00-twin-v4-proof.css';

type ViewMode = 'FORENSIC_AUTHORITY' | 'PIXEL_EXTRACTION' | 'SCENE_GRAPH' | 'EVIDENCE';

export function DesignTwinV4ProofPage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const projectId = projectSlug.toLowerCase();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<ViewMode>('PIXEL_EXTRACTION');
  const [err, setErr] = useState<string | null>(null);
  const [bundle, setBundle] = useState<TwinV41PixelExtractionBundle | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const sourceActualHash = useMemo(() => {
    const fromQuery = searchParams.get('actualHash');
    if (fromQuery) return fromQuery;
    const stored = findFounderApprovedForensicBlueprintInStorage();
    return stored?.sourceActualHash ?? '';
  }, [searchParams]);

  useEffect(() => {
    if (!sourceActualHash) {
      setErr('TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE');
      setBundle(null);
      return;
    }
    let cancelled = false;
    setErr(null);
    compileTwinV41PixelExtraction({ projectId, sourceActualHash })
      .then((result) => {
        if (!cancelled) setBundle(result);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'TWIN_V41_EXTRACTION_FAILED');
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, sourceActualHash]);

  const modes: ViewMode[] = ['FORENSIC_AUTHORITY', 'PIXEL_EXTRACTION', 'SCENE_GRAPH', 'EVIDENCE'];

  const debugLine = useMemo(() => {
    if (!bundle) return '';
    return `gate=${bundle.gate.status} proof=${bundle.reconstructionEngineProof} nodes=${bundle.sceneGraph.nodes.length} · ${PIXEL_EXTRACTION_REVIEW_REQUIRED}`;
  }, [bundle]);

  const selectedNode = bundle?.sceneGraph.nodes.find((n) => n.sceneNodeId === selectedNodeId) ?? null;

  return (
    <div
      className="site00-page site00-page--twin-v4 site00-page--twin-v41"
      data-lineage={P0_VR_TWIN_V41_LINEAGE}
      data-build={P0_VR_TWIN_V30_BUILD}
    >
      <header className={`${TWIN_V4_CSS_NAMESPACE}__topbar`} data-testid="twin-v4-topbar">
        <span>TWIN V4.1 · PIXEL-DERIVED FORENSIC EXTRACTION</span>
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
      {!bundle && !err ?
        <p data-testid="twin-v4-loading">Running forensic pixel analysis…</p>
      : null}
      {bundle && mode === 'FORENSIC_AUTHORITY' ?
        <div className="site00-twin-v41-extraction__authority-only" data-testid="twin-v4-authority-panel">
          <p>Founder-approved forensic blueprint (sole visual authority).</p>
          <img src={bundle.authorityLock.imageUri} alt="" data-testid="twin-v4-authority-image" />
        </div>
      : null}
      {bundle && mode === 'PIXEL_EXTRACTION' ?
        <TwinV41PixelExtractionOverlay bundle={bundle} />
      : null}
      {bundle && mode === 'SCENE_GRAPH' ?
        <div className="site00-twin-v41-scene-list" data-testid="twin-v41-scene-graph">
          <ul>
            {bundle.sceneGraph.nodes.slice(0, 48).map((n) => (
              <li key={n.sceneNodeId}>
                <button type="button" onClick={() => setSelectedNodeId(n.sceneNodeId)}>
                  {n.sceneNodeId} · {n.type} · ev={n.evidence.evidenceCount}
                </button>
              </li>
            ))}
          </ul>
          {selectedNode ?
            <div data-testid="twin-v41-scene-node-detail">
              {selectedNode.sceneNodeId} — confidence {selectedNode.evidence.confidence.toFixed(2)}
            </div>
          : null}
        </div>
      : null}
      {bundle && mode === 'EVIDENCE' ?
        <div className="site00-twin-v41-evidence" data-testid="twin-v41-evidence">
          <p>Receipt status: {bundle.receipt.status}</p>
          <p>Major regions: {bundle.receipt.majorRegionCount}</p>
          <p>Text regions: {bundle.receipt.textRegionCount}</p>
          <p>Edges: {bundle.receipt.edgeCount}</p>
          <p>Callouts: {bundle.receipt.calloutCount}</p>
          <p>Nodes without evidence: {bundle.receipt.nodesWithoutEvidence}</p>
          <p>Average confidence: {bundle.receipt.averageConfidence.toFixed(3)}</p>
          <ul>
            {bundle.analysis.colorSampleMap.samples.map((s) => (
              <li key={s.sampleId}>
                {s.role}: {s.hex} @ ({s.x},{s.y})
              </li>
            ))}
          </ul>
        </div>
      : null}
      {bundle ?
        <div className={`${TWIN_V4_CSS_NAMESPACE}__debug`} data-testid="twin-v4-debug">
          {debugLine} · lock={bundle.authorityLock.artifactId} · {bundle.authorityLock.imageWidth}×
          {bundle.authorityLock.imageHeight}
        </div>
      : null}
    </div>
  );
}
