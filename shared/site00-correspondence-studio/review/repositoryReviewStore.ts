import type { CorrespondenceComment, ReviewState, VersionApprovalRecord } from '../types.js';

const STORAGE_KEY = 'site00-correspondence-review-v1';

export type StoredReviewBundle = {
  review_state: ReviewState;
  comments: CorrespondenceComment[];
  approvals: VersionApprovalRecord[];
};

export type ReviewStoreSnapshot = Record<string, StoredReviewBundle>;

function versionKey(templateId: string, versionId: string) {
  return `${templateId}::${versionId}`;
}

export function readReviewStore(): ReviewStoreSnapshot {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ReviewStoreSnapshot;
  } catch {
    return {};
  }
}

export function writeReviewStore(snapshot: ReviewStoreSnapshot): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // quota or private mode
  }
}

export function getVersionReview(templateId: string, versionId: string, fallback: ReviewState): StoredReviewBundle {
  const key = versionKey(templateId, versionId);
  const hit = readReviewStore()[key];
  if (hit) return hit;
  return { review_state: fallback, comments: [], approvals: [] };
}

export function setVersionReviewState(
  templateId: string,
  versionId: string,
  review_state: ReviewState,
  decidedBy = 'founder',
  note?: string,
): StoredReviewBundle {
  const key = versionKey(templateId, versionId);
  const prev = getVersionReview(templateId, versionId, review_state);
  const record: VersionApprovalRecord = {
    version_id: versionId,
    review_state,
    decided_at: new Date().toISOString(),
    decided_by: decidedBy,
    note,
  };
  const next: StoredReviewBundle = {
    review_state,
    comments: prev.comments,
    approvals: [...prev.approvals, record],
  };
  const all = readReviewStore();
  all[key] = next;
  writeReviewStore(all);
  return next;
}

export function addVersionComment(
  templateId: string,
  versionId: string,
  body: string,
  visibility: CorrespondenceComment['visibility'] = 'internal',
): StoredReviewBundle {
  const key = versionKey(templateId, versionId);
  const prev = getVersionReview(templateId, versionId, 'draft');
  const comment: CorrespondenceComment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    version_id: versionId,
    created_at: new Date().toISOString(),
    author: 'founder',
    body: body.trim(),
    visibility,
  };
  const next = { ...prev, comments: [...prev.comments, comment] };
  const all = readReviewStore();
  all[key] = next;
  writeReviewStore(all);
  return next;
}

/** Persistence boundary: browser localStorage until Supabase recovery approves DDL. */
export const APPROVAL_PERSISTENCE_MODE = 'repository-backed-session' as const;
