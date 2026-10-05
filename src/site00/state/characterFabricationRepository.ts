/**
 * Character Fabrication persistence boundary.
 *
 * HONEST STATUS: there is no server-side Character Fabrication authority store yet. This repository is the ONE place
 * that talks to storage, so replacing it with an API repository later changes nothing else.
 * Current implementation = DEVICE-LOCAL (localStorage, same mechanism as productionRequestStore / productionActivityStore).
 * Founder gates for Body / Look / Appearance / Character / Performance / Simulation / Authority therefore persist on this
 * device only and are NOT canonical backend authority.
 */
import { initialFabricationState } from '../../../shared/site00-character-fabrication/index.js';
import type { FabricationState } from '../../../shared/site00-character-fabrication/index.js';

export type FabricationRepository = {
  readonly kind: 'DEVICE_LOCAL' | 'BACKEND';
  load(projectId: string, entryId: string): FabricationState;
  save(state: FabricationState): void;
  clear(projectId: string, entryId: string): void;
};

const key = (projectId: string, entryId: string) => `site00.character-fabrication.v1.${projectId}.${entryId}`;

export const deviceLocalFabricationRepository: FabricationRepository = {
  kind: 'DEVICE_LOCAL',
  load(projectId, entryId) {
    try {
      const raw = window.localStorage.getItem(key(projectId, entryId));
      if (!raw) return initialFabricationState();
      const parsed = JSON.parse(raw) as FabricationState;
      if (parsed?.schema !== 1) return initialFabricationState();
      // merge over defaults so fields added later never come back undefined
      return { ...initialFabricationState(), ...parsed, outbox: [], notice: null, run: parsed.run && parsed.run.status === 'RUNNING' ? { ...parsed.run, status: 'PAUSED' } : parsed.run };
    } catch {
      return initialFabricationState();
    }
  },
  save(state) {
    try {
      const { outbox: _o, notice: _n, ...rest } = state;
      void _o;
      void _n;
      window.localStorage.setItem(key(state.selectedProjectId, state.selectedEntryId), JSON.stringify({ ...rest, outbox: [], notice: null }));
    } catch {
      /* storage unavailable — state remains in memory only */
    }
  },
  clear(projectId, entryId) {
    try {
      window.localStorage.removeItem(key(projectId, entryId));
    } catch {
      /* noop */
    }
  },
};
