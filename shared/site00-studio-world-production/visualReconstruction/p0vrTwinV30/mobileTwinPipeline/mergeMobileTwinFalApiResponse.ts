import type { DesignPageAuthorityReviewSession } from '../types.js';
import { slimMobileTwinPipelineForStorage } from './mobileTwinPipelinePersistence.js';
import { mergeMobileTwinPipelineRich, reconcileMobileTwinPipelineState } from './reconcileMobileTwinPipelineState.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import type { MobileTwinPipelineState } from './types.js';

/** Drop gallery/result bulk — Railway only needs mobile twin + authority masters. */
export function stripSessionForMobileTwinFalRequest(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline ?
    slimMobileTwinPipelineForStorage(session.mobileTwinPipeline)
  : undefined;
  return {
    ...session,
    lastResult: null,
    territoryGallery: { A: [], B: [], C: [] },
    selectedCandidateByTerritory: {},
    mobileTwinPipeline: pipeline,
  };
}

export function mergeMobileTwinFalApiResponse(
  clientSession: DesignPageAuthorityReviewSession,
  serverPipeline: MobileTwinPipelineState | null | undefined,
  updatedAt?: string,
): DesignPageAuthorityReviewSession {
  if (!serverPipeline) return clientSession;
  const clientPipeline = clientSession.mobileTwinPipeline;
  const serverWins =
    (serverPipeline.falJobsDispatched ?? 0) > (clientPipeline?.falJobsDispatched ?? 0) ||
    serverPipeline.blueprintTwins.length > (clientPipeline?.blueprintTwins.length ?? 0);
  const mergedPipeline =
    serverWins ?
      hydrateMobileTwinReviewState(reconcileMobileTwinPipelineState(serverPipeline))
    : hydrateMobileTwinReviewState(
        mergeMobileTwinPipelineRich(serverPipeline, clientPipeline) ?? serverPipeline,
      );
  return {
    ...clientSession,
    mobileTwinPipeline: mergedPipeline ?? serverPipeline,
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}
