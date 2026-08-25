/**
 * P0.5E.7 — Book memory integration for content seeds.
 */

import type { ContentMemoryIndex } from '../types.js';
import type { NDXContentSeed } from './types.js';
import { CREDIT_UTILIZATION_GOLDEN_PILOT_ID } from './constants.js';

export type BookMemoryHit = {
  hasPriorCoverage: boolean;
  callbackIds: string[];
  dogEared: boolean;
  bookmarked: boolean;
  errataExists: boolean;
  flipBackCandidate: boolean;
  audienceEvidence: boolean;
  priorPrediction: boolean;
};

export function checkBookMemoryForSeed(
  seed: NDXContentSeed,
  memory: ContentMemoryIndex | null,
): BookMemoryHit {
  if (!memory) {
    return {
      hasPriorCoverage: false,
      callbackIds: [],
      dogEared: seed.bookTrace === 'DOG_EAR',
      bookmarked: seed.bookTrace === 'BOOKMARK',
      errataExists: seed.bookTrace === 'ERRATA',
      flipBackCandidate: seed.bookTrace === 'FLIP_BACK',
      audienceEvidence: Boolean(seed.audiencePrompt),
      priorPrediction: false,
    };
  }

  const topic = seed.premise.internalTopic.toLowerCase();
  const covered = memory.coveredTopics.some((entry) => entry.toLowerCase().includes(topic));
  const questioned = memory.questionedTopics.some((entry) => entry.toLowerCase().includes(topic));
  const investigated = memory.investigatedTopics.some((entry) => entry.toLowerCase().includes(topic));
  const revised = memory.revisedClaims.some((entry) => entry.toLowerCase().includes(topic));
  const saved = memory.savedForLater.some((entry) => entry.toLowerCase().includes(topic));
  const unresolved = memory.unresolvedThreads.some((entry) => entry.toLowerCase().includes(topic));

  const callbackIds = memory.publishedIds.filter(() =>
    memory.coveredTopics.some((entry) => entry.toLowerCase().includes(topic)),
  );

  return {
    hasPriorCoverage: covered || questioned || investigated,
    callbackIds,
    dogEared: seed.bookTrace === 'DOG_EAR' || unresolved,
    bookmarked: seed.bookTrace === 'BOOKMARK' || saved,
    errataExists: seed.bookTrace === 'ERRATA' || revised,
    flipBackCandidate: seed.bookTrace === 'FLIP_BACK' || covered,
    audienceEvidence: Boolean(seed.audiencePrompt),
    priorPrediction: questioned,
  };
}

export function buildContentOpsWorkspaceZones(seeds: NDXContentSeed[]) {
  return [
    { zoneId: 'today-at-ndx', label: 'TODAY AT NDX', seedIds: seeds.slice(0, 5).map((s) => s.seedId) },
    { zoneId: 'thoughts-in-motion', label: 'THOUGHTS IN MOTION', seedIds: seeds.filter((s) => s.thoughtArc.knowledgeState === 'TESTING' || s.thoughtArc.knowledgeState === 'SUSPECTS').map((s) => s.seedId) },
    { zoneId: 'rabbit-holes', label: 'RABBIT HOLES', seedIds: seeds.filter((s) => s.sourceType === 'RABBIT_HOLE' || s.characterBeat === 'I_HAVE_A_THEORY' || s.investigationTrigger.length > 20).map((s) => s.seedId) },
    { zoneId: 'ready-for-book', label: 'READY FOR THE BOOK', seedIds: seeds.filter((s) => s.saveability === 'HIGH' || s.bookTrace === 'NEW_PAGE').map((s) => s.seedId) },
    { zoneId: 'the-margins', label: 'THE MARGINS', seedIds: seeds.filter((s) => s.candidateSurface === 'MARGIN' || s.bookTrace === 'MARGIN_TRACE').map((s) => s.seedId) },
    { zoneId: 'book-in-motion', label: 'BOOK IN MOTION', seedIds: seeds.filter((s) => s.candidateSurface === 'REEL' || s.candidateFormat === 'SHORT_FORM').map((s) => s.seedId) },
    { zoneId: 'dog-eared', label: 'DOG-EARED', seedIds: seeds.filter((s) => s.bookTrace === 'DOG_EAR').map((s) => s.seedId) },
    { zoneId: 'audience-left', label: 'AUDIENCE LEFT THIS HERE', seedIds: seeds.filter((s) => s.sourceType === 'AUDIENCE_QUESTION' || s.sourceType === 'AUDIENCE_SUBMISSION').map((s) => s.seedId) },
    { zoneId: 'bookmark-callback', label: 'BOOKMARK / CALLBACK', seedIds: seeds.filter((s) => s.bookTrace === 'BOOKMARK' || s.bookTrace === 'FLIP_BACK').map((s) => s.seedId) },
    { zoneId: 'golden-pilot', label: 'GOLDEN PILOT', seedIds: seeds.filter((s) => s.seedId === CREDIT_UTILIZATION_GOLDEN_PILOT_ID).map((s) => s.seedId) },
  ];
}
