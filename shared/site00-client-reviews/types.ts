/** P0.CLIENT.2 — Client Reviews shared types (browser + server safe). */

import type { ClientProjectRole } from '../site00-client-project-room/types.js';

export type ClientReviewStatus =
  | 'READY_FOR_REVIEW'
  | 'AWAITING_CLIENT'
  | 'REVISION_IN_PROGRESS'
  | 'APPROVED'
  | 'DECLINED'
  | 'SUPERSEDED'
  | 'LOCKED';

export type ClientReviewObjectType =
  | 'IDENTITY_DIRECTION'
  | 'BRAND_SYSTEM'
  | 'HOMEPAGE_DIRECTION'
  | 'PAGE_DESIGN'
  | 'MOBILE_SCREEN'
  | 'APP_SCREEN'
  | 'MARKETING_DIRECTION'
  | 'CAMPAIGN_ASSET'
  | 'CONTENT_SYSTEM'
  | 'DELIVERABLE'
  | 'OTHER_CLIENT_REVIEW';

export type ClientReviewViewport = 'MOBILE' | 'TABLET' | 'DESKTOP';

export type ClientCompareMode =
  | 'PREVIOUS_CURRENT'
  | 'DIRECTION_DIRECTION'
  | 'REFERENCE_CURRENT'
  | 'VERSION_VERSION';

export type ClientReviewDecisionType = 'APPROVE' | 'REQUEST_REVISION' | 'DECLINE_DIRECTION' | 'REQUEST_REVISIT';

export type ClientCommentVisibility = 'CLIENT_AND_SITE00' | 'SITE00_INTERNAL';

export type ClientCommentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export type ClientCommentClientStatus = 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED';

export type ApprovalConsequence = {
  label: string;
  items: string[];
};

export type ClientReviewVersion = {
  versionId: string;
  reviewId: string;
  label: string;
  createdAt: string;
  clientSummary: string;
  previewAssetUrl: string | null;
  previewAssetAlt: string;
  availableViewports: ClientReviewViewport[];
  status: ClientReviewStatus;
  isCurrent: boolean;
  isApproved: boolean;
  isSuperseded: boolean;
};

export type ClientReviewObject = {
  reviewId: string;
  projectId: string;
  projectSlug: string;
  phaseId: string;
  phaseLabel: string;
  objectType: ClientReviewObjectType;
  title: string;
  subtitle: string;
  status: ClientReviewStatus;
  statusLabel: string;
  currentVersionId: string;
  availableVersionIds: string[];
  availableViewports: ClientReviewViewport[];
  referenceAvailable: boolean;
  compareAvailable: boolean;
  compareMode: ClientCompareMode | null;
  compareLeftLabel: string | null;
  compareRightLabel: string | null;
  compareLeftVersionId: string | null;
  compareRightVersionId: string | null;
  commentingAllowed: boolean;
  annotationAllowed: boolean;
  approvalAllowed: boolean;
  revisionAllowed: boolean;
  declineAllowed: boolean;
  approvalConsequences: ApprovalConsequence | null;
  thumbnailUrl: string | null;
  readyAt: string;
  updatedAt: string;
  actionRequired: boolean;
  versionLabel: string;
};

export type ClientReviewComment = {
  commentId: string;
  projectId: string;
  reviewId: string;
  versionId: string;
  viewport: ClientReviewViewport | null;
  authorId: string;
  authorRole: ClientProjectRole | 'SITE00';
  body: string;
  annotationId: string | null;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  visibility: ClientCommentVisibility;
  clientStatus: ClientCommentClientStatus;
};

export type ClientReviewAnnotation = {
  annotationId: string;
  projectId: string;
  reviewId: string;
  versionId: string;
  viewport: ClientReviewViewport;
  xPercent: number;
  yPercent: number;
  widthPercent: number | null;
  heightPercent: number | null;
  markerIndex: number;
  commentId: string | null;
  createdAt: string;
};

export type ClientApprovalReceipt = {
  receiptId: string;
  projectId: string;
  reviewId: string;
  versionId: string;
  actorUserId: string;
  actorRole: ClientProjectRole;
  decision: 'APPROVE';
  approvedConsequences: ApprovalConsequence | null;
  commentSnapshot: string | null;
  timestamp: string;
  requestId: string;
};

export type ClientRevisionRequestReceipt = {
  requestId: string;
  projectId: string;
  reviewId: string;
  versionId: string;
  actorUserId: string;
  actorRole: ClientProjectRole;
  summary: string;
  commentIds: string[];
  annotationIds: string[];
  category: string | null;
  createdAt: string;
  status: 'RECEIVED' | 'IN_PROGRESS' | 'READY_FOR_REVIEW';
};

export type ClientDecisionHistoryEvent = {
  id: string;
  dateLabel: string;
  summary: string;
  type: 'APPROVAL' | 'REVISION' | 'DECLINE' | 'COMMENT' | 'OPENED' | 'REVISIT';
};

export type ClientReviewDetail = {
  review: ClientReviewObject;
  versions: ClientReviewVersion[];
  comments: ClientReviewComment[];
  annotations: ClientReviewAnnotation[];
  decisionHistory: ClientDecisionHistoryEvent[];
  permissions: {
    canComment: boolean;
    canAnnotate: boolean;
    canApprove: boolean;
    canRequestRevision: boolean;
    canDecline: boolean;
    canRequestRevisit: boolean;
  };
};

export type ClientReviewQueuePayload = {
  projectSlug: string;
  reviews: ClientReviewObject[];
  actionableCount: number;
  emptyMessage: string | null;
};
