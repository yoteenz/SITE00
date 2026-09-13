import {
  emptyDesignPageAuthorityBatch2Module,
  normalizeDesignPageAuthorityBatch2Module,
  type DesignPageAuthorityBatch2ModuleState,
} from './designPageAuthorityBatch2Module.js';

export const BATCH2_MODULE_STORAGE_KEY = 'site00:design-page-v3-authority:batch2-module:v1' as const;

function readStore(): Record<string, DesignPageAuthorityBatch2ModuleState> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(BATCH2_MODULE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DesignPageAuthorityBatch2ModuleState>;
  } catch {
    return {};
  }
}

function writeStore(parsed: Record<string, DesignPageAuthorityBatch2ModuleState>): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    localStorage.setItem(BATCH2_MODULE_STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch {
    return false;
  }
}

export function readDesignPageAuthorityBatch2Module(projectId: string): DesignPageAuthorityBatch2ModuleState {
  const key = projectId.toLowerCase();
  const row = readStore()[key];
  if (!row) return emptyDesignPageAuthorityBatch2Module(key);
  return normalizeDesignPageAuthorityBatch2Module(row);
}

export function writeDesignPageAuthorityBatch2Module(state: DesignPageAuthorityBatch2ModuleState): boolean {
  const key = state.projectId.toLowerCase();
  const normalized = normalizeDesignPageAuthorityBatch2Module(state);
  const store = readStore();
  store[key] = { ...normalized, updatedAt: new Date().toISOString() };
  return writeStore(store);
}
