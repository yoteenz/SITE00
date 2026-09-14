import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { P0_VR_TWIN_V30R7M_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import {
  approveMobileImplementationRender,
  canGenerateMobileTwinPackage,
  requestMobileRenderRegenerate,
  runGenerateMobileImplementationRender,
  runGenerateMobileTwinPackage,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/index.js';

type CompareMode = 'REFERENCE_ACTUAL' | 'ACTUAL_BLUEPRINT' | 'PACKAGE';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

function resolveImageSrc(uri: string): string {
  if (uri.startsWith('data:') || uri.startsWith('blob:')) return uri;
  if (uri.startsWith('http')) return uri;
  const pathPart = uri.startsWith('/') ? uri : `/${uri}`;
  return `${window.location.origin}${pathPart}`;
}

export function DesignPageV3MobileTwinPipelinePanel({ session, onSessionUpdate }: Props) {
  const pipeline = session.mobileTwinPipeline;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('REFERENCE_ACTUAL');

  if (!session.authorityPipeline?.mobileMaster) return null;

  const ref = pipeline?.designReference;
  const render = pipeline?.activeRenderId ? pipeline.renders.find((r) => r.id === pipeline.activeRenderId) : null;
  const pkg = pipeline?.latestPackageId ? pipeline.packages.find((p) => p.id === pipeline.latestPackageId) : null;
  const twin = pkg ? pipeline?.blueprintTwins.find((b) => b.id === pkg.blueprintTwinVisualId) : null;

  const comparePanels = useMemo(() => {
    const refSrc = ref ? resolveImageSrc(ref.sourceImageUri) : null;
    const renderSrc = render ? resolveImageSrc(render.renderImageUri) : null;
    const twinSrc = twin ? resolveImageSrc(twin.twinImageUri) : null;
    if (compareMode === 'REFERENCE_ACTUAL') {
      return [
        { label: 'DESIGN REFERENCE', src: refSrc, testId: 'v3-r7m-compare-reference' },
        { label: 'ACTUAL RENDER', src: renderSrc, testId: 'v3-r7m-compare-render' },
      ];
    }
    if (compareMode === 'ACTUAL_BLUEPRINT') {
      return [
        { label: 'ACTUAL RENDER', src: renderSrc, testId: 'v3-r7m-compare-render' },
        { label: 'BLUEPRINT TWIN', src: twinSrc, testId: 'v3-r7m-compare-blueprint' },
      ];
    }
    return [
      { label: 'REFERENCE', src: refSrc, testId: 'v3-r7m-compare-reference' },
      { label: 'RENDER', src: renderSrc, testId: 'v3-r7m-compare-render' },
      { label: 'BLUEPRINT', src: twinSrc, testId: 'v3-r7m-compare-blueprint' },
    ];
  }, [compareMode, ref, render, twin]);

  const runRender = () => {
    setBusy(true);
    setErr(null);
    void runGenerateMobileImplementationRender(session)
      .then(onSessionUpdate)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const runApprove = () => {
    setErr(null);
    try {
      onSessionUpdate(approveMobileImplementationRender(session));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const runPackage = () => {
    setBusy(true);
    setErr(null);
    void runGenerateMobileTwinPackage(session)
      .then(onSessionUpdate)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  return (
    <section
      className="site00-dw-v3-mobile-twin-pipeline"
      data-testid="v3-mobile-twin-pipeline"
      data-lineage={P0_VR_TWIN_V30R7M_LINEAGE}
    >
      <header>
        <strong>MOBILE TWIN PIPELINE</strong>
        <span>R7M · Desktop deferred</span>
      </header>
      <ul className="site00-dw-v3-mobile-twin-pipeline__steps">
        <li data-testid="v3-r7m-reference">
          REFERENCE · {ref ? 'DESIGN_REFERENCE_AUTHORITY · REFERENCE_LOCKED' : 'pending migration'}
          {ref ? ` · ${ref.sourceImageHash.slice(0, 12)}…` : ''}
        </li>
        <li data-testid="v3-r7m-render">
          ACTUAL RENDER · {render?.status ?? 'NOT GENERATED'} · gate {pipeline?.renderGate ?? '—'}
        </li>
        <li data-testid="v3-r7m-blueprint">
          BLUEPRINT TWIN · {twin ? 'READY' : render?.status === 'APPROVED' ? 'ready to generate' : 'waiting for render approval'}
        </li>
        <li data-testid="v3-r7m-package">
          STRUCTURED PACKAGE · {pkg?.status ?? 'WAITING'}
        </li>
        <li data-testid="v3-r7m-desktop">DESKTOP · DEFERRED</li>
      </ul>
      <div className="site00-dw-v3-mobile-twin-pipeline__actions">
        <button type="button" data-testid="v3-generate-mobile-render" disabled={busy} onClick={runRender}>
          GENERATE MOBILE RENDER
        </button>
        {render?.status === 'FOUNDER_REVIEW' ?
          <>
            <button type="button" data-testid="v3-approve-mobile-render" onClick={runApprove}>
              APPROVE MOBILE RENDER
            </button>
            <button
              type="button"
              data-testid="v3-regenerate-mobile-render"
              onClick={() => onSessionUpdate(requestMobileRenderRegenerate(session))}
            >
              REGENERATE MOBILE RENDER
            </button>
          </>
        : null}
        {canGenerateMobileTwinPackage(session) ?
          <button type="button" data-testid="v3-generate-mobile-twin-package" disabled={busy} onClick={runPackage}>
            GENERATE MOBILE TWIN PACKAGE
          </button>
        : null}
      </div>
      <div className="site00-dw-v3-mobile-twin-pipeline__compare" role="region" aria-label="Mobile twin founder review">
        <div className="site00-dw-v3-mobile-twin-pipeline__compare-tabs">
          <button
            type="button"
            data-testid="v3-r7m-mode-ref-actual"
            className={compareMode === 'REFERENCE_ACTUAL' ? 'is-active' : undefined}
            onClick={() => setCompareMode('REFERENCE_ACTUAL')}
          >
            REFERENCE ↔ ACTUAL
          </button>
          <button
            type="button"
            data-testid="v3-r7m-mode-actual-blueprint"
            className={compareMode === 'ACTUAL_BLUEPRINT' ? 'is-active' : undefined}
            onClick={() => setCompareMode('ACTUAL_BLUEPRINT')}
          >
            ACTUAL ↔ BLUEPRINT
          </button>
          <button
            type="button"
            data-testid="v3-r7m-mode-package"
            className={compareMode === 'PACKAGE' ? 'is-active' : undefined}
            onClick={() => setCompareMode('PACKAGE')}
          >
            PACKAGE
          </button>
        </div>
        <div className="site00-dw-v3-mobile-twin-pipeline__compare-grid">
          {comparePanels.map((panel) => (
            <figure key={panel.testId} data-testid={panel.testId}>
              <figcaption>{panel.label}</figcaption>
              {panel.src ?
                <img src={panel.src} alt={panel.label} loading="lazy" />
              : <p className="site00-dw-v3-mobile-twin-pipeline__placeholder">Not generated yet</p>}
            </figure>
          ))}
        </div>
      </div>
      {err ?
        <p className="site00-dw-v3-authority__error" role="alert">
          {err}
        </p>
      : null}
      <p className="site00-dw-v3-authority__hint">
        Primary geometry: MobileTwinCompositionState. R6F2 overlays remain forensic QA only (
        {pipeline?.r6f2ForensicRole ?? 'SUPERSEDED_BY_COMPOSITION_STATE_TWIN_PIPELINE'}).
      </p>
    </section>
  );
}
