/**
 * P0.SITE00.ALL-SERVICES-COMMERCIAL-WIRING-AUDIT1
 * Forensic audit types — not billing truth.
 */

export type ServiceWiringStatus =
  | 'FULLY_WIRED'
  | 'PARTIALLY_WIRED'
  | 'DISPLAY_ONLY'
  | 'DUPLICATED'
  | 'ORPHANED'
  | 'UNKNOWN';

export type ServiceFulfillmentStatus =
  | 'NOT_STARTED'
  | 'INTAKE'
  | 'IN_PRODUCTION'
  | 'AWAITING_CLIENT'
  | 'REVISION'
  | 'APPROVED'
  | 'DELIVERED'
  | 'COMPLETE'
  | 'BLOCKED';

export type PaymentReadiness = 'PAYMENT_READY' | 'NOT_PAYMENT_READY' | 'CUSTOM_QUOTE';

export type CommercialBillingClass =
  | 'ONE_TIME'
  | 'SUBSCRIPTION'
  | 'RETAINER'
  | 'MILESTONE'
  | 'ADD_ON'
  | 'CUSTOM_QUOTE';

export type GapPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type ServiceFulfillmentContract = {
  serviceId: string;
  packageId: string | null;
  deliverables: readonly string[];
  includedRounds: number | 'FOUNDER_DEFINITION_REQUIRED';
  includedAssets: number | 'FOUNDER_DEFINITION_REQUIRED';
  includedPages: number | 'FOUNDER_DEFINITION_REQUIRED';
  includedConcepts: number | 'FOUNDER_DEFINITION_REQUIRED';
  includedGenerations: number | 'FOUNDER_DEFINITION_REQUIRED';
  includedSupport: string | 'FOUNDER_DEFINITION_REQUIRED';
  timelineExpectation: string | 'FOUNDER_DEFINITION_REQUIRED';
  entitlements: readonly string[];
  fulfillmentPipelineId: string;
  completionCriteria: readonly string[];
};

export type ServiceInventoryEntry = {
  serviceId: string;
  serviceName: string;
  publicRoute: string;
  servicePageRoute: string;
  packageSource: string;
  pricingSource: string;
  ctaType: 'INTAKE' | 'CHECKOUT' | 'CONTACT' | 'SIGN_IN' | 'ASSESSMENT' | 'ANCHOR' | 'NONE';
  purchaseEntryPoint: string;
  intakeRoute: string | null;
  projectType: string | null;
  fulfillmentSystem: string;
  clientWorkspaceRoute: string | null;
  deliveryDestination: string | null;
  billingClass: CommercialBillingClass;
  paymentReadiness: PaymentReadiness;
  wiringStatus: ServiceWiringStatus;
};

export type WiringMatrixCell = 'PASS' | 'PARTIAL' | 'FAIL' | 'MISSING';

export type ServiceWiringMatrixRow = {
  service: string;
  publicPage: WiringMatrixCell;
  package: WiringMatrixCell;
  purchase: WiringMatrixCell;
  intake: WiringMatrixCell;
  project: WiringMatrixCell;
  pipeline: WiringMatrixCell;
  entitlement: WiringMatrixCell;
  clientStatus: WiringMatrixCell;
  deliverable: WiringMatrixCell;
  paymentReady: WiringMatrixCell;
};

export const UNIFIED_COMMERCIAL_EVENT_TYPES = [
  'PURCHASE_CREATED',
  'PAYMENT_CONFIRMED',
  'SUBSCRIPTION_STARTED',
  'ENTITLEMENT_GRANTED',
  'ADD_ON_PURCHASED',
  'PROJECT_ACTIVATED',
  'REFUND',
  'CANCEL',
  'SUBSCRIPTION_RENEWED',
] as const;

export type UnifiedCommercialEventType = (typeof UNIFIED_COMMERCIAL_EVENT_TYPES)[number];
