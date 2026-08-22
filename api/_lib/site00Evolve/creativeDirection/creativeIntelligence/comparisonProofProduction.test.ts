import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  buildComparisonProofJobKey,
  compileComparisonProofPrompt,
} from './comparisonProofPromptCompiler.js';
import type { CoreDirectionFormationInput, FormedCoreDirection, VisualProofPlan } from './types.js';

function direction(name: string): FormedCoreDirection {
  return {
    directionId: 'dir-1',
    directionName: name,
    bigIdea: 'Big idea',
    oneLineThesis: 'THESIS LINE',
    brandConnection: 'Brand connection',
    loreLineage: ['worldMetaphor: editorial'],
    conceptualAncestor: 'Ancestor',
    culturalReference: '',
    emotionalPromise: '',
    audienceRole: '',
    brandRole: '',
    visualMetaphor: 'Visual metaphor',
    governingBehavior: 'Governing behavior',
    materialImageryLanguage: 'Paper and ink',
    imageryLanguage: 'Editorial photography',
    typographicAttitude: 'Bold sans headlines',
    coreColorLogic: 'Ink black',
    colorLogic: 'Ink black with red accent',
    signatureDevices: [],
    primaryBrandArtifact: 'The artifact',
    motionSeed: 'Motion seed',
    socialExpressionHypothesis: 'Social card hypothesis',
    proprietaryQuality: '',
    antiDirection: ['generic stock'],
    risks: ['Drift'],
  };
}

const input: CoreDirectionFormationInput = {
  organizationId: 'org',
  projectId: null,
  brandLoreProfileId: 'profile',
  brandLoreProfileVersion: 24,
  brandLoreFingerprint: '5e71f429',
  brandExpressionContext: 'SOCIAL_FIRST_EDITORIAL',
  brandPurpose: 'NDX BOOK editorial intelligence',
  audienceRelationship: null,
  brandBelief: null,
  culturalOpposition: null,
  coreObsessions: null,
  emotionalPromise: null,
  creativeTensions: null,
  worldMetaphor: null,
  materialVocabulary: null,
  symbolicVocabulary: null,
  referenceLineage: null,
  currentReferenceSignals: null,
  authenticLanguageSamples: null,
  antiLanguage: null,
  socialSignal: null,
  audienceRitual: null,
  memoryGoal: null,
  desiredMythology: null,
  futureWorld: null,
  creativeAntiPatterns: null,
  contentBrainSummary: null,
  founderConfirmedCanon: [],
  referenceEvidence: [],
  existingCreativeExplorations: [],
  formationVersion: 2,
};

const plan: VisualProofPlan = {
  directionId: 'dir-1',
  directionName: 'THE MARKED-UP COPY',
  heroWorld: { purpose: 'hero', mediumRecommendation: 'FAL_GENERATED' },
  primaryArtifact: { purpose: 'artifact', mediumRecommendation: 'FAL_GENERATED_AND_ISOLATED' },
  socialExpression: { purpose: 'social', mediumRecommendation: 'FAL_GENERATED', format: 'card' },
  typographicGraphicProof: {
    purpose: 'type',
    mediumRecommendation: 'CODE_NATIVE',
    codeVsGeneratedDecision: 'code',
  },
  materialObjectProof: { purpose: 'material', mediumRecommendation: 'FAL_GENERATED' },
  motionSeed: {
    purpose: 'motion',
    mediumRecommendation: 'CODE_NATIVE',
    proofType: 'keyframes',
  },
};

describe('comparisonProofPromptCompiler', () => {
  it('produces deterministic prompt hashes', () => {
    const d = direction('THE MARKED-UP COPY');
    const a = compileComparisonProofPrompt({ direction: d, proofType: 'heroWorld', input, plan });
    const b = compileComparisonProofPrompt({ direction: d, proofType: 'heroWorld', input, plan });
    expect(a.promptHash).toBe(b.promptHash);
    expect(a.prompt).toContain('THE MARKED-UP COPY');
    expect(a.prompt).toContain('NEGATIVE CONSTRAINTS');
  });

  it('includes cousin separation for Marked-Up Copy', () => {
    const compiled = compileComparisonProofPrompt({
      direction: direction('THE MARKED-UP COPY'),
      proofType: 'heroWorld',
      input,
      plan,
    });
    expect(compiled.prompt).toContain('THE ANNOTATED COPY');
    expect(compiled.prompt).toContain('COUSIN SEPARATION');
    expect(compiled.negativePrompt).toContain('passive annotation history');
  });

  it('declares background removal for primary artifact', () => {
    const compiled = compileComparisonProofPrompt({
      direction: direction('THE COUNTDOWN ROOM'),
      proofType: 'primaryArtifact',
      input,
      plan: { ...plan, directionName: 'THE COUNTDOWN ROOM' },
    });
    expect(compiled.backgroundRemovalRequired).toBe(true);
    expect(compiled.edgeTreatment).toBe('PAPER_CLEAN');
  });

  it('routes typographic proof to code-native', () => {
    const compiled = compileComparisonProofPrompt({
      direction: direction('THE INDEX'),
      proofType: 'typographicGraphic',
      input,
      plan,
    });
    expect(compiled.medium).toBe('CODE_NATIVE');
    expect(compiled.backgroundRemovalRequired).toBe(false);
  });

  it('builds stable job keys for idempotency', () => {
    const key = buildComparisonProofJobKey({
      comparisonSetKey: 'ndxbook:6-direction:v24:5e71f429',
      directionId: 'dir-1',
      proofType: 'heroWorld',
      promptHash: 'abc123',
      model: 'fal-ai/nano-banana-pro',
      referenceHash: 'ref1',
    });
    expect(key).toContain('dir-1');
    expect(key).toContain('heroWorld');
    expect(key).toContain('abc123');
  });
});

describe('directionCompletionService cousin guards', () => {
  it('preserves immutable anchors after overlay apply', async () => {
    const { applyDirectionCompletionOverlays, validateImmutableAnchorsPreserved } = await import(
      './directionCompletionService.js'
    );
    const before = direction('THE MARKED-UP COPY');
    const [after] = applyDirectionCompletionOverlays(before.directionId ? [before] : [before], [
      {
        directionId: before.directionId,
        directionName: before.directionName,
        completedAt: new Date().toISOString(),
        promptVersion: 'v2',
        fieldsRequested: ['brandConnection'],
        fieldsCompleted: ['brandConnection'],
        preservedFields: ['bigIdea', 'oneLineThesis', 'governingBehavior'],
        completedFields: { brandConnection: 'Completed connection' },
      },
    ]);
    expect(validateImmutableAnchorsPreserved(before, after!)).toBe(true);
    expect(after!.brandConnection).toBe('Completed connection');
  });
});

describe('comparisonProofInspector', () => {
  it('accepts code-native proofs', async () => {
    const { inspectComparisonProof } = await import('./comparisonProofInspector.js');
    const d = direction('THE MARKED-UP COPY');
    const result = inspectComparisonProof({
      direction: d,
      proofType: 'typographicGraphic',
      prompt: 'type proof',
      generationSucceeded: true,
      medium: 'CODE_NATIVE',
    });
    expect(result.outcome).toBe('ACCEPT');
  });
});

describe('comparisonProofProduction estimate', () => {
  it('separates FAL and code-native proof counts', async () => {
    const { estimateComparisonProofProduction } = await import('./comparisonProofProduction.js');
    const set = {
      kind: 'INSTANCE_SCOPED_FOUNDER_COMPARISON' as const,
      orgSlug: 'ndxbook' as const,
      organizationId: 'org',
      brandLoreFingerprint: '5e71f429',
      brandLoreProfileVersion: 24,
      canonicalFormationId: 'v2',
      canonicalFormationVersion: 2,
      persistent: true as const,
      directionCount: 1,
      directions: [
        {
          ...direction('THE INDEX'),
          comparisonIndex: 6,
          sourceFormationId: 'f',
          sourceFormationVersion: 2,
          sourceDirectionIndex: 3,
          brandLoreProfileVersion: 24,
          brandLoreFingerprint: '5e71f429',
          fieldCompleteness: { complete: true, missingFields: [] as string[] },
          completionLineage: null,
        },
      ],
      visualProofPlans: [
        {
          ...plan,
          directionId: 'dir-1',
          directionName: 'THE INDEX',
          comparisonIndex: 6,
          sourceFormationId: 'f',
          sourceFormationVersion: 2,
        },
      ],
      v1CompletionStatus: { required: false, missingByDirection: {}, overlaysApplied: 0 },
      distinctivenessPairs: [],
    };
    const estimate = estimateComparisonProofProduction(set, { includeAllProofTypes: true });
    expect(estimate.plannedFalCalls).toBeGreaterThan(0);
    expect(estimate.codeNativeProofs).toBeGreaterThan(0);
  });
});
