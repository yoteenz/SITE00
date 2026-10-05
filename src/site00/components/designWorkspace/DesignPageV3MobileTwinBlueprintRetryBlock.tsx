import { useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { BLUEPRINT_DARK_MODE_VIOLATION } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/blueprintVisualStyleContract.js';
import type { BlueprintLightStyleRetryView } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateBlueprintLightStyleRetry.js';
import { P0_VR_TWIN_V30R7MF3P6F1_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { requestMobileTwinFal } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinFal.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  view: BlueprintLightStyleRetryView;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
  /** When embedded in locked provider panel (no outer section wrapper). */
  embedded?: boolean;
};

export function DesignPageV3MobileTwinBlueprintRetryBlock({
  session,
  view,
  onSessionUpdate,
  embedded,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const runRetry = () => {
    setBusy(true);
    setErr(null);
    void requestMobileTwinFal({ session, action: 'RETRY_MOBILE_BLUEPRINT_LIGHT', founderConfirmedSpend: true })
      .then(onSessionUpdate)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const inner = (
    <>
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
            If the Blueprint twin looks dark (navy/black sheet), tap retry below. Regenerates Blueprint only — Actual
            page unchanged (1 NBP charge).
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
          Optional: add a light benchmark PNG URL as <code>VITE_SITE00_LIGHT_BLUEPRINT_STYLE_REFERENCE_URL</code>{' '}
          (build) or <code>SITE00_LIGHT_BLUEPRINT_STYLE_REFERENCE_URL</code> (Railway) for palette/linework anchor
          only.
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
    </>
  );

  if (embedded) {
    return (
      <div className="site00-dw-v3-mobile-twin-blueprint-retry site00-dw-v3-mobile-twin-blueprint-retry--embedded">
        {inner}
      </div>
    );
  }

  return (
    <section
      className="site00-dw-v3-mobile-twin-blueprint-retry"
      data-testid="v3-mobile-twin-blueprint-retry-strip"
      data-lineage={P0_VR_TWIN_V30R7MF3P6F1_LINEAGE}
      aria-label="Blueprint light style retry"
    >
      {inner}
    </section>
  );
}
