import { getSupabaseAdmin } from '../supabase.js';
import type { AssetStatus, BatchStatus } from './types.js';
import { ACTIVE_ASSTS_ENV_BATCH_KEY, BATCH_ASSTS_ENV_001, getBatchManifestByKey } from './manifests.js';
import { ensureCanonicalMasterRegistered, getCanonicalMasterReviewContext } from './canonicalMaster.js';

export type DbBatch = {
  id: string;
  batch_key: string;
  display_name: string;
  description: string | null;
  category: string | null;
  status: BatchStatus;
  total_assets: number;
  required_assets: number;
  manifest: unknown;
  created_at: string;
  completed_at: string | null;
  locked_at: string | null;
};

export type DbAsset = {
  id: string;
  asset_key: string;
  display_name: string;
  asset_type: string;
  category: string | null;
  batch_id: string | null;
  semantic_slot_key: string | null;
  current_version_id: string | null;
  approved_version_id: string | null;
  production_version_id: string | null;
  status: AssetStatus;
  required: boolean;
  created_at: string;
  updated_at: string;
  locked_at: string | null;
};

export type DbVersion = {
  id: string;
  asset_id: string;
  version_number: number;
  file_path: string | null;
  thumbnail_path: string | null;
  preview_path: string | null;
  generation_provider: string | null;
  generation_model: string | null;
  prompt_version: string | null;
  prompt_snapshot: string | null;
  generation_parameters?: Record<string, unknown> | null;
  canonical_master_version_id?: string | null;
  status: AssetStatus;
  created_at: string;
};

function supabase() {
  return getSupabaseAdmin();
}

export async function ensureBootstrapBatch(batchKey = ACTIVE_ASSTS_ENV_BATCH_KEY): Promise<DbBatch> {
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest) throw new Error(`Unknown batch manifest: ${batchKey}`);

  if (manifest.useCanonicalReference) {
    await ensureCanonicalMasterRegistered();
  }

  let batch: DbBatch | null = null;
  const { data: existing } = await supabase()
    .from('site00_batches')
    .select('*')
    .eq('batch_key', batchKey)
    .maybeSingle();

  if (existing) {
    batch = existing as DbBatch;
  } else {
    const { data: created, error: batchErr } = await supabase()
      .from('site00_batches')
      .insert({
        batch_key: manifest.batchKey,
        display_name: manifest.displayName,
        description: manifest.description ?? null,
        category: manifest.category,
        status: 'DRAFT',
        total_assets: manifest.assets.length,
        required_assets: manifest.assets.filter((a) => a.required).length,
        manifest,
      })
      .select('*')
      .single();
    if (batchErr) throw new Error(batchErr.message);
    batch = created as DbBatch;
  }

  for (const asset of manifest.assets) {
    const { data: existingAsset } = await supabase()
      .from('site00_logical_assets')
      .select('id')
      .eq('asset_key', asset.assetKey)
      .maybeSingle();

    if (existingAsset) {
      if (manifest.replacementBatch) {
        await supabase()
          .from('site00_logical_assets')
          .update({
            batch_id: batch.id,
            semantic_slot_key: asset.semanticSlotKey,
            display_name: asset.displayName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAsset.id);
      }
      continue;
    }

    await supabase().from('site00_logical_assets').insert({
      asset_key: asset.assetKey,
      display_name: asset.displayName,
      asset_type: 'environment',
      category: manifest.category,
      batch_id: batch.id,
      semantic_slot_key: asset.semanticSlotKey,
      status: 'QUEUED',
      required: asset.required,
    });
  }

  return batch;
}

export async function getBatchByKey(batchKey: string): Promise<DbBatch | null> {
  const { data } = await supabase().from('site00_batches').select('*').eq('batch_key', batchKey).maybeSingle();
  return (data as DbBatch) ?? null;
}

export async function getBatchById(batchId: string): Promise<DbBatch | null> {
  const { data } = await supabase().from('site00_batches').select('*').eq('id', batchId).maybeSingle();
  return (data as DbBatch) ?? null;
}

export async function listAssetsForBatch(batchId: string): Promise<DbAsset[]> {
  const { data, error } = await supabase()
    .from('site00_logical_assets')
    .select('*')
    .eq('batch_id', batchId)
    .order('asset_key');
  if (error) throw new Error(error.message);
  return (data ?? []) as DbAsset[];
}

export async function getAssetById(assetId: string): Promise<DbAsset | null> {
  const { data } = await supabase().from('site00_logical_assets').select('*').eq('id', assetId).maybeSingle();
  return (data as DbAsset) ?? null;
}

export async function getAssetByKey(assetKey: string): Promise<DbAsset | null> {
  const { data } = await supabase().from('site00_logical_assets').select('*').eq('asset_key', assetKey).maybeSingle();
  return (data as DbAsset) ?? null;
}

export async function getVersionById(versionId: string): Promise<DbVersion | null> {
  const { data } = await supabase().from('site00_asset_versions').select('*').eq('id', versionId).maybeSingle();
  return (data as DbVersion) ?? null;
}

export async function getVersionsForAsset(assetId: string): Promise<DbVersion[]> {
  const { data, error } = await supabase()
    .from('site00_asset_versions')
    .select('*')
    .eq('asset_id', assetId)
    .order('version_number', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbVersion[];
}

export async function getCurrentVersionForAsset(asset: DbAsset): Promise<DbVersion | null> {
  if (!asset.current_version_id) return null;
  return getVersionById(asset.current_version_id);
}

export async function listReviewEvents(assetId: string) {
  const { data } = await supabase()
    .from('site00_review_events')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function recordReviewEvent(input: {
  assetId: string;
  assetVersionId?: string | null;
  batchId?: string | null;
  action: string;
  note?: string | null;
  correctionCategories?: string[] | null;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabase().from('site00_review_events').insert({
    asset_id: input.assetId,
    asset_version_id: input.assetVersionId ?? null,
    batch_id: input.batchId ?? null,
    action: input.action,
    note: input.note ?? null,
    correction_categories: input.correctionCategories ?? null,
    metadata: input.metadata ?? null,
  });
  if (error) throw new Error(error.message);
}

type EnrichedAssetPreview = {
  status: string;
  approved_version_id: string | null;
  currentVersion: { previewUrl: string | null } | null;
  versions: Array<{ id: string; previewUrl: string | null; status: string }>;
};

export function pickRepresentativePreview(assets: EnrichedAssetPreview[]): string | null {
  for (const a of assets) {
    if (a.approved_version_id) {
      const v = a.versions.find((ver) => ver.id === a.approved_version_id);
      if (v?.previewUrl) return v.previewUrl;
    }
  }
  for (const a of assets) {
    if (a.status === 'NEEDS_REVIEW' && a.currentVersion?.previewUrl) return a.currentVersion.previewUrl;
  }
  for (const a of assets) {
    if (a.currentVersion?.previewUrl) return a.currentVersion.previewUrl;
  }
  for (const a of assets) {
    for (const v of a.versions) {
      if (v.previewUrl) return v.previewUrl;
    }
  }
  return null;
}

export async function summarizeBatchForLibrary(batch: DbBatch) {
  const assets = await listAssetsForBatch(batch.id);
  const enriched = await Promise.all(assets.map((a) => enrichAsset(a)));
  const needsReview = assets.filter((a) => a.status === 'NEEDS_REVIEW').length;
  const approved = assets.filter((a) => a.approved_version_id != null).length;
  return {
    id: batch.id,
    batch_key: batch.batch_key,
    display_name: batch.display_name,
    status: batch.status,
    category: batch.category,
    counts: { total: assets.length, approved, needsReview },
    thumbnailUrl: pickRepresentativePreview(enriched),
  };
}

export async function getLibrarySummary() {
  const { data: assets } = await supabase().from('site00_logical_assets').select('id, status, required, asset_type');
  const rows = assets ?? [];
  const { data: batches } = await supabase().from('site00_batches').select('*').order('created_at', { ascending: false });

  const needsReview = rows.filter((a) => a.status === 'NEEDS_REVIEW').length;
  const approved = rows.filter((a) => a.status === 'APPROVED' || a.status === 'LOCKED').length;
  const locked = rows.filter((a) => a.status === 'LOCKED').length;

  const batchesList = await Promise.all((batches ?? []).map((b) => summarizeBatchForLibrary(b as DbBatch)));

  return {
    totalAssets: rows.length,
    batches: batches?.length ?? 0,
    needsReview,
    approved,
    locked,
    batchesList,
  };
}

const LIBRARY_CATEGORY_DEFS = [
  { id: 'environments', label: '01 ENVIRONMENTS', assetTypes: ['environment'] },
  { id: 'objects', label: '02 OBJECTS', assetTypes: ['object'] },
  { id: 'ui', label: '03 UI / GRAPHICS', assetTypes: ['ui', 'graphic'] },
  { id: 'brand', label: '04 BRAND SYSTEMS', assetTypes: ['brand'] },
  { id: 'project', label: '05 PROJECT ASSETS', assetTypes: ['project'] },
] as const;

export async function getLibraryCategoryCounts(): Promise<
  Array<{ id: string; label: string; count: number; coverUrl: string | null }>
> {
  const { data: assets } = await supabase().from('site00_logical_assets').select('*');
  const rows = (assets ?? []) as DbAsset[];
  const results = [];
  for (const cat of LIBRARY_CATEGORY_DEFS) {
    const inCat = rows.filter((a) => (cat.assetTypes as readonly string[]).includes(a.asset_type ?? 'environment'));
    let coverUrl: string | null = null;
    const approvedFirst = inCat.find((a) => a.approved_version_id || a.status === 'APPROVED' || a.status === 'LOCKED');
    const pick = approvedFirst ?? inCat.find((a) => a.current_version_id) ?? inCat[0];
    if (pick) {
      const enriched = await enrichAsset(pick);
      coverUrl = pickRepresentativePreview([enriched]);
    }
    results.push({
      id: cat.id,
      label: cat.label,
      count: inCat.length,
      coverUrl,
    });
  }
  return results;
}

export async function listFilteredLibraryAssets(filters: { status?: string; category?: string }) {
  let rows: DbAsset[] = [];
  const { data, error } = await supabase().from('site00_logical_assets').select('*').order('asset_key');
  if (error) throw new Error(error.message);
  rows = (data ?? []) as DbAsset[];

  if (filters.status === 'needs-review') {
    rows = rows.filter((a) => a.status === 'NEEDS_REVIEW');
  } else if (filters.status === 'approved') {
    rows = rows.filter((a) => a.status === 'APPROVED' || a.status === 'LOCKED');
  }

  if (filters.category) {
    const catDef = LIBRARY_CATEGORY_DEFS.find((c) => c.id === filters.category);
    if (catDef) {
      rows = rows.filter((a) => (catDef.assetTypes as readonly string[]).includes(a.asset_type ?? 'environment'));
    }
  }

  return Promise.all(rows.map((a) => enrichAsset(a)));
}

export async function getAssetBatchNavigation(assetId: string, batchId: string) {
  const assets = await listAssetsForBatch(batchId);
  const idx = assets.findIndex((a) => a.id === assetId);
  if (idx < 0) {
    return { prevAssetId: null, nextAssetId: null, position: 0, total: assets.length };
  }
  return {
    prevAssetId: idx > 0 ? assets[idx - 1].id : null,
    nextAssetId: idx < assets.length - 1 ? assets[idx + 1].id : null,
    position: idx + 1,
    total: assets.length,
  };
}

export async function resetBatchForReview(batchId: string): Promise<void> {
  const batch = await getBatchById(batchId);
  if (!batch) throw new Error('Batch not found');

  const assets = await listAssetsForBatch(batchId);
  const supabaseClient = supabase();

  for (const asset of assets) {
    if (asset.semantic_slot_key) {
      await supabaseClient
        .from('site00_asset_slots')
        .update({ current_locked_asset_id: null, current_locked_version_id: null, updated_at: new Date().toISOString() })
        .eq('slot_key', asset.semantic_slot_key);
    }

    const versionId = asset.current_version_id ?? asset.approved_version_id;
    if (versionId) {
      await supabaseClient.from('site00_asset_versions').update({ status: 'NEEDS_REVIEW' }).eq('id', versionId);
    }

    await supabaseClient
      .from('site00_logical_assets')
      .update({
        status: 'NEEDS_REVIEW',
        approved_version_id: null,
        production_version_id: null,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', asset.id);
  }

  await supabaseClient
    .from('site00_batches')
    .update({ status: 'IN_REVIEW', locked_at: null, completed_at: null })
    .eq('id', batchId);

  if (assets[0]) {
    await recordReviewEvent({
      assetId: assets[0].id,
      batchId,
      action: 'NOTE',
      note: 'Batch reset for human review (factory)',
    });
  }
}

export async function ensureAutoGenerationPipeline(batchKey = ACTIVE_ASSTS_ENV_BATCH_KEY): Promise<{ autoQueued: boolean; polled: number }> {
  await ensureBootstrapBatch(batchKey);
  const batch = await getBatchByKey(batchKey);
  if (!batch || batch.status === 'LOCKED') return { autoQueued: false, polled: 0 };

  const assets = await listAssetsForBatch(batch.id);
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest) return { autoQueued: false, polled: 0 };

  let autoQueued = false;
  const shouldQueue = assets.some((asset) => {
    if (asset.status === 'QUEUED' || asset.status === 'FAILED') return true;
    if (!asset.current_version_id) return true;
    return false;
  });

  if (shouldQueue && batch.status !== 'GENERATING') {
    const { runBatchGeneration } = await import('./generation.js');
    await runBatchGeneration(batchKey);
    autoQueued = true;
  }

  const { pollPendingGenerationJobs } = await import('./generation.js');
  const polled = await pollPendingGenerationJobs(10);
  return { autoQueued, polled };
}

export async function recomputeBatchStatus(batchId: string): Promise<BatchStatus> {
  const assets = await listAssetsForBatch(batchId);
  const batch = await getBatchById(batchId);
  if (!batch) throw new Error('Batch not found');

  if (batch.status === 'LOCKED') return 'LOCKED';

  const required = assets.filter((a) => a.required);
  const anyGenerating = assets.some((a) => a.status === 'GENERATING' || a.status === 'REGENERATING');
  const anyFailed = required.some((a) => a.status === 'FAILED');
  const anyNeedsReview = assets.some((a) => a.status === 'NEEDS_REVIEW');
  const allRequiredApproved = required.every((a) => a.approved_version_id != null);

  const blocking = required.some((a) =>
    ['REJECTED', 'REGENERATING', 'NEEDS_REVIEW', 'FAILED', 'GENERATING', 'QUEUED'].includes(a.status),
  );

  let status: BatchStatus = batch.status;
  if (anyFailed) status = 'FAILED';
  else if (anyGenerating) status = 'GENERATING';
  else if (allRequiredApproved && !blocking) status = 'READY_TO_LOCK';
  else if (anyNeedsReview) status = 'IN_REVIEW';
  else if (required.some((a) => a.approved_version_id)) status = 'PARTIALLY_APPROVED';
  else status = 'DRAFT';

  await supabase().from('site00_batches').update({ status }).eq('id', batchId);
  return status;
}

export async function getNextNeedsReviewAssetInBatch(batchId: string, afterAssetId?: string): Promise<DbAsset | null> {
  const assets = await listAssetsForBatch(batchId);
  const needs = assets.filter((a) => a.status === 'NEEDS_REVIEW');
  if (!needs.length) return null;
  if (!afterAssetId) return needs[0];
  const idx = needs.findIndex((a) => a.id === afterAssetId);
  return needs[idx + 1] ?? null;
}

export async function listAllAssetsWithVersions() {
  const { data: assets, error } = await supabase().from('site00_logical_assets').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  const enriched = [];
  for (const asset of assets ?? []) {
    const versions = await getVersionsForAsset(asset.id);
    enriched.push({ ...asset, versions });
  }
  return enriched;
}

export function publicUrlForStoragePath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview').getPublicUrl(path);
  return data.publicUrl;
}

function mapVersionPublic(v: DbVersion) {
  const params = (v.generation_parameters ?? {}) as Record<string, unknown>;
  return {
    ...v,
    previewUrl: publicUrlForStoragePath(v.preview_path ?? v.thumbnail_path ?? v.file_path),
    fileUrl: publicUrlForStoragePath(v.file_path),
    generation_parameters: params,
    worldIdentity: (params.worldIdentity as string | null) ?? null,
    viewType: (params.viewType as string | null) ?? null,
    referenceStrength: (params.referenceStrength as string | null) ?? null,
    canonicalReference: Boolean(params.canonicalReference),
  };
}

export async function enrichAsset(asset: DbAsset) {
  const versions = await getVersionsForAsset(asset.id);
  const current = asset.current_version_id
    ? versions.find((v) => v.id === asset.current_version_id) ?? null
    : versions[versions.length - 1] ?? null;
  const approved = asset.approved_version_id
    ? versions.find((v) => v.id === asset.approved_version_id) ?? null
    : null;
  const batch = asset.batch_id ? await getBatchById(asset.batch_id) : null;
  const manifest = batch ? getBatchManifestByKey(batch.batch_key) : null;
  const manifestAsset = manifest?.assets.find((a) => a.assetKey === asset.asset_key);

  const currentParams = (current?.generation_parameters ?? {}) as Record<string, unknown>;
  const canonicalMaster = manifest?.useCanonicalReference ? await getCanonicalMasterReviewContext() : null;

  return {
    ...asset,
    batch_key: batch?.batch_key ?? null,
    batch_display_name: batch?.display_name ?? null,
    environmentRole: manifestAsset?.environmentRole ?? null,
    environmentRoleLabel: manifestAsset?.environmentRoleLabel ?? null,
    environmentRoleSublabel: manifestAsset?.environmentRoleSublabel ?? null,
    canonicalSlotAlias: manifestAsset?.canonicalSlotAlias ?? null,
    viewType: manifestAsset?.viewType ?? (currentParams.viewType as string | null) ?? null,
    worldIdentity: manifest?.worldIdentity ?? (currentParams.worldIdentity as string | null) ?? null,
    canonicalMaster,
    referenceStrength:
      (currentParams.referenceStrength as string | null) ??
      (currentParams.canonicalReference ? 'high-preservation' : null),
    versions: versions.map(mapVersionPublic),
    currentVersion: current ? mapVersionPublic(current) : null,
    approvedVersion: approved ? mapVersionPublic(approved) : null,
  };
}

export async function enrichBatch(batch: DbBatch) {
  const assets = await listAssetsForBatch(batch.id);
  const enrichedAssets = await Promise.all(assets.map((a) => enrichAsset(a)));
  const manifest = getBatchManifestByKey(batch.batch_key);
  const canonicalMaster = manifest?.useCanonicalReference ? await getCanonicalMasterReviewContext() : null;
  const approvedCount = enrichedAssets.filter((a) => a.approved_version_id).length;
  const needsReviewCount = enrichedAssets.filter((a) => a.status === 'NEEDS_REVIEW').length;
  const regeneratingCount = enrichedAssets.filter((a) => a.status === 'REGENERATING' || a.status === 'GENERATING').length;
  const rejectedCount = enrichedAssets.filter((a) => a.status === 'REJECTED').length;
  const progressPercent =
    enrichedAssets.length > 0 ? Math.round((approvedCount / enrichedAssets.length) * 100) : 0;
  return {
    ...batch,
    assets: enrichedAssets,
    canonicalMaster,
    worldIdentity: manifest?.worldIdentity ?? null,
    promptVersion: manifest?.promptVersion ?? null,
    thumbnailUrl: pickRepresentativePreview(enrichedAssets),
    counts: {
      total: enrichedAssets.length,
      approved: approvedCount,
      needsReview: needsReviewCount,
      regenerating: regeneratingCount,
      rejected: rejectedCount,
    },
    progressPercent,
  };
}
