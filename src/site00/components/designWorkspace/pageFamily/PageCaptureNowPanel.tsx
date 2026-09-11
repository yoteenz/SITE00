/**
 * P0.VR.CAPTURE.1 — Page-scoped CAPTURE NOW panel (primary PAGES workflow).
 * P0.VR.CAPTURE.1R3 / 1R3A — Preview health, upgrade gate, authority replacement entry.
 */

import { useMemo, useState } from 'react';
import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import {
  CAPTURE_NOW_PROGRESS_STEPS,
  deriveLivePageCaptureState,
  isCaptureProgressStepComplete,
  livePageCaptureStatusLabel,
  resolvePageCapturePrimaryLabel,
  resolvePageUpgradeBlockReasons,
  resolvePageUpgradeNextAction,
  shouldOfferPageUpgrade,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import { captureNavigationRouteMatchesTarget } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/captureRouteEquivalence.js';
import {
  evaluateRenderableAuthorityContract,
  previewHealthLabel,
  resolveLiveCapturePreviewRef,
} from '../../../../../shared/site00-studio-world-production/assetDelivery/index.js';
import type { PreviewHealth } from '../../../../../shared/site00-studio-world-production/assetDelivery/types.js';
import { resolveCurrentDesignAuthority } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/index.js';
import { usePageViewportCapture } from '../usePageViewportCapture';
import type { CaptureServiceInput } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.js';
import { canRunLiveCapture } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.js';
import {
  authorityStatusLabel,
  canReplaceDesignAuthority,
  resolvePageViewportAuthority,
  shouldSetDesignAuthority,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageViewportAuthority.js';
import { DesignAssetPreview } from '../shared/DesignAssetPreview';

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
  onReplaceAuthority?: () => void;
  onViewAuthorityHistory?: () => void;
  onRetryTransport?: () => void;
  captureServiceChecking?: boolean;
  upgradeError?: string | null;
};

const INITIAL_HEALTH: PreviewHealth = {
  assetExists: false,
  urlResolved: false,
  requestSucceeded: false,
  mimeValid: false,
  browserLoaded: false,
  status: 'UNKNOWN',
  lifecycle: 'IDLE',
  errorCode: null,
  resolvedUrl: null,
};

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
  onReplaceAuthority,
  onViewAuthorityHistory,
  onRetryTransport,
  captureServiceChecking = false,
  upgradeError = null,
}: Props) {
  const stored = usePageViewportCapture(projectId, pageId, viewport);
  const [authorityPreviewHealth, setAuthorityPreviewHealth] = useState<PreviewHealth>(INITIAL_HEALTH);
  const [livePreviewHealth, setLivePreviewHealth] = useState<PreviewHealth>(INITIAL_HEALTH);

  const pageIdentityMismatch = stored?.artifactProof?.status === 'PAGE_MISMATCH';
  const previewVerifying =
    Boolean(stored?.captureId) &&
    livePreviewHealth.status === 'UNKNOWN' &&
    !capturing;

  const liveState = deriveLivePageCaptureState({
    projectId,
    pageId,
    viewport,
    isCapturing: capturing,
    boundCapture: stored,
    previewLoadSucceeded: livePreviewHealth.status === 'PASS',
    previewLoadFailed: livePreviewHealth.status === 'FAIL',
    previewVerifying,
    pageIdentityMismatch,
  });

  const captureAvailable = captureService ? canRunLiveCapture(captureService) : true;
  const authority = resolvePageViewportAuthority({
    projectId,
    pageId,
    screenId,
    viewport,
    routeMapped,
    isRoot,
  });
  const currentAuthority = resolveCurrentDesignAuthority({ projectId, pageId, screenId, viewport });
  const nextAction = resolvePageUpgradeNextAction({
    projectId,
    pageId,
    screenId,
    viewport,
    captureServiceAvailable: captureAvailable,
    isRoot,
    routeMapped,
  });
  const liveImageRef = useMemo(
    () =>
      resolveLiveCapturePreviewRef({
        imageRef: stored?.imageRef ?? screenshotUrl ?? null,
        artifactProof: stored?.artifactProof ?? null,
      }),
    [stored?.imageRef, stored?.artifactProof, screenshotUrl],
  );
  const livePreviewUrl = liveImageRef;
  const authorityApproved =
    authority.authorityStatus === 'APPROVED' ||
    authority.authorityStatus === 'STALE' ||
    currentAuthority.isCurrent;

  const navigation = stored?.artifactProof?.navigation ?? null;
  const routeMatch =
    !navigation ||
    captureNavigationRouteMatchesTarget({
      targetRoute: route,
      requestedRoute: navigation.requestedRoute,
      resolvedRuntimePath: navigation.resolvedRuntimePath,
      finalUrl: navigation.finalUrl,
      status: navigation.status,
    });
  const pageMatch = stored?.artifactProof?.pageIdentity?.match !== false;

  const upgradeContract = evaluateRenderableAuthorityContract({
    approvalStatus: authority.authorityStatus,
    captureStatus: liveState,
    designAuthorityPreview: authorityPreviewHealth,
    liveCapturePreview: livePreviewHealth,
    pageIdentityMatch: pageMatch,
    routeMatch,
    viewportMatch: true,
    designAuthorityMissing: !authority.previewAssetRef && authority.authorityStatus === 'MISSING',
  });

  const showUpgrade =
    shouldOfferPageUpgrade({
      upgradeAllowed: upgradeContract.upgradeAllowed,
      liveState,
      designPreviewStatus: authorityPreviewHealth.status,
      livePreviewStatus: livePreviewHealth.status,
      hasStoredCapture: Boolean(stored?.captureId),
      authorityApproved,
    }) && Boolean(onUpgradePage);
  const upgradeBlockReasons = resolvePageUpgradeBlockReasons({
    upgradeAllowed: upgradeContract.upgradeAllowed,
    upgradeBlockReason: upgradeContract.blockReason,
    liveState,
    designPreviewStatus: authorityPreviewHealth.status,
    livePreviewStatus: livePreviewHealth.status,
    hasStoredCapture: Boolean(stored?.captureId),
    authorityApproved,
    authorityStatus: authority.authorityStatus,
  });
  const showUpgradeActions = Boolean(showUpgrade);
  const primaryCaptureLabel = resolvePageCapturePrimaryLabel({
    upgradeAllowed: showUpgradeActions,
    liveState,
    nextActionLabel: nextAction.label,
    hasStoredCapture: Boolean(stored?.captureId),
  });
  const showReplacePrimary = authority.authorityStatus === 'STALE' && canReplaceDesignAuthority(authority.authorityStatus);
  const authorityLabel = authorityStatusLabel(authority.authorityStatus, {
    isCurrent: currentAuthority.isCurrent && (authority.authorityStatus === 'APPROVED' || Boolean(currentAuthority.authorityVersion)),
  });
  const authorityCacheBust = currentAuthority.authorityVersion?.authorityVersionId ?? null;

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
        DESIGN AUTHORITY: {authorityLabel}
      </p>
      <p className={`site00-pfw-capture-now__preview-health is-${authorityPreviewHealth.status.toLowerCase()}`}>
        {authority.previewAssetRef ? previewHealthLabel(authorityPreviewHealth) : 'PREVIEW UNAVAILABLE'}
      </p>

      <div className="site00-pfw-capture-now__preview site00-pfw-capture-now__preview--authority">
        <DesignAssetPreview
          assetRef={authority.previewAssetRef}
          alt={`Design authority ${displayName}`}
          label="DESIGN AUTHORITY"
          emptyCopy={authority.authorityStatus === 'MAPPED' ? 'MAPPED — NOT APPROVED' : 'NO REFERENCE YET'}
          sourceType="DESIGN_AUTHORITY"
          sourceId={`${projectId}:${screenId}:${viewport}`}
          cacheBustKey={authorityCacheBust}
          onPreviewHealthChange={setAuthorityPreviewHealth}
          onViewDetails={onViewDetails}
        />
      </div>

      <div className="site00-pfw-capture-now__authority-actions">
        {shouldSetDesignAuthority(authority.authorityStatus) && onReplaceAuthority ? (
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onReplaceAuthority}>
            SET DESIGN AUTHORITY
          </button>
        ) : canReplaceDesignAuthority(authority.authorityStatus) && onReplaceAuthority ? (
          <>
            <button
              type="button"
              className={`site00-dw-v3-btn ${showReplacePrimary ? 'site00-dw-v3-btn--primary' : 'site00-dw-v3-btn--outline'}`}
              onClick={onReplaceAuthority}
            >
              REPLACE DESIGN AUTHORITY
            </button>
            {onViewAuthorityHistory ? (
              <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onViewAuthorityHistory}>
                VIEW HISTORY
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      <p className={`site00-pfw-capture-now__status is-${liveState.toLowerCase().replace(/_/g, '-')}`}>
        LIVE PAGE: {livePageCaptureStatusLabel(liveState)}
      </p>
      <p className={`site00-pfw-capture-now__preview-health is-${livePreviewHealth.status.toLowerCase()}`}>
        {livePreviewUrl ? previewHealthLabel(livePreviewHealth) : 'PREVIEW UNAVAILABLE'}
      </p>

      <div className="site00-pfw-capture-now__preview site00-pfw-capture-now__preview--live">
        <DesignAssetPreview
          assetRef={livePreviewUrl}
          alt={`Live capture ${displayName}`}
          label="LIVE PAGE"
          emptyCopy={captureAvailable ? 'NO LIVE CAPTURE YET' : 'CAPTURE UNAVAILABLE'}
          sourceType="LIVE_CAPTURE"
          sourceId={stored?.captureId ?? `${projectId}:${pageId}:${viewport}`}
          onPreviewHealthChange={setLivePreviewHealth}
          onViewDetails={onViewDetails}
        />
      </div>

      {capturing ? (
        <div className="site00-pfw-capture-now__progress" role="status">
          <strong>CAPTURING THIS PAGE</strong>
          <ol>
            {CAPTURE_NOW_PROGRESS_STEPS.map((step) => {
              const classes = [
                captureProgress === step ? 'is-active' : '',
                isCaptureProgressStepComplete(step, captureProgress) ? 'is-complete' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <li key={step} className={classes || undefined}>
                  {step.replace(/_/g, ' ')}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {captureError ? <p className="site00-pfw-capture-now__error">{captureError}</p> : null}

      {captureServiceChecking ? (
        <p className="site00-pfw-capture-now__unavailable">CHECKING CAPTURE SERVICE…</p>
      ) : null}

      {!captureAvailable && !captureServiceChecking ? (
        <p className="site00-pfw-capture-now__unavailable">
          CAPTURE SERVICE OFFLINE — tap CAPTURE NOW to retry, or fix in MORE → CAPTURE. Railway redeploy may be required.
        </p>
      ) : null}

      {!showUpgradeActions && upgradeBlockReasons.length > 0 ? (
        <div className="site00-pfw-capture-now__gate-list" role="status">
          {upgradeBlockReasons.map((reason) => (
            <p key={reason} className="site00-pfw-capture-now__gate">
              {reason}
            </p>
          ))}
        </div>
      ) : null}

      <div className="site00-pfw-capture-now__actions">
        {showUpgradeActions ? (
          <>
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onUpgradePage}>
              UPGRADE THIS PAGE
            </button>
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onCaptureNow}>
              RECAPTURE
            </button>
          </>
        ) : liveState === 'FAILED' || liveState === 'PAGE_MISMATCH' ? (
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
        ) : liveState !== 'CAPTURING' ? (
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--primary"
            disabled={capturing || captureServiceChecking}
            onClick={() => {
              if (!captureAvailable) onRetryTransport?.();
              onCaptureNow();
            }}
          >
            {capturing ? 'CAPTURING…' : primaryCaptureLabel}
          </button>
        ) : null}
      </div>

      {upgradeError ? <p className="site00-pfw-capture-now__error">{upgradeError}</p> : null}

      {showUpgrade ? (
        <p className="site00-pfw-capture-now__ready-copy">THIS PAGE IS READY FOR CREATIVE DIRECTION.</p>
      ) : null}
    </section>
  );
}
