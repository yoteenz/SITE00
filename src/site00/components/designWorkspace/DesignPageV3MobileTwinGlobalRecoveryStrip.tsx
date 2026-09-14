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
import {
  restoreFounderMobileTwinPipelineFromBrowser,
  syncFounderMobileTwinSession,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';
import { P0_VR_TWIN_V30R7MF3_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';
import { notifyDesignAuthoritySessionChanged } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designAuthoritySessionEvents.js';
import '../../styles/site00-twin-v3-design-authority.css';

type Props = {
  projectId: string;
};

/** Sticky top-of-Design restore CTA — visible before Batch 2 / buried authority sections. */
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
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pilot, reload]);

  const view = useMemo(() => evaluateMobileTwinRestoreOffer(session, projectId), [session, projectId]);
  const [msg, setMsg] = useState<string | null>(null);

  if (!pilot || !view.show) return null;

  const persist = (next: DesignPageAuthorityReviewSession) => {
    const normalized = normalizeDesignPageAuthoritySession(next);
    setSession(normalized);
    writeDesignPageAuthoritySession(normalized);
    notifyDesignAuthoritySessionChanged(projectId);
  };

  const restore = () => {
    setMsg(null);
    const next = restoreFounderMobileTwinPipelineFromBrowser(session, projectId);
    persist(next);
    setMsg('Mobile twin restored from browser backup — scroll to MOBILE TWIN REVIEW or refresh once if images lag.');
  };

  return (
    <section
      className="site00-dw-v3-mobile-twin-pipeline-recovery site00-dw-v3-mobile-twin-global-recovery"
      data-testid="v3-mobile-twin-global-recovery-strip"
      data-lineage={P0_VR_TWIN_V30R7MF3_LINEAGE}
      aria-label="Restore mobile twin pipeline"
    >
      <header className="site00-dw-v3-mobile-twin-pipeline-recovery__head">
        <strong>MOBILE TWIN · BROWSER BACKUP FOUND</strong>
        <span>TOP OF DESIGN — RESTORE BEFORE REGENERATING</span>
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
        onClick={restore}
      >
        RESTORE MOBILE TWIN FROM BROWSER BACKUP
      </button>
      {msg ?
        <p className="site00-dw-v3-authority__hint" role="status">
          {msg}
        </p>
      : null}
    </section>
  );
}
