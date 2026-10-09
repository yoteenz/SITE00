/**
 * Digital Foundation ↔ Business Growth Intelligence bridge (server).
 * Does not alter Stripe checkout totals unless Growth lines are founder-approved and checkout flag is on.
 */
import {
  composeFoundationWithGrowth,
  isBusinessGrowthIntelligenceActive,
  type SelectedGrowthService,
  type BusinessAmbitionIntake,
} from '../../../shared/site00-business-growth-intelligence/index.js';
import type { DigitalFoundationIntake, DigitalFoundationRecommendation } from '../../../shared/site00-digital-foundation/types.js';
import type { DigitalFoundationCommercialConfig, QuoteLineAddon } from '../../../shared/site00-digital-foundation/types.js';

export function attachGrowthContextToFoundationPayload(input: {
  intake: DigitalFoundationIntake;
  foundationRecommendation: DigitalFoundationRecommendation;
  foundationAddonLines: QuoteLineAddon[];
  config: DigitalFoundationCommercialConfig;
  selectedGrowth?: SelectedGrowthService[];
}) {
  const ambition = input.intake.business_ambition as BusinessAmbitionIntake | undefined;
  return composeFoundationWithGrowth({
    foundationIntake: input.intake,
    businessAmbition: ambition ?? null,
    foundationRecommendation: input.foundationRecommendation,
    foundationAddonLines: input.foundationAddonLines,
    config: input.config,
    selectedGrowth: input.selectedGrowth,
  });
}

export function growthIntelligenceEnabledForArtifact(): boolean {
  return isBusinessGrowthIntelligenceActive();
}
