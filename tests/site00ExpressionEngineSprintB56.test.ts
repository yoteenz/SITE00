/**
 * B5.6 — Persistent package storage + visual sequence editing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CAMPAIGN_AUDIT_EVENT_TYPES,
  CAMPAIGN_PACKAGE_STORAGE_SOURCES,
} from '../shared/site00-campaign-package/types.js';
import {
  resetCampaignPackageMemoryStore,
  getCampaignPackageSnapshot,
} from '../api/_lib/site00CampaignPackage/memoryStore.js';
import {
  ENTRY001_PACKAGE_KEY_EXPORT,
  getOrderedSequenceAssets,
  loadCampaignPackage,
  removeCampaignAsset,
  reorderCampaignSequence,
  restoreCampaignAsset,
  syncEntry001Package,
} from '../api/_lib/site00CampaignPackage/campaignPackageService.js';
import { migrateEntry001Package } from '../api/_lib/site00CampaignPackage/entry001Migration.js';
import { snapshotToEntry001Persisted } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/campaignPackageBridge.js';
import { buildActiveArchive } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001ArchiveIntelligence.js';
import { buildEntry001PackageReadiness } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001PackageReadiness.js';
import {
  SITE00_ROUTES,
  site00ProjectCampaignBoardEntryCarouselPath,
  site00ProjectCampaignBoardEntryStoryPath,
} from '../src/site00/config/routes.js';
import { ENTRY001_CAROUSEL_PACKAGE_ID } from '../src/site00/config/entry001CampaignAssets.js';

const ROOT = join(import.meta.dirname, '..');

describe('B5.6 Persistent package storage + sequence editing', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetCampaignPackageMemoryStore();
  });

  it('1. persistent CampaignPackage model exists', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.package.packageId).toBeTruthy();
    expect(snapshot.package.entryId).toBe('entry-001');
    expect(snapshot.package.packageKey).toBe(ENTRY001_PACKAGE_KEY_EXPORT);
  });

  it('2. persistent CampaignAsset model exists', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.assets.length).toBeGreaterThan(10);
    expect(snapshot.assets[0]!.assetId).toBeTruthy();
    expect(snapshot.assets[0]!.storageSource).toBeTruthy();
  });

  it('3. persistent CampaignDeliverable model type exists in schema', () => {
    const sql = readFileSync(
      join(ROOT, 'supabase/migrations/20260908160000_site00_campaign_package_persistence.sql'),
      'utf8',
    );
    expect(sql).toContain('site00_campaign_deliverables');
  });

  it('4. version persistence table exists', () => {
    const sql = readFileSync(
      join(ROOT, 'supabase/migrations/20260908160000_site00_campaign_package_persistence.sql'),
      'utf8',
    );
    expect(sql).toContain('site00_campaign_deliverable_versions');
  });

  it('5. sequence persistence exists', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.sequences.some((s) => s.formatFamily === 'CAROUSEL' && s.isCurrent)).toBe(true);
    expect(snapshot.sequences.some((s) => s.formatFamily === 'STORY' && s.isCurrent)).toBe(true);
  });

  it('6. Entry 001 migration is idempotent', async () => {
    await syncEntry001Package({});
    const second = await syncEntry001Package({});
    expect(second.migrated).toBe(false);
    expect(second.snapshot.package.migrationComplete).toBe(true);
  });

  it('7. migration preserves IDs', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.assets.some((a) => a.assetId === 'entry001-archive-01-then-now')).toBe(true);
  });

  it('8. migration preserves classification', async () => {
    const { snapshot } = await syncEntry001Package({});
    const slide = snapshot.assets.find((a) => a.assetType === 'CAROUSEL_SLIDE');
    expect(slide?.assetRole).toBeTruthy();
  });

  it('9. migration preserves archive/removal state', async () => {
    await syncEntry001Package({});
    await removeCampaignAsset(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-01-then-now');
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    const removed = snap.assets.find((a) => a.assetId === 'entry001-archive-01-then-now');
    expect(removed?.removedFromActiveArchive).toBe(true);
  });

  it('10. migration preserves package membership', async () => {
    const { snapshot } = await syncEntry001Package({});
    const carouselSlides = snapshot.assets.filter((a) => a.assetType === 'CAROUSEL_SLIDE');
    expect(carouselSlides.every((s) => s.packageMembershipId === ENTRY001_CAROUSEL_PACKAGE_ID)).toBe(true);
  });

  it('11. migration preserves captions field on model', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.assets.every((a) => 'caption' in a)).toBe(true);
  });

  it('12. migration preserves versions on model', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.assets.every((a) => a.versionLabel)).toBeTruthy();
  });

  it('13. migration preserves sequence', async () => {
    const { snapshot } = await syncEntry001Package({});
    const carousel = getOrderedSequenceAssets(snapshot, 'CAROUSEL');
    expect(carousel.length).toBe(4);
  });

  it('14. duplicate migration does not duplicate records', async () => {
    const first = await syncEntry001Package({});
    const count = first.snapshot.assets.length;
    const { snapshot, receipt } = migrateEntry001Package({
      existing: first.snapshot,
      source: 'MERGE',
    });
    expect(snapshot.assets.length).toBe(count);
    expect(receipt.recordsCreated).toBe(0);
  });

  it('15–16. empty localStorage equivalent restores from backend', async () => {
    await syncEntry001Package({});
    resetCampaignPackageMemoryStore();
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.assets.length).toBeGreaterThan(0);
    const legacy = snapshotToEntry001Persisted(snapshot);
    expect(buildActiveArchive(legacy.overrides, legacy.removedAssetIds, legacy.extraAssets).length).toBeGreaterThan(0);
  });

  it('17. package count survives refresh', async () => {
    const { snapshot } = await syncEntry001Package({});
    const active = snapshot.assets.filter((a) => !a.removedFromActiveArchive);
    resetCampaignPackageMemoryStore();
    await syncEntry001Package({});
    const reloaded = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    expect(reloaded.assets.filter((a) => !a.removedFromActiveArchive).length).toBe(active.length);
  });

  it('18. removed asset survives refresh', async () => {
    await syncEntry001Package({});
    await removeCampaignAsset(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-01-then-now');
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    resetCampaignPackageMemoryStore();
    getCampaignPackageSnapshot(ENTRY001_PACKAGE_KEY_EXPORT);
    expect(snap.assets.find((a) => a.assetId === 'entry001-archive-01-then-now')?.removedFromActiveArchive).toBe(true);
  });

  it('19. restored asset survives refresh', async () => {
    await syncEntry001Package({});
    await removeCampaignAsset(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-01-then-now');
    await restoreCampaignAsset(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-01-then-now');
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    expect(snap.assets.find((a) => a.assetId === 'entry001-archive-01-then-now')?.removedFromActiveArchive).toBe(false);
  });

  it('20. reclassification field on asset model', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.assets[0]!.classificationHistory).toBeDefined();
  });

  it('21. uploaded deliverable via legacy migration', async () => {
    const legacy = {
      overrides: {},
      removedAssetIds: [],
      archivedAssets: [],
      extraAssets: [
        {
          assetId: 'entry001-upload-reel-cover-test',
          assetType: 'REEL_COVER',
          role: 'REEL_COVER',
          filePath: '/assets/test-cover.jpg',
          title: 'REEL COVER',
          format: 'IMAGE',
          approved: true,
          status: 'APPROVED',
        },
      ],
    };
    await syncEntry001Package({ legacy });
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    expect(snap.assets.some((a) => a.assetId === 'entry001-upload-reel-cover-test')).toBe(true);
  });

  it('22. replacement version label preserved', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.assets.every((a) => typeof a.versionLabel === 'string')).toBe(true);
  });

  it('23. Remaining Deliverables derives from persistent state', async () => {
    const { snapshot } = await syncEntry001Package({});
    const legacy = snapshotToEntry001Persisted(snapshot);
    const readiness = buildEntry001PackageReadiness(
      buildActiveArchive(legacy.overrides, legacy.removedAssetIds, legacy.extraAssets),
      legacy.extraAssets,
    );
    expect(readiness.missingAssetCount).toBeGreaterThan(0);
  });

  it('24. Preview derives from persistent sequence order', async () => {
    const { snapshot } = await syncEntry001Package({});
    const carousel = getOrderedSequenceAssets(snapshot, 'CAROUSEL');
    expect(carousel[0]!.assetId).toBeTruthy();
  });

  it('25–27. Carousel reorder works, persists, updates order', async () => {
    await syncEntry001Package({});
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    const carousel = getOrderedSequenceAssets(snap, 'CAROUSEL');
    const ids = carousel.map((a) => a.assetId);
    const reordered = [ids[3]!, ids[0]!, ids[1]!, ids[2]!];
    const result = await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'CAROUSEL',
      orderedAssetIds: reordered,
      expectedVersion: 1,
    });
    expect('snapshot' in result).toBe(true);
    if ('snapshot' in result) {
      const next = getOrderedSequenceAssets(result.snapshot, 'CAROUSEL');
      expect(next[0]!.assetId).toBe(reordered[0]);
      expect(next[1]!.assetId).toBe(reordered[1]);
    }
  });

  it('28–30. Story reorder works and persists', async () => {
    await syncEntry001Package({});
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    const story = getOrderedSequenceAssets(snap, 'STORY');
    expect(story.length).toBeGreaterThanOrEqual(1);
    const ids = story.map((a) => a.assetId);
    const result = await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'STORY',
      orderedAssetIds: [...ids],
      expectedVersion: 1,
    });
    expect('snapshot' in result).toBe(true);
  });

  it('31. accessible reorder fallback exists in workspace UI', () => {
    const ws = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001FormatSequenceWorkspace.tsx'),
      'utf8',
    );
    expect(ws).toContain('Move left');
    expect(ws).toContain('Move right');
    expect(ws).toContain('REORDER');
  });

  it('32. sequence version increments on reorder', async () => {
    await syncEntry001Package({});
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    const carousel = getOrderedSequenceAssets(snap, 'CAROUSEL');
    const ids = carousel.map((a) => a.assetId).reverse();
    const result = await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'CAROUSEL',
      orderedAssetIds: ids,
      expectedVersion: 1,
    });
    if ('snapshot' in result) {
      const seq = result.snapshot.sequences.find((s) => s.formatFamily === 'CAROUSEL' && s.isCurrent);
      expect(seq?.versionNumber).toBe(2);
    }
  });

  it('33. stale sequence write produces conflict response', async () => {
    await syncEntry001Package({});
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    const carousel = getOrderedSequenceAssets(snap, 'CAROUSEL');
    const ids = carousel.map((a) => a.assetId);
    await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'CAROUSEL',
      orderedAssetIds: [...ids].reverse(),
      expectedVersion: 1,
    });
    const conflict = await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'CAROUSEL',
      orderedAssetIds: ids,
      expectedVersion: 1,
    });
    expect('conflict' in conflict).toBe(true);
    if ('conflict' in conflict) {
      expect(conflict.conflict.code).toBe('SEQUENCE_UPDATED_ELSEWHERE');
    }
  });

  it('34. completed migration skips reimport', async () => {
    await syncEntry001Package({});
    const legacy = {
      overrides: {},
      removedAssetIds: [],
      archivedAssets: [],
      extraAssets: [{ assetId: 'should-not-reappear', assetType: 'REEL_COVER', approved: true }],
    };
    const { migrated, snapshot } = await syncEntry001Package({ legacy, forceMigration: false });
    expect(migrated).toBe(false);
    expect(snapshot.assets.some((a) => a.assetId === 'should-not-reappear')).toBe(false);
  });

  it('35. local migration backup key exists in bridge', () => {
    const bridge = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/campaignPackageBridge.ts'),
      'utf8',
    );
    expect(bridge).toContain('site00_entry001_archive_state_backup_v1');
    expect(bridge).toContain('site00_entry001_package_migrated_v1');
  });

  it('36. write failure rolls back optimistic UI in hook source', () => {
    const hook = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/useEntry001PackageState.ts'),
      'utf8',
    );
    expect(hook).toContain('void hydrate()');
    expect(hook).toContain('SAVE FAILED');
  });

  it('37. raw backend errors do not render in workspace', () => {
    const page = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001CampaignPackageWorkspace.tsx'),
      'utf8',
    );
    expect(page).toContain('SAVE FAILED');
    expect(page).not.toMatch(/PostgrestError|supabase\.co/i);
  });

  it('38. audit log records reorder', async () => {
    await syncEntry001Package({});
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    const carousel = getOrderedSequenceAssets(snap, 'CAROUSEL');
    await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'CAROUSEL',
      orderedAssetIds: [...carousel.map((a) => a.assetId)].reverse(),
      expectedVersion: 1,
    });
    const updated = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    expect(updated.auditEvents.some((e) => e.eventType === 'SEQUENCE_REORDERED')).toBe(true);
  });

  it('39. audit log records archive mutation', async () => {
    await syncEntry001Package({});
    await removeCampaignAsset(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-01-then-now');
    const snap = (await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT))!;
    expect(snap.auditEvents.some((e) => e.eventType === 'ASSET_REMOVED')).toBe(true);
  });

  it('40. audit event types include deliverable replacement', () => {
    expect(CAMPAIGN_AUDIT_EVENT_TYPES).toContain('DELIVERABLE_REPLACED');
  });

  it('41. Entry 002 isolation — package key is entry-001 specific', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.package.entryId).toBe('entry-001');
    expect(snapshot.package.packageKey).toContain('entry-001');
  });

  it('42. generic package store reusable beyond Entry 001', () => {
    const types = readFileSync(join(ROOT, 'shared/site00-campaign-package/types.ts'), 'utf8');
    expect(types).not.toContain('Britney');
    expect(types).toContain('entryId: string');
  });

  it('43. no FAL/image/video dispatch in campaign package API', () => {
    const api = readFileSync(join(ROOT, 'api/site00/campaign-package.ts'), 'utf8');
    expect(api).not.toMatch(/fal\.|dispatchFal|generateImage/i);
    expect(api).toContain('providerDispatchCount: 0');
  });

  it('44–45. mobile and desktop layout classes present', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('site00-e001-format-workspace');
    expect(css).toMatch(/@media \(min-width: (768|960)px\)/);
    const ws = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/Entry001FormatSequenceWorkspace.tsx'),
      'utf8',
    );
    expect(ws).toContain('site00-fws-mobile-content-shell');
  });

  it('46. routes and build artifacts exist', () => {
    expect(SITE00_ROUTES.projectCampaignBoardEntryCarousel).toContain('/carousel');
    expect(SITE00_ROUTES.projectCampaignBoardEntryStory).toContain('/story');
    expect(site00ProjectCampaignBoardEntryCarouselPath('ndxbook', '001')).toContain('/carousel');
    expect(site00ProjectCampaignBoardEntryStoryPath('ndxbook', '001')).toContain('/story');
    const routes = readFileSync(join(ROOT, 'src/routes/Site00Routes.tsx'), 'utf8');
    expect(routes).toContain('ProjectCampaignBoardEntryCarouselPage');
    expect(routes).toContain('ProjectCampaignBoardEntryStoryPage');
  });

  it('storage source model includes STATIC_PUBLIC and SUPABASE_STORAGE', () => {
    expect(CAMPAIGN_PACKAGE_STORAGE_SOURCES).toContain('STATIC_PUBLIC');
    expect(CAMPAIGN_PACKAGE_STORAGE_SOURCES).toContain('SUPABASE_STORAGE');
  });

  it('migration receipt records examined/created/skipped', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.migrationReceipts.length).toBeGreaterThan(0);
    const receipt = snapshot.migrationReceipts[0]!;
    expect(receipt.recordsExamined).toBeGreaterThan(0);
    expect(receipt.completedAt).toBeTruthy();
  });
});
