/**
 * P0.CSI.1 — Brand + objective compatibility matching.
 */

import type {
  CampaignBrandCompatibilityInput,
  CampaignBrandCompatibilityResult,
  CampaignObjective,
  CampaignStrategyType,
} from './types.js';
import { getBrandCampaignRange } from './brandRangeProfiles.js';
import { getStrategyDefinition } from './strategyLibrary.js';

const OBJECTIVE_STRATEGY_BOOST: Partial<Record<CampaignObjective, CampaignStrategyType[]>> = {
  LAUNCH: ['EVENTIZED_DROP', 'HERO_PRODUCT_REVEAL', 'LIVED_IN_ENVIRONMENTAL'],
  DROP: ['EVENTIZED_DROP', 'MICRO_NARRATIVE_SERIES', 'FOUND_OBJECT_DISCOVERY'],
  AWARENESS: ['SOCIAL_OBSERVATION', 'CULTURAL_CALLBACK', 'WORLD_BUILDING'],
  CONVERSION: ['RECEIPT_PROOF', 'TESTIMONIAL_AS_STORY', 'TRANSFORMATION_ARC'],
  EDUCATION: ['PROCESS_ACCESS', 'RECEIPT_PROOF'],
  BRAND_WORLD: ['WORLD_BUILDING', 'LIVED_IN_ENVIRONMENTAL', 'ONE_LOCATION_STUDY'],
  PRODUCT_SPOTLIGHT: ['HERO_PRODUCT_REVEAL', 'EVERYDAY_LUXURY', 'LIVED_IN_ENVIRONMENTAL'],
  EDITORIAL: ['HIGH_CONCEPT_EDITORIAL', 'INTIMATE_DOCUMENTARY'],
  REPOSITIONING: ['HIGH_CONCEPT_EDITORIAL', 'TRANSFORMATION_ARC', 'CULTURAL_CALLBACK'],
  FOUNDERSHIP: ['PROCESS_ACCESS', 'INTIMATE_DOCUMENTARY'],
};

export function resolveCampaignBrandCompatibility(
  input: CampaignBrandCompatibilityInput,
): CampaignBrandCompatibilityResult {
  const range = getBrandCampaignRange(input.brandSlug);
  const boost = OBJECTIVE_STRATEGY_BOOST[input.objective] ?? [];

  const scored = [...range.safeRange, ...range.stretchRange, ...range.experimentalRange]
    .filter((s) => !range.offBrandRange.includes(s))
    .map((strategy) => {
      let score = range.safeRange.includes(strategy) ? 0.85 : range.stretchRange.includes(strategy) ? 0.7 : 0.55;
      if (boost.includes(strategy)) score += 0.1;
      return { strategy, score: Math.min(1, score) };
    })
    .sort((a, b) => b.score - a.score);

  const recommendedStrategies = scored.map((s) => s.strategy);
  const topStrategy = recommendedStrategies[0];
  const langs = topStrategy
    ? getStrategyDefinition(topStrategy).compatibleExpressionLanguages.slice(0, 5)
    : range.preferredExpressionLanguages.slice(0, 5);

  const avoidances: string[] = [];
  if (range.offBrandRange.length) {
    avoidances.push(`Off-brand strategies: ${range.offBrandRange.join(', ')}`);
  }
  if (input.objective === 'CONVERSION' && recommendedStrategies.includes('ANTI_CAMPAIGN_DEADPAN')) {
    avoidances.push('Deadpan anti-campaign may undercut conversion clarity');
  }

  const appetite = input.appetite?.creativeRiskTolerance?.value;
  let riskLevel: CampaignBrandCompatibilityResult['riskLevel'] = 'MEDIUM';
  if (appetite === 'CONSERVATIVE') riskLevel = 'LOW';
  if (appetite === 'ADVENTUROUS' || appetite === 'HIGH_EXPERIMENTATION') riskLevel = 'HIGH';

  return {
    recommendedStrategies,
    recommendedExpressionLanguages: [...new Set([...langs, ...range.preferredExpressionLanguages])].slice(0, 8),
    avoidances,
    riskLevel,
    brandFitScore: scored[0]?.score ?? 0.5,
  };
}
