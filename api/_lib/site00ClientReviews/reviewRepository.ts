import { randomUUID } from 'node:crypto';
import type { ClientProjectRole } from '../../../shared/site00-client-project-room/types.js';
import type {
  ApprovalConsequence,
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
import {
  clientReviewStatusLabel,
  translateCommentStatusForClient,
  translateReviewStatusForClient,
} from '../../../shared/site00-client-reviews/translators.js';
import { PREVIEW_REVIEW_PROJECT_SLUG } from '../../../shared/site00-client-reviews/previewGuard.js';
import { getSupabaseAdmin } from '../supabase.js';

type ReviewMetadata = {
  objectType?: ClientReviewObject['objectType'];
  availableVersionIds?: string[];
  availableViewports?: ClientReviewViewport[];
  referenceAvailable?: boolean;
  compareAvailable?: boolean;
  compareMode?: ClientReviewObject['compareMode'];
  compareLeftLabel?: string | null;
  compareRightLabel?: string | null;
  compareLeftVersionId?: string | null;
  compareRightVersionId?: string | null;
  commentingAllowed?: boolean;
  annotationAllowed?: boolean;
  approvalAllowed?: boolean;
  revisionAllowed?: boolean;
  declineAllowed?: boolean;
  approvalConsequences?: ApprovalConsequence | null;
  thumbnailUrl?: string | null;
  actionRequired?: boolean;
  versionLabel?: string;
};

type DbReviewRow = {
  id: string;
  project_id: string | null;
  project_slug: string;
  phase_id: string;
  phase_label: string;
  object_type: string;
  title: string;
  subtitle: string;
  internal_status: string;
  client_status: string;
  current_version_id: string;
  client_visible: boolean;
  is_preview_fixture: boolean;
  metadata: ReviewMetadata | null;
  ready_at: string;
  created_at: string;
  updated_at: string;
};

type DbVersionRow = {
  id: string;
  review_id: string;
  label: string;
  client_summary: string;
  preview_asset_url: string | null;
  preview_asset_alt: string;
  available_viewports: ClientReviewViewport[] | string;
  is_current: boolean;
  is_approved: boolean;
  is_superseded: boolean;
  created_at: string;
};

type DbCommentRow = {
  id: string;
  project_id: string | null;
  review_id: string;
  version_id: string;
  viewport: string | null;
  author_user_id: string | null;
  author_role: string;
  body: string;
  annotation_id: string | null;
  parent_comment_id: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

type DbAnnotationRow = {
  id: string;
  project_id: string | null;
  review_id: string;
  version_id: string;
  viewport: string;
  x_percent: number;
  y_percent: number;
  width_percent: number | null;
  height_percent: number | null;
  marker_index: number;
  comment_id: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

type DbReceiptRow = {
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

type DbEventRow = {
  id: string;
  review_id: string;
  event_type: string;
  actor_user_id: string | null;
  actor_role: string | null;
  payload: Record<string, unknown>;
  client_visible: boolean;
  created_at: string;
};

function parseViewports(raw: DbVersionRow['available_viewports']): ClientReviewViewport[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as ClientReviewViewport[];
    } catch {
      return [];
    }
  }
  return [];
}

function mapReviewRow(row: DbReviewRow): ClientReviewObject {
  const meta = row.metadata ?? {};
  const status =
    translateReviewStatusForClient(row.client_status) === 'HIDDEN'
      ? 'LOCKED'
      : (row.client_status as ClientReviewStatus);
  return {
    reviewId: row.id,
    projectId: row.project_id ?? row.project_slug,
    projectSlug: row.project_slug,
    phaseId: row.phase_id,
    phaseLabel: row.phase_label,
    objectType: (meta.objectType ?? row.object_type) as ClientReviewObject['objectType'],
    title: row.title,
    subtitle: row.subtitle,
    status,
    statusLabel: clientReviewStatusLabel(status),
    currentVersionId: row.current_version_id,
    availableVersionIds: meta.availableVersionIds ?? [],
    availableViewports: meta.availableViewports ?? [],
    referenceAvailable: meta.referenceAvailable ?? false,
    compareAvailable: meta.compareAvailable ?? false,
    compareMode: meta.compareMode ?? null,
    compareLeftLabel: meta.compareLeftLabel ?? null,
    compareRightLabel: meta.compareRightLabel ?? null,
    compareLeftVersionId: meta.compareLeftVersionId ?? null,
    compareRightVersionId: meta.compareRightVersionId ?? null,
    commentingAllowed: meta.commentingAllowed ?? true,
    annotationAllowed: meta.annotationAllowed ?? true,
    approvalAllowed: meta.approvalAllowed ?? false,
    revisionAllowed: meta.revisionAllowed ?? false,
    declineAllowed: meta.declineAllowed ?? false,
    approvalConsequences: meta.approvalConsequences ?? null,
    thumbnailUrl: meta.thumbnailUrl ?? null,
    readyAt: row.ready_at,
    updatedAt: row.updated_at,
    actionRequired: meta.actionRequired ?? false,
    versionLabel: meta.versionLabel ?? 'V01',
  };
}

function mapVersionRow(row: DbVersionRow, reviewStatus: ClientReviewStatus): ClientReviewVersion {
  const status = row.is_superseded ? 'SUPERSEDED' : reviewStatus;
  return {
    versionId: row.id,
    reviewId: row.review_id,
    label: row.label,
    createdAt: row.created_at,
    clientSummary: row.client_summary,
    previewAssetUrl: row.preview_asset_url,
    previewAssetAlt: row.preview_asset_alt,
    availableViewports: parseViewports(row.available_viewports),
    status,
    isCurrent: row.is_current,
    isApproved: row.is_approved,
    isSuperseded: row.is_superseded,
  };
}

function mapCommentRow(row: DbCommentRow): ClientReviewComment {
  return {
    commentId: row.id,
    projectId: row.project_id ?? row.review_id,
    reviewId: row.review_id,
    versionId: row.version_id,
    viewport: row.viewport as ClientReviewViewport | null,
    authorId: row.author_user_id ?? 'unknown',
    authorRole: row.author_role as ClientProjectRole | 'SITE00',
    body: row.body,
    annotationId: row.annotation_id,
    parentCommentId: row.parent_comment_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    visibility: row.visibility as ClientReviewComment['visibility'],
    clientStatus: translateCommentStatusForClient(row.status),
  };
}

function mapAnnotationRow(row: DbAnnotationRow): ClientReviewAnnotation {
  return {
    annotationId: row.id,
    projectId: row.project_id ?? row.review_id,
    reviewId: row.review_id,
    versionId: row.version_id,
    viewport: row.viewport as ClientReviewViewport,
    xPercent: Number(row.x_percent),
    yPercent: Number(row.y_percent),
    widthPercent: row.width_percent !== null ? Number(row.width_percent) : null,
    heightPercent: row.height_percent !== null ? Number(row.height_percent) : null,
    markerIndex: row.marker_index,
    commentId: row.comment_id,
    createdAt: row.created_at,
  };
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

function mapEventToHistory(row: DbEventRow): ClientDecisionHistoryEvent {
  const payload = row.payload ?? {};
  const summary =
    typeof payload.summary === 'string'
      ? payload.summary
      : row.event_type.replace(/_/g, ' ').toLowerCase();
  const typeMap: Record<string, ClientDecisionHistoryEvent['type']> = {
    APPROVED: 'APPROVAL',
    REVISION_REQUESTED: 'REVISION',
    DECLINED: 'DECLINE',
    COMMENT_ADDED: 'COMMENT',
    COMMENT_REPLIED: 'COMMENT',
    REVISIT_REQUESTED: 'REVISIT',
    REVIEW_OPENED: 'OPENED',
  };
  return {
    id: row.id,
    dateLabel: formatEventDate(row.created_at),
    summary,
    type: typeMap[row.event_type] ?? 'COMMENT',
  };
}

export async function loadReviewObjectsForProject(projectSlug: string): Promise<ClientReviewObject[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_client_review_objects')
    .select('*')
    .eq('project_slug', projectSlug)
    .eq('client_visible', true)
    .order('ready_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbReviewRow[]).map(mapReviewRow);
}

export async function loadReviewObject(projectSlug: string, reviewId: string): Promise<ClientReviewObject | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_client_review_objects')
    .select('*')
    .eq('id', reviewId)
    .eq('project_slug', projectSlug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapReviewRow(data as DbReviewRow);
}

export async function loadReviewVersions(reviewId: string): Promise<ClientReviewVersion[]> {
  const supabase = getSupabaseAdmin();
  const { data: review } = await supabase
    .from('site00_client_review_objects')
    .select('client_status')
    .eq('id', reviewId)
    .maybeSingle();
  const reviewStatus = (review?.client_status ?? 'READY_FOR_REVIEW') as ClientReviewStatus;
  const { data, error } = await supabase
    .from('site00_client_review_versions')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbVersionRow[]).map((row) => mapVersionRow(row, reviewStatus));
}

export async function loadReviewComments(
  reviewId: string,
  options: { clientVisibleOnly: boolean },
): Promise<ClientReviewComment[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('site00_client_review_comments').select('*').eq('review_id', reviewId);
  if (options.clientVisibleOnly) {
    query = query.eq('visibility', 'CLIENT_AND_SITE00');
  }
  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as DbCommentRow[]).map(mapCommentRow);
}

export async function loadReviewAnnotations(reviewId: string): Promise<ClientReviewAnnotation[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_client_review_annotations')
    .select('*')
    .eq('review_id', reviewId)
    .order('marker_index', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as DbAnnotationRow[]).map(mapAnnotationRow);
}

export async function loadReviewEvents(reviewId: string, clientVisibleOnly: boolean): Promise<ClientDecisionHistoryEvent[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('site00_client_review_events').select('*').eq('review_id', reviewId);
  if (clientVisibleOnly) query = query.eq('client_visible', true);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbEventRow[]).map(mapEventToHistory);
}

export async function loadReceiptByRequestId(
  reviewId: string,
  decisionType: string,
  requestId: string,
): Promise<DbReceiptRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_client_review_receipts')
    .select('*')
    .eq('review_id', reviewId)
    .eq('decision_type', decisionType)
    .eq('request_id', requestId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DbReceiptRow) ?? null;
}

export async function loadApprovalReceipt(reviewId: string): Promise<ClientApprovalReceipt | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_client_review_receipts')
    .select('*')
    .eq('review_id', reviewId)
    .eq('decision_type', 'APPROVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as DbReceiptRow;
  const payload = row.payload ?? {};
  return {
    receiptId: row.id,
    projectId: row.project_id ?? reviewId,
    reviewId: row.review_id,
    versionId: row.version_id,
    actorUserId: row.actor_user_id,
    actorRole: row.actor_role as ClientProjectRole,
    decision: 'APPROVE',
    approvedConsequences: (payload.approvedConsequences as ApprovalConsequence) ?? null,
    commentSnapshot: typeof payload.commentSnapshot === 'string' ? payload.commentSnapshot : null,
    timestamp: row.created_at,
    requestId: row.request_id,
  };
}

export async function loadRevisionReceipts(reviewId: string): Promise<ClientRevisionRequestReceipt[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_client_review_receipts')
    .select('*')
    .eq('review_id', reviewId)
    .eq('decision_type', 'REVISION')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbReceiptRow[]).map((row) => {
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

export async function loadAllReceipts(reviewId: string): Promise<DbReceiptRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_client_review_receipts')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbReceiptRow[]) ?? [];
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
  const supabase = getSupabaseAdmin();
  const id = randomUUID();
  const now = new Date().toISOString();
  const row = {
    id,
    project_id: input.projectId,
    review_id: input.reviewId,
    version_id: input.versionId,
    viewport: input.viewport,
    author_user_id: input.authorUserId,
    author_role: input.authorRole,
    body: input.body.trim(),
    annotation_id: input.annotationId ?? null,
    parent_comment_id: input.parentCommentId ?? null,
    visibility: input.visibility ?? 'CLIENT_AND_SITE00',
    status: 'OPEN',
    created_at: now,
    updated_at: now,
    resolved_at: null,
  };
  const { error } = await supabase.from('site00_client_review_comments').insert(row);
  if (error) throw new Error(error.message);
  return mapCommentRow(row as DbCommentRow);
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
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from('site00_client_review_annotations')
    .select('*', { count: 'exact', head: true })
    .eq('review_id', input.reviewId)
    .eq('version_id', input.versionId)
    .eq('viewport', input.viewport);
  const markerIndex = (count ?? 0) + 1;
  const id = randomUUID();
  const now = new Date().toISOString();
  const row = {
    id,
    project_id: input.projectId,
    review_id: input.reviewId,
    version_id: input.versionId,
    viewport: input.viewport,
    x_percent: input.xPercent,
    y_percent: input.yPercent,
    width_percent: null,
    height_percent: null,
    marker_index: markerIndex,
    comment_id: input.commentId ?? null,
    created_by_user_id: input.createdByUserId,
    created_at: now,
  };
  const { error } = await supabase.from('site00_client_review_annotations').insert(row);
  if (error) throw new Error(error.message);
  return mapAnnotationRow(row as DbAnnotationRow);
}

export async function linkCommentAnnotation(commentId: string, annotationId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from('site00_client_review_comments').update({ annotation_id: annotationId }).eq('id', commentId);
  await supabase.from('site00_client_review_annotations').update({ comment_id: commentId }).eq('id', annotationId);
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
}): Promise<DbReceiptRow> {
  const supabase = getSupabaseAdmin();
  const existing = await loadReceiptByRequestId(input.reviewId, input.decisionType, input.requestId);
  if (existing) return existing;
  const id = randomUUID();
  const row = {
    id,
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
  const { error } = await supabase.from('site00_client_review_receipts').insert(row);
  if (error) {
    const dup = await loadReceiptByRequestId(input.reviewId, input.decisionType, input.requestId);
    if (dup) return dup;
    throw new Error(error.message);
  }
  return row as DbReceiptRow;
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
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('site00_client_review_events').insert({
    id: randomUUID(),
    project_id: input.projectId,
    review_id: input.reviewId,
    event_type: input.eventType,
    actor_user_id: input.actorUserId ?? null,
    actor_role: input.actorRole ?? null,
    payload: input.payload ?? {},
    client_visible: input.clientVisible ?? true,
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function updateReviewClientStatus(reviewId: string, clientStatus: ClientReviewStatus, metadataPatch?: ReviewMetadata): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('site00_client_review_objects')
    .select('metadata')
    .eq('id', reviewId)
    .maybeSingle();
  const metadata = { ...(existing?.metadata as ReviewMetadata | null), ...metadataPatch };
  const { error } = await supabase
    .from('site00_client_review_objects')
    .update({
      client_status: clientStatus,
      metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId);
  if (error) throw new Error(error.message);
}

export async function upsertPreviewReviewObject(input: {
  review: ClientReviewObject;
  isPreviewFixture: boolean;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const r = input.review;
  const metadata: ReviewMetadata = {
    objectType: r.objectType,
    availableVersionIds: r.availableVersionIds,
    availableViewports: r.availableViewports,
    referenceAvailable: r.referenceAvailable,
    compareAvailable: r.compareAvailable,
    compareMode: r.compareMode,
    compareLeftLabel: r.compareLeftLabel,
    compareRightLabel: r.compareRightLabel,
    compareLeftVersionId: r.compareLeftVersionId,
    compareRightVersionId: r.compareRightVersionId,
    commentingAllowed: r.commentingAllowed,
    annotationAllowed: r.annotationAllowed,
    approvalAllowed: r.approvalAllowed,
    revisionAllowed: r.revisionAllowed,
    declineAllowed: r.declineAllowed,
    approvalConsequences: r.approvalConsequences,
    thumbnailUrl: r.thumbnailUrl,
    actionRequired: r.actionRequired,
    versionLabel: r.versionLabel,
  };
  const { error } = await supabase.from('site00_client_review_objects').upsert({
    id: r.reviewId,
    project_id: null,
    project_slug: r.projectSlug,
    phase_id: r.phaseId,
    phase_label: r.phaseLabel,
    object_type: r.objectType,
    title: r.title,
    subtitle: r.subtitle,
    internal_status: 'CLIENT_REVIEW_READY',
    client_status: r.status,
    current_version_id: r.currentVersionId,
    client_visible: true,
    is_preview_fixture: input.isPreviewFixture,
    metadata,
    ready_at: r.readyAt,
    created_at: r.readyAt,
    updated_at: r.updatedAt,
  });
  if (error) throw new Error(error.message);
}

export async function upsertPreviewReviewVersion(version: ClientReviewVersion): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('site00_client_review_versions').upsert({
    id: version.versionId,
    review_id: version.reviewId,
    label: version.label,
    client_summary: version.clientSummary,
    preview_asset_url: version.previewAssetUrl,
    preview_asset_alt: version.previewAssetAlt,
    available_viewports: version.availableViewports,
    is_current: version.isCurrent,
    is_approved: version.isApproved,
    is_superseded: version.isSuperseded,
    created_at: version.createdAt,
  });
  if (error) throw new Error(error.message);
}

export async function countPreviewFixtures(projectSlug: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from('site00_client_review_objects')
    .select('*', { count: 'exact', head: true })
    .eq('project_slug', projectSlug)
    .eq('is_preview_fixture', true);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function resetPreviewFixtureMutations(reviewIds: string[]): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (reviewIds.length === 0) return;
  await supabase.from('site00_client_review_comments').delete().in('review_id', reviewIds);
  await supabase.from('site00_client_review_annotations').delete().in('review_id', reviewIds);
  await supabase.from('site00_client_review_receipts').delete().in('review_id', reviewIds);
  await supabase.from('site00_client_review_events').delete().in('review_id', reviewIds);
}

export async function getActionableReviewCount(projectSlug: string): Promise<number> {
  const reviews = await loadReviewObjectsForProject(projectSlug);
  return reviews.filter((r) => r.actionRequired && ['READY_FOR_REVIEW', 'AWAITING_CLIENT'].includes(r.status)).length;
}

export { PREVIEW_REVIEW_PROJECT_SLUG };
