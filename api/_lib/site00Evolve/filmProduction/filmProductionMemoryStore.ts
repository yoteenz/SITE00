/**
 * P0.FILM.1 — Film production in-memory store.
 */

import type { FilmProductionState } from '../../../shared/site00-studio-world-production/filmProduction/types.js';

const store = new Map<string, FilmProductionState>();

export function getFilmProductionState(projectId: string): FilmProductionState | null {
  return store.get(projectId) ?? null;
}

export function saveFilmProductionState(state: FilmProductionState): FilmProductionState {
  store.set(state.projectId, state);
  return state;
}

export function resetFilmProductionMemory(): void {
  store.clear();
}
