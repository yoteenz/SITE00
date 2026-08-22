/** SITE 00 EVOLVE / Marketing & Content — shared domain types. */

export type MarketingServiceCategory =
  | 'social-content'
  | 'campaign'
  | 'product-campaign'
  | 'brand-film'
  | 'ugc-style'
  | 'launch-campaign'
  | 'content-system';

export type MarketingEngagementStatus =
  | 'DRAFT'
  | 'INTAKE_COMPLETE'
  | 'SCOPE_REVIEW'
  | 'QUOTE_READY'
  | 'AWAITING_AUTHORIZATION'
  | 'AUTHORIZED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PROVISIONING'
  | 'PROVISIONING_RETRY_REQUIRED'
  | 'ACTIVE'
  | 'CLIENT_ACTION_REQUIRED'
  | 'REVIEW_READY'
  | 'REVISION_IN_PROGRESS'
  | 'DELIVERABLE_READY'
  | 'COMPLETE'
  | 'PAUSED'
  | 'CANCELLED';

export type MarketingPaymentState = 'PENDING' | 'AUTHORIZED' | 'CONFIRMED' | 'FAILED';

export type MarketingBrandSource = 'SITE00_IDENTITY' | 'SITE00_PROJECT' | 'EXTERNAL_BRAND' | 'UNKNOWN';

export type MarketingAssetCategory =
  | 'logo'
  | 'brand-guide'
  | 'products'
  | 'character-talent'
  | 'environments'
  | 'wardrobe'
  | 'packaging'
  | 'reference-content'
  | 'campaign-references'
  | 'copy'
  | 'other';

export type MarketingIntakeRecord = {
  businessName?: string;
  existingProjectId?: string;
  existingProjectSlug?: string;
  campaignObjective?: string;
  makingWhat?: string;
  targetAudience?: string;
  platforms?: string[];
  deliverableTypes?: string[];
  quantityCadence?: string;
  deadline?: string;
  launchDate?: string;
  productService?: string;
  copyMessaging?: string;
  restrictions?: string;
  approvalContact?: string;
  additionalNotes?: string;
  assets?: Array<{ category: MarketingAssetCategory; label: string; reference?: string }>;
};

export type MarketingScopeRecord = {
  serviceCategory: MarketingServiceCategory;
  platforms?: string[];
  deliverableTypes?: string[];
  quantity?: string;
  duration?: string;
  aspectRatios?: string[];
  complexity?: string;
  cadence?: string;
  revisions?: string;
  turnaround?: string;
  addOns?: string[];
  status: 'DRAFT' | 'READY' | 'APPROVED';
};

export type MarketingEngagementRecord = {
  id: string;
  engagementCode: string;
  clientEmail: string;
  clientUserId?: string | null;
  projectId?: string | null;
  identityId?: string | null;
  campaignName: string;
  serviceCategory: MarketingServiceCategory;
  status: MarketingEngagementStatus;
  paymentState: MarketingPaymentState;
  brandSource: MarketingBrandSource;
  brandSetupRequired: boolean;
  intake: MarketingIntakeRecord;
  scope: MarketingScopeRecord;
  clientPhase: string;
  clientActionRequired: boolean;
  clientActionLabel?: string | null;
  provisioningState: string;
  provisioningError?: string | null;
  studioWorldCampaignId?: string | null;
  externalSyncStatus: string;
  authorizedAt?: string | null;
  paidAt?: string | null;
  provisionedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketingClientReview = {
  id: string;
  engagementId: string;
  title: string;
  reviewType: 'direction' | 'storyboard' | 'keyframe' | 'content' | 'video' | 'deliverable';
  previewUrl?: string;
  thumbnailUrl?: string;
  status: 'OPEN' | 'APPROVED' | 'REVISION_REQUESTED';
  allowsDirectionSelect?: boolean;
  directions?: Array<{ id: string; label: string; previewUrl?: string }>;
};

export type MarketingDeliverable = {
  id: string;
  engagementId: string;
  title: string;
  format?: string;
  aspectRatio?: string;
  version?: string;
  previewUrl?: string;
  downloadUrl?: string;
  status: 'APPROVED' | 'CLIENT_VISIBLE';
};

export type MarketingVaultLink = {
  id: string;
  title: string;
  format?: string;
  aspectRatio?: string;
  version?: string;
  previewUrl?: string;
  downloadUrl?: string;
  vaultStatus: string;
};

export type MarketingEngagementPayload = MarketingEngagementRecord & {
  reviews: MarketingClientReview[];
  deliverables: MarketingDeliverable[];
  vaultLinks?: MarketingVaultLink[];
  campaignHistory: Array<{ code: string; name: string; status: MarketingEngagementStatus }>;
  reusedIdentity?: { name: string; source: string } | null;
};
