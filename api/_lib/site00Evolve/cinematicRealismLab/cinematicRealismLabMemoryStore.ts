/**
 * Cinematic Realism Lab memory store.
 */

import type { RealismLabState } from '../../../../shared/site00-studio-world-production/cinematicRealismLab/types.js';

const store = new Map<string, RealismLabState>();

export async function getRealismLabState(projectId: string): Promise<RealismLabState | null> {
  return store.get(projectId) ?? null;
}

export async function saveRealismLabState(state: RealismLabState): Promise<RealismLabState> {
  store.set(state.projectId, state);
  return state;
}

export function resetRealismLabMemory(): void {
  store.clear();
}
