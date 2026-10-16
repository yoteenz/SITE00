import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RELOAD_FLAG_PREFIX = 'site00-chunk-reload:';

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('chunkloaderror')
  );
}

/**
 * One automatic hard reload when a hashed lazy chunk 404s and the CDN serves index.html instead of JS.
 */
export function lazyWithChunkRecovery<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  chunkLabel: string,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (typeof window === 'undefined' || !isChunkLoadError(error)) {
        throw error;
      }
      const flagKey = `${RELOAD_FLAG_PREFIX}${chunkLabel}`;
      try {
        if (!sessionStorage.getItem(flagKey)) {
          sessionStorage.setItem(flagKey, String(Date.now()));
          window.location.reload();
          await new Promise<void>(() => {
            /* wait for navigation */
          });
        }
      } catch {
        /* ignore storage */
      }
      throw error;
    }
  });
}

export function clearChunkRecoveryFlag(chunkLabel: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(`${RELOAD_FLAG_PREFIX}${chunkLabel}`);
  } catch {
    /* ignore */
  }
}
