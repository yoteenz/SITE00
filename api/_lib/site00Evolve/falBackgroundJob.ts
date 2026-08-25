/**
 * Shared helpers for founder-triggered FAL work that must survive HTTP disconnect
 * (tunnel refresh, mobile navigation, etc.).
 */

export function shouldRunFalSynchronously(): boolean {
  return process.env.VITEST === 'true';
}

export function enqueueFalBackgroundWork(work: () => Promise<void>): void {
  setImmediate(() => {
    void work();
  });
}

export const FAL_BACKGROUND_STALE_MS = 15 * 60 * 1000;
export const FAL_BACKGROUND_RESUME_MS = 45 * 1000;

export function isFreshBackgroundAttempt(startedAt: string | null | undefined, staleMs: number): boolean {
  if (!startedAt) return false;
  return Date.now() - new Date(startedAt).getTime() <= staleMs;
}
