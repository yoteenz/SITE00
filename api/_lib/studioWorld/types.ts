/**
 * Studio World external integration — conceptual contract shapes.
 *
 * STATUS: BLOCKED_PENDING_STUDIO_WORLD_CONTRACT
 * No STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md found in this repository.
 * These types define the adapter interface SITE 00 expects — NOT fabricated HTTP endpoints.
 */

export const STUDIO_WORLD_INTEGRATION_STATUS = 'BLOCKED_PENDING_CONTRACT' as const;

export type StudioWorldEngagementType = 'EVOLVE_MARKETING';

/** Conceptual provisioning request — actual shape must match Studio World contract when supplied. */
export type StudioWorldProvisionRequest = {
  externalSystem: 'SITE_00';
  externalProjectId?: string;
  externalClientId: string;
  externalEngagementId: string;
  brandId?: string;
  brandSetupRequired: boolean;
  engagementType: StudioWorldEngagementType;
  serviceType: string;
  campaignObjective?: string;
  deliverables?: string[];
  platforms?: string[];
  aspectRatios?: string[];
  quantity?: string;
  deadline?: string;
  approvedScope?: Record<string, unknown>;
  clientVisibleProjectId?: string;
};

export type StudioWorldProvisionResult = {
  campaignId: string;
  status: 'PROVISIONED' | 'ALREADY_EXISTS';
  clientPhase?: string;
};

/** Client-safe status from Studio World — no internal QC/provider details. */
export type StudioWorldClientStatus = {
  campaignId: string;
  clientPhase: string;
  clientActionRequired: boolean;
  clientActionLabel?: string;
  milestoneLabel?: string;
  nextExpectedAction?: string;
  syncStatus: 'SYNCED' | 'DELAYED' | 'ERROR';
};

export type StudioWorldClientReview = {
  id: string;
  title: string;
  reviewType: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  status: 'OPEN' | 'APPROVED' | 'REVISION_REQUESTED';
  allowsDirectionSelect?: boolean;
  directions?: Array<{ id: string; label: string; previewUrl?: string }>;
};

export type StudioWorldClientDeliverable = {
  id: string;
  title: string;
  format?: string;
  aspectRatio?: string;
  version?: string;
  previewUrl?: string;
  downloadUrl?: string;
  visibility: 'CLIENT_VISIBLE' | 'APPROVED';
};

export type StudioWorldApprovalRequest = {
  reviewId: string;
  clientUserId: string;
  action: 'APPROVE' | 'REQUEST_REVISION' | 'SELECT_DIRECTION';
  note?: string;
  directionId?: string;
  timestamp: string;
};

export type StudioWorldAdapterErrorCode =
  | 'STUDIO_CONNECTION_DELAYED'
  | 'PROJECT_ALREADY_INITIALIZED'
  | 'INTERNAL_CONNECTION_ERROR'
  | 'PRODUCTION_SETUP_REQUIRES_ATTENTION'
  | 'CONTRACT_UNAVAILABLE';

export class StudioWorldAdapterError extends Error {
  constructor(
    public readonly code: StudioWorldAdapterErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'StudioWorldAdapterError';
  }
}
