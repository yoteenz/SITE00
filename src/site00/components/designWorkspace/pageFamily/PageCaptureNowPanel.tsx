/**
 * P0.VR.CAPTURE.1 — Page-scoped CAPTURE NOW panel (primary PAGES workflow).
 */

import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import {
  CAPTURE_NOW_PROGRESS_STEPS,
  derivePageViewportCaptureStatus,
  getPageViewportCapture,
  resolvePageUpgradeNextAction,
  type PageViewportCaptureStatus,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import type { CaptureServiceInput } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.js';
import { canRunLiveCapture } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.js';
import {
  authorityStatusLabel,
  resolvePageViewportAuthority,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageViewportAuthority.js';

type Props = {
  projectId: string;
  pageId: string;
  screenId: string;
  route: string;
  displayName: string;
  viewport: DesignViewportClass;
  isRoot?: boolean;
  routeMapped?: boolean;
  captureService?: CaptureServiceInput;
  capturing?: boolean;
  captureProgress?: string | null;
  screenshotUrl?: string | null;
  captureError?: string | null;
  onCaptureNow: () => void;
  onUpgradePage?: () => void;
  onViewDetails?: () => void;
};

function statusLabel(status: PageViewportCaptureStatus): string {
  const labels: Record<PageViewportCaptureStatus, string> = {
    NO_LIVE_CAPTURE: 'NO LIVE CAPTURE',
    CAPTURE_READY: 'CAPTURE READY ✓',
    CAPTURING: 'CAPTURING',
    CAPTURE_FAILED: 'CAPTURE FAILED',
    CAPTURE_OUTDATED: 'CAPTURE MAY BE OUTDATED',
  };
  return labels[status];
}

export function PageCaptureNowPanel({
  projectId,
  pageId,
  screenId,
  route,
  displayName,
  viewport,
  isRoot,
  routeMapped,
  captureService,
  capturing,
  captureProgress,
  screenshotUrl,
  captureError,
  onCaptureNow,
  onUpgradePage,
  onViewDetails,
}: Props) {
  const stored = getPageViewportCapture(projectId, pageId, viewport);
  const status = capturing
    ? 'CAPTURING'
    : derivePageViewportCaptureStatus(stored);
  const captureAvailable = captureService ? canRunLiveCapture(captureService) : true;
  const authority = resolvePageViewportAuthority({
    projectId,
    pageId,
    screenId,
    viewport,
    routeMapped,
    isRoot,
  });
  const nextAction = resolvePageUpgradeNextAction({
    projectId,
    pageId,
    screenId,
    viewport,
    captureServiceAvailable: captureAvailable,
    isRoot,
    routeMapped,
  });
  const livePreview = screenshotUrl ?? stored?.imageRef ?? null;
  const authorityApproved = authority.authorityStatus === 'APPROVED' || authority.authorityStatus === 'STALE';
  const showUpgrade = status === 'CAPTURE_READY' && onUpgradePage && authorityApproved;

  return (
    <section className="site00-pfw-capture-now" aria-label="Capture now">
      <header className="site00-pfw-capture-now__head">
        <div>
          <p className="site00-pfw-capture-now__kicker">CURRENT PAGE</p>
          <h3>{displayName.toUpperCase()}</h3>
          <p className="site00-pfw-capture-now__route">{route}</p>
        </div>
        <div className="site00-pfw-capture-now__viewport">
          <span>{viewport.toUpperCase()}</span>
        </div>
      </header>

      <p className={`site00-pfw-capture-now__authority is-${authority.authorityStatus.toLowerCase()}`}>
        DESIGN AUTHORITY: {authorityStatusLabel(authority.authorityStatus)}
      </p>

      <div className="site00-pfw-capture-now__preview site00-pfw-capture-now__preview--authority">
        <p className="site00-pfw-capture-now__preview-label">DESIGN AUTHORITY</p>
        {authority.previewUrl ? (
          <img src={authority.previewUrl} alt={`Design authority ${displayName}`} />
        ) : (
          <div className="site00-pfw-capture-now__preview-empty">
            <span aria-hidden>▢</span>
            <small>{authority.authorityStatus === 'MAPPED' ? 'MAPPED — NOT APPROVED' : 'NO REFERENCE YET'}</small>
          </div>
        )}
      </div>

      <p className={`site00-pfw-capture-now__status is-${status.toLowerCase().replace(/_/g, '-')}`}>
        LIVE PAGE: {statusLabel(status)}
      </p>

      <div className="site00-pfw-capture-now__preview site00-pfw-capture-now__preview--live">
        <p className="site00-pfw-capture-now__preview-label">LIVE PAGE</p>
        {livePreview ? (
          <img src={livePreview} alt={`Live capture ${displayName}`} />
        ) : (
          <div className="site00-pfw-capture-now__preview-empty">
            <span aria-hidden>▢</span>
            <small>{captureAvailable ? 'NO LIVE CAPTURE YET' : 'CAPTURE UNAVAILABLE'}</small>
          </div>
        )}
      </div>

      {capturing ? (
        <div className="site00-pfw-capture-now__progress" role="status">
          <strong>CAPTURING THIS PAGE</strong>
          <ol>
            {CAPTURE_NOW_PROGRESS_STEPS.map((step) => (
              <li key={step} className={captureProgress === step ? 'is-active' : ''}>
                {step.replace(/_/g, ' ')}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {captureError ? (
        <p className="site00-pfw-capture-now__error">{captureError}</p>
      ) : null}

      {!captureAvailable ? (
        <p className="site00-pfw-capture-now__unavailable">
          CAPTURE UNAVAILABLE — fix capture service in MORE → CAPTURE. Page family work remains available.
        </p>
      ) : null}

      <div className="site00-pfw-capture-now__actions">
        {showUpgrade ? (
          <>
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onUpgradePage}>
              UPGRADE THIS PAGE
            </button>
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onCaptureNow}>
              RECAPTURE
            </button>
          </>
        ) : status === 'CAPTURE_FAILED' ? (
          <>
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onCaptureNow}>
              RETRY
            </button>
            {onViewDetails ? (
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onViewDetails}>
                VIEW DETAILS
              </button>
            ) : null}
          </>
        ) : status !== 'CAPTURING' ? (
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--primary"
            onClick={onCaptureNow}
            disabled={!captureAvailable}
          >
            {nextAction.label}
          </button>
        ) : null}
      </div>

      {status === 'CAPTURE_READY' ? (
        <p className="site00-pfw-capture-now__ready-copy">THIS PAGE IS READY FOR CREATIVE DIRECTION.</p>
      ) : null}
    </section>
  );
}
