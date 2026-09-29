/**
 * Part 2 — Site00ServiceCatalog (canonical commercial source).
 */

import { SITE00_SERVICE_INVENTORY, SERVICE_COUNT } from '../site00-commercial-audit/serviceInventory.js';
import { getEvolvePlanById, getEvolveProjectServiceById, EVOLVE_FOUNDATION } from '../site00-evolve-commercial/catalog.js';
import { DUAL_PRICING_RESOLUTION } from './dualPricingTrees.js';
import { familyForServiceId } from './familyClassification.js';
import { deliverableContractForFamily } from './contracts.js';
import type {
  CommercialMode,
  ServiceFulfillmentContract,
  Site00CatalogPackage,
  Site00CatalogService,
  Site00ServiceCatalog,
} from './types.js';

export { SERVICE_COUNT };

function adapterForFamily(family: NonNullable<ReturnType<typeof familyForServiceId>>): string {
  switch (family) {
    case 'IDENTITY':
      return 'identity-fulfillment';
    case 'BUILDER_SIMPLE':
      return 'builder-simple-fulfillment';
    case 'BUILDER_CUSTOM_WORLD':
      return 'builder-custom-world-fulfillment';
    case 'MARKETING_CAMPAIGN':
      return 'marketing-campaign-fulfillment';
    case 'RECURRING_RETAINER':
      return 'recurring-retainer-fulfillment';
    case 'ADD_ON':
      return 'add-on-fulfillment';
    case 'CUSTOM_QUOTE':
      return 'custom-quote-fulfillment';
    case 'EVOLVE_PLATFORM':
      return 'evolve-platform-fulfillment';
    default:
      return 'custom-quote-fulfillment';
  }
}

function commercialModeForEntry(serviceId: string, billingClass: string): CommercialMode {
  if (billingClass === 'ADD_ON') return 'ADD_ON';
  if (billingClass === 'RETAINER' || serviceId.startsWith('evolve-recurring')) return 'RETAINER';
  if (billingClass === 'SUBSCRIPTION') return 'SUBSCRIPTION';
  if (billingClass === 'CUSTOM_QUOTE') return 'CUSTOM_QUOTE';
  if (billingClass === 'ONE_TIME') return 'FIXED_ONE_TIME';
  return 'CUSTOM_QUOTE';
}

function priceFromEvolveCommercial(serviceId: string): {
  priceMode: Site00CatalogPackage['priceMode'];
  priceReferenceCents: number | null;
  canonicalPriceSource: string | null;
} {
  if (serviceId === 'evolve-commercial-foundation') {
    return {
      priceMode: 'CANONICAL_CENTS',
      priceReferenceCents: EVOLVE_FOUNDATION.priceCents,
      canonicalPriceSource: 'evolve_foundation',
    };
  }
  const planMatch = serviceId.match(/^evolve-recurring-(\w+)$/);
  if (planMatch) {
    const planId = `evolve_${planMatch[1]}` as 'evolve_essential';
    const plan = getEvolvePlanById(planId);
    if (plan) {
      return {
        priceMode: 'CANONICAL_CENTS',
        priceReferenceCents: plan.priceCents,
        canonicalPriceSource: plan.id,
      };
    }
  }
  if (serviceId === 'evolve-project-creative-direction-intensive') {
    const svc = getEvolveProjectServiceById('creative_direction_intensive');
    return {
      priceMode: 'CANONICAL_CENTS',
      priceReferenceCents: svc?.priceCents ?? null,
      canonicalPriceSource: 'creative_direction_intensive',
    };
  }
  if (serviceId.startsWith('marketing-')) {
    return {
      priceMode: 'FOUNDER_PRICING_REQUIRED',
      priceReferenceCents: null,
      canonicalPriceSource: null,
    };
  }
  if (serviceId.includes('pricing-ui')) {
    return { priceMode: 'DISPLAY_ONLY', priceReferenceCents: null, canonicalPriceSource: null };
  }
  return { priceMode: 'DISPLAY_ONLY', priceReferenceCents: null, canonicalPriceSource: null };
}

function buildContract(
  serviceId: string,
  packageId: string,
  family: NonNullable<ReturnType<typeof familyForServiceId>>,
  commercialMode: CommercialMode,
): ServiceFulfillmentContract {
  const { completionCriteria, deliveryDestination } = deliverableContractForFamily(family);
  return {
    serviceId,
    packageId,
    family,
    commercialMode,
    includedDeliverables: ['FOUNDER_DECISION_REQUIRED'],
    scopeLimits: { default: 'FOUNDER_DECISION_REQUIRED' },
    revisionPolicy: 'FOUNDER_DECISION_REQUIRED',
    entitlements:
      family === 'MARKETING_CAMPAIGN' ? ['marketing-category'] : family === 'ADD_ON' ? ['add-on'] : [],
    intakeSchemaId:
      family === 'MARKETING_CAMPAIGN' ? 'marketing-creative-intake'
      : family === 'IDENTITY' ? 'site00-intake-identity'
      : family === 'BUILDER_SIMPLE' || family === 'BUILDER_CUSTOM_WORLD' ? 'site00-intake-builder'
      : 'FOUNDER_DECISION_REQUIRED',
    projectType:
      family === 'IDENTITY' ? 'IDENTITY'
      : family === 'BUILDER_SIMPLE' ? 'SITE'
      : family === 'BUILDER_CUSTOM_WORLD' ? 'WORLD'
      : family === 'MARKETING_CAMPAIGN' ? 'MARKETING_ENGAGEMENT'
      : 'FOUNDER_DECISION_REQUIRED',
    fulfillmentAdapterId: adapterForFamily(family),
    reviewRequirements: ['CLIENT_REVIEW'],
    completionCriteria,
    deliveryDestination,
    addOnCompatibility: family === 'MARKETING_CAMPAIGN' ? ['EXTRA_CHARACTER', 'NEW_ACTOR'] : [],
  };
}

function packageForInventoryEntry(entry: (typeof SITE00_SERVICE_INVENTORY)[number]): Site00CatalogPackage {
  const family = familyForServiceId(entry.serviceId)!;
  const commercialMode = commercialModeForEntry(entry.serviceId, entry.billingClass);
  const packageId = entry.serviceId;
  const pricing = priceFromEvolveCommercial(entry.serviceId);
  return {
    packageId,
    serviceId: entry.serviceId,
    name: entry.serviceName,
    publicDescription: entry.serviceName,
    family,
    commercialMode,
    priceMode: pricing.priceMode,
    priceReferenceCents: pricing.priceReferenceCents,
    canonicalPriceSource: pricing.canonicalPriceSource,
    intakeSchemaId: buildContract(entry.serviceId, packageId, family, commercialMode).intakeSchemaId,
    projectType: buildContract(entry.serviceId, packageId, family, commercialMode).projectType,
    fulfillmentAdapterId: adapterForFamily(family),
    entitlementTemplateId:
      family === 'MARKETING_CAMPAIGN' ? 'marketing-category'
      : family === 'RECURRING_RETAINER' ? 'evolve-recurring-plan'
      : family === 'BUILDER_SIMPLE' ? 'builder-simple'
      : family === 'BUILDER_CUSTOM_WORLD' ? 'builder-custom'
      : family === 'IDENTITY' ? 'identity'
      : family === 'ADD_ON' ? 'add-on'
      : null,
    ctaBehavior: entry.ctaType === 'INTAKE' ? 'INTAKE' : entry.ctaType === 'ASSESSMENT' ? 'ASSESSMENT' : entry.ctaType === 'CONTACT' ? 'CONTACT' : 'NONE',
    availability:
      entry.wiringStatus === 'DISPLAY_ONLY' ? 'DISPLAY_ONLY'
      : entry.wiringStatus === 'ORPHANED' ? 'ADMIN_ONLY'
      : 'AVAILABLE',
    fulfillmentContract: buildContract(entry.serviceId, packageId, family, commercialMode),
  };
}

let cachedCatalog: Site00ServiceCatalog | null = null;

export function getSite00ServiceCatalog(): Site00ServiceCatalog {
  if (cachedCatalog) return cachedCatalog;

  const byService = new Map<string, Site00CatalogService>();
  for (const entry of SITE00_SERVICE_INVENTORY) {
    const family = familyForServiceId(entry.serviceId);
    if (!family) continue;
    const pkg = packageForInventoryEntry(entry);
    const existing = byService.get(entry.serviceId);
    if (existing) {
      byService.set(entry.serviceId, { ...existing, packages: [...existing.packages, pkg] });
    } else {
      byService.set(entry.serviceId, {
        serviceId: entry.serviceId,
        name: entry.serviceName,
        serviceFamily: family,
        publicRoute: entry.publicRoute,
        packages: [pkg],
      });
    }
  }

  cachedCatalog = {
    version: '2026-09-29-spine1',
    canonicalPricingAuthority: DUAL_PRICING_RESOLUTION.canonicalPath,
    legacyPricingAuthorities: [DUAL_PRICING_RESOLUTION.legacyPath],
    services: [...byService.values()],
  };
  return cachedCatalog;
}

export function getCanonicalPackage(serviceId: string, packageId?: string): Site00CatalogPackage | null {
  const catalog = getSite00ServiceCatalog();
  const svc = catalog.services.find((s) => s.serviceId === serviceId);
  if (!svc) return null;
  const pid = packageId ?? serviceId;
  return svc.packages.find((p) => p.packageId === pid) ?? svc.packages[0] ?? null;
}

export function assertSingleCanonicalPricingAuthority(): boolean {
  const catalog = getSite00ServiceCatalog();
  return catalog.canonicalPricingAuthority.includes('site00-evolve-commercial');
}
