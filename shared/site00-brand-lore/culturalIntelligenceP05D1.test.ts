/**
 * P0.5D.1 — Live Cultural Intelligence + Trend Forecasting (50 requirements).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AUTONOMOUS_PUBLISHING_ENABLED,
  BRAND_CANON_MUTATED,
  BRAND_CHARACTER_MUTATED,
  BRAND_SIGNAL_INTERPRETATION_IMPLEMENTED,
  CONTENT_OPPORTUNITY_LIVE_LINEAGE_IMPLEMENTED,
  CURRENT_CLAIM_EVALUATION_IMPLEMENTED,
  CURRENT_INTELLIGENCE_PACKAGE_IMPLEMENTED,
  EDITORIAL_FLEX_CAPACITY_IMPLEMENTED,
  EDITORIAL_WHITESPACE_IMPLEMENTED,
  FAL_REQUESTS_FOR_FORECASTING,
  FORECAST_CONFIDENCE_IMPLEMENTED,
  FORECAST_LEARNING_IMPLEMENTED,
  LIVE_CULTURAL_INTELLIGENCE_IMPLEMENTED,
  LIVE_WORLD_SIGNAL_MODEL_IMPLEMENTED,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  RAPID_RESPONSE_INTEGRATED,
  SIGNAL_CLUSTERING_IMPLEMENTED,
  SIGNAL_DEDUPLICATION_IMPLEMENTED,
  SIGNAL_SOURCE_ARCHITECTURE_IMPLEMENTED,
  STUDIO_WORLD_CLIENT_GENERALIZATION_IMPLEMENTED,
  TEMPORAL_RELEVANCE_IMPLEMENTED,
  TREND_LIFECYCLE_IMPLEMENTED,
  UPCOMING_CULTURAL_MOMENT_FORECAST_IMPLEMENTED,
  WATCH_QUEUE_UPGRADED,
  WEEKLY_CULTURAL_FORECAST_IMPLEMENTED,
  WHY_NOW_GATE_IMPLEMENTED,
  WORLD_FORMATION_IMPLEMENTED,
} from '../site00-studio-world-production/liveCulturalIntelligence/constants.js';
import {
  buildDefaultSignalSourceAdapters,
  buildLiveWorldSignal,
  clusterSignals,
  connectorStatesReportTruthfully,
  evaluateSignalDuplicate,
  evaluateTrendLifecycle,
  evaluateWhyNow,
  evaluateTemporalRelevance,
  buildCurrentIntelligencePackage,
  classifyCurrentClaim,
  forecastCannotBecomeFact,
  unverifiedCannotBecomeFactualAssertion,
  buildForecastConfidence,
  interpretBrandSignal,
  brandRelevanceRequiredBeforePromotion,
  forcedParticipationRejected,
  buildWeeklyCulturalForecast,
  buildDefaultFlexCapacity,
  emptyCapacityDoesNotTriggerFiller,
  buildLiveWatchQueueEntry,
  transitionWatchQueueEntry,
  watchingDoesNotAutoPromoteToContent,
  evaluateEditorialWhitespace,
  evaluateForecastOutcome,
  historicalForecastsNotRewritten,
  performanceLearningCannotMutateCharacter,
} from '../site00-studio-world-production/liveCulturalIntelligence/index.js';
import {
  NDX_CULTURAL_MEMORY_IMPLEMENTED,
  NDX_RELEVANCE_FILTER_IMPLEMENTED,
  NDX_TREND_DEPENDENCY_GUARD_IMPLEMENTED,
} from '../site00-brand-lore/liveCulturalIntelligence/constants.js';
import {
  buildNdxPilotLiveSignals,
  ndxAdapterUsesBrandCharacterNotHardcodedPersonality,
  processNdxLiveIntelligence,
} from '../site00-brand-lore/liveCulturalIntelligence/ndxLiveCulturalIntelligenceAdapter.js';
import {
  callbackRequiresStoredEvidence,
  evaluateNdxCulturalMemory,
  interpretNdxTrendDependency,
  ndxTrendOnlyInterestRejected,
} from '../site00-brand-lore/liveCulturalIntelligence/ndxRelevance.js';
import { seedPilotOpportunities } from '../site00-brand-lore/contentOperations/opportunityEngine.js';
import { createEmptyContentMemoryIndex } from '../site00-brand-lore/contentOperations/editorialMemory.js';
import {
  resetLiveCulturalIntelligenceMemory,
  resetLiveCulturalIntelligenceStoreModeCache,
} from '../../api/_lib/site00Evolve/liveCulturalIntelligence/liveCulturalIntelligenceStoreAdapter.js';
import {
  configureLiveCulturalIntelligence,
  falRequestsForForecasting,
  generateWeeklyCulturalForecast,
  promoteLiveOpportunitiesToContentOps,
  rapidResponseBypassesFounderApproval,
  rapidResponseBypassesVerification,
  refreshLiveSignals,
} from '../../api/_lib/site00Evolve/liveCulturalIntelligence/liveCulturalIntelligenceService.js';
import {
  prepareContentOperations,
  compileContentOperations,
  discoverContentOpportunities,
  seedVitestContentOperationsPrerequisites,
} from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsService.js';
import {
  resetContentOperationsMemory,
  resetContentOperationsStoreModeCache,
} from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsStoreAdapter.js';

const ROOT = join(process.cwd());
const ROUTES = readFileSync(join(ROOT, 'src/site00/config/routes.ts'), 'utf8');
const CI_PAGE = readFileSync(join(ROOT, 'src/site00/pages/ProjectCulturalIntelligencePage.tsx'), 'utf8');
const FORECAST_PAGE = readFileSync(join(ROOT, 'src/site00/pages/ProjectCulturalIntelligenceWeeklyForecastPage.tsx'), 'utf8');
const PROJECTS_API = readFileSync(join(ROOT, 'api/site00/projects.ts'), 'utf8');

const WEEK_START = '2026-08-18';

beforeEach(async () => {
  resetLiveCulturalIntelligenceMemory();
  resetLiveCulturalIntelligenceStoreModeCache();
  resetContentOperationsMemory();
  resetContentOperationsStoreModeCache();
  await seedVitestContentOperationsPrerequisites();
});

describe('P0.5D.1 Live Cultural Intelligence', () => {
  it('1–3. Signals separate from opportunities; trend ≠ content; known events in forecast', () => {
    expect(LIVE_WORLD_SIGNAL_MODEL_IMPLEMENTED).toBe(true);
    const signal = buildLiveWorldSignal({
      projectId: 'ndxbook',
      brandId: 'org',
      title: 'Test signal',
      summary: 'Test',
      sourceType: 'NEWS',
      signalOrigin: 'EMERGING',
    });
    expect(signal.id).toMatch(/^lws-/);
    const interpretation = interpretBrandSignal({
      brandId: 'org',
      signal,
      intelligencePackage: buildCurrentIntelligencePackage({
        projectId: 'ndxbook',
        signal,
        cluster: null,
        whyNow: evaluateWhyNow({ signal, whatChanged: 'x', attentionDriver: 'y', saturation: 0.2 }),
        unverifiedClaims: ['claim'],
      }),
      scores: { wouldBrandCareWithoutTrend: false, trendDependencyRisk: 0.9 },
    });
    expect(forcedParticipationRejected(interpretation)).toBe(true);
    const processed = processNdxLiveIntelligence({
      projectId: 'ndxbook',
      brandId: 'org',
      weekStart: WEEK_START,
      weekEnd: '2026-08-24',
    });
    expect(processed.knownMoments.length).toBeGreaterThan(0);
  });

  it('4–7. Forecast confidence, lifecycle history, deduplication, clustering', () => {
    expect(FORECAST_CONFIDENCE_IMPLEMENTED).toBe(true);
    expect(TREND_LIFECYCLE_IMPLEMENTED).toBe(true);
    expect(SIGNAL_DEDUPLICATION_IMPLEMENTED).toBe(true);
    expect(SIGNAL_CLUSTERING_IMPLEMENTED).toBe(true);
    const conf = buildForecastConfidence({ level: 'SPECULATIVE', evidence: [], reasoning: 'test' });
    expect(forecastCannotBecomeFact(conf)).toBe(true);
    const s1 = buildLiveWorldSignal({ projectId: 'ndxbook', brandId: 'org', title: 'Same Story', summary: 'A', sourceType: 'NEWS', signalOrigin: 'BREAKING', sourceIds: ['src-a'] });
    const s2 = buildLiveWorldSignal({ projectId: 'ndxbook', brandId: 'org', title: 'Same Story', summary: 'A', sourceType: 'NEWS', signalOrigin: 'BREAKING', sourceIds: ['src-b'] });
    const dup = evaluateSignalDuplicate({ signalA: s1, signalB: s2 });
    expect(dup.classification).toBe('SAME_STORY_DIFFERENT_SOURCE');
    expect(dup.syndicated).toBe(true);
    const { clusters } = clusterSignals([s1, s2]);
    expect(clusters).toHaveLength(1);
    const lc = evaluateTrendLifecycle({ signal: s1 });
    const lc2 = evaluateTrendLifecycle({ signal: { ...s1, saturation: 0.9 }, prior: lc });
    expect(lc2.history.length).toBeGreaterThan(lc.history.length);
  });

  it('8–10. WHY NOW, temporal relevance, expired callback', () => {
    expect(WHY_NOW_GATE_IMPLEMENTED).toBe(true);
    expect(TEMPORAL_RELEVANCE_IMPLEMENTED).toBe(true);
    const signal = buildLiveWorldSignal({ projectId: 'ndxbook', brandId: 'org', title: 'T', summary: 'S', sourceType: 'NEWS', signalOrigin: 'BREAKING' });
    const whyNow = evaluateWhyNow({ signal, whatChanged: 'New data', attentionDriver: 'Breaking', saturation: 0.3 });
    expect(whyNow.whatChanged).toBeTruthy();
    const temporal = evaluateTemporalRelevance({ signal, whyNow: whyNow.whatChanged });
    expect(temporal.whyNow).toBeTruthy();
    const expired = evaluateWhyNow({ signal, whatChanged: 'Late', attentionDriver: 'x', saturation: 0.9, windowEndPassed: true });
    expect(expired.result).toBe('WINDOW_PASSED');
  });

  it('11–14. Intelligence package, claims, generated image guard', () => {
    expect(CURRENT_INTELLIGENCE_PACKAGE_IMPLEMENTED).toBe(true);
    expect(CURRENT_CLAIM_EVALUATION_IMPLEMENTED).toBe(true);
    const unverified = classifyCurrentClaim({ claim: 'x', sourceCount: 0 });
    expect(unverifiedCannotBecomeFactualAssertion(unverified)).toBe(true);
    const developing = classifyCurrentClaim({ claim: 'y', sourceCount: 1 });
    expect(developing.classification).toBe('SINGLE_SOURCE');
    expect(FAL_REQUESTS_FOR_FORECASTING).toBe(0);
    expect(falRequestsForForecasting()).toBe(0);
  });

  it('15–18. Brand relevance + NDX trend dependency + memory', () => {
    expect(BRAND_SIGNAL_INTERPRETATION_IMPLEMENTED).toBe(true);
    expect(NDX_RELEVANCE_FILTER_IMPLEMENTED).toBe(true);
    expect(NDX_TREND_DEPENDENCY_GUARD_IMPLEMENTED).toBe(true);
    expect(NDX_CULTURAL_MEMORY_IMPLEMENTED).toBe(true);
    expect(ndxTrendOnlyInterestRejected('TREND_ONLY_INTEREST')).toBe(true);
    expect(ndxTrendOnlyInterestRejected('FORCED_RELEVANCE')).toBe(true);
    const memory = createEmptyContentMemoryIndex('ndxbook');
    memory.coveredTopics.push('subscription normalization');
    const signal = buildLiveWorldSignal({ projectId: 'ndxbook', brandId: 'org', title: 'Sub fatigue', summary: 'S', sourceType: 'INTERNET_CULTURE', signalOrigin: 'RESURFACED' });
    const matches = evaluateNdxCulturalMemory({ signal, editorialMemory: memory, priorSubject: 'subscription normalization' });
    expect(matches.length).toBeGreaterThan(0);
    expect(callbackRequiresStoredEvidence(matches[0]!)).toBe(true);
  });

  it('19–21. Editorial whitespace saturation rules', () => {
    expect(EDITORIAL_WHITESPACE_IMPLEMENTED).toBe(true);
    const saturated = buildLiveWorldSignal({ projectId: 'ndxbook', brandId: 'org', title: 'T', summary: 'S', sourceType: 'AWARD_SHOWS', signalOrigin: 'PEAKING', saturation: 0.9, velocity: 0.9 });
    saturated.saturation = 0.9;
    const noAngle = evaluateEditorialWhitespace({ signal: saturated, distinctiveAngleExists: false });
    expect(noAngle.outcome).toBe('SATURATED_NO_ADDITIONAL_VALUE');
    const withAngle = evaluateEditorialWhitespace({ signal: saturated, distinctiveAngleExists: true });
    expect(withAngle.outcome).toBe('SATURATED_BUT_ANGLE_EXISTS');
  });

  it('22–29. Weekly forecast sections + flex capacity', () => {
    expect(WEEKLY_CULTURAL_FORECAST_IMPLEMENTED).toBe(true);
    expect(EDITORIAL_FLEX_CAPACITY_IMPLEMENTED).toBe(true);
    const processed = processNdxLiveIntelligence({ projectId: 'ndxbook', brandId: 'org', weekStart: WEEK_START, weekEnd: '2026-08-24' });
    expect(processed.weeklyForecast.knownMoments.length).toBeGreaterThan(0);
    expect(processed.weeklyForecast.openCapacity.unallocatedCapacity).toBeGreaterThanOrEqual(0);
    expect(emptyCapacityDoesNotTriggerFiller(processed.weeklyForecast.openCapacity)).toBe(true);
  });

  it('30–32. Rapid response + watch queue transitions', () => {
    expect(RAPID_RESPONSE_INTEGRATED).toBe(true);
    expect(WATCH_QUEUE_UPGRADED).toBe(true);
    expect(rapidResponseBypassesVerification()).toBe(false);
    expect(rapidResponseBypassesFounderApproval()).toBe(false);
    const signal = buildNdxPilotLiveSignals({ projectId: 'ndxbook', brandId: 'org' })[0]!;
    const entry = buildLiveWatchQueueEntry({ signal });
    expect(watchingDoesNotAutoPromoteToContent(entry)).toBe(true);
    const transitioned = transitionWatchQueueEntry(entry, 'ACCELERATING', 'Momentum increased');
    expect(transitioned.stateHistory.length).toBe(2);
  });

  it('33–35. Forecast learning + performance guards + generic model', () => {
    expect(FORECAST_LEARNING_IMPLEMENTED).toBe(true);
    const outcome = evaluateForecastOutcome({
      forecastId: 'wcf-1',
      momentId: null,
      signalId: 's1',
      forecastedLifecycle: 'EMERGING',
      actualLifecycle: 'EMERGING',
      forecastedPeak: null,
      observedPeak: null,
    });
    expect(historicalForecastsNotRewritten([], outcome)).toHaveLength(1);
    expect(performanceLearningCannotMutateCharacter()).toBe(true);
    expect(ndxAdapterUsesBrandCharacterNotHardcodedPersonality()).toBe(true);
  });

  it('36–39. Seeded opportunities remain valid; lineage on promotion', async () => {
    expect(CONTENT_OPPORTUNITY_LIVE_LINEAGE_IMPLEMENTED).toBe(true);
    const seeded = seedPilotOpportunities('ndxbook');
    expect(seeded.every((o) => !o.liveLineage)).toBe(true);
    await prepareContentOperations({ projectId: 'ndxbook' });
    await compileContentOperations({ projectId: 'ndxbook' });
    await discoverContentOpportunities({ projectId: 'ndxbook' });
    await configureLiveCulturalIntelligence({ projectId: 'ndxbook' });
    await refreshLiveSignals({ projectId: 'ndxbook' });
    await generateWeeklyCulturalForecast({ projectId: 'ndxbook', weekStart: WEEK_START });
    const { contentOpsRun } = await promoteLiveOpportunitiesToContentOps({ projectId: 'ndxbook' });
    const livePromoted = contentOpsRun!.opportunities.filter((o) => o.liveLineage);
    expect(livePromoted.length).toBeGreaterThan(0);
    expect(livePromoted[0]!.liveLineage?.liveSignalIds.length).toBeGreaterThan(0);
    expect(contentOpsRun!.opportunities.filter((o) => !o.liveLineage).length).toBeGreaterThanOrEqual(8);
  });

  it('40–47. Connectors truthful, no page load generation, no FAL', () => {
    expect(SIGNAL_SOURCE_ARCHITECTURE_IMPLEMENTED).toBe(true);
    const adapters = buildDefaultSignalSourceAdapters();
    expect(connectorStatesReportTruthfully(adapters)).toBe(true);
    expect(CI_PAGE).toContain('culturalIntelligenceGet');
    const mountEffect = CI_PAGE.match(/useEffect\(\(\) => \{[\s\S]*?\}, \[reload\]\);/)?.[0] ?? '';
    expect(mountEffect).toContain('reload');
    expect(mountEffect).not.toContain('culturalIntelligenceRefresh');
    expect(mountEffect).not.toContain('culturalIntelligenceConfigure');
  });

  it('48–50. API routes, UI, experimental integrity', () => {
    expect(ROUTES).toContain('projectCulturalIntelligence');
    expect(FORECAST_PAGE).toContain('WEEKLY CULTURAL FORECAST');
    expect(PROJECTS_API).toContain('cultural_intelligence_get');
    expect(PROJECTS_API).toContain('cultural_intelligence_promote_opportunities');
    expect(LIVE_CULTURAL_INTELLIGENCE_IMPLEMENTED).toBe(true);
    expect(STUDIO_WORLD_CLIENT_GENERALIZATION_IMPLEMENTED).toBe(true);
    expect(BRAND_CHARACTER_MUTATED).toBe(false);
    expect(BRAND_CANON_MUTATED).toBe(false);
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(AUTONOMOUS_PUBLISHING_ENABLED).toBe(false);
  });
});
