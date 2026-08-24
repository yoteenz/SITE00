/** Session scroll position for `/projects/:slug/experiments` — survives refresh and hub round-trips. */

export const EXPERIMENTS_HUB_SCROLL_STORAGE_PREFIX = 'site00:experiments-hub-scroll:';

export function experimentsHubScrollStorageKey(projectSlug: string): string {
  return `${EXPERIMENTS_HUB_SCROLL_STORAGE_PREFIX}${projectSlug}`;
}

export function readExperimentsHubScrollY(projectSlug: string): number | null {
  if (typeof window === 'undefined' || !projectSlug) return null;
  try {
    const raw = window.sessionStorage.getItem(experimentsHubScrollStorageKey(projectSlug));
    if (!raw) return null;
    const y = Number.parseInt(raw, 10);
    return Number.isFinite(y) && y >= 0 ? y : null;
  } catch {
    return null;
  }
}

export function writeExperimentsHubScrollY(projectSlug: string, y: number): void {
  if (typeof window === 'undefined' || !projectSlug) return;
  try {
    window.sessionStorage.setItem(experimentsHubScrollStorageKey(projectSlug), String(Math.max(0, Math.round(y))));
  } catch {
    /* ignore quota / private mode */
  }
}

export function restoreExperimentsHubScrollY(y: number, maxAttempts = 10): void {
  if (typeof window === 'undefined') return;
  let attempts = 0;

  const tryRestore = () => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const target = Math.min(y, maxScroll);
    window.scrollTo({ top: target, left: 0, behavior: 'auto' });

    if (Math.abs(window.scrollY - target) <= 2 || attempts >= maxAttempts || maxScroll >= y) {
      return;
    }

    attempts += 1;
    requestAnimationFrame(tryRestore);
  };

  requestAnimationFrame(tryRestore);
}
