/**
 * P0.CBI.1 — BrandSpecificityScore
 */

import { detectGenericBrandOutput } from './genericBrandOutputDetector.js';
import type { BrandCreativeContext, BrandSpecificityScore } from './types.js';

export function computeBrandSpecificityScore(
  text: string,
  context: BrandCreativeContext | null,
): BrandSpecificityScore {
  if (!context) {
    return {
      brandTruthUsage: 0,
      offerSpecificity: 0,
      audienceSpecificity: 0,
      worldSpecificity: 0,
      voiceSpecificity: 0,
      historyAwareness: 0,
      overall: 0,
      genericPhrasesDetected: [],
    };
  }

  const lower = text.toLowerCase();
  const brandNameHit = lower.includes(context.brandName.toLowerCase()) ? 1 : 0;

  const truthTokens = [
    context.positioning.value,
    context.brandPromise.value,
    context.differentiation.value,
    ...(context.productsServices.value ?? []),
    ...(context.visualIdentity.recurringSignatures.value ?? []),
    ...(context.worldBuilding.locations.value ?? []),
  ].filter(Boolean) as string[];

  let truthHits = 0;
  for (const token of truthTokens) {
    const words = token.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    if (words.some((w) => lower.includes(w))) truthHits++;
  }
  const brandTruthUsage = Math.min(1, (truthHits + brandNameHit) / Math.max(truthTokens.length, 1));

  const offerNames = context.offers.map((o) => o.name.toLowerCase());
  const offerSpecificity = offerNames.some((n) => lower.includes(n)) ? 0.8 : context.offers.length ? 0.3 : 0;

  const audienceSpecificity = context.audience.primary.isUnknown
    ? 0.2
    : (context.audience.primary.value && lower.includes(context.audience.primary.value.toLowerCase().slice(0, 20)))
      ? 0.9
      : 0.4;

  const worldTokens = context.worldBuilding.locations.value ?? [];
  const worldSpecificity = worldTokens.some((w) => lower.includes(w.toLowerCase())) ? 0.85 : worldTokens.length ? 0.35 : 0;

  const voiceTokens = context.toneVoice.preferredPatterns.value ?? [];
  const voiceSpecificity = voiceTokens.length ? 0.5 : 0.2;

  const historyAwareness =
    context.campaignHistory.recentCampaigns.length > 0 &&
    context.campaignHistory.lastUsedStrategies.some((s) => lower.includes(s.toLowerCase()))
      ? 0.7
      : 0.2;

  const genericIssues = detectGenericBrandOutput(text, context);
  const penalty = genericIssues.length * 0.15;

  const overall = Math.max(
    0,
    Math.min(
      1,
      (brandTruthUsage + offerSpecificity + audienceSpecificity + worldSpecificity + voiceSpecificity + historyAwareness) / 6 -
        penalty,
    ),
  );

  return {
    brandTruthUsage,
    offerSpecificity,
    audienceSpecificity,
    worldSpecificity,
    voiceSpecificity,
    historyAwareness,
    overall,
    genericPhrasesDetected: genericIssues.map((i) => i.phrase),
  };
}
