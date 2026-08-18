import { getSupabaseAdmin } from '../supabase.js';
import {
  pollStudioBuilderFalQueue,
  fetchStudioBuilderFalResult,
} from '../studioBuilderGeneration.js';
import { getBatchManifestByKey } from './manifests.js';
import {
  buildVersionStoragePath,
  downloadUrlToBuffer,
  uploadSite00AssetBuffer,
} from './storage.js';
import {
  enrichAsset,
  getAssetById,
  getBatchByKey,
  getVersionsForAsset,
  listAssetsForBatch,
  publicUrlForStoragePath,
  recordReviewEvent,
  recomputeBatchStatus,
  type DbAsset,
} from './service.js';
import {
  assetHasActiveGeneration,
  getVaultArtDirectionReferenceUrl,
  getVaultMasterReferenceUrl,
  isVaultLibraryAsset,
  manifestUsesVaultLineage,
  vaultArtDirectionPromptBlock,
  vaultReferencePromptBlock,
} from './vaultLineage.js';
import {
  ASSTS_WORLD_IDENTITY,
  CANONICAL_MASTER_ASSET_KEY,
  CANONICAL_REFERENCE_MODEL,
  CANONICAL_REFERENCE_STRENGTH,
  canonicalReferencePromptBlock,
  getCanonicalMasterReferenceUrl,
  manifestUsesCanonicalReference,
} from './canonicalMaster.js';

const T2I_MODEL = 'fal-ai/nano-banana-pro';
const EDIT_MODEL = 'fal-ai/nano-banana-pro/edit';

/** Edit model requires image_urls — never use /edit for text-only generation. */
function resolveEnvironmentModel(referenceImageUrls?: string[]): string {
  return (referenceImageUrls?.length ?? 0) > 0 ? EDIT_MODEL : T2I_MODEL;
}

async function markGenerationJobFailed(
  job: { id: string; asset_id?: string | null; asset_version_id?: string | null },
  error: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from('site00_generation_jobs')
    .update({ status: 'FAILED', error, completed_at: new Date().toISOString() })
    .eq('id', job.id);
  if (job.asset_version_id) {
    await supabase.from('site00_asset_versions').update({ status: 'FAILED' }).eq('id', job.asset_version_id);
  }
  if (job.asset_id) {
    await supabase.from('site00_logical_assets').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('id', job.asset_id);
    const asset = await getAssetById(job.asset_id);
    if (asset?.batch_id) await recomputeBatchStatus(asset.batch_id);
  }
}

async function uploadReferenceToFal(referenceUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const res = await fetch(referenceUrl);
  if (!res.ok) throw new Error(`Vault reference fetch failed (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const name = referenceUrl.split('/').pop()?.split('?')[0] || 'vault-master.webp';
  const type = name.endsWith('.png') ? 'image/png' : 'image/webp';
  return fal.storage.upload(new File([bytes], name, { type }));
}

async function submitEnvironmentFalJob(
  prompt: string,
  aspectRatio: string,
  outputFormat: 'webp' | 'png',
  opts: { model?: string; referenceImageUrls?: string[]; requireReference?: boolean },
): Promise<{ providerRequestId: string; model: string }> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  const { fal } = await import('@fal-ai/client');

  const hasRefs = (opts.referenceImageUrls?.length ?? 0) > 0;

  if (opts.requireReference && !hasRefs) {
    throw new Error('REFERENCE CONDITIONING FAILED: canonical reference required but not supplied to FAL');
  }

  const model = hasRefs ? CANONICAL_REFERENCE_MODEL : opts.requireReference ? CANONICAL_REFERENCE_MODEL : T2I_MODEL;

  if (opts.requireReference && model === T2I_MODEL) {
    throw new Error('REFERENCE CONDITIONING FAILED: text-to-image fallback prohibited for canonical derivatives');
  }

  fal.config({ credentials: falKey });

  let falInput: Record<string, unknown>;
  if (hasRefs) {
    const uploaded: string[] = [];
    for (const url of opts.referenceImageUrls ?? []) {
      uploaded.push(url.startsWith('http') ? await uploadReferenceToFal(url) : url);
    }
    falInput = {
      prompt,
      image_urls: uploaded,
      num_images: 1,
      aspect_ratio: aspectRatio,
      output_format: outputFormat,
      resolution: '2K',
    };
  } else if (opts.requireReference) {
    throw new Error('REFERENCE CONDITIONING FAILED: no image_urls for required reference generation');
  } else {
    falInput = {
      prompt,
      aspect_ratio: aspectRatio,
      output_format: outputFormat,
      resolution: '2K',
      num_images: 1,
    };
  }

  const { request_id: providerRequestId } = await fal.queue.submit(model, { input: falInput });
  return { providerRequestId, model };
}

async function assetNeedsNewGeneration(
  asset: DbAsset,
  versions: Awaited<ReturnType<typeof getVersionsForAsset>>,
  forceNewVersion: boolean,
  promptVersion: string,
): Promise<boolean> {
  if (asset.status === 'QUEUED' || asset.status === 'FAILED') return true;
  if (asset.status === 'GENERATING') return !(await assetHasActiveGeneration(asset));
  if (!asset.current_version_id && versions.length === 0) return true;
  if (forceNewVersion) {
    if (await assetHasActiveGeneration(asset)) return false;
    const hasPromptVersionCandidate = versions.some(
      (v) =>
        v.prompt_version === promptVersion &&
        ['NEEDS_REVIEW', 'APPROVED', 'LOCKED', 'GENERATING'].includes(v.status),
    );
    return !hasPromptVersionCandidate;
  }
  const hasActive = versions.some((v) => ['NEEDS_REVIEW', 'APPROVED', 'LOCKED', 'GENERATING'].includes(v.status));
  if (hasActive && asset.status !== 'QUEUED' && asset.status !== 'FAILED') return false;
  return true;
}

export async function createVersionAndQueueGeneration(
  asset: DbAsset,
  opts: {
    batchKey: string;
    prompt: string;
    promptVersion: string;
    model?: string;
    aspectRatio: string;
    outputFormat: 'webp' | 'png';
    parentVersionId?: string | null;
    correctionNote?: string;
    correctionCategories?: string[];
    referenceImageUrls?: string[];
    requireReference?: boolean;
    generationMetadata?: Record<string, unknown>;
    canonicalMasterVersionId?: string | null;
  },
): Promise<{ versionId: string; jobId: string }> {
  const supabase = getSupabaseAdmin();
  const versions = await getVersionsForAsset(asset.id);
  const nextVersion = (versions[versions.length - 1]?.version_number ?? 0) + 1;

  const { data: version, error: vErr } = await supabase
    .from('site00_asset_versions')
    .insert({
      asset_id: asset.id,
      version_number: nextVersion,
      generation_provider: 'fal',
      generation_model: opts.requireReference || (opts.referenceImageUrls?.length ?? 0) > 0 ? CANONICAL_REFERENCE_MODEL : T2I_MODEL,
      prompt_version: opts.promptVersion,
      prompt_snapshot: opts.prompt,
      status: 'GENERATING',
      parent_version_id: opts.parentVersionId ?? null,
      canonical_master_version_id: opts.canonicalMasterVersionId ?? null,
      generation_parameters: {
        aspectRatio: opts.aspectRatio,
        outputFormat: opts.outputFormat,
        correctionNote: opts.correctionNote ?? null,
        correctionCategories: opts.correctionCategories ?? null,
        vaultReference: opts.referenceImageUrls?.length ? true : false,
        canonicalReference: opts.requireReference ?? false,
        referenceCount: opts.referenceImageUrls?.length ?? 0,
        referenceModel: opts.requireReference ? CANONICAL_REFERENCE_MODEL : null,
        referenceStrength: opts.requireReference ? CANONICAL_REFERENCE_STRENGTH : null,
        ...(opts.generationMetadata ?? {}),
      },
    })
    .select('*')
    .single();
  if (vErr) throw new Error(vErr.message);

  const idempotencyKey = `${asset.asset_key}:v${String(nextVersion).padStart(2, '0')}:${opts.promptVersion}`;

  const { data: existingJob } = await supabase
    .from('site00_generation_jobs')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (existingJob) {
    return { versionId: version.id, jobId: existingJob.id };
  }

  const submit = await submitEnvironmentFalJob(opts.prompt, opts.aspectRatio, opts.outputFormat, {
    model: opts.model,
    referenceImageUrls: opts.referenceImageUrls,
    requireReference: opts.requireReference,
  });

  const { data: job, error: jErr } = await supabase
    .from('site00_generation_jobs')
    .insert({
      asset_id: asset.id,
      asset_version_id: version.id,
      batch_id: asset.batch_id,
      provider: 'fal',
      provider_job_id: submit.providerRequestId,
      provider_model: submit.model,
      status: 'GENERATING',
      idempotency_key: idempotencyKey,
      request_snapshot: {
        prompt: opts.prompt,
        aspectRatio: opts.aspectRatio,
        vaultReference: opts.referenceImageUrls?.length ? true : false,
        canonicalReference: opts.requireReference ?? false,
        referenceUrls: opts.referenceImageUrls ?? [],
        generationMetadata: opts.generationMetadata ?? null,
      },
      started_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (jErr) throw new Error(jErr.message);

  await supabase
    .from('site00_logical_assets')
    .update({ status: 'GENERATING', current_version_id: version.id, updated_at: new Date().toISOString() })
    .eq('id', asset.id);

  if (asset.batch_id) await recomputeBatchStatus(asset.batch_id);

  return { versionId: version.id, jobId: job.id };
}

async function queueManifestAsset(
  batchKey: string,
  manifest: NonNullable<ReturnType<typeof getBatchManifestByKey>>,
  asset: DbAsset,
  manifestAsset: (typeof manifest.assets)[number],
  opts?: {
    referenceImageUrls?: string[];
    requireReference?: boolean;
    canonicalMasterVersionId?: string | null;
    generationMetadata?: Record<string, unknown>;
  },
): Promise<string | null> {
  const versions = await getVersionsForAsset(asset.id);
  if (!(await assetNeedsNewGeneration(asset, versions, manifest.forceNewVersion === true, manifest.promptVersion))) return null;

  const referenceImageUrls = opts?.referenceImageUrls;
  const requireReference = opts?.requireReference ?? false;

  let fullPrompt: string;
  if (requireReference || manifestAsset.requiresCanonicalReference) {
    fullPrompt = canonicalReferencePromptBlock(manifestAsset.compositionPrompt);
  } else if (referenceImageUrls?.length) {
    const block = isVaultLibraryAsset(manifestAsset, asset.asset_key)
      ? vaultArtDirectionPromptBlock()
      : vaultReferencePromptBlock();
    fullPrompt = `${manifest.masterPrompt}\n\n${block}\n\n${manifestAsset.compositionPrompt}`;
  } else {
    fullPrompt = `${manifest.masterPrompt}\n\n${manifestAsset.compositionPrompt}`;
  }

  const generationMetadata = {
    batchId: batchKey,
    assetId: manifestAsset.assetKey,
    viewType: manifestAsset.viewType ?? manifestAsset.environmentRole ?? null,
    worldIdentity: manifest.worldIdentity ?? ASSTS_WORLD_IDENTITY,
    canonicalMasterAssetKey: CANONICAL_MASTER_ASSET_KEY,
    referenceStrength: requireReference ? CANONICAL_REFERENCE_STRENGTH : null,
    provider: 'fal',
    model: requireReference ? CANONICAL_REFERENCE_MODEL : manifest.model ?? T2I_MODEL,
    ...(opts?.generationMetadata ?? {}),
  };

  const { jobId } = await createVersionAndQueueGeneration(asset, {
    batchKey,
    prompt: fullPrompt,
    promptVersion: manifest.promptVersion,
    model: manifest.model,
    aspectRatio: manifest.aspectRatio,
    outputFormat: manifest.outputFormat,
    referenceImageUrls,
    requireReference,
    canonicalMasterVersionId: opts?.canonicalMasterVersionId ?? null,
    generationMetadata,
  });

  await recordReviewEvent({
    assetId: asset.id,
    batchId: asset.batch_id,
    action: 'GENERATED',
    note: requireReference
      ? `Queued ${manifestAsset.assetKey} with canonical master reference (${manifestAsset.viewType ?? 'derivative'})`
      : referenceImageUrls?.length
        ? `Queued ${manifestAsset.assetKey} with vault master reference`
        : `Queued ${manifestAsset.assetKey} v${versions.length + 1}`,
    metadata: requireReference ? { worldIdentity: manifest.worldIdentity, viewType: manifestAsset.viewType } : undefined,
  });

  return jobId;
}

/** Continue vault lineage after library master completes. */
export async function continueVaultLineageGeneration(batchKey: string): Promise<{ queued: number; jobs: string[] }> {
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest?.useVaultLineage) return { queued: 0, jobs: [] };

  const batch = await getBatchByKey(batchKey);
  if (!batch) return { queued: 0, jobs: [] };

  const assets = await listAssetsForBatch(batch.id);
  const libraryManifest = manifest.assets.find((a) => a.generationOrder === 1 || a.environmentRole === 'library');
  const libraryAsset = assets.find((a) => a.asset_key === libraryManifest?.assetKey);
  if (!libraryAsset) return { queued: 0, jobs: [] };

  const masterUrl = await getVaultMasterReferenceUrl(batch.id);
  if (!masterUrl) {
    if (await assetHasActiveGeneration(libraryAsset)) return { queued: 0, jobs: [] };
    return { queued: 0, jobs: [] };
  }

  const jobs: string[] = [];
  let queued = 0;

  const children = manifest.assets
    .filter((a) => a.requiresVaultReference || (a.generationOrder ?? 0) > 1)
    .sort((a, b) => (a.generationOrder ?? 99) - (b.generationOrder ?? 99));

  for (const manifestAsset of children) {
    const asset = assets.find((a) => a.asset_key === manifestAsset.assetKey);
    if (!asset) continue;
    if (await assetHasActiveGeneration(asset)) continue;

    const jobId = await queueManifestAsset(batchKey, manifest, asset, manifestAsset, { referenceImageUrls: [masterUrl] });
    if (jobId) {
      jobs.push(jobId);
      queued += 1;
    }
  }

  if (queued) {
    await getSupabaseAdmin().from('site00_batches').update({ status: 'GENERATING' }).eq('id', batch.id);
  }

  return { queued, jobs };
}

export async function runVaultLineageBatchGeneration(batchKey: string): Promise<{ queued: number; jobs: string[] }> {
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest) throw new Error(`Unknown batch: ${batchKey}`);

  const batch = await getBatchByKey(batchKey);
  if (!batch) throw new Error('Batch not seeded — run bootstrap first');

  const assets = await listAssetsForBatch(batch.id);
  const jobs: string[] = [];
  let queued = 0;

  await getSupabaseAdmin().from('site00_batches').update({ status: 'GENERATING' }).eq('id', batch.id);

  const sorted = [...manifest.assets].sort((a, b) => (a.generationOrder ?? 99) - (b.generationOrder ?? 99));
  const libraryManifest = sorted[0];
  const libraryAsset = assets.find((a) => a.asset_key === libraryManifest.assetKey);

  if (libraryAsset && !(await assetHasActiveGeneration(libraryAsset))) {
    const libraryVersions = await getVersionsForAsset(libraryAsset.id);
    const libraryReady = libraryVersions.some(
      (v) =>
        v.prompt_version === manifest.promptVersion &&
        ['NEEDS_REVIEW', 'APPROVED', 'LOCKED'].includes(v.status) &&
        Boolean(v.file_path || v.preview_path),
    );
    if (libraryReady) {
      return continueVaultLineageGeneration(batchKey);
    }

    const artDirectionUrl = getVaultArtDirectionReferenceUrl();
    const libraryRefs = artDirectionUrl ? [artDirectionUrl] : undefined;
    const jobId = await queueManifestAsset(batchKey, manifest, libraryAsset, libraryManifest, {
      referenceImageUrls: libraryRefs,
    });
    if (jobId) {
      jobs.push(jobId);
      queued += 1;
      return { queued, jobs };
    }
  }

  if (libraryAsset && (await assetHasActiveGeneration(libraryAsset))) {
    return { queued: 0, jobs: [] };
  }

  const cont = await continueVaultLineageGeneration(batchKey);
  return { queued: cont.queued, jobs: cont.jobs };
}

export async function runCanonicalReferenceBatchGeneration(batchKey: string): Promise<{ queued: number; jobs: string[] }> {
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest?.useCanonicalReference) throw new Error(`Batch ${batchKey} is not canonical-reference configured`);

  const batch = await getBatchByKey(batchKey);
  if (!batch) throw new Error('Batch not seeded — run bootstrap first');

  const { ensureCanonicalMasterRegistered } = await import('./canonicalMaster.js');
  const { versionId: canonicalMasterVersionId } = await ensureCanonicalMasterRegistered();

  const masterUrl = await getCanonicalMasterReferenceUrl();
  if (!masterUrl) {
    throw new Error('REFERENCE CONDITIONING FAILED: canonical master URL could not be resolved');
  }

  const assets = await listAssetsForBatch(batch.id);
  const jobs: string[] = [];
  let queued = 0;

  await getSupabaseAdmin().from('site00_batches').update({ status: 'GENERATING' }).eq('id', batch.id);

  const sorted = [...manifest.assets].sort((a, b) => (a.generationOrder ?? 99) - (b.generationOrder ?? 99));

  for (const manifestAsset of sorted) {
    const asset = assets.find((a) => a.asset_key === manifestAsset.assetKey);
    if (!asset) continue;
    if (await assetHasActiveGeneration(asset)) continue;

    const jobId = await queueManifestAsset(batchKey, manifest, asset, manifestAsset, {
      referenceImageUrls: [masterUrl],
      requireReference: true,
      canonicalMasterVersionId,
      generationMetadata: {
        canonicalMasterUrl: masterUrl,
        canonicalMasterAssetKey: CANONICAL_MASTER_ASSET_KEY,
      },
    });
    if (jobId) {
      jobs.push(jobId);
      queued += 1;
    }
  }

  return { queued, jobs };
}

export async function runBatchGeneration(batchKey: string): Promise<{ queued: number; jobs: string[] }> {
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest) throw new Error(`Unknown batch: ${batchKey}`);

  if (manifestUsesCanonicalReference(manifest)) {
    return runCanonicalReferenceBatchGeneration(batchKey);
  }

  if (manifestUsesVaultLineage(manifest)) {
    return runVaultLineageBatchGeneration(batchKey);
  }

  const batch = await getBatchByKey(batchKey);
  if (!batch) throw new Error('Batch not seeded — run bootstrap first');

  const assets = await listAssetsForBatch(batch.id);
  const jobs: string[] = [];
  let queued = 0;

  const supabase = getSupabaseAdmin();
  await supabase.from('site00_batches').update({ status: 'GENERATING' }).eq('id', batch.id);

  for (const manifestAsset of manifest.assets) {
    const asset = assets.find((a) => a.asset_key === manifestAsset.assetKey);
    if (!asset) continue;

    const jobId = await queueManifestAsset(batchKey, manifest, asset, manifestAsset);
    if (jobId) {
      jobs.push(jobId);
      queued += 1;
    }
  }

  return { queued, jobs };
}

export async function pollPendingGenerationJobs(limit = 5): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data: jobs } = await supabase
    .from('site00_generation_jobs')
    .select('*')
    .in('status', ['QUEUED', 'GENERATING'])
    .order('created_at', { ascending: true })
    .limit(limit);

  let completed = 0;
  const batchesToContinue = new Set<string>();

  for (const job of jobs ?? []) {
    if (!job.provider_job_id || !job.provider_model) continue;
    try {
      const { status } = await pollStudioBuilderFalQueue(job.provider_model, job.provider_job_id);
      if (status === 'IN_QUEUE' || status === 'IN_PROGRESS') continue;

      if (status === 'FAILED') {
        await markGenerationJobFailed(job, 'FAL failed');
        continue;
      }

      const imageUrl = await fetchStudioBuilderFalResult(job.provider_model, job.provider_job_id);
      if (!imageUrl) {
        await markGenerationJobFailed(job, 'No image URL');
        continue;
      }

      const asset = job.asset_id ? await getAssetById(job.asset_id) : null;
      let batchKey = 'BATCH-ASSTS-ENV-002';
      if (asset?.batch_id) {
        const { data: batchRow } = await supabase.from('site00_batches').select('batch_key').eq('id', asset.batch_id).single();
        if (batchRow?.batch_key) batchKey = batchRow.batch_key;
      }

      const { data: version } = await supabase.from('site00_asset_versions').select('*').eq('id', job.asset_version_id).single();
      const versionNumber = version?.version_number ?? 1;
      const ext = 'webp';
      const storagePath = buildVersionStoragePath(batchKey, asset?.asset_key ?? 'asset', versionNumber, ext);

      const buffer = await downloadUrlToBuffer(imageUrl);
      const uploaded = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp');

      await supabase
        .from('site00_asset_versions')
        .update({
          status: 'NEEDS_REVIEW',
          file_path: uploaded.storagePath,
          thumbnail_path: uploaded.storagePath,
          preview_path: uploaded.storagePath,
        })
        .eq('id', job.asset_version_id);

      await supabase
        .from('site00_logical_assets')
        .update({ status: 'NEEDS_REVIEW', current_version_id: job.asset_version_id, updated_at: new Date().toISOString() })
        .eq('id', job.asset_id);

      await supabase
        .from('site00_generation_jobs')
        .update({
          status: 'COMPLETE',
          response_snapshot: { imageUrl, storagePath: uploaded.storagePath },
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (asset?.batch_id) {
        await recomputeBatchStatus(asset.batch_id);
        const batchRow = await getBatchByKey(batchKey);
        const manifest = getBatchManifestByKey(batchKey);
        if (batchRow && manifest?.useVaultLineage && asset.asset_key === 's00_env_assts_library_mobile') {
          batchesToContinue.add(batchKey);
        }
      }
      completed += 1;
    } catch (e) {
      await markGenerationJobFailed(job, e instanceof Error ? e.message : String(e));
    }
  }

  for (const batchKey of batchesToContinue) {
    await continueVaultLineageGeneration(batchKey);
  }

  return completed;
}

export async function queueRegeneration(
  assetId: string,
  input: { categories: string[]; note?: string },
): Promise<{ versionId: string; jobId: string }> {
  const asset = await getAssetById(assetId);
  if (!asset) throw new Error('Asset not found');
  const batchRow = asset.batch_id
    ? await getSupabaseAdmin().from('site00_batches').select('batch_key, manifest').eq('id', asset.batch_id).single()
    : null;
  const batchKey = batchRow?.data?.batch_key ?? ACTIVE_ASSTS_ENV_BATCH_KEY;
  const manifest = getBatchManifestByKey(batchKey);
  if (!manifest) throw new Error('Manifest missing');

  const manifestAsset = manifest.assets.find((a) => a.assetKey === asset.asset_key);
  if (!manifestAsset) throw new Error('Asset not in manifest');

  const correctionBlock = [
    input.categories.length ? `Correction categories: ${input.categories.join(', ')}.` : '',
    input.note ? `Note: ${input.note}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  let referenceImageUrls: string[] | undefined;
  let requireReference = false;
  let canonicalMasterVersionId: string | null = null;

  if (manifestUsesCanonicalReference(manifest) || manifestAsset.requiresCanonicalReference) {
    const masterUrl = await getCanonicalMasterReferenceUrl();
    if (!masterUrl) {
      throw new Error('REFERENCE CONDITIONING FAILED: canonical master must exist before regenerating derivatives');
    }
    const { ensureCanonicalMasterRegistered } = await import('./canonicalMaster.js');
    const reg = await ensureCanonicalMasterRegistered();
    canonicalMasterVersionId = reg.versionId;
    referenceImageUrls = [masterUrl];
    requireReference = true;
  } else if (manifestAsset.requiresVaultReference && asset.batch_id) {
    const masterUrl = await getVaultMasterReferenceUrl(asset.batch_id);
    if (!masterUrl) {
      throw new Error('Vault master reference (Library environment) must exist before regenerating child zones');
    }
    referenceImageUrls = [masterUrl];
  }

  let fullPrompt: string;
  if (requireReference) {
    fullPrompt = `${canonicalReferencePromptBlock(manifestAsset.compositionPrompt)}\n\nREGENERATION CORRECTION:\n${correctionBlock}`;
  } else if (referenceImageUrls?.length) {
    fullPrompt = `${manifest.masterPrompt}\n\n${vaultReferencePromptBlock()}\n\n${manifestAsset.compositionPrompt}\n\nREGENERATION CORRECTION:\n${correctionBlock}`;
  } else {
    fullPrompt = `${manifest.masterPrompt}\n\n${manifestAsset.compositionPrompt}\n\nREGENERATION CORRECTION:\n${correctionBlock}`;
  }

  await getSupabaseAdmin().from('site00_logical_assets').update({ status: 'REGENERATING' }).eq('id', asset.id);

  const result = await createVersionAndQueueGeneration(asset, {
    batchKey,
    prompt: fullPrompt,
    promptVersion: manifest.promptVersion,
    model: manifest.model,
    aspectRatio: manifest.aspectRatio,
    outputFormat: manifest.outputFormat,
    parentVersionId: asset.current_version_id,
    correctionNote: input.note,
    correctionCategories: input.categories,
    referenceImageUrls,
    requireReference,
    canonicalMasterVersionId,
    generationMetadata: requireReference
      ? {
          batchId: batchKey,
          assetId: asset.asset_key,
          viewType: manifestAsset.viewType ?? manifestAsset.environmentRole ?? null,
          worldIdentity: manifest.worldIdentity ?? ASSTS_WORLD_IDENTITY,
          canonicalMasterAssetKey: CANONICAL_MASTER_ASSET_KEY,
          regeneration: true,
        }
      : undefined,
  });

  await recordReviewEvent({
    assetId: asset.id,
    assetVersionId: result.versionId,
    batchId: asset.batch_id,
    action: 'REGENERATE',
    note: input.note ?? null,
    correctionCategories: input.categories,
  });

  return result;
}

export { publicUrlForStoragePath, enrichAsset };
