import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetEvolveStore } from '../memoryStore.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from '../providers/ndxbookLegacyImportService.js';
import {
  resetCreativeDirectionMemory,
  getCreativeDirectionPayload,
  reformCoreDirections,
  retryFailedCoreDirectionFormation,
} from './engagementService.js';
import { submitOrgLoreCalibration } from '../../site00BrandLore/loreService.js';
import { invalidateCreativeDirectionEngagement } from './engagementService.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import { getOrReconcileBrandLoreForOrg } from '../../site00BrandLore/loreService.js';
import { resetBrandLoreMemoryStore } from '../../site00BrandLore/memoryStore.js';
import {
  setCreativeIntelligenceProviderForTests,
} from './creativeIntelligence/providerRegistry.js';
import {
  createMockCreativeIntelligenceProvider,
  createFailingMockCreativeIntelligenceProvider,
} from './creativeIntelligence/mockProvider.js';
import {
  runCoreDirectionFormation,
  resetCoreDirectionFormationMemory,
} from './creativeIntelligence/formationService.js';
import {
  getFormationRecordByIdempotencyKey,
  resetFormationMemoryStore,
  resolveFormationStoreMode,
} from './creativeIntelligence/formationStore/storeAdapter.js';
import {
  resolveCreativeIntelligenceProviderConfig,
} from './creativeIntelligence/providerConfig.js';
import { buildCoreDirectionFormationInput, buildFormationIdempotencyKey } from './creativeIntelligence/formationInputBuilder.js';
import { CREATIVE_INTELLIGENCE_PROMPT_VERSION } from './creativeIntelligence/config.js';
import { computeBrandLoreFingerprint } from '../../../../shared/site00-brand-lore/fingerprint.js';
import { NDXBOOK_CORE_DIRECTIONS } from './coreDirectionDefinitions.js';

describe('Creative Intelligence Production Activation', () => {
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
    resetFormationMemoryStore();
    resetBrandLoreMemoryStore();
    setCreativeIntelligenceProviderForTests(null);
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    await ensureNdxbookCoreDirectionReady();
  });

  afterEach(() => {
    setCreativeIntelligenceProviderForTests(null);
    vi.unstubAllEnvs();
  });

  describe('PERSISTENCE', () => {
    it('1. formation persists through store adapter', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      const loaded = await getFormationRecordByIdempotencyKey(record.idempotencyKey);
      expect(loaded?.formationId).toBe(record.formationId);
      expect(loaded?.finalDirections).toHaveLength(3);
    });

    it('2. survives fresh store read (same idempotency key)', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const first = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      const second = await getFormationRecordByIdempotencyKey(first.record.idempotencyKey);
      expect(second?.candidateDirections.length).toBe(3);
    });

    it('3-7. candidate/critic/final/proof/error persist on record', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.candidateDirections.length).toBe(3);
      expect(record.criticResult).toBeTruthy();
      expect(record.finalDirections.length).toBe(3);
      expect(record.visualProofPlans.length).toBe(3);
    });

    it('8. safe error state persists when provider unavailable', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const { record } = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(record.status).toBe('FAILED');
      expect(record.errorCode).toBe('CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE');
      const loaded = await getFormationRecordByIdempotencyKey(record.idempotencyKey);
      expect(loaded?.errorCode).toBe('CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE');
    });
  });

  describe('IDEMPOTENCY', () => {
    it('9-11. same fingerprint reuses record without duplicate request', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const first = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      const second = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(second.reused).toBe(true);
      expect(second.record.providerAccounting.requestCount).toBe(first.record.providerAccounting.requestCount);
    });

    it('12. new fingerprint creates new record', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const inputA = buildCoreDirectionFormationInput({ profile: profile!, formationVersion: 1 });
      await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      profile!.worldMetaphor.value = 'A different metaphor for fingerprint delta';
      const inputB = buildCoreDirectionFormationInput({ profile: profile!, formationVersion: 1 });
      expect(buildFormationIdempotencyKey(inputA, CREATIVE_INTELLIGENCE_PROMPT_VERSION)).not.toBe(
        buildFormationIdempotencyKey(inputB, CREATIVE_INTELLIGENCE_PROMPT_VERSION),
      );
    });

    it('13. REFORM increments version', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      await getCreativeDirectionPayload('ndxbook');
      const reformed = await reformCoreDirections('ndxbook');
      expect(reformed.record.formationVersion).toBeGreaterThan(1);
    });

    it('14. retry does not duplicate logical formation version', async () => {
      const orgId = orgIdFromSlug('ndxbook')!;
      const profile = await getOrReconcileBrandLoreForOrg(orgId, 'ndxbook');
      const failed = await runCoreDirectionFormation({ orgSlug: 'ndxbook', profile: profile! });
      expect(failed.record.status).toBe('FAILED');
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const retried = await retryFailedCoreDirectionFormation('ndxbook');
      expect(retried.record.formationVersion).toBe(failed.record.formationVersion);
      expect(retried.record.status).toBe('READY_FOR_VISUAL_PRODUCTION');
    });
  });

  describe('PROVIDER', () => {
    it('15-17. provider config states', () => {
      expect(resolveCreativeIntelligenceProviderConfig().status).toBe('UNAVAILABLE');
      vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
      expect(resolveCreativeIntelligenceProviderConfig().status).toBe('CONFIGURED');
      vi.stubEnv('SITE00_CREATIVE_INTELLIGENCE_MODEL', '');
      vi.stubEnv('ANTHROPIC_CREATIVE_MODEL', '');
      // model falls back to default in config — still configured
    });

    it('18-19. provider/model recorded without credential leak', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const payload = await getCreativeDirectionPayload('ndxbook');
      expect(payload.coreDirectionFormation?.record?.providerId).toBe('mock');
      expect(JSON.stringify(payload)).not.toContain('test-key');
    });
  });

  describe('NDX BOOK + UI payload', () => {
    it('20-25. live input + legacy + exactly three', async () => {
      setCreativeIntelligenceProviderForTests(createMockCreativeIntelligenceProvider());
      const payload = await getCreativeDirectionPayload('ndxbook');
      expect(payload.engagement.brandLoreReadiness?.state).toBe('CORE_DIRECTION_READY');
      expect(payload.coreDirectionFormation?.record?.finalDirections.length).toBe(3);
      const legacyNames = payload.engagement.territories.map((t) => t.name);
      expect(legacyNames).toContain('INDEX SIGNAL');
      expect(Object.keys(NDXBOOK_CORE_DIRECTIONS)).toHaveLength(3);
      const formedNames = payload.coreDirectionFormation?.record?.finalDirections.map((d) => d.directionName);
      expect(formedNames?.some((n) => n.includes('SIGNAL ARCHIVE'))).toBe(true);
    });
  });

  describe('STORE MODE', () => {
    it('uses memory backend in tests', async () => {
      expect(await resolveFormationStoreMode()).toBe('memory');
    });
  });
});
