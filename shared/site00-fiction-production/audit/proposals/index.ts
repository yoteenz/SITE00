import type { BoardAction, Proposal } from '../types.js';
import { LIVING_WORLD_PROPOSALS } from './livingWorld.js';
import { MEMORY_PROPOSALS } from './memory.js';
import { TECHNOLOGY_PROPOSALS } from './technology.js';
import { WORLD_AND_EGG_PROPOSALS } from './worldAndEggs.js';

/**
 * The audit's recommendation to the founder. The founder's own decision is always pending.
 * REVISE is an expansion worth having only once its seconds are found inside the same release.
 */
export function boardAction(p: Proposal): BoardAction {
  if (p.category === 'E' || p.strength === 'NOT_RECOMMENDED') return 'REJECT';
  if (p.category === 'D' || p.strength === 'HOLD' || p.strength === 'LOW') return 'HOLD';
  if (p.category === 'B') return 'REVISE';
  return 'APPROVE';
}

export const PROPOSALS: Proposal[] = [...TECHNOLOGY_PROPOSALS, ...MEMORY_PROPOSALS, ...LIVING_WORLD_PROPOSALS, ...WORLD_AND_EGG_PROPOSALS].map((p) => ({
  ...p,
  board: boardAction(p),
}));

export const proposalById = (id: string): Proposal => {
  const p = PROPOSALS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown proposal ${id}`);
  return p;
};

export { LIVING_WORLD_PROPOSALS, MEMORY_PROPOSALS, TECHNOLOGY_PROPOSALS, WORLD_AND_EGG_PROPOSALS };
