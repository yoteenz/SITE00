import { describe, expect, it } from 'vitest';
import { defaultDigitalFoundationCommercialConfig } from '../shared/site00-digital-foundation/commercialConfig.js';
import { buildQuoteLines, calculateQuoteTotals } from '../shared/site00-digital-foundation/quoteEngine.js';
import { recommendFromIntake } from '../shared/site00-digital-foundation/recommendationEngine.js';
import {
  getBusinessGrowthCatalog,
  findGrowthService,
  recommendGrowthServices,
  composeUnifiedCommercialQuote,
  projectGrowthDelivery,
  buildBusinessGrowthRoadmap,
  composeFoundationWithGrowth,
  isBusinessGrowthIntelligenceActive,
  formatBusinessDayRange,
} from '../shared/site00-business-growth-intelligence/index.js';

describe('Business Growth catalog', () => {
  it('includes five service families with measurable deliverables', () => {
    const catalog = getBusinessGrowthCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(5);
    for (const s of catalog) {
      expect(s.service_id).toMatch(/^BGI\./);
      expect(s.deliverables.length).toBeGreaterThan(0);
      expect(s.exclusions.length).toBeGreaterThan(0);
    }
  });

  it('keeps Growth Operations future-not-active', () => {
    const ops = findGrowthService('BGI.GROWTH_OPERATIONS');
    expect(ops?.commercial_status).toBe('FUTURE_NOT_ACTIVE');
    expect(ops?.client_facing_status).toBe('FUTURE');
  });
});

describe('Business Ambition recommendations', () => {
  it('recommends visibility for be-found-online goals', () => {
    const assessment = recommendGrowthServices({
      ambition: {
        schema_version: 'bgi-v1',
        goals: ['BE_FOUND_ONLINE'],
        context: { findable_in_search: false },
      },
    });
    expect(assessment.recommendations.some((r) => r.service_id === 'BGI.VISIBILITY_AUDIT')).toBe(true);
    expect(assessment.recommendations.every((r) => !r.reason.toLowerCase().includes('guarantee'))).toBe(true);
  });

  it('routes website goals to BLDR presence launch', () => {
    const assessment = recommendGrowthServices({
      ambition: { schema_version: 'bgi-v1', goals: ['BUILD_WEBSITE'] },
    });
    const presence = assessment.recommendations.find((r) => r.service_id === 'BGI.PRESENCE_LAUNCH');
    expect(presence?.category).toBe('RECOMMENDED_NEXT');
  });

  it('does not guarantee grants for funding goals', () => {
    const assessment = recommendGrowthServices({
      ambition: { schema_version: 'bgi-v1', goals: ['FIND_GRANTS_FUNDING'] },
    });
    expect(assessment.recommendations.some((r) => r.service_id === 'BGI.OPPORTUNITY_READINESS')).toBe(true);
    expect(
      assessment.recommendations.some((r) => r.service_id === 'BGI.APPLICATION_PROCUREMENT_SUPPORT'),
    ).toBe(false);
  });

  it('requires specialist review for contract procurement goals', () => {
    const assessment = recommendGrowthServices({
      ambition: { schema_version: 'bgi-v1', goals: ['PURSUE_GOVERNMENT_CONTRACTS'] },
    });
    const app = assessment.recommendations.find((r) => r.service_id === 'BGI.APPLICATION_PROCUREMENT_SUPPORT');
    expect(app?.category).toBe('SPECIALIST_REVIEW_REQUIRED');
  });

  it('allows skip / not sure without mandatory upsell', () => {
    const assessment = recommendGrowthServices({
      ambition: { schema_version: 'bgi-v1', goals: ['NOT_SURE'], skipped: true },
    });
    expect(assessment.recommendations.length).toBeGreaterThan(0);
    expect(assessment.recommendations.every((r) => r.category !== 'NEEDED_NOW')).toBe(true);
  });
});

describe('Quote composition + Foundation base unchanged', () => {
  const config = defaultDigitalFoundationCommercialConfig();

  it('preserves $500 Foundation base when Growth proposed lines selected', () => {
    const lines = buildQuoteLines([{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 1 }], config);
    const unified = composeUnifiedCommercialQuote({
      config,
      foundationAddonLines: lines,
      selectedGrowth: [{ service_id: 'BGI.VISIBILITY_AUDIT', quantity: 1, client_selected: true }],
      third_party_notice: config.third_party_cost_notice,
    });
    expect(unified.foundation_base_minor).toBe(50_000);
    expect(unified.foundation_subtotal_minor).toBe(calculateQuoteTotals(lines, config).subtotal_minor);
    expect(unified.growth_subtotal_minor).toBeNull();
    expect(unified.growth_lines[0].price_display).toContain('approval pending');
  });

  it('extends full project timeline when Growth adds sequential work', () => {
    const lines = buildQuoteLines([], config);
    const delivery = projectGrowthDelivery({
      foundationConfig: config,
      foundationAddonLines: lines,
      selectedGrowth: [
        { service_id: 'BGI.VISIBILITY_AUDIT', quantity: 1, client_selected: true },
        { service_id: 'BGI.OPPORTUNITY_READINESS', quantity: 1, client_selected: true },
      ],
    });
    expect(delivery.foundation_ready_max_days).toBe(config.base_max_business_days);
    expect(delivery.full_project_max_days).toBeGreaterThan(delivery.foundation_ready_max_days);
  });

  it('does not symmetrically distort 2–3 business day Foundation display', () => {
    expect(formatBusinessDayRange(2, 3)).toBe('2–3 business days');
  });
});

describe('Foundation integration flag gate', () => {
  const config = defaultDigitalFoundationCommercialConfig();

  it('returns inactive bundle when feature flag off', () => {
    const intake = { needs: [] as const };
    const { recommendation } = recommendFromIntake(intake, config);
    const lines = buildQuoteLines([], config);
    const bundle = composeFoundationWithGrowth({
      foundationIntake: intake,
      foundationRecommendation: recommendation,
      foundationAddonLines: lines,
      config,
    });
    if (!isBusinessGrowthIntelligenceActive()) {
      expect(bundle.active).toBe(false);
    }
  });
});

describe('Roadmap persistence shape', () => {
  it('builds roadmap with foundation and growth milestones', () => {
    const config = defaultDigitalFoundationCommercialConfig();
    const assessment = recommendGrowthServices({
      ambition: { schema_version: 'bgi-v1', goals: ['BE_FOUND_ONLINE', 'BUILD_WEBSITE'] },
    });
    const roadmap = buildBusinessGrowthRoadmap({
      assessment,
      selectedGrowth: [{ service_id: 'BGI.VISIBILITY_AUDIT', quantity: 1, client_selected: true }],
      foundationConfig: config,
      foundationAddonLines: [],
    });
    expect(roadmap.delivery_milestones.some((m) => m.kind === 'FOUNDATION_READY')).toBe(true);
    expect(roadmap.delivery_milestones.some((m) => m.kind === 'FULL_PROJECT')).toBe(true);
    expect(roadmap.founder_approval_state).toBe('DRAFT');
  });
});
