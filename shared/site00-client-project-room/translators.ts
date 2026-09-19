import type { ClientActivityEvent } from './types.js';

const INTERNAL_EVENT_TYPES = new Set([
  'SNAPSHOT_CAPTURED',
  'BUILD_PASSED',
  'MERGED',
  'SOURCE_CODE_MATERIALIZATION',
  'FAL_JOB',
  'PROVIDER_RETRY',
  'SUPABASE_RECEIPT',
  'CAPTURE_SUCCEEDED',
  'SOURCE_CHANGE_APPLIED',
  'GENERATION_ERROR',
]);

const STATUS_MAP: Record<string, string> = {
  GENERATION_IN_PROGRESS: 'IN PRODUCTION',
  CANON_CANDIDATE: 'READY FOR REVIEW',
  FOUNDER_APPROVED: 'APPROVED',
  SOURCE_CODE_MATERIALIZATION: 'IMPLEMENTATION UNDERWAY',
  BUILD_PASSED: 'QUALITY CHECK COMPLETE',
  MERGED: 'IMPLEMENTATION COMPLETE',
  SNAPSHOT_CAPTURED: 'LATEST PREVIEW',
  REFERENCE_BINDING: 'APPROVED REFERENCE',
  VERSION_LINEAGE: 'VERSION HISTORY',
  ONBOARDING: 'ONBOARDING',
  IN_PRODUCTION: 'IN PRODUCTION',
  READY_FOR_REVIEW: 'READY FOR REVIEW',
  AWAITING_FEEDBACK: 'AWAITING FEEDBACK',
  REVISION_IN_PROGRESS: 'REVISION IN PROGRESS',
  APPROVED: 'APPROVED',
  BUILDING: 'BUILDING',
  FINAL_REVIEW: 'FINAL REVIEW',
  READY_TO_LAUNCH: 'READY TO LAUNCH',
  COMPLETE: 'COMPLETE',
  PAUSED: 'PAUSED',
};

export function translateProjectStatusForClient(internalStatus: string): string {
  const key = internalStatus.trim().toUpperCase().replace(/\s+/g, '_');
  return STATUS_MAP[key] ?? 'IN PRODUCTION';
}

export type InternalProjectEvent = {
  id: string;
  eventType: string;
  summary?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
};

export function translateProjectEventForClient(event: InternalProjectEvent): ClientActivityEvent | 'HIDDEN' {
  const type = event.eventType.toUpperCase();
  if (INTERNAL_EVENT_TYPES.has(type)) return 'HIDDEN';
  if (type.includes('FAL') || type.includes('PROVIDER') || type.includes('REPO') || type.includes('COMMIT')) {
    return 'HIDDEN';
  }

  const dateLabel = event.timestamp
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(event.timestamp)).toUpperCase()
    : '';

  let icon: ClientActivityEvent['icon'] = 'milestone';
  if (type.includes('APPROV')) icon = 'approval';
  else if (type.includes('REVIEW') || type.includes('DIRECTION')) icon = 'direction';
  else if (type.includes('MESSAGE')) icon = 'message';
  else if (type.includes('PRODUCTION') || type.includes('DEVELOPMENT')) icon = 'production';

  return {
    id: event.id,
    dateLabel,
    summary: event.summary ?? translateProjectStatusForClient(type),
    icon,
    isNew: false,
  };
}

export type InternalReviewObject = {
  id: string;
  title: string;
  internalStatus: string;
  versionLabel?: string;
  prompt?: string;
  provider?: string;
  repo?: string;
  branch?: string;
  commit?: string;
  internalNotes?: string;
};

export function buildClientReviewObject(review: InternalReviewObject) {
  return {
    id: review.id,
    title: review.title,
    status: translateProjectStatusForClient(review.internalStatus),
    versionLabel: review.versionLabel ?? 'V01',
  };
}

const FORBIDDEN_CLIENT_PAYLOAD_KEYS = [
  'prompt',
  'provider',
  'repo',
  'branch',
  'commit',
  'fal',
  'service_role',
  'internalNotes',
  'internal_notes',
  'sourcePath',
  'source_path',
  'receipt',
  'supabase',
  'canonMutation',
  'generationSeed',
] as const;

export function stripInternalFields<T extends Record<string, unknown>>(payload: T): T {
  const next: Record<string, unknown> = { ...payload };
  for (const key of Object.keys(next)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_CLIENT_PAYLOAD_KEYS.some((f) => lower.includes(f.replace(/_/g, '')))) {
      delete next[key];
      continue;
    }
    const val = next[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      next[key] = stripInternalFields(val as Record<string, unknown>);
    }
  }
  return next as T;
}

export function clientPayloadContainsForbiddenFields(payload: unknown): boolean {
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
