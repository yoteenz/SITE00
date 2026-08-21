import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetBrandLoreMemoryStore } from './memoryStore.js';
import {
  upsertLoreFromIdentityIntake,
  getLoreForIntake,
  confirmFounderLoreField,
  resolveInheritedLoreForBuilder,
  resetBrandLoreMemoryStore as resetService,
} from './loreService.js';
import { synthesizeBrandLoreProfile, assertSynthesisGrounded } from './loreSynthesis.js';
import { synthesizeBuilderExperienceProfile } from './experienceSynthesis.js';
import { brandLoreReadinessGate, shouldEnforceLoreReadinessGate } from './brandLoreBridge.js';
import { canBeginCreativeDirection } from '../../../shared/site00-brand-lore/readiness.js';

const FULL_LORE_ANSWERS: Record<string, string | string[]> = {
  feeling: ['curious', 'inspired'],
  role: 'guide',
  belief: 'Knowledge should be accessible to everyone.',
  enemy: ['gatekeeping', 'boring'],
  obsession: 'How everyday systems actually work.',
  world: 'A living cultural dossier — quiet, sharp, full of surprises.',
  objects: ['paper', 'screens'],
  lineage: 'Magazines, documentary films, design blogs.',
  now: 'Editorial Instagram accounts, indie bookshops.',
  contradiction: ['polished-messy', 'nostalgic-modern'],
  language: 'Something exciting just dropped.\n---\nThat is not how this works.\n---\nThink of it like a recipe.',
  line: 'We are thrilled to announce our revolutionary synergy.',
  status: 'good-taste',
  ritual: ['discovery', 'perspective'],
  memory: 'They made me smarter without trying.',
  symbol: 'An index finger marking a page.',
  myth: 'The brand that made curiosity feel normal.',
  future: 'The default reference for practical knowledge.',
  'no-go': 'Stock corporate photography\nGeneric hustle culture',
};

describe('SITE 00 brand lore — synthesis + service', () => {
  beforeEach(() => {
    resetBrandLoreMemoryStore();
    resetService();
  });

  it('15. synthesis maps source answers correctly', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: FULL_LORE_ANSWERS,
      sourceIntakeId: 'intake-1',
      orgSlug: null,
    });
    expect(profile.brandBelief.value).toBe(FULL_LORE_ANSWERS.belief);
    expect(profile.emotionalPromise.value).toEqual(FULL_LORE_ANSWERS.feeling);
    expect(profile.worldMetaphor.value).toBe(FULL_LORE_ANSWERS.world);
    expect(profile.authenticLanguageSamples.value).toHaveLength(3);
  });

  it('16. provenance is retained on synthesized fields', () => {
    const profile = synthesizeBrandLoreProfile({ loreAnswers: FULL_LORE_ANSWERS, sourceIntakeId: 'intake-1' });
    expect(profile.brandBelief.sourceAnswerIds).toContain('belief');
    expect(profile.brandBelief.sourceType).toBe('IDENTITY_LORE');
    expect(profile.brandBelief.founderConfirmationState).toBe('PENDING');
  });

  it('17. synthesized fields are not founder-confirmed by default', () => {
    const profile = synthesizeBrandLoreProfile({ loreAnswers: FULL_LORE_ANSWERS, sourceIntakeId: 'intake-1' });
    expect(profile.brandBelief.classification).toBe('RAW_FOUNDER_INPUT');
    expect(profile.brandBelief.founderConfirmationState).toBe('PENDING');
  });

  it('18. synthesis preserves raw founder language verbatim', () => {
    const profile = synthesizeBrandLoreProfile({ loreAnswers: FULL_LORE_ANSWERS, sourceIntakeId: 'intake-1' });
    expect(profile.rawLoreAnswers.belief).toBe(FULL_LORE_ANSWERS.belief);
    expect(profile.rawLoreAnswers.language).toBe(FULL_LORE_ANSWERS.language);
  });

  it('19. creative anti-patterns persist', () => {
    const profile = synthesizeBrandLoreProfile({ loreAnswers: FULL_LORE_ANSWERS, sourceIntakeId: 'intake-1' });
    expect(profile.creativeAntiPatterns.value).toEqual(['Stock corporate photography', 'Generic hustle culture']);
  });

  it('20. context classification from real inputs', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: FULL_LORE_ANSWERS,
      sourceIntakeId: 'intake-1',
      operationalAnswers: { projectTypes: ['site'], goals: ['launch'] },
    });
    expect(profile.contextClassification).not.toBeNull();
  });

  it('21. upsert persists lore on Identity autosave', async () => {
    const profile = await upsertLoreFromIdentityIntake({
      intakeId: 'intake-auto',
      draftPayload: { loreAnswers: FULL_LORE_ANSWERS, identityState: 'starting-at-zero', answers: {} },
    });
    expect(profile).not.toBeNull();
    const loaded = await getLoreForIntake('IDENTITY', 'intake-auto');
    expect(loaded?.id).toBe(profile!.id);
  });

  it('22. founder confirmation promotes field classification', async () => {
    const profile = await upsertLoreFromIdentityIntake({
      intakeId: 'intake-confirm',
      draftPayload: { loreAnswers: FULL_LORE_ANSWERS },
    });
    const confirmed = await confirmFounderLoreField(profile!.id, 'brandBelief');
    expect(confirmed?.brandBelief.founderConfirmationState).toBe('CONFIRMED');
    expect(confirmed?.brandBelief.classification).toBe('FOUNDER_CONFIRMED');
  });

  it('23. Builder inherits Identity lore server-side', async () => {
    await upsertLoreFromIdentityIntake({
      intakeId: 'intake-idnty',
      draftPayload: { loreAnswers: FULL_LORE_ANSWERS },
    });
    const inherited = await resolveInheritedLoreForBuilder({ identityIntakeId: 'intake-idnty' });
    expect(inherited?.worldMetaphor?.value).toBe(FULL_LORE_ANSWERS.world);
    expect(inherited?.audienceRelationship?.value).toBe('guide');
  });

  it('24. Builder experience profile persists digital metaphor', () => {
    const exp = synthesizeBuilderExperienceProfile(
      {
        arrival: 'discover',
        'digital-metaphor': 'publication',
        movement: 'feed',
        return: 'Fresh discoveries each visit.',
        advantage: 'Impossible depth at scroll speed.',
      },
      { worldMetaphor: { value: 'cultural dossier' } as never },
    );
    expect(exp.digitalMetaphor.value).toBe('publication');
    expect(exp.repeatVisitBehavior.value).toBe('Fresh discoveries each visit.');
    expect(exp.signatureDigitalAdvantage.value).toBe('Impossible depth at scroll speed.');
    expect(exp.inheritedLoreSnapshot).not.toBeNull();
  });

  it('25. readiness gate blocks incomplete context when profile exists', async () => {
    const sparse = synthesizeBrandLoreProfile({
      loreAnswers: { feeling: ['curious'] },
      sourceIntakeId: 'sparse',
    });
    const gate = brandLoreReadinessGate(sparse);
    expect(gate.blocked).toBe(true);
    expect(gate.message).toBe('CONTEXT CALIBRATION REQUIRED');
    expect(canBeginCreativeDirection(gate.state)).toBe(false);
  });

  it('26. NDXBOOK does not enforce lore readiness gate', () => {
    expect(shouldEnforceLoreReadinessGate('ndxbook', null)).toBe(false);
    expect(shouldEnforceLoreReadinessGate('site-00', synthesizeBrandLoreProfile({ loreAnswers: FULL_LORE_ANSWERS }))).toBe(true);
  });

  it('27. synthesis grounding check passes for mapped answers', () => {
    const profile = synthesizeBrandLoreProfile({ loreAnswers: FULL_LORE_ANSWERS, sourceIntakeId: 'intake-1' });
    expect(() => assertSynthesisGrounded(profile)).not.toThrow();
  });

  it('28. skipped lore answers do not block synthesis', () => {
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: { ...FULL_LORE_ANSWERS, symbol: 'skip', memory: 'not-sure' },
      sourceIntakeId: 'intake-1',
    });
    expect(profile.signatureDeviceSeeds.value).toBeNull();
    expect(profile.memoryGoal.value).toBeNull();
  });

  it('29. Creative Direction cannot bypass incomplete lore context when enforced', async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    const { ensureCreativeDirectionEngagement, resetCreativeDirectionMemory } = await import(
      '../site00Evolve/creativeDirection/engagementService.js',
    );
    resetCreativeDirectionMemory();
    const sparse = synthesizeBrandLoreProfile({
      loreAnswers: { feeling: ['curious'] },
      sourceIntakeId: 'sparse-cd',
    });
    const engagement = await ensureCreativeDirectionEngagement('site-00', sparse);
    expect(engagement.brandLoreReadiness?.blocked).toBe(true);
    expect(engagement.brandLoreReadiness?.message).toBe('CONTEXT CALIBRATION REQUIRED');
  });

  it('30. NDXBOOK Creative Direction remains unblocked without lore profile', async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    const { resetEvolveStore } = await import('../site00Evolve/memoryStore.js');
    const { resetNdxbookImportMemory, runNdxbookLegacyImport } = await import(
      '../site00Evolve/providers/ndxbookLegacyImportService.js',
    );
    const { resetCreativeDirectionMemory, ensureCreativeDirectionEngagement } = await import(
      '../site00Evolve/creativeDirection/engagementService.js',
    );
    resetEvolveStore();
    resetNdxbookImportMemory();
    resetCreativeDirectionMemory();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const engagement = await ensureCreativeDirectionEngagement('ndxbook');
    expect(engagement.brandLoreReadiness).toBeNull();
    expect(engagement.territories).toHaveLength(3);
  });
});
