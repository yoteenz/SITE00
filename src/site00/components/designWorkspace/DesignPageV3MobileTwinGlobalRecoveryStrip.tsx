import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createDesignPageAuthorityReviewSession,
  DESIGN_PAGE_V3_PILOT_PROJECT_ID,
  normalizeDesignPageAuthoritySession,
  readDesignPageAuthoritySession,
  writeDesignPageAuthoritySession,
  type DesignPageAuthorityReviewSession,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { evaluateMobileTwinRestoreOffer } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateMobileTwinRestoreOffer.js';
import { normalizeFounderNbpPromotionOnLoad } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/applyFounderNbpMobileTwinPromotion.js';
import {
  restoreFounderMobileTwinPipelineFromBrowser,
  syncFounderMobileTwinSession,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';
import { runFounderMobileTwinPackageEscalation } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/runFounderMobileTwinPackageEscalation.js';
import {
  DESIGN_AUTHORITY_SESSION_CHANGED,
  notifyDesignAuthoritySessionChanged,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designAuthoritySessionEvents.js';
import { P0_VR_TWIN_V30R7MF3_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { readTwinImplementationCache } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/twinImplementationBrowserCache.js';
import { SITE00_ROUTES } from '../../config/routes.js';
import { Link } from 'react-router-dom';
import '../../styles/site00-twin-v3-design-authority.css';

type Props = {
  projectId: string;
};

/** Sticky top-of-Design — founder escalation + optional browser backup restore (NDXBOOK). */
export function DesignPageV3MobileTwinGlobalRecoveryStrip({ projectId }: Props) {
  const pilot = projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID;
  const [session, setSession] = useState<DesignPageAuthorityReviewSession>(() =>
    createDesignPageAuthorityReviewSession({ projectId }),
  );

  const reload = useCallback(() => {
    if (!pilot) return;
    const stored =
      readDesignPageAuthoritySession(projectId) ?? createDesignPageAuthorityReviewSession({ projectId });
    const normalized = normalizeDesignPageAuthoritySession(stored);
    setSession(syncFounderMobileTwinSession(normalized, projectId));
  }, [pilot, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!pilot || typeof window === 'undefined') return;
    const onStorage = (ev: StorageEvent) => {
      if (!ev.key || ev.key.includes('design-page-authority') || ev.key.includes('mobile-twin')) reload();
    };
    const onSessionChanged = (ev: Event) => {
      const detail = (ev as CustomEvent<{ projectId?: string }>).detail;
      if (detail?.projectId === projectId.toLowerCase()) reload();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(DESIGN_AUTHORITY_SESSION_CHANGED, onSessionChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(DESIGN_AUTHORITY_SESSION_CHANGED, onSessionChanged);
    };
  }, [pilot, projectId, reload]);

  const view = useMemo(() => evaluateMobileTwinRestoreOffer(session, projectId), [session, projectId]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!pilot) return null;

  const persist = (next: DesignPageAuthorityReviewSession) => {
    const normalized = normalizeDesignPageAuthoritySession(next);
    setSession(normalized);
    writeDesignPageAuthoritySession(normalized);
    notifyDesignAuthoritySessionChanged(projectId);
  };

  const restore = () => {
    setMsg(null);
    setErr(null);
    const next = restoreFounderMobileTwinPipelineFromBrowser(session, projectId);
    persist(next);
    setMsg('Mobile twin restored from browser backup — scroll to MOBILE TWIN REVIEW or refresh once if images lag.');
  };

  const runEscalation = () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    setMsg('Building package from your bundled light blueprint JPG and compiling twin route…');
    const working = normalizeFounderNbpPromotionOnLoad(syncFounderMobileTwinSession(session, projectId));
    void runFounderMobileTwinPackageEscalation({ session: working })
      .then(({ session: next, message }) => {
        persist(next);
        setMsg(message);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setBusy(false));
  };

  const twinRoute = SITE00_ROUTES.projectDesignTwin.replace(':projectSlug', projectId.toLowerCase());
  const hasTwinCache = Boolean(readTwinImplementationCache(projectId.toLowerCase()));

  return (
    <>
      <section
        className="site00-dw-v3-mobile-twin-founder-actions site00-dw-v3-mobile-twin-global-escalation"
        data-testid="v3-mobile-twin-global-founder-escalation-strip"
        data-lineage={P0_VR_TWIN_V30R7MF3_LINEAGE}
        aria-label="Founder mobile twin escalation"
      >
        <header className="site00-dw-v3-mobile-twin-founder-actions__head">
          <strong>MOBILE TWIN · USE YOUR BLUEPRINT</strong>
          <span>TOP OF DESIGN — NO FAL</span>
        </header>
        <p className="site00-dw-v3-authority__hint" data-testid="v3-founder-escalation-global-copy">
          Builds an approved package from your bundled light technical blueprint JPG, then compiles the twin preview on
          this device. Use when compare slots still show the wrong (dark) blueprint.
        </p>
        <button
          type="button"
          className="site00-dw-v3-mobile-twin-founder-actions__primary"
          data-testid="v3-founder-escalate-package-rebuild-twin-global"
          disabled={busy}
          onClick={runEscalation}
        >
          USE FOUNDER BLUEPRINT · BUILD PACKAGE · REBUILD TWIN
        </button>
        {hasTwinCache ?
          <p className="site00-dw-v3-mobile-twin-build-route__links">
            <Link to={twinRoute} data-testid="v3-founder-escalation-open-twin-route-global">
              OPEN TWIN IMPLEMENTATION REVIEW
            </Link>
          </p>
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

      {view.show ?
        <section
          className="site00-dw-v3-mobile-twin-pipeline-recovery site00-dw-v3-mobile-twin-global-recovery"
          data-testid="v3-mobile-twin-global-recovery-strip"
          data-lineage={P0_VR_TWIN_V30R7MF3_LINEAGE}
          aria-label="Restore mobile twin pipeline"
        >
          <header className="site00-dw-v3-mobile-twin-pipeline-recovery__head">
            <strong>MOBILE TWIN · BROWSER BACKUP FOUND</strong>
            <span>RESTORE BEFORE REGENERATING</span>
          </header>
          <p className="site00-dw-v3-authority__hint">
            {view.showAuthorityImageRecovery ?
              'Actual / Blueprint images are missing in this tab but data may still be on this device. Tap restore, then hard refresh once.'
            : <>Session FAL {view.sessionFalJobs} / packages {view.sessionPackageCount} · browser storage FAL{' '}
                {view.storedFalJobs} / packages {view.storedPackageCount}. Tap restore to merge richer browser data.</>
            }
          </p>
          <button
            type="button"
            className="site00-dw-v3-mobile-twin-pipeline-recovery__primary"
            data-testid="v3-restore-mobile-twin-pipeline-global"
            disabled={busy}
            onClick={restore}
          >
            RESTORE MOBILE TWIN FROM BROWSER BACKUP
          </button>
        </section>
      : null}
    </>
  );
}
