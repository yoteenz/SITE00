import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { precheckGenerationDispatch } from '../shared/site00-production-guardrails/index.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const ctx = { repoRoot: REPO_ROOT };

const base = {
  visualId: 'F03.00',
  projectId: 'JURNL',
  familyId: 'F03',
  providerProjectId: 'Aa0fKSPeX0SJ4DICt0aI',
  screenId: 'F03.00',
  generationClass: 'SCREEN_PARENT' as const,
  generationIntent: 'DERIVED' as const,
  generationMode: 'REFERENCE_GUIDED' as const,
  referenceAuthorityIdHint: 'F03.00_TODAY_PARENT',
  referenceInputAttached: true,
  provider: 'OpenArt',
  model: 'gpt-image-2-5-sunburst',
};

describe('JURNL reference hygiene', () => {
  it('blocks the vertical botanical logo before spend', () => {
    const pre = precheckGenerationDispatch(
      {
        ...base,
        attachedReferencePaths: ['public/site00/projects/jurnl/brand/jurnl-logo-official.png'],
      },
      { resolverContext: ctx },
    );
    expect(pre.status).toBe('BLOCKED');
    expect(pre.dispatchAllowed).toBe(false);
    expect(pre.blockedReason).toBe('SUPERSEDED_IDENTITY_REFERENCE');
    expect(pre.creditsSpent).toBe(0);
  });

  it('blocks a stack of Mediterranean scenes', () => {
    const pre = precheckGenerationDispatch(
      {
        ...base,
        attachedReferencePaths: [
          'src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_AUTHORITY_PLATE.png',
          'src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_AUTHORITY_TERRACE.png',
        ],
      },
      { resolverContext: ctx },
    );
    expect(pre.blockedReason).toBe('REFERENCE_HYGIENE_FAILED');
    expect(pre.creditsSpent).toBe(0);
  });

  it('still blocks a balanced pack while no clean identity file is registered', () => {
    const pre = precheckGenerationDispatch(
      {
        ...base,
        attachedReferencePaths: [
          'src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png',
          'src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_WORD.png',
          'ENTRY v2/02_VALUE_PROPOSITION/authority/entry-v2-value-proposition-authority.png',
          'ENTRY v2/08_BIOMETRIC_SETUP/authority/entry-v2-biometric-authority.png',
        ],
      },
      { resolverContext: ctx },
    );
    expect(pre.blockedReason).toBe('REFERENCE_HYGIENE_FAILED');
    expect(pre.creditsSpent).toBe(0);
  });
});
