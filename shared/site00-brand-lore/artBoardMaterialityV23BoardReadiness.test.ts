import { describe, it, expect } from 'vitest';
import {
  v23ArtifactHasSignatureLimeInPrompt,
  v23BoardNeedsReformulation,
} from './artBoardMateriality/v23BoardReadiness.js';
import type { Experiment01V23Artifact } from './artBoardMateriality/types.js';

function stubArtifact(overrides: Partial<Experiment01V23Artifact> = {}): Experiment01V23Artifact {
  return {
    id: 'bma-exp01-v23-1',
    v1ArtifactId: 'bma-exp01-1',
    v22ArtifactId: 'bma-exp01-v22-1',
    topic: 't',
    subject: 's',
    contract: {} as Experiment01V23Artifact['contract'],
    carouselArchitecture: {} as Experiment01V23Artifact['carouselArchitecture'],
    editorialDecision: {} as Experiment01V23Artifact['editorialDecision'],
    generationContract: { prompt: 'plain prompt', promptHash: 'abc', sectionOrder: [] },
    generatedAssetId: null,
    generatedAssetUrl: null,
    generationStatus: 'GENERATED',
    materialityEvaluation: {} as Experiment01V23Artifact['materialityEvaluation'],
    humanMadeEvaluation: null,
    humanMadeRevision: null,
    signatureLimeEvaluation: null,
    signatureLimeRevision: null,
    signatureLimeMigration: null,
    parentFingerprint: null,
    parentGeneratedAssetUrl: null,
    founderJudgment: null,
    founderJudgmentNote: null,
    revisionHistory: [],
    fingerprint: 'fp',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('v23BoardReadiness', () => {
  it('detects signature lime in FAL prompt', () => {
    const withLime = stubArtifact({
      generationContract: {
        prompt: 'SIGNATURE LIME REQUIREMENT: lime required',
        promptHash: 'x',
        sectionOrder: [],
      },
      signatureLimeEvaluation: {
        accentSelection: {
          targetText: 'APOLOGY',
          targetType: 'WORD',
          reason: 'test',
          colorToken: '#D6FF3B',
          wordLevelAccent: null,
          punctuationAccent: null,
          secondaryAccent: null,
        },
      } as Experiment01V23Artifact['signatureLimeEvaluation'],
    });
    expect(v23ArtifactHasSignatureLimeInPrompt(withLime)).toBe(true);
    expect(v23BoardNeedsReformulation([withLime])).toBe(true);
  });

  it('flags board needing reformulation when lime missing', () => {
    const legacy = stubArtifact();
    expect(v23BoardNeedsReformulation([legacy])).toBe(true);
  });
});
