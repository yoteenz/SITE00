import { randomUUID } from 'node:crypto';
import type { ClientProjectRole } from '../../../shared/site00-client-project-room/types.js';
import { capabilitiesForRole, clientHasCapability } from '../../../shared/site00-client-project-room/capabilities.js';
import type {
  ClientReviewAnnotation,
  ClientReviewComment,
  ClientReviewDetail,
  ClientReviewObject,
  ClientReviewQueuePayload,
  ClientReviewVersion,
  ClientReviewViewport,
  ClientApprovalReceipt,
  ClientRevisionRequestReceipt,
  ClientDecisionHistoryEvent,
} from '../../../shared/site00-client-reviews/types.js';
import {
  PREVIEW_REVIEW_OBJECTS,
  PREVIEW_REVIEW_PROJECT_SLUG,
  PREVIEW_REVIEW_VERSIONS,
  PREVIEW_DECISION_HISTORY,
  getPreviewVersionsForReview,
} from '../../../shared/site00-client-reviews/previewSeed.js';
import {
  stripReviewInternalFields,
  translateCommentStatusForClient,
  clientReviewStatusLabel,
} from '../../../shared/site00-client-reviews/translators.js';
import { canAccessProjectAsOwner } from '../site00Access/accessModel.js';
import { getSupabaseAdmin } from '../supabase.js';

type PreviewMutableStore = {
  reviewOverrides: Map<string, Partial<ClientReviewObject>>;
  comments: ClientReviewComment[];
  annotations: ClientReviewAnnotation[];
  approvalReceipts: Map<string, ClientApprovalReceipt>;
  revisionReceipts: ClientRevisionRequestReceipt[];
  decisionEvents: ClientDecisionHistoryEvent[];
};

const previewStore: PreviewMutableStore = {
  reviewOverrides: new Map(),
  comments: [],
  annotations: [],
  approvalReceipts: new Map(),
  revisionReceipts: [],
  decisionEvents: [...PREVIEW_DECISION_HISTORY],
};

function resolveRole(projectSlug: string, email: string): ClientProjectRole {
  if (projectSlug === PREVIEW_REVIEW_PROJECT_SLUG) return 'CLIENT_OWNER';
  return 'CLIENT_OWNER';
}

function reviewPermissions(role: ClientProjectRole, review: ClientReviewObject) {
  const caps = capabilitiesForRole(role);
  const canApprove = clientHasCapability(caps, 'CAN_APPROVE') && review.approvalAllowed;
  return {
    canComment: clientHasCapability(caps, 'CAN_COMMENT') && review.commentingAllowed,
    canAnnotate: clientHasCapability(caps, 'CAN_COMMENT') && review.annotationAllowed,
    canApprove,
    canRequestRevision: clientHasCapability(caps, 'CAN_REQUEST_REVISION') && review.revisionAllowed,
    canDecline: canApprove && review.declineAllowed,
    canRequestRevisit: clientHasCapability(caps, 'CAN_VIEW_VERSION_HISTORY'),
  };
}

function mergePreviewReview(review: ClientReviewObject): ClientReviewObject {
  const override = previewStore.reviewOverrides.get(review.reviewId);
  if (!override) return { ...review };
  return { ...review, ...override, statusLabel: clientReviewStatusLabel(override.status ?? review.status) };
}

export function getPreviewActionableReviewCount(): number {
  return PREVIEW_REVIEW_OBJECTS.map(mergePreviewReview).filter(
    (r) => r.actionRequired && ['READY_FOR_REVIEW', 'AWAITING_CLIENT'].includes(r.status),
  ).length;
}

export async function assertReviewProjectAccess(
  projectSlug: string,
  email: string,
  userId?: string,
): Promise<void> {
  if (projectSlug === PREVIEW_REVIEW_PROJECT_SLUG) return;
  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase.from('site00_projects').select('*').eq('slug', projectSlug).maybeSingle();
  if (!project) throw new Error('PROJECT NOT FOUND');
  if (!canAccessProjectAsOwner(email, projectSlug, userId, project)) throw new Error('FORBIDDEN');
}

export async function getClientReviewQueue(
  projectSlug: string,
  email: string,
  userId?: string,
): Promise<ClientReviewQueuePayload> {
  await assertReviewProjectAccess(projectSlug, email, userId);

  let reviews: ClientReviewObject[] = [];
  if (projectSlug === PREVIEW_REVIEW_PROJECT_SLUG) {
    reviews = PREVIEW_REVIEW_OBJECTS.map(mergePreviewReview);
  } else {
    reviews = PREVIEW_REVIEW_OBJECTS.map((r) => ({ ...r, projectSlug })).map(mergePreviewReview);
  }

  const actionableCount = reviews.filter((r) => r.actionRequired && ['READY_FOR_REVIEW', 'AWAITING_CLIENT'].includes(r.status)).length;
  return stripReviewInternalFields({
    projectSlug,
    reviews,
    actionableCount,
    emptyMessage: reviews.length === 0 ? 'NOTHING NEEDS YOUR REVIEW RIGHT NOW. SITE 00 is still working.' : null,
  });
}

export async function getClientReviewDetail(input: {
  projectSlug: string;
  reviewId: string;
  email: string;
  userId?: string;
  roleOverride?: ClientProjectRole;
}): Promise<ClientReviewDetail> {
  await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const base = PREVIEW_REVIEW_OBJECTS.find((r) => r.reviewId === input.reviewId);
  if (!base) throw new Error('REVIEW NOT FOUND');
  const review = mergePreviewReview({ ...base, projectSlug: input.projectSlug });
  const versions = getPreviewVersionsForReview(review.reviewId);
  const role = input.roleOverride ?? resolveRole(input.projectSlug, input.email);
  const comments = previewStore.comments.filter(
    (c) => c.reviewId === review.reviewId && c.visibility === 'CLIENT_AND_SITE00',
  );
  const annotations = previewStore.annotations.filter((a) => a.reviewId === review.reviewId);
  const receipt = previewStore.approvalReceipts.get(review.reviewId);
  const decisionHistory = [...previewStore.decisionEvents];
  if (receipt) {
    decisionHistory.unshift({
      id: receipt.receiptId,
      dateLabel: 'TODAY',
      summary: `${review.title} was approved`,
      type: 'APPROVAL',
    });
  }

  return stripReviewInternalFields({
    review,
    versions,
    comments,
    annotations,
    decisionHistory,
    permissions: reviewPermissions(role, review),
  });
}

export async function addClientReviewComment(input: {
  projectSlug: string;
  reviewId: string;
  versionId: string;
  viewport: ClientReviewViewport | null;
  body: string;
  parentCommentId?: string | null;
  email: string;
  userId: string;
  role?: ClientProjectRole;
}): Promise<ClientReviewComment> {
  await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? resolveRole(input.projectSlug, input.email);
  const comment: ClientReviewComment = {
    commentId: randomUUID(),
    projectId: PREVIEW_REVIEW_PROJECT_SLUG,
    reviewId: input.reviewId,
    versionId: input.versionId,
    viewport: input.viewport,
    authorId: input.userId,
    authorRole: role,
    body: input.body.trim(),
    annotationId: null,
    parentCommentId: input.parentCommentId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
    visibility: 'CLIENT_AND_SITE00',
    clientStatus: translateCommentStatusForClient('OPEN'),
  };
  previewStore.comments.push(comment);
  previewStore.decisionEvents.unshift({
    id: comment.commentId,
    dateLabel: 'TODAY',
    summary: 'Your comment was received',
    type: 'COMMENT',
  });
  return stripReviewInternalFields(comment);
}

export async function addClientReviewAnnotation(input: {
  projectSlug: string;
  reviewId: string;
  versionId: string;
  viewport: ClientReviewViewport;
  xPercent: number;
  yPercent: number;
  body?: string;
  email: string;
  userId: string;
  role?: ClientProjectRole;
}): Promise<{ annotation: ClientReviewAnnotation; comment?: ClientReviewComment }> {
  await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const markerIndex =
    previewStore.annotations.filter((a) => a.reviewId === input.reviewId && a.versionId === input.versionId && a.viewport === input.viewport)
      .length + 1;
  const annotation: ClientReviewAnnotation = {
    annotationId: randomUUID(),
    projectId: PREVIEW_REVIEW_PROJECT_SLUG,
    reviewId: input.reviewId,
    versionId: input.versionId,
    viewport: input.viewport,
    xPercent: input.xPercent,
    yPercent: input.yPercent,
    widthPercent: null,
    heightPercent: null,
    markerIndex,
    commentId: null,
    createdAt: new Date().toISOString(),
  };
  let comment: ClientReviewComment | undefined;
  if (input.body?.trim()) {
    comment = await addClientReviewComment({
      projectSlug: input.projectSlug,
      reviewId: input.reviewId,
      versionId: input.versionId,
      viewport: input.viewport,
      body: input.body,
      email: input.email,
      userId: input.userId,
      role: input.role,
    });
    annotation.commentId = comment.commentId;
    comment.annotationId = annotation.annotationId;
  }
  previewStore.annotations.push(annotation);
  return stripReviewInternalFields({ annotation, comment });
}

export async function submitClientApproval(input: {
  projectSlug: string;
  reviewId: string;
  versionId: string;
  expectedVersionId: string;
  requestId: string;
  email: string;
  userId: string;
  role?: ClientProjectRole;
  commentSnapshot?: string | null;
}): Promise<ClientApprovalReceipt> {
  await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? resolveRole(input.projectSlug, input.email);
  if (!clientHasCapability(capabilitiesForRole(role), 'CAN_APPROVE')) throw new Error('FORBIDDEN');

  const detail = await getClientReviewDetail({
    projectSlug: input.projectSlug,
    reviewId: input.reviewId,
    email: input.email,
    userId: input.userId,
    roleOverride: role,
  });
  if (detail.review.currentVersionId !== input.expectedVersionId) throw new Error('STALE_VERSION');
  if (detail.review.status === 'APPROVED') {
    const existing = previewStore.approvalReceipts.get(input.reviewId);
    if (existing) return existing;
  }

  const existingByRequest = [...previewStore.approvalReceipts.values()].find((r) => r.requestId === input.requestId);
  if (existingByRequest) return existingByRequest;

  const receipt: ClientApprovalReceipt = {
    receiptId: randomUUID(),
    projectId: detail.review.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    actorUserId: input.userId,
    actorRole: role,
    decision: 'APPROVE',
    approvedConsequences: detail.review.approvalConsequences,
    commentSnapshot: input.commentSnapshot ?? null,
    timestamp: new Date().toISOString(),
    requestId: input.requestId,
  };
  previewStore.approvalReceipts.set(input.reviewId, receipt);
  previewStore.reviewOverrides.set(input.reviewId, {
    status: 'APPROVED',
    statusLabel: clientReviewStatusLabel('APPROVED'),
    actionRequired: false,
    approvalAllowed: false,
    revisionAllowed: false,
    declineAllowed: false,
  });
  previewStore.decisionEvents.unshift({
    id: receipt.receiptId,
    dateLabel: 'TODAY',
    summary: `${detail.review.title} was approved`,
    type: 'APPROVAL',
  });
  return stripReviewInternalFields(receipt);
}

export async function submitClientRevision(input: {
  projectSlug: string;
  reviewId: string;
  versionId: string;
  expectedVersionId: string;
  requestId: string;
  summary: string;
  category?: string | null;
  commentIds?: string[];
  annotationIds?: string[];
  email: string;
  userId: string;
  role?: ClientProjectRole;
}): Promise<ClientRevisionRequestReceipt> {
  await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? resolveRole(input.projectSlug, input.email);
  if (!clientHasCapability(capabilitiesForRole(role), 'CAN_REQUEST_REVISION')) throw new Error('FORBIDDEN');

  const detail = await getClientReviewDetail({
    projectSlug: input.projectSlug,
    reviewId: input.reviewId,
    email: input.email,
    userId: input.userId,
    roleOverride: role,
  });
  if (detail.review.currentVersionId !== input.expectedVersionId) throw new Error('STALE_VERSION');

  const dup = previewStore.revisionReceipts.find((r) => r.requestId === input.requestId);
  if (dup) return dup;

  const receipt: ClientRevisionRequestReceipt = {
    requestId: input.requestId,
    projectId: detail.review.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    actorUserId: input.userId,
    actorRole: role,
    summary: input.summary.trim(),
    commentIds: input.commentIds ?? [],
    annotationIds: input.annotationIds ?? [],
    category: input.category ?? null,
    createdAt: new Date().toISOString(),
    status: 'RECEIVED',
  };
  previewStore.revisionReceipts.push(receipt);
  previewStore.reviewOverrides.set(input.reviewId, {
    status: 'REVISION_IN_PROGRESS',
    statusLabel: clientReviewStatusLabel('REVISION_IN_PROGRESS'),
    actionRequired: false,
    approvalAllowed: false,
    revisionAllowed: false,
  });
  previewStore.decisionEvents.unshift({
    id: receipt.requestId,
    dateLabel: 'TODAY',
    summary: 'Revision request received',
    type: 'REVISION',
  });
  return stripReviewInternalFields(receipt);
}

export async function submitClientDecline(input: {
  projectSlug: string;
  reviewId: string;
  versionId: string;
  expectedVersionId: string;
  requestId: string;
  email: string;
  userId: string;
  role?: ClientProjectRole;
}): Promise<{ ok: true }> {
  await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? resolveRole(input.projectSlug, input.email);
  const detail = await getClientReviewDetail({
    projectSlug: input.projectSlug,
    reviewId: input.reviewId,
    email: input.email,
    userId: input.userId,
    roleOverride: role,
  });
  if (!detail.permissions.canDecline) throw new Error('FORBIDDEN');
  if (detail.review.currentVersionId !== input.expectedVersionId) throw new Error('STALE_VERSION');

  previewStore.reviewOverrides.set(input.reviewId, {
    status: 'DECLINED',
    statusLabel: clientReviewStatusLabel('DECLINED'),
    actionRequired: false,
    approvalAllowed: false,
    revisionAllowed: false,
    declineAllowed: false,
  });
  previewStore.decisionEvents.unshift({
    id: input.requestId,
    dateLabel: 'TODAY',
    summary: `${detail.review.title} direction declined`,
    type: 'DECLINE',
  });
  return { ok: true };
}

export async function submitRevisitRequest(input: {
  projectSlug: string;
  reviewId: string;
  versionId: string;
  email: string;
  userId: string;
}): Promise<{ ok: true }> {
  await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  previewStore.decisionEvents.unshift({
    id: randomUUID(),
    dateLabel: 'TODAY',
    summary: `Request to revisit ${PREVIEW_REVIEW_VERSIONS[input.versionId]?.label ?? input.versionId}`,
    type: 'REVISIT',
  });
  return { ok: true };
}

export function getPreviewStoreForTests(): PreviewMutableStore {
  return previewStore;
}

export function resetPreviewReviewStore(): void {
  previewStore.reviewOverrides.clear();
  previewStore.comments.length = 0;
  previewStore.annotations.length = 0;
  previewStore.approvalReceipts.clear();
  previewStore.revisionReceipts.length = 0;
  previewStore.decisionEvents.length = 0;
  previewStore.decisionEvents.push(...PREVIEW_DECISION_HISTORY);
}
