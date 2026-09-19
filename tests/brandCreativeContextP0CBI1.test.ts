/**
 * P0.CBI.1 — Brand Creative Context + Campaign Intelligence Ingestion tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  brandCreativeContextAssembler,
  clearBrandCreativeContextStoreForTest,
  persistAssembledContext,
  getProjectBootstrap,
  listBootstrappedBrandIds,
  normalizeBrandId,
  SOURCE_AUTHORITY_LEVEL,
  checkCampaignGenerationGate,
  diffBrandCreativeContext,
  assertProjectFirewall,
  detectGenericBrandOutput,
  computeBrandSpecificityScore,
  runBrandCreativeContextQA,
  buildCampaignGenerationContextEnvelope,
  buildBrandSpecificFitExplanation,
  buildBrandInfluenceTraces,
  getBrandCampaignHistorySummary,
  recordBrandCampaignHistory,
  clearBrandCampaignHistoryForTest,
} from '../shared/site00-brand-lore/brandCreativeContext/index.js';
import { campaignStrategyLanguageSystem } from '../shared/site00-expression-engine/campaign-strategy-language/index.js';
import { campaignWorldGenesisEngine } from '../shared/site00-expression-engine/campaign-genesis-orchestration/index.js';

function assemble(brandId: string) {
  const result = brandCreativeContextAssembler.assemble({ brandId });
  persistAssembledContext(result.context);
  return result.context;
}

describe('P0.CBI.1 Brand Creative Context', () => {
  beforeEach(() => {
    clearBrandCreativeContextStoreForTest();
    clearBrandCampaignHistoryForTest();
  });

  it('1. assembles BrandCreativeContext type with required fields', () => {
    const ctx = assemble('frontal-slayer');
    expect(ctx.brandId).toBe('frontal-slayer');
    expect(ctx.brandName).toBe('FRONTAL SLAYER');
    expect(ctx.version).toBeGreaterThanOrEqual(1);
    expect(ctx.sourceRefs.length).toBeGreaterThan(0);
  });

  it('2. source authority priority — PROJECT_IDENTITY beats CAMPAIGN_INPUT', () => {
    expect(SOURCE_AUTHORITY_LEVEL.PROJECT_IDENTITY).toBeLessThan(SOURCE_AUTHORITY_LEVEL.CAMPAIGN_INPUT);
  });

  it('3. source lineage preserved', () => {
    const ctx = assemble('ndxbook');
    expect(ctx.sourceRefs.some((r) => r.sourceType === 'CONTENT_BRAIN')).toBe(true);
    expect(ctx.sourceRefs[0]?.fieldsContributed).toBeDefined();
  });

  it('4. distillation — not entire database dump', () => {
    const ctx = assemble('ndxbook');
    const serialized = JSON.stringify(ctx);
    expect(serialized.length).toBeLessThan(50000);
    expect(ctx.productsServices.value?.length).toBeLessThan(20);
  });

  it('5. FRONTAL SLAYER bootstrap resolves known truths from sources', () => {
    const slice = getProjectBootstrap('frontal-slayer');
    expect(slice?.brandPromise.value).toContain('BEAUTY BEHAVES DIFFERENTLY');
    const ctx = assemble('frontal-slayer');
    expect(ctx.offers.some((o) => o.offerId === 'fs-build-a-wig')).toBe(true);
    expect(ctx.worldBuilding.locations.value).toContain('Mansion');
  });

  it('6. NDXBOOK bootstrap resolves editorial identity', () => {
    const ctx = assemble('ndxbook');
    expect(ctx.positioning.value).toContain('index');
    expect(ctx.toneVoice.tabooLanguage.value).toContain('preachy');
  });

  it('7. SITE 00 bootstrap resolves digital location', () => {
    const ctx = assemble('site-00');
    expect(ctx.category.value?.toLowerCase()).toContain('digital');
    expect(ctx.nonNegotiables.value?.some((n) => n.toLowerCase().includes('firewall'))).toBe(true);
  });

  it('8. AIO bootstrap resolves trucking services', () => {
    const ctx = assemble('aio');
    expect(ctx.productsServices.value?.some((p) => p.toLowerCase().includes('dispatch'))).toBe(true);
    expect(ctx.offers.find((o) => o.offerId === 'aio-social')?.campaignEligible).toBe(false);
  });

  it('9. ASTRAL WORLD bootstrap resolves reader platform', () => {
    const ctx = assemble('astral-world');
    expect(ctx.worldBuilding.locations.value?.some((l) => l.toLowerCase().includes('astr'))).toBe(true);
  });

  it('10. unknown ≠ assumed — audience UNKNOWN not fabricated', () => {
    const ctx = assemble('frontal-slayer');
    expect(ctx.audience.primary.isUnknown).toBe(true);
    expect(ctx.audience.primary.value).toBeNull();
  });

  it('11. readiness evaluates dimensions', () => {
    const ctx = assemble('frontal-slayer');
    expect(['READY', 'PARTIAL', 'MISSING_CRITICAL']).toContain(ctx.readiness.overall);
    expect(ctx.readiness.dimensions.identity).toBeDefined();
  });

  it('12. generation gate blocks unknown brand', () => {
    const result = brandCreativeContextAssembler.assemble({ brandId: 'totally-unknown-brand-xyz' });
    const gate = checkCampaignGenerationGate(result.context);
    expect(gate.allowed).toBe(false);
    expect(gate.showIntake).toBe(true);
  });

  it('13. generation gate allows bootstrapped FRONTAL SLAYER', () => {
    const ctx = assemble('frontal-slayer');
    const gate = checkCampaignGenerationGate(ctx);
    expect(gate.allowed).toBe(true);
  });

  it('14. project firewall blocks cross-brand leakage check', () => {
    const fs = assemble('frontal-slayer');
    const ndx = assemble('ndxbook');
    expect(assertProjectFirewall(fs, 'frontal-slayer').pass).toBe(true);
    expect(assertProjectFirewall(ndx, 'ndxbook').pass).toBe(true);
    expect(assertProjectFirewall(fs, 'ndxbook').pass).toBe(false);
  });

  it('15. discontinued/deferred offers not campaign eligible', () => {
    const ctx = assemble('aio');
    const deferred = ctx.offers.filter((o) => o.status === 'DEFERRED');
    expect(deferred.every((o) => !o.campaignEligible)).toBe(true);
  });

  it('16. CampaignGenerationContextEnvelope snapshots version', () => {
    const ctx = assemble('frontal-slayer');
    const envelope = buildCampaignGenerationContextEnvelope({
      brandContext: ctx,
      objective: 'LAUNCH',
    });
    expect(envelope.brandContextVersion).toBe(ctx.version);
    expect(envelope.influenceTrace.length).toBeGreaterThan(0);
  });

  it('17. Campaign Flavor integration — brand-specific whyItFits', () => {
    const ctx = assemble('frontal-slayer');
    const result = campaignStrategyLanguageSystem.recommendCampaignFlavors({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
      brandContext: ctx,
    });
    expect(result.generationBlocked).not.toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
    const why = result.recommendations[0]?.whyItFits ?? '';
    expect(why.toLowerCase()).toContain('frontal slayer');
  });

  it('18. World Genesis integration — uses brand context', () => {
    const ctx = assemble('frontal-slayer');
    const worlds = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: ctx,
    });
    expect(worlds.candidates.length).toBeGreaterThan(0);
    expect(worlds.candidates[0]?.whyItWorks.toLowerCase()).toContain('frontal slayer');
  });

  it('19. cross-brand difference — FS vs NDXBOOK flavors differ', () => {
    const fsCtx = assemble('frontal-slayer');
    const ndxCtx = assemble('ndxbook');
    const fs = campaignStrategyLanguageSystem.recommendCampaignFlavors({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
      brandContext: fsCtx,
    });
    const ndx = campaignStrategyLanguageSystem.recommendCampaignFlavors({
      brandSlug: 'ndxbook',
      objective: 'LAUNCH',
      brandContext: ndxCtx,
    });
    const fsStrategies = fs.recommendations.map((r) => r.strategyType);
    const ndxStrategies = ndx.recommendations.map((r) => r.strategyType);
    expect(fsStrategies).not.toEqual(ndxStrategies);
  });

  it('20. cross-brand difference — world genesis differs', () => {
    const fs = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: assemble('frontal-slayer'),
    });
    const ndx = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'ndxbook',
      productCategory: 'GENERAL',
      objective: 'LAUNCH',
      brandContext: assemble('ndxbook'),
    });
    expect(fs.candidates[0]?.coreConcept).not.toBe(ndx.candidates[0]?.coreConcept);
  });

  it('21. GenericBrandOutputDetector flags generic phrases', () => {
    const ctx = assemble('frontal-slayer');
    const issues = detectGenericBrandOutput('A luxury hair brand for modern women', ctx);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('22. BrandSpecificityScore higher for brand-specific copy', () => {
    const ctx = assemble('frontal-slayer');
    const generic = computeBrandSpecificityScore('luxury hair brand for modern women', ctx);
    const specific = computeBrandSpecificityScore(
      'FRONTAL SLAYER Mansion salon-at-home Build-A-Wig white chrome red luxury',
      ctx,
    );
    expect(specific.overall).toBeGreaterThan(generic.overall);
  });

  it('23. BrandCreativeContextQA runs full check', () => {
    const ctx = assemble('frontal-slayer');
    const qa = runBrandCreativeContextQA(
      'FRONTAL SLAYER Build-A-Wig Mansion salon-at-home transformation',
      ctx,
      'frontal-slayer',
    );
    expect(qa.specificityScore.overall).toBeGreaterThan(0.2);
  });

  it('24. BrandInfluenceTrace from actual fields', () => {
    const ctx = assemble('frontal-slayer');
    const traces = buildBrandInfluenceTraces(ctx, [
      { decision: 'SETTING', fieldHints: ['world', 'experience'] },
    ]);
    expect(traces.length).toBeGreaterThan(0);
    expect(traces[0]?.contextField).toBeDefined();
  });

  it('25. buildBrandSpecificFitExplanation uses canonical facts', () => {
    const ctx = assemble('frontal-slayer');
    const explanation = buildBrandSpecificFitExplanation(ctx, 'world genesis');
    expect(explanation).toContain('FRONTAL SLAYER');
    expect(explanation.toLowerCase()).not.toContain('hair is about confidence');
  });

  it('26. context versioning increments on refresh', () => {
    const first = assemble('ndxbook');
    const second = brandCreativeContextAssembler.refresh('ndxbook', { brandId: 'ndxbook' }).context;
    expect(second.version).toBeGreaterThanOrEqual(first.version);
  });

  it('27. BrandContextDiff detects changes', () => {
    const prior = assemble('site-00');
    const next = { ...prior, version: prior.version + 1, positioning: { ...prior.positioning, value: 'Updated positioning' } };
    const diff = diffBrandCreativeContext(prior, next);
    expect(diff.changed.length + diff.added.length).toBeGreaterThan(0);
  });

  it('28. campaign history feeds anti-repetition summary', () => {
    recordBrandCampaignHistory({
      campaignId: 'frontal-slayer:c1',
      name: 'Transit Campaign',
      strategyUsed: ['LIVED_IN_ENVIRONMENTAL'],
      worldUsed: 'IN TRANSIT',
      motifsUsed: ['wind'],
      channelsUsed: ['REEL'],
      founderJudgment: 'LOVE_IT',
      conceptualYield: 0.8,
      executionFidelity: 0.7,
      performedAt: new Date().toISOString(),
    });
    const summary = getBrandCampaignHistorySummary('frontal-slayer');
    expect(summary.lastUsedStrategies).toContain('LIVED_IN_ENVIRONMENTAL');
  });

  it('29. normalizeBrandId slug aliases', () => {
    expect(normalizeBrandId('site00')).toBe('site-00');
    expect(normalizeBrandId('all-in-one-enterprises')).toBe('aio');
  });

  it('30. all five bootstrapped brands listed', () => {
    expect(listBootstrappedBrandIds()).toEqual(
      expect.arrayContaining(['frontal-slayer', 'ndxbook', 'site-00', 'aio', 'astral-world']),
    );
  });

  it('31. generation blocked without context in campaign system', () => {
    const result = campaignStrategyLanguageSystem.recommendCampaignFlavors({
      brandSlug: 'totally-unknown-brand-xyz',
      objective: 'LAUNCH',
      brandContext: null,
    });
    expect(result.generationBlocked).toBe(true);
    expect(result.recommendations).toHaveLength(0);
  });

  it('32. founder override applied without overwriting IDNTY in assembler', () => {
    const result = brandCreativeContextAssembler.assemble({
      brandId: 'frontal-slayer',
      founderOverrides: { audiencePrimary: 'Founder corrected audience' },
    });
    expect(result.context.audience.primary.value).toBe('Founder corrected audience');
    expect(result.context.founderOverrides.audiencePrimary).toBe('Founder corrected audience');
  });

  it('33. world bible stores brandContextVersion', () => {
    const ctx = assemble('frontal-slayer');
    const worlds = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: ctx,
    });
    const bible = campaignWorldGenesisEngine.approveWorldToBible({
      candidate: worlds.candidates[0]!,
      brandId: 'frontal-slayer',
      campaignId: 'test-campaign',
      brandContextVersion: ctx.version,
    });
    expect(bible.brandContextVersion).toBe(ctx.version);
  });

  it('34. persistence survives reload via persistAssembledContext', () => {
    const ctx = assemble('ndxbook');
    persistAssembledContext(ctx);
    const reloaded = brandCreativeContextAssembler.assemble({ brandId: 'ndxbook' });
    expect(reloaded.context.brandId).toBe('ndxbook');
  });

  it('35. P0_CBI_1_BUILD marker exported', async () => {
    const { P0_CBI_1_BUILD } = await import('../shared/site00-brand-lore/brandCreativeContext/types.js');
    expect(P0_CBI_1_BUILD).toBe('v274');
  });
});
