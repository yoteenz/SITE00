/**
 * Vitest fixtures for marketing expression pipeline.
 */

import { buildVitestBrandCharacterSynthesis } from '../brandCharacterSynthesis/vitestFixtures.js';
import { compileBrandCharacterSystemFromSynthesis } from '../brandCharacterSynthesis/characterSystemFromSynthesis.js';
import type { BrandCharacterSystem } from '../brandCharacterTerritory/types.js';

export function buildVitestBrandCharacterSystemForMarketing(): BrandCharacterSystem {
  const synthesis = buildVitestBrandCharacterSynthesis();
  return compileBrandCharacterSystemFromSynthesis({
    synthesis,
    founderApproval: 'APPROVED',
  });
}
