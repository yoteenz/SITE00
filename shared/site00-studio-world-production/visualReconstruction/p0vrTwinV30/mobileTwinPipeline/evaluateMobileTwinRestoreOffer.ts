import type { DesignPageAuthorityReviewSession } from '../types.js';
import {
  autoHealMobileTwinAuthorityImages,
  mobileTwinAuthorityImagesReady,
} from './autoHealMobileTwinAuthorityImages.js';
import { evaluateMobileTwinPipelineRecovery } from './evaluateMobileTwinPipelineRecovery.js';
import { hasMobileTwinBrowserBackup } from './hasMobileTwinBrowserBackup.js';
import { readRichestMobileTwinPipelineFromBrowser } from './readRichestMobileTwinPipelineFromBrowser.js';

export type MobileTwinRestoreOfferView = {
  show: boolean;
  showAuthorityImageRecovery: boolean;
  sessionFalJobs: number;
  sessionPackageCount: number;
  storedFalJobs: number;
  storedPackageCount: number;
  browserImagesReady: boolean;
  sessionImagesReady: boolean;
};

/** Whether founder should see RESTORE MOBILE TWIN FROM BROWSER BACKUP (survives sessionView sync). */
export function evaluateMobileTwinRestoreOffer(
  session: DesignPageAuthorityReviewSession,
  projectId: string,
): MobileTwinRestoreOfferView {
  const recovery = evaluateMobileTwinPipelineRecovery(session, projectId);
  const pipe = session.mobileTwinPipeline;
  const sessionImagesReady = pipe ? mobileTwinAuthorityImagesReady(pipe, projectId) : false;

  const richest = readRichestMobileTwinPipelineFromBrowser(projectId);
  const healedBrowser = richest ? autoHealMobileTwinAuthorityImages(richest, projectId) : null;
  const browserImagesReady = healedBrowser ? mobileTwinAuthorityImagesReady(healedBrowser, projectId) : false;

  const sessionFalJobs = pipe?.falJobsDispatched ?? 0;
  const sessionPackageCount = pipe?.packages.length ?? 0;
  const storedFalJobs = richest?.falJobsDispatched ?? 0;
  const storedPackageCount = richest?.packages.length ?? 0;
  const hasBackup = hasMobileTwinBrowserBackup(projectId);

  const missingSessionImagesWithHistory =
    !sessionImagesReady &&
    (hasBackup || sessionFalJobs > 0 || sessionPackageCount > 0 || storedFalJobs > 0 || storedPackageCount > 0);

  const browserRicherThanSession =
    !sessionImagesReady && browserImagesReady && (storedFalJobs > sessionFalJobs || storedPackageCount > sessionPackageCount);

  const show =
    recovery.showRecoveryStrip ||
    recovery.showAuthorityImageRecovery ||
    missingSessionImagesWithHistory ||
    browserRicherThanSession;

  const showAuthorityImageRecovery =
    recovery.showAuthorityImageRecovery ||
    missingSessionImagesWithHistory ||
    (!sessionImagesReady && browserImagesReady);

  return {
    show,
    showAuthorityImageRecovery,
    sessionFalJobs,
    sessionPackageCount,
    storedFalJobs,
    storedPackageCount,
    browserImagesReady,
    sessionImagesReady,
  };
}
