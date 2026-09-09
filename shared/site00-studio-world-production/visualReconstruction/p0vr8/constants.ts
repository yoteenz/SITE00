/**
 * P0.VR.8 — Live page mirror constants.
 */

export const P0_VR_8_LINEAGE = 'P0.VR.8' as const;

export const PAGE_MIRROR_FAILURE_CODES = [
  'PAGE_REGISTRY_STATIC',
  'PAGE_ROUTE_DISCOVERY_STALE',
  'PAGE_PROJECT_SCOPE_MISSING',
  'PAGE_SCREENSHOT_STALE',
  'PAGE_SCREENSHOT_CAPTURE_FAILED',
  'PAGE_CAPTURE_BEFORE_DEPLOY',
  'PAGE_CROSS_PROJECT_COLLISION',
  'PAGE_ROUTE_REMOVAL_NOT_RECONCILED',
  'PAGE_DYNAMIC_ROUTE_UNBOUNDED',
  'PAGE_AUTH_CAPTURE_INVALID',
  'PAGE_HALF_RENDER_CAPTURED',
  'PAGE_CAPTURE_QUEUE_DUPLICATED',
  'PAGE_REFERENCE_LIVE_MISMATCH_STALE',
] as const;

export const PAGE_MIRROR_STATUS = [
  'DISCOVERED',
  'CAPTURE_PENDING',
  'CAPTURING',
  'CURRENT',
  'STALE',
  'CAPTURE_FAILED',
  'ROUTE_MISSING',
  'REMOVED',
  'AUTH_REQUIRED',
  'BLOCKED',
] as const;

export const PAGE_MIRROR_FILTERS = [
  'ALL',
  'CURRENT',
  'STALE',
  'MISSING REF',
  'REFERENCE READY',
  'DRIFT',
  'VERIFIED',
  'CAPTURE FAILED',
] as const;

export const PAGE_SYNC_EVENT_TYPES = [
  'PAGE_CREATED',
  'PAGE_UPDATED',
  'ROUTE_ADDED',
  'ROUTE_REMOVED',
  'ROUTE_CHANGED',
  'DEPLOYMENT_COMPLETE',
  'BUILD_COMPLETE',
  'VISUAL_CHANGE_DETECTED',
  'MANUAL_REFRESH',
  'REFERENCE_BOUND',
  'SCREEN_AUTHORITY_UPDATED',
] as const;

export const PAGE_CAPTURE_MAX_RETRIES = 3;
export const PAGE_CAPTURE_RETRY_DELAY_MS = 2000;

export const PROJECT_LIVE_BASE_URLS: Record<string, string> = {
  site00: 'https://site00.com',
  ndxbook: 'https://site00.com',
  'frontal-slayer': 'https://site00.com',
  'all-in-one-enterprises': 'https://site00.com',
  'astral-world': 'https://site00.com',
  'studio-world': 'https://site00.com',
};
