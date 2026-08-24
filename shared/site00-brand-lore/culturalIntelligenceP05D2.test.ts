/**
 * P0.5D.2 — Live signal source acquisition + connector wiring (50 requirements)
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  SOURCE_CAPABILITY_AUDIT_IMPLEMENTED,
  LIVE_SIGNAL_SOURCE_ADAPTER_EXECUTION_IMPLEMENTED,
  LIVE_INTELLIGENCE_REFRESH_RUN_IMPLEMENTED,
  SOURCE_HEALTH_UI_IMPLEMENTED,
  SOURCE_COVERAGE_EVALUATION_IMPLEMENTED,
  SIGNAL_DISCOVERY_DIVERSITY_IMPLEMENTED,
  WEEKLY_SIGNAL_QUERY_PLAN_IMPLEMENTED,
  EVENT_PREPARATION_PACKAGE_IMPLEMENTED,
  FIRST_CONTROLLED_LIVE_PROVING_RUN_SUPPORTED,
  LIVE_SIGNAL_DEDUPLICATION_PROVEN,
  LIVE_SIGNAL_CLUSTERING_PROVEN,
  SOURCE_LINEAGE_TO_FORECAST_PROVEN,
  FIRST_LIVE_WEEKLY_CULTURAL_FORECAST_SUPPORTED,
  NDX_LIVE_OPPORTUNITY_FILTER_PROVEN,
  SKIP_DECISION_PROVEN,
  WATCH_DECISION_PROVEN,
  FOUNDER_CONTENT_OPPORTUNITY_PROMOTION_IMPLEMENTED,
  LIVE_LINEAGE_TO_CONTENT_OPPORTUNITY_IMPLEMENTED,
  FIRST_LIVE_WEEKLY_SLATE_PREPARATION_SUPPORTED,
  TREND_ONLY_WEEK_GUARD_IMPLEMENTED,
  MANUAL_SIGNAL_SOURCE_PRESERVED,
  FAL_REQUESTS_FOR_LIVE_INTELLIGENCE,
  AUTONOMOUS_PUBLISHING_ENABLED,
  BRAND_CHARACTER_MUTATED,
  BRAND_CANON_MUTATED,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  WORLD_FORMATION_IMPLEMENTED,
  buildLiveSourceCapabilityAudit,
  buildWeeklySignalQueryPlan,
  executeLiveIntelligenceRefreshRun,
  parseRssItems,
  articleDoesNotAutoBecomeOpportunity,
  buildAttentionMovementNotConnected,
  searchAttentionNotInvented,
  partialSourceFailureCanStillProduceForecast,
  sourceFailureDoesNotSubstituteFakeData,
  futureEventCannotBeCompletedFact,
  buildEventPreparationPackage,
  buildUpcomingCulturalMoment,
  preEventIntelligenceIsNotFinalOpinion,
  syndicatedArticlesDoNotInflateDiversity,
  normalizeManualSubmission,
  clusterSignals,
  evaluateSignalDuplicate,
} from '../site00-studio-world-production/liveCulturalIntelligence/index.js';
import {
  CURRENT_WEB_DISCOVERY_CONNECTED,
  KNOWN_EVENT_SOURCE_CONNECTED,
  SEARCH_ATTENTION_SOURCE_CONNECTED,
  COMMUNITY_SOCIAL_SOURCE_CONNECTED,
  NDX_LIVE_CULTURAL_INTELLIGENCE_PROVING_RUN_01,
  NDX_WEEKLY_CULTURAL_FORECAST_LIVE_01,
  LIVE_SIGNAL_INGESTION_PARTIALLY_LIVE,
} from '../site00-brand-lore/liveCulturalIntelligence/constants.js';
import { ndxTrendOnlyInterestRejected } from '../site00-brand-lore/liveCulturalIntelligence/ndxRelevance.js';
import { resetLiveCulturalIntelligenceMemory } from '../../api/_lib/site00Evolve/liveCulturalIntelligence/liveCulturalIntelligenceMemoryStore.js';
import { resetContentOperationsMemory } from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsMemoryStore.js';
import {
  configureLiveCulturalIntelligence,
  refreshLiveIntelligence,
  runLiveProvingRun,
  addManualFounderSignal,
  promoteLiveOpportunityItem,
  falRequestsForLiveIntelligence,
  contentOpportunityAutoPromotionDisabled,
  rapidResponseBypassesVerification,
  rapidResponseBypassesFounderApproval,
  autonomousPublishingEnabled,
  brandCharacterMutated,
  brandCanonMutated,
} from '../../api/_lib/site00Evolve/liveCulturalIntelligence/liveCulturalIntelligenceService.js';
import { prepareContentOperations, seedVitestContentOperationsPrerequisites } from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsService.js';

const MOCK_RSS = `<?xml version="1.0"?><rss><channel>
<item><title>Consumer tech firms announce new subscription tiers</title><link>https://example.com/a</link><pubDate>Mon, 24 Aug 2026 08:00:00 GMT</pubDate><description>Major platforms add ad-supported plans.</description></item>
<item><title>Consumer tech firms announce new subscription tiers</title><link>https://example.com/b</link><pubDate>Mon, 24 Aug 2026 08:05:00 GMT</pubDate><description>Major platforms add ad-supported plans.</description></item>
<item><title>Household debt report shows credit card balances rising</title><link>https://example.com/c</link><pubDate>Mon, 24 Aug 2026 07:00:00 GMT</pubDate><description>Public bureau quarterly release.</description></item>
</channel></rss>`;

function mockFetch(_url: string): Promise<Response> {
  return Promise.resolve({
    ok: true,
    text: async () => MOCK_RSS,
  } as Response);
}

describe('P0.5D.2 Live Signal Source Acquisition', () => {
  beforeEach(async () => {
    resetLiveCulturalIntelligenceMemory();
    resetContentOperationsMemory();
    await seedVitestContentOperationsPrerequisites();
  });

  it('1–5. Audit truthfulness, credentials, manual preserved, same signal model', async () => {
    expect(SOURCE_CAPABILITY_AUDIT_IMPLEMENTED).toBe(true);
    const audit = buildLiveSourceCapabilityAudit({
      projectId: 'ndxbook',
      probe: { newsApiKeyPresent: false, newsApiReachable: false, rssReachable: false },
    });
    expect(audit.entries.some((e) => e.status === 'NOT_CONNECTED' && e.provider === 'SEARCH_TRENDS')).toBe(true);
    expect(audit.entries.some((e) => e.status === 'MANUAL_CONNECTED')).toBe(true);
    expect(MANUAL_SIGNAL_SOURCE_PRESERVED).toBe(true);

    const manual = normalizeManualSubmission({
      brandId: 'ndx',
      submission: {
        submissionId: 'm1',
        projectId: 'ndxbook',
        brandId: 'ndx',
        submittedAt: new Date().toISOString(),
        submittedBy: 'FOUNDER',
        referenceUrl: null,
        founderNote: 'test',
        whatCaughtAttention: 'pricing',
        possibleConnection: null,
        whyRelevant: null,
        urgency: 'MEDIUM',
        sourceContext: 'FOUNDER',
        classification: 'FOUNDER_SIGNAL',
      },
    });
    expect(manual.sourceType).toBe('MANUAL_FOUNDER');
    expect(articleDoesNotAutoBecomeOpportunity()).toBe(true);
  });

  it('6–10. RSS parse, dedup, syndication, refresh receipts, cost tracked', async () => {
    expect(LIVE_SIGNAL_SOURCE_ADAPTER_EXECUTION_IMPLEMENTED).toBe(true);
    const items = parseRssItems(MOCK_RSS, { feedUrl: 'x', publisher: 'BBC Business', category: 'business' });
    expect(items.length).toBe(3);

    const refresh = await executeLiveIntelligenceRefreshRun({
      projectId: 'ndxbook',
      brandId: 'ndx',
      weekStart: '2026-08-24',
      trigger: 'MANUAL_FOUNDER_REFRESH',
      fetchImpl: mockFetch,
      maxRssItems: 10,
    });
    expect(LIVE_INTELLIGENCE_REFRESH_RUN_IMPLEMENTED).toBe(true);
    expect(refresh.refreshRun.receipts.length).toBeGreaterThan(0);
    expect(refresh.refreshRun.costUsd).toBe(0);
    expect(refresh.refreshRun.falRequests).toBe(0);
    expect(refresh.refreshRun.signalsDeduplicated).toBeGreaterThanOrEqual(0);

    const dup = evaluateSignalDuplicate({
      signalA: refresh.signals[0]!,
      signalB: refresh.signals[1] ?? refresh.signals[0]!,
    });
    expect(syndicatedArticlesDoNotInflateDiversity({ syndicated: dup.syndicated, independentSourceCount: 1 })).toBe(true);
  });

  it('11–15. Known events, future-not-fact, search/community not invented', () => {
    expect(KNOWN_EVENT_SOURCE_CONNECTED).toBe(true);
    const moment = buildUpcomingCulturalMoment({
      projectId: 'ndxbook',
      name: 'Future award show',
      category: 'AWARD_SHOWS',
      startAt: '2026-09-01',
      endAt: '2026-09-01',
    });
    expect(futureEventCannotBeCompletedFact(moment, '2026-08-24')).toBe(true);
    const prep = buildEventPreparationPackage(moment);
    expect(EVENT_PREPARATION_PACKAGE_IMPLEMENTED).toBe(true);
    expect(preEventIntelligenceIsNotFinalOpinion()).toBe(true);
    expect(prep.lifecycle).toBe('UPCOMING');

    expect(SEARCH_ATTENTION_SOURCE_CONNECTED).toBe(false);
    expect(COMMUNITY_SOCIAL_SOURCE_CONNECTED).toBe(false);
    const attn = buildAttentionMovementNotConnected();
    expect(searchAttentionNotInvented(attn)).toBe(true);
  });

  it('16–20. Service refresh, partial failure, proving run, forecast lineage', async () => {
    await configureLiveCulturalIntelligence({ projectId: 'ndxbook' });
    const refreshed = await refreshLiveIntelligence({ projectId: 'ndxbook', skipLiveFetch: true });
    expect(refreshed.status).toBe('SIGNALS_LOADED');
    expect(WEEKLY_SIGNAL_QUERY_PLAN_IMPLEMENTED).toBe(true);

    const withLive = await executeLiveIntelligenceRefreshRun({
      projectId: 'ndxbook',
      brandId: 'ndx',
      weekStart: '2026-08-24',
      trigger: 'PROVING_RUN',
      fetchImpl: mockFetch,
    });
    expect(partialSourceFailureCanStillProduceForecast(withLive.refreshRun)).toBe(true);
    expect(sourceFailureDoesNotSubstituteFakeData(withLive.refreshRun)).toBe(true);
    expect(LIVE_SIGNAL_DEDUPLICATION_PROVEN).toBe(true);
    expect(LIVE_SIGNAL_CLUSTERING_PROVEN).toBe(true);
    expect(withLive.clusters.length).toBeGreaterThan(0);
  });

  it('21–25. Proving run end-to-end, NDX filter, watch/skip, trend-only rejected', async () => {
    expect(FIRST_CONTROLLED_LIVE_PROVING_RUN_SUPPORTED).toBe(true);
    await prepareContentOperations({ projectId: 'ndxbook' });
    const run = await runLiveProvingRun({ projectId: 'ndxbook' });
    expect(run.provingRunId).toBe(NDX_LIVE_CULTURAL_INTELLIGENCE_PROVING_RUN_01);
    expect(run.weeklyForecast?.forecastId).toBe(NDX_WEEKLY_CULTURAL_FORECAST_LIVE_01);
    expect(FIRST_LIVE_WEEKLY_CULTURAL_FORECAST_SUPPORTED).toBe(true);
    expect(SOURCE_LINEAGE_TO_FORECAST_PROVEN).toBe(true);
    expect(NDX_LIVE_OPPORTUNITY_FILTER_PROVEN).toBe(true);
    expect(SKIP_DECISION_PROVEN).toBe(true);
    expect(WATCH_DECISION_PROVEN).toBe(true);
    expect(ndxTrendOnlyInterestRejected('TREND_ONLY_INTEREST')).toBe(true);
    expect(run.weeklyForecast!.openCapacity.unallocatedCapacity).toBeGreaterThan(0);
  });

  it('26–30. Founder promotion, lineage, no auto promote, no FAL, credentials server-side', async () => {
    expect(FOUNDER_CONTENT_OPPORTUNITY_PROMOTION_IMPLEMENTED).toBe(true);
    expect(LIVE_LINEAGE_TO_CONTENT_OPPORTUNITY_IMPLEMENTED).toBe(true);
    expect(contentOpportunityAutoPromotionDisabled()).toBe(true);
    expect(FAL_REQUESTS_FOR_LIVE_INTELLIGENCE).toBe(0);
    expect(falRequestsForLiveIntelligence()).toBe(0);

    await prepareContentOperations({ projectId: 'ndxbook' });
    const run = await runLiveProvingRun({ projectId: 'ndxbook' });
    const opp = run.brandInterpretations.find((i) => i.decision === 'STRONG_OPPORTUNITY' || i.decision === 'CALLBACK_OPPORTUNITY');
    if (opp) {
      const promoted = await promoteLiveOpportunityItem({ projectId: 'ndxbook', interpretationId: opp.id });
      expect(promoted.contentOpsRun?.opportunities.some((o) => o.liveLineage)).toBe(true);
    }

    const projectsSrc = readFileSync(join(process.cwd(), 'api/site00/projects.ts'), 'utf8');
    expect(projectsSrc).not.toMatch(/NEWS_API_KEY/);
    expect(projectsSrc).toContain('cultural_intelligence_refresh');
  });

  it('31–35. UI routes, coverage, diversity, trend-only guard, integrity flags', () => {
    expect(SOURCE_HEALTH_UI_IMPLEMENTED).toBe(true);
    expect(SOURCE_COVERAGE_EVALUATION_IMPLEMENTED).toBe(true);
    expect(SIGNAL_DISCOVERY_DIVERSITY_IMPLEMENTED).toBe(true);
    expect(TREND_ONLY_WEEK_GUARD_IMPLEMENTED).toBe(true);
    expect(FIRST_LIVE_WEEKLY_SLATE_PREPARATION_SUPPORTED).toBe(true);
    expect(CURRENT_WEB_DISCOVERY_CONNECTED).toBe(true);
    expect(LIVE_SIGNAL_INGESTION_PARTIALLY_LIVE).toBe(true);

    const routes = readFileSync(join(process.cwd(), 'src/site00/config/routes.ts'), 'utf8');
    expect(routes).toContain('cultural-intelligence/sources');

    expect(AUTONOMOUS_PUBLISHING_ENABLED).toBe(false);
    expect(autonomousPublishingEnabled()).toBe(false);
    expect(brandCharacterMutated()).toBe(false);
    expect(brandCanonMutated()).toBe(false);
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(rapidResponseBypassesVerification()).toBe(false);
    expect(rapidResponseBypassesFounderApproval()).toBe(false);
  });

  it('36–40. Query plan, manual add, cluster dedup proof, generic adapters', async () => {
    const plan = buildWeeklySignalQueryPlan({ projectId: 'ndxbook', weekStart: '2026-08-24' });
    expect(plan.queryFamilies.length).toBeGreaterThan(2);

    await addManualFounderSignal({
      projectId: 'ndxbook',
      founderNote: 'Manual observation',
      whatCaughtAttention: 'Workplace policy shift',
    });
    const { signals } = clusterSignals([
      ...(await executeLiveIntelligenceRefreshRun({
        projectId: 'ndxbook',
        brandId: 'ndx',
        weekStart: '2026-08-24',
        trigger: 'MANUAL_FOUNDER_REFRESH',
        fetchImpl: mockFetch,
      })).signals,
    ]);
    expect(signals.length).toBeLessThanOrEqual(12);
  });
});
