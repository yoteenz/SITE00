import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetEvolveStore } from './memoryStore.js';
import { resetConnectionMemory } from './providers/connectionService.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from './providers/ndxbookLegacyImportService.js';
import { resetPage001Memory, getPage001Candidate } from './providers/page001CandidateService.js';
import {
  resetCreativeDirectionMemory,
  ensureCreativeDirectionEngagement,
  getCreativeDirectionPayload,
  recordFounderDecision,
  queueFalGenerationJobs,
  invalidateCreativeDirectionEngagement,
} from './creativeDirection/engagementService.js';
import { submitOrgLoreCalibration } from '../site00BrandLore/loreService.js';
import { resetBrandLoreMemoryStore } from '../site00BrandLore/memoryStore.js';
import { orgIdFromSlug } from './orgRegistry.js';
import { getProfileByOrgId, getContentBrainByOrgId } from './storeAdapter.js';
import { isGlobalPublishingEnabled } from './providers/publishingFence.js';
import { attemptPublish, initiateConnection } from './providers/connectionService.js';

const NDXBOOK_UUID = 'org-00000000-0000-4000-8000-000000000005';

describe('EVOLVE NDXbook Creative Direction', () => {
  beforeEach(async () => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', '');
    vi.stubEnv('FAL_KEY', '');
    resetEvolveStore();
    resetConnectionMemory();
    resetNdxbookImportMemory();
    resetPage001Memory();
    resetCreativeDirectionMemory();
    resetBrandLoreMemoryStore();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('1. existing NDXbook UUID reused', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.meta.organization.uuid).toBe(NDXBOOK_UUID);
  });

  it('2. no duplicate organization created', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.meta.duplicateOrgCreated).toBe(false);
  });

  it('3. canonical Content Brain intelligence feeds Creative Direction', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.knownIntelligence.length).toBeGreaterThan(3);
    expect(payload.engagement.creativeBrief.provenance.source).toBe('CONTENT_BRAIN');
  });

  it('4. founder not re-asked canonical questions — briefing surfaces known intelligence', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const labels = payload.engagement.knownIntelligence.map((s) => s.label);
    expect(labels.some((l) => /audience|positioning|objective/i.test(l))).toBe(true);
    expect(payload.engagement.openQuestions).toContain('Visual language');
    expect(payload.engagement.openQuestions).not.toContain('targetAudience');
  });

  it('5. visual DNA begins incomplete', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.visualDna.status).toBe('INCOMPLETE');
    expect(payload.meta.visualDnaStatus).toBe('INCOMPLETE');
  });

  it('6. legacy indigo/slate remains reference-only in profile', async () => {
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    expect((profile!.metadata as Record<string, unknown>).visual_dna_status).toBe('INCOMPLETE_REFERENCE_ONLY');
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.legacyReference.indigoSlate.promotedToCanon).toBe(false);
  });

  it('7. lace-mastery cannot become canon', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.legacyReference.laceMastery.status).toBe('REJECTED_MISATTRIBUTED');
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const lace = entries.find((e) => (e.metadata as Record<string, unknown>)?.import_key === 'rejected.lace_mastery');
    expect((lace!.metadata as Record<string, unknown>).entry_class).toBe('MISATTRIBUTED');
  });

  it('8. three territories independently represented', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.territories).toHaveLength(3);
    const names = payload.engagement.territories.map((t) => t.name);
    expect(new Set(names).size).toBe(3);
    expect(names.some((n) => n.includes('INDIGO'))).toBe(false);
  });

  it('9. territory assets retain provenance', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const specimen = payload.engagement.territories[0].specimens[0];
    expect(specimen.provenance.classification).toBe('PROPOSED');
    expect(specimen.provenance.approved).toBe(false);
  });

  it('10. generated asset ≠ approved asset', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    for (const t of payload.engagement.territories) {
      for (const s of t.specimens) {
        expect(s.status).not.toBe('APPROVED');
      }
    }
  });

  it('11. proposed brief ≠ canonical intelligence', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.creativeBrief.classification).toBe('PROPOSED');
  });

  it('12. founder approval required for visual DNA promotion (after Brand Lore reaches readiness)', async () => {
    const orgId = orgIdFromSlug('ndxbook')!;
    await submitOrgLoreCalibration({
      orgId,
      orgSlug: 'ndxbook',
      answers: {
        role: 'guide',
        world: 'a living index of everything worth knowing',
        feeling: ['curious'],
        enemy: ['gatekeeping'],
        lineage: 'archival ephemera',
        now: 'editorial accounts',
        objects: ['paper'],
      },
    });
    invalidateCreativeDirectionEngagement('ndxbook');
    let payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.visualDna.status).toBe('INCOMPLETE');
    await recordFounderDecision('ndxbook', {
      type: 'APPROVE',
      selectedTerritoryId: payload.engagement.territories[0].id,
      by: 'founder@test.com',
    });
    payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.visualDna.status).toBe('APPROVED');
  });

  it('12b. founder approval is blocked while Brand Lore context remains incomplete (XXXI)', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    await expect(
      recordFounderDecision('ndxbook', {
        type: 'APPROVE',
        selectedTerritoryId: payload.engagement.territories[0].id,
        by: 'founder@test.com',
      }),
    ).rejects.toThrow('CONTEXT CALIBRATION REQUIRED');
  });

  it('13. hybrid direction retains source provenance', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    const t1 = payload.engagement.territories[0];
    const t2 = payload.engagement.territories[1];
    await recordFounderDecision('ndxbook', {
      type: 'HYBRIDIZE',
      selectedTerritoryId: t1.id,
      hybridSelections: [{ territoryId: t2.id, elements: ['typography', 'grid'] }],
      by: 'founder@test.com',
    });
    const after = await getCreativeDirectionPayload('ndxbook');
    expect(after.engagement.visualDna.provenance.hybridContributions).toBeTruthy();
  });

  it('14. rejection does not mutate canonical visual DNA', async () => {
    await recordFounderDecision('ndxbook', { type: 'REJECT', by: 'founder@test.com' });
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    expect((profile!.metadata as Record<string, unknown>).visual_dna_status).not.toBe('APPROVED');
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.visualDna.status).toBe('INCOMPLETE');
  });

  it('15. Page 001 gated before visual approval', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.page001?.productionStarted).toBe(false);
    expect(payload.engagement.page001Gate.productionEligible).toBe(false);
  });

  it('16. provider state does not block Creative Direction', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.meta.providerBlocksCreativeDirection).toBe(false);
  });

  it('17. provider still blocks distribution when publishing disabled', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'IG');
    await expect(attemptPublish('ndxbook', conn.id)).rejects.toThrow(/PUBLISHING_DISABLED/);
  });

  it('18. publishing remains disabled', async () => {
    expect(isGlobalPublishingEnabled()).toBe(false);
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.meta.publishingEnabled).toBe(false);
  });

  it('19. cross-posting not enabled via creative direction', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(JSON.stringify(payload)).not.toContain('cross_posting_enabled');
  });

  it('20. no fake metrics introduced', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(JSON.stringify(payload)).not.toContain('12400');
    expect(JSON.stringify(payload)).not.toContain('100000');
  });

  it('21. no fake provider state', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(JSON.stringify(payload)).not.toMatch(/VERIFIED.*OAUTH.*bypass/i);
  });

  it('22. organization isolation enforced', async () => {
    await ensureCreativeDirectionEngagement('ndxbook');
    const fsPayload = await getCreativeDirectionPayload('frontal-slayer').catch(() => null);
    if (fsPayload) {
      expect(fsPayload.engagement.organization_slug).toBe('frontal-slayer');
    }
    const ndx = await getCreativeDirectionPayload('ndxbook');
    expect(ndx.engagement.organization_slug).toBe('ndxbook');
  });

  it('23. comparison separates evolve recommendation from approval', async () => {
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.comparison.evolveRecommendation.isApproval).toBe(false);
  });

  it('24. FAL queue skipped truthfully when key unavailable', async () => {
    const result = await queueFalGenerationJobs('ndxbook');
    expect(result.skipped).toBe(true);
    expect(result.queued).toBe(0);
  });

  it('25. Page 001 candidate unchanged — production not started', async () => {
    const candidate = getPage001Candidate('ndxbook');
    expect(candidate?.publicationApproval).toBe('NOT_APPROVED');
    expect(candidate?.distribution).toBe('NOT_DISPATCHED');
  });

  it('26. new engagement stamps Brand Lore lineage (profile id/version/fingerprint) once intelligence exists', async () => {
    const orgId = orgIdFromSlug('ndxbook')!;
    await submitOrgLoreCalibration({
      orgId,
      orgSlug: 'ndxbook',
      answers: { role: ['guide'], world: 'a living index', feeling: ['curious'] },
    });
    invalidateCreativeDirectionEngagement('ndxbook');
    const payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.brandLoreFormation?.brandLoreProfileId).toBeTruthy();
    expect(payload.engagement.brandLoreFormation?.brandLoreFingerprint).toMatch(/^[0-9a-f]{8}$/);
    expect(payload.engagement.intelligenceStatus).toBe('CURRENT');
  });

  it('27. changed calibration fingerprint marks unapproved directions STALE_INTELLIGENCE, unchanged fingerprint does not', async () => {
    const orgId = orgIdFromSlug('ndxbook')!;
    await submitOrgLoreCalibration({
      orgId,
      orgSlug: 'ndxbook',
      answers: { role: ['guide'], world: 'a living index', feeling: ['curious'] },
    });
    invalidateCreativeDirectionEngagement('ndxbook');
    let payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.intelligenceStatus).toBe('CURRENT');
    const fingerprintBefore = payload.engagement.brandLoreFormation?.brandLoreFingerprint;

    // Re-reading with no new answers must NOT flip staleness — refresh must not fabricate drift.
    payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.intelligenceStatus).toBe('CURRENT');
    expect(payload.engagement.brandLoreFormation?.brandLoreFingerprint).toBe(fingerprintBefore);

    // A genuine calibration change must flip the signal truthfully.
    await submitOrgLoreCalibration({
      orgId,
      orgSlug: 'ndxbook',
      answers: { world: 'an entirely different founding metaphor for the brand' },
    });
    payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.intelligenceStatus).toBe('STALE_INTELLIGENCE');
    expect(payload.engagement.brandLoreFormation?.brandLoreFingerprint).toBe(fingerprintBefore);
  });

  it('28. approved Core Direction freezes intelligenceStatus — a later lore change is never silently relabeled/regenerated', async () => {
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
      },
    });
    invalidateCreativeDirectionEngagement('ndxbook');
    let payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.brandLoreReadiness?.blocked).toBe(false);

    await recordFounderDecision('ndxbook', {
      type: 'APPROVE',
      selectedTerritoryId: payload.engagement.territories[0].id,
      by: 'founder@test.com',
    });
    payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.lifecycle_state).toBe('APPROVED');
    const statusAtApproval = payload.engagement.intelligenceStatus;

    await submitOrgLoreCalibration({
      orgId,
      orgSlug: 'ndxbook',
      answers: { world: 'a completely different founding metaphor after approval' },
    });
    payload = await getCreativeDirectionPayload('ndxbook');
    expect(payload.engagement.lifecycle_state).toBe('APPROVED');
    expect(payload.engagement.intelligenceStatus).toBe(statusAtApproval);
    expect(payload.engagement.territories[0].lifecycleState).toBe('APPROVED');
  });
});
