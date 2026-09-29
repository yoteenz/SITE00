/**
 * Static orphan / duplicate commercial truth detection (no DB).
 */

import { formatEvolvePrice, getEvolveServiceCatalog } from '../site00-evolve-commercial/catalog.js';
import { EVOLVE_DIRECTED_PLANS, EVOLVE_SELF_DIRECTED_PLANS } from '../site00-evolve-pricing/catalog.js';
import { MARKETING_CONTENT_SERVICES } from '../site00-marketing/serviceTaxonomy.js';
import { MARKETING_ENTITLEMENT_TEMPLATES } from '../site00-marketing-commercial/entitlementTemplates.js';

export type OrphanFinding = {
  code: string;
  severity: 'P0' | 'P1' | 'P2';
  message: string;
};

export function detectCommercialOrphans(): OrphanFinding[] {
  const findings: OrphanFinding[] = [];

  const catalog = getEvolveServiceCatalog();
  const catalogEntries = [
    catalog.foundation,
    ...catalog.plans,
    ...catalog.projectServices,
    catalog.paidMedia,
  ];
  const catalogIds = new Set<string>();
  for (const entry of catalogEntries) {
    if (catalogIds.has(entry.id)) {
      findings.push({
        code: 'DUPLICATE_EVOLVE_CATALOG_ID',
        severity: 'P1',
        message: `Duplicate evolve-commercial catalog id: ${entry.id}`,
      });
    }
    catalogIds.add(entry.id);
    if (entry.priceCents > 0) {
      formatEvolvePrice(entry.priceCents, entry.priceQualifier, entry.billingInterval);
    }
  }

  const pricingUiIds = [
    ...EVOLVE_SELF_DIRECTED_PLANS.map((p) => p.id),
    ...EVOLVE_DIRECTED_PLANS.map((p) => p.id),
  ];
  for (const id of pricingUiIds) {
    if (catalogIds.has(id)) {
      findings.push({
        code: 'PRICING_UI_COLLIDES_WITH_COMMERCIAL_CATALOG',
        severity: 'P1',
        message: `${id} exists in both evolve-pricing UI and evolve-commercial catalog`,
      });
    }
  }

  if (pricingUiIds.length > 0) {
    findings.push({
      code: 'DUPLICATE_EVOLVE_PRICING_TRUTH',
      severity: 'P0',
      message:
        'Public /evolve/plans uses shared/site00-evolve-pricing/catalog.ts while managed EVOLVE SKUs use shared/site00-evolve-commercial/catalog.ts — conflicting dollar amounts and plan IDs',
    });
  }

  for (const svc of MARKETING_CONTENT_SERVICES) {
    if (!MARKETING_ENTITLEMENT_TEMPLATES[svc.id]) {
      findings.push({
        code: 'MARKETING_CATEGORY_WITHOUT_ENTITLEMENT_TEMPLATE',
        severity: 'P1',
        message: `Marketing category ${svc.id} has no entitlement template`,
      });
    }
  }

  findings.push({
    code: 'EVOLVE_COMMERCIAL_PAGE_UNROUTED',
    severity: 'P1',
    message:
      'EvolveCommercialPage.tsx renders canonical evolve-commercial catalog but is not registered in Site00Routes — public cannot reach admin catalog UI',
  });

  findings.push({
    code: 'NO_STRIPE_CHECKOUT_IN_REPO',
    severity: 'P2',
    message: 'No Stripe checkout/webhook handlers; payment_state CONFIRMED is simulated or admin-triggered',
  });

  findings.push({
    code: 'EVOLVE_ENTITLEMENTS_INFORMATIONAL_ONLY',
    severity: 'P1',
    message: 'shared/site00-evolve-commercial/entitlements.ts does not enforce recurring plan capacity in production workflows',
  });

  return findings;
}
