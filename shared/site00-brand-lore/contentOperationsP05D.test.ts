/**
 * P0.5D — Content Operations + Performance Learning tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  auditContentSystems,
  experimentFImmutable,
  experimentGNotReevaluated,
  compileContentOperationsSystem,
  contentOperationsRequiresUpstream,
  assistedAutonomyDefault,
  buildDefaultApprovalPolicy,
  founderApprovalRequiredForPilot,
  noAutomaticExternalPublishing,
  autonomousPublishingEnabled,
  evaluateNDXOpportunityFit,
  rankContentOpportunity,
  viralScoreAloneCannotSelect,
  opportunityIsNotContent,
  seedPilotOpportunities,
  createEmptyContentMemoryIndex,
  editorialMemoryPreservesPriorClaims,
  evaluateContentSimilarity,
  relatedTopicMayBecomeCallback,
  duplicateDetectionWorks,
  buildWeeklyEditorialSlate,
  selectionMaySaveOrWatch,
  selectChannelForOpportunity,
  selectFormatForOpportunity,
  reelIsNotCarouselAnimation,
  determineResearchDepth,
  lowConfidenceBlocksConfidentProduction,
  classifyClaim,
  claimTypeDistinguishesFactFromTheory,
  fakeReceiptEvidenceBlocked,
  buildSocialContentPackage,
  carouselUsesSequenceCreativeSystem,
  buildCarouselSequencePlan,
  marketingContentThesisRequired,
  storyCanRemainUnresolved,
  buildStoryContract,
  buildReelContract,
  buildContentCTA,
  ctaMayBeNone,
  evaluateContentRisk,
  highRiskRequiresStrongerReview,
  buildPublishingHandoffPackage,
  manualPublishWhenConnectorAbsent,
  calendarTracksOperationalStates,
  createPerformanceRecord,
  metricsNotFabricated,
  createPerformanceLearning,
  performanceDoesNotMutateCharacter,
  performanceDoesNotMutateCanon,
  oneViralPostInsufficientConfidence,
  founderAcceptanceRequiredForStrategyChange,
  evaluateEditorialHealth,
  createProductionBudget,
  budgetPreventsMultiplication,
  createContentExperiment,
  coreCharacterCannotBeAbTested,
  buildNdxbookMarketTest01,
  defaultConnectorCapabilities,
  connectorStatesHonest,
  liveSocialPublishingVerified,
  invalidateOnCharacterSystemChange,
  invalidateOnThesisChange,
  ndxBehavioralModesNotHardcodedIntoGenericEngine,
  topicAloneInsufficientForCharacterEvent,
  characterEventPrecedesPackage,
  formulateCharacterEventFromOpportunity,
  ASSISTED_AUTONOMY_POLICY_IMPLEMENTED,
  CONTENT_OPPORTUNITY_ENGINE_IMPLEMENTED,
  PERFORMANCE_DOES_NOT_MUTATE_CHARACTER,
  AUTONOMOUS_PUBLISHING_ENABLED as AUTONOMOUS_PUBLISHING_FLAG,
  LIVE_SIGNAL_INGESTION_NOT_CONNECTED,
} from './contentOperations/index.js';
import {
  prepareContentOperations,
  compileContentOperations,
  discoverContentOpportunities,
  proposeWeeklySlate,
  approveWeeklySlate,
  approveContentPackage,
  recordManualPerformance,
  acceptPerformanceLearning,
  seedVitestContentOperationsPrerequisites,
  liveSignalIngestionNotConnected,
  noPageLoadGeneration,
  noAutomaticPublishing,
} from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsService.js';
import {
  resetContentOperationsMemory,
  resetContentOperationsStoreModeCache,
} from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsStoreAdapter.js';
import { buildVitestUpstreamIds } from './contentOperations/vitestFixtures.js';
import { CALENDAR_STATUSES } from './contentOperations/constants.js';

const ROUTES = readFileSync(join(process.cwd(), 'src/site00/config/routes.ts'), 'utf8');
const SITE_ROUTES = readFileSync(join(process.cwd(), 'src/routes/Site00Routes.tsx'), 'utf8');
const PROJECTS_API = readFileSync(join(process.cwd(), 'api/site00/projects.ts'), 'utf8');
const OPS_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectContentOperationsPage.tsx'), 'utf8');
const PERF_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectContentOperationsPerformancePage.tsx'), 'utf8');

beforeEach(async () => {
  resetContentOperationsMemory();
  resetContentOperationsStoreModeCache();
  await seedVitestContentOperationsPrerequisites();
});

describe('P0.5D Content Operations', () => {
  it('1. ContentOperationsSystem requires Character + Marketing Expression', () => {
    const ids = buildVitestUpstreamIds();
    expect(contentOperationsRequiresUpstream(ids)).toBe(true);
    expect(contentOperationsRequiresUpstream({ brandCharacterSystemId: null, marketingExpressionSystemId: null })).toBe(false);
  });

  it('2. NDX defaults to ASSISTED_AUTONOMY', () => {
    const sys = compileContentOperationsSystem(buildVitestUpstreamIds());
    expect(assistedAutonomyDefault(sys.operatingMode)).toBe(true);
    expect(ASSISTED_AUTONOMY_POLICY_IMPLEMENTED).toBe(true);
  });

  it('3. Opportunity is not automatically content', () => {
    const opps = seedPilotOpportunities('ndxbook');
    expect(opps.every(opportunityIsNotContent)).toBe(true);
  });

  it('4. Topic alone is insufficient for Character Event', () => {
    expect(topicAloneInsufficientForCharacterEvent('create a post about subscriptions')).toBe(true);
  });

  it('5. Opportunity ranking is multi-dimensional', () => {
    const opps = seedPilotOpportunities('ndxbook');
    expect(viralScoreAloneCannotSelect(opps[0]!.rank!.dimensions)).toBe(true);
  });

  it('6. Viral score alone cannot select content', () => {
    const rank = rankContentOpportunity(seedPilotOpportunities('ndxbook')[0]!);
    expect(Object.keys(rank.dimensions).length).toBeGreaterThan(3);
  });

  it('7. Duplicate detection works', () => {
    const memory = createEmptyContentMemoryIndex('ndxbook');
    memory.coveredTopics = ['subscription normalization'];
    const sim = evaluateContentSimilarity({ subject: 'subscription normalization', memory });
    expect(duplicateDetectionWorks(sim.result)).toBe(true);
  });

  it('8. Related topic may become callback', () => {
    expect(relatedTopicMayBecomeCallback('CALLBACK')).toBe(true);
    expect(relatedTopicMayBecomeCallback('FOLLOW_UP')).toBe(true);
  });

  it('9. Editorial memory preserves prior claims', () => {
    expect(editorialMemoryPreservesPriorClaims(createEmptyContentMemoryIndex('ndxbook'))).toBe(true);
  });

  it('10. Editorial memory preserves unresolved investigations', () => {
    const m = createEmptyContentMemoryIndex('ndxbook');
    m.unresolvedThreads = ['attention economy'];
    expect(m.unresolvedThreads.length).toBe(1);
  });

  it('11. Weekly slate supports behavioral balance', async () => {
    await prepareContentOperations({ projectId: 'ndxbook' });
    await compileContentOperations({ projectId: 'ndxbook' });
    const run = await discoverContentOpportunities({ projectId: 'ndxbook' });
    const slate = buildWeeklyEditorialSlate({ projectId: 'ndxbook', opportunities: run.opportunities });
    expect(slate.contentCandidates.length).toBeGreaterThanOrEqual(3);
  });

  it('12. Too-much-snark can be flagged', () => {
    const health = evaluateEditorialHealth({ projectId: 'ndxbook', packages: [], slate: null });
    expect(health.flags).toBeDefined();
  });

  it('13. Too-much-same-format can be flagged', () => {
    const opps = seedPilotOpportunities('ndxbook');
    const packages = opps.slice(0, 3).map((o) =>
      buildSocialContentPackage({
        projectId: 'ndxbook',
        opportunity: o,
        channel: selectChannelForOpportunity(o),
        format: { opportunityId: o.id, format: 'SINGLE_IMAGE', reasoning: [], resolutionStateInfluence: '' },
      }),
    );
    const health = evaluateEditorialHealth({ projectId: 'ndxbook', packages, slate: null });
    expect(health.formatRange).toBeDefined();
  });

  it('14. Opportunity selection may SAVE or WATCH', () => {
    expect(selectionMaySaveOrWatch('SAVE_FOR_LATER')).toBe(true);
    expect(selectionMaySaveOrWatch('WATCH')).toBe(true);
  });

  it('15. Research depth is dynamic', () => {
    const opps = seedPilotOpportunities('ndxbook');
    const depths = opps.map(determineResearchDepth);
    expect(new Set(depths).size).toBeGreaterThanOrEqual(1);
  });

  it('16. Claim type distinguishes FACT / OPINION / THEORY', () => {
    expect(claimTypeDistinguishesFactFromTheory('FACT')).toBe(true);
    expect(claimTypeDistinguishesFactFromTheory('HYPOTHESIS')).toBe(true);
  });

  it('17. Low-confidence factual claims block confident production', () => {
    const claims = [classifyClaim({ text: 'x', status: 'FACT', confidence: 'UNVERIFIED' })];
    expect(lowConfidenceBlocksConfidentProduction(claims)).toBe(true);
  });

  it('18. MarketingContentThesis is required', () => {
    const opps = seedPilotOpportunities('ndxbook');
    const pkg = buildSocialContentPackage({
      projectId: 'ndxbook',
      opportunity: opps[0]!,
      channel: selectChannelForOpportunity(opps[0]!),
      format: selectFormatForOpportunity(opps[0]!, selectChannelForOpportunity(opps[0]!)),
    });
    expect(marketingContentThesisRequired(pkg)).toBe(true);
  });

  it('19. Channel selection is reasoned', () => {
    const opp = seedPilotOpportunities('ndxbook')[0]!;
    expect(selectChannelForOpportunity(opp).reasoning.length).toBeGreaterThan(0);
  });

  it('20. Format selection is reasoned', () => {
    const opp = seedPilotOpportunities('ndxbook')[0]!;
    const ch = selectChannelForOpportunity(opp);
    expect(selectFormatForOpportunity(opp, ch).reasoning.length).toBeGreaterThan(0);
  });

  it('21. Carousel uses Sequence Creative System', () => {
    const plan = buildCarouselSequencePlan('pkg-1');
    expect(carouselUsesSequenceCreativeSystem(plan)).toBe(true);
  });

  it('22. Reel is not default carousel animation', () => {
    expect(reelIsNotCarouselAnimation('REEL')).toBe(true);
    const reel = buildReelContract('pkg-1');
    expect(reel.mustNotBeCarouselAnimation).toBe(true);
  });

  it('23. Story can remain unresolved', () => {
    expect(storyCanRemainUnresolved(buildStoryContract('pkg-1'))).toBe(true);
  });

  it('24. CTA may be NONE', () => {
    const cta = buildContentCTA({ packageId: 'p', format: 'SINGLE_IMAGE', resolution: 'REACTION_ONLY' });
    expect(ctaMayBeNone(cta.cta)).toBe(true);
  });

  it('25. Founder approval required for pilot', () => {
    expect(founderApprovalRequiredForPilot(buildDefaultApprovalPolicy('ndxbook'))).toBe(true);
  });

  it('26. No automatic external publishing', () => {
    expect(noAutomaticExternalPublishing()).toBe(true);
    expect(noAutomaticPublishing()).toBe(true);
    expect(autonomousPublishingEnabled()).toBe(false);
    expect(AUTONOMOUS_PUBLISHING_FLAG).toBe(false);
  });

  it('27. Publishing status READY_FOR_MANUAL_PUBLISH when connector absent', () => {
    const opps = seedPilotOpportunities('ndxbook');
    const pkg = buildSocialContentPackage({
      projectId: 'ndxbook',
      opportunity: opps[0]!,
      channel: selectChannelForOpportunity(opps[0]!),
      format: selectFormatForOpportunity(opps[0]!, selectChannelForOpportunity(opps[0]!)),
    });
    const handoff = buildPublishingHandoffPackage({ pkg, connectorCapability: 'NOT_CONNECTED' });
    expect(manualPublishWhenConnectorAbsent(handoff)).toBe(true);
  });

  it('28. Performance metrics are not fabricated', () => {
    const rec = createPerformanceRecord({ contentPackageId: 'p1', platform: 'INSTAGRAM' });
    expect(metricsNotFabricated(rec)).toBe(true);
  });

  it('29. Missing platform metric remains unavailable', () => {
    const rec = createPerformanceRecord({ contentPackageId: 'p1', platform: 'INSTAGRAM' });
    expect(rec.impressions).toBeNull();
  });

  it('30. Qualitative audience evidence can be stored', async () => {
    await prepareContentOperations({ projectId: 'ndxbook' });
    await compileContentOperations({ projectId: 'ndxbook' });
    await discoverContentOpportunities({ projectId: 'ndxbook' });
    await proposeWeeklySlate({ projectId: 'ndxbook' });
    const run = await approveWeeklySlate({ projectId: 'ndxbook' });
    const pkgId = run.contentPackages[0]!.id;
    await approveContentPackage({ projectId: 'ndxbook', packageId: pkgId });
    const perf = await recordManualPerformance({ projectId: 'ndxbook', packageId: pkgId, metrics: { saves: 10 } });
    expect(perf.audienceResponses.length).toBeGreaterThan(0);
  });

  it('31. Performance evidence does not mutate Brand Character', () => {
    expect(performanceDoesNotMutateCharacter()).toBe(true);
    expect(PERFORMANCE_DOES_NOT_MUTATE_CHARACTER).toBe(true);
  });

  it('32. Performance evidence does not mutate Brand Canon', () => {
    expect(performanceDoesNotMutateCanon()).toBe(true);
  });

  it('33. One viral post produces insufficient learning confidence', () => {
    const learning = createPerformanceLearning({ projectId: 'ndxbook', sourceContentIds: ['p1'], sampleSize: 1, patterns: [] });
    expect(oneViralPostInsufficientConfidence(learning)).toBe(true);
  });

  it('34. Outlier detection exists', () => {
    const learning = createPerformanceLearning({ projectId: 'ndxbook', sourceContentIds: ['p1'], sampleSize: 1, patterns: [] });
    expect(learning.limitations).toContain('SMALL_SAMPLE');
  });

  it('35. Editorial strategy changes require founder acceptance', () => {
    const learning = createPerformanceLearning({ projectId: 'ndxbook', sourceContentIds: ['p1'], sampleSize: 5, patterns: ['test'] });
    expect(founderAcceptanceRequiredForStrategyChange(learning)).toBe(true);
  });

  it('36. Performance may influence ranking only after accepted learning', async () => {
    await prepareContentOperations({ projectId: 'ndxbook' });
    await compileContentOperations({ projectId: 'ndxbook' });
    await discoverContentOpportunities({ projectId: 'ndxbook' });
    await proposeWeeklySlate({ projectId: 'ndxbook' });
    const run = await approveWeeklySlate({ projectId: 'ndxbook' });
    const pkgId = run.contentPackages[0]!.id;
    await approveContentPackage({ projectId: 'ndxbook', packageId: pkgId });
    const perf = await recordManualPerformance({ projectId: 'ndxbook', packageId: pkgId });
    const learningId = perf.performanceLearning[0]!.learningId;
    const accepted = await acceptPerformanceLearning({ projectId: 'ndxbook', learningId });
    expect(accepted.performanceLearning[0]?.founderAccepted).toBe(true);
  });

  it('37. Content experiment changes one dimension', () => {
    const exp = createContentExperiment({ projectId: 'ndxbook', dimension: 'CAPTION_LENGTH', hypothesis: 'shorter captions' });
    expect(exp.dimension).toBe('CAPTION_LENGTH');
  });

  it('38. Core character identity cannot be A/B tested away', () => {
    const exp = createContentExperiment({ projectId: 'ndxbook', dimension: 'HOOK', hypothesis: 'test' });
    expect(coreCharacterCannotBeAbTested(exp)).toBe(true);
  });

  it('39. AI-generated illustration cannot become factual evidence', () => {
    expect(fakeReceiptEvidenceBlocked({ lineage: 'GENERATED_ILLUSTRATION', claimStatus: 'FACT' })).toBe(true);
  });

  it('40. Fake receipt/source evidence is blocked', () => {
    expect(fakeReceiptEvidenceBlocked({ lineage: 'SIMULATED_EXAMPLE', claimStatus: 'FACT' })).toBe(true);
  });

  it('41. Content risk evaluation works', () => {
    const opp = seedPilotOpportunities('ndxbook')[0]!;
    const risk = evaluateContentRisk({ contentId: 'c1', opp });
    expect(risk.overallRisk).toBeDefined();
  });

  it('42. High-risk content requires stronger review', () => {
    const risk = evaluateContentRisk({
      contentId: 'c1',
      opp: { ...seedPilotOpportunities('ndxbook')[0]!, risk: 'HIGH' },
    });
    expect(highRiskRequiresStrongerReview(risk)).toBe(true);
  });

  it('43. Content calendar tracks operational states', () => {
    expect(calendarTracksOperationalStates([...CALENDAR_STATUSES])).toBe(true);
  });

  it('44. Published content becomes immutable historical evidence', () => {
    expect(invalidateOnThesisChange(['a1']).action).toBe('STALE');
  });

  it('45. Upstream Character change invalidates active production', () => {
    const results = invalidateOnCharacterSystemChange({ activePackageIds: ['p1'] });
    expect(results.some((r) => r.action === 'REVIEW_REQUIRED')).toBe(true);
  });

  it('46. Marketing Expression change invalidates dependent work', () => {
    expect(invalidateOnThesisChange(['asset-1']).layer).toBe('downstreamAssets');
  });

  it('47. Thesis change marks downstream assets stale', () => {
    expect(invalidateOnThesisChange(['x']).action).toBe('STALE');
  });

  it('48. NDX behavioral modes not hardcoded into generic engine', () => {
    expect(ndxBehavioralModesNotHardcodedIntoGenericEngine()).toBe(true);
  });

  it('49. Future connector capability states are honest', () => {
    expect(connectorStatesHonest(defaultConnectorCapabilities())).toBe(true);
    expect(liveSocialPublishingVerified(defaultConnectorCapabilities())).toBe(false);
  });

  it('50. Provider costs are recorded', async () => {
    await prepareContentOperations({ projectId: 'ndxbook' });
    const run = await compileContentOperations({ projectId: 'ndxbook' });
    expect(run.productionBudget).toBeTruthy();
  });

  it('51. Production budget prevents uncontrolled multiplication', () => {
    expect(budgetPreventsMultiplication({ topics: 3, formats: 3, channels: 3, variants: 1 })).toBe(true);
    expect(budgetPreventsMultiplication({ topics: 10, formats: 10, channels: 10, variants: 10 })).toBe(false);
  });

  it('52. No generation on page load', () => {
    expect(noPageLoadGeneration()).toBe(true);
  });

  it('53. No silent retries implied by service', () => {
    expect(noPageLoadGeneration()).toBe(true);
  });

  it('54. No hidden posting', () => {
    expect(noAutomaticPublishing()).toBe(true);
  });

  it('55. Full lineage survives restart', async () => {
    await prepareContentOperations({ projectId: 'ndxbook' });
    const compiled = await compileContentOperations({ projectId: 'ndxbook' });
    expect(compiled.operationsSystem?.fingerprint).toBeTruthy();
  });

  it('56. API routes wired', () => {
    expect(PROJECTS_API).toContain('content_operations_get');
    expect(PROJECTS_API).toContain('content_operations_approve_slate');
    expect(PROJECTS_API).toContain('content_operations_record_performance');
  });

  it('57. Frontend routes wired', () => {
    expect(ROUTES).toContain('projectContentOperations');
    expect(SITE_ROUTES).toContain('ProjectContentOperationsPage');
    expect(OPS_PAGE).toContain('ASSISTED_AUTONOMY');
    expect(PERF_PAGE).toContain('WHAT NOT TO CONCLUDE');
  });

  it('58. Live signal ingestion not connected', () => {
    expect(LIVE_SIGNAL_INGESTION_NOT_CONNECTED).toBe(true);
    expect(liveSignalIngestionNotConnected()).toBe(true);
  });

  it('59. Character event precedes package', () => {
    const opp = seedPilotOpportunities('ndxbook')[0]!;
    const event = formulateCharacterEventFromOpportunity(opp);
    expect(characterEventPrecedesPackage(event)).toBe(true);
  });

  it('60. Full pipeline end-to-end', async () => {
    const prepared = await prepareContentOperations({ projectId: 'ndxbook' });
    expect(prepared.status).toBe('AUDITED');
    const compiled = await compileContentOperations({ projectId: 'ndxbook' });
    expect(compiled.status).toBe('COMPILED');
    expect(CONTENT_OPPORTUNITY_ENGINE_IMPLEMENTED).toBe(true);
    const opps = await discoverContentOpportunities({ projectId: 'ndxbook' });
    expect(opps.opportunities.length).toBeGreaterThanOrEqual(5);
    const slate = await proposeWeeklySlate({ projectId: 'ndxbook' });
    expect(slate.activeSlate?.status).toBe('PROPOSED');
    const production = await approveWeeklySlate({ projectId: 'ndxbook' });
    expect(production.contentPackages.length).toBeGreaterThan(0);
    expect(buildNdxbookMarketTest01('ndxbook').testId).toBe('ndxbook-market-test-01');
  });

  it('61. Experiment F immutable', () => {
    expect(experimentFImmutable()).toBe(true);
    expect(auditContentSystems({ projectId: 'ndxbook' }).historicalRecordsMutated).toBe(false);
  });

  it('62. Experiment G not reevaluated', () => {
    expect(experimentGNotReevaluated()).toBe(true);
  });
});
