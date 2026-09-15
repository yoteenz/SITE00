import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes.js';
import {
  P0_VR_TWIN_V41_LINEAGE,
  PIXEL_EXTRACTION_REVIEW_REQUIRED,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/constants.js';
import { TwinV41PixelExtractionOverlay } from '../components/designWorkspace/TwinV41PixelExtractionOverlay.js';
import { TwinV42LiveReconstruction } from '../components/designWorkspace/TwinV42LiveReconstruction.js';
import { P0_VR_TWIN_V30_BUILD } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { TWIN_V4_CSS_NAMESPACE } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/constants.js';
import { compileTwinV42PageBoot } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/compileTwinV42PageBoot.js';
import type { TwinV42PageBootResult } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/compileTwinV42PageBoot.js';
import {
  TWIN_V4_GOLDEN_AUTHORITY_INVALID,
  TWIN_V4_GOLDEN_AUTHORITY_UNAVAILABLE,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/constants.js';
import { primeTwinV41ForensicFromDesignSession } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/primeTwinV41ForensicFromDesignSession.js';
import { TwinV42GoldenBootError } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42GoldenBootError.js';
import type { TwinV42GoldenDiffBundle } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42Types.js';
import { readTwinV42GoldenDiffBundle } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42Persistence.js';
import '../styles/site00-twin-v4-proof.css';

type ViewMode =
  | 'LIVE_RECONSTRUCTION'
  | 'FORENSIC_AUTHORITY'
  | 'SIDE_BY_SIDE'
  | 'OVERLAY'
  | 'DIFF_HEATMAP'
  | 'REGION_DIFF'
  | 'PIXEL_EXTRACTION'
  | 'SCENE_GRAPH'
  | 'EVIDENCE';

export function DesignTwinV4ProofPage() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const projectId = projectSlug.toLowerCase();
  const [searchParams] = useSearchParams();
  const goldenDiffCapture = searchParams.get('goldenDiffCapture') === '1';
  const [mode, setMode] = useState<ViewMode>(goldenDiffCapture ? 'LIVE_RECONSTRUCTION' : 'LIVE_RECONSTRUCTION');
  const [err, setErr] = useState<string | null>(null);
  const [boot, setBoot] = useState<TwinV42PageBootResult | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [bootStatus, setBootStatus] = useState<string | null>(null);
  const [diffBundle, setDiffBundle] = useState<TwinV42GoldenDiffBundle | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setErr(null);
      setBoot(null);
      setBootStatus('Checking cached forensic blueprint…');
      await primeTwinV41ForensicFromDesignSession(projectId);
      setBootStatus('Validating founder golden authority…');
      try {
        const result = await compileTwinV42PageBoot({
          projectId,
          queryActualHash: searchParams.get('actualHash'),
          allowSeal: true,
        });
        if (!cancelled) {
          setBoot(result);
          setDiffBundle(readTwinV42GoldenDiffBundle());
          setBootStatus(null);
        }
      } catch (e) {
        if (!cancelled) {
          setBootStatus(null);
          if (e instanceof TwinV42GoldenBootError) {
            setErr(e.message);
            return;
          }
          const msg = e instanceof Error ? e.message : 'TWIN_V42_BOOT_FAILED';
          if (msg.includes(TWIN_V4_GOLDEN_AUTHORITY_UNAVAILABLE)) {
            setErr(msg);
          } else if (msg.includes(TWIN_V4_GOLDEN_AUTHORITY_INVALID)) {
            setErr(TWIN_V4_GOLDEN_AUTHORITY_INVALID);
          } else {
            setErr(msg);
          }
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [projectId, searchParams]);

  const modes: ViewMode[] = goldenDiffCapture
    ? ['LIVE_RECONSTRUCTION']
    : [
        'LIVE_RECONSTRUCTION',
        'FORENSIC_AUTHORITY',
        'SIDE_BY_SIDE',
        'OVERLAY',
        'DIFF_HEATMAP',
        'REGION_DIFF',
        'PIXEL_EXTRACTION',
        'SCENE_GRAPH',
        'EVIDENCE',
      ];

  const bundle = boot?.pixelBundle ?? null;
  const golden = boot?.goldenAuthority ?? null;
  const viewport = boot?.canonicalViewport ?? null;

  const debugLine = useMemo(() => {
    if (!bundle || !golden) return '';
    const lastIter = diffBundle?.iterations[diffBundle.iterations.length - 1];
    const diffPct = lastIter ? `${(lastIter.fullDiff.diffPercent * 100).toFixed(2)}%` : '—';
    return `gate=${diffBundle?.gate.status ?? 'BLOCKED'} proof=${diffBundle?.reconstructionEngineProof ?? bundle.reconstructionEngineProof} diff=${diffPct} · ${PIXEL_EXTRACTION_REVIEW_REQUIRED}`;
  }, [bundle, golden, diffBundle]);

  const selectedNode = bundle?.sceneGraph.nodes.find((n) => n.sceneNodeId === selectedNodeId) ?? null;
  const lastIteration = diffBundle?.iterations[diffBundle.iterations.length - 1] ?? null;
  const goldenDisplayUrl = golden?.artifactUrl.startsWith('file://') ? undefined : golden?.artifactUrl;

  return (
    <div
      className={`site00-page site00-page--twin-v4 site00-page--twin-v41 site00-page--twin-v42${goldenDiffCapture ? ' site00-page--twin-v42-capture' : ''}`}
      data-lineage={boot?.lineage ?? P0_VR_TWIN_V41_LINEAGE}
      data-build={P0_VR_TWIN_V30_BUILD}
    >
      {!goldenDiffCapture ?
        <header className={`${TWIN_V4_CSS_NAMESPACE}__topbar`} data-testid="twin-v4-topbar">
          <span>TWIN V4.2 · GOLDEN AUTHORITY + LIVE RECONSTRUCTION</span>
          <Link to={SITE00_ROUTES.site00Design + `?project=${projectId}`}>← DESIGN WORKSPACE</Link>
        </header>
      : null}
      {!goldenDiffCapture ?
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
      : null}
      {err ?
        <div className="site00-twin-v41-boot-help" data-testid="twin-v4-error">
          <p>{err}</p>
          <p>
            V4 needs a <strong>hard-pinned</strong> https Fal forensic PNG on <strong>this device</strong> (no{' '}
            <code>local-autobuild://</code> stub). Open <strong>/projects/{projectId}/design/twin</strong> or Design
            workspace until twin loads, then return here — V4 auto-primes the forensic API and seals the golden pin.
            Optional: <code>?actualHash=…</code>
          </p>
        </div>
      : null}
      {!boot && !err ?
        <p data-testid="twin-v4-loading">{bootStatus ?? 'Booting Twin V4.2…'}</p>
      : null}
      {boot && golden && mode === 'FORENSIC_AUTHORITY' ?
        <div className="site00-twin-v42-authority" data-testid="twin-v4-authority-panel">
          <p>Founder-approved golden forensic (immutable pin — sole reconstruction reference).</p>
          <dl className="site00-twin-v42-authority__meta">
            <dt>Artifact ID</dt>
            <dd data-testid="twin-v4-authority-id">{golden.artifactId}</dd>
            <dt>SHA256</dt>
            <dd data-testid="twin-v4-authority-sha">{golden.sha256}</dd>
            <dt>Dimensions</dt>
            <dd data-testid="twin-v4-authority-dims">
              {golden.width}×{golden.height}
            </dd>
            <dt>Immutable</dt>
            <dd>{golden.immutable ? 'YES' : 'NO'}</dd>
            <dt>URL status</dt>
            <dd data-testid="twin-v4-authority-url-status">
              {golden.httpStatus ?? (goldenDisplayUrl ? 'HTTPS' : 'LOCAL_FIXTURE')}
            </dd>
          </dl>
          {goldenDisplayUrl ?
            <img src={goldenDisplayUrl} alt="" data-testid="twin-v4-authority-image" width={golden.width} height={golden.height} />
          : bundle ?
            <img src={bundle.authorityLock.imageUri} alt="" data-testid="twin-v4-authority-image" />
          : null}
        </div>
      : null}
      {boot && bundle && viewport && (mode === 'LIVE_RECONSTRUCTION' || goldenDiffCapture) ?
        <TwinV42LiveReconstruction sceneGraph={bundle.sceneGraph} viewport={viewport} />
      : null}
      {boot && bundle && golden && viewport && mode === 'SIDE_BY_SIDE' ?
        <div className="site00-twin-v42-compare" data-testid="twin-v4-side-by-side">
          <div>
            <p>GOLDEN</p>
            {goldenDisplayUrl ?
              <img src={goldenDisplayUrl} alt="" width={viewport.width} height={viewport.height} />
            : (
              <img src={bundle.authorityLock.imageUri} alt="" width={viewport.width} height={viewport.height} />
            )}
          </div>
          <div>
            <p>LIVE DOM</p>
            <TwinV42LiveReconstruction sceneGraph={bundle.sceneGraph} viewport={viewport} />
          </div>
        </div>
      : null}
      {boot && bundle && golden && viewport && mode === 'OVERLAY' ?
        <div className="site00-twin-v42-overlay" data-testid="twin-v4-overlay">
          <TwinV42LiveReconstruction sceneGraph={bundle.sceneGraph} viewport={viewport} />
          {goldenDisplayUrl ?
            <img
              className="site00-twin-v42-overlay__golden"
              src={goldenDisplayUrl}
              alt=""
              width={viewport.width}
              height={viewport.height}
            />
          : null}
        </div>
      : null}
      {mode === 'DIFF_HEATMAP' && lastIteration ?
        <div data-testid="twin-v4-diff-heatmap-panel">
          <p>Iteration {lastIteration.iteration} heatmap (QA artifact path in bundle JSON).</p>
          <p>
            Full page: {(lastIteration.fullDiff.diffPercent * 100).toFixed(2)}% · threshold{' '}
            {(lastIteration.fullDiff.threshold * 100).toFixed(2)}% ·{' '}
            {lastIteration.fullDiff.pass ? 'PASS' : 'FAIL'}
          </p>
        </div>
      : null}
      {mode === 'REGION_DIFF' && lastIteration ?
        <div className="site00-twin-v42-region-diff" data-testid="twin-v4-region-diff-panel">
          <p>
            FULL PAGE DIFF: {(lastIteration.fullDiff.diffPercent * 100).toFixed(2)}% · THRESHOLD:{' '}
            {(lastIteration.fullDiff.threshold * 100).toFixed(2)}% · STATUS:{' '}
            {lastIteration.fullDiff.pass ? 'PASS' : 'FAIL'}
          </p>
          <ul>
            {lastIteration.regionDiffs.map((r) => (
              <li key={r.regionId} data-testid={`twin-v4-region-${r.regionId}`}>
                {r.regionId.replace(/_/g, ' ')}: {(r.diffPercent * 100).toFixed(2)}% ·{' '}
                {r.pass ? 'PASS' : 'FAIL'}
              </li>
            ))}
          </ul>
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
          <p>Purge stale ids: {boot?.purgeReceipt.staleIdsRemoved.length ?? 0}</p>
          <p>Active golden: {boot?.purgeReceipt.activeHash.slice(0, 16)}…</p>
          <p>Receipt status: {bundle.receipt.status}</p>
          <p>Major regions: {bundle.receipt.majorRegionCount}</p>
          <p>Raster firewall violations: {diffBundle?.rasterFirewall.violations.length ?? 0}</p>
        </div>
      : null}
      {boot ?
        <div className={`${TWIN_V4_CSS_NAMESPACE}__debug`} data-testid="twin-v4-debug">
          {debugLine} · pin={golden?.artifactId} · {golden?.width}×{golden?.height}
        </div>
      : null}
    </div>
  );
}
