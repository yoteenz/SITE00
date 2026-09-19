/**
 * P0.5C.4B — Feed signature color continuity across 3×3 board.
 */

import type { ArtBoardRetainedFirstSlideContract, FeedSignatureColorContinuityEvaluation } from './types.js';

export function buildFeedSignatureColorContinuity(params: {
  boardId: string;
  contracts: ArtBoardRetainedFirstSlideContract[];
}): FeedSignatureColorContinuityEvaluation {
  const manifestations: string[] = [];
  let allContainLime = true;
  const templatePatterns: string[] = [];

  for (const c of params.contracts) {
    const sig = c.signatureLimeEvaluation;
    if (!sig?.presence.signaturePresent) allContainLime = false;
    const manifest = sig?.accentSelection.targetType ?? 'unknown';
    manifestations.push(manifest);
    if (manifest === sig?.accentSelection.targetType) {
      templatePatterns.push(manifest);
    }
  }

  const uniqueManifestations = new Set(manifestations);
  const repeatedPattern =
    templatePatterns.filter((m, i, arr) => arr.indexOf(m) !== i).length >= 3 &&
    uniqueManifestations.size <= 2;

  return {
    boardId: params.boardId,
    allArtifactsContainSignatureLime: allContainLime,
    manifestationTypes: manifestations,
    uniqueManifestationCount: uniqueManifestations.size,
    templateRepetitionDetected: repeatedPattern,
    cohesionWithoutTemplate: allContainLime && uniqueManifestations.size >= 4 && !repeatedPattern,
    evaluatedAt: new Date().toISOString(),
  };
}

export function limeTemplateRepetitionFails(feed: FeedSignatureColorContinuityEvaluation): boolean {
  return feed.templateRepetitionDetected;
}

export function feedSignatureColorContinuityPasses(feed: FeedSignatureColorContinuityEvaluation): boolean {
  return feed.allArtifactsContainSignatureLime && !feed.templateRepetitionDetected;
}
