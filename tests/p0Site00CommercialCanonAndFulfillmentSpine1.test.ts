/**
 * P0.SITE00-COMMERCIAL-CANON-AND-FULFILLMENT-SPINE1
 */

import { describe, expect, it } from 'vitest';

import { SERVICE_COUNT, SITE00_SERVICE_INVENTORY } from '../shared/site00-commercial-audit/serviceInventory.js';
import {
  assertNoSilentLegacyBilling,
  assertSingleCanonicalPricingAuthority,
  buildWiringMatrixV2,
  countWiringStats,
  COMMERCIAL_FOUNDER_DECISIONS,
  DUAL_PRICING_RESOLUTION,
  familyForServiceId,
  FULFILLMENT_FAMILY_COUNT,
  getCanonicalPackage,
  getSite00ServiceCatalog,
  intakeContextFromPackage,
  isServicePaymentReady,
  listFulfillmentAdapters,
  mergeIntakeIntoProjectBootstrap,
  mockSurfaceWouldMasqueradeAsLive,
  packageContextSurvivesIntakeToProject,
  PAYMENT_PROVIDER_GATE,
  resolveCanonicalPackageId,
  resolveEntitlementContract,
  deliverableContractForFamily,
  deriveClientStatusFromAdapter,
  ORPHAN_RESOLUTION,
  DUPLICATED_SERVICES_RESOLUTION,
  TREE_A,
  TREE_B,
} from '../shared/site00-commercial-canon/index.js';

describe('P0.SITE00-COMMERCIAL-CANON-AND-FULFILLMENT-SPINE1', () => {
  it('1 one canonical service/package source is active', () => {
    const catalog = getSite00ServiceCatalog();
    expect(catalog.services.length).toBeGreaterThan(0);
    expect(assertSingleCanonicalPricingAuthority()).toBe(true);
    expect(catalog.canonicalPricingAuthority).toContain('site00-evolve-commercial');
  });

  it('2 legacy package aliases resolve to canonical IDs', () => {
    const resolved = resolveCanonicalPackageId('site00-evolve-pricing', 'marketing-retainer');
    expect(resolved?.packageId).toBe('evolve-recurring-growth');
  });

  it('3 duplicate pricing authority cannot silently diverge for billing', () => {
    expect(assertNoSilentLegacyBilling('site00-evolve-pricing')).toBe(false);
    expect(assertNoSilentLegacyBilling('site00-evolve-commercial')).toBe(true);
    expect(DUAL_PRICING_RESOLUTION.canonicalTree).toBe(TREE_A.id);
    expect(DUAL_PRICING_RESOLUTION.legacyCompatibilityTree).toBe(TREE_B.id);
  });

  it('4 all audited services have a fulfillment family', () => {
    expect(SERVICE_COUNT).toBe(SITE00_SERVICE_INVENTORY.length);
    for (const entry of SITE00_SERVICE_INVENTORY) {
      expect(familyForServiceId(entry.serviceId), entry.serviceId).toBeTruthy();
    }
    expect(FULFILLMENT_FAMILY_COUNT).toBeGreaterThanOrEqual(7);
  });

  it('5 every service resolves to a fulfillment adapter or explicit missing state', () => {
    const adapters = listFulfillmentAdapters();
    expect(adapters.length).toBeGreaterThanOrEqual(7);
    for (const entry of SITE00_SERVICE_INVENTORY) {
      const pkg = getCanonicalPackage(entry.serviceId);
      expect(pkg?.fulfillmentAdapterId).toBeTruthy();
      const reg = adapters.find((a) => a.id === pkg?.fulfillmentAdapterId);
      expect(reg, entry.serviceId).toBeTruthy();
    }
  });

  it('6 package context survives website → intake', () => {
    const pkg = getCanonicalPackage('marketing-campaign')!;
    const intake = intakeContextFromPackage(pkg);
    expect(intake.serviceId).toBe('marketing-campaign');
    expect(intake.packageId).toBe('marketing-campaign');
    expect(intake.intakeSchemaId).toBe('marketing-creative-intake');
  });

  it('7 intake context survives intake → project', () => {
    const pkg = getCanonicalPackage('marketing-campaign')!;
    const intake = intakeContextFromPackage(pkg);
    const project = mergeIntakeIntoProjectBootstrap(intake, {
      clientId: 'c1',
      brandId: null,
      commercialRecordId: 'eng-1',
      projectId: null,
      fulfillmentAdapterId: pkg.fulfillmentAdapterId,
      endClientId: null,
    });
    expect(packageContextSurvivesIntakeToProject(intake, project)).toBe(true);
  });

  it('8 project retains commercial contract via catalog package', () => {
    const pkg = getCanonicalPackage('bldr-site-class')!;
    expect(pkg.fulfillmentContract.fulfillmentAdapterId).toBe('builder-simple-fulfillment');
    expect(pkg.fulfillmentContract.scopeLimits.default).toBe('FOUNDER_DECISION_REQUIRED');
  });

  it('9 entitlement resolves through shared model', () => {
    const ent = resolveEntitlementContract('marketing-category');
    expect(ent?.enforcement).toBe('PIPELINE');
    expect(ent?.dimensions).toContain('characters');
  });

  it('10 deliverable contract exists per fulfillment family', () => {
    expect(deliverableContractForFamily('MARKETING_CAMPAIGN').completionCriteria.length).toBeGreaterThan(0);
    expect(deliverableContractForFamily('BUILDER_SIMPLE').deliveryDestination).toContain('site');
  });

  it('11 client-facing state derives from fulfillment adapter', () => {
    const derived = deriveClientStatusFromAdapter({
      clientId: 'c1',
      brandId: null,
      serviceId: 'marketing-campaign',
      packageId: 'marketing-campaign',
      commercialRecordId: 'e1',
      projectType: 'MARKETING_ENGAGEMENT',
      projectId: null,
      fulfillmentAdapterId: 'marketing-campaign-fulfillment',
      endClientId: null,
    });
    expect(derived.clientLabel).toBe('IN PRODUCTION');
  });

  it('12 mock commercial surfaces flagged', () => {
    expect(mockSurfaceWouldMasqueradeAsLive('evolve-pricing-plans')).toBe(true);
    expect(mockSurfaceWouldMasqueradeAsLive('portfolio-journal-seed')).toBe(false);
  });

  it('13 payment readiness fails if fulfillment contract incomplete', () => {
    const pay = isServicePaymentReady('marketing-campaign');
    expect(pay.ready).toBe(false);
    expect(pay.reasons.length).toBeGreaterThan(0);
  });

  it('14 custom quote services do not require fixed checkout cents', () => {
    const pay = isServicePaymentReady('bldr-enterprise-class');
    expect(pay.reasons.some((r) => r.includes('No canonical price reference'))).toBe(false);
  });

  it('15 add-ons require parent context', () => {
    const adapter = listFulfillmentAdapters().find((a) => a.id === 'add-on-fulfillment')!;
    const v = adapter.validateIntake(intakeContextFromPackage(getCanonicalPackage('studio-world-add-ons')!), {});
    expect(v.ok).toBe(false);
  });

  it('16 Marketing adapter id matches PR #1249 infrastructure', () => {
    const pkg = getCanonicalPackage('marketing-social-content')!;
    expect(pkg.fulfillmentAdapterId).toBe('marketing-campaign-fulfillment');
  });

  it('17 recurring services expose capacity requirement in entitlement template', () => {
    const ent = resolveEntitlementContract('evolve-recurring-plan');
    expect(ent?.dimensions).toContain('assets');
    expect(ent?.enforcement).toBe('INFORMATIONAL');
  });

  it('18 Founder decisions explicit', () => {
    expect(COMMERCIAL_FOUNDER_DECISIONS.length).toBeGreaterThanOrEqual(12);
    expect(COMMERCIAL_FOUNDER_DECISIONS.every((d) => d.decisionId && d.question)).toBe(true);
  });

  it('orphan and duplicate resolutions documented', () => {
    expect(ORPHAN_RESOLUTION.ORPHAN_LOCATION).toContain('EvolveCommercialPage');
    expect(DUPLICATED_SERVICES_RESOLUTION.length).toBe(2);
  });

  it('regenerated wiring matrix covers all audited services', () => {
    const matrix = buildWiringMatrixV2();
    expect(matrix.length).toBe(SERVICE_COUNT);
    const stats = countWiringStats(matrix);
    expect(stats.paymentReady).toBe(0);
    expect(PAYMENT_PROVIDER_GATE).toBe('BLOCKED');
  });
});
