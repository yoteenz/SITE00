import type { DesignPageAuthorityReviewSession } from '../types.js';
import { mobileTwinPipelineDataScore } from './mobileTwinPipelineDataScore.js';
import { readMobileTwinPipelineFromBrowser } from './mobileTwinPipelinePersistence.js';

export type MobileTwinPipelineRecoveryView = {
  showRecoveryStrip: boolean;
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
  return {
    showRecoveryStrip: storedScore > sessionScore + 50,
    storedScore,
    sessionScore,
    storedFalJobs: stored?.falJobsDispatched ?? 0,
    sessionFalJobs: sessionPipe?.falJobsDispatched ?? 0,
    storedPackageCount: stored?.packages.length ?? 0,
    sessionPackageCount: sessionPipe?.packages.length ?? 0,
  };
}
