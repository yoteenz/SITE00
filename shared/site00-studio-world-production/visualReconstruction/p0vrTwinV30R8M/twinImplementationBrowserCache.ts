import type { CompiledMobileTwinImplementationDocument } from './types.js';

const STORAGE_KEY = 'site00:mobile-twin-implementation-cache:v1';

/** When localStorage is unavailable (tests / rare embed), twin preview still works for the session. */
const memoryStore: Record<string, TwinImplementationCacheEntry> = {};

export type TwinImplementationCacheEntry = {
  projectId: string;
  buildId: string;
  implementationVersion: string;
  previewRoute: string;
  founderStatus: string;
  promotionStatus: string;
  document: CompiledMobileTwinImplementationDocument;
  cachedAt: string;
};

function readStore(): Record<string, TwinImplementationCacheEntry> {
  if (typeof localStorage === 'undefined') return { ...memoryStore };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, TwinImplementationCacheEntry>) : {};
    return { ...memoryStore, ...parsed };
  } catch {
    return { ...memoryStore };
  }
}

export function writeTwinImplementationCache(entry: TwinImplementationCacheEntry): boolean {
  const key = entry.projectId.toLowerCase();
  memoryStore[key] = entry;
  if (typeof localStorage === 'undefined') return true;
  try {
    const parsed = readStore();
    parsed[key] = entry;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch {
    return true;
  }
}

export function readTwinImplementationCache(projectId: string): TwinImplementationCacheEntry | null {
  return readStore()[projectId.toLowerCase()] ?? null;
}
