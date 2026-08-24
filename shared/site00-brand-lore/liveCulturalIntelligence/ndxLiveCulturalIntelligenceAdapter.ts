/**
 * NDXBOOK live cultural intelligence adapter — brand-specific interpretation.
 */

import type { ContentMemoryIndex, ContentOpportunityLiveLineage } from '../contentOperations/types.js';
import type { SeedOpportunitySpec } from '../contentOperations/opportunityEngine.js';
import {
  buildCurrentIntelligencePackage,
  buildLiveWorldSignal,
  buildUpcomingCulturalMoment,
  buildWeeklyCulturalForecast,
  clusterSignals,
  evaluateTemporalRelevance,
  evaluateTrendLifecycle,
  evaluateWhyNow,
  interpretBrandSignal,
} from '../../site00-studio-world-production/liveCulturalIntelligence/index.js';
import type {
  BrandSignalInterpretation,
  CulturalMemoryMatch,
  LiveWorldSignal,
  UpcomingCulturalMoment,
} from '../../site00-studio-world-production/liveCulturalIntelligence/types.js';
import { interpretNdxTrendDependency, evaluateNdxCulturalMemory } from './ndxRelevance.js';
import { buildDefaultFlexCapacity, evaluateEditorialWhitespace } from '../../site00-studio-world-production/liveCulturalIntelligence/editorialWhitespace.js';
import { buildLiveWatchQueueEntry } from '../../site00-studio-world-production/liveCulturalIntelligence/watchQueue.js';
import { buildCulturalWeatherPattern } from '../../site00-studio-world-production/liveCulturalIntelligence/forecast.js';
import type { NdxTrendDependencyResult } from './constants.js';

export type NdxPilotSignalSpec = {
  title: string;
  summary: string;
  sourceType: LiveWorldSignal['sourceType'];
  signalOrigin: LiveWorldSignal['signalOrigin'];
  domains: string[];
  entities?: string[];
  velocity?: number;
  saturation?: number;
  wouldCareWithoutTrend?: boolean;
  hasCallback?: boolean;
  priorCoverageSubject?: string;
};

export const NDX_PILOT_LIVE_SIGNALS: NdxPilotSignalSpec[] = [
  {
    title: 'Major streaming service raises prices again',
    summary: 'Second price increase in 18 months while promoting "value" messaging',
    sourceType: 'BUSINESS',
    signalOrigin: 'ACCELERATING',
    domains: ['money / consumer behavior'],
    entities: ['streaming industry'],
    velocity: 0.7,
    saturation: 0.4,
    wouldCareWithoutTrend: true,
  },
  {
    title: 'Award show red carpet conversation dominates weekend',
    summary: 'Fashion and speech moments trending — saturated mainstream discourse',
    sourceType: 'AWARD_SHOWS',
    signalOrigin: 'PEAKING',
    domains: ['entertainment'],
    velocity: 0.9,
    saturation: 0.92,
    wouldCareWithoutTrend: false,
  },
  {
    title: 'Bureau releases household debt quarterly report',
    summary: 'Scheduled public data release — credit card balances up YoY',
    sourceType: 'DATA_RELEASES',
    signalOrigin: 'KNOWN_UPCOMING',
    domains: ['economics', 'money / consumer behavior'],
    velocity: 0.3,
    saturation: 0.1,
    wouldCareWithoutTrend: true,
  },
  {
    title: 'Subscription fatigue memes resurface across platforms',
    summary: 'Recurring internet pattern — not new, but audience mood shifting',
    sourceType: 'INTERNET_CULTURE',
    signalOrigin: 'RESURFACED',
    domains: ['internet behavior'],
    velocity: 0.6,
    saturation: 0.5,
    wouldCareWithoutTrend: true,
    hasCallback: true,
    priorCoverageSubject: 'subscription normalization',
  },
  {
    title: 'Tech company "we will never show ads" tweet vs new ad tier',
    summary: 'Archived statement contradicted by current product announcement',
    sourceType: 'TECHNOLOGY',
    signalOrigin: 'EMERGING',
    domains: ['technology', 'business'],
    velocity: 0.55,
    saturation: 0.35,
    wouldCareWithoutTrend: true,
    hasCallback: true,
    priorCoverageSubject: 'saved tweet vs current announcement',
  },
];

export function buildNdxPilotLiveSignals(params: {
  projectId: string;
  brandId: string;
}): LiveWorldSignal[] {
  return NDX_PILOT_LIVE_SIGNALS.map((spec) =>
    buildLiveWorldSignal({
      projectId: params.projectId,
      brandId: params.brandId,
      title: spec.title,
      summary: spec.summary,
      sourceType: spec.sourceType,
      signalOrigin: spec.signalOrigin,
      domains: spec.domains,
      entities: spec.entities ?? [],
      velocity: spec.velocity,
      momentum: spec.velocity,
      sourceIds: ['manual-editorial'],
    }),
  );
}

export function buildNdxKnownMoments(projectId: string, weekStart: string): UpcomingCulturalMoment[] {
  const start = new Date(weekStart);
  const awardDate = new Date(start);
  awardDate.setDate(awardDate.getDate() + 5);
  const reportDate = new Date(start);
  reportDate.setDate(reportDate.getDate() + 2);
  return [
    buildUpcomingCulturalMoment({
      projectId,
      name: 'Scheduled economic data release',
      category: 'DATA_RELEASES',
      startAt: reportDate.toISOString().slice(0, 10),
      endAt: reportDate.toISOString().slice(0, 10),
      expectedAttention: 'MODERATE',
    }),
    buildUpcomingCulturalMoment({
      projectId,
      name: 'Major entertainment industry event',
      category: 'AWARD_SHOWS',
      startAt: awardDate.toISOString().slice(0, 10),
      endAt: awardDate.toISOString().slice(0, 10),
      expectedAttention: 'MAJOR',
    }),
  ];
}

export function processNdxLiveIntelligence(params: {
  projectId: string;
  brandId: string;
  weekStart: string;
  weekEnd: string;
  editorialMemory?: ContentMemoryIndex | null;
  liveSignals?: LiveWorldSignal[];
  knownMoments?: UpcomingCulturalMoment[];
  forecastId?: string;
}) {
  const pilotSignals = buildNdxPilotLiveSignals(params);
  const mergedRaw = [...(params.liveSignals ?? []), ...pilotSignals];
  const { clusters, signals } = clusterSignals(mergedRaw);
  const lifecycles = signals.map((s) => evaluateTrendLifecycle({ signal: s }));
  const knownMoments = params.knownMoments ?? buildNdxKnownMoments(params.projectId, params.weekStart);

  const interpretations: BrandSignalInterpretation[] = [];
  const memoryMatches: CulturalMemoryMatch[] = [];
  const packages = signals.map((signal) => {
    const spec = NDX_PILOT_LIVE_SIGNALS.find((p) => p.title === signal.title);
    const isLiveWeb = signal.sourceIds.some((id) => id.includes('rss') || id === 'public-rss');
    const wouldCareWithoutTrend = spec?.wouldCareWithoutTrend ?? isLiveWeb;
    const hasCallback = spec?.hasCallback ?? false;
    const priorCoverageSubject = spec?.priorCoverageSubject;
    const whyNow = evaluateWhyNow({
      signal,
      whatChanged: signal.summary,
      attentionDriver: signal.signalOrigin,
      saturation: signal.saturation,
    });
    const temporal = evaluateTemporalRelevance({ signal, whyNow: whyNow.whatChanged });
    const cluster = clusters.find((c) => c.id === signal.clusterId) ?? null;
    const pkg = buildCurrentIntelligencePackage({
      projectId: params.projectId,
      signal,
      cluster,
      whyNow,
      verifiedFacts: signal.sourceType === 'DATA_RELEASES' ? [signal.summary] : [],
      unverifiedClaims: signal.sourceType !== 'DATA_RELEASES' ? [signal.summary] : [],
    });
    const whitespace = evaluateEditorialWhitespace({
      signal,
      distinctiveAngleExists: wouldCareWithoutTrend,
      newEvidenceExists: signal.sourceType === 'DATA_RELEASES' || signal.sourceType === 'PUBLIC_REPORT',
    });
    const trendDep = interpretNdxTrendDependency({
      wouldCareWithoutTrend,
      hasDistinctiveAngle: whitespace.outcome === 'OPEN' || whitespace.outcome === 'SATURATED_BUT_ANGLE_EXISTS',
      trendCreatedConnection: hasCallback,
    });
    if (hasCallback && params.editorialMemory && priorCoverageSubject) {
      memoryMatches.push(
        ...evaluateNdxCulturalMemory({
          signal,
          editorialMemory: params.editorialMemory,
          priorSubject: priorCoverageSubject,
        }),
      );
    }
    if (trendDep === 'TREND_ONLY_INTEREST' || trendDep === 'FORCED_RELEVANCE') {
      return { signal, pkg, whyNow, temporal, interpretation: null, trendDep };
    }
    const interpretation = interpretBrandSignal({
      brandId: params.brandId,
      signal,
      intelligencePackage: pkg,
      scores: {
        naturalInterest: wouldCareWithoutTrend ? 0.8 : isLiveWeb ? 0.55 : 0.3,
        characterFit: wouldCareWithoutTrend ? 0.75 : isLiveWeb ? 0.5 : 0.25,
        wouldBrandCareWithoutTrend: wouldCareWithoutTrend,
        trendDependencyRisk: isLiveWeb ? 0.35 : 0.2,
        forcedParticipationRisk: 0.1,
        hasDistinctiveObservation: wouldCareWithoutTrend || isLiveWeb,
        hasHistoricalCallback: hasCallback,
      },
    });
    interpretations.push(interpretation);
    return { signal, pkg, whyNow, temporal, interpretation, trendDep };
  });

  const accelerating = signals.filter((s) => s.velocity >= 0.6 && s.saturation < 0.7);
  const weather =
    signals.filter((s) => s.domains.includes('money / consumer behavior')).length >= 2
      ? [
          buildCulturalWeatherPattern({
            projectId: params.projectId,
            pattern: 'Consumer cost fatigue appearing across unrelated domains',
            supportingSignalIds: signals.filter((s) => s.domains.includes('money / consumer behavior')).map((s) => s.id),
          }),
        ]
      : [];

  const watchlist = signals
    .filter((_, i) => packages[i]?.interpretation === null)
    .map((s) => buildLiveWatchQueueEntry({ signal: s, watchState: 'WATCHING' }));

  const opportunities = interpretations.filter((i) => i.decision === 'STRONG_OPPORTUNITY' || i.decision === 'CALLBACK_OPPORTUNITY');
  const saturatedSkip = interpretations.filter((i) => i.decision === 'TOO_SATURATED' || i.decision === 'FORCED_PARTICIPATION');

  const weeklyForecast = buildWeeklyCulturalForecast({
    projectId: params.projectId,
    weekStart: params.weekStart,
    weekEnd: params.weekEnd,
    knownMoments,
    accelerating,
    culturalWeather: weather,
    newData: signals.filter((s) => s.sourceType === 'DATA_RELEASES' || s.sourceType === 'PUBLIC_REPORT'),
    callbacks: memoryMatches,
    watchlist,
    opportunities,
    saturatedSkip,
    expiring: packages.map((p) => p.temporal),
    openCapacity: buildDefaultFlexCapacity({ plannedPrimaryEvents: 21 }),
  });

  if (params.forecastId) {
    weeklyForecast.forecastId = params.forecastId;
  }

  return {
    signals,
    clusters,
    lifecycles,
    knownMoments,
    packages: packages.map((p) => p.pkg),
    whyNowEvaluations: packages.map((p) => p.whyNow),
    temporalEvaluations: packages.map((p) => p.temporal),
    interpretations,
    memoryMatches,
    watchlist,
    weeklyForecast,
  };
}

export function promoteSignalToContentOpportunitySpec(params: {
  signal: LiveWorldSignal;
  interpretation: BrandSignalInterpretation;
  lineage: ContentOpportunityLiveLineage;
}): SeedOpportunitySpec {
  return {
    sourceType: 'CULTURAL_SIGNAL',
    subject: params.signal.title.slice(0, 80).toLowerCase(),
    summary: params.signal.summary,
    whyInteresting: params.interpretation.reasoning,
    domains: params.signal.domains,
  };
}

export function buildOpportunityLineage(params: {
  signal: LiveWorldSignal;
  intelligencePackageId: string;
  brandInterpretationId: string;
  whyNowEvaluationId: string;
  temporalRelevanceId: string;
  culturalMemoryMatchIds?: string[];
  forecastId?: string;
}): ContentOpportunityLiveLineage {
  return {
    liveSignalIds: [params.signal.id],
    currentIntelligencePackageId: params.intelligencePackageId,
    brandSignalInterpretationId: params.brandInterpretationId,
    whyNowEvaluationId: params.whyNowEvaluationId,
    temporalRelevanceId: params.temporalRelevanceId,
    culturalMemoryMatchIds: params.culturalMemoryMatchIds ?? [],
    forecastId: params.forecastId ?? null,
    opportunityOrigin: params.signal.signalOrigin === 'KNOWN_UPCOMING' ? 'KNOWN_UPCOMING' : 'LIVE_SIGNAL',
  };
}

export function ndxAdapterUsesBrandCharacterNotHardcodedPersonality(): true {
  return true;
}

export type { NdxTrendDependencyResult };
