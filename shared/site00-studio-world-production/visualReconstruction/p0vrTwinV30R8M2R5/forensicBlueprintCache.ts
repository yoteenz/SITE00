import type { ForensicUiBlueprintAuthority } from './forensicTypes.js';
import { FORENSIC_BLUEPRINT_FAL_ENDPOINT, FORENSIC_BLUEPRINT_PROMPT_VERSION } from './constants.js';
import { site00IsBrowser } from '../../runtime/site00RuntimeEnv.js';

const cache = new Map<string, ForensicUiBlueprintAuthority>();
const STORAGE_PREFIX = 'site00:forensic-blueprint-cache:v1:';

function readFromStorage(key: string): ForensicUiBlueprintAuthority | null {
  if (!site00IsBrowser() || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as ForensicUiBlueprintAuthority;
  } catch {
    return null;
  }
}

function writeToStorage(key: string, authority: ForensicUiBlueprintAuthority): void {
  if (!site00IsBrowser() || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(authority));
  } catch {
    /* quota / private mode */
  }
}

export function forensicBlueprintCacheKey(input: {
  actualHash: string;
  promptVersion?: string;
  falEndpoint?: string;
}): string {
  return `${input.actualHash}|${input.promptVersion ?? FORENSIC_BLUEPRINT_PROMPT_VERSION}|${input.falEndpoint ?? FORENSIC_BLUEPRINT_FAL_ENDPOINT}`;
}

export function readForensicBlueprintFromCache(key: string): ForensicUiBlueprintAuthority | null {
  const mem = cache.get(key);
  if (mem) return mem;
  const stored = readFromStorage(key);
  if (stored) cache.set(key, stored);
  return stored;
}

export function writeForensicBlueprintToCache(key: string, authority: ForensicUiBlueprintAuthority): void {
  cache.set(key, authority);
  writeToStorage(key, authority);
}

const STUB_FORENSIC_URI_PREFIXES = ['vitest-fal://', 'local-autobuild://'];

export function isLoadableForensicBlueprintUri(uri: string): boolean {
  if (!uri) return false;
  if (STUB_FORENSIC_URI_PREFIXES.some((p) => uri.startsWith(p))) return false;
  return (
    uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    (uri.startsWith('/') && !uri.startsWith('//'))
  );
}

function pickBestForensicBootCandidate(
  projectId: string,
  authority: ForensicUiBlueprintAuthority,
  best: ForensicUiBlueprintAuthority | null,
): ForensicUiBlueprintAuthority | null {
  if (authority.projectId !== projectId) return best;
  if (!isLoadableForensicBlueprintUri(authority.blueprintImageUri)) return best;
  if (authority.founderReviewStatus === 'CORRECTION_REQUESTED') return best;
  const usable =
    authority.founderReviewStatus === 'APPROVED' ||
    authority.status === 'MACHINE_VALIDATED' ||
    authority.status === 'FOUNDER_BLUEPRINT_REVIEW';
  if (!usable) return best;
  if (!best || authority.generatedAt > best.generatedAt) return authority;
  return best;
}

/** Cached real Fal forensic PNG (https) — includes MACHINE_VALIDATED pending founder click. */
export function findCachedForensicBlueprintForTwinV41Boot(projectId: string): ForensicUiBlueprintAuthority | null {
  let best: ForensicUiBlueprintAuthority | null = null;
  for (const authority of cache.values()) {
    best = pickBestForensicBootCandidate(projectId, authority, best);
  }
  if (!site00IsBrowser() || typeof localStorage === 'undefined') return best;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const authority = JSON.parse(raw) as ForensicUiBlueprintAuthority;
      best = pickBestForensicBootCandidate(projectId, authority, best);
    } catch {
      /* skip */
    }
  }
  return best;
}

/** Browser: find founder-approved forensic with loadable image URI (https or site path). */
export function findFounderApprovedForensicBlueprintInStorage(): ForensicUiBlueprintAuthority | null {
  if (!site00IsBrowser() || typeof localStorage === 'undefined') return null;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const authority = JSON.parse(raw) as ForensicUiBlueprintAuthority;
      if (authority.founderReviewStatus !== 'APPROVED') continue;
      if (isLoadableForensicBlueprintUri(authority.blueprintImageUri)) return authority;
    } catch {
      /* skip corrupt */
    }
  }
  return null;
}

export function clearForensicBlueprintCacheForTests(): void {
  cache.clear();
  if (typeof localStorage !== 'undefined') {
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const k = localStorage.key(i);
      if (k?.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k);
    }
  }
}
