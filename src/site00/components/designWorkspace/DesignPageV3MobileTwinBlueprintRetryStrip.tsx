import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { P0_VR_TWIN_V30R7MF3P6F1_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { BLUEPRINT_DARK_MODE_VIOLATION } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/blueprintVisualStyleContract.js';
import { evaluateBlueprintLightStyleRetry } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateBlueprintLightStyleRetry.js';
import { ensureMobileTwinPipelineDefaults } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinPipelinePersistence.js';
import { resolveMobileTwinReviewSlots } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/hydrateMobileTwinReviewState.js';
import { requestMobileTwinFal } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinFal.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

/** Mobile-first strip — RETRY LIGHT BLUEPRINT visible after first twin pair (not buried in pipeline panel). */
export function DesignPageV3MobileTwinBlueprintRetryStrip({ session, onSessionUpdate }: Props) {
  const pipeline = session.mobileTwinPipeline ? ensureMobileTwinPipelineDefaults(session.mobileTwinPipeline) : undefined;
  const slots = pipeline ? resolveMobileTwinReviewSlots(pipeline) : null;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const view = useMemo(() => {
    if (!pipeline) return null;
    try {
      return evaluateBlueprintLightStyleRetry({
        actualRender: slots?.actualRender ?? null,
        blueprintTwin: slots?.blueprintTwin ?? null,
        artifactsById: pipeline.artifactsById,
        publicOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
      });
    } catch (err) {
      console.error('site00: blueprint retry strip evaluation failed', err);
      return null;
    }
  }, [pipeline, slots?.actualRender, slots?.blueprintTwin]);

  if (!view?.showRetryStrip) return null;

  const runRetry = () => {
    setBusy(true);
    setErr(null);
    void requestMobileTwinFal({ session, action: 'RETRY_MOBILE_BLUEPRINT_LIGHT', founderConfirmedSpend: true })
      .then(onSessionUpdate)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  return (
    <section
      className="site00-dw-v3-mobile-twin-blueprint-retry"
      data-testid="v3-mobile-twin-blueprint-retry-strip"
      data-lineage={P0_VR_TWIN_V30R7MF3P6F1_LINEAGE}
      aria-label="Blueprint light style retry"
    >
      <header className="site00-dw-v3-mobile-twin-blueprint-retry__head">
        <strong>BLUEPRINT · LIGHT TECHNICAL</strong>
        <span>{view.urgentLightStyleRequired ? 'LIGHT STYLE REQUIRED' : 'FOUNDER RETRY AVAILABLE'}</span>
      </header>
      <p className="site00-dw-v3-authority__hint" data-testid="v3-blueprint-retry-strip-copy">
        {view.urgentLightStyleRequired ?
          <>
            Current Blueprint failed the light contract ({BLUEPRINT_DARK_MODE_VIOLATION}). Actual page and structured
            package stay intact — one Blueprint NBP charge only.
          </>
        : <>
            If the Blueprint twin looks <strong>dark</strong> (navy/black sheet), tap retry below. Regenerates{' '}
            <strong>Blueprint only</strong> — Actual page unchanged (1 NBP charge).
          </>
        }
      </p>
      <ul className="site00-dw-v3-mobile-twin-blueprint-retry__meta">
        <li data-testid="v3-blueprint-retry-bg">Background class · {view.dominantBackground}</li>
        <li data-testid="v3-blueprint-retry-receipt">Style receipt · {view.styleReceiptResult}</li>
        <li data-testid="v3-blueprint-retry-style-anchor">
          Light style anchor · {view.styleAnchorConfigured ? 'CONFIGURED' : 'NOT SET (optional Cloud Secret)'}
        </li>
      </ul>
      {!view.styleAnchorConfigured ?
        <p className="site00-dw-v3-authority__hint" data-testid="v3-blueprint-style-anchor-hint">
          Optional: add a light benchmark PNG URL as{' '}
          <code>VITE_SITE00_LIGHT_BLUEPRINT_STYLE_REFERENCE_URL</code> (build) or{' '}
          <code>SITE00_LIGHT_BLUEPRINT_STYLE_REFERENCE_URL</code> (Railway) for palette/linework anchor only.
        </p>
      : null}
      <button
        type="button"
        className="site00-dw-v3-mobile-twin-blueprint-retry__primary"
        data-testid="v3-retry-mobile-blueprint-light-strip"
        disabled={busy || !view.canRetryLightBlueprint}
        onClick={runRetry}
      >
        RETRY LIGHT BLUEPRINT
      </button>
      {err ?
        <p className="site00-dw-v3-authority__error" role="alert">
          {err}
        </p>
      : null}
    </section>
  );
}
