import type { DigitalFoundationCommercialConfig, QuoteLineAddon } from './types.js';
import { findAddon } from './addonCatalog.js';

export type TimelineProjection = {
  projected_min_days: number;
  projected_max_days: number;
  timeline_custom_review: boolean;
};

export function projectTimeline(
  lines: QuoteLineAddon[],
  config: DigitalFoundationCommercialConfig,
): TimelineProjection {
  let minDays = config.base_min_business_days;
  let maxDays = config.base_max_business_days;
  let customReview = false;

  for (const line of lines) {
    const def = findAddon(line.addon_id);
    if (!def) continue;
    if (def.requires_manual_review) customReview = true;
    const mod = def.timeline_modifier_business_days * Math.max(1, line.quantity);
    if (mod < 0) {
      minDays = Math.max(1, minDays + mod);
      maxDays = Math.max(minDays, maxDays + mod);
    } else {
      maxDays += mod;
      if (mod > 0) minDays = Math.min(maxDays, minDays + Math.floor(mod / 2));
    }
    if (def.addon_id === 'DOMAIN_RECOVERY' || def.addon_id === 'CUSTOM_FOUNDATION_WORK') {
      customReview = true;
    }
  }

  if (customReview && maxDays >= 7) {
    return { projected_min_days: minDays, projected_max_days: maxDays, timeline_custom_review: true };
  }

  return { projected_min_days: minDays, projected_max_days: maxDays, timeline_custom_review: customReview };
}
