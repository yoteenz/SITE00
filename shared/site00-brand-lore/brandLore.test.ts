import { describe, expect, it } from 'vitest';
import { resolveActiveLoreSteps, loreFlowComplete, isSkippedAnswer, LORE_SKIP_VALUE } from './adaptivity.js';
import { classifyBrandExpressionContext } from './contextClassification.js';
import {
  evaluateCreativeDirectionReadiness,
  canBeginCreativeDirection,
  missingDomainsToLoreSteps,
  REQUIRED_DOMAINS,
} from './readiness.js';
import { IDNTY_LORE_QUESTIONS } from './idnty-lore-questions.js';
import { BUILDER_INHERITED_LORE_FIELDS } from './bldr-experience-questions.js';
import type { BrandLoreProfile } from './types.js';

function minimalProfile(overrides: Partial<BrandLoreProfile> = {}): BrandLoreProfile {
  const emptyField = (value: unknown = null) => ({
    value,
    classification: 'RAW_FOUNDER_INPUT' as const,
    confidence: 'HIGH' as const,
    sourceAnswerIds: [],
    sourceType: 'IDENTITY_LORE' as const,
    founderConfirmationState: 'PENDING' as const,
    updatedAt: new Date().toISOString(),
  });

  return {
    id: 'test-profile',
    organizationId: null,
    projectId: null,
    sourceIntakeId: 'intake-1',
    sourceIntakeType: 'IDENTITY',
    brandWorld: emptyField('a quiet library'),
    audienceRelationship: emptyField('guide'),
    brandBelief: emptyField('knowledge should be accessible'),
    culturalOpposition: emptyField(['boring']),
    coreObsessions: emptyField('how things work'),
    emotionalPromise: emptyField(['curious']),
    creativeTensions: emptyField(['polished-messy']),
    worldMetaphor: emptyField('a quiet library'),
    materialVocabulary: emptyField(['paper']),
    symbolicVocabulary: emptyField([]),
    referenceLineage: emptyField('magazines'),
    currentReferenceSignals: emptyField('design blogs'),
    authenticLanguageSamples: emptyField([]),
    antiLanguage: emptyField([]),
    socialSignal: emptyField('good-taste'),
    audienceRitual: emptyField(['discovery']),
    memoryGoal: emptyField(null),
    desiredMythology: emptyField(null),
    futureWorld: emptyField(null),
    creativeAntiPatterns: emptyField(['corporate stock photos']),
    signatureDeviceSeeds: emptyField(null),
    rawLoreAnswers: {},
    contextClassification: 'SOCIAL_FIRST_EDITORIAL',
    readinessState: 'CORE_DIRECTION_READY',
    readinessMissingDomains: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('SITE 00 brand lore — shared module', () => {
  it('1. all 19 lore question domains are registered', () => {
    expect(IDNTY_LORE_QUESTIONS).toHaveLength(19);
    const domains = new Set(IDNTY_LORE_QUESTIONS.map((q) => q.domain));
    expect(domains.size).toBeGreaterThanOrEqual(17);
  });

  it('2. skipped answers remain valid', () => {
    expect(isSkippedAnswer(LORE_SKIP_VALUE)).toBe(true);
    expect(isSkippedAnswer('not-sure')).toBe(true);
    expect(isSkippedAnswer('real answer')).toBe(false);
  });

  it('3. adaptive logic skips answered lore steps', () => {
    const active = resolveActiveLoreSteps({
      loreAnswers: { feeling: ['curious'], role: 'guide' },
    });
    expect(active.find((s) => s.id === 'feeling')).toBeUndefined();
    expect(active.find((s) => s.id === 'role')).toBeUndefined();
    expect(active.find((s) => s.id === 'belief')).toBeDefined();
  });

  it('4. adaptive logic skips founder-confirmed profile fields', () => {
    const profile = minimalProfile();
    profile.brandBelief.founderConfirmationState = 'CONFIRMED';
    const active = resolveActiveLoreSteps({ existingProfile: profile });
    expect(active.find((s) => s.id === 'belief')).toBeUndefined();
  });

  it('5. calibration mode shows only missing steps', () => {
    const active = resolveActiveLoreSteps({ calibrationStepIds: ['world', 'feeling'] });
    expect(active).toHaveLength(2);
    expect(active.map((s) => s.id).sort()).toEqual(['feeling', 'world']);
  });

  it('6. lore flow complete when no active steps', () => {
    expect(loreFlowComplete({ loreAnswers: Object.fromEntries(IDNTY_LORE_QUESTIONS.map((q) => [q.id, 'answered'])) })).toBe(true);
  });

  it('7. NDXBOOK classifies as SOCIAL_FIRST_EDITORIAL', () => {
    expect(classifyBrandExpressionContext({ orgSlug: 'ndxbook' })).toBe('SOCIAL_FIRST_EDITORIAL');
  });

  it('8. classification does not default every brand to website-first', () => {
    expect(classifyBrandExpressionContext({ projectTypes: ['ecommerce'], primaryEntryBehavior: 'shop' })).toBe('ECOMMERCE_FIRST');
    expect(classifyBrandExpressionContext({ audienceRitual: ['discovery', 'taste'] })).toBe('SOCIAL_FIRST_EDITORIAL');
    expect(classifyBrandExpressionContext({ projectTypes: ['unknown-thing'] })).toBe('OTHER');
  });

  it('9. missing required domains → CONTEXT_INCOMPLETE', () => {
    const result = evaluateCreativeDirectionReadiness(null);
    expect(result.state).toBe('CONTEXT_INCOMPLETE');
    expect(result.missingDomains).toEqual(REQUIRED_DOMAINS);
  });

  it('10. partial coverage → CONTEXT_PARTIAL', () => {
    const partial = minimalProfile({
      brandBelief: { ...minimalProfile().brandBelief, value: null },
      worldMetaphor: { ...minimalProfile().worldMetaphor, value: null },
      emotionalPromise: { ...minimalProfile().emotionalPromise, value: [] },
      contextClassification: null,
    });
    const result = evaluateCreativeDirectionReadiness(partial);
    expect(['CONTEXT_INCOMPLETE', 'CONTEXT_PARTIAL']).toContain(result.state);
  });

  it('11. sufficient coverage → CORE_DIRECTION_READY', () => {
    const result = evaluateCreativeDirectionReadiness(minimalProfile());
    expect(result.state).toBe('CORE_DIRECTION_READY');
    expect(canBeginCreativeDirection(result.state)).toBe(true);
  });

  it('12. readiness does not fabricate a percentage', () => {
    const result = evaluateCreativeDirectionReadiness(minimalProfile());
    expect(result).not.toHaveProperty('percent');
    expect(result).not.toHaveProperty('score');
  });

  it('13. missing domains map to calibration lore steps', () => {
    const steps = missingDomainsToLoreSteps(['WORLDVIEW', 'EMOTIONAL_PROMISE']);
    expect(steps).toContain('world');
    expect(steps).toContain('feeling');
  });

  it('14. Builder inherited lore fields list excludes Identity-only domains', () => {
    expect(BUILDER_INHERITED_LORE_FIELDS).toContain('worldMetaphor');
    expect(BUILDER_INHERITED_LORE_FIELDS).toContain('creativeAntiPatterns');
    expect(BUILDER_INHERITED_LORE_FIELDS).not.toContain('primaryEntryBehavior');
  });
});
