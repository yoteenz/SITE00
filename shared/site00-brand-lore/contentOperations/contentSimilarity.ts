/**
 * Semantic duplication + callback detection.
 */

import type { ContentMemoryIndex, SimilarityResult } from './types.js';

export function evaluateContentSimilarity(params: {
  subject: string;
  headline?: string;
  memory: ContentMemoryIndex;
}): { result: SimilarityResult; priorId: string | null } {
  const normalized = params.subject.toLowerCase().trim();
  const covered = params.memory.coveredTopics.map((t) => t.toLowerCase());

  if (covered.some((t) => t === normalized)) {
    return { result: 'DUPLICATE', priorId: params.memory.publishedIds[0] ?? null };
  }
  if (covered.some((t) => t.includes(normalized) || normalized.includes(t))) {
    if (params.memory.unresolvedThreads.some((u) => u.toLowerCase().includes(normalized))) {
      return { result: 'FOLLOW_UP', priorId: params.memory.publishedIds[0] ?? null };
    }
    if (params.memory.revisedClaims.some((r) => r.toLowerCase().includes(normalized))) {
      return { result: 'SELF_CORRECTION', priorId: params.memory.publishedIds[0] ?? null };
    }
    return { result: 'RELATED_BUT_DISTINCT', priorId: params.memory.publishedIds[0] ?? null };
  }
  if (params.memory.promisedRevisits.some((p) => p.toLowerCase().includes(normalized))) {
    return { result: 'CALLBACK', priorId: params.memory.publishedIds[0] ?? null };
  }
  if (covered.some((t) => similarityRatio(t, normalized) > 0.85)) {
    return { result: 'TOO_SIMILAR', priorId: params.memory.publishedIds[0] ?? null };
  }
  return { result: 'NEW', priorId: null };
}

function similarityRatio(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  return intersection / Math.max(wordsA.size, wordsB.size, 1);
}

export function relatedTopicMayBecomeCallback(result: SimilarityResult): boolean {
  return result === 'CALLBACK' || result === 'FOLLOW_UP' || result === 'RELATED_BUT_DISTINCT';
}

export function duplicateDetectionWorks(result: SimilarityResult): boolean {
  return result === 'DUPLICATE' || result === 'TOO_SIMILAR';
}
