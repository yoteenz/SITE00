/**
 * P0.SITE00-COMMERCIAL-CANON-AND-FULFILLMENT-SPINE1
 * Canonical commercial + fulfillment contracts (dependency-free).
 */

export type ServiceFulfillmentFamily =
  | 'IDENTITY'
  | 'BUILDER_SIMPLE'
  | 'BUILDER_CUSTOM_WORLD'
  | 'MARKETING_CAMPAIGN'
  | 'RECURRING_RETAINER'
  | 'ADD_ON'
  | 'CUSTOM_QUOTE'
  | 'EVOLVE_PLATFORM'; // assessments + hub — not checkout SKUs

export type CommercialMode =
  | 'FIXED_ONE_TIME'
  | 'SUBSCRIPTION'
  | 'RETAINER'
  | 'CUSTOM_QUOTE'
  | 'MILESTONE'
  | 'ADD_ON';

export type PriceMode = 'CANONICAL_CENTS' | 'DISPLAY_ONLY' | 'FOUNDER_PRICING_REQUIRED' | 'NOT_CONFIGURED';

export type ServiceAvailability = 'AVAILABLE' | 'DISPLAY_ONLY' | 'ADMIN_ONLY' | 'DEPRECATED';

export type FulfillmentStatus =
  | 'NOT_STARTED'
  | 'INTAKE'
  | 'READY'
  | 'IN_PRODUCTION'
  | 'AWAITING_CLIENT'
  | 'REVISION'
  | 'APPROVED'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'COMPLETE'
  | 'BLOCKED';

export type FounderDecisionType =
  | 'PRICING'
  | 'SCOPE_LIMIT'
  | 'DELIVERABLE_DEFINITION'
  | 'REVISION_POLICY'
  | 'SUBSCRIPTION_TERMS'
  | 'ROUTE_OR_UI';

export type CommercialFounderDecision = {
  decisionId: string;
  serviceId: string;
  packageId: string | null;
  question: string;
  whyRequired: string;
  blockingArea: string;
  recommendedDecisionType: FounderDecisionType;
};

export type ServiceFulfillmentContract = {
  serviceId: string;
  packageId: string;
  family: ServiceFulfillmentFamily;
  commercialMode: CommercialMode;
  includedDeliverables: readonly string[];
  scopeLimits: Record<string, number | 'FOUNDER_DECISION_REQUIRED'>;
  revisionPolicy: string | 'FOUNDER_DECISION_REQUIRED';
  entitlements: readonly string[];
  intakeSchemaId: string;
  projectType: string;
  fulfillmentAdapterId: string;
  reviewRequirements: readonly string[];
  completionCriteria: readonly string[];
  deliveryDestination: string | 'FOUNDER_DECISION_REQUIRED';
  addOnCompatibility: readonly string[];
};

export type Site00CatalogPackage = {
  packageId: string;
  serviceId: string;
  name: string;
  publicDescription: string;
  family: ServiceFulfillmentFamily;
  commercialMode: CommercialMode;
  priceMode: PriceMode;
  /** When CANONICAL_CENTS — integer cents from evolve-commercial or explicit null */
  priceReferenceCents: number | null;
  canonicalPriceSource: string | null;
  intakeSchemaId: string;
  projectType: string;
  fulfillmentAdapterId: string;
  entitlementTemplateId: string | null;
  ctaBehavior: 'INTAKE' | 'ASSESSMENT' | 'SIGN_IN' | 'CONTACT' | 'ADMIN_ASSIGN' | 'NONE';
  availability: ServiceAvailability;
  fulfillmentContract: ServiceFulfillmentContract;
};

export type Site00CatalogService = {
  serviceId: string;
  name: string;
  serviceFamily: ServiceFulfillmentFamily;
  publicRoute: string | null;
  packages: readonly Site00CatalogPackage[];
};

export type Site00ServiceCatalog = {
  version: string;
  canonicalPricingAuthority: string;
  legacyPricingAuthorities: readonly string[];
  services: readonly Site00CatalogService[];
};

export type LegacyPackageAlias = {
  legacyAuthority: string;
  legacyPackageId: string;
  canonicalServiceId: string;
  canonicalPackageId: string;
  notes: string;
};

export type ProjectBootstrapContext = {
  clientId: string;
  brandId: string | null;
  serviceId: string;
  packageId: string;
  commercialRecordId: string;
  projectType: string;
  projectId: string | null;
  fulfillmentAdapterId: string;
  endClientId: string | null;
};

export type IntakeBootstrapContext = {
  serviceId: string;
  packageId: string;
  priceMode: PriceMode;
  projectType: string;
  intakeSchemaId: string;
};

export type CanonicalEntitlementContract = {
  entitlementTemplateId: string;
  dimensions: readonly (
    | 'pages'
    | 'concepts'
    | 'revisions'
    | 'campaigns'
    | 'characters'
    | 'actors'
    | 'sets'
    | 'assets'
    | 'generationCredits'
    | 'supportHours'
    | 'channels'
  )[];
  enforcement: 'PIPELINE' | 'INFORMATIONAL' | 'NOT_WIRED';
};

export type DeliverableRecord = {
  deliverableId: string;
  projectId: string;
  serviceId: string;
  packageId: string;
  version: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REVISION';
  deliveryStatus: 'DRAFT' | 'CLIENT_VISIBLE' | 'DELIVERED';
  completionCriteriaRef: string;
};

export type MockCommercialSurface = {
  id: string;
  location: string;
  resolution: 'REMOVE' | 'CONNECT' | 'REPLACE_WITH_REAL_STATE' | 'KEEP_AS_DEV_ONLY';
  reason: string;
};
