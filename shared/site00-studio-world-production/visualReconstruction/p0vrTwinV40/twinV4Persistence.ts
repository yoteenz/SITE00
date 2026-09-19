import type { TwinV4ForensicReconstructionBundle } from './twinV4Types.js';
import { TWIN_V4_STORAGE_PREFIX } from './constants.js';

const BUNDLE_KEY = `${TWIN_V4_STORAGE_PREFIX}bundle:v1`;

const memory: { bundle: TwinV4ForensicReconstructionBundle | null } = { bundle: null };

export function writeTwinV4Bundle(bundle: TwinV4ForensicReconstructionBundle): void {
  memory.bundle = bundle;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(BUNDLE_KEY, JSON.stringify(bundle));
  } catch {
    /* private mode */
  }
}

export function readTwinV4Bundle(): TwinV4ForensicReconstructionBundle | null {
  if (memory.bundle) return memory.bundle;
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BUNDLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TwinV4ForensicReconstructionBundle;
    memory.bundle = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTwinV4PersistenceForTests(): void {
  memory.bundle = null;
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(BUNDLE_KEY);
}
