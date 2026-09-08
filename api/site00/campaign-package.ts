/**
 * B5.6R1 — Campaign package persistence API.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  ENTRY001_PACKAGE_KEY_EXPORT,
  computePackageReadinessFromSnapshot,
  getOrderedSequenceAssets,
  loadCampaignPackage,
  removeCampaignAsset,
  reorderCampaignSequence,
  restoreCampaignAsset,
  syncEntry001Package,
  updateCampaignAsset,
  updateCampaignDeliverable,
  replaceDeliverableVersion,
  updateDeliverableCaption,
  deleteCampaignAssetPermanently,
} from '../_lib/site00CampaignPackage/campaignPackageService.js';
import { getStoreMode, resetCampaignPackageStore } from '../_lib/site00CampaignPackage/campaignPackageStore.js';
import type { LegacyEntry001LocalState } from '../../shared/site00-campaign-package/types.js';
import { snapshotToEntry001Persisted } from '../../src/site00/components/founderWorkspace/entry001CampaignPackage/campaignPackageBridge.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (process.env.VITEST === 'true' && req.query.reset === '1') {
    resetCampaignPackageStore();
  }

  const action = String(req.query.action ?? req.body?.action ?? 'get');
  const packageKey = String(req.query.packageKey ?? req.body?.packageKey ?? ENTRY001_PACKAGE_KEY_EXPORT);
  const storeMode = await getStoreMode();

  try {
    if (req.method === 'GET' && action === 'get') {
      let snapshot = await loadCampaignPackage(packageKey);
      if (!snapshot && packageKey === ENTRY001_PACKAGE_KEY_EXPORT) {
        const synced = await syncEntry001Package({});
        snapshot = synced.snapshot;
      }
      if (!snapshot) return res.status(404).json({ error: 'Package not found' });
      const readiness = computePackageReadinessFromSnapshot(snapshot);
      snapshot = {
        ...snapshot,
        package: {
          ...snapshot.package,
          previewReadiness: readiness.previewReadiness,
          campaignBoardEligibility: readiness.campaignBoardEligibility,
        },
      };
      return res.status(200).json({
        ok: true,
        storeMode,
        snapshot,
        legacy: snapshotToEntry001Persisted(snapshot),
        deliverables: snapshot.deliverables,
        versions: snapshot.versions,
        carouselAssets: getOrderedSequenceAssets(snapshot, 'CAROUSEL'),
        storyAssets: getOrderedSequenceAssets(snapshot, 'STORY'),
        providerDispatchCount: 0,
      });
    }

    if (req.method === 'GET' && action === 'store_mode') {
      return res.status(200).json({ ok: true, storeMode });
    }

    if (req.method === 'POST' && action === 'migrate') {
      const legacy = req.body?.legacy as LegacyEntry001LocalState | undefined;
      const { snapshot, migrated } = await syncEntry001Package({ legacy: legacy ?? null, forceMigration: Boolean(req.body?.force) });
      return res.status(200).json({
        ok: true,
        storeMode,
        migrated,
        snapshot,
        legacy: snapshotToEntry001Persisted(snapshot),
        deliverables: snapshot.deliverables,
        versions: snapshot.versions,
        receipt: snapshot.migrationReceipts[snapshot.migrationReceipts.length - 1] ?? null,
        providerDispatchCount: 0,
      });
    }

    if (req.method === 'POST' && action === 'remove_asset') {
      const assetId = String(req.body?.assetId ?? '');
      if (!assetId) return res.status(400).json({ error: 'assetId required' });
      const snapshot = await removeCampaignAsset(packageKey, assetId);
      return res.status(200).json({ ok: true, storeMode, snapshot, legacy: snapshotToEntry001Persisted(snapshot) });
    }

    if (req.method === 'POST' && action === 'restore_asset') {
      const assetId = String(req.body?.assetId ?? '');
      if (!assetId) return res.status(400).json({ error: 'assetId required' });
      const snapshot = await restoreCampaignAsset(packageKey, assetId);
      return res.status(200).json({ ok: true, storeMode, snapshot, legacy: snapshotToEntry001Persisted(snapshot) });
    }

    if (req.method === 'POST' && action === 'delete_asset_permanent') {
      const assetId = String(req.body?.assetId ?? '');
      if (!assetId) return res.status(400).json({ error: 'assetId required' });
      const snapshot = await deleteCampaignAssetPermanently(packageKey, assetId);
      return res.status(200).json({ ok: true, storeMode, snapshot, legacy: snapshotToEntry001Persisted(snapshot) });
    }

    if (req.method === 'POST' && action === 'reclassify_asset') {
      const assetId = String(req.body?.assetId ?? '');
      const patch = req.body?.patch ?? {};
      if (!assetId) return res.status(400).json({ error: 'assetId required' });
      const snapshot = await updateCampaignAsset(packageKey, assetId, patch);
      return res.status(200).json({ ok: true, storeMode, snapshot, legacy: snapshotToEntry001Persisted(snapshot) });
    }

    if (req.method === 'POST' && action === 'update_deliverable') {
      const deliverableId = String(req.body?.deliverableId ?? '');
      const patch = req.body?.patch ?? {};
      if (!deliverableId) return res.status(400).json({ error: 'deliverableId required' });
      const snapshot = await updateCampaignDeliverable(packageKey, deliverableId, patch);
      return res.status(200).json({ ok: true, storeMode, snapshot, deliverables: snapshot.deliverables });
    }

    if (req.method === 'POST' && action === 'replace_deliverable') {
      const deliverableId = String(req.body?.deliverableId ?? '');
      const filePath = String(req.body?.filePath ?? '');
      const title = String(req.body?.title ?? '');
      if (!deliverableId || !filePath) return res.status(400).json({ error: 'deliverableId and filePath required' });
      const snapshot = await replaceDeliverableVersion({ packageKey, deliverableId, filePath, title, caption: req.body?.caption });
      return res.status(200).json({ ok: true, storeMode, snapshot, versions: snapshot.versions });
    }

    if (req.method === 'POST' && action === 'update_caption') {
      const deliverableId = String(req.body?.deliverableId ?? '');
      const caption = String(req.body?.caption ?? '');
      if (!deliverableId) return res.status(400).json({ error: 'deliverableId required' });
      const snapshot = await updateDeliverableCaption(packageKey, deliverableId, caption);
      return res.status(200).json({ ok: true, storeMode, snapshot });
    }

    if (req.method === 'POST' && action === 'reorder_sequence') {
      const formatFamily = req.body?.formatFamily as 'CAROUSEL' | 'STORY';
      const orderedAssetIds = req.body?.orderedAssetIds as string[];
      const expectedVersion = Number(req.body?.expectedVersion ?? 0);
      if (!formatFamily || !Array.isArray(orderedAssetIds)) {
        return res.status(400).json({ error: 'formatFamily and orderedAssetIds required' });
      }
      const result = await reorderCampaignSequence({
        packageKey,
        formatFamily,
        orderedAssetIds,
        expectedVersion,
      });
      if ('conflict' in result) {
        return res.status(409).json({
          ok: false,
          error: 'SAVE FAILED',
          founderMessage: 'Your change could not be saved.',
          conflict: result.conflict,
        });
      }
      return res.status(200).json({
        ok: true,
        storeMode,
        snapshot: result.snapshot,
        legacy: snapshotToEntry001Persisted(result.snapshot),
        carouselAssets: getOrderedSequenceAssets(result.snapshot, 'CAROUSEL'),
        storyAssets: getOrderedSequenceAssets(result.snapshot, 'STORY'),
      });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('[campaign-package]', err);
    return res.status(500).json({
      ok: false,
      error: 'SAVE FAILED',
      founderMessage: 'Your change could not be saved.',
    });
  }
}
