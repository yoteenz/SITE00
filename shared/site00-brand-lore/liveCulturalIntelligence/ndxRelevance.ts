/**
 * NDX trend dependency + cultural memory evaluation.
 */

import { randomUUID } from 'node:crypto';
import type { ContentMemoryIndex } from '../contentOperations/types.js';
import type { CulturalMemoryMatch, LiveWorldSignal } from '../../site00-studio-world-production/liveCulturalIntelligence/types.js';
import type { NdxTrendDependencyResult } from './constants.js';

export function interpretNdxTrendDependency(params: {
  wouldCareWithoutTrend: boolean;
  hasDistinctiveAngle: boolean;
  trendCreatedConnection: boolean;
}): NdxTrendDependencyResult {
  if (params.wouldCareWithoutTrend && params.hasDistinctiveAngle) return 'NATURAL_NDX_INTEREST';
  if (params.wouldCareWithoutTrend && !params.hasDistinctiveAngle) return 'TREND_ACTIVATED_EXISTING_INTEREST';
  if (!params.wouldCareWithoutTrend && params.trendCreatedConnection) return 'TREND_CREATED_USEFUL_CONNECTION';
  if (!params.wouldCareWithoutTrend && !params.hasDistinctiveAngle) return 'TREND_ONLY_INTEREST';
  return 'FORCED_RELEVANCE';
}

export function ndxTrendOnlyInterestRejected(result: NdxTrendDependencyResult): boolean {
  return result === 'TREND_ONLY_INTEREST' || result === 'FORCED_RELEVANCE';
}

export function evaluateNdxCulturalMemory(params: {
  signal: LiveWorldSignal;
  editorialMemory: ContentMemoryIndex;
  priorSubject?: string;
}): CulturalMemoryMatch[] {
  const matches: CulturalMemoryMatch[] = [];
  const subject = params.priorSubject?.toLowerCase() ?? '';
  const priorId = params.editorialMemory.coveredTopics.find((t) => t.toLowerCase().includes(subject.slice(0, 12)));
  if (priorId || params.editorialMemory.coveredTopics.some((t) => subject && t.toLowerCase().includes(subject.split(' ')[0]!))) {
    matches.push({
      id: `cmm-${randomUUID().slice(0, 8)}`,
      signalId: params.signal.id,
      matchType: 'CALLBACK',
      evidenceReference: priorId ?? params.editorialMemory.coveredTopics[0] ?? 'prior coverage',
      priorContentId: priorId ?? null,
      priorSignalId: null,
      description: `Prior NDX coverage may be relevant: ${params.priorSubject ?? subject}`,
      confidence: 0.75,
      evaluatedAt: new Date().toISOString(),
    });
  }
  if (params.editorialMemory.revisedClaims.length > 0 && params.signal.signalOrigin === 'RESURFACED') {
    matches.push({
      id: `cmm-${randomUUID().slice(0, 8)}`,
      signalId: params.signal.id,
      matchType: 'CULTURAL_REASSESSMENT',
      evidenceReference: params.editorialMemory.revisedClaims[0]!,
      priorContentId: null,
      priorSignalId: null,
      description: 'Prior NDX judgment may warrant reassessment',
      confidence: 0.6,
      evaluatedAt: new Date().toISOString(),
    });
  }
  return matches;
}

export function callbackRequiresStoredEvidence(match: CulturalMemoryMatch): boolean {
  return match.evidenceReference.length > 0;
}

export function memoryWithoutEvidenceFails(match: CulturalMemoryMatch | null): boolean {
  return !match || match.evidenceReference.length === 0;
}
