import type { TwinV42GoldenDiffBundle } from './twinV42Types.js';
import { TWIN_V42_GATE_BUNDLE_KEY } from './constants.js';

const memory: { bundle: TwinV42GoldenDiffBundle | null } = { bundle: null };

export function writeTwinV42GoldenDiffBundle(bundle: TwinV42GoldenDiffBundle): void {
  memory.bundle = bundle;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(TWIN_V42_GATE_BUNDLE_KEY, JSON.stringify(bundle));
  } catch {
    /* quota */
  }
}

export function readTwinV42GoldenDiffBundle(): TwinV42GoldenDiffBundle | null {
  if (memory.bundle) return memory.bundle;
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TWIN_V42_GATE_BUNDLE_KEY);
    if (!raw) return null;
    memory.bundle = JSON.parse(raw) as TwinV42GoldenDiffBundle;
    return memory.bundle;
  } catch {
    return null;
  }
}

export function clearTwinV42PersistenceForTests(): void {
  memory.bundle = null;
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TWIN_V42_GATE_BUNDLE_KEY);
}
