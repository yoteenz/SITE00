import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import {
  P0_VR_TWIN_V30R7MF2_LINEAGE,
  P0_VR_TWIN_V30R7MF3_LINEAGE,
  P0_VR_TWIN_V30R7M_LINEAGE,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { approveMobileTwinPackage, canApproveMobileTwinPackage } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/approveMobileTwinPackage.js';
import { selectMobileImplementationRender } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/approveMobileImplementationRender.js';
import { requestMobileTwinFal } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinFal.js';
import { ensureMobileTwinPipelineDefaults } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import {
  BLUEPRINT_DARK_MODE_VIOLATION,
  MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
  type BlueprintVisualStyleReceipt,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/blueprintVisualStyleContract.js';
import { resolveMobileTwinReviewSlots } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';
import { evaluateBlueprintLightStyleRetry } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateBlueprintLightStyleRetry.js';
import { LOCKED_MOBILE_STRATEGY_STATUS } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinProviderPromotionTypes.js';
import { DesignPageV3MobileTwinPackageInspector } from './DesignPageV3MobileTwinPackageInspector.js';

type CompareMode = 'REFERENCE_ACTUAL' | 'ACTUAL_BLUEPRINT' | 'PACKAGE';
type ViewMode = 'SIDE_BY_SIDE' | 'FULLSCREEN_REFERENCE' | 'FULLSCREEN_ACTUAL' | 'FULLSCREEN_BLUEPRINT';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

function resolveImageSrc(uri: string): string {
  if (uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('vitest-fal://')) return uri;
  if (uri.startsWith('http')) return uri;
  const pathPart = uri.startsWith('/') ? uri : `/${uri}`;
  return `${window.location.origin}${pathPart}`;
}

export function DesignPageV3MobileTwinPipelinePanel({ session, onSessionUpdate }: Props) {
  const pipeline = session.mobileTwinPipeline ? ensureMobileTwinPipelineDefaults(session.mobileTwinPipeline) : undefined;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<CompareMode>('REFERENCE_ACTUAL');
  const [viewMode, setViewMode] = useState<ViewMode>('SIDE_BY_SIDE');
  const [packageFullscreen, setPackageFullscreen] = useState<{ label: string; src: string } | null>(null);
  const showPackageInspector = compareMode === 'PACKAGE' && viewMode === 'SIDE_BY_SIDE';
  if (!session.authorityPipeline?.mobileMaster) return null;

  const ref = pipeline?.designReference;
  const slots = pipeline ? resolveMobileTwinReviewSlots(pipeline) : null;
  const render = slots?.actualRender ?? null;
  const twin = slots?.blueprintTwin ?? null;
  const pkg = pipeline?.latestPackageId ? pipeline.packages.find((p) => p.id === pipeline.latestPackageId) : null;
  const blueprintStyleLabel =
    twin?.outputRepresentationMode === 'LIGHT_TECHNICAL_BLUEPRINT' ? 'LIGHT TECHNICAL'
    : twin?.blueprintVisualVariant === 'HISTORICAL_BLUEPRINT_VARIANT' ? 'HISTORICAL'
    : 'BLUEPRINT';
  const atomicRun =
    slots?.atomicRunId ? pipeline?.atomicRuns.find((r) => r.id === slots.atomicRunId) ?? null : null;
  const visualPair = pipeline?.activeVisualPairId ?
    pipeline.visualPairs.find((p) => p.id === pipeline.activeVisualPairId)
  : null;
  const isRealRender = render?.renderMode === 'REAL_PROVIDER_RENDER' || render?.provider === 'FAL';
  const actualStepLabel =
    busy ? 'GENERATING'
    : atomicRun?.actualStatus === 'GENERATING' ? 'GENERATING'
    : render?.providerStatus === 'FAILED' ? 'FAILED'
    : render ? 'READY'
    : 'NOT GENERATED';
  const blueprintStepLabel =
    busy ? 'GENERATING'
    : atomicRun?.blueprintStatus === 'GENERATING' ? 'GENERATING'
    : twin ? 'READY'
    : atomicRun?.status === 'PARTIAL' ? 'BLOCKED (retry)'
    : 'NOT GENERATED';
  const falJobCount = slots?.falJobCount ?? pipeline?.falJobsDispatched ?? 0;
  const providerCost = slots?.providerCostUsd ?? pipeline?.totalProviderCostUsd ?? 0;
  const styleReceipt =
    twin?.styleReceiptId ?
      (pipeline?.artifactsById[twin.styleReceiptId] as BlueprintVisualStyleReceipt | undefined)
    : null;
  const blueprintRetryView =
    pipeline ?
      evaluateBlueprintLightStyleRetry({
        actualRender: render,
        blueprintTwin: twin,
        artifactsById: pipeline.artifactsById,
        publicOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
      })
    : null;
  const blueprintNeedsLightStyle = Boolean(blueprintRetryView?.urgentLightStyleRequired);
  const showBlueprintRetryButton = Boolean(blueprintRetryView?.canRetryLightBlueprint);
  const historicalBlueprintCount =
    pipeline?.blueprintTwins.filter((b) => b.blueprintVisualVariant === 'HISTORICAL_BLUEPRINT_VARIANT').length ??
    0;

  const comparePanels = useMemo(() => {
    const refSrc = ref ? resolveImageSrc(ref.sourceImageUri) : null;
    const renderSrc = render ? resolveImageSrc(render.renderImageUri) : null;
    const twinSrc = twin ? resolveImageSrc(twin.twinImageUri) : null;
    if (viewMode === 'FULLSCREEN_REFERENCE') {
      return [{ label: 'DESIGN REFERENCE', src: refSrc, testId: 'v3-r7m-compare-reference' }];
    }
    if (viewMode === 'FULLSCREEN_ACTUAL') {
      return [{ label: 'ACTUAL PAGE', src: renderSrc, testId: 'v3-r7m-compare-render' }];
    }
    if (viewMode === 'FULLSCREEN_BLUEPRINT') {
      return [{ label: 'BLUEPRINT PAGE', src: twinSrc, testId: 'v3-r7m-compare-blueprint' }];
    }
    if (compareMode === 'REFERENCE_ACTUAL') {
      return [
        { label: 'DESIGN REFERENCE', src: refSrc, testId: 'v3-r7m-compare-reference' },
        { label: 'ACTUAL PAGE', src: renderSrc, testId: 'v3-r7m-compare-render' },
      ];
    }
    if (compareMode === 'ACTUAL_BLUEPRINT') {
      return [
        { label: 'ACTUAL PAGE', src: renderSrc, testId: 'v3-r7m-compare-render' },
        { label: `BLUEPRINT TWIN · ${blueprintStyleLabel}`, src: twinSrc, testId: 'v3-r7m-compare-blueprint' },
      ];
    }
    return [
      { label: 'REFERENCE', src: refSrc, testId: 'v3-r7m-compare-reference' },
      { label: 'ACTUAL PAGE', src: renderSrc, testId: 'v3-r7m-compare-render' },
      { label: `BLUEPRINT TWIN · ${blueprintStyleLabel}`, src: twinSrc, testId: 'v3-r7m-compare-blueprint' },
    ];
  }, [blueprintStyleLabel, compareMode, ref, render, twin, viewMode]);

  const runFal = (action: Parameters<typeof requestMobileTwinFal>[0]['action'], refineNotes?: string[]) => {
    setBusy(true);
    setErr(null);
    void requestMobileTwinFal({ session, action, founderConfirmedSpend: true, refineNotes })
      .then(onSessionUpdate)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const providerLocked = Boolean(pipeline?.mobileTwinProviderLock?.locked);
  const nbpPackageMode =
    providerLocked || pipeline?.mobileTwinRenderStrategy?.status === LOCKED_MOBILE_STRATEGY_STATUS;
  const strategyResolved =
    providerLocked ||
    pipeline?.founderManualTwinPathUnlock ||
    pipeline?.mobileTwinVisualGenerationStrategy !== 'UNRESOLVED';
  const runTwin = () => runFal('GENERATE_MOBILE_TWIN');

  const runApproveTwin = () => {
    setErr(null);
    try {
      onSessionUpdate(approveMobileTwinPackage(session));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section
      className="site00-dw-v3-mobile-twin-pipeline"
      data-testid="v3-mobile-twin-pipeline"
      data-lineage={P0_VR_TWIN_V30R7MF3_LINEAGE}
    >
      <header>
        <strong>MOBILE TWIN REVIEW</strong>
        <span>R7MF3 · atomic twin pair · Desktop deferred</span>
      </header>
      <ul className="site00-dw-v3-mobile-twin-pipeline__steps">
        <li data-testid="v3-r7m-reference">
          REFERENCE · {ref ? 'DESIGN_REFERENCE_AUTHORITY · REFERENCE_LOCKED' : 'pending migration'}
          {ref ? ` · ${ref.sourceImageHash.slice(0, 12)}…` : ''}
        </li>
        <li data-testid="v3-r7m-render">
          ACTUAL PAGE · {actualStepLabel}
          {render ? ` · ${isRealRender ? 'FAL' : 'LOCAL_PROOF_ONLY'}` : ''}
          {render?.referenceCloneRisk ? ` · clone risk ${render.referenceCloneRisk}` : ''}
        </li>
        <li data-testid="v3-r7m-blueprint">
          BLUEPRINT TWIN · {blueprintStyleLabel} · {blueprintStepLabel}
          {twin?.styleContractId === MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID ?
            ' · STYLE CONTRACT LIGHT V1'
          : ''}
          {blueprintNeedsLightStyle ? ' · LIGHT STYLE REQUIRED' : ''}
        </li>
        {twin ?
          <li data-testid="v3-r7m-blueprint-technical">
            ACTIVE BLUEPRINT · {twin.provider} · {twin.providerJobRef.slice(-24)} · contract{' '}
            {twin.styleContractId ?? '—'} · bg {styleReceipt?.dominantBackground ?? '—'} ·{' '}
            {twin.blueprintStyleStatus ?? '—'}
            {historicalBlueprintCount > 0 ?
              ` · HISTORICAL VARIANTS · ${historicalBlueprintCount}`
            : ''}
          </li>
        : null}
        <li data-testid="v3-r7m-package">
          STRUCTURED PACKAGE · {pkg?.status ?? (busy ? 'GENERATING' : 'NOT STARTED')}
        </li>
        <li data-testid="v3-r7m-twin-run">
          ATOMIC TWIN RUN · {atomicRun?.id?.slice(-10) ?? '—'} · {atomicRun?.status ?? '—'}{' '}
          {visualPair ? `· pair ${visualPair.status}` : ''}
        </li>
        <li data-testid="v3-r7m-desktop">DESKTOP · DEFERRED</li>
      </ul>
      {pipeline?.renders && pipeline.renders.length > 1 ?
        <div className="site00-dw-v3-mobile-twin-pipeline__render-versions">
          <span>Render versions:</span>
          {pipeline.renders.map((r) => (
            <button
              key={r.id}
              type="button"
              className={r.id === pipeline.activeRenderId ? 'is-active' : undefined}
              onClick={() => onSessionUpdate(selectMobileImplementationRender(session, r.id))}
            >
              {r.id.slice(-6)} {r.renderMode === 'REAL_PROVIDER_RENDER' ? 'FAL' : 'STUB'}
            </button>
          ))}
        </div>
      : null}
      <div className="site00-dw-v3-mobile-twin-pipeline__actions">
        {!strategyResolved ?
          <p className="site00-dw-v3-authority__hint" data-testid="v3-strategy-blocked">
            Mobile twin strategy not ready — hard refresh Design. NDXBOOK pilot should auto-lock NBP (scroll up
            for MOBILE TWIN PROVIDER · LOCKED BY FOUNDER). Or use FOUNDER OVERRIDE in the founder path panel.
          </p>
        : null}
        <button type="button" data-testid="v3-generate-mobile-twin" disabled={busy || !strategyResolved} onClick={runTwin}>
          {nbpPackageMode ? 'GENERATE MOBILE TWIN PACKAGE' : 'GENERATE MOBILE TWIN (FAL)'}
        </button>
        <button
          type="button"
          data-testid="v3-regenerate-mobile-twin"
          disabled={busy || !render}
          onClick={() => runFal('REGENERATE_MOBILE_TWIN')}
        >
          REGENERATE MOBILE TWIN
        </button>
        {render?.referenceCloneRisk === 'HIGH' ?
          <p className="site00-dw-v3-authority__hint" data-testid="v3-clone-risk-warning">
            Actual page may be reproducing the reference too literally. Review the twin pair together.
          </p>
        : null}
        {blueprintNeedsLightStyle ?
          <p className="site00-dw-v3-authority__hint" data-testid="v3-blueprint-light-style-warning" role="status">
            LIGHT STYLE REQUIRED — current Blueprint failed the light technical contract (
            {BLUEPRINT_DARK_MODE_VIOLATION}). Actual and package are intact; retry Blueprint only.
          </p>
        : null}
        {showBlueprintRetryButton ?
          <button
            type="button"
            data-testid="v3-retry-mobile-blueprint-light"
            disabled={busy || !render}
            onClick={() => runFal('RETRY_MOBILE_BLUEPRINT_LIGHT')}
          >
            RETRY LIGHT BLUEPRINT
          </button>
        : null}
        {canApproveMobileTwinPackage(session) ?
          <button type="button" data-testid="v3-approve-mobile-twin-package" onClick={runApproveTwin}>
            APPROVE MOBILE TWIN PACKAGE
          </button>
        : null}
      </div>
      <div className="site00-dw-v3-mobile-twin-pipeline__compare" role="region" aria-label="Mobile twin founder review">
        <div className="site00-dw-v3-mobile-twin-pipeline__compare-tabs">
          <button
            type="button"
            data-testid="v3-r7m-mode-ref-actual"
            className={compareMode === 'REFERENCE_ACTUAL' && viewMode === 'SIDE_BY_SIDE' ? 'is-active' : undefined}
            onClick={() => {
              setCompareMode('REFERENCE_ACTUAL');
              setViewMode('SIDE_BY_SIDE');
            }}
          >
            REFERENCE ↔ ACTUAL
          </button>
          <button
            type="button"
            data-testid="v3-r7m-mode-actual-blueprint"
            className={compareMode === 'ACTUAL_BLUEPRINT' && viewMode === 'SIDE_BY_SIDE' ? 'is-active' : undefined}
            onClick={() => {
              setCompareMode('ACTUAL_BLUEPRINT');
              setViewMode('SIDE_BY_SIDE');
            }}
          >
            ACTUAL ↔ BLUEPRINT
          </button>
          <button
            type="button"
            data-testid="v3-r7m-mode-package"
            className={compareMode === 'PACKAGE' && viewMode === 'SIDE_BY_SIDE' ? 'is-active' : undefined}
            onClick={() => {
              setCompareMode('PACKAGE');
              setViewMode('SIDE_BY_SIDE');
            }}
          >
            PACKAGE
          </button>
          <button type="button" onClick={() => setViewMode('FULLSCREEN_REFERENCE')}>
            FULLSCREEN REFERENCE
          </button>
          <button type="button" onClick={() => setViewMode('FULLSCREEN_ACTUAL')}>
            FULLSCREEN ACTUAL
          </button>
          <button type="button" onClick={() => setViewMode('FULLSCREEN_BLUEPRINT')}>
            FULLSCREEN BLUEPRINT
          </button>
        </div>
        {showPackageInspector ?
          <DesignPageV3MobileTwinPackageInspector
            session={pipeline ? { ...session, mobileTwinPipeline: pipeline } : session}
            projectId={session.projectId}
            onSessionUpdate={onSessionUpdate}
            onFullscreen={(label, src) => setPackageFullscreen({ label, src })}
          />
        : <div className="site00-dw-v3-mobile-twin-pipeline__compare-grid">
            {comparePanels.map((panel) => (
              <figure key={panel.testId} data-testid={panel.testId}>
                <figcaption>{panel.label}</figcaption>
                {panel.src ?
                  <img src={panel.src} alt={panel.label} loading="lazy" />
                : <p className="site00-dw-v3-mobile-twin-pipeline__placeholder">Not generated yet</p>}
              </figure>
            ))}
          </div>
        }
        {packageFullscreen ?
          <div
            className="site00-dw-v3-mobile-twin-package-inspector__fullscreen"
            data-testid="v3-package-visual-fullscreen"
            role="dialog"
            aria-label={packageFullscreen.label}
          >
            <button type="button" onClick={() => setPackageFullscreen(null)}>
              CLOSE
            </button>
            <p>{packageFullscreen.label}</p>
            <img src={packageFullscreen.src} alt={packageFullscreen.label} />
          </div>
        : null}
      </div>
      {err ?
        <p className="site00-dw-v3-authority__error" role="alert">
          {err}
        </p>
      : null}
      <p className="site00-dw-v3-authority__hint">
        {P0_VR_TWIN_V30R7M_LINEAGE} + {P0_VR_TWIN_V30R7MF3_LINEAGE} atomic Actual+Blueprint siblings.{' '}
        {P0_VR_TWIN_V30R7MF2_LINEAGE} anti-clone on Actual. R6F2:{' '}
        {pipeline?.r6f2ForensicRole ?? 'SUPERSEDED_BY_COMPOSITION_STATE_TWIN_PIPELINE'}.
        FAL jobs: {falJobCount} · est. ${providerCost.toFixed(2)}
      </p>
      {atomicRun ?
        <details className="site00-dw-v3-mobile-twin-pipeline__technical" data-testid="v3-mobile-twin-provider-details">
          <summary>Technical · provider jobs</summary>
          <ul>
            <li>
              ACTUAL · {atomicRun.actualModel ?? render?.providerModel ?? '—'} ·{' '}
              {atomicRun.actualRenderJobId ?? '—'} · {atomicRun.actualStatus ?? '—'}
            </li>
            <li>
              BLUEPRINT · {atomicRun.blueprintModel ?? twin?.styleContractId ?? '—'} ·{' '}
              {atomicRun.blueprintRenderJobId ?? '—'} · {atomicRun.blueprintStatus ?? '—'} · LIGHT TECHNICAL
            </li>
          </ul>
        </details>
      : null}
    </section>
  );
}
