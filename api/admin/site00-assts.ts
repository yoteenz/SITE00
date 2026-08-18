import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getActiveAsstsEnvBatchKey } from '../_lib/site00Assts/manifests.js';
import {
  ensureBootstrapBatch,
  enrichAsset,
  enrichBatch,
  ensureAutoGenerationPipeline,
  getAssetById,
  getBatchById,
  getBatchByKey,
  getLibraryCategoryCounts,
  getLibrarySummary,
  getNextNeedsReviewAssetInBatch,
  getAssetBatchNavigation,
  listFilteredLibraryAssets,
  listReviewEvents,
  recordReviewEvent,
  recomputeBatchStatus,
  resetBatchForReview,
} from '../_lib/site00Assts/service.js';
import { getCanonicalMasterReviewContext } from '../_lib/site00Assts/canonicalMaster.js';
import { runBatchGeneration, pollPendingGenerationJobs, queueRegeneration } from '../_lib/site00Assts/generation.js';
import { lockBatchAndPromoteSlots, resolveProductionAsset } from '../_lib/site00Assts/slots.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { getLoaderPipelineContext } from '../_lib/site00Assts/postProcess/loaderGeometry.js';
import {
  approveLoaderDerivative,
  pollLoaderPostProcessJob,
  pollPendingLoaderPostProcessJobs,
  promoteLoaderProductionSlot,
  rejectLoaderDerivative,
  submitLoaderBackgroundRemoval,
} from '../_lib/site00Assts/postProcess/pipeline.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      const o = JSON.parse(req.body) as unknown;
      if (o && typeof o === 'object' && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * SITE 00 ASSTS Asset Vault API (admin-only)
 *
 * GET ?action=library|batch|asset|slots|history|poll|loader-pipeline
 * POST action=bootstrap|generate|approve|reject|regenerate|variant|note|lock|post-process-loader|...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ error, code });
  }

  const action = String(req.query.action ?? '').trim();

  try {
    if (req.method === 'GET') {
      if (action === 'library') {
        const activeBatchKey = getActiveAsstsEnvBatchKey();
        const pipeline = await ensureAutoGenerationPipeline(activeBatchKey);
        const summary = await getLibrarySummary();
        const categories = await getLibraryCategoryCounts();
        const status = String(req.query.status ?? '').trim();
        const category = String(req.query.category ?? '').trim();
        const view = String(req.query.view ?? '').trim();
        let filteredAssets: Awaited<ReturnType<typeof listFilteredLibraryAssets>> | null = null;
        if (status || category || view === 'all') {
          filteredAssets = await listFilteredLibraryAssets({
            status: status || undefined,
            category: category || undefined,
          });
        }
        const priorityBatch = summary.batchesList.find((b) => b.batch_key === activeBatchKey);
        let priority = null;
        if (priorityBatch) {
          const full = await getBatchById(priorityBatch.id);
          if (full) priority = await enrichBatch(full);
        }
        return res.status(200).json({ ok: true, summary, categories, priorityBatch: priority, pipeline, filteredAssets });
      }

      if (action === 'assets') {
        const status = String(req.query.status ?? '').trim();
        const category = String(req.query.category ?? '').trim();
        const assets = await listFilteredLibraryAssets({
          status: status || undefined,
          category: category || undefined,
        });
        return res.status(200).json({ ok: true, assets });
      }

      if (action === 'batch') {
        const batchId = String(req.query.batchId ?? '').trim();
        const batchKey = String(req.query.batchKey ?? '').trim();
        const batch = batchId ? await getBatchById(batchId) : batchKey ? await getBatchByKey(batchKey) : null;
        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        await pollPendingGenerationJobs(6);
        return res.status(200).json({ ok: true, batch: await enrichBatch(batch) });
      }

      if (action === 'asset') {
        const assetId = String(req.query.assetId ?? '').trim();
        if (!assetId) return res.status(400).json({ error: 'assetId required' });
        const asset = await getAssetById(assetId);
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        await pollPendingGenerationJobs(3);
        const history = await listReviewEvents(assetId);
        const enriched = await enrichAsset(asset);
        const navigation = asset.batch_id
          ? await getAssetBatchNavigation(assetId, asset.batch_id)
          : { prevAssetId: null, nextAssetId: null, position: 0, total: 0 };
        const canonicalMaster = enriched.canonicalMaster ?? null;
        return res.status(200).json({
          ok: true,
          asset: enriched,
          history,
          navigation: {
            prevAssetId: navigation.prevAssetId ?? null,
            nextAssetId: navigation.nextAssetId ?? null,
            position: navigation.position ?? 0,
            total: navigation.total ?? 0,
          },
          canonicalMaster,
        });
      }

      if (action === 'slots') {
        const slotKey = String(req.query.slotKey ?? '').trim();
        if (!slotKey) return res.status(400).json({ error: 'slotKey required' });
        const resolved = await resolveProductionAsset(slotKey);
        return res.status(200).json({ ok: true, resolved });
      }

      if (action === 'poll') {
        const genCompleted = await pollPendingGenerationJobs(10);
        const postCompleted = await pollPendingLoaderPostProcessJobs(3);
        return res.status(200).json({ ok: true, completed: genCompleted, postProcessCompleted: postCompleted });
      }

      if (action === 'loader-pipeline') {
        await pollPendingLoaderPostProcessJobs(2);
        const context = await getLoaderPipelineContext();
        return res.status(200).json({ ok: true, ...context });
      }

      return res.status(400).json({ error: 'Unknown GET action' });
    }

    if (req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const postAction = String(body.action ?? action ?? '').trim();

      if (postAction === 'bootstrap') {
        const batchKey = String(body.batchKey ?? getActiveAsstsEnvBatchKey());
        const manifest = (await import('../_lib/site00Assts/manifests.js')).getBatchManifestByKey(batchKey);
        if (manifest?.useCanonicalReference) {
          await (await import('../_lib/site00Assts/canonicalMaster.js')).ensureCanonicalMasterRegistered();
        }
        const batch = await ensureBootstrapBatch(batchKey);
        const canonicalMaster = manifest?.useCanonicalReference ? await getCanonicalMasterReviewContext() : null;
        return res.status(200).json({ ok: true, batch, canonicalMaster });
      }

      if (postAction === 'generate') {
        const batchKey = String(body.batchKey ?? getActiveAsstsEnvBatchKey());
        await ensureBootstrapBatch(batchKey);
        const result = await runBatchGeneration(batchKey);
        return res.status(200).json({ ok: true, ...result });
      }

      if (postAction === 'approve') {
        const assetId = String(body.assetId ?? '').trim();
        const versionId = String(body.versionId ?? '').trim();
        if (!assetId || !versionId) return res.status(400).json({ error: 'assetId and versionId required' });

        const supabase = getSupabaseAdmin();
        await supabase
          .from('site00_asset_versions')
          .update({ status: 'APPROVED' })
          .eq('id', versionId);
        const asset = await getAssetById(assetId);
        await supabase
          .from('site00_logical_assets')
          .update({
            status: 'APPROVED',
            approved_version_id: versionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', assetId);

        await recordReviewEvent({ assetId, assetVersionId: versionId, batchId: asset?.batch_id, action: 'APPROVE' });
        if (asset?.batch_id) await recomputeBatchStatus(asset.batch_id);

        const next = asset?.batch_id ? await getNextNeedsReviewAssetInBatch(asset.batch_id, assetId) : null;
        return res.status(200).json({ ok: true, nextAssetId: next?.id ?? null });
      }

      if (postAction === 'reject') {
        const assetId = String(body.assetId ?? '').trim();
        const versionId = String(body.versionId ?? '').trim();
        const note = String(body.note ?? '').trim() || null;
        const categories = Array.isArray(body.categories) ? body.categories.map(String) : [];
        if (!assetId || !versionId) return res.status(400).json({ error: 'assetId and versionId required' });

        const supabase = getSupabaseAdmin();
        await supabase.from('site00_asset_versions').update({ status: 'REJECTED' }).eq('id', versionId);
        const asset = await getAssetById(assetId);
        await supabase
          .from('site00_logical_assets')
          .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
          .eq('id', assetId);

        await recordReviewEvent({
          assetId,
          assetVersionId: versionId,
          batchId: asset?.batch_id,
          action: 'REJECT',
          note,
          correctionCategories: categories,
        });
        if (asset?.batch_id) await recomputeBatchStatus(asset.batch_id);
        return res.status(200).json({ ok: true });
      }

      if (postAction === 'regenerate') {
        const assetId = String(body.assetId ?? '').trim();
        const note = String(body.note ?? '').trim();
        const categories = Array.isArray(body.categories) ? body.categories.map(String) : ['OTHER'];
        if (!assetId) return res.status(400).json({ error: 'assetId required' });
        const result = await queueRegeneration(assetId, { categories, note });
        return res.status(200).json({ ok: true, ...result });
      }

      if (postAction === 'variant') {
        const assetId = String(body.assetId ?? '').trim();
        const note = String(body.note ?? '').trim() || null;
        if (!assetId) return res.status(400).json({ error: 'assetId required' });
        const asset = await getAssetById(assetId);
        await getSupabaseAdmin().from('site00_logical_assets').update({ status: 'VARIANT_REQUESTED' }).eq('id', assetId);
        await recordReviewEvent({ assetId, batchId: asset?.batch_id, action: 'REQUEST_VARIANT', note });
        return res.status(200).json({ ok: true, message: 'Variant request recorded — queue regeneration separately when ready' });
      }

      if (postAction === 'note') {
        const assetId = String(body.assetId ?? '').trim();
        const note = String(body.note ?? '').trim();
        if (!assetId || !note) return res.status(400).json({ error: 'assetId and note required' });
        const asset = await getAssetById(assetId);
        await recordReviewEvent({ assetId, batchId: asset?.batch_id, action: 'NOTE', note });
        return res.status(200).json({ ok: true });
      }

      if (postAction === 'lock') {
        const batchId = String(body.batchId ?? '').trim();
        if (!batchId) return res.status(400).json({ error: 'batchId required' });
        await pollPendingGenerationJobs(10);
        await recomputeBatchStatus(batchId);
        const result = await lockBatchAndPromoteSlots(batchId);
        if (!result.ok) return res.status(400).json(result);
        return res.status(200).json(result);
      }

      if (postAction === 'reset-review') {
        const batchId = String(body.batchId ?? '').trim();
        if (!batchId) return res.status(400).json({ error: 'batchId required' });
        await resetBatchForReview(batchId);
        await recomputeBatchStatus(batchId);
        const batch = await getBatchById(batchId);
        return res.status(200).json({ ok: true, batch });
      }

      if (postAction === 'post-process-loader' || postAction === 'reprocess-loader') {
        const modelId = String(body.modelId ?? 'bria/video/background-removal/v3').trim();
        const processorSettings =
          body.processorSettings && typeof body.processorSettings === 'object'
            ? (body.processorSettings as Record<string, unknown>)
            : undefined;
        const jobKey = String(body.jobKey ?? 'POST-ASSET-LOADER-001').trim();
        const result = await submitLoaderBackgroundRemoval({ modelId, jobKey, processorSettings });
        return res.status(200).json({ ok: true, ...result, context: await getLoaderPipelineContext() });
      }

      if (postAction === 'poll-post-process') {
        const jobId = String(body.jobId ?? '').trim();
        if (!jobId) return res.status(400).json({ error: 'jobId required' });
        const result = await pollLoaderPostProcessJob(jobId);
        return res.status(200).json({ ok: true, ...result, context: await getLoaderPipelineContext() });
      }

      if (postAction === 'approve-loader-derivative') {
        const versionId = String(body.versionId ?? '').trim();
        if (!versionId) return res.status(400).json({ error: 'versionId required' });
        await approveLoaderDerivative(versionId);
        return res.status(200).json({ ok: true, context: await getLoaderPipelineContext() });
      }

      if (postAction === 'reject-loader-derivative') {
        const versionId = String(body.versionId ?? '').trim();
        const note = String(body.note ?? '').trim() || undefined;
        if (!versionId) return res.status(400).json({ error: 'versionId required' });
        await rejectLoaderDerivative(versionId, note);
        return res.status(200).json({ ok: true, context: await getLoaderPipelineContext() });
      }

      if (postAction === 'lock-loader-derivative') {
        const versionId = String(body.versionId ?? '').trim();
        if (!versionId) return res.status(400).json({ error: 'versionId required' });
        const promoted = await promoteLoaderProductionSlot(versionId);
        return res.status(200).json({ ok: true, promoted, context: await getLoaderPipelineContext() });
      }

      return res.status(400).json({ error: 'Unknown POST action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ error: message });
  }
}
