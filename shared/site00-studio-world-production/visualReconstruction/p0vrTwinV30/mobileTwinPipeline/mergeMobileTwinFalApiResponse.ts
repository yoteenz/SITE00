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
  const mergedPipeline = hydrateMobileTwinReviewState(
    reconcileMobileTwinPipelineState(
      mergeMobileTwinPipelineRich(serverPipeline, clientPipeline) ?? serverPipeline,
    ),
  );
  return {
    ...clientSession,
    mobileTwinPipeline: mergedPipeline ?? serverPipeline,
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}
