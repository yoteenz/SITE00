import type { CommercialMode, DeliverableRecord } from '../site00-commercial-canon/types.js';

export type IdentityCommercialSelection = {
  serviceId: string;
  packageId: string;
  commercialMode: CommercialMode;
  selectedOfferLabel?: string | null;
  sourceRoute?: string | null;
};

export type IdentityCommercialAuthorization = {
  status: 'NONE' | 'PENDING' | 'AUTHORIZED' | 'ABANDONED' | 'CANCELLED';
  authorizationRef: string | null;
  authorizedAt: string | null;
  /** Simulated / manual until Stripe — PAYMENT_PIPELINE_READY path */
  method: 'MANUAL_FOUNDER' | 'TEST_SIMULATION' | 'QUOTE_APPROVED';
};

export type IdentityReviewLifecycle =
  | 'NOT_STARTED'
  | 'REVIEW_READY'
  | 'CLIENT_REVIEWING'
  | 'REVISION_REQUESTED'
  | 'APPROVED';

export type IdentityRevisionRecord = {
  revisionNumber: number;
  requestedAt: string;
  requestedBy: string;
  note: string | null;
};

export type IdentityApprovalRecord = {
  approvedBy: string;
  approvedAt: string;
  approvedArtifactIds: readonly string[];
};

export type IdentityEntitlementUsage = {
  conceptsPresented: number;
  revisionCyclesUsed: number;
  deliverableClassesDelivered: number;
};

export type IdentityDeliverable = DeliverableRecord & {
  approvedArtifactIds: readonly string[];
  identityCanonVersion: number | null;
};

export type IdentityProductionSnapshot = {
  intakeId: string;
  clientId: string;
  brandId: string | null;
  serviceId: string;
  packageId: string;
  commercialMode: CommercialMode;
  projectId: string | null;
  projectSlug: string | null;
  authorization: IdentityCommercialAuthorization;
  review: IdentityReviewLifecycle;
  revisions: readonly IdentityRevisionRecord[];
  approval: IdentityApprovalRecord | null;
  deliverables: readonly IdentityDeliverable[];
  entitlementUsage: IdentityEntitlementUsage;
  /** Mirrors site00_projects.status when linked */
  projectStatus: string | null;
  intakeHandoff: Record<string, unknown>;
  abandonmentReason: 'INTAKE_ABANDONED' | 'AUTH_INCOMPLETE' | 'PROJECT_CANCELLED' | 'PRODUCTION_CANCELLED' | null;
};

export type IdentityCommercialState = {
  version: 1;
  selection: IdentityCommercialSelection;
  authorization: IdentityCommercialAuthorization;
  bootstrap: {
    projectId: string | null;
    projectSlug: string | null;
    fulfillmentAdapterId: 'identity-fulfillment';
  };
  production: IdentityProductionSnapshot | null;
};

export type ApprovedIdentityAuthority = {
  projectId: string;
  projectSlug: string;
  serviceId: string;
  packageId: string;
  approvedArtifactIds: readonly string[];
  identityCanonVersion: number | null;
  approvedAt: string;
  approvedBy: string;
};
