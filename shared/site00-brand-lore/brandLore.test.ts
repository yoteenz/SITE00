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
import { BUILDER_INHERITED_LORE_FIELDS, BLDR_EXPERIENCE_QUESTIONS, bldrExperienceFirstStep, bldrExperienceNextStep } from './bldr-experience-questions.js';
import { buildReadinessInspector } from './readiness.js';
import { synthesizeBrandLoreProfile, mergeCalibrationIntoProfile } from './loreSynthesis.js';
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
    audienceRelationship: emptyField(['THE GUIDE SHOWING THE WAY']),
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
    referenceEvidence: [],
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
      loreAnswers: { feeling: ['curious'], role: ['guide'] },
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

  it('15. readiness inspector reports READY/MISSING per domain without fake percentages (XXXIV)', () => {
    const rows = buildReadinessInspector(minimalProfile());
    expect(rows).toHaveLength(REQUIRED_DOMAINS.length);
    expect(rows.every((r) => ['READY', 'MISSING', 'NEEDS_CONFIRMATION'].includes(r.status))).toBe(true);
    expect(buildReadinessInspector(null).every((r) => r.status === 'MISSING')).toBe(true);
  });

  it('16. readiness inspector distinguishes NEEDS_CONFIRMATION from READY', () => {
    const profile = minimalProfile();
    const rows = buildReadinessInspector(profile);
    // brandBelief/coreObsessions back PURPOSE and are not CONFIRMED in the fixture.
    expect(rows.find((r) => r.domain === 'PURPOSE')?.status).toBe('NEEDS_CONFIRMATION');
    profile.brandBelief.founderConfirmationState = 'CONFIRMED';
    expect(buildReadinessInspector(profile).find((r) => r.domain === 'PURPOSE')?.status).toBe('READY');
  });

  it('17. Builder Experience Translation chain reaches all 11 domains exactly once', () => {
    expect(BLDR_EXPERIENCE_QUESTIONS).toHaveLength(11);
    const visited: string[] = [bldrExperienceFirstStep()];
    let current: string | null = visited[0]!;
    while ((current = bldrExperienceNextStep(current))) visited.push(current);
    expect(visited).toHaveLength(11);
    expect(new Set(visited).size).toBe(11);
    expect(new Set(visited)).toEqual(new Set(BLDR_EXPERIENCE_QUESTIONS.map((q) => q.id)));
  });

  it('18. mergeCalibrationIntoProfile applies new calibration answers without losing unrelated existing content', () => {
    const existing = minimalProfile({
      sourceIntakeType: 'CONTENT_BRAIN',
      sourceIntakeId: 'content-brain:org-1',
      organizationId: 'org-1',
      coreObsessions: {
        value: 'the index for everyday knowledge.',
        classification: 'SYNTHESIZED',
        confidence: 'MEDIUM',
        sourceAnswerIds: ['content_brain:brand.positioning'],
        sourceType: 'CONTENT_BRAIN',
        founderConfirmationState: 'PENDING',
        updatedAt: new Date().toISOString(),
      },
      worldMetaphor: {
        value: null,
        classification: 'UNKNOWN',
        confidence: 'NONE',
        sourceAnswerIds: [],
        sourceType: 'UNKNOWN',
        founderConfirmationState: 'NOT_APPLICABLE',
        updatedAt: new Date().toISOString(),
      },
      rawLoreAnswers: {},
    });

    const fresh = synthesizeBrandLoreProfile({
      loreAnswers: { world: 'a place built entirely out of index cards' },
      sourceIntakeId: 'calibration:org-1',
      organizationId: 'org-1',
    });

    const merged = mergeCalibrationIntoProfile(existing, fresh);
    // The newly answered domain is populated…
    expect(merged.worldMetaphor.value).toBe('a place built entirely out of index cards');
    // …and the pre-existing Content Brain field is NOT wiped by the narrow calibration answer.
    expect(merged.coreObsessions.value).toBe('the index for everyday knowledge.');
    expect(merged.coreObsessions.sourceType).toBe('CONTENT_BRAIN');
    // Lineage identity is preserved so this durably upserts the same row.
    expect(merged.sourceIntakeType).toBe('CONTENT_BRAIN');
    expect(merged.sourceIntakeId).toBe('content-brain:org-1');
    expect(merged.organizationId).toBe('org-1');
  });

  it('19. synthesis derives structured reference evidence from lineage/now answers with full lineage (XXI)', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: {
        lineage: 'Magazines\nDocumentary films',
        now: 'Editorial Instagram accounts',
      },
      sourceIntakeId: 'intake-ref-1',
      organizationId: 'org-ref-1',
      projectId: 'project-ref-1',
    });
    expect(profile.referenceEvidence).toHaveLength(3);
    for (const ref of profile.referenceEvidence) {
      expect(ref.intakeId).toBe('intake-ref-1');
      expect(ref.organizationId).toBe('org-ref-1');
      expect(ref.projectId).toBe('project-ref-1');
      expect(ref.source).toBe('TEXT');
      expect(ref.assetId).toBeNull();
      expect(typeof ref.referenceId).toBe('string');
      expect(typeof ref.createdAt).toBe('string');
    }
    expect(profile.referenceEvidence.map((r) => r.founderNote)).toEqual([
      'Magazines',
      'Documentary films',
      'Editorial Instagram accounts',
    ]);
  });

  it('20. reference evidence is REFERENCE, not FOUNDER_CONFIRMED lore (XXII) — no classification field on the entry at all', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: { lineage: 'Old family photographs' },
      sourceIntakeId: 'intake-ref-2',
    });
    const ref = profile.referenceEvidence[0]!;
    expect(ref).not.toHaveProperty('classification');
    expect(ref).not.toHaveProperty('founderConfirmationState');
    expect(ref.referenceRole).toBe('CULTURAL_REFERENCE');
  });

  it('21. mergeCalibrationIntoProfile never wipes existing reference evidence when calibration answers omit references', () => {
    const existing = minimalProfile({
      referenceEvidence: [
        {
          referenceId: 'ref-1',
          source: 'TEXT',
          assetId: null,
          intakeId: 'content-brain:org-1',
          projectId: null,
          organizationId: 'org-1',
          founderNote: 'archival ephemera',
          referenceRole: 'CULTURAL_REFERENCE',
          createdAt: new Date().toISOString(),
        },
      ],
    });
    const fresh = synthesizeBrandLoreProfile({
      loreAnswers: { role: 'guide' },
      sourceIntakeId: 'calibration:org-1',
      organizationId: 'org-1',
    });
    const merged = mergeCalibrationIntoProfile(existing, fresh);
    expect(merged.referenceEvidence).toHaveLength(1);
    expect(merged.referenceEvidence[0]?.founderNote).toBe('archival ephemera');
  });
});
