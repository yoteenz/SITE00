import { describe, expect, it } from 'vitest';
import { auditComparisonScorer } from '../../api/_lib/site00Evolve/creativeDirection/personalityReplay/comparisonScorerAudit.js';
import { synthesizeBrandPersonalityProfile } from './personalitySynthesis.js';
import type { BrandPersonalityReplayRecord } from './personalityReplayTypes.js';

const FULL_PERSONALITY: Record<string, string | string[]> = {
  'social-instinct': ['notices-missed'],
  confidence: ['receipts'],
  humor: ['dry-observation'],
  humanity: ['candid'],
  disagreement: ['shows-evidence'],
  edge: 'sharp',
  charm: ['wit'],
  observation: 'The footnote nobody reads.',
  memorability: 'The correction line.',
  'emotional-range': ['skeptical'],
  restraint: ['humor-cheapens'],
  'personality-tension': ['intelligent-playful'],
  'social-reaction': ['bring-receipts'],
  'self-correction': ['update-record'],
  'anti-personality': 'Try-hard slang.',
};

function minimalReplay(): BrandPersonalityReplayRecord {
  return {
    replayId: 'replay-1',
    mode: 'NDX_PERSONALITY_REPLAY_VALIDATION',
    organizationId: 'org-1',
    projectId: null,
    sourceProfileId: null,
    createdBy: null,
    status: 'COMPARISON_READY',
    loreMode: 'FIXED_LORE_REPLAY',
    brandLoreSnapshot: { organizationId: 'org-1' } as BrandPersonalityReplayRecord['brandLoreSnapshot'],
    rawPersonalityAnswers: FULL_PERSONALITY,
    personalityCompletedSteps: [],
    synthesizedPersonality: synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY }),
    personalityReadiness: 'PERSONALITY_READY',
    personalityMissingDomains: [],
    formationRecord: null,
    selectedShadowDirectionId: null,
    directionExpression: null,
    creativeExpression: null,
    identityArtDirection: null,
    heroConcept: null,
    heroBrief: null,
    heroAsset: null,
    comparisonReport: {
      personalityDomains: [],
      scores: {
        personalityConvergence: 0,
        creativeConvergence: 0,
        identityConvergence: 0,
        heroConvergence: 0,
      },
      divergenceStage: null,
      shadowMarkedUpAnalogDirectionId: null,
      benchmarkLoadedAt: null,
    },
    founderValidationJudgment: null,
    hardcodingAudit: null,
    classification: 'SHADOW_VALIDATION',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('auditComparisonScorer', () => {
  it('flags hardcoded creative/identity/hero zeros and explains personality 0 when canonical missing', () => {
    const audit = auditComparisonScorer({
      replay: minimalReplay(),
      canonicalPersonality: null,
    });
    expect(audit.bugFound).toBe(true);
    expect(audit.sonnetComparisonExecuted).toBe(false);
    expect(audit.creativeScoreExplanation).toContain('NOT_EVALUATED');
    expect(audit.personalityScoreExplanation).toContain('null');
  });

  it('recomputes personality score when canonical exists', () => {
    const shadow = synthesizeBrandPersonalityProfile({ personalityAnswers: FULL_PERSONALITY });
    const audit = auditComparisonScorer({
      replay: minimalReplay(),
      canonicalPersonality: shadow,
    });
    expect(audit.recomputedPersonalityScore).toBeGreaterThan(0);
  });
});
