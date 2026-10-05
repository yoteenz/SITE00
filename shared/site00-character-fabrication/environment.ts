/**
 * Authority environment family — state → plate (see docs/environment-family/STATE-TO-ENVIRONMENT.json).
 * Only RUNNING / PAUSED simulation uses the distinct volume; all other states keep fabrication.base.
 */
import type { FabricationState } from './types.js';
import { CF_FABRICATION_ENV_SLOT, CF_SIMULATION_ENV_SLOT } from './assets.js';

export type CharacterEnvironmentSlotId = typeof CF_FABRICATION_ENV_SLOT | typeof CF_SIMULATION_ENV_SLOT;

export function isCharacterRunningSimulation(state: FabricationState): boolean {
  const s = state.run?.status;
  return s === 'RUNNING' || s === 'PAUSED';
}

/** Canonical environment slot for the hero background (CF-18 swap only while run is active). */
export function characterEnvironmentSlotId(state: FabricationState): CharacterEnvironmentSlotId {
  return isCharacterRunningSimulation(state) ? CF_SIMULATION_ENV_SLOT : CF_FABRICATION_ENV_SLOT;
}
