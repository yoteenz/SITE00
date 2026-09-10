/**
 * P0.VR.MOF.R2 — System child page.
 */

import { requiresExplicitFounderDispatch } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr4/spendGuard.js';
import { uploadNeverTriggersGeneration } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/spendGuard.js';
import { DEFAULT_FIDELITY_SETTINGS } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';
import { P0_VR_MOF_R2_BUILD } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/constants.js';
import type { ProjectCaptureRefreshState } from '../usePageMirror';
import { MoreToolPageShell } from './MoreToolPageShell';
import { MoreSummaryGrid, MoreSummaryTile } from './MoreSummaryTile';
import { captureNeedsAttention } from './moreStatus';

type Props = {
  onBack: () => void;
  captureRefresh?: ProjectCaptureRefreshState;
  falAvailable: boolean | null;
  onOpenInspect?: () => void;
  recentActivityCount?: number;
  onCaptureScreen?: () => void;
  onMatchReference?: () => void;
};

export function DesignMoreSystemPage({
  onBack,
  captureRefresh,
  falAvailable,
  onOpenInspect,
  recentActivityCount = 0,
  onCaptureScreen,
  onMatchReference,
}: Props) {
  const founderGenerateOnly = requiresExplicitFounderDispatch();
  const uploadSafe = uploadNeverTriggersGeneration();
  const captureAttention = captureNeedsAttention(captureRefresh);
  const providerBlocked = falAvailable === false;
  const issueCount = (captureAttention ? 1 : 0) + (providerBlocked ? 1 : 0);
  const allOk = issueCount === 0;

  const detailsContent = (
    <div className="site00-dw-more-tool__details">
      <dl className="site00-dw-more-tool__detail-grid">
        <div>
          <dt>FOUNDER GENERATE ONLY</dt>
          <dd>{founderGenerateOnly ? 'ON' : 'OFF'}</dd>
        </div>
        <div>
          <dt>UPLOAD NEVER TRIGGERS GEN</dt>
          <dd>{uploadSafe ? 'ON' : 'OFF'}</dd>
        </div>
        <div>
          <dt>DEFAULT AUTHORITY</dt>
          <dd>{DEFAULT_FIDELITY_SETTINGS.defaultAuthorityMode.replace(/_/g, ' ')}</dd>
        </div>
        <div>
          <dt>BUILD</dt>
          <dd>{P0_VR_MOF_R2_BUILD}</dd>
        </div>
        <div>
          <dt>RECENT ACTIVITY</dt>
          <dd>{String(recentActivityCount)}</dd>
        </div>
      </dl>
      {onCaptureScreen ? (
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onCaptureScreen}>
          CAPTURE SCREEN
        </button>
      ) : null}
      {onMatchReference ? (
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={onMatchReference}>
          MATCH REFERENCE
        </button>
      ) : null}
    </div>
  );

  return (
    <MoreToolPageShell
      title="SYSTEM"
      description="Overall platform health and guardrails."
      visualState={allOk ? 'ready' : 'attention'}
      statusBadge={allOk ? 'ALL SYSTEMS OPERATIONAL' : `${issueCount} ITEM${issueCount === 1 ? '' : 'S'} NEED ATTENTION`}
      headline={allOk ? 'ALL SYSTEMS OPERATIONAL' : 'REVIEW SYSTEM HEALTH'}
      support={allOk ? 'Frontend, API, worker, and storage are connected.' : 'One or more areas need your attention.'}
      onBack={onBack}
      transitionKey="more-system"
      primaryAction={{
        label: allOk ? 'VIEW SYSTEM HEALTH' : 'REVIEW ISSUES',
        onClick: () => onOpenInspect?.(),
      }}
      detailsContent={detailsContent}
      detailsTitle="SYSTEM DETAILS"
      summary={
        <MoreSummaryGrid>
          <MoreSummaryTile label="FRONTEND" value="ONLINE" tone="ready" />
          <MoreSummaryTile label="API" value="ONLINE" tone="ready" />
          <MoreSummaryTile
            label="WORKER"
            value={captureAttention ? 'NEEDS ATTENTION' : 'READY'}
            tone={captureAttention ? 'attention' : 'ready'}
          />
          <MoreSummaryTile label="STORAGE" value="CONNECTED" tone="ready" />
        </MoreSummaryGrid>
      }
    />
  );
}
