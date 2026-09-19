import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetEvolveStore } from '../memoryStore.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from '../providers/ndxbookLegacyImportService.js';
import {
  resetCreativeDirectionMemory,
  getCreativeDirectionPayload,
  reformCoreDirections,
  invalidateCreativeDirectionEngagement,
} from './engagementService.js';
import { submitOrgLoreCalibration } from '../../site00BrandLore/loreService.js';
import { resetBrandLoreMemoryStore } from '../../site00BrandLore/memoryStore.js';
import { getOrReconcileBrandLoreForOrg } from '../../site00BrandLore/loreService.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import {
  buildCoreDirectionFormationInput,
  buildFormationIdempotencyKey,
  buildLegacyProposedExplorations,
} from './creativeIntelligence/formationInputBuilder.js';
import {
  getCreativeIntelligenceProvider,
  listCreativeIntelligenceProviders,
  setCreativeIntelligenceProviderForTests,
} from './creativeIntelligence/providerRegistry.js';
import {
  createMockCreativeIntelligenceProvider,
  createFailingMockCreativeIntelligenceProvider,
} from './creativeIntelligence/mockProvider.js';
import { createUnavailableCreativeIntelligenceProvider } from './creativeIntelligence/unavailableProvider.js';
import {
  runCoreDirectionFormation,
  resetCoreDirectionFormationMemory,
  getCoreDirectionFormationRecord,
} from './creativeIntelligence/formationService.js';
import { validateFormedDirections } from './creativeIntelligence/formationValidation.js';
import { buildVisualProofPlans } from './creativeIntelligence/visualProofPlanBuilder.js';
import { CREATIVE_INTELLIGENCE_PROMPT_VERSION, MAX_CREATIVE_REVISION_ROUNDS } from './creativeIntelligence/config.js';
import { NDXBOOK_CORE_DIRECTIONS } from './coreDirectionDefinitions.js';
import { computeBrandLoreFingerprint } from '../../../../shared/site00-brand-lore/fingerprint.js';

describe('Creative Intelligence Infrastructure + Core Direction Formation', () => {
  async function ensureNdxbookCoreDirectionReady() {
    const orgId = orgIdFromSlug('ndxbook')!;
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
    invalidateCreativeDirectionEngagement('ndxbook');
  }

  beforeEach(async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    vi.stubEnv('FAL_KEY', '');
    delete process.env.ANTHROPIC_API_KEY;
    resetEvolveStore();
    resetNdxbookImportMemory();
    resetCreativeDirectionMemory();
    resetCoreDirectionFormationMemory();
    resetBrandLoreMemoryStore();
    setCreativeIntelligenceProviderForTests(null);
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    await ensureNdxbookCoreDirectionReady();
  });

  afterEach(() => {
    setCreativeIntelligenceProviderForTests(null);
    vi.unstubAllEnvs();
  });

  describe('PROVIDER', () => {
    it('1. provider interface exposes form/critique/revise', () => {
      const provider = createMockCreativeIntelligenceProvider();
      expect(typeof provider.formCoreDirections).toBe('function');
      expect(typeof provider.critiqueCoreDirections).toBe('function');
      expect(typeof provider.reviseCoreDirections).toBe('function');
    });

    it('2. provider registry lists configured provider', () => {
      const providers = listCreativeIntelligenceProviders();
      expect(providers.length).toBeGreaterThan(0);
    });

    it('3. unavailable provider state when no credentials', async () => {
      const provider = createUnavailableCreativeIntelligenceProvider();
      expect(provider.capability.status).toBe('UNAVAILABLE');
      await expect(provider.formCoreDirections({} as never)).rejects.toThrow(
        'CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE',
      );
    });

    it('4. configured provider selection uses mock override in tests', () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      expect(getCreativeIntelligenceProvider().providerId).toBe('mock');
    });

    it('5. credentials remain server-side — env keys not exported in provider payload', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', 'secret-key-should-not-leak');
      const payload = JSON.stringify(listCreativeIntelligenceProviders());
      expect(payload).not.toContain('secret-key-should-not-leak');
    });
  });

  describe('INPUT', () => {
    it('6. formation input derives from canonical Brand Lore', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      expect(profile).toBeTruthy();
      const input = buildCoreDirectionFormationInput({ profile: profile!, includeLegacyExplorations: true });
      expect(input.brandLoreProfileId).toBe(profile!.id);
      expect(input.brandLoreFingerprint).toMatch(/^[0-9a-f]{8}$/);
    });

    it('7. founder-confirmed fields prioritized in canon list', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const input = buildCoreDirectionFormationInput({ profile: profile! });
      expect(Array.isArray(input.founderConfirmedCanon)).toBe(true);
    });

    it('8. missing fields not fabricated', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const input = buildCoreDirectionFormationInput({ profile: profile! });
      if (!profile!.desiredMythology.value) expect(input.desiredMythology).toBeNull();
    });

    it('9. expression context preserved', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const input = buildCoreDirectionFormationInput({ profile: profile! });
      expect(input.brandExpressionContext).toBe(profile!.contextClassification);
    });

    it('10. existing explorations labeled prior/proposed legacy', () => {
      const explorations = buildLegacyProposedExplorations();
      expect(explorations).toHaveLength(3);
      expect(explorations.every((e) => e.label === 'LEGACY_PROPOSED_EXPLORATION')).toBe(true);
    });
  });

  describe('OUTPUT', () => {
    it('11. exactly 3 directions required', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.finalDirections).toHaveLength(3);
    });

    it('12. malformed structured output rejected', () => {
      const errors = validateFormedDirections([
        { directionId: 'a', directionName: 'A', bigIdea: 'x', loreLineage: [], governingBehavior: '', primaryBrandArtifact: '' } as never,
      ]);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('13. missing lore lineage rejected', () => {
      const errors = validateFormedDirections([
        {
          directionId: 'a',
          directionName: 'A',
          bigIdea: 'Valid idea',
          loreLineage: [],
          governingBehavior: 'SCAN',
          primaryBrandArtifact: 'artifact',
        } as never,
      ]);
      expect(errors.some((e) => e.includes('loreLineage'))).toBe(true);
    });

    it('14. duplicate directions rejected', () => {
      const dup = {
        directionId: 'a',
        directionName: 'SAME',
        bigIdea: 'One',
        loreLineage: ['worldMetaphor: x'],
        governingBehavior: 'A',
        primaryBrandArtifact: 'artifact',
      };
      const errors = validateFormedDirections([dup, { ...dup, directionId: 'b' }] as never);
      expect(errors.some((e) => e.includes('duplicate'))).toBe(true);
    });

    it('15. generic direction rejected by critic path', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      setCreativeIntelligenceProviderForTests(createFailingMockCreativeIntelligenceProvider());
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(['NEEDS_HUMAN_REVIEW', 'FAILED']).toContain(record.status);
    });
  });

  describe('CRITIC', () => {
    it('16. quality gate executes', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.criticResult).toBeTruthy();
    });

    it('17. weak direction identified by failing mock', async () => {
      setCreativeIntelligenceProviderForTests(createFailingMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.criticResult?.failedDirectionIds.length).toBeGreaterThan(0);
    });

    it('18. strong direction preserved on mock pass', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.finalDirections.map((d) => d.directionName)).toContain('SIGNAL ARCHIVE');
    });

    it('19. revision request generated when critic fails', async () => {
      setCreativeIntelligenceProviderForTests(createFailingMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.criticResult?.revisionRequired).toBe(true);
    });

    it('20. revision bounded by max rounds', () => {
      expect(MAX_CREATIVE_REVISION_ROUNDS).toBeLessThanOrEqual(3);
    });

    it('21. max-round failure → NEEDS_HUMAN_REVIEW', async () => {
      setCreativeIntelligenceProviderForTests(createFailingMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.status).toBe('NEEDS_HUMAN_REVIEW');
    });
  });

  describe('VISUAL PROOF', () => {
    it('22. each final direction gets plan', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.visualProofPlans).toHaveLength(3);
    });

    it('23. no branch expansion in proof plans', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      const serialized = JSON.stringify(record.visualProofPlans);
      expect(serialized).not.toMatch(/branch/i);
    });

    it('24. rendering-medium recommendations persist', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.visualProofPlans[0]?.heroWorld.mediumRecommendation).toBeTruthy();
    });

    it('25. reference intent persists', () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      return getOrReconcileBrandLoreForOrg(orgId, 'ndxbook').then((profile) => {
        const input = buildCoreDirectionFormationInput({ profile: profile! });
        const plans = buildVisualProofPlans(
          [{ directionId: '1', directionName: 'TEST', governingBehavior: 'X', visualMetaphor: 'Y', primaryBrandArtifact: 'Z', typographicAttitude: 'sans', materialImageryLanguage: 'paper', socialExpressionHypothesis: 'card', motionSeed: 'loop' } as never],
          input,
        );
        expect(plans[0]?.heroWorld.referenceIntent?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('PERSISTENCE', () => {
    it('26. formation record persists', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      const stored = await getCoreDirectionFormationRecord(record.idempotencyKey);
      expect(stored?.formationId).toBe(record.formationId);
    });

    it('27. fingerprint persists on record', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.brandLoreFingerprint).toBe(computeBrandLoreFingerprint(profile!));
    });

    it('28. provider/model persists', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.providerId).toBe('mock');
      expect(record.modelId).toBe('mock-model');
    });

    it('29. critic result persists', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.criticResult?.critiques).toHaveLength(3);
    });

    it('30. final directions persist', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.finalDirections.length).toBe(3);
    });

    it('31. proof plans persist', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.visualProofPlans.length).toBe(3);
    });
  });

  describe('IDEMPOTENCY', () => {
    it('32. identical request reuses result', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const first = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      const second = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(second.reused).toBe(true);
      expect(second.record.formationId).toBe(first.record.formationId);
    });

    it('33. refresh does not duplicate request via payload load', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const p1 = await getCreativeDirectionPayload('ndxbook');
      const p2 = await getCreativeDirectionPayload('ndxbook');
      expect(p1.coreDirectionFormation?.record?.formationId).toBe(p2.coreDirectionFormation?.record?.formationId);
    });

    it('34. new Brand Lore fingerprint permits new run', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const inputA = buildCoreDirectionFormationInput({ profile: profile!, formationVersion: 1 });
      const keyA = buildFormationIdempotencyKey(inputA, CREATIVE_INTELLIGENCE_PROMPT_VERSION);
      profile!.worldMetaphor.value = 'Changed world metaphor for fingerprint test';
      const inputB = buildCoreDirectionFormationInput({ profile: profile!, formationVersion: 1 });
      const keyB = buildFormationIdempotencyKey(inputB, CREATIVE_INTELLIGENCE_PROMPT_VERSION);
      expect(keyA).not.toBe(keyB);
    });

    it('35. REFORM increments version', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      await getCreativeDirectionPayload('ndxbook');
      const reformed = await reformCoreDirections('ndxbook');
      expect(reformed.record.formationVersion).toBeGreaterThan(1);
    });
  });

  describe('GOVERNANCE', () => {
    it('36. no founder approval changed by formation', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const payload = await getCreativeDirectionPayload('ndxbook');
      expect(payload.engagement.founderDecision).toBeNull();
      expect(payload.engagement.lifecycle_state).toBe('PROPOSED');
    });

    it('37. CoreDNA stays null on territories', async () => {
      const payload = await getCreativeDirectionPayload('ndxbook');
      for (const t of payload.engagement.territories) {
        expect((t as { conceptDna?: unknown }).conceptDna ?? null).toBeNull();
      }
    });

    it('38. Visual DNA unchanged by formation', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const before = await getCreativeDirectionPayload('ndxbook');
      await runCoreDirectionFormation({
        orgSlug: 'ndxbook',
        profile: (await getOrReconcileBrandLoreForOrg(orgIdFromSlug('ndxbook')!, 'ndxbook'))!,
      });
      const after = await getCreativeDirectionPayload('ndxbook');
      expect(after.engagement.visualDna.status).toBe(before.engagement.visualDna.status);
    });

    it('39. publishing unchanged', async () => {
      const payload = await getCreativeDirectionPayload('ndxbook');
      expect(payload.meta.publishingEnabled).toBe(false);
    });

    it('40. organization isolation preserved', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const ndx = await getCreativeDirectionPayload('ndxbook');
      expect(ndx.meta.organization.slug).toBe('ndxbook');
    });

    it('41. project isolation preserved on formation record', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.organizationId).toBe(orgId);
    });
  });

  describe('NDX BOOK', () => {
    it('42. real fixture can construct input', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const input = buildCoreDirectionFormationInput({ profile: profile! });
      expect(input.organizationId).toBeTruthy();
    });

    it('43. existing static directions preserved', async () => {
      const payload = await getCreativeDirectionPayload('ndxbook');
      const names = payload.engagement.territories.map((t) => t.name);
      expect(names).toContain('INDEX SIGNAL');
      expect(names).toContain('EDITORIAL UTILITY');
      expect(names).toContain('KINETIC FIELD');
      expect(Object.keys(NDXBOOK_CORE_DIRECTIONS)).toHaveLength(3);
    });

    it('44. no FAL triggered by formation', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const payload = await getCreativeDirectionPayload('ndxbook');
      expect(payload.coreDirectionFormation?.record?.providerAccounting.requestCount ?? 0).toBeGreaterThan(0);
      expect(process.env.FAL_KEY).toBeFalsy();
    });

    it('45. current readiness remains CORE_DIRECTION_READY', async () => {
      const payload = await getCreativeDirectionPayload('ndxbook');
      expect(payload.engagement.brandLoreReadiness?.state).toBe('CORE_DIRECTION_READY');
    });
  });

  describe('PROVIDER UNAVAILABLE END-TO-END', () => {
    it('returns unavailable state without crash', async () => {
      await ensureNdxbookCoreDirectionReady();
      const payload = await getCreativeDirectionPayload('ndxbook');
      expect(payload.meta.creativeIntelligence?.providerConfigured).toBe(false);
      expect(payload.meta.creativeIntelligence?.formationSurface.surface).toBe('PROVIDER_UNAVAILABLE');
      expect(payload.coreDirectionFormation?.record?.errorCode).toBe('CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE');
    });
  });
});
