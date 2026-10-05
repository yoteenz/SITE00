/**
 * Identity canon gate — minimum approved fields before WORLD formation entry (P0.E)
 */

import type { IdentityCanonFieldKey } from './identityFields.js';

export type IdentityCanonGateField = {
  fieldKey: IdentityCanonFieldKey | 'masterBrandRole' | 'worldStructureCanon';
  label: string;
  tier: 'REQUIRED' | 'OPTIONAL' | 'UNRESOLVED_ALLOWED';
};

/** Smallest useful gate for WORLD formation entry — not production-ready logo files */
export const IDENTITY_CANON_GATE: readonly IdentityCanonGateField[] = [
  { fieldKey: 'masterBrandRole', label: 'Master brand role (Astral World = universe)', tier: 'REQUIRED' },
  { fieldKey: 'worldStructureCanon', label: 'World structure canon (hierarchy promoted)', tier: 'REQUIRED' },
  { fieldKey: 'masterBrandPositioning', label: 'Master brand positioning', tier: 'REQUIRED' },
  { fieldKey: 'masterBrandPersonality', label: 'Master brand personality', tier: 'REQUIRED' },
  { fieldKey: 'masterBrandTone', label: 'Master brand tone', tier: 'REQUIRED' },
  { fieldKey: 'masterDistrictRelationship', label: 'Master/district relationship', tier: 'REQUIRED' },
  { fieldKey: 'astreaDistrictExpression', label: 'Astréa district expression', tier: 'REQUIRED' },
  { fieldKey: 'typographyDirection', label: 'Typography direction', tier: 'OPTIONAL' },
  { fieldKey: 'paletteDirection', label: 'Palette direction', tier: 'OPTIONAL' },
  { fieldKey: 'symbolicLanguage', label: 'Symbolic language', tier: 'OPTIONAL' },
  { fieldKey: 'districtMarkerSystem', label: 'District marker system', tier: 'UNRESOLVED_ALLOWED' },
  { fieldKey: 'signageDirection', label: 'Signage direction', tier: 'UNRESOLVED_ALLOWED' },
  { fieldKey: 'environmentalIdentityPrinciples', label: 'Environmental identity principles', tier: 'UNRESOLVED_ALLOWED' },
] as const;

export type IdentityCanonGateResult = {
  satisfied: boolean;
  requiredMet: string[];
  requiredMissing: string[];
  optionalMet: string[];
  unresolvedAllowed: string[];
};

export function evaluateIdentityCanonGate(
  activeCanonFieldKeys: Set<string>,
  hasWorldStructureCanon: boolean,
  hasMasterBrandRole: boolean,
): IdentityCanonGateResult {
  const requiredMet: string[] = [];
  const requiredMissing: string[] = [];
  const optionalMet: string[] = [];
  const unresolvedAllowed: string[] = [];

  for (const gate of IDENTITY_CANON_GATE) {
    const met =
      gate.fieldKey === 'worldStructureCanon'
        ? hasWorldStructureCanon
        : gate.fieldKey === 'masterBrandRole'
          ? hasMasterBrandRole
          : activeCanonFieldKeys.has(gate.fieldKey);

    if (gate.tier === 'REQUIRED') {
      (met ? requiredMet : requiredMissing).push(gate.fieldKey);
    } else if (gate.tier === 'OPTIONAL' && met) {
      optionalMet.push(gate.fieldKey);
    } else if (gate.tier === 'UNRESOLVED_ALLOWED') {
      unresolvedAllowed.push(gate.fieldKey);
    }
  }

  return {
    satisfied: requiredMissing.length === 0,
    requiredMet,
    requiredMissing,
    optionalMet,
    unresolvedAllowed,
  };
}
