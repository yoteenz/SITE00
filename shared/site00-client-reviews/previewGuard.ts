/** P0.CLIENT.2A — Preview mode guard (fail-closed; no production auth bypass). */

import { PREVIEW_REVIEW_PROJECT_SLUG } from './previewSeed.js';

export { PREVIEW_REVIEW_PROJECT_SLUG };

function readEnv(key: string): string | undefined {
  if (typeof process === 'undefined') return undefined;
  return process.env[key];
}

export function isSite00ProductionRuntime(): boolean {
  if (readEnv('SITE00_PRODUCTION') === '1') return true;
  if (readEnv('VERCEL_ENV') === 'production') return true;
  if (readEnv('NODE_ENV') === 'production' && readEnv('VERCEL_ENV') !== 'preview') return true;
  return false;
}

/** Explicit dev/QA opt-in — never enabled by slug alone. */
export function isClientReviewPreviewBypassEnabled(): boolean {
  if (isSite00ProductionRuntime()) return false;
  return readEnv('SITE00_CLIENT_REVIEW_PREVIEW_MODE') === '1';
}

export function isPreviewProjectSlug(projectSlug: string): boolean {
  return projectSlug === PREVIEW_REVIEW_PROJECT_SLUG;
}

/** Throws FORBIDDEN when preview bypass is not explicitly allowed. Fail-closed. */
export function assertClientPreviewModeAllowed(): void {
  if (!isClientReviewPreviewBypassEnabled()) {
    throw new Error('FORBIDDEN');
  }
}

/** Module-load guard: production must never enable preview bypass via env. */
export function assertProductionPreviewBypassDisabled(): void {
  if (isSite00ProductionRuntime() && readEnv('SITE00_CLIENT_REVIEW_PREVIEW_MODE') === '1') {
    throw new Error('SITE00_CLIENT_REVIEW_PREVIEW_MODE must not be enabled in production');
  }
}

/** Synthetic QA principal for preview-client-room only when preview mode is explicitly enabled. */
export function resolvePreviewQaAuth(): { id: string; email: string } | null {
  if (!isClientReviewPreviewBypassEnabled()) return null;
  return {
    id: readEnv('SITE00_CLIENT_REVIEW_PREVIEW_QA_USER_ID') ?? '00000000-0000-4000-8000-000000000001',
    email: readEnv('SITE00_CLIENT_REVIEW_PREVIEW_QA_EMAIL') ?? 'preview-qa@site00.dev',
  };
}

if (typeof process !== 'undefined') {
  assertProductionPreviewBypassDisabled();
}
