/**
 * P0.SITE00.ALL-SERVICES-COMMERCIAL-WIRING-AUDIT1
 */

import { describe, expect, it } from 'vitest';

import { detectCommercialOrphans } from '../shared/site00-commercial-audit/orphanDetection.js';
import { SERVICE_COUNT, SITE00_SERVICE_INVENTORY } from '../shared/site00-commercial-audit/serviceInventory.js';
import { SERVICE_WIRING_MATRIX } from '../shared/site00-commercial-audit/wiringMatrix.js';
import { UNIFIED_COMMERCIAL_EVENT_TYPES } from '../shared/site00-commercial-audit/types.js';
import { MARKETING_CONTENT_SERVICES } from '../shared/site00-marketing/serviceTaxonomy.js';

describe('P0.SITE00.ALL-SERVICES-COMMERCIAL-WIRING-AUDIT1', () => {
  it('discovers a non-empty service inventory', () => {
    expect(SERVICE_COUNT).toBeGreaterThanOrEqual(20);
    expect(SITE00_SERVICE_INVENTORY.length).toBe(SERVICE_COUNT);
  });

  it('every marketing taxonomy category appears in inventory or dedicated engagement path', () => {
    const marketingIds = SITE00_SERVICE_INVENTORY.filter((s) => s.serviceId.startsWith('marketing-')).map(
      (s) => s.serviceId.replace('marketing-', ''),
    );
    for (const svc of MARKETING_CONTENT_SERVICES) {
      const covered =
        marketingIds.includes(svc.id) ||
        SITE00_SERVICE_INVENTORY.some((e) => e.intakeRoute?.includes(svc.id));
      expect(covered, `missing inventory row for marketing ${svc.id}`).toBe(true);
    }
  });

  it('flags duplicate EVOLVE pricing truth and unrouted commercial page', () => {
    const codes = detectCommercialOrphans().map((f) => f.code);
    expect(codes).toContain('DUPLICATE_EVOLVE_PRICING_TRUTH');
    expect(codes).toContain('EVOLVE_COMMERCIAL_PAGE_UNROUTED');
    expect(codes).toContain('NO_STRIPE_CHECKOUT_IN_REPO');
  });

  it('marketing categories have entitlement templates (no orphan templates)', () => {
    const orphan = detectCommercialOrphans().find((f) => f.code === 'MARKETING_CATEGORY_WITHOUT_ENTITLEMENT_TEMPLATE');
    expect(orphan).toBeUndefined();
  });

  it('wiring matrix covers primary service families', () => {
    const names = SERVICE_WIRING_MATRIX.map((r) => r.service);
    expect(names.some((n) => n.includes('IDNTY'))).toBe(true);
    expect(names.some((n) => n.includes('BLDR'))).toBe(true);
    expect(names.some((n) => n.includes('Marketing'))).toBe(true);
  });

  it('unified commercial event vocabulary is defined for future payment wiring', () => {
    expect(UNIFIED_COMMERCIAL_EVENT_TYPES).toContain('PAYMENT_CONFIRMED');
    expect(UNIFIED_COMMERCIAL_EVENT_TYPES).toContain('ENTITLEMENT_GRANTED');
  });
});
