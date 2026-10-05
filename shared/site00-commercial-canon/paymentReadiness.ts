/**
 * Part 25 — isServicePaymentReady
 */

import { getFulfillmentAdapter } from './fulfillmentAdapter.js';
import { getCanonicalPackage } from './serviceCatalog.js';
import { deliverableContractForFamily } from './contracts.js';
import { resolveEntitlementContract } from './entitlementContract.js';

export type PaymentReadinessResult = {
  ready: boolean;
  reasons: readonly string[];
};

export function isServicePaymentReady(serviceId: string, packageId?: string): PaymentReadinessResult {
  const reasons: string[] = [];
  const pkg = getCanonicalPackage(serviceId, packageId);
  if (!pkg) {
    return { ready: false, reasons: ['No canonical package in Site00ServiceCatalog'] };
  }

  if (pkg.priceMode === 'DISPLAY_ONLY') reasons.push('Price is display-only legacy');
  if (pkg.commercialMode === 'CUSTOM_QUOTE') reasons.push('Custom quote — fixed checkout not required but quote flow incomplete');
  if (pkg.fulfillmentContract.intakeSchemaId === 'FOUNDER_DECISION_REQUIRED') {
    reasons.push('Intake schema not defined');
  }
  if (pkg.fulfillmentContract.projectType === 'FOUNDER_DECISION_REQUIRED') {
    reasons.push('Project type not defined');
  }

  const adapter = getFulfillmentAdapter(pkg.fulfillmentAdapterId);
  if (!adapter) reasons.push('Missing fulfillment adapter');
  else if (adapter.implementation === 'MISSING') reasons.push('Fulfillment adapter not implemented');

  const ent = resolveEntitlementContract(pkg.entitlementTemplateId);
  if (pkg.entitlementTemplateId && ent?.enforcement === 'NOT_WIRED') {
    reasons.push('Entitlement template not enforced in pipeline');
  }

  const dlv = deliverableContractForFamily(pkg.family);
  if (dlv.deliveryDestination === 'FOUNDER_DECISION_REQUIRED') {
    reasons.push('Deliverable destination undefined');
  }

  if (
    pkg.commercialMode !== 'CUSTOM_QUOTE' &&
    pkg.commercialMode !== 'ADD_ON' &&
    pkg.priceMode !== 'CANONICAL_CENTS' &&
    pkg.priceMode !== 'FOUNDER_PRICING_REQUIRED' &&
    pkg.family !== 'MARKETING_CAMPAIGN'
  ) {
    reasons.push('No canonical price reference for fixed checkout');
  }

  if (pkg.commercialMode !== 'CUSTOM_QUOTE') {
    reasons.push('Cancellation/refund behavior FOUNDER_DECISION_REQUIRED');
  }

  if (pkg.commercialMode === 'CUSTOM_QUOTE') {
    reasons.push('Quote/deposit flow not fully wired');
  }

  return { ready: reasons.length === 0, reasons };
}

export const PAYMENT_PROVIDER_GATE: 'BLOCKED' | 'READY' = 'BLOCKED';
