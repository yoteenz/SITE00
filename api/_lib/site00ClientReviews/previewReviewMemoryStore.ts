/**
 * In-memory preview review fixtures for Vitest — avoids Supabase contention/timeouts in CI.
 * Production and integration tests with SITE00_CLIENT_REVIEW_SUPABASE_INTEGRATION=1 still use DB.
 */

import { randomUUID } from 'node:crypto';
import type { ClientProjectRole } from '../../../shared/site00-client-project-room/types.js';
import type {
  ClientApprovalReceipt,
  ClientDecisionHistoryEvent,
  ClientReviewAnnotation,
  ClientReviewComment,
  ClientReviewObject,
  ClientReviewStatus,
  ClientReviewVersion,
  ClientReviewViewport,
  ClientRevisionRequestReceipt,
} from '../../../shared/site00-client-reviews/types.js';
import { clientReviewStatusLabel, translateCommentStatusForClient } from '../../../shared/site00-client-reviews/translators.js';
import { isClientReviewPreviewBypassEnabled } from '../../../shared/site00-client-reviews/previewGuard.js';
import {
  PREVIEW_DECISION_HISTORY,
  PREVIEW_REVIEW_OBJECTS,
  PREVIEW_REVIEW_VERSIONS,
} from '../../../shared/site00-client-reviews/previewSeed.js';
import { PREVIEW_REVIEW_PROJECT_SLUG } from '../../../shared/site00-client-reviews/previewGuard.js';

type ReceiptRow = {
  id: string;
  project_id: string | null;
  review_id: string;
  version_id: string;
  actor_user_id: string;
  actor_role: string;
  decision_type: string;
  request_id: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type EventRow = {
  id: string;
  review_id: string;
  event_type: string;
  actor_user_id: string | null;
  actor_role: string | null;
  payload: Record<string, unknown>;
  client_visible: boolean;
  created_at: string;
};

const reviews = new Map<string, ClientReviewObject>();
const versions = new Map<string, ClientReviewVersion>();
const comments: ClientReviewComment[] = [];
const annotations: ClientReviewAnnotation[] = [];
const receipts: ReceiptRow[] = [];
const events: EventRow[] = [];

let seedPromise: Promise<void> | null = null;

export function isPreviewReviewMemoryStoreEnabled(): boolean {
  if (process.env.SITE00_CLIENT_REVIEW_SUPABASE_INTEGRATION === '1') return false;
  return process.env.VITEST === 'true' && isClientReviewPreviewBypassEnabled();
}

function cloneReview(r: ClientReviewObject): ClientReviewObject {
  return structuredClone(r);
}

function cloneVersion(v: ClientReviewVersion): ClientReviewVersion {
  return structuredClone(v);
}

export function resetPreviewReviewMemoryStore(): void {
  reviews.clear();
  versions.clear();
  comments.length = 0;
  annotations.length = 0;
  receipts.length = 0;
  events.length = 0;
  seedPromise = null;
}

export async function ensurePreviewReviewMemorySeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    if (reviews.size >= PREVIEW_REVIEW_OBJECTS.length) return;
    reviews.clear();
    versions.clear();
    comments.length = 0;
    annotations.length = 0;
    receipts.length = 0;
    events.length = 0;
    for (const review of PREVIEW_REVIEW_OBJECTS) {
      reviews.set(review.reviewId, cloneReview(review));
      for (const versionId of review.availableVersionIds) {
        const version = PREVIEW_REVIEW_VERSIONS[versionId];
        if (version) versions.set(version.versionId, cloneVersion(version));
      }
      const opened = PREVIEW_DECISION_HISTORY.find((e) => e.type === 'OPENED');
      events.push({
        id: randomUUID(),
        review_id: review.reviewId,
        event_type: 'REVIEW_OPENED',
        actor_user_id: null,
        actor_role: null,
        payload: { summary: opened?.summary ?? 'Review opened' },
        client_visible: true,
        created_at: review.readyAt,
      });
    }
  })();
  return seedPromise;
}

export function countPreviewFixtures(projectSlug: string): number {
  if (projectSlug !== PREVIEW_REVIEW_PROJECT_SLUG) return 0;
  return [...reviews.values()].filter((r) => r.projectSlug === projectSlug).length;
}

export async function upsertPreviewReviewObject(input: {
  review: ClientReviewObject;
  isPreviewFixture: boolean;
}): Promise<void> {
  void input.isPreviewFixture;
  reviews.set(input.review.reviewId, cloneReview(input.review));
}

export async function upsertPreviewReviewVersion(version: ClientReviewVersion): Promise<void> {
  versions.set(version.versionId, cloneVersion(version));
}

export async function loadReviewObjectsForProject(projectSlug: string): Promise<ClientReviewObject[]> {
  await ensurePreviewReviewMemorySeeded();
  return [...reviews.values()]
    .filter((r) => r.projectSlug === projectSlug)
    .sort((a, b) => b.readyAt.localeCompare(a.readyAt));
}

export async function loadReviewObject(projectSlug: string, reviewId: string): Promise<ClientReviewObject | null> {
  await ensurePreviewReviewMemorySeeded();
  const r = reviews.get(reviewId);
  if (!r || r.projectSlug !== projectSlug) return null;
  return cloneReview(r);
}

export async function loadReviewVersions(reviewId: string): Promise<ClientReviewVersion[]> {
  await ensurePreviewReviewMemorySeeded();
  const review = reviews.get(reviewId);
  const reviewStatus = review?.status ?? 'READY_FOR_REVIEW';
  return [...versions.values()]
    .filter((v) => v.reviewId === reviewId)
    .map((v) => ({
      ...v,
      status: v.isSuperseded ? 'SUPERSEDED' : reviewStatus,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function loadReviewComments(
  reviewId: string,
  options: { clientVisibleOnly: boolean },
): Promise<ClientReviewComment[]> {
  await ensurePreviewReviewMemorySeeded();
  return comments
    .filter((c) => c.reviewId === reviewId)
    .filter((c) => !options.clientVisibleOnly || c.visibility === 'CLIENT_AND_SITE00')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function loadReviewAnnotations(reviewId: string): Promise<ClientReviewAnnotation[]> {
  await ensurePreviewReviewMemorySeeded();
  return annotations
    .filter((a) => a.reviewId === reviewId)
    .sort((a, b) => a.markerIndex - b.markerIndex);
}

export async function loadReviewEvents(
  reviewId: string,
  clientVisibleOnly: boolean,
): Promise<ClientDecisionHistoryEvent[]> {
  await ensurePreviewReviewMemorySeeded();
  return events
    .filter((e) => e.review_id === reviewId)
    .filter((e) => !clientVisibleOnly || e.client_visible)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((row) => {
      const payload = row.payload ?? {};
      const summary =
        typeof payload.summary === 'string' ? payload.summary : row.event_type.replace(/_/g, ' ').toLowerCase();
      const typeMap: Record<string, ClientDecisionHistoryEvent['type']> = {
        APPROVED: 'APPROVAL',
        REVISION_REQUESTED: 'REVISION',
        DECLINED: 'DECLINE',
        COMMENT_ADDED: 'COMMENT',
        COMMENT_REPLIED: 'COMMENT',
        REVISIT_REQUESTED: 'REVISIT',
        REVIEW_OPENED: 'OPENED',
      };
      const d = new Date(row.created_at);
      return {
        id: row.id,
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
        summary,
        type: typeMap[row.event_type] ?? 'COMMENT',
      };
    });
}

export async function loadReceiptByRequestId(
  reviewId: string,
  decisionType: string,
  requestId: string,
): Promise<ReceiptRow | null> {
  await ensurePreviewReviewMemorySeeded();
  return (
    receipts.find(
      (r) => r.review_id === reviewId && r.decision_type === decisionType && r.request_id === requestId,
    ) ?? null
  );
}

export async function loadApprovalReceipt(reviewId: string): Promise<ClientApprovalReceipt | null> {
  await ensurePreviewReviewMemorySeeded();
  const row = receipts.find((r) => r.review_id === reviewId && r.decision_type === 'APPROVE');
  if (!row) return null;
  const payload = row.payload ?? {};
  return {
    receiptId: row.id,
    projectId: row.project_id ?? reviewId,
    reviewId: row.review_id,
    versionId: row.version_id,
    actorUserId: row.actor_user_id,
    actorRole: row.actor_role as ClientProjectRole,
    decision: 'APPROVE',
    approvedConsequences: (payload.approvedConsequences as ClientApprovalReceipt['approvedConsequences']) ?? null,
    commentSnapshot: typeof payload.commentSnapshot === 'string' ? payload.commentSnapshot : null,
    timestamp: row.created_at,
    requestId: row.request_id,
  };
}

export async function loadRevisionReceipts(reviewId: string): Promise<ClientRevisionRequestReceipt[]> {
  await ensurePreviewReviewMemorySeeded();
  return receipts
    .filter((r) => r.review_id === reviewId && r.decision_type === 'REVISION')
    .map((row) => {
      const payload = row.payload ?? {};
      return {
        requestId: row.request_id,
        projectId: row.project_id ?? reviewId,
        reviewId: row.review_id,
        versionId: row.version_id,
        actorUserId: row.actor_user_id,
        actorRole: row.actor_role as ClientProjectRole,
        summary: typeof payload.summary === 'string' ? payload.summary : '',
        commentIds: Array.isArray(payload.commentIds) ? payload.commentIds.map(String) : [],
        annotationIds: Array.isArray(payload.annotationIds) ? payload.annotationIds.map(String) : [],
        category: typeof payload.category === 'string' ? payload.category : null,
        createdAt: row.created_at,
        status: (payload.status as ClientRevisionRequestReceipt['status']) ?? 'RECEIVED',
      };
    });
}

export async function loadAllReceipts(reviewId: string): Promise<ReceiptRow[]> {
  await ensurePreviewReviewMemorySeeded();
  return receipts.filter((r) => r.review_id === reviewId);
}

export async function insertReviewComment(input: {
  projectId: string | null;
  reviewId: string;
  versionId: string;
  viewport: ClientReviewViewport | null;
  authorUserId: string;
  authorRole: ClientProjectRole | 'SITE00';
  body: string;
  parentCommentId?: string | null;
  visibility?: ClientReviewComment['visibility'];
  annotationId?: string | null;
}): Promise<ClientReviewComment> {
  await ensurePreviewReviewMemorySeeded();
  const now = new Date().toISOString();
  const comment: ClientReviewComment = {
    commentId: randomUUID(),
    projectId: input.projectId ?? input.reviewId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    viewport: input.viewport,
    authorId: input.authorUserId,
    authorRole: input.authorRole,
    body: input.body.trim(),
    annotationId: input.annotationId ?? null,
    parentCommentId: input.parentCommentId ?? null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    visibility: input.visibility ?? 'CLIENT_AND_SITE00',
    clientStatus: translateCommentStatusForClient('OPEN'),
  };
  comments.push(comment);
  return comment;
}

export async function insertReviewAnnotation(input: {
  projectId: string | null;
  reviewId: string;
  versionId: string;
  viewport: ClientReviewViewport;
  xPercent: number;
  yPercent: number;
  createdByUserId: string;
  commentId?: string | null;
}): Promise<ClientReviewAnnotation> {
  await ensurePreviewReviewMemorySeeded();
  const markerIndex =
    annotations.filter(
      (a) => a.reviewId === input.reviewId && a.versionId === input.versionId && a.viewport === input.viewport,
    ).length + 1;
  const now = new Date().toISOString();
  const annotation: ClientReviewAnnotation = {
    annotationId: randomUUID(),
    projectId: input.projectId ?? input.reviewId,
    reviewId: input.reviewId,
    versionId: input.versionId,
    viewport: input.viewport,
    xPercent: input.xPercent,
    yPercent: input.yPercent,
    widthPercent: null,
    heightPercent: null,
    markerIndex,
    commentId: input.commentId ?? null,
    createdAt: now,
  };
  annotations.push(annotation);
  return annotation;
}

export async function linkCommentAnnotation(commentId: string, annotationId: string): Promise<void> {
  const comment = comments.find((c) => c.commentId === commentId);
  if (comment) comment.annotationId = annotationId;
  const annotation = annotations.find((a) => a.annotationId === annotationId);
  if (annotation) annotation.commentId = commentId;
}

export async function insertReviewReceipt(input: {
  projectId: string | null;
  reviewId: string;
  versionId: string;
  actorUserId: string;
  actorRole: ClientProjectRole;
  decisionType: string;
  requestId: string;
  payload: Record<string, unknown>;
}): Promise<ReceiptRow> {
  await ensurePreviewReviewMemorySeeded();
  const existing = await loadReceiptByRequestId(input.reviewId, input.decisionType, input.requestId);
  if (existing) return existing;
  const row: ReceiptRow = {
    id: randomUUID(),
    project_id: input.projectId,
    review_id: input.reviewId,
    version_id: input.versionId,
    actor_user_id: input.actorUserId,
    actor_role: input.actorRole,
    decision_type: input.decisionType,
    request_id: input.requestId,
    payload: input.payload,
    created_at: new Date().toISOString(),
  };
  receipts.push(row);
  return row;
}

export async function insertReviewEvent(input: {
  projectId: string | null;
  reviewId: string;
  eventType: string;
  actorUserId?: string | null;
  actorRole?: string | null;
  payload?: Record<string, unknown>;
  clientVisible?: boolean;
}): Promise<void> {
  void input.projectId;
  await ensurePreviewReviewMemorySeeded();
  events.push({
    id: randomUUID(),
    review_id: input.reviewId,
    event_type: input.eventType,
    actor_user_id: input.actorUserId ?? null,
    actor_role: input.actorRole ?? null,
    payload: input.payload ?? {},
    client_visible: input.clientVisible ?? true,
    created_at: new Date().toISOString(),
  });
}

export async function updateReviewClientStatus(
  reviewId: string,
  clientStatus: ClientReviewStatus,
  metadataPatch?: Record<string, unknown>,
): Promise<void> {
  await ensurePreviewReviewMemorySeeded();
  const review = reviews.get(reviewId);
  if (!review) return;
  review.status = clientStatus;
  review.statusLabel = clientReviewStatusLabel(clientStatus);
  if (metadataPatch) {
    if (typeof metadataPatch.actionRequired === 'boolean') review.actionRequired = metadataPatch.actionRequired;
    if (typeof metadataPatch.approvalAllowed === 'boolean') review.approvalAllowed = metadataPatch.approvalAllowed;
    if (typeof metadataPatch.revisionAllowed === 'boolean') review.revisionAllowed = metadataPatch.revisionAllowed;
    if (typeof metadataPatch.declineAllowed === 'boolean') review.declineAllowed = metadataPatch.declineAllowed;
  }
  review.updatedAt = new Date().toISOString();
}

export async function resetPreviewFixtureMutations(reviewIds: string[]): Promise<void> {
  if (reviewIds.length === 0) return;
  for (let i = comments.length - 1; i >= 0; i -= 1) {
    if (reviewIds.includes(comments[i]!.reviewId)) comments.splice(i, 1);
  }
  for (let i = annotations.length - 1; i >= 0; i -= 1) {
    if (reviewIds.includes(annotations[i]!.reviewId)) annotations.splice(i, 1);
  }
  for (let i = receipts.length - 1; i >= 0; i -= 1) {
    if (reviewIds.includes(receipts[i]!.review_id)) receipts.splice(i, 1);
  }
  for (let i = events.length - 1; i >= 0; i -= 1) {
    if (reviewIds.includes(events[i]!.review_id)) events.splice(i, 1);
  }
}
