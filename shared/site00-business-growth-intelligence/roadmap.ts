import { randomUUID } from 'node:crypto';
import type { BusinessGrowthAssessment, BusinessGrowthRoadmap, SelectedGrowthService } from './types.js';
import { projectGrowthDelivery } from './deliveryEngine.js';
import type { DigitalFoundationCommercialConfig, QuoteLineAddon } from '../site00-digital-foundation/types.js';
import { BUSINESS_GROWTH_INTELLIGENCE_VERSION } from './version.js';
import { AIO_REFERRAL_HINTS } from './aioReferralBoundaries.js';

export function buildBusinessGrowthRoadmap(input: {
  assessment: BusinessGrowthAssessment;
  selectedGrowth: SelectedGrowthService[];
  foundationConfig: DigitalFoundationCommercialConfig;
  foundationAddonLines: QuoteLineAddon[];
  foundation_readiness_summary?: string | null;
  roadmap_version?: number;
}): BusinessGrowthRoadmap {
  const delivery = projectGrowthDelivery({
    foundationConfig: input.foundationConfig,
    foundationAddonLines: input.foundationAddonLines,
    selectedGrowth: input.selectedGrowth.filter((s) => s.client_selected),
  });

  const aio_referrals: string[] = [];
  for (const r of input.assessment.recommendations) {
    if (r.aio_handoff) aio_referrals.push(r.aio_handoff);
  }
  for (const hint of AIO_REFERRAL_HINTS) {
    if (input.assessment.ambition.goals.some((g) => hint.trigger_goals.includes(g))) {
      aio_referrals.push(hint.summary);
    }
  }

  const specialist_referrals = input.assessment.recommendations
    .map((r) => r.specialist_handoff)
    .filter((s): s is string => Boolean(s));

  return {
    roadmap_id: randomUUID(),
    schema_version: BUSINESS_GROWTH_INTELLIGENCE_VERSION,
    roadmap_version: input.roadmap_version ?? 1,
    founder_approval_state: 'DRAFT',
    client_goals: input.assessment.ambition.goals,
    foundation_readiness_summary: input.foundation_readiness_summary ?? null,
    selected_services: input.selectedGrowth,
    recommended_services: input.assessment.recommendations,
    immediate_actions: delivery.milestones.filter((m) => m.kind === 'FOUNDATION_READY').map((m) => m.label),
    delivery_milestones: delivery.milestones,
    blockers: [],
    bldr_opportunity_notes: input.selectedGrowth.some((s) => s.client_selected && s.service_id === 'BGI.PRESENCE_LAUNCH')
      ? 'BLDR opportunity — scoped separately via canonical estimator'
      : null,
    aio_referrals: [...new Set(aio_referrals)],
    specialist_referrals: [...new Set(specialist_referrals)],
    future_options: input.assessment.recommendations
      .filter((r) => r.category === 'FUTURE_OPPORTUNITY')
      .map((r) => r.reason),
    updated_at: new Date().toISOString(),
  };
}
