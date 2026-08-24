/**
 * Upcoming moments + Weekly Cultural Forecast + Cultural Weather.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  BrandSignalInterpretation,
  CulturalMemoryMatch,
  CulturalWeatherPattern,
  EditorialFlexCapacity,
  LiveWatchQueueEntry,
  LiveWorldSignal,
  TemporalRelevanceEvaluation,
  UpcomingCulturalMoment,
  WeeklyCulturalForecast,
} from './types.js';

function fp(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

export function buildUpcomingCulturalMoment(params: {
  projectId: string;
  name: string;
  category: UpcomingCulturalMoment['category'];
  startAt: string;
  endAt: string;
  expectedAttention?: UpcomingCulturalMoment['expectedAttention'];
  knownContext?: string[];
}): UpcomingCulturalMoment {
  return {
    id: `ucm-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    name: params.name,
    category: params.category,
    startAt: params.startAt,
    endAt: params.endAt,
    certainty: 'SCHEDULED_CERTAINTY',
    expectedAttention: params.expectedAttention ?? 'MODERATE',
    expectedAudienceOverlap: 0.5,
    expectedConversationWindow: `${params.startAt} — ${params.endAt}`,
    preEventOpportunity: true,
    liveEventOpportunity: true,
    postEventOpportunity: true,
    callbackOpportunity: true,
    preResearchDeadline: params.startAt,
    recommendedPreparationWindow: '7 days before',
    liveMonitoringRecommended: true,
    rapidResponseEligible: false,
    knownContext: params.knownContext ?? [],
    historicalContext: [],
    possibleBrandRelevance: [],
    fingerprint: fp(params.name),
  };
}

export function buildCulturalWeatherPattern(params: {
  projectId: string;
  pattern: string;
  supportingSignalIds: string[];
}): CulturalWeatherPattern {
  return {
    id: `weather-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    pattern: params.pattern,
    supportingSignalIds: params.supportingSignalIds,
    firstObserved: new Date().toISOString(),
    confidence: 'MODERATE_FORECAST',
    crossDomainStrength: params.supportingSignalIds.length >= 3 ? 0.7 : 0.4,
    possibleInterpretations: [],
    brandRelevance: [],
    counterEvidence: [],
    fingerprint: fp(params.pattern),
  };
}

export function buildWeeklyCulturalForecast(params: {
  projectId: string;
  weekStart: string;
  weekEnd: string;
  knownMoments: UpcomingCulturalMoment[];
  accelerating: LiveWorldSignal[];
  culturalWeather: CulturalWeatherPattern[];
  newData: LiveWorldSignal[];
  callbacks: CulturalMemoryMatch[];
  watchlist: LiveWatchQueueEntry[];
  opportunities: BrandSignalInterpretation[];
  saturatedSkip: BrandSignalInterpretation[];
  expiring: TemporalRelevanceEvaluation[];
  openCapacity: EditorialFlexCapacity;
}): WeeklyCulturalForecast {
  return {
    forecastId: `wcf-${params.weekStart}`,
    projectId: params.projectId,
    weekStart: params.weekStart,
    weekEnd: params.weekEnd,
    knownMoments: params.knownMoments,
    acceleratingConversations: params.accelerating,
    culturalWeather: params.culturalWeather,
    newDataResearch: params.newData,
    callbackWindows: params.callbacks,
    watchlist: params.watchlist,
    brandOpportunities: params.opportunities,
    saturatedSkip: params.saturatedSkip,
    expiringWindows: params.expiring,
    openCapacity: params.openCapacity,
    notificationCandidates: [],
    fingerprint: fp(`${params.weekStart}-${params.opportunities.length}`),
    generatedAt: new Date().toISOString(),
  };
}

export function forecastPreparesContextDoesNotFabricateFuture(moment: UpcomingCulturalMoment): boolean {
  return moment.certainty !== 'OBSERVED_FACT' && moment.knownContext.length >= 0;
}
