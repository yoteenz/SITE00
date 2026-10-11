import { emptySpatialState, type SpatialBuilderState } from './types';

const STORAGE_KEY = 'site00.bldr.spatialStudio.v1';

export function loadSpatialBuilderState(): SpatialBuilderState {
  if (typeof window === 'undefined') return emptySpatialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySpatialState();
    const parsed = JSON.parse(raw) as SpatialBuilderState;
    if (parsed.version !== 1) return emptySpatialState();
    return { ...emptySpatialState(), ...parsed };
  } catch {
    return emptySpatialState();
  }
}

export function saveSpatialBuilderState(state: SpatialBuilderState): SpatialBuilderState {
  const next = { ...state, savedAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearSpatialBuilderState(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
}
