import type { DigitalFoundationIntake, DigitalFoundationRecommendation } from '../site00-digital-foundation/types.js';
import type { BusinessAmbitionIntake, SelectedGrowthService, UnifiedCommercialQuoteSections } from './types.js';
import { recommendGrowthServices } from './recommendationEngine.js';
import { composeUnifiedCommercialQuote } from './quoteComposition.js';
import { buildBusinessGrowthRoadmap } from './roadmap.js';
import type { DigitalFoundationCommercialConfig, QuoteLineAddon } from '../site00-digital-foundation/types.js';
import { isBusinessGrowthIntelligenceActive } from './featureFlags.js';

export type FoundationGrowthBundle = {
  active: boolean;
  assessment: ReturnType<typeof recommendGrowthServices> | null;
  unified_quote: UnifiedCommercialQuoteSections | null;
  roadmap: ReturnType<typeof buildBusinessGrowthRoadmap> | null;
};

/**
 * Compose Foundation + Business Growth without altering base Foundation pricing engine output.
 * When intelligence flag is off, returns inactive bundle (Foundation-only behavior preserved).
 */
export function composeFoundationWithGrowth(input: {
  foundationIntake: DigitalFoundationIntake;
  businessAmbition?: BusinessAmbitionIntake | null;
  foundationRecommendation: DigitalFoundationRecommendation;
  foundationAddonLines: QuoteLineAddon[];
  config: DigitalFoundationCommercialConfig;
  selectedGrowth?: SelectedGrowthService[];
}): FoundationGrowthBundle {
  if (!isBusinessGrowthIntelligenceActive()) {
    return { active: false, assessment: null, unified_quote: null, roadmap: null };
  }

  const ambition =
    input.businessAmbition ??
    ({
      schema_version: 'bgi-v1',
      goals: [],
      skipped: true,
    } as BusinessAmbitionIntake);

  const assessment = recommendGrowthServices({
    ambition,
    foundationIntake: input.foundationIntake,
  });

  const selectedGrowth = input.selectedGrowth ?? [];
  const unified_quote = composeUnifiedCommercialQuote({
    config: input.config,
    foundationAddonLines: input.foundationAddonLines,
    selectedGrowth,
    third_party_notice: input.config.third_party_cost_notice,
  });

  const roadmap = buildBusinessGrowthRoadmap({
    assessment,
    selectedGrowth,
    foundationConfig: input.config,
    foundationAddonLines: input.foundationAddonLines,
    foundation_readiness_summary: input.foundationRecommendation.title,
  });

  return { active: true, assessment, unified_quote, roadmap };
}
