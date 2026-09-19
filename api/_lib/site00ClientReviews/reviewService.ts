import type { ClientProjectRole } from '../../../shared/site00-client-project-room/types.js';
import { capabilitiesForRole, clientHasCapability } from '../../../shared/site00-client-project-room/capabilities.js';
import type {
  ClientReviewAnnotation,
  ClientReviewComment,
  ClientReviewDetail,
  ClientReviewObject,
  ClientReviewQueuePayload,
  ClientReviewViewport,
  ClientApprovalReceipt,
  ClientRevisionRequestReceipt,
} from '../../../shared/site00-client-reviews/types.js';
import {
  assertClientPreviewModeAllowed,
  isClientReviewPreviewBypassEnabled,
  isPreviewProjectSlug,
  PREVIEW_REVIEW_PROJECT_SLUG,
} from '../../../shared/site00-client-reviews/previewGuard.js';
import {
  buildClientReviewAdminFeedbackView,
  buildClientReviewAppViewModel,
} from '../../../shared/site00-client-reviews/viewModel.js';
import {
  stripReviewInternalFields,
  clientReviewStatusLabel,
} from '../../../shared/site00-client-reviews/translators.js';
import { canAccessProjectAsOwner } from '../site00Access/accessModel.js';
import { isAdminEmail } from '../adminAuth.js';
import { getSupabaseAdmin } from '../supabase.js';
import { ensurePreviewReviewFixturesSeeded } from './previewFixtureSeed.js';
import {
  getActionableReviewCount,
  insertReviewAnnotation,
  insertReviewComment,
  insertReviewEvent,
  insertReviewReceipt,
  linkCommentAnnotation,
  loadAllReceipts,
  loadApprovalReceipt,
  loadReviewAnnotations,
  loadReviewComments,
  loadReviewEvents,
  loadReviewObject,
  loadReviewObjectsForProject,
  loadReviewVersions,
  loadRevisionReceipts,
  resetPreviewFixtureMutations,
  updateReviewClientStatus,
} from './reviewRepository.js';

export { PREVIEW_REVIEW_PROJECT_SLUG };

function resolveRole(project: { metadata?: Record<string, unknown> | null }, email: string): ClientProjectRole {
  void email;
  const meta = project.metadata ?? {};
  const role = typeof meta.client_role === 'string' ? meta.client_role.toUpperCase() : 'CLIENT_OWNER';
  if (role === 'CLIENT_COLLABORATOR' || role === 'CLIENT_VIEWER') return role;
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

async function loadProjectForAccess(projectSlug: string) {
  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase.from('site00_projects').select('*').eq('slug', projectSlug).maybeSingle();
  return project;
}

export async function assertReviewProjectAccess(
  projectSlug: string,
  email: string,
  userId?: string,
): Promise<{ projectId: string | null; role: ClientProjectRole }> {
  if (isPreviewProjectSlug(projectSlug)) {
    assertClientPreviewModeAllowed();
    return { projectId: null, role: 'CLIENT_OWNER' };
  }
  const project = await loadProjectForAccess(projectSlug);
  if (!project) throw new Error('REVIEW NOT FOUND');
  if (!canAccessProjectAsOwner(email, projectSlug, userId, project)) throw new Error('FORBIDDEN');
  return {
    projectId: String(project.id),
    role: resolveRole(project, email),
  };
}

async function ensureReviewDataReady(projectSlug: string): Promise<void> {
  if (isPreviewProjectSlug(projectSlug) && isClientReviewPreviewBypassEnabled()) {
    await ensurePreviewReviewFixturesSeeded();
  }
}

export async function getPreviewActionableReviewCount(): Promise<number> {
  if (!isClientReviewPreviewBypassEnabled()) return 0;
  await ensurePreviewReviewFixturesSeeded();
  return getActionableReviewCount(PREVIEW_REVIEW_PROJECT_SLUG);
}

export async function getClientReviewQueue(
  projectSlug: string,
  email: string,
  userId?: string,
): Promise<ClientReviewQueuePayload> {
  await assertReviewProjectAccess(projectSlug, email, userId);
  await ensureReviewDataReady(projectSlug);

  const reviews = await loadReviewObjectsForProject(projectSlug);
  const actionableCount = reviews.filter(
    (r) => r.actionRequired && ['READY_FOR_REVIEW', 'AWAITING_CLIENT'].includes(r.status),
  ).length;

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
  const access = await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  await ensureReviewDataReady(input.projectSlug);

  const review = await loadReviewObject(input.projectSlug, input.reviewId);
  if (!review) throw new Error('REVIEW NOT FOUND');

  const role = input.roleOverride ?? access.role;
  const [versions, comments, annotations, decisionHistory] = await Promise.all([
    loadReviewVersions(review.reviewId),
    loadReviewComments(review.reviewId, { clientVisibleOnly: true }),
    loadReviewAnnotations(review.reviewId),
    loadReviewEvents(review.reviewId, true),
  ]);

  const detail: ClientReviewDetail = {
    review,
    versions,
    comments,
    annotations,
    decisionHistory,
    permissions: reviewPermissions(role, review),
  };
  return stripReviewInternalFields(detail);
}

/** App adapter — same durable canonical state as web. */
export async function getClientReviewAppDetail(input: {
  projectSlug: string;
  reviewId: string;
  email: string;
  userId?: string;
}): Promise<ReturnType<typeof buildClientReviewAppViewModel>> {
  const detail = await getClientReviewDetail(input);
  return stripReviewInternalFields(buildClientReviewAppViewModel(detail));
}

export async function getClientReviewAdminFeedback(input: {
  projectSlug: string;
  reviewId: string;
  email: string;
  userId?: string;
}): Promise<ReturnType<typeof buildClientReviewAdminFeedbackView>> {
  if (!isAdminEmail(input.email)) throw new Error('FORBIDDEN');
  await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  await ensureReviewDataReady(input.projectSlug);

  const detail = await getClientReviewDetail({
    ...input,
    roleOverride: 'CLIENT_OWNER',
  });
  const allComments = await loadReviewComments(input.reviewId, { clientVisibleOnly: false });
  const approval = await loadApprovalReceipt(input.reviewId);
  const revisions = await loadRevisionReceipts(input.reviewId);

  return stripReviewInternalFields(
    buildClientReviewAdminFeedbackView({
      projectSlug: input.projectSlug,
      detail,
      allComments,
      approvalReceipt: approval as unknown as Record<string, unknown> | null,
      revisionReceipts: revisions as unknown as Record<string, unknown>[],
    }),
  );
}

async function assertMutationAllowed(
  role: ClientProjectRole,
  capability: 'CAN_COMMENT' | 'CAN_APPROVE' | 'CAN_REQUEST_REVISION',
): Promise<void> {
  if (!clientHasCapability(capabilitiesForRole(role), capability)) throw new Error('FORBIDDEN');
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
  const access = await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? access.role;
  await assertMutationAllowed(role, 'CAN_COMMENT');
  await ensureReviewDataReady(input.projectSlug);

  const review = await loadReviewObject(input.projectSlug, input.reviewId);
  if (!review) throw new Error('REVIEW NOT FOUND');

  const comment = await insertReviewComment({
    projectId: access.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    viewport: input.viewport,
    authorUserId: input.userId,
    authorRole: role,
    body: input.body,
    parentCommentId: input.parentCommentId,
  });

  await insertReviewEvent({
    projectId: access.projectId,
    reviewId: input.reviewId,
    eventType: input.parentCommentId ? 'COMMENT_REPLIED' : 'COMMENT_ADDED',
    actorUserId: input.userId,
    actorRole: role,
    payload: { summary: 'Your comment was received', commentId: comment.commentId },
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
  const access = await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? access.role;
  await assertMutationAllowed(role, 'CAN_COMMENT');
  await ensureReviewDataReady(input.projectSlug);

  const review = await loadReviewObject(input.projectSlug, input.reviewId);
  if (!review) throw new Error('REVIEW NOT FOUND');

  const annotation = await insertReviewAnnotation({
    projectId: access.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    viewport: input.viewport,
    xPercent: input.xPercent,
    yPercent: input.yPercent,
    createdByUserId: input.userId,
  });

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
      role,
    });
    await linkCommentAnnotation(comment.commentId, annotation.annotationId);
    annotation.commentId = comment.commentId;
    comment.annotationId = annotation.annotationId;
  }

  await insertReviewEvent({
    projectId: access.projectId,
    reviewId: input.reviewId,
    eventType: 'ANNOTATION_ADDED',
    actorUserId: input.userId,
    actorRole: role,
    payload: { summary: 'Annotation added', annotationId: annotation.annotationId, viewport: input.viewport },
  });

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
  const access = await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? access.role;
  await assertMutationAllowed(role, 'CAN_APPROVE');
  await ensureReviewDataReady(input.projectSlug);

  const review = await loadReviewObject(input.projectSlug, input.reviewId);
  if (!review) throw new Error('REVIEW NOT FOUND');
  if (review.currentVersionId !== input.expectedVersionId) throw new Error('STALE_VERSION');

  const existing = await loadApprovalReceipt(input.reviewId);
  if (existing && existing.requestId === input.requestId) return stripReviewInternalFields(existing);
  if (review.status === 'APPROVED' && existing) return stripReviewInternalFields(existing);

  const receiptRow = await insertReviewReceipt({
    projectId: access.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    actorUserId: input.userId,
    actorRole: role,
    decisionType: 'APPROVE',
    requestId: input.requestId,
    payload: {
      approvedConsequences: review.approvalConsequences,
      commentSnapshot: input.commentSnapshot ?? null,
    },
  });

  await updateReviewClientStatus(input.reviewId, 'APPROVED', {
    actionRequired: false,
    approvalAllowed: false,
    revisionAllowed: false,
    declineAllowed: false,
  });

  await insertReviewEvent({
    projectId: access.projectId,
    reviewId: input.reviewId,
    eventType: 'APPROVED',
    actorUserId: input.userId,
    actorRole: role,
    payload: { summary: `${review.title} was approved`, receiptId: receiptRow.id },
  });

  const receipt: ClientApprovalReceipt = {
    receiptId: receiptRow.id,
    projectId: access.projectId ?? review.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    actorUserId: input.userId,
    actorRole: role,
    decision: 'APPROVE',
    approvedConsequences: review.approvalConsequences,
    commentSnapshot: input.commentSnapshot ?? null,
    timestamp: receiptRow.created_at,
    requestId: input.requestId,
  };
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
  const access = await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? access.role;
  await assertMutationAllowed(role, 'CAN_REQUEST_REVISION');
  await ensureReviewDataReady(input.projectSlug);

  const review = await loadReviewObject(input.projectSlug, input.reviewId);
  if (!review) throw new Error('REVIEW NOT FOUND');
  if (review.currentVersionId !== input.expectedVersionId) throw new Error('STALE_VERSION');

  const receiptRow = await insertReviewReceipt({
    projectId: access.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    actorUserId: input.userId,
    actorRole: role,
    decisionType: 'REVISION',
    requestId: input.requestId,
    payload: {
      summary: input.summary.trim(),
      commentIds: input.commentIds ?? [],
      annotationIds: input.annotationIds ?? [],
      category: input.category ?? null,
      status: 'RECEIVED',
    },
  });

  await updateReviewClientStatus(input.reviewId, 'REVISION_IN_PROGRESS', {
    actionRequired: false,
    approvalAllowed: false,
    revisionAllowed: false,
  });

  await insertReviewEvent({
    projectId: access.projectId,
    reviewId: input.reviewId,
    eventType: 'REVISION_REQUESTED',
    actorUserId: input.userId,
    actorRole: role,
    payload: { summary: 'Revision request received', requestId: input.requestId },
  });

  const receipt: ClientRevisionRequestReceipt = {
    requestId: input.requestId,
    projectId: access.projectId ?? review.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    actorUserId: input.userId,
    actorRole: role,
    summary: input.summary.trim(),
    commentIds: input.commentIds ?? [],
    annotationIds: input.annotationIds ?? [],
    category: input.category ?? null,
    createdAt: receiptRow.created_at,
    status: 'RECEIVED',
  };
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
  const access = await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  const role = input.role ?? access.role;
  await ensureReviewDataReady(input.projectSlug);

  const review = await loadReviewObject(input.projectSlug, input.reviewId);
  if (!review) throw new Error('REVIEW NOT FOUND');
  const perms = reviewPermissions(role, review);
  if (!perms.canDecline) throw new Error('FORBIDDEN');
  if (review.currentVersionId !== input.expectedVersionId) throw new Error('STALE_VERSION');

  await insertReviewReceipt({
    projectId: access.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    actorUserId: input.userId,
    actorRole: role,
    decisionType: 'DECLINE',
    requestId: input.requestId,
    payload: {},
  });

  await updateReviewClientStatus(input.reviewId, 'DECLINED', {
    actionRequired: false,
    approvalAllowed: false,
    revisionAllowed: false,
    declineAllowed: false,
  });

  await insertReviewEvent({
    projectId: access.projectId,
    reviewId: input.reviewId,
    eventType: 'DECLINED',
    actorUserId: input.userId,
    actorRole: role,
    payload: { summary: `${review.title} direction declined` },
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
  const access = await assertReviewProjectAccess(input.projectSlug, input.email, input.userId);
  await ensureReviewDataReady(input.projectSlug);

  const review = await loadReviewObject(input.projectSlug, input.reviewId);
  if (!review) throw new Error('REVIEW NOT FOUND');
  const versions = await loadReviewVersions(input.reviewId);
  const versionLabel = versions.find((v) => v.versionId === input.versionId)?.label ?? input.versionId;

  await insertReviewReceipt({
    projectId: access.projectId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    actorUserId: input.userId,
    actorRole: access.role,
    decisionType: 'REVISIT',
    requestId: `revisit-${input.reviewId}-${input.versionId}-${Date.now()}`,
    payload: { versionLabel },
  });

  await insertReviewEvent({
    projectId: access.projectId,
    reviewId: input.reviewId,
    eventType: 'REVISIT_REQUESTED',
    actorUserId: input.userId,
    actorRole: access.role,
    payload: { summary: `Request to revisit ${versionLabel}` },
  });

  return { ok: true };
}

/** Test helper — reset preview fixture mutations in Supabase only. */
export async function resetPreviewReviewDataForTests(reviewIds: string[]): Promise<void> {
  if (!isClientReviewPreviewBypassEnabled()) return;
  await resetPreviewFixtureMutations(reviewIds);
  for (const id of reviewIds) {
    await updateReviewClientStatus(id, 'READY_FOR_REVIEW', {
      actionRequired: true,
      approvalAllowed: true,
      revisionAllowed: true,
      declineAllowed: true,
    });
  }
}
