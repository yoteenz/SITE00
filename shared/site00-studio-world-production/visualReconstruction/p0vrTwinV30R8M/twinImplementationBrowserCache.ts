import type { CompiledMobileTwinImplementationDocument } from './types.js';

const STORAGE_KEY = 'site00:mobile-twin-implementation-cache:v1';

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
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TwinImplementationCacheEntry>) : {};
  } catch {
    return {};
  }
}

export function writeTwinImplementationCache(entry: TwinImplementationCacheEntry): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const parsed = readStore();
    parsed[entry.projectId.toLowerCase()] = entry;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch {
    return false;
  }
}

export function readTwinImplementationCache(projectId: string): TwinImplementationCacheEntry | null {
  return readStore()[projectId.toLowerCase()] ?? null;
}
