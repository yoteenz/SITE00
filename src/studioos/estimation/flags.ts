/**
 * Estimation flags.
 * The internal estimator is on for Studio OS.
 * The public builder does not preview estimates until the client flag is turned on.
 */

function envOn(name: string, fallback: boolean): boolean {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  const raw = env?.[name];
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return fallback;
}

export function scopeEstimatorEnabled(): boolean {
  return envOn('VITE_SITE00_SCOPE_ESTIMATOR_V1', true);
}

export function templateSystemEnabled(): boolean {
  return envOn('VITE_SITE00_TEMPLATE_SYSTEM_V1', false);
}

/** Whether the client may see dollar/week figures on the Blueprint (computation uses `scopeEstimatorEnabled()` separately). */
export function clientEstimatePreviewEnabled(): boolean {
  return envOn('VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1', false);
}

export const ESTIMATOR_FLAG_NAMES = {
  SITE00_SCOPE_ESTIMATOR_V1: 'VITE_SITE00_SCOPE_ESTIMATOR_V1',
  SITE00_TEMPLATE_SYSTEM_V1: 'VITE_SITE00_TEMPLATE_SYSTEM_V1',
  SITE00_CLIENT_ESTIMATE_PREVIEW_V1: 'VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1',
} as const;
