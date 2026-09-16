import type { DesignProductionState } from './types.js';
import { DESIGN_PRODUCTION_STORE_VERSION } from './types.js';

const CACHE_PREFIX = 'site00:design-workspace-production:cache:v2:';
const LEGACY_PREFIX = 'site00:design-workspace-production:v1:';

export type DesignProductionCacheEnvelope = {
  cacheVersion: 2;
  serverSessionVersion: number;
  cachedAt: string;
  state: DesignProductionState;
  role: 'SERVER_CACHE';
};

export function designProductionCacheKey(projectId: string): string {
  return `${CACHE_PREFIX}${projectId.toLowerCase()}`;
}

export function designProductionLegacyKey(projectId: string): string {
  return `${LEGACY_PREFIX}${projectId.toLowerCase()}`;
}

export function readDesignProductionCache(projectId: string): DesignProductionCacheEnvelope | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(designProductionCacheKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DesignProductionCacheEnvelope;
    if (parsed.cacheVersion !== 2 || !parsed.state) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDesignProductionCache(
  projectId: string,
  state: DesignProductionState,
  serverSessionVersion: number,
): void {
  if (typeof localStorage === 'undefined') return;
  const envelope: DesignProductionCacheEnvelope = {
    cacheVersion: 2,
    serverSessionVersion,
    cachedAt: new Date().toISOString(),
    state,
    role: 'SERVER_CACHE',
  };
  localStorage.setItem(designProductionCacheKey(projectId), JSON.stringify(envelope));
}

export function readLegacyDesignProductionLocal(projectId: string): DesignProductionState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(designProductionLegacyKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DesignProductionState;
    if (parsed.storeVersion !== DESIGN_PRODUCTION_STORE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLegacyDesignProductionLocal(projectId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(designProductionLegacyKey(projectId));
}
