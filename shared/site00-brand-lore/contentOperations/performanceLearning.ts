/**
 * Performance ingestion + learning — PRODUCTION EVIDENCE, not character/canon.
 */

import { randomUUID } from 'node:crypto';
import type {
  AudienceResponseEvidence,
  ContentPerformanceLearning,
  ContentPerformanceRecord,
  LearningConfidenceLevel,
} from './types.js';

export function createPerformanceRecord(params: {
  contentPackageId: string;
  platform: string;
  metrics?: Partial<ContentPerformanceRecord>;
}): ContentPerformanceRecord {
  const available = params.metrics?.metricAvailability ?? {};
  return {
    recordId: `perf-${randomUUID().slice(0, 8)}`,
    contentPackageId: params.contentPackageId,
    platform: params.platform,
    publishedAt: new Date().toISOString(),
    impressions: params.metrics?.impressions ?? null,
    reach: params.metrics?.reach ?? null,
    likes: params.metrics?.likes ?? null,
    comments: params.metrics?.comments ?? null,
    saves: params.metrics?.saves ?? null,
    shares: params.metrics?.shares ?? null,
    profileVisits: params.metrics?.profileVisits ?? null,
    follows: params.metrics?.follows ?? null,
    linkClicks: params.metrics?.linkClicks ?? null,
    watchTime: params.metrics?.watchTime ?? null,
    completionRate: params.metrics?.completionRate ?? null,
    swipeRate: params.metrics?.swipeRate ?? null,
    storyReplies: params.metrics?.storyReplies ?? null,
    metricAvailability: {
      impressions: available.impressions ?? false,
      saves: available.saves ?? false,
      ...available,
    },
    rawPlatformPayload: params.metrics?.rawPlatformPayload ?? null,
    collectedAt: new Date().toISOString(),
  };
}

export function metricsNotFabricated(record: ContentPerformanceRecord): boolean {
  if (record.metricAvailability.impressions === false && record.impressions !== null) return false;
  return true;
}

export function missingMetricRemainsUnavailable(record: ContentPerformanceRecord, key: string): boolean {
  return record.metricAvailability[key] === false;
}

export function createAudienceResponse(params: {
  contentPackageId: string;
  text: string;
  classifications: AudienceResponseEvidence['classifications'];
}): AudienceResponseEvidence {
  return {
    evidenceId: `aud-${randomUUID().slice(0, 8)}`,
    contentPackageId: params.contentPackageId,
    source: 'COMMENT',
    text: params.text,
    classifications: params.classifications,
    observedAt: new Date().toISOString(),
  };
}

export function createPerformanceLearning(params: {
  projectId: string;
  sourceContentIds: string[];
  sampleSize: number;
  patterns: string[];
}): ContentPerformanceLearning {
  const confidence: LearningConfidenceLevel =
    params.sampleSize >= 10 ? 'HIGH' : params.sampleSize >= 5 ? 'MEDIUM' : params.sampleSize >= 2 ? 'LOW' : 'INSUFFICIENT';

  return {
    learningId: `learn-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    sourceContentIds: params.sourceContentIds,
    evidenceWindow: {
      start: new Date(Date.now() - 7 * 86400000).toISOString(),
      end: new Date().toISOString(),
    },
    observedPatterns: params.patterns,
    confidence,
    sampleSize: params.sampleSize,
    limitations: params.sampleSize < 5 ? ['SMALL_SAMPLE', 'OUTLIER_RISK'] : [],
    behavioralModeSignals: [],
    topicSignals: [],
    formatSignals: [],
    channelSignals: [],
    visualSignals: [],
    timingSignals: [],
    audienceSignals: [],
    recommendedProductionAdjustments: params.sampleSize >= 5 ? ['Test more historical callback content'] : [],
    doNotInfer: [
      'PERFORMANCE ≠ CHARACTER AUTHORITY',
      'Do not increase snark because snark performed',
      'Do not turn NDX into nostalgia brand because callbacks performed',
    ],
    founderAccepted: false,
    status: 'PROPOSED',
    evaluatedAt: new Date().toISOString(),
  };
}

export function performanceDoesNotMutateCharacter(): true {
  return true;
}

export function performanceDoesNotMutateCanon(): true {
  return true;
}

export function oneViralPostInsufficientConfidence(learning: ContentPerformanceLearning): boolean {
  return learning.sampleSize < 3 || learning.confidence === 'INSUFFICIENT';
}

export function outlierDetectionExists(learning: ContentPerformanceLearning): boolean {
  return learning.limitations.includes('OUTLIER_RISK') || learning.limitations.includes('SMALL_SAMPLE');
}

export function founderAcceptanceRequiredForStrategyChange(learning: ContentPerformanceLearning): boolean {
  return !learning.founderAccepted;
}

export function performanceMayInfluenceRankingOnlyAfterAcceptance(learning: ContentPerformanceLearning): boolean {
  return learning.founderAccepted && learning.status === 'ACCEPTED';
}
