/**
 * Stable references for useSyncExternalStore getSnapshot functions.
 * Derived lists must not allocate a new array/object on every read when data is unchanged.
 */

import { getRepository } from './deviceRepository';

let lastUpdatedAt = '';
const cache = new Map<string, unknown>();

function repoUpdatedAt(): string {
  return getRepository().getSnapshot().updatedAt;
}

/** Memoize a repository-derived snapshot until the repository `updatedAt` changes. */
export function cachedRepoView<T>(key: string, compute: () => T): T {
  const version = repoUpdatedAt();
  if (version !== lastUpdatedAt) {
    cache.clear();
    lastUpdatedAt = version;
  }
  if (!cache.has(key)) {
    cache.set(key, compute());
  }
  return cache.get(key) as T;
}

/** Test-only: drop memoized views between isolated runs. */
export function resetCachedRepoViewsForTests() {
  lastUpdatedAt = '';
  cache.clear();
}
