import type { DesignPageAuthorityReviewSession } from '../types.js';
import { authorityImagesRecoverableOffDevice, mobileTwinAuthorityImagesReady } from './autoHealMobileTwinAuthorityImages.js';
import { mobileTwinPipelineDataScore } from './mobileTwinPipelineDataScore.js';
import { readMobileTwinPipelineFromBrowser } from './mobileTwinPipelinePersistence.js';

export type MobileTwinPipelineRecoveryView = {
  showRecoveryStrip: boolean;
  /** Session missing Actual/Blueprint URIs but backup or snapshot may still have them. */
  showAuthorityImageRecovery: boolean;
  storedScore: number;
  sessionScore: number;
  storedFalJobs: number;
  sessionFalJobs: number;
  storedPackageCount: number;
  sessionPackageCount: number;
};

export function evaluateMobileTwinPipelineRecovery(
  session: DesignPageAuthorityReviewSession,
  projectId: string,
): MobileTwinPipelineRecoveryView {
  const stored = readMobileTwinPipelineFromBrowser(projectId);
  const sessionPipe = session.mobileTwinPipeline;
  const storedScore = stored ? mobileTwinPipelineDataScore(stored) : 0;
  const sessionScore = sessionPipe ? mobileTwinPipelineDataScore(sessionPipe) : 0;
  const sessionReady = sessionPipe ? mobileTwinAuthorityImagesReady(sessionPipe) : false;
  const recoverableImages = !sessionReady && authorityImagesRecoverableOffDevice(projectId);
  return {
    showRecoveryStrip: storedScore > sessionScore + 50 || recoverableImages,
    showAuthorityImageRecovery: recoverableImages,
    storedScore,
    sessionScore,
    storedFalJobs: stored?.falJobsDispatched ?? 0,
    sessionFalJobs: sessionPipe?.falJobsDispatched ?? 0,
    storedPackageCount: stored?.packages.length ?? 0,
    sessionPackageCount: sessionPipe?.packages.length ?? 0,
  };
}
