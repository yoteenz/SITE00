/**
 * Shared helpers for founder-triggered FAL work that must survive HTTP disconnect
 * (tunnel refresh, mobile navigation, etc.).
 */

export function shouldRunFalSynchronously(): boolean {
  if (process.env.VITEST === 'true') return true;
  // Long-running Railway/Node hosts: await FAL in-request so work is not dropped after HTTP 202.
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID) return true;
  if (process.env.SITE00_FAL_SYNCHRONOUS === '1') return true;
  return false;
}

export function enqueueFalBackgroundWork(work: () => Promise<void>): void {
  // Start immediately — setImmediate can defer past process freeze on some hosts.
  void work();
}

export const FAL_BACKGROUND_STALE_MS = 15 * 60 * 1000;
export const FAL_BACKGROUND_RESUME_MS = 45 * 1000;

export function isFreshBackgroundAttempt(startedAt: string | null | undefined, staleMs: number): boolean {
  if (!startedAt) return false;
  return Date.now() - new Date(startedAt).getTime() <= staleMs;
}
