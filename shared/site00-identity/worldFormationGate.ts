/**
 * WORLD formation entry gate — inputs P0.F receives (P0.E)
 */

import { WORLD_FORMATION_IMPLEMENTED } from '../site00-brand-lore/worldFormation/futureContracts.js';

export type WorldFormationEntryInput = {
  approvedClientFounderTruth: boolean;
  approvedIdentityCanon: boolean;
  approvedWorldStructureCanon: boolean;
  sourceReferences: boolean;
  unresolvedConstraints: boolean;
};

export type WorldFormationEntryGate = {
  defined: true;
  worldFormationImplemented: typeof WORLD_FORMATION_IMPLEMENTED;
  requiredInputs: (keyof WorldFormationEntryInput)[];
  excludedInputs: string[];
  note: string;
};

/** What WORLD formation runtime must consume — rejected territory data excluded */
export const WORLD_FORMATION_ENTRY_GATE: WorldFormationEntryGate = {
  defined: true,
  worldFormationImplemented: WORLD_FORMATION_IMPLEMENTED,
  requiredInputs: [
    'approvedClientFounderTruth',
    'approvedIdentityCanon',
    'approvedWorldStructureCanon',
    'sourceReferences',
    'unresolvedConstraints',
  ],
  excludedInputs: [
    'REJECTED territory payloads',
    'REJECTED field judgments',
    'CREATIVE_EXPLORATION without APPROVE judgment',
    'SITE 00 host identity traits',
    'NDXBOOK methodology artifacts',
  ],
  note:
    'WORLD formation consumes APPROVED CANON + CLIENT TRUTH + WORLD STRUCTURE CANON only. Structural canon ≠ visual world formation.',
};

export function isWorldFormationReady(inputs: WorldFormationEntryInput): boolean {
  if (!WORLD_FORMATION_IMPLEMENTED) return false;
  return (
    inputs.approvedClientFounderTruth &&
    inputs.approvedIdentityCanon &&
    inputs.approvedWorldStructureCanon &&
    inputs.sourceReferences
  );
}
