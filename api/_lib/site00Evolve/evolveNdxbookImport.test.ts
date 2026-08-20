import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resetEvolveStore, getEvolveStore } from './memoryStore.js';
import { resetConnectionMemory, attemptPublish, initiateConnection } from './providers/connectionService.js';
import {
  runNdxbookLegacyImport,
  resetNdxbookImportMemory,
  getNdxbookImportState,
  loadNdxbookHandoff,
  getNdxbookImportReport,
} from './providers/ndxbookLegacyImportService.js';
import { resetPage001Memory, getPage001Candidate } from './providers/page001CandidateService.js';
import {
  getProfileByOrgId,
  getObjectivesByOrgId,
  getChannelsByOrgId,
  getContentBrainByOrgId,
} from './storeAdapter.js';
import { orgIdFromSlug } from './orgRegistry.js';
import { evaluateBrandReadiness, generateNdxbookManifest } from './providers/ndxbookService.js';
import { getExpandedPilotReadiness } from './providers/pilotReadinessSprint04.js';
import { buildConnectionCommandItems } from './providers/commandConnections.js';
import { isGlobalPublishingEnabled } from './providers/publishingFence.js';
import { runNdxbookAssessment } from './providers/ndxbookService.js';

const NDXBOOK_MEMORY_UUID = 'org-00000000-0000-4000-8000-000000000005';
const DEMO_AUDIENCE = 'Independent authors aged 25-45';
const DEMO_OBJECTIVE = 'Reach 100,000 readers from 12,400 baseline';

describe('EVOLVE NDXbook legacy intelligence import', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', '');
    resetEvolveStore();
    resetConnectionMemory();
    resetNdxbookImportMemory();
    resetPage001Memory();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function seedDemoBootstrap() {
    await runNdxbookAssessment(
      {
        organizationPurpose: 'Demo ndxbook org',
        whatItOffers: 'Pages',
        targetAudience: DEMO_AUDIENCE,
        primaryObjective: DEMO_OBJECTIVE,
        secondaryObjectives: ['Grow reader count to 100000'],
        contentGoals: ['Posts'],
        conversionTarget: 'Subscribe',
        brandVoice: 'Generic',
        visualIdentityStatus: 'DEFINED',
        publishingCadence: 'Daily',
        approvalPreference: 'OWNER_APPROVAL_REQUIRED',
        websiteDestination: 'https://ndxbook.com',
        brandAssetsAvailable: 'Indigo palette',
        brandVoiceAvailable: true,
        visualIdentityAvailable: true,
      },
      'demo-seed@test.com',
    );
  }

  it('1. existing NDXbook UUID reused — no duplicate org created', async () => {
    const before = orgIdFromSlug('ndxbook');
    const result = await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    expect(before).toBe(NDXBOOK_MEMORY_UUID);
    expect(result.organization.uuid).toBe(NDXBOOK_MEMORY_UUID);
    expect(result.organization.duplicateCreated).toBe(false);
    expect(result.organization.slug).toBe('ndxbook');
  });

  it('2. duplicate org cannot be created — handoff enforces ndxbook slug', async () => {
    const handoff = loadNdxbookHandoff();
    expect((handoff.targetOrganization as { slug: string }).slug).toBe('ndxbook');
    await expect(
      runNdxbookLegacyImport({ approvedBy: 'founder@test.com' }),
    ).resolves.toMatchObject({ status: 'IMPORTED' });
  });

  it('3. import is idempotent — second run skips duplicate Content Brain entries', async () => {
    const first = await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const countAfterFirst = (await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!)).length;
    const second = await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const countAfterSecond = (await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!)).length;
    expect(first.contentBrain.created).toBeGreaterThan(0);
    expect(second.contentBrain.skipped).toBeGreaterThan(0);
    expect(second.contentBrain.created).toBe(0);
    expect(countAfterSecond).toBe(countAfterFirst);
    expect(getNdxbookImportState().runCount).toBe(2);
  });

  it('4. canonical brand fields imported into Content Brain', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const positioning = entries.find((e) => (e.metadata as Record<string, unknown>)?.import_key === 'brand.positioning');
    expect(positioning).toBeTruthy();
    expect((positioning!.content as { text: string }).text).toBe('the index for everyday knowledge.');
    expect((positioning!.metadata as Record<string, unknown>).entry_class).toBe('CANONICAL');
  });

  it('5. founder-confirmed target audience overrides demo seed', async () => {
    await seedDemoBootstrap();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    expect(profile?.audience_summary).toContain('Curious adults seeking practical, useful knowledge');
    expect(profile?.audience_summary).not.toContain('25-45');
  });

  it('6. demo age range not imported as canon', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const audience = entries.find((e) => (e.metadata as Record<string, unknown>)?.import_key === 'audience');
    expect((audience!.content as { ageRange: string }).ageRange).toContain('UNSPECIFIED');
    expect((audience!.metadata as Record<string, unknown>).demo_age_rejected).toBe(true);
    const handoff = loadNdxbookHandoff();
    expect((handoff.rejectedDemoData as Record<string, unknown>).audienceAgeRange).toBeTruthy();
  });

  it('7. founder objective overrides demo objective', async () => {
    await seedDemoBootstrap();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const objectives = await getObjectivesByOrgId(orgIdFromSlug('ndxbook')!);
    const primary = objectives.find((o) => o.objective_key === 'ndx-primary');
    expect(primary?.title).toContain('Instagram');
    expect(primary?.title).not.toContain('100,000');
    expect(primary?.metadata?.provenance).toBe('FOUNDER_CONFIRMED');
  });

  it('8. fake 12,400/100,000 metrics rejected — not imported as truth', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const rejected = entries.find((e) => (e.metadata as Record<string, unknown>)?.import_key === 'rejected.demo_metrics');
    expect(rejected).toBeTruthy();
    expect((rejected!.metadata as Record<string, unknown>).entry_class).toBe('REJECTED');
    expect(JSON.stringify(rejected!.content)).toContain('12400');
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    expect(JSON.stringify(profile)).not.toContain('12400');
  });

  it('9. monetization marked deferred', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    expect((profile!.metadata as Record<string, unknown>).monetization_state).toBe('DEFERRED');
  });

  it('10. visual DNA remains incomplete/reference', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const result = await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    expect(result.visualDna).toBe('INCOMPLETE_REFERENCE_ONLY');
    const brand = await evaluateBrandReadiness('ndxbook');
    expect(brand.checks.COLORS.state).toBe('INSUFFICIENT');
  });

  it('11. indigo/slate values not promoted to canonical identity', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const visual = entries.find((e) => (e.metadata as Record<string, unknown>)?.import_key === 'ref.visual_dna');
    expect((visual!.metadata as Record<string, unknown>).entry_class).toBe('REFERENCE');
    expect(JSON.stringify(visual!.content)).toContain('#6366F1');
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    expect((profile!.metadata as Record<string, unknown>).visual_dna_status).toBe('INCOMPLETE_REFERENCE_ONLY');
    expect((profile!.metadata as Record<string, unknown>).visual_identity_available).toBe(false);
  });

  it('12. lace-mastery artifact classified misattributed', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const lace = entries.find((e) => (e.metadata as Record<string, unknown>)?.import_key === 'rejected.lace_mastery');
    expect((lace!.metadata as Record<string, unknown>).entry_class).toBe('MISATTRIBUTED');
    expect(JSON.stringify(lace!.content)).toContain('lace-mastery');
  });

  it('13. Instagram safe identifiers stored only as reconciliation intelligence', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    const ig = (profile!.metadata as Record<string, unknown>).instagram_reconciliation as Record<string, string>;
    expect(ig.pageId).toBe('1253535611171453');
    expect(ig.instagramBusinessAccountId).toBe('17841443306051610');
    expect(JSON.stringify(getEvolveStore())).not.toContain('access_token');
  });

  it('14. no credentials/tokens imported', async () => {
    const result = await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    expect(result.secretsImported).toBe(false);
    expect(result.providerWrites).toBe(0);
    const handoffRaw = readFileSync(
      join(process.cwd(), 'docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.json'),
      'utf8',
    );
    expect(handoffRaw).not.toMatch(/access_token|refresh_token|client_secret/i);
    expect(JSON.stringify(await getNdxbookImportReport())).not.toMatch(/access_token|refresh_token/i);
  });

  it('15. public name styling rule persisted', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    const meta = profile!.metadata as Record<string, unknown>;
    expect(meta.public_name).toBe('ndxbook');
    expect(meta.display_name).toBe('NDXBOOK');
    expect(String(meta.name_styling_rule)).toContain('ndxbook');
  });

  it('16. demo pages 019–042 never become publication history', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const archive = entries.find((e) => (e.metadata as Record<string, unknown>)?.import_key === 'archive.demo_pages');
    expect((archive!.metadata as Record<string, unknown>).never_published).toBe(true);
    expect((archive!.metadata as Record<string, unknown>).entry_class).toBe('REFERENCE');
    const store = getEvolveStore();
    expect(store.calendarItems.filter((c) => c.organization_id === orgIdFromSlug('ndxbook')).length).toBe(0);
  });

  it('17. Page 001 starts active canonical history at zero published pages', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const profile = await getProfileByOrgId(orgIdFromSlug('ndxbook')!);
    expect((profile!.metadata as Record<string, unknown>).canonical_published_pages).toBe(0);
    expect((profile!.metadata as Record<string, unknown>).starting_page).toBe('PAGE_001');
  });

  it('18. Page 001 topic imported as candidate — not publication approved', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const page001 = getPage001Candidate('ndxbook');
    expect(page001?.topic).toBe('credit score / debt payoff');
    expect(page001?.publicationApproval).toBe('NOT_APPROVED');
    expect(page001?.contentState).toBe('REFERENCE_IMPORTED');
  });

  it('19. Page 001 volume = MONEY', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    expect(getPage001Candidate('ndxbook')?.volume).toBe('MONEY');
  });

  it('20. other platforms remain locked during initial pilot', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const channels = await getChannelsByOrgId(orgIdFromSlug('ndxbook')!);
    const instagram = channels.find((c) => c.channel_key === 'INSTAGRAM');
    const tiktok = channels.find((c) => c.channel_key === 'TIKTOK');
    expect(instagram?.channel_state).toBe('ACTIVE');
    expect(tiktok?.channel_state).toBe('LOCKED');
    expect(channels.filter((c) => c.channel_state === 'LOCKED').length).toBeGreaterThanOrEqual(6);
  });

  it('21. automation remains MANUAL', async () => {
    const result = await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    expect(result.pilot.automation).toBe('MANUAL');
  });

  it('22. human approval remains REQUIRED', async () => {
    const result = await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    expect(result.pilot.humanApproval).toBe(true);
    const readiness = await getExpandedPilotReadiness('ndxbook');
    expect(readiness.items.find((i) => i.key === 'approval')?.state).toBe('READY');
  });

  it('23. Content Brain provenance retained on every imported field', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const entries = await getContentBrainByOrgId(orgIdFromSlug('ndxbook')!);
    const imported = entries.filter((e) => (e.metadata as Record<string, unknown>)?.import_key);
    expect(imported.length).toBeGreaterThanOrEqual(10);
    for (const entry of imported) {
      const meta = entry.metadata as Record<string, unknown>;
      expect(meta.source_repository).toBe('yoteenz/fsbw');
      expect(meta.source_path).toContain('NDXBOOK_SITE00_HANDOFF.json');
      expect(meta.imported_at).toBeTruthy();
    }
  });

  it('24. existing EVOLVE state reconciled without objective duplication', async () => {
    await seedDemoBootstrap();
    const beforeCount = (await getObjectivesByOrgId(orgIdFromSlug('ndxbook')!)).length;
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const after = await getObjectivesByOrgId(orgIdFromSlug('ndxbook')!);
    const ndxKeys = after.filter((o) => String(o.objective_key).startsWith('ndx-'));
    expect(ndxKeys.length).toBe(3);
    expect(after.length).toBeLessThanOrEqual(beforeCount + 3);
  });

  it('25. manifest lineage preserved with Page 001 specimen', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const manifest = await generateNdxbookManifest();
    expect(manifest).toHaveProperty('manifest');
    const m = manifest as { manifest: { generated_from: Record<string, unknown> }; items: Array<{ item_key: string }> };
    expect(m.manifest.generated_from.lineage).toContain('legacy recovery');
    expect(m.items.some((i) => i.item_key === 'page_001_specimen')).toBe(true);
  });

  it('26. no provider writes occur during import', async () => {
    const result = await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    expect(result.providerWrites).toBe(0);
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'IG');
    await expect(attemptPublish('ndxbook', conn.id)).rejects.toThrow(/PUBLISHING_DISABLED/);
  });

  it('27. publishing fences remain disabled', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    expect(isGlobalPublishingEnabled()).toBe(false);
    const readiness = await getExpandedPilotReadiness('ndxbook');
    expect(readiness.items.find((i) => i.key === 'global_fence')?.state).toBe('DISABLED');
    expect(readiness.items.find((i) => i.key === 'org_fence')?.state).toBe('DISABLED');
  });

  it('28. cross-org isolation remains enforced', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const fsProfile = await getProfileByOrgId(orgIdFromSlug('frontal-slayer')!);
    expect((fsProfile!.metadata as Record<string, unknown>).seed).not.toBe('ndxbook_legacy_import');
    const fsBrain = await getContentBrainByOrgId(orgIdFromSlug('frontal-slayer')!);
    expect(fsBrain.some((e) => (e.metadata as Record<string, unknown>)?.import_key === 'brand.positioning')).toBe(false);
  });

  it('COMMAND reflects post-import focus and upcoming pipeline after import', async () => {
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const items = await buildConnectionCommandItems('ndxbook', 'NDXBOOK');
    expect(items.some((i) => i.category === 'FOCUS_NOW' && i.title.includes('visual identity'))).toBe(true);
    expect(items.some((i) => i.category === 'UPCOMING' && i.title.includes('Page 001'))).toBe(true);
    expect(items.some((i) => i.category === 'DEFERRED' && i.title.includes('Monetization'))).toBe(true);
  });
});
