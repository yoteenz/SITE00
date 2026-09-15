import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes.js';
import { compileTwinV41PixelExtraction } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/compileTwinV41PixelExtraction.js';
import type { TwinV41PixelExtractionBundle } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41Types.js';
import {
  P0_VR_TWIN_V41_LINEAGE,
  PIXEL_EXTRACTION_REVIEW_REQUIRED,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/constants.js';
import { resolveTwinV41BootContext } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/resolveTwinV41BootContext.js';
import { primeTwinV41ForensicFromDesignSession } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/primeTwinV41ForensicFromDesignSession.js';
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
  const [bootStatus, setBootStatus] = useState<string | null>(null);

  const bootContext = useMemo(
    () =>
      resolveTwinV41BootContext({
        projectId,
        queryActualHash: searchParams.get('actualHash'),
      }),
    [projectId, searchParams],
  );
  const sourceActualHash = bootContext.sourceActualHash;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setErr(null);
      setBundle(null);
      let hash = sourceActualHash;
      if (!hash) {
        setBootStatus('Looking for cached forensic blueprint…');
        const primed = await primeTwinV41ForensicFromDesignSession(projectId);
        if (primed.ok) {
          hash = primed.sourceActualHash;
        } else if (primed.code !== 'SKIPPED_VITEST') {
          setBootStatus(null);
          setErr(`TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE — ${primed.message}`);
          return;
        }
      }
      if (!hash) {
        setBootStatus(null);
        setErr('TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE');
        return;
      }
      setBootStatus('Running pixel extraction…');
      try {
        const result = await compileTwinV41PixelExtraction({ projectId, sourceActualHash: hash });
        if (!cancelled) {
          setBundle(result);
          setBootStatus(null);
        }
      } catch (e) {
        if (!cancelled) {
          setBootStatus(null);
          const msg = e instanceof Error ? e.message : 'TWIN_V41_EXTRACTION_FAILED';
          if (msg.includes('TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE')) {
            setBootStatus('Fetching forensic blueprint from API…');
            const primed = await primeTwinV41ForensicFromDesignSession(projectId);
            if (primed.ok) {
              try {
                const retry = await compileTwinV41PixelExtraction({
                  projectId,
                  sourceActualHash: primed.sourceActualHash,
                });
                if (!cancelled) {
                  setBundle(retry);
                  setBootStatus(null);
                  return;
                }
              } catch (retryErr) {
                if (!cancelled) {
                  setErr(retryErr instanceof Error ? retryErr.message : msg);
                }
                return;
              }
            }
            if (!cancelled && !primed.ok) {
              setErr(`TWIN_V41_FORENSIC_PIXEL_AUTHORITY_UNAVAILABLE — ${primed.message}`);
            }
            return;
          }
          setErr(msg);
        }
      }
    }

    void run();
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
        <div className="site00-twin-v41-boot-help" data-testid="twin-v4-error">
          <p>{err}</p>
          <p>
            V4 needs an <strong>https</strong> Fal forensic PNG in this browser (not the gray{' '}
            <code>local-autobuild://</code> stub). Open <strong>/projects/{projectId}/design/twin</strong> or Design
            workspace so the package exists, then reload this page — V4 will try the forensic API automatically. Optional:{' '}
            <code>?actualHash=…</code> if you have the twin actual hash.
          </p>
        </div>
      : null}
      {!bundle && !err ?
        <p data-testid="twin-v4-loading">{bootStatus ?? 'Running forensic pixel analysis…'}</p>
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
