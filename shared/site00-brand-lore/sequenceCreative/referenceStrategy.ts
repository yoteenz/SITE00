/**
 * Slide 01 reference strategy — identity continuity without layout cloning.
 */

import type { ReferenceStrategy } from './constants.js';
import type { SequenceCreativeSystem } from './types.js';

export function resolveSequenceReferenceStrategy(
  sequenceSystem: SequenceCreativeSystem,
): {
  strategy: ReferenceStrategy;
  useFor: string[];
  doNotUseFor: string[];
} {
  const strategy = sequenceSystem.referenceStrategy ?? 'IDENTITY_REFERENCE';
  return {
    strategy,
    useFor: [
      'identity continuity',
      'palette interpretation',
      'texture/material memory',
      'typographic attitude',
      'graphic grammar',
    ],
    doNotUseFor: [
      'literal layout cloning',
      'same object placement',
      'same composition',
      'same focal structure',
    ],
  };
}

export function sequenceReferenceDoesNotRequireLayoutClone(): boolean {
  return true;
}
