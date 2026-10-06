/**
 * Stable references for useSyncExternalStore getSnapshot functions.
 * Derived lists must not allocate a new array/object on every read when data is unchanged.
 */

import { getRepository, getRepositoryPersistRevision } from './deviceRepository';

let lastRepoVersion = '';
const cache = new Map<string, unknown>();

function repoVersionKey(): string {
  return `${getRepository().getSnapshot().updatedAt}:${getRepositoryPersistRevision()}`;
}

/** Memoize a repository-derived snapshot until the repository `updatedAt` changes. */
export function cachedRepoView<T>(key: string, compute: () => T): T {
  const version = repoVersionKey();
  if (version !== lastRepoVersion) {
    cache.clear();
    lastRepoVersion = version;
  }
  if (!cache.has(key)) {
    cache.set(key, compute());
  }
  return cache.get(key) as T;
}

/** Test-only: drop memoized views between isolated runs. */
export function resetCachedRepoViewsForTests() {
  lastRepoVersion = '';
  cache.clear();
}
