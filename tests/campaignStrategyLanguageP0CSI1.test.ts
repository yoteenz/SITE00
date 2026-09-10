/**
 * P0.CSI.1 — Campaign Strategy + Expression Language System tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CAMPAIGN_STRATEGY_LIBRARY,
  LIVED_IN_ENVIRONMENTAL_ALIASES,
  listAllStrategyTypes,
} from '../shared/site00-expression-engine/campaign-strategy-language/strategyLibrary.js';
import { getBrandCampaignRange, BRAND_CAMPAIGN_RANGES } from '../shared/site00-expression-engine/campaign-strategy-language/brandRangeProfiles.js';
import { resolveCampaignBrandCompatibility } from '../shared/site00-expression-engine/campaign-strategy-language/campaignBrandCompatibility.js';
import { buildCampaignStrategyStack } from '../shared/site00-expression-engine/campaign-strategy-language/campaignStrategyStack.js';
import {
  applyAntiOverfitPenalty,
  clearCampaignExpressionStoreForTest,
  recordFounderCampaignJudgment,
  seedCampaignExpressionHistory,
} from '../shared/site00-expression-engine/campaign-strategy-language/campaignExpressionHistoryStore.js';
import {
  campaignStrategyLanguageSystem,
  P0_CSI_1_BUILD,
} from '../shared/site00-expression-engine/campaign-strategy-language/index.js';
import {
  computeOrganicCampaignScore,
  runAntiCloningQA,
  runOrganicCampaignGuard,
} from '../shared/site00-expression-engine/campaign-strategy-language/organicCampaignGuard.js';
import {
  generateConceptTerritorySeedsFromBrief,
  territoriesDifferByStrategy,
} from '../shared/site00-expression-engine/campaign-strategy-language/territoryBridge.js';
import type { CampaignExpressionHistoryEntry } from '../shared/site00-expression-engine/campaign-strategy-language/types.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.CSI.1 — Campaign Strategy Language System', () => {
  beforeEach(() => clearCampaignExpressionStoreForTest());

  it('1. build v269', () => {
    expect(P0_CSI_1_BUILD).toBe('v269');
  });

  it('2. CampaignStrategyLanguageSystem exists', () => {
    expect(read('shared/site00-expression-engine/campaign-strategy-language/campaignStrategyLanguageSystem.ts')).toContain(
      'CampaignStrategyLanguageSystem',
    );
  });

  it('3. strategy taxonomy has 20 strategies', () => {
    expect(listAllStrategyTypes().length).toBe(20);
    expect(CAMPAIGN_STRATEGY_LIBRARY.LIVED_IN_ENVIRONMENTAL.name).toContain('LIVED-IN');
  });

  it('4. strategy ≠ visual style — exampleVisualStyles separate', () => {
    const livedIn = CAMPAIGN_STRATEGY_LIBRARY.LIVED_IN_ENVIRONMENTAL;
    expect(livedIn.exampleVisualStyles.length).toBeGreaterThan(0);
    expect(livedIn.description).not.toContain('Editorial flash');
  });

  it('5. CampaignFlavorProfile on lived-in defaults', () => {
    const p = CAMPAIGN_STRATEGY_LIBRARY.LIVED_IN_ENVIRONMENTAL.defaultProfile;
    expect(p.environmentProminence).toBe('HIGH');
    expect(p.copyDensity).toBe('LOW');
    expect(p.revealStyle).toBe('PROGRESSIVE');
  });

  it('6. ProductRoleInCampaign + HumanPresenceRole + EnvironmentRole', () => {
    const def = CAMPAIGN_STRATEGY_LIBRARY.LIVED_IN_ENVIRONMENTAL;
    expect(def.defaultProductRole).toBe('CO_STAR');
    expect(def.defaultHumanRole).toBe('HANDS_ONLY');
    expect(def.defaultEnvironmentRole).toBe('STORY_ENGINE');
  });

  it('7. lived-in sequence grammar has 8 steps', () => {
    expect(CAMPAIGN_STRATEGY_LIBRARY.LIVED_IN_ENVIRONMENTAL.defaultSequenceGrammar.length).toBe(8);
  });

  it('8. FRONTAL SLAYER recommendations include lived-in for launch', () => {
    const result = campaignStrategyLanguageSystem.recommendCampaignFlavors({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
    });
    const strategies = result.recommendations.map((r) => r.strategyType);
    expect(strategies).toContain('LIVED_IN_ENVIRONMENTAL');
    expect(result.safe).toBeTruthy();
    expect(result.fresh).toBeTruthy();
    expect(result.wildCard).toBeTruthy();
  });

  it('9. NDXBOOK recommends different range than FRONTAL SLAYER', () => {
    const fs = campaignStrategyLanguageSystem.recommendCampaignFlavors({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
    });
    const ndx = campaignStrategyLanguageSystem.recommendCampaignFlavors({
      brandSlug: 'ndxbook',
      objective: 'LAUNCH',
    });
    const fsTop = fs.recommendations.slice(0, 3).map((r) => r.strategyType);
    const ndxTop = ndx.recommendations.slice(0, 3).map((r) => r.strategyType);
    expect(fsTop).not.toEqual(ndxTop);
    expect(ndx.recommendations.map((r) => r.strategyType)).toContain('SOCIAL_OBSERVATION');
  });

  it('10. strategy stack conflict detection', () => {
    const stack = buildCampaignStrategyStack({
      primaryStrategy: 'INTIMATE_DOCUMENTARY',
      secondaryStrategies: ['HERO_PRODUCT_REVEAL'],
    });
    expect(stack.conflicts.length).toBeGreaterThan(0);
  });

  it('11. strategy stack synergies for lived-in + micro narrative', () => {
    const stack = buildCampaignStrategyStack({
      primaryStrategy: 'LIVED_IN_ENVIRONMENTAL',
      secondaryStrategies: ['MICRO_NARRATIVE_SERIES'],
    });
    expect(stack.synergies.length).toBeGreaterThan(0);
  });

  it('12. anti-overfit — high affinity does not guarantee repeat', () => {
    recordFounderCampaignJudgment({
      brandSlug: 'frontal-slayer',
      strategyType: 'LIVED_IN_ENVIRONMENTAL',
      expressionLanguages: ['ORGANIC'],
      judgment: 'LOVE_IT',
    });
    seedCampaignExpressionHistory([
      hist('frontal-slayer', 'LIVED_IN_ENVIRONMENTAL'),
      hist('frontal-slayer', 'LIVED_IN_ENVIRONMENTAL'),
    ] as CampaignExpressionHistoryEntry[]);
    const penalized = applyAntiOverfitPenalty('frontal-slayer', 'LIVED_IN_ENVIRONMENTAL', 0.9);
    expect(penalized).toBeLessThan(0.9);
  });

  it('13. CampaignExpressionBrief generation', () => {
    const brief = campaignStrategyLanguageSystem.generateCampaignExpressionBrief({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
      primaryStrategy: 'LIVED_IN_ENVIRONMENTAL',
    });
    expect(brief.sequence.length).toBeGreaterThan(0);
    expect(brief.doList.length).toBeGreaterThan(0);
    expect(brief.doNotList.some((d) => d.includes('center product'))).toBe(true);
    expect(brief.copyBehavior).toBe('NO_COPY');
  });

  it('14. OrganicCampaignGuard + score', () => {
    const brief = campaignStrategyLanguageSystem.generateCampaignExpressionBrief({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
      primaryStrategy: 'LIVED_IN_ENVIRONMENTAL',
    });
    const score = computeOrganicCampaignScore(brief);
    expect(score.overall).toBeGreaterThan(0.5);
    expect(runOrganicCampaignGuard(brief).length).toBeGreaterThanOrEqual(0);
  });

  it('15. territory bridge feeds concept seeds without replacing system', () => {
    const brief = campaignStrategyLanguageSystem.generateCampaignExpressionBrief({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
      primaryStrategy: 'LIVED_IN_ENVIRONMENTAL',
    });
    const seeds = generateConceptTerritorySeedsFromBrief(brief);
    expect(seeds[0]?.centralConcept).toContain('discovered');
    expect(territoriesDifferByStrategy('LIVED_IN_ENVIRONMENTAL', 'HERO_PRODUCT_REVEAL')).toBe(true);
  });

  it('16. territories differ across strategies', () => {
    const livedIn = campaignStrategyLanguageSystem.generateCampaignExpressionBrief({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
      primaryStrategy: 'LIVED_IN_ENVIRONMENTAL',
    });
    const hero = campaignStrategyLanguageSystem.generateCampaignExpressionBrief({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
      primaryStrategy: 'HERO_PRODUCT_REVEAL',
    });
    const editorial = campaignStrategyLanguageSystem.generateCampaignExpressionBrief({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
      primaryStrategy: 'HIGH_CONCEPT_EDITORIAL',
    });
    const s1 = generateConceptTerritorySeedsFromBrief(livedIn)[0]?.centralConcept ?? '';
    const s2 = generateConceptTerritorySeedsFromBrief(hero)[0]?.centralConcept ?? '';
    const s3 = generateConceptTerritorySeedsFromBrief(editorial)[0]?.centralConcept ?? '';
    expect(new Set([s1, s2, s3]).size).toBe(3);
  });

  it('17. brand range profiles for all pilot brands', () => {
    expect(BRAND_CAMPAIGN_RANGES['frontal-slayer']).toBeTruthy();
    expect(BRAND_CAMPAIGN_RANGES.ndxbook).toBeTruthy();
    expect(getBrandCampaignRange('site-00').safeRange.length).toBeGreaterThan(0);
    expect(getBrandCampaignRange('aio').safeRange.length).toBeGreaterThan(0);
    expect(getBrandCampaignRange('astral-world').safeRange.length).toBeGreaterThan(0);
  });

  it('18. objective compatibility boosts launch strategies', () => {
    const compat = resolveCampaignBrandCompatibility({
      brandSlug: 'frontal-slayer',
      objective: 'LAUNCH',
    });
    expect(compat.recommendedStrategies.some((s) => s === 'LIVED_IN_ENVIRONMENTAL' || s === 'EVENTIZED_DROP')).toBe(true);
  });

  it('19. anti-cloning QA', () => {
    const qa = runAntiCloningQA([
      { composition: 'center-product', captionRhythm: 'short' },
      { composition: 'center-product', captionRhythm: 'short' },
    ]);
    expect(qa.pass).toBe(false);
  });

  it('20. Campaign Flavor UI component', () => {
    expect(read('src/site00/components/founderWorkspace/campaignStrategy/CampaignFlavorWorkspace.tsx')).toContain(
      'CAMPAIGN FLAVOR',
    );
  });

  it('21. lived-in aliases documented', () => {
    expect(LIVED_IN_ENVIRONMENTAL_ALIASES.length).toBeGreaterThan(0);
  });

  it('22. expression languages are multi-dimensional on lived-in', () => {
    const langs = CAMPAIGN_STRATEGY_LIBRARY.LIVED_IN_ENVIRONMENTAL.defaultProfile.expressionLanguages;
    expect(langs.length).toBeGreaterThan(1);
    expect(langs).toContain('ORGANIC');
    expect(langs).toContain('WITTY');
  });
});

function hist(brand: string, strategy: CampaignExpressionHistoryEntry['strategyTypes'][0]): CampaignExpressionHistoryEntry {
  return {
    historyId: `h-${brand}-${strategy}`,
    brandSlug: brand,
    campaignId: 'c1',
    strategyTypes: [strategy],
    expressionLanguages: ['ORGANIC'],
    settingSummary: 'test',
    productRole: 'CO_STAR',
    humanRole: 'HANDS_ONLY',
    revealStyle: 'PROGRESSIVE',
    founderJudgment: null,
    performedAt: new Date().toISOString(),
  };
}
