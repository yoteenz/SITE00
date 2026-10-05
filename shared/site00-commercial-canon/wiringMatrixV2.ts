/**
 * Part 29 — Regenerated wiring matrix (post-canon).
 */

import { SITE00_SERVICE_INVENTORY } from '../site00-commercial-audit/serviceInventory.js';
import { familyForServiceId } from './familyClassification.js';
import { getSite00ServiceCatalog } from './serviceCatalog.js';
import { getFulfillmentAdapter } from './fulfillmentAdapter.js';
import { isServicePaymentReady } from './paymentReadiness.js';
import { COMMERCIAL_FOUNDER_DECISIONS } from './founderDecisions.js';

export type WiringMatrixV2Row = {
  service: string;
  family: string;
  commercialMode: string;
  canonicalPackage: string;
  intake: 'PASS' | 'PARTIAL' | 'FAIL';
  projectType: 'PASS' | 'PARTIAL' | 'FAIL';
  fulfillmentAdapter: 'PASS' | 'PARTIAL' | 'MISSING';
  entitlement: 'PASS' | 'PARTIAL' | 'FAIL';
  deliverable: 'PASS' | 'PARTIAL' | 'FAIL';
  completion: 'PASS' | 'PARTIAL' | 'FAIL';
  clientStatus: 'PASS' | 'PARTIAL' | 'FAIL';
  paymentReady: 'PASS' | 'FAIL';
  founderDecision: string | 'NONE';
};

function cellAdapter(adapterId: string): WiringMatrixV2Row['fulfillmentAdapter'] {
  const a = getFulfillmentAdapter(adapterId);
  if (!a) return 'MISSING';
  if (a.implementation === 'WIRED') return 'PASS';
  if (a.implementation === 'PARTIAL') return 'PARTIAL';
  return 'MISSING';
}

export function buildWiringMatrixV2(): WiringMatrixV2Row[] {
  getSite00ServiceCatalog();
  return SITE00_SERVICE_INVENTORY.map((entry) => {
    const pkg = getSite00ServiceCatalog().services.find((s) => s.serviceId === entry.serviceId)?.packages[0];
    const family = familyForServiceId(entry.serviceId) ?? 'UNKNOWN';
    const fd = COMMERCIAL_FOUNDER_DECISIONS.find((d) => d.serviceId === entry.serviceId);
    const pay = isServicePaymentReady(entry.serviceId);
    const identityFamily = family === 'IDENTITY';
    const intakeCell: WiringMatrixV2Row['intake'] =
      pkg?.intakeSchemaId.includes('FOUNDER') ? 'FAIL'
      : identityFamily && pkg?.intakeSchemaId === 'site00-intake-identity' ? 'PASS'
      : entry.wiringStatus === 'PARTIALLY_WIRED' ? 'PARTIAL'
      : 'PARTIAL';
    const projectCell: WiringMatrixV2Row['projectType'] =
      pkg?.projectType.includes('FOUNDER') ? 'FAIL'
      : identityFamily && pkg?.projectType === 'IDENTITY' ? 'PASS'
      : 'PARTIAL';
    return {
      service: entry.serviceId,
      family,
      commercialMode: pkg?.commercialMode ?? 'CUSTOM_QUOTE',
      canonicalPackage: pkg?.packageId ?? entry.serviceId,
      intake: intakeCell,
      projectType: projectCell,
      fulfillmentAdapter: pkg ? cellAdapter(pkg.fulfillmentAdapterId) : 'MISSING',
      entitlement:
        identityFamily && pkg?.entitlementTemplateId === 'identity' ? 'PARTIAL'
        : pkg?.entitlementTemplateId && pkg.entitlementTemplateId !== null ? 'PARTIAL'
        : 'FAIL',
      deliverable: entry.wiringStatus === 'DISPLAY_ONLY' ? 'FAIL' : identityFamily ? 'PARTIAL' : 'PARTIAL',
      completion: identityFamily ? 'PARTIAL' : 'PARTIAL',
      clientStatus: entry.wiringStatus === 'DISPLAY_ONLY' ? 'FAIL' : identityFamily ? 'PARTIAL' : 'PARTIAL',
      paymentReady: pay.ready ? 'PASS' : 'FAIL',
      founderDecision: fd?.decisionId ?? 'NONE',
    };
  });
}

export function countWiringStats(matrix: WiringMatrixV2Row[]): {
  fullyWired: number;
  partiallyWired: number;
  displayOnly: number;
  paymentReady: number;
} {
  const inv = SITE00_SERVICE_INVENTORY;
  return {
    fullyWired: inv.filter((e) => e.wiringStatus === 'FULLY_WIRED').length,
    partiallyWired: inv.filter((e) => e.wiringStatus === 'PARTIALLY_WIRED').length,
    displayOnly: inv.filter((e) => e.wiringStatus === 'DISPLAY_ONLY').length,
    paymentReady: matrix.filter((r) => r.paymentReady === 'PASS').length,
  };
}
