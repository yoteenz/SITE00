import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import {
  P0_VR_TWIN_V30R7MF3P4_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { getMobileTwinVisualProviderStrategy } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/getMobileTwinVisualProviderStrategy.js';
import { canRunFullMobileTwinPackage } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/mobileTwinVisualStrategy.js';
import { requestMobileTwinFal } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinFal.js';
import { unlockMobileTwinProviderStrategy } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import { useState } from 'react';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

export function DesignPageV3MobileTwinLockedProviderPanel({ session, onSessionUpdate }: Props) {
  const pipeline = session.mobileTwinPipeline;
  const route = pipeline ? getMobileTwinVisualProviderStrategy(pipeline) : null;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!session.authorityPipeline?.mobileMaster || !route?.locked) return null;

  const methodA = pipeline?.mobileTwinVisualGenerationStrategy === 'ATOMIC_SIBLING_FROM_COMPOSITION';
  const packageReady = canRunFullMobileTwinPackage(pipeline?.mobileTwinVisualGenerationStrategy, pipeline);

  const runTwin = () => {
    setBusy(true);
    setErr(null);
    void requestMobileTwinFal({ session, action: 'GENERATE_MOBILE_TWIN', founderConfirmedSpend: true })
      .then(onSessionUpdate)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const unlock = () => {
    setErr(null);
    onSessionUpdate(unlockMobileTwinProviderStrategy(session));
  };

  return (
    <section
      className="site00-dw-v3-mobile-twin-locked-provider"
      data-testid="v3-mobile-twin-locked-provider"
      data-lineage={P0_VR_TWIN_V30R7MF3P4_LINEAGE}
    >
      <header>
        <strong>MOBILE TWIN PROVIDER</strong>
        <span>NANO BANANA PRO · LOCKED BY FOUNDER · build {P0_VR_TWIN_V30_BUILD}</span>
      </header>
      <ul className="site00-dw-v3-mobile-twin-locked-provider__grid">
        <li data-testid="v3-locked-actual">
          ACTUAL · NBP · <code>{route.actual.model}</code>
        </li>
        <li data-testid="v3-locked-blueprint">
          BLUEPRINT · NBP · LIGHT TECHNICAL · <code>{route.blueprint.model}</code>
        </li>
        <li data-testid="v3-locked-method">
          METHOD · ATOMIC SIBLING · {methodA ? 'LOCKED' : '—'}
        </li>
        <li data-testid="v3-locked-strategy">STRATEGY · NBP_FULL_PAIR</li>
      </ul>
      <div className="site00-dw-v3-mobile-twin-locked-provider__actions">
        <button
          type="button"
          data-testid="v3-primary-generate-mobile-twin-package"
          disabled={busy || !packageReady}
          onClick={runTwin}
        >
          GENERATE MOBILE TWIN PACKAGE
        </button>
        <details className="site00-dw-v3-mobile-twin-locked-provider__advanced">
          <summary>Technical · provider strategy</summary>
          <button type="button" data-testid="v3-unlock-mobile-provider-strategy" disabled={busy} onClick={unlock}>
            UNLOCK MOBILE PROVIDER STRATEGY
          </button>
          <p className="site00-dw-v3-authority__hint">
            Unlock only to re-run provider benchmarks. Normal generation uses NBP only (fail closed — no GPT2/FLUX
            fallback).
          </p>
        </details>
      </div>
      {err ?
        <p className="site00-dw-v3-authority__error" role="alert">
          {err}
        </p>
      : null}
    </section>
  );
}
