/**
 * P0.5E.5 — Mock structured character fixtures (NOT NDX identity).
 */

import type { EmbodiedCharacterBible } from '../../site00-studio-world-production/characterContinuityPipeline/types.js';
import { buildEmptyEmbodiedCharacterBible } from '../../site00-studio-world-production/characterContinuityPipeline/embodiedCharacterBible.js';
import { buildDefaultIdentityAnchors, buildDefaultNegativeConstraints } from '../../site00-studio-world-production/characterContinuityPipeline/identityGovernance.js';

/** Mock fixture — exercises pipeline without becoming NDX identity authority */
export function buildMockStructuredCharacterFixture(projectId: string): {
  rawSource: string;
  normalized: Partial<EmbodiedCharacterBible>;
} {
  const rawSource = JSON.stringify({
    fixture: 'MOCK_CHARACTER_BIBLE',
    note: 'Test fixture only — not NDX identity',
    characterEssence: 'A fictional woman used to test bible ingestion only.',
    psychologicalLogic: 'Tests contradiction preservation in pipeline.',
  });

  const base = buildEmptyEmbodiedCharacterBible({
    projectId,
    brandId: 'mock-brand',
    characterId: 'mock-character-fixture',
  });

  return {
    rawSource,
    normalized: {
      ...base,
      characterEssence: 'A fictional woman used to test bible ingestion only.',
      psychologicalLogic: 'Tests contradiction preservation in pipeline.',
      contradictions: ['Tests receipts ↔ admits uncertainty'],
      flaws: ['Pipeline test flaw — not flattering'],
      identityAnchors: buildDefaultIdentityAnchors(),
      negativeIdentityConstraints: buildDefaultNegativeConstraints(),
      behaviorAuthority: 'PARTIAL',
      identityAuthority: 'NOT_APPROVED',
      visualAuthority: 'NOT_APPROVED',
      founderApproval: false,
    },
  };
}

export function mockFixtureIsNotNdxIdentity(fixture: { normalized: Partial<EmbodiedCharacterBible> }): boolean {
  return fixture.normalized.characterId === 'mock-character-fixture';
}
