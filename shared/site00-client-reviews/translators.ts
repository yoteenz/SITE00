import type { ClientReviewStatus } from './types.js';

const INTERNAL_STATUSES = new Set([
  'INTERNAL_DRAFT',
  'READY_FOR_FOUNDER_REVIEW',
  'GENERATION_IN_PROGRESS',
  'CANON_CANDIDATE',
  'SNAPSHOT_CAPTURED',
  'BUILD_PASSED',
  'MERGED',
  'FAL_JOB',
]);

const STATUS_MAP: Record<string, ClientReviewStatus | 'HIDDEN'> = {
  INTERNAL_DRAFT: 'HIDDEN',
  READY_FOR_FOUNDER_REVIEW: 'HIDDEN',
  CLIENT_REVIEW_READY: 'READY_FOR_REVIEW',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  AWAITING_CLIENT: 'AWAITING_CLIENT',
  REVISION_IN_PROGRESS: 'REVISION_IN_PROGRESS',
  CLIENT_APPROVED: 'APPROVED',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  SUPERSEDED: 'SUPERSEDED',
  LOCKED: 'LOCKED',
};

export function translateReviewStatusForClient(internalStatus: string): ClientReviewStatus | 'HIDDEN' {
  const key = internalStatus.trim().toUpperCase().replace(/\s+/g, '_');
  if (INTERNAL_STATUSES.has(key)) return 'HIDDEN';
  const mapped = STATUS_MAP[key];
  if (mapped) return mapped;
  if (key.includes('APPROV')) return 'APPROVED';
  if (key.includes('REVISION')) return 'REVISION_IN_PROGRESS';
  if (key.includes('REVIEW')) return 'READY_FOR_REVIEW';
  return 'READY_FOR_REVIEW';
}

export function clientReviewStatusLabel(status: ClientReviewStatus): string {
  switch (status) {
    case 'READY_FOR_REVIEW':
      return 'READY FOR REVIEW';
    case 'AWAITING_CLIENT':
      return 'AWAITING YOUR REVIEW';
    case 'REVISION_IN_PROGRESS':
      return 'REVISION IN PROGRESS';
    case 'APPROVED':
      return 'APPROVED';
    case 'DECLINED':
      return 'DECLINED';
    case 'SUPERSEDED':
      return 'SUPERSEDED';
    case 'LOCKED':
      return 'LOCKED';
    default:
      return status;
  }
}

export function translateCommentStatusForClient(status: string): 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED' {
  const key = status.toUpperCase();
  if (key === 'RESOLVED') return 'RESOLVED';
  if (key === 'ACKNOWLEDGED') return 'IN_PROGRESS';
  return 'RECEIVED';
}

const FORBIDDEN_KEYS = [
  'repo',
  'branch',
  'commit',
  'prompt',
  'provider',
  'fal',
  'service_role',
  'internal_notes',
  'source_path',
  'sourcePath',
  'canonMutation',
  'generationSeed',
  'bridge',
];

export function stripReviewInternalFields<T extends Record<string, unknown>>(payload: T): T {
  const next: Record<string, unknown> = { ...payload };
  for (const key of Object.keys(next)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_KEYS.some((f) => lower.includes(f.replace(/_/g, '')))) {
      delete next[key];
      continue;
    }
    const val = next[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      next[key] = stripReviewInternalFields(val as Record<string, unknown>);
    }
  }
  return next as T;
}

export function reviewPayloadContainsForbiddenFields(payload: unknown): boolean {
  const text = JSON.stringify(payload).toLowerCase();
  return (
    text.includes('"repo"') ||
    text.includes('"branch"') ||
    text.includes('"commit"') ||
    text.includes('"prompt"') ||
    text.includes('"fal"') ||
    text.includes('service_role') ||
    text.includes('internal_notes') ||
    text.includes('provider_job')
  );
}
