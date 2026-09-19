/**
 * P0.CBI.1 — CampaignGenerationContextEnvelope
 */

import type { FounderCreativeAppetiteProfile } from '../founderCreativeAppetite/types.js';
import type {
  BrandCampaignHistorySummary,
  BrandCreativeContext,
  CampaignGenerationContextEnvelope,
} from './types.js';
import { filterOffersForBrand } from './projectFirewall.js';
import { buildBrandInfluenceTraces } from './brandInfluenceTrace.js';

export function buildCampaignGenerationContextEnvelope(input: {
  brandContext: BrandCreativeContext;
  objective: string;
  selectedOfferIds?: string[];
  channel?: string | null;
  constraints?: string[];
}): CampaignGenerationContextEnvelope {
  const selectedOffers = input.selectedOfferIds?.length
    ? filterOffersForBrand(input.brandContext, input.selectedOfferIds)
    : input.brandContext.offers.filter((o) => o.campaignEligible && o.status !== 'DEFERRED' && o.status !== 'DISCONTINUED');

  const appetite: FounderCreativeAppetiteProfile | null = input.brandContext.creativeAppetite;
  const history: BrandCampaignHistorySummary = input.brandContext.campaignHistory;

  const influenceTrace = buildBrandInfluenceTraces(input.brandContext, [
    { decision: 'STRATEGY_SELECTION', fieldHints: ['positioning', 'experience', 'voice'] },
    { decision: 'WORLD_GENESIS', fieldHints: ['world', 'visual', 'offers'] },
    { decision: 'AUDIENCE_FRAMING', fieldHints: ['audience'] },
  ]);

  return {
    brandContext: input.brandContext,
    brandContextVersion: input.brandContext.version,
    objective: input.objective,
    selectedOffers,
    campaignHistory: history,
    founderCreativeAppetite: appetite,
    channel: input.channel ?? null,
    constraints: input.constraints ?? [],
    influenceTrace,
  };
}

/** Snapshot version at generation start — mid-run context changes do not mutate this envelope. */
export function freezeGenerationEnvelope(envelope: CampaignGenerationContextEnvelope): CampaignGenerationContextEnvelope {
  return JSON.parse(JSON.stringify(envelope)) as CampaignGenerationContextEnvelope;
}
