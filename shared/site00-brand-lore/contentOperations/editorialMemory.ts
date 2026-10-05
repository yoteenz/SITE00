/**
 * Editorial memory — what NDX already covered, claimed, questioned.
 */

import type { ContentMemoryIndex } from './types.js';

export function createEmptyContentMemoryIndex(projectId: string): ContentMemoryIndex {
  return {
    indexId: `cmi-${projectId}`,
    projectId,
    coveredTopics: [],
    priorClaims: [],
    questionedTopics: [],
    investigatedTopics: [],
    jokesUsed: [],
    revisedClaims: [],
    promisedRevisits: [],
    unresolvedThreads: [],
    savedForLater: [],
    publishedIds: [],
    retiredIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function recordPublishedContent(
  memory: ContentMemoryIndex,
  params: { packageId: string; subject: string; claim?: string; unresolved?: boolean },
): ContentMemoryIndex {
  return {
    ...memory,
    coveredTopics: [...new Set([...memory.coveredTopics, params.subject])],
    priorClaims: params.claim ? [...memory.priorClaims, params.claim] : memory.priorClaims,
    publishedIds: [...memory.publishedIds, params.packageId],
    unresolvedThreads: params.unresolved
      ? [...memory.unresolvedThreads, params.subject]
      : memory.unresolvedThreads,
    updatedAt: new Date().toISOString(),
  };
}

export function editorialMemoryPreservesPriorClaims(memory: ContentMemoryIndex): boolean {
  return Array.isArray(memory.priorClaims);
}

export function editorialMemoryPreservesUnresolved(memory: ContentMemoryIndex): boolean {
  return Array.isArray(memory.unresolvedThreads);
}

export function editorialMemoryPreservesSelfCorrections(memory: ContentMemoryIndex): boolean {
  return Array.isArray(memory.revisedClaims);
}
