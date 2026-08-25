/**
 * P0.FILM.1 — Film production store adapter.
 */

import type { FilmProductionState } from '../../../../shared/site00-studio-world-production/filmProduction/types.js';
import * as memory from './filmProductionMemoryStore.js';

export async function getFilmProductionState(projectId: string): Promise<FilmProductionState | null> {
  return memory.getFilmProductionState(projectId);
}

export async function saveFilmProductionState(state: FilmProductionState): Promise<FilmProductionState> {
  return memory.saveFilmProductionState(state);
}

export function resetFilmProductionMemory(): void {
  memory.resetFilmProductionMemory();
}
