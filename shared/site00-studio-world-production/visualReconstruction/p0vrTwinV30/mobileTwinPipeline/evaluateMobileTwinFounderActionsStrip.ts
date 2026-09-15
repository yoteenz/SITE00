import type { DesignPageAuthorityReviewSession } from '../types.js';
import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../constants.js';
import { canRunFullMobileTwinPackage } from './mobileTwinVisualStrategy.js';
import { evaluateMobileTwinRestoreOffer } from './evaluateMobileTwinRestoreOffer.js';
import { shouldShowBuildTwinDesignRoute } from '../../p0vrTwinV30R8M/shouldShowBuildTwinDesignRoute.js';
import { normalizeFounderNbpPromotionOnLoad } from './applyFounderNbpMobileTwinPromotion.js';
import { syncFounderMobileTwinSession } from './syncFounderMobileTwinSession.js';

export type MobileTwinFounderActionsStripView = {
  showStrip: boolean;
  showRestore: boolean;
  showEmptyBackupMessage: boolean;
  showGenerate: boolean;
  canGenerate: boolean;
  showBuild: boolean;
  falJobs: number;
  packageCount: number;
  providerLocked: boolean;
  generateBlockedHint: string | null;
};

export function shouldShowMobileTwinFounderActionsStrip(
  _session: DesignPageAuthorityReviewSession,
  projectId: string,
): boolean {
  return projectId.toLowerCase() === DESIGN_PAGE_V3_PILOT_PROJECT_ID;
}

export function evaluateMobileTwinFounderActionsStrip(
  session: DesignPageAuthorityReviewSession,
  projectId: string,
): MobileTwinFounderActionsStripView {
  if (!shouldShowMobileTwinFounderActionsStrip(session, projectId)) {
    return {
      showStrip: false,
      showRestore: false,
      showEmptyBackupMessage: false,
      showGenerate: false,
      canGenerate: false,
      showBuild: false,
      falJobs: 0,
      packageCount: 0,
      providerLocked: false,
      generateBlockedHint: null,
    };
  }

  const synced = normalizeFounderNbpPromotionOnLoad(syncFounderMobileTwinSession(session, projectId));
  const pipeline = synced.mobileTwinPipeline;
  const restoreOffer = evaluateMobileTwinRestoreOffer(synced, projectId);
  const falJobs = pipeline?.falJobsDispatched ?? 0;
  const packageCount = pipeline?.packages.length ?? 0;
  const hasApproved = pipeline?.packages.some((p) => p.status === 'APPROVED') ?? false;
  const showBuild = shouldShowBuildTwinDesignRoute(synced);
  const showGenerate = !hasApproved && !showBuild;
  const strategy = pipeline?.mobileTwinVisualGenerationStrategy;
  const canGenerate = Boolean(pipeline?.designReference) && canRunFullMobileTwinPackage(strategy, pipeline);
  const providerLocked = Boolean(pipeline?.mobileTwinProviderLock?.locked);

  let generateBlockedHint: string | null = null;
  if (showGenerate && !canGenerate) {
    if (!pipeline?.designReference) {
      generateBlockedHint = 'Design reference missing — lock mobile master in PAIR REVIEW first.';
    } else if (!providerLocked) {
      generateBlockedHint = 'Tap ENABLE NBP GENERATE below to restore provider lock on this device.';
    } else {
      generateBlockedHint = 'Mobile twin strategy not ready — hard refresh Design.';
    }
  }

  const showRestore = restoreOffer.show;

  return {
    showStrip: true,
    showRestore,
    showEmptyBackupMessage: !showRestore && falJobs === 0 && packageCount === 0,
    showGenerate,
    canGenerate,
    showBuild,
    falJobs,
    packageCount,
    providerLocked,
    generateBlockedHint,
  };
}
