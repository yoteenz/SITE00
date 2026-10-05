import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { P0_VR_TWIN_V30R7MF3P4_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { evaluateMobileTwinFounderActionsStrip } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateMobileTwinFounderActionsStrip.js';
import { normalizeFounderNbpPromotionOnLoad } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import {
  restoreFounderMobileTwinPipelineFromBrowser,
  syncFounderMobileTwinSession,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';
import { requestMobileTwinFal } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/requestMobileTwinFal.js';
import { runFounderMobileTwinPackageEscalation } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runFounderMobileTwinPackageEscalation.js';
import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { DesignPageV3MobileTwinBuildRouteBlock } from './DesignPageV3MobileTwinBuildRouteBlock.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  projectId: string;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

/** Sticky mobile-first strip — GENERATE / RESTORE / BUILD always visible on NDXBOOK (not buried in PACKAGE tab). */
export function DesignPageV3MobileTwinFounderActionsStrip({ session, projectId, onSessionUpdate }: Props) {
  const view = useMemo(() => evaluateMobileTwinFounderActionsStrip(session, projectId), [session, projectId]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (!view.showStrip) return null;

  const runGenerate = () => {
    if (busy || !view.canGenerate) return;
    setBusy(true);
    setErr(null);
    setMsg('Calling api.site00.com — mobile twin package ~60–90s. Keep this tab open (iOS may reload if you switch apps).');
    let working = normalizeFounderNbpPromotionOnLoad(syncFounderMobileTwinSession(session, projectId));
    onSessionUpdate(working);
    void requestMobileTwinFal({ session: working, action: 'GENERATE_MOBILE_TWIN', founderConfirmedSpend: true })
      .then((next) => {
        onSessionUpdate(next);
        const pkg = next.mobileTwinPipeline?.packages.at(-1);
        const jobs = next.mobileTwinPipeline?.falJobsDispatched ?? 0;
        setMsg(
          pkg ?
            `Package run finished · status ${pkg.status} · FAL jobs ${jobs}. Open PACKAGE sections below to review.`
          : `FAL jobs ${jobs} — check MOBILE TWIN REVIEW steps for ACTUAL + BLUEPRINT.`,
        );
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const enableNbp = () => {
    setErr(null);
    try {
      const next = normalizeFounderNbpPromotionOnLoad(syncFounderMobileTwinSession(session, projectId));
      onSessionUpdate(next);
      setMsg('NBP provider lock restored — tap GENERATE MOBILE TWIN PACKAGE.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const restore = () => {
    setMsg(null);
    setErr(null);
    const next = restoreFounderMobileTwinPipelineFromBrowser(session, projectId);
    onSessionUpdate(next);
    setMsg('Restored from browser backup — check PACKAGE tab or BUILD below.');
  };

  const runEscalation = () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    setMsg('Building founder package from your canonical blueprint JPG and compiling twin route…');
    const working = normalizeFounderNbpPromotionOnLoad(syncFounderMobileTwinSession(session, projectId));
    void runFounderMobileTwinPackageEscalation({ session: working })
      .then(({ session: next, message }) => {
        onSessionUpdate(next);
        setMsg(message);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const showEscalation = projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID;

  return (
    <section
      className="site00-dw-v3-mobile-twin-founder-actions"
      data-testid="v3-mobile-twin-founder-actions-strip"
      data-lineage={P0_VR_TWIN_V30R7MF3P4_LINEAGE}
      aria-label="Mobile twin founder actions"
    >
      <header className="site00-dw-v3-mobile-twin-founder-actions__head">
        <strong>MOBILE TWIN · FOUNDER ACTIONS</strong>
        <span>
          FAL {view.falJobs} · packages {view.packageCount} · NBP {view.providerLocked ? 'LOCKED' : 'NOT LOCKED'}
        </span>
      </header>

      {showEscalation ?
        <>
          <p className="site00-dw-v3-authority__hint" data-testid="v3-founder-escalation-copy">
            Escalation: approve a package built from your bundled light blueprint JPG, then rebuild the twin route on
            this device (no FAL).
          </p>
          <button
            type="button"
            className="site00-dw-v3-mobile-twin-founder-actions__primary"
            data-testid="v3-founder-escalate-package-rebuild-twin"
            disabled={busy}
            onClick={runEscalation}
          >
            USE FOUNDER BLUEPRINT · BUILD PACKAGE · REBUILD TWIN
          </button>
        </>
      : null}

      {view.showRestore ?
        <>
          <p className="site00-dw-v3-authority__hint" data-testid="v3-founder-actions-restore-copy">
            Richer mobile-twin data found in browser storage — restore before paying for a new FAL package.
          </p>
          <button
            type="button"
            className="site00-dw-v3-mobile-twin-founder-actions__restore"
            data-testid="v3-restore-mobile-twin-pipeline-founder-strip"
            disabled={busy}
            onClick={restore}
          >
            RESTORE MOBILE TWIN FROM BROWSER BACKUP
          </button>
        </>
      : null}

      {view.showEmptyBackupMessage ?
        <p className="site00-dw-v3-authority__hint" data-testid="v3-founder-actions-no-backup">
          No mobile-twin backup on this browser (FAL jobs 0). You must generate a new package below — approval and BUILD
          appear after generation completes.
        </p>
      : null}

      {view.showGenerate ?
        <>
          <button
            type="button"
            className="site00-dw-v3-mobile-twin-founder-actions__primary"
            data-testid="v3-founder-strip-generate-mobile-twin-package"
            disabled={busy || !view.canGenerate}
            onClick={runGenerate}
          >
            {busy ? 'GENERATING MOBILE TWIN PACKAGE…' : 'GENERATE MOBILE TWIN PACKAGE'}
          </button>
          {busy ?
            <p className="site00-dw-v3-authority__hint" role="status" data-testid="v3-founder-generate-in-progress">
              Railway FAL in progress — wait for success or error in this purple box.
            </p>
          : null}
          {!view.canGenerate && view.generateBlockedHint ?
            <>
              <p className="site00-dw-v3-authority__hint">{view.generateBlockedHint}</p>
              {!view.providerLocked ?
                <button
                  type="button"
                  className="site00-dw-v3-mobile-twin-founder-actions__secondary"
                  data-testid="v3-founder-strip-enable-nbp"
                  disabled={busy}
                  onClick={enableNbp}
                >
                  ENABLE NBP GENERATE
                </button>
              : null}
            </>
          : null}
        </>
      : null}

      {view.showBuild ?
        <DesignPageV3MobileTwinBuildRouteBlock session={session} embedded buildTestId="v3-build-twin-design-route-founder-strip" />
      : null}

      {msg ?
        <p className="site00-dw-v3-authority__hint" role="status">
          {msg}
        </p>
      : null}
      {err ?
        <p className="site00-dw-v3-authority__error" role="alert">
          {err}
        </p>
      : null}
    </section>
  );
}
