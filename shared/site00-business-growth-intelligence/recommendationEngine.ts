import { randomUUID } from 'node:crypto';
import type { DigitalFoundationIntake } from '../site00-digital-foundation/types.js';
import type {
  BusinessAmbitionIntake,
  BusinessGrowthAssessment,
  GrowthRecommendationCategory,
  GrowthServiceRecommendation,
  BusinessGrowthServiceId,
} from './types.js';
import { findGrowthService } from './serviceCatalog.js';

function rec(
  service_id: BusinessGrowthServiceId,
  category: GrowthRecommendationCategory,
  reason: string,
  extra: Partial<GrowthServiceRecommendation> = {},
): GrowthServiceRecommendation {
  const def = findGrowthService(service_id);
  return {
    service_id,
    category,
    reason,
    missing_information: extra.missing_information ?? [],
    dependencies: def?.dependencies ?? [],
    priority: extra.priority ?? 50,
    suggested_sequence: extra.suggested_sequence ?? 50,
    aio_handoff: extra.aio_handoff ?? null,
    specialist_handoff: extra.specialist_handoff ?? null,
  };
}

/**
 * Transparent rules-based V1 recommendations — founder-inspectable, no opaque AI score.
 */
export function recommendGrowthServices(input: {
  ambition: BusinessAmbitionIntake;
  foundationIntake?: DigitalFoundationIntake;
}): BusinessGrowthAssessment {
  const { ambition, foundationIntake } = input;
  const goals = new Set(ambition.goals ?? []);
  const recommendations: GrowthServiceRecommendation[] = [];
  const ctx = ambition.context ?? {};

  if (ambition.skipped || goals.has('NOT_SURE') && goals.size <= 1) {
    recommendations.push(
      rec('BGI.VISIBILITY_AUDIT', 'OPTIONAL', 'Optional baseline visibility review when you are ready to explore growth services.', {
        priority: 10,
        suggested_sequence: 10,
      }),
    );
  }

  if (
    goals.has('BE_FOUND_ONLINE') ||
    goals.has('ATTRACT_CUSTOMERS') ||
    ctx.findable_in_search === false
  ) {
    recommendations.push(
      rec('BGI.VISIBILITY_AUDIT', 'RECOMMENDED_NEXT', 'Improve discoverability before investing in larger presence work.', {
        priority: 30,
        suggested_sequence: 20,
        missing_information: ctx.findable_in_search == null ? ['Whether customers can find you in search today'] : [],
      }),
    );
  }

  if (goals.has('BUILD_WEBSITE') || foundationIntake?.future_website_interest === 'SOON') {
    recommendations.push(
      rec('BGI.PRESENCE_LAUNCH', 'RECOMMENDED_NEXT', 'A professional digital location is scoped through BLDR — separate from Foundation delivery.', {
        priority: 40,
        suggested_sequence: 40,
      }),
    );
  }

  if (
    goals.has('FIND_GRANTS_FUNDING') ||
    goals.has('PURSUE_BUSINESS_CONTRACTS') ||
    goals.has('PURSUE_GOVERNMENT_CONTRACTS')
  ) {
    recommendations.push(
      rec('BGI.OPPORTUNITY_READINESS', 'RECOMMENDED_NEXT', 'Clarify readiness and documentation before pursuing specific programs or contracts.', {
        priority: 35,
        suggested_sequence: 25,
        missing_information:
          ctx.industry == null ? ['Industry'] : ctx.geographic_markets == null ? ['Geographic markets'] : [],
      }),
    );
    if (goals.has('PURSUE_GOVERNMENT_CONTRACTS') || goals.has('PURSUE_BUSINESS_CONTRACTS')) {
      recommendations.push(
        rec('BGI.APPLICATION_PROCUREMENT_SUPPORT', 'SPECIALIST_REVIEW_REQUIRED', 'Application support requires a verified opportunity and custom scope.', {
          priority: 50,
          suggested_sequence: 50,
          dependencies: ['BGI.OPPORTUNITY_READINESS'],
          specialist_handoff: 'Procurement or grant specialist when scope exceeds SITE 00 delivery',
          missing_information: ['Specific program or contract target'],
        }),
      );
    }
  }

  if (goals.has('AUTOMATE_SALES_FOLLOWUP') || goals.has('ORGANIZE_CRM')) {
    recommendations.push(
      rec('BGI.GROWTH_OPERATIONS', 'FUTURE_OPPORTUNITY', 'Recurring growth operations are not activated in V1 — planning only.', {
        priority: 5,
        suggested_sequence: 90,
      }),
    );
  }

  if (foundationIntake?.needs?.includes('HAVE_WEBSITE') && !goals.has('BUILD_WEBSITE')) {
    recommendations.push(
      rec('BGI.VISIBILITY_AUDIT', 'OPTIONAL', 'You noted an existing web presence — a visibility audit can align domain, listings, and contact data.', {
        priority: 25,
        suggested_sequence: 15,
      }),
    );
  }

  // De-duplicate by service_id keeping highest priority category order
  const order: GrowthRecommendationCategory[] = [
    'NEEDED_NOW',
    'RECOMMENDED_NEXT',
    'OPTIONAL',
    'FUTURE_OPPORTUNITY',
    'SPECIALIST_REVIEW_REQUIRED',
    'NOT_RECOMMENDED',
  ];
  const byId = new Map<BusinessGrowthServiceId, GrowthServiceRecommendation>();
  for (const r of recommendations) {
    const existing = byId.get(r.service_id);
    if (!existing || order.indexOf(r.category) < order.indexOf(existing.category)) {
      byId.set(r.service_id, r);
    }
  }

  return {
    assessment_id: randomUUID(),
    schema_version: 'bgi-v1',
    ambition,
    recommendations: [...byId.values()].sort((a, b) => a.suggested_sequence - b.suggested_sequence),
    created_at: new Date().toISOString(),
  };
}
