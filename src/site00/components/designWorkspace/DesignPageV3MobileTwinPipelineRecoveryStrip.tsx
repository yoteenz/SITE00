import { useMemo, useState } from 'react';
import type { DesignPageAuthorityReviewSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/types.js';
import { evaluateMobileTwinRestoreOffer } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/evaluateMobileTwinRestoreOffer.js';
import { restoreFounderMobileTwinPipelineFromBrowser } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/syncFounderMobileTwinSession.js';
import { P0_VR_TWIN_V30R7MF3_LINEAGE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/constants.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  projectId: string;
  onSessionUpdate: (session: DesignPageAuthorityReviewSession) => void;
};

/** When in-memory Design session lost mobile twin data but dedicated LS backup is richer. */
export function DesignPageV3MobileTwinPipelineRecoveryStrip({ session, projectId, onSessionUpdate }: Props) {
  const view = useMemo(() => evaluateMobileTwinRestoreOffer(session, projectId), [session, projectId]);
  const [msg, setMsg] = useState<string | null>(null);

  if (!view.show) return null;

  const restore = () => {
    setMsg(null);
    const next = restoreFounderMobileTwinPipelineFromBrowser(session, projectId);
    onSessionUpdate(next);
    setMsg('Mobile twin pipeline restored from browser backup — scroll to MOBILE TWIN REVIEW or PACKAGE tab.');
  };

  return (
    <section
      className="site00-dw-v3-mobile-twin-pipeline-recovery"
      data-testid="v3-mobile-twin-pipeline-recovery-strip"
      data-lineage={P0_VR_TWIN_V30R7MF3_LINEAGE}
      aria-label="Restore mobile twin pipeline"
    >
      <header className="site00-dw-v3-mobile-twin-pipeline-recovery__head">
        <strong>MOBILE TWIN · BROWSER BACKUP FOUND</strong>
        <span>SESSION LOOKS EMPTY — DATA MAY STILL BE ON THIS DEVICE</span>
      </header>
      <p className="site00-dw-v3-authority__hint" data-testid="v3-mobile-twin-recovery-copy">
        {view.showAuthorityImageRecovery ?
          'Actual / Blueprint images are missing in this tab but URIs may still be in browser backup or authority snapshot. Tap restore before paying for another NBP run.'
        : <>This tab shows FAL jobs {view.sessionFalJobs} / packages {view.sessionPackageCount}, but dedicated mobile-twin
            storage has FAL jobs {view.storedFalJobs} / packages {view.storedPackageCount}. Tap restore before regenerating
            (avoids duplicate NBP charges).</>
        }
      </p>
      <button
        type="button"
        className="site00-dw-v3-mobile-twin-pipeline-recovery__primary"
        data-testid="v3-restore-mobile-twin-pipeline"
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
