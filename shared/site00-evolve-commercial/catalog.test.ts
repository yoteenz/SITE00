import { describe, expect, it } from 'vitest';
import {
  EVOLVE_FOUNDATION,
  EVOLVE_PACKAGE_HIERARCHY,
  EVOLVE_PAID_MEDIA_SERVICE,
  EVOLVE_PROJECT_SERVICES,
  EVOLVE_RECURRING_PLANS,
  computePaidMediaFeeCents,
  formatEvolvePrice,
  getEvolvePlanById,
  getEvolveProjectServiceById,
  getEvolveServiceCatalog,
  getRecommendedEvolvePlan,
} from './catalog.js';

describe('EVOLVE canonical pricing', () => {
  it('Foundation is a one-time $1,500 activation', () => {
    expect(EVOLVE_FOUNDATION.priceCents).toBe(150_000);
    expect(EVOLVE_FOUNDATION.billingType).toBe('ONE_TIME');
    expect(formatEvolvePrice(EVOLVE_FOUNDATION.priceCents, EVOLVE_FOUNDATION.priceQualifier, EVOLVE_FOUNDATION.billingInterval)).toBe('$1,500');
  });

  it('Essential is $1,250/month', () => {
    const plan = getEvolvePlanById('evolve_essential')!;
    expect(plan.priceCents).toBe(125_000);
    expect(formatEvolvePrice(plan.priceCents, plan.priceQualifier, plan.billingInterval)).toBe('$1,250 / MONTH');
  });

  it('Growth is $2,500/month and is the recommended plan', () => {
    const plan = getEvolvePlanById('evolve_growth')!;
    expect(plan.priceCents).toBe(250_000);
    expect(plan.recommended).toBe(true);
    expect(formatEvolvePrice(plan.priceCents, plan.priceQualifier, plan.billingInterval)).toBe('$2,500 / MONTH');
    expect(getRecommendedEvolvePlan().id).toBe('evolve_growth');
  });

  it('only Growth is marked recommended', () => {
    const recommendedCount = EVOLVE_RECURRING_PLANS.filter((p) => p.recommended).length;
    expect(recommendedCount).toBe(1);
  });

  it('Studio is $4,500/month', () => {
    const plan = getEvolvePlanById('evolve_studio')!;
    expect(plan.priceCents).toBe(450_000);
    expect(formatEvolvePrice(plan.priceCents, plan.priceQualifier, plan.billingInterval)).toBe('$4,500 / MONTH');
  });

  it('Private starts at $7,500/month and requires custom scope', () => {
    const plan = getEvolvePlanById('evolve_private')!;
    expect(plan.priceCents).toBe(750_000);
    expect(plan.priceQualifier).toBe('STARTING_AT');
    expect(plan.customScopeRequired).toBe(true);
    expect(plan.availability).toBe('CUSTOM_SCOPE_REQUIRED');
    expect(plan.channelLimit).toBeNull();
    expect(plan.assetCapacity).toBeNull();
    expect(formatEvolvePrice(plan.priceCents, plan.priceQualifier, plan.billingInterval)).toBe('FROM $7,500 / MONTH');
  });

  it('canonical package hierarchy is FOUNDATION -> ESSENTIAL -> GROWTH -> STUDIO -> PRIVATE', () => {
    expect(EVOLVE_PACKAGE_HIERARCHY).toEqual(['FOUNDATION', 'evolve_essential', 'evolve_growth', 'evolve_studio', 'evolve_private']);
  });
});

describe('EVOLVE project services', () => {
  it('Creative Direction Intensive is $1,500 fixed', () => {
    const s = getEvolveProjectServiceById('creative_direction_intensive')!;
    expect(s.priceCents).toBe(150_000);
    expect(s.priceQualifier).toBe('FIXED');
    expect(formatEvolvePrice(s.priceCents, s.priceQualifier, s.billingInterval)).toBe('$1,500');
  });

  it('Content Sprint starts at $1,250', () => {
    const s = getEvolveProjectServiceById('content_sprint')!;
    expect(s.priceCents).toBe(125_000);
    expect(s.priceQualifier).toBe('STARTING_AT');
    expect(formatEvolvePrice(s.priceCents, s.priceQualifier, s.billingInterval)).toBe('FROM $1,250');
  });

  it('Launch Campaign starts at $2,500', () => {
    const s = getEvolveProjectServiceById('launch_campaign')!;
    expect(s.priceCents).toBe(250_000);
    expect(formatEvolvePrice(s.priceCents, s.priceQualifier, s.billingInterval)).toBe('FROM $2,500');
  });

  it('Campaign World starts at $4,000', () => {
    const s = getEvolveProjectServiceById('campaign_world')!;
    expect(s.priceCents).toBe(400_000);
    expect(formatEvolvePrice(s.priceCents, s.priceQualifier, s.billingInterval)).toBe('FROM $4,000');
  });

  it('Visual DNA Refresh starts at $750', () => {
    const s = getEvolveProjectServiceById('visual_dna_refresh')!;
    expect(s.priceCents).toBe(75_000);
    expect(formatEvolvePrice(s.priceCents, s.priceQualifier, s.billingInterval)).toBe('FROM $750');
  });

  it('every project service purchase is explicitly not an approval', () => {
    for (const s of EVOLVE_PROJECT_SERVICES) {
      expect(s.governanceNotes.length).toBeGreaterThan(0);
    }
  });
});

describe('EVOLVE paid media', () => {
  it('minimum fee is $750 and percentage is 15%', () => {
    expect(EVOLVE_PAID_MEDIA_SERVICE.managementFeeMinCents).toBe(75_000);
    expect(EVOLVE_PAID_MEDIA_SERVICE.percentageOfSpend).toBe(0.15);
    expect(EVOLVE_PAID_MEDIA_SERVICE.feeLogic).toBe('HIGHER_OF');
    expect(EVOLVE_PAID_MEDIA_SERVICE.adSpendBilledSeparately).toBe(true);
  });

  it('is truthfully NOT_CONFIGURED — no ad-platform integration exists', () => {
    expect(EVOLVE_PAID_MEDIA_SERVICE.availability).toBe('NOT_CONFIGURED');
  });

  it('higher-of calculation: minimum wins for low ad spend', () => {
    // 15% of $1,000 = $150, below the $750 minimum
    expect(computePaidMediaFeeCents(100_000)).toBe(75_000);
  });

  it('higher-of calculation: percentage wins for high ad spend', () => {
    // 15% of $10,000 = $1,500, above the $750 minimum
    expect(computePaidMediaFeeCents(1_000_000)).toBe(150_000);
  });

  it('higher-of calculation: exact breakeven point', () => {
    // 15% of $5,000 = $750, equal to the minimum
    expect(computePaidMediaFeeCents(500_000)).toBe(75_000);
  });

  it('rejects negative ad spend', () => {
    expect(() => computePaidMediaFeeCents(-1)).toThrow();
  });
});

describe('getEvolveServiceCatalog', () => {
  it('returns one canonical catalog with all four service families', () => {
    const catalog = getEvolveServiceCatalog();
    expect(catalog.foundation.id).toBe('evolve_foundation');
    expect(catalog.plans).toHaveLength(4);
    expect(catalog.projectServices).toHaveLength(5);
    expect(catalog.paidMedia.id).toBe('paid_media_management');
  });
});

describe('price formatting contract', () => {
  it('never uses $1.5K / $1250 / $2.5k-style shorthand', () => {
    const allPrices = [
      formatEvolvePrice(EVOLVE_FOUNDATION.priceCents, EVOLVE_FOUNDATION.priceQualifier, EVOLVE_FOUNDATION.billingInterval),
      ...EVOLVE_RECURRING_PLANS.map((p) => formatEvolvePrice(p.priceCents, p.priceQualifier, p.billingInterval)),
      ...EVOLVE_PROJECT_SERVICES.map((s) => formatEvolvePrice(s.priceCents, s.priceQualifier, s.billingInterval)),
    ];
    for (const price of allPrices) {
      expect(price).toMatch(/^(FROM )?\$[\d,]+( \/ MONTH)?$/);
    }
  });
});
