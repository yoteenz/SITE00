import type { TwinV41PixelExtractionBundle } from './twinV41Types.js';
import { TWIN_V41_STORAGE_PREFIX } from './constants.js';

const BUNDLE_KEY = `${TWIN_V41_STORAGE_PREFIX}pixel-extraction:v1`;

const memory: { bundle: TwinV41PixelExtractionBundle | null } = { bundle: null };

export function writeTwinV41Bundle(bundle: TwinV41PixelExtractionBundle): void {
  memory.bundle = bundle;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(BUNDLE_KEY, JSON.stringify(bundle));
  } catch {
    /* private mode */
  }
}

export function readTwinV41Bundle(): TwinV41PixelExtractionBundle | null {
  if (memory.bundle) return memory.bundle;
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BUNDLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TwinV41PixelExtractionBundle;
    memory.bundle = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTwinV41PersistenceForTests(): void {
  memory.bundle = null;
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(BUNDLE_KEY);
}
