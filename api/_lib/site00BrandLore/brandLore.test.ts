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
  role: ['friend', 'tastemaker', 'entertainer'],
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
    expect(profile.emotionalPromise.value).toEqual(['CURIOUS', 'INSPIRED']);
    expect(profile.audienceRelationship.value).toEqual([
      'THE FRIEND WHO KNOWS EVERYTHING',
      'THE TASTEMAKER',
      'THE ENTERTAINER WITH A POINT OF VIEW',
    ]);
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
    expect(inherited?.audienceRelationship?.value).toEqual([
      'THE FRIEND WHO KNOWS EVERYTHING',
      'THE TASTEMAKER',
      'THE ENTERTAINER WITH A POINT OF VIEW',
    ]);
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

  it('26. NDXBOOK readiness bypass is removed — gate enforcement is identical for every org', () => {
    const profile = synthesizeBrandLoreProfile({ loreAnswers: FULL_LORE_ANSWERS });
    expect(shouldEnforceLoreReadinessGate('ndxbook', profile)).toBe(true);
    expect(shouldEnforceLoreReadinessGate('site-00', profile)).toBe(true);
    expect(shouldEnforceLoreReadinessGate('ndxbook', null)).toBe(false);
    expect(shouldEnforceLoreReadinessGate('site-00', null)).toBe(false);
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

  it('30. NDXBOOK Creative Direction is gated the same as every other org (bypass removed)', async () => {
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
    // Reconciled from Content Brain (XXVI) — real gate, real state, never forced to READY.
    expect(engagement.brandLoreReadiness).not.toBeNull();
    expect(engagement.brandLoreReadiness?.state).toBe('CONTEXT_INCOMPLETE');
    expect(engagement.brandLoreReadiness?.blocked).toBe(true);
    // Territory preview generation itself is unaffected — only FAL dispatch is blocked (see
    // queueFalGenerationJobs / test 31).
    expect(engagement.territories).toHaveLength(3);
  });

  it('31. NDXBOOK FAL generation is blocked while lore context is incomplete', async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    vi.stubEnv('FAL_KEY', 'test-fal-key');
    const { resetEvolveStore } = await import('../site00Evolve/memoryStore.js');
    const { resetNdxbookImportMemory, runNdxbookLegacyImport } = await import(
      '../site00Evolve/providers/ndxbookLegacyImportService.js',
    );
    const { resetCreativeDirectionMemory, queueFalGenerationJobs } = await import(
      '../site00Evolve/creativeDirection/engagementService.js',
    );
    resetEvolveStore();
    resetNdxbookImportMemory();
    resetCreativeDirectionMemory();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const result = await queueFalGenerationJobs('ndxbook');
    expect(result.skipped).toBe(true);
    expect(result.queued).toBe(0);
    expect(result.blockedReason).toBe('CONTEXT CALIBRATION REQUIRED');
  });

  it('32. NDXBOOK reconciliation maps only genuinely known Content Brain facts, not prior Creative Direction output', async () => {
    const { buildNdxbookReconciledProfile } = await import('./ndxbookReconciliation.js');
    const profile = buildNdxbookReconciledProfile('org-ndxbook-test');
    expect(profile.sourceIntakeType).toBe('CONTENT_BRAIN');
    expect(profile.coreObsessions.classification).toBe('SYNTHESIZED');
    expect(profile.coreObsessions.founderConfirmationState).toBe('PENDING');
    // Domains with no genuine founder/business-fact source stay MISSING — never fabricated.
    expect(profile.worldMetaphor.value).toBeNull();
    expect(profile.emotionalPromise.value).toEqual([]);
    expect(profile.culturalOpposition.value).toEqual([]);
    expect(profile.readinessMissingDomains).toContain('WORLDVIEW');
    expect(profile.readinessMissingDomains).toContain('EMOTIONAL_PROMISE');
    expect(profile.readinessState).not.toBe('CORE_DIRECTION_READY');
  });

  it('34. submitOrgLoreCalibration merges missing-domain answers into the reconciled NDXBOOK profile', async () => {
    const { submitOrgLoreCalibration } = await import('./loreService.js');
    const updated = await submitOrgLoreCalibration({
      orgId: 'org-ndxbook-calibration',
      orgSlug: 'ndxbook',
      answers: { world: 'the index for everything you almost knew', role: 'guide' },
    });
    expect(updated.worldMetaphor.value).toBe('the index for everything you almost knew');
    expect(updated.audienceRelationship.value).toEqual(['THE GUIDE SHOWING THE WAY']);
    // Reconciled Content Brain fields survive an unrelated-domain calibration submission.
    expect(updated.coreObsessions.sourceType).toBe('CONTENT_BRAIN');
    expect(updated.sourceIntakeType).toBe('CONTENT_BRAIN');
  });

  it('35. submitOrgLoreCalibration for an org with no existing profile creates a real founder-input profile', async () => {
    const { submitOrgLoreCalibration } = await import('./loreService.js');
    const created = await submitOrgLoreCalibration({
      orgId: 'org-fresh-calibration',
      orgSlug: 'some-future-brand',
      answers: { belief: 'good design is invisible.' },
    });
    expect(created.brandBelief.value).toBe('good design is invisible.');
    expect(created.sourceIntakeType).toBe('IDENTITY');
    expect(created.organizationId).toBe('org-fresh-calibration');
  });

  it('36. calibration submissions never leak across organizations', async () => {
    const { submitOrgLoreCalibration, getBrandLoreProfileForOrg } = await import('./loreService.js');
    await submitOrgLoreCalibration({
      orgId: 'org-isolation-a',
      orgSlug: 'brand-a',
      answers: { belief: 'brand A belief' },
    });
    await submitOrgLoreCalibration({
      orgId: 'org-isolation-b',
      orgSlug: 'brand-b',
      answers: { belief: 'brand B belief' },
    });
    const a = await getBrandLoreProfileForOrg('org-isolation-a');
    const b = await getBrandLoreProfileForOrg('org-isolation-b');
    expect(a?.brandBelief.value).toBe('brand A belief');
    expect(b?.brandBelief.value).toBe('brand B belief');
    expect(a?.organizationId).not.toBe(b?.organizationId);
  });

  it('37. reference evidence survives full round-trip persistence with project/org lineage intact (downstream retrieval — XXIII)', async () => {
    const profile = await upsertLoreFromIdentityIntake({
      intakeId: 'intake-ref-roundtrip',
      draftPayload: {
        loreAnswers: { ...FULL_LORE_ANSWERS, lineage: 'Vintage travel posters', now: 'Independent bookshops' },
      },
    });
    expect(profile?.referenceEvidence.length).toBeGreaterThanOrEqual(2);
    const reloaded = await getLoreForIntake('IDENTITY', 'intake-ref-roundtrip');
    expect(reloaded?.referenceEvidence).toEqual(profile?.referenceEvidence);
    expect(reloaded?.referenceEvidence.every((r) => r.intakeId === 'intake-ref-roundtrip')).toBe(true);
    // Confirming an unrelated field must never promote a reference to canon (XXII).
    const confirmed = await confirmFounderLoreField(profile!.id, 'brandBelief');
    expect(confirmed?.referenceEvidence).toEqual(profile?.referenceEvidence);
  });

  it('33. reconciliation never overrides a real IDENTITY-sourced profile for the same org', async () => {
    const { getOrReconcileBrandLoreForOrg } = await import('./loreService.js');
    const { saveBrandLoreProfile } = await import('./storeAdapter.js');
    const real = synthesizeBrandLoreProfile({
      loreAnswers: FULL_LORE_ANSWERS,
      sourceIntakeId: 'real-ndxbook-intake',
      organizationId: 'org-ndxbook-real',
    });
    await saveBrandLoreProfile(real);
    const resolved = await getOrReconcileBrandLoreForOrg('org-ndxbook-real', 'ndxbook');
    expect(resolved?.sourceIntakeType).toBe('IDENTITY');
    expect(resolved?.sourceIntakeId).toBe('real-ndxbook-intake');
  });

  it('38. Creative Direction payload refreshes stale engagement readiness after lore calibration', async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    const { orgIdFromSlug } = await import('../site00Evolve/orgRegistry.js');
    const { resetBrandLoreMemoryStore } = await import('./memoryStore.js');
    const { submitOrgLoreCalibration } = await import('./loreService.js');
    const { resetCreativeDirectionMemory, getCreativeDirectionPayload } = await import(
      '../site00Evolve/creativeDirection/engagementService.js',
    );
    resetBrandLoreMemoryStore();
    resetCreativeDirectionMemory();
    const orgId = orgIdFromSlug('ndxbook')!;
    let payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.brandLoreReadiness?.blocked).toBe(true);

    await submitOrgLoreCalibration({
      orgId,
      orgSlug: 'ndxbook',
      answers: {
        role: ['guide'],
        world: 'a living index of everything worth knowing',
        feeling: ['curious'],
        enemy: ['gatekeeping'],
        lineage: 'archival ephemera',
        now: 'editorial accounts',
        objects: ['paper'],
        contradiction: ['polished', 'messy'],
      },
    });

    payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.brandLoreReadiness?.state).toBe('CORE_DIRECTION_READY');
    expect(payload.engagement.brandLoreReadiness?.blocked).toBe(false);
  });

  it('39. readiness self-heals when a synthesized field drifts out of sync with its own raw answer (truthful readiness — Section III)', async () => {
    // Reproduces the exact live-NDXBOOK forensic finding: rawLoreAnswers.role holds a valid,
    // complete answer but the computed audienceRelationship field was persisted as null by an
    // earlier synthesis pass (e.g. a since-fixed bug, or a race). getOrReconcileBrandLoreForOrg
    // must recompute and durably correct this — readiness must never stay falsely blocked once
    // the underlying answers actually satisfy a domain.
    const { getOrReconcileBrandLoreForOrg } = await import('./loreService.js');
    const { saveBrandLoreProfile } = await import('./storeAdapter.js');
    const good = synthesizeBrandLoreProfile({
      loreAnswers: FULL_LORE_ANSWERS,
      sourceIntakeId: 'drift-intake',
      organizationId: 'org-drift',
      orgSlug: null,
    });
    expect(good.audienceRelationship.value).not.toBeNull();

    // Simulate the historical corruption: rawLoreAnswers keeps the real answer, but the computed
    // field was somehow persisted empty.
    const corrupted = {
      ...good,
      audienceRelationship: { ...good.audienceRelationship, value: null, confidence: 'NONE' as const },
      readinessState: 'CONTEXT_PARTIAL' as const,
      readinessMissingDomains: ['AUDIENCE_RELATIONSHIP'],
    };
    await saveBrandLoreProfile(corrupted);

    const resolved = await getOrReconcileBrandLoreForOrg('org-drift', 'some-other-org');
    expect(resolved?.audienceRelationship.value).toEqual(good.audienceRelationship.value);
    expect(resolved?.readinessState).toBe('CORE_DIRECTION_READY');
    expect(resolved?.readinessMissingDomains).toEqual([]);

    // Second read is a no-op — no further version churn from re-running the same resync.
    const second = await getOrReconcileBrandLoreForOrg('org-drift', 'some-other-org');
    expect(second?.profileVersion).toBe(resolved?.profileVersion);
  });

  it('40. self-heal resync never regresses an already-derived context classification', async () => {
    const { getOrReconcileBrandLoreForOrg } = await import('./loreService.js');
    const { saveBrandLoreProfile } = await import('./storeAdapter.js');
    const profile = synthesizeBrandLoreProfile({
      loreAnswers: { ...FULL_LORE_ANSWERS, ritual: [] },
      sourceIntakeId: 'context-intake',
      organizationId: 'org-context',
      orgSlug: null,
      operationalAnswers: { projectTypes: ['ecommerce'] },
    });
    expect(profile.contextClassification).toBe('ECOMMERCE_FIRST');
    // Corrupt an unrelated field so a resync write is actually triggered.
    await saveBrandLoreProfile({
      ...profile,
      brandBelief: { ...profile.brandBelief, value: null, confidence: 'NONE' as const },
    });

    const resolved = await getOrReconcileBrandLoreForOrg('org-context', 'some-other-org');
    expect(resolved?.contextClassification).toBe('ECOMMERCE_FIRST');
    expect(resolved?.brandBelief.value).toBe(profile.brandBelief.value);
  });
});
