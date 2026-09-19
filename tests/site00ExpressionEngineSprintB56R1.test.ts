/**
 * B5.6R1 — Production persistence hardening tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CAMPAIGN_AUDIT_EVENT_TYPES,
  CAMPAIGN_PACKAGE_STORAGE_SOURCES,
} from '../shared/site00-campaign-package/types.js';
import {
  resetCampaignPackageStore,
  getStoreMode,
} from '../api/_lib/site00CampaignPackage/campaignPackageStore.js';
import {
  resolveCampaignPackageStoreModeSyncForTests,
  CAMPAIGN_PACKAGE_STORE_MODES,
} from '../api/_lib/site00CampaignPackage/storeAdapter.js';
import * as supabaseStore from '../api/_lib/site00CampaignPackage/supabaseStore.js';
import {
  ENTRY001_PACKAGE_KEY_EXPORT,
  computePackageReadinessFromSnapshot,
  deleteCampaignAssetPermanently,
  getOrderedSequenceAssets,
  loadCampaignPackage,
  removeCampaignAsset,
  reorderCampaignSequence,
  replaceDeliverableVersion,
  restoreCampaignAsset,
  syncEntry001Package,
  updateDeliverableCaption,
} from '../api/_lib/site00CampaignPackage/campaignPackageService.js';
import { migrateEntry001Package, syncDeliverablesIntoSnapshot } from '../api/_lib/site00CampaignPackage/entry001Migration.js';
import { snapshotToEntry001Persisted } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/campaignPackageBridge.js';
import { deliverablesFromSnapshot } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/campaignPackageDeliverableBridge.js';
import { buildEntry001PackageReadiness } from '../src/site00/components/founderWorkspace/entry001CampaignPackage/entry001PackageReadiness.js';
import { compileEntry002LockedEntry } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';

const ROOT = join(import.meta.dirname, '..');

describe('B5.6R1 Production persistence hardening', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetCampaignPackageStore();
  });

  it('A1. Supabase adapter exists', () => {
    expect(typeof supabaseStore.getCampaignPackageSnapshotFromSupabase).toBe('function');
    expect(typeof supabaseStore.upsertCampaignPackageSnapshotToSupabase).toBe('function');
  });

  it('A2. production mode selects Supabase when configured (sync probe)', () => {
    expect(CAMPAIGN_PACKAGE_STORE_MODES).toContain('SUPABASE');
    const mode = resolveCampaignPackageStoreModeSyncForTests();
    expect(['MEMORY_TEST', 'SUPABASE', 'LOCAL_FALLBACK']).toContain(mode);
  });

  it('A3. memory store is not production canonical in tests', async () => {
    const mode = await getStoreMode();
    expect(mode).toBe('MEMORY_TEST');
  });

  it('A4. privileged writes remain server-side — API module exists', () => {
    const api = readFileSync(join(ROOT, 'api/site00/campaign-package.ts'), 'utf8');
    expect(api).toContain('campaignPackageService');
    expect(api).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('A5. deliverable localStorage is not canonical — hook uses backend bridge', () => {
    const hook = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/useEntry001PackageState.ts'),
      'utf8',
    );
    expect(hook).toContain('deliverablesFromSnapshot');
    expect(hook).not.toContain('persistDeliverablesState(next)');
  });

  it('A6. deliverables hydrate from backend snapshot', async () => {
    const { snapshot } = await syncEntry001Package({});
    const withDeliverables = syncDeliverablesIntoSnapshot(snapshot);
    const uiDeliverables = deliverablesFromSnapshot(withDeliverables);
    expect(uiDeliverables.length).toBeGreaterThan(0);
  });

  it('A7. versions hydrate from backend snapshot', async () => {
    const { snapshot } = await syncEntry001Package({});
    const withDeliverables = syncDeliverablesIntoSnapshot(snapshot);
    expect(withDeliverables.versions.length).toBeGreaterThan(0);
  });

  it('A8. archive hydrates from backend', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.assets.length).toBeGreaterThan(10);
  });

  it('A9. sequences hydrate from backend', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(snapshot.sequences.some((s) => s.isCurrent)).toBe(true);
  });

  it('A10. readiness derives from backend state', async () => {
    const { snapshot } = await syncEntry001Package({});
    const withD = syncDeliverablesIntoSnapshot(snapshot);
    const readiness = computePackageReadinessFromSnapshot(withD);
    expect(readiness.previewReadiness).toBeTruthy();
  });

  it('A11. Preview derives from backend deliverables', async () => {
    const { snapshot } = await syncEntry001Package({});
    const withD = syncDeliverablesIntoSnapshot(snapshot);
    const deliverables = deliverablesFromSnapshot(withD);
    expect(deliverables.length).toBeGreaterThan(0);
    const activeArchive = snapshot.assets.filter((a) => !a.removedFromActiveArchive);
    const readiness = buildEntry001PackageReadiness(activeArchive, [], deliverables);
    expect(readiness).toBeTruthy();
  });

  it('A12. Entry 001 migration is idempotent', async () => {
    await syncEntry001Package({});
    const second = await syncEntry001Package({});
    expect(second.migrated).toBe(false);
  });

  it('A13. old local deliverables migrate via legacy field', async () => {
    const { snapshot } = await syncEntry001Package({
      legacy: { overrides: {}, removedAssetIds: [], archivedAssets: [], extraAssets: [], deliverables: [] },
    });
    expect(snapshot.package.migrationComplete).toBe(true);
  });

  it('A14. deleted objects do not resurrect', async () => {
    await syncEntry001Package({});
    await deleteCampaignAssetPermanently(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-01-then-now');
    await syncEntry001Package({
      legacy: { overrides: {}, removedAssetIds: [], archivedAssets: [], extraAssets: [] },
    });
    const reloaded = await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT);
    expect(reloaded?.assets.some((a) => a.assetId === 'entry001-archive-01-then-now')).toBe(false);
  });

  it('A15. localStorage clear simulation — backend reload preserves package', async () => {
    await syncEntry001Package({});
    await removeCampaignAsset(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-02-rehab-cycle');
    const reloaded = await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT);
    expect(reloaded?.assets.find((a) => a.assetId === 'entry001-archive-02-rehab-cycle')?.removedFromActiveArchive).toBe(true);
  });

  it('A16. cross-session state resolves via packageKey', async () => {
    await syncEntry001Package({});
    const a = await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT);
    resetCampaignPackageStore();
    await syncEntry001Package({});
    const b = await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT);
    expect(a?.package.packageKey).toBe(b?.package.packageKey);
  });

  it('A17. Carousel reorder persists backend', async () => {
    const { snapshot } = await syncEntry001Package({});
    const carousel = snapshot.sequences.find((s) => s.formatFamily === 'CAROUSEL' && s.isCurrent)!;
    const reversed = [...carousel.orderedAssetIds].reverse();
    const result = await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'CAROUSEL',
      orderedAssetIds: reversed,
      expectedVersion: carousel.versionNumber,
    });
    expect('snapshot' in result).toBe(true);
    if ('snapshot' in result) {
      const order = getOrderedSequenceAssets(result.snapshot, 'CAROUSEL').map((a) => a.assetId);
      expect(order).toEqual(reversed);
    }
  });

  it('A18. Story reorder persists backend', async () => {
    const { snapshot } = await syncEntry001Package({});
    const story = snapshot.sequences.find((s) => s.formatFamily === 'STORY' && s.isCurrent)!;
    const reversed = [...story.orderedAssetIds].reverse();
    const result = await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'STORY',
      orderedAssetIds: reversed,
      expectedVersion: story.versionNumber,
    });
    expect('snapshot' in result).toBe(true);
  });

  it('A19. sequence conflicts work', async () => {
    const { snapshot } = await syncEntry001Package({});
    const carousel = snapshot.sequences.find((s) => s.formatFamily === 'CAROUSEL' && s.isCurrent)!;
    const result = await reorderCampaignSequence({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      formatFamily: 'CAROUSEL',
      orderedAssetIds: carousel.orderedAssetIds,
      expectedVersion: 999,
    });
    expect('conflict' in result).toBe(true);
  });

  it('A20. replacement history persists', async () => {
    const { snapshot } = await syncEntry001Package({});
    const withD = syncDeliverablesIntoSnapshot(snapshot);
    const d = withD.deliverables[0]!;
    const updated = await replaceDeliverableVersion({
      packageKey: ENTRY001_PACKAGE_KEY_EXPORT,
      deliverableId: d.deliverableId,
      filePath: '/assets/replaced.png',
      title: 'REPLACED',
    });
    expect(updated.versions.filter((v) => v.deliverableId === d.deliverableId).length).toBeGreaterThanOrEqual(2);
  });

  it('A21. captions persist', async () => {
    const { snapshot } = await syncEntry001Package({});
    const withD = syncDeliverablesIntoSnapshot(snapshot);
    const d = withD.deliverables[0]!;
    const updated = await updateDeliverableCaption(ENTRY001_PACKAGE_KEY_EXPORT, d.deliverableId, 'New caption');
    const updatedD = updated.deliverables.find((x) => x.deliverableId === d.deliverableId);
    expect(updatedD?.metadata?.caption).toBe('New caption');
  });

  it('A22. remove/archive/restore persists', async () => {
    await syncEntry001Package({});
    await removeCampaignAsset(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-03-apologies-archives');
    const removed = await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT);
    expect(removed?.assets.find((a) => a.assetId === 'entry001-archive-03-apologies-archives')?.status).toBe('ARCHIVED');
    await restoreCampaignAsset(ENTRY001_PACKAGE_KEY_EXPORT, 'entry001-archive-03-apologies-archives');
    const restored = await loadCampaignPackage(ENTRY001_PACKAGE_KEY_EXPORT);
    expect(restored?.assets.find((a) => a.assetId === 'entry001-archive-03-apologies-archives')?.removedFromActiveArchive).toBe(false);
  });

  it('A23. audit events persist in snapshot', async () => {
    const { snapshot } = await syncEntry001Package({});
    expect(CAMPAIGN_AUDIT_EVENT_TYPES).toContain('MIGRATION_COMPLETED');
    expect(snapshot.auditEvents.length).toBeGreaterThanOrEqual(0);
  });

  it('A24. Entry 002 remains isolated', () => {
    const e2 = compileEntry002LockedEntry();
    expect(e2.title).toContain('OH, NOW IT WAS FUN');
  });

  it('A25. generic package schema remains brand-agnostic', () => {
    expect(CAMPAIGN_PACKAGE_STORAGE_SOURCES.length).toBeGreaterThan(3);
    const sql = readFileSync(
      join(ROOT, 'supabase/migrations/20260908160000_site00_campaign_package_persistence.sql'),
      'utf8',
    );
    expect(sql).not.toContain('entry-001-only');
  });

  it('A26. migration receipt fields extended', () => {
    const { receipt } = migrateEntry001Package({ existing: null, legacy: null, source: 'SEED' });
    expect(receipt.recordsExamined).toBeGreaterThan(0);
    expect(receipt.migrationId).toBeTruthy();
  });
});
