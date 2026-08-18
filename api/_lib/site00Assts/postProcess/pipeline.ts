import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, unlinkSync, mkdtempSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  pollStudioBuilderFalQueue,
} from '../../studioBuilderGeneration.js';
import { getSupabaseAdmin } from '../../supabase.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../storage.js';
import { recordReviewEvent, publicUrlForStoragePath } from '../service.js';
import { getPostProcessModel } from './registry.js';
import {
  LOADER_GEOMETRY_DERIVATIVE_ASSET_KEY,
  LOADER_GEOMETRY_PRODUCTION_SLOT,
  LOADER_POST_PROCESS_JOB_KEY,
  type LoaderGeometrySourceMetadata,
} from './types.js';
import { ensureLoaderGeometryAssetsRegistered } from './loaderGeometry.js';

type FalVideoFile = { url?: string; content_type?: string; file_size?: number; file_name?: string };

function requireFalKey(): string {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY not configured on server');
  return falKey;
}

function buildFalInput(modelId: string, videoUrl: string, settings: Record<string, unknown>): Record<string, unknown> {
  if (modelId === 'bria/video/background-removal/v3') {
    return {
      video_url: videoUrl,
      background_color: settings.background_color ?? 'Transparent',
      output_container_and_codec: settings.output_container_and_codec ?? 'webm_vp9',
      preserve_audio: settings.preserve_audio ?? false,
    };
  }
  if (modelId === 'fal-ai/ben/v2/video') {
    return {
      video_url: videoUrl,
      output_format: settings.output_format ?? 'webm',
    };
  }
  throw new Error(`Unsupported video background removal model: ${modelId}`);
}

function extractOutputVideoUrl(_modelId: string, data: Record<string, unknown>): FalVideoFile | null {
  const video = data.video as FalVideoFile | FalVideoFile[] | undefined;
  if (Array.isArray(video)) return video[0] ?? null;
  if (video?.url) return video;
  return null;
}

/** Strip audio track without re-encoding video — production loader is silent. */
export function stripAudioFromVideoBuffer(input: Buffer, ext: 'webm' | 'mp4' = 'webm'): Buffer {
  const dir = mkdtempSync(join(tmpdir(), 'site00-loader-'));
  const inPath = join(dir, `in.${ext}`);
  const outPath = join(dir, `out.${ext}`);
  try {
    writeFileSync(inPath, input);
    execSync(`ffmpeg -y -i ${JSON.stringify(inPath)} -an -c:v copy ${JSON.stringify(outPath)}`, {
      stdio: 'pipe',
    });
    return readFileSync(outPath);
  } finally {
    try {
      unlinkSync(inPath);
      unlinkSync(outPath);
    } catch {
      /* ignore */
    }
  }
}

function probeVideoBuffer(buffer: Buffer, ext: string): Record<string, unknown> {
  const dir = mkdtempSync(join(tmpdir(), 'site00-probe-'));
  const path = join(dir, `probe.${ext}`);
  try {
    writeFileSync(path, buffer);
    const raw = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams ${JSON.stringify(path)}`, {
      encoding: 'utf8',
    });
    return JSON.parse(raw) as Record<string, unknown>;
  } finally {
    try {
      unlinkSync(path);
    } catch {
      /* ignore */
    }
  }
}

function estimateVideoBgRemovalCost(modelId: string, durationSeconds: number): number {
  if (modelId.includes('bria')) return Number((durationSeconds * 0.0042).toFixed(4));
  if (modelId.includes('ben')) return Number((durationSeconds * 0.005).toFixed(4));
  return 0;
}

export async function submitLoaderBackgroundRemoval(opts: {
  modelId?: string;
  jobKey?: string;
  processorSettings?: Record<string, unknown>;
}): Promise<{ jobId: string; providerRequestId: string; modelId: string }> {
  const modelId = opts.modelId ?? 'bria/video/background-removal/v3';
  const modelDef = getPostProcessModel('BACKGROUND_REMOVE_VIDEO', modelId);
  if (!modelDef) throw new Error(`Unknown post-process model: ${modelId}`);

  const { masterAssetId, derivativeAssetId, masterVersionId, sourceMetadata } =
    await ensureLoaderGeometryAssetsRegistered();

  const supabase = getSupabaseAdmin();

  const { data: active } = await supabase
    .from('site00_post_process_jobs')
    .select('*')
    .in('status', ['QUEUED', 'PROCESSING'])
    .eq('source_asset_id', masterAssetId)
    .maybeSingle();
  if (active) {
    throw new Error(`Post-processing already in flight (${active.status})`);
  }

  const settings = { ...modelDef.defaultSettings, ...(opts.processorSettings ?? {}) };
  const falInput = buildFalInput(modelId, sourceMetadata.publicUrl, settings);

  const falKey = requireFalKey();
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const { request_id: providerRequestId } = await fal.queue.submit(modelId, { input: falInput });

  const { data: job, error } = await supabase
    .from('site00_post_process_jobs')
    .insert({
      job_key: opts.jobKey ?? LOADER_POST_PROCESS_JOB_KEY,
      source_asset_id: masterAssetId,
      source_version_id: masterVersionId,
      output_asset_id: derivativeAssetId,
      processor: 'fal',
      processor_model: modelId,
      derivative_type: 'background_removed',
      processor_settings: settings,
      status: 'PROCESSING',
      provider_job_id: providerRequestId,
      request_snapshot: { input: falInput },
      source_metadata: sourceMetadata,
      started_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await supabase
    .from('site00_logical_assets')
    .update({ status: 'GENERATING', updated_at: new Date().toISOString() })
    .eq('id', derivativeAssetId);

  return { jobId: job.id, providerRequestId, modelId };
}

export async function pollLoaderPostProcessJob(jobId: string): Promise<{ done: boolean; job: Record<string, unknown> }> {
  const supabase = getSupabaseAdmin();
  const { data: job } = await supabase.from('site00_post_process_jobs').select('*').eq('id', jobId).maybeSingle();
  if (!job) throw new Error('Post-process job not found');
  if (job.status !== 'PROCESSING' || !job.provider_job_id) {
    return { done: true, job };
  }

  const modelId = job.processor_model as string;
  const started = job.started_at ? new Date(job.started_at).getTime() : Date.now();

  try {
    const { status: queueStatus } = await pollStudioBuilderFalQueue(modelId, job.provider_job_id);
    if (queueStatus === 'IN_QUEUE' || queueStatus === 'IN_PROGRESS') {
      return { done: false, job };
    }
    if (queueStatus === 'FAILED') {
      throw new Error('FAL post-processing failed');
    }

    const falKey = requireFalKey();
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });
    const result = await fal.queue.result(modelId, { requestId: job.provider_job_id });
    const data = ((result as { data?: Record<string, unknown> }).data ?? result) as Record<string, unknown>;
    const outputVideo = extractOutputVideoUrl(modelId, data);
    if (!outputVideo?.url) throw new Error('FAL returned no output video URL');

    let buffer = await downloadUrlToBuffer(outputVideo.url);
    const ext = outputVideo.content_type?.includes('webm') ? 'webm' : 'mp4';

    try {
      buffer = stripAudioFromVideoBuffer(buffer, ext as 'webm' | 'mp4');
    } catch {
      /* ffmpeg strip optional */
    }

    const derivativeAssetId = job.output_asset_id as string;
    const { data: versions } = await supabase
      .from('site00_asset_versions')
      .select('version_number')
      .eq('asset_id', derivativeAssetId)
      .order('version_number', { ascending: false })
      .limit(1);
    const nextVersion = (versions?.[0]?.version_number ?? 0) + 1;

    const storagePath = `site00/loader/derivatives/${LOADER_GEOMETRY_DERIVATIVE_ASSET_KEY}_v${String(nextVersion).padStart(2, '0')}.${ext}`;
    await uploadSite00AssetBuffer(storagePath, buffer, outputVideo.content_type ?? `video/${ext}`);

    const probe = probeVideoBuffer(buffer, ext);
    const durationMs = Date.now() - started;
    const costEstimate = estimateVideoBgRemovalCost(
      modelId,
      (job.source_metadata as LoaderGeometrySourceMetadata)?.durationSeconds ?? 10,
    );

    const { data: version, error: versionErr } = await supabase
      .from('site00_asset_versions')
      .insert({
        asset_id: derivativeAssetId,
        version_number: nextVersion,
        file_path: storagePath,
        preview_path: storagePath,
        thumbnail_path: storagePath,
        generation_provider: 'fal',
        generation_model: modelId,
        prompt_version: 'post-process-v1',
        prompt_snapshot: 'FAL video background removal — loader geometry transparent derivative',
        status: 'NEEDS_REVIEW',
        derivative_type: 'background_removed',
        source_version_id: job.source_version_id,
        post_process_job_id: job.id,
        generation_parameters: {
          processor: 'BACKGROUND_REMOVE_VIDEO',
          processorSettings: job.processor_settings,
          jobKey: job.job_key,
        },
        media_metadata: {
          ...probe,
          outputContentType: outputVideo.content_type,
          outputSizeBytes: buffer.length,
          audioStripped: true,
          alphaExpected: true,
        },
      })
      .select('*')
      .single();
    if (versionErr) throw new Error(versionErr.message);

    await supabase
      .from('site00_post_process_jobs')
      .update({
        status: 'NEEDS_REVIEW',
        output_version_id: version.id,
        response_snapshot: data,
        processing_duration_ms: durationMs,
        cost_usd: costEstimate,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    await supabase
      .from('site00_logical_assets')
      .update({
        status: 'NEEDS_REVIEW',
        current_version_id: version.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', derivativeAssetId);

    await recordReviewEvent({
      assetId: derivativeAssetId,
      assetVersionId: version.id,
      action: 'GENERATED',
      note: `Post-process complete (${modelId}) — transparent derivative ready for review`,
      metadata: { postProcessJobId: job.id, processor: 'BACKGROUND_REMOVE_VIDEO' },
    });

    const { data: refreshed } = await supabase.from('site00_post_process_jobs').select('*').eq('id', jobId).single();
    return { done: true, job: refreshed ?? job };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await supabase
      .from('site00_post_process_jobs')
      .update({ status: 'FAILED', error: message, completed_at: new Date().toISOString() })
      .eq('id', job.id);
    await supabase
      .from('site00_logical_assets')
      .update({ status: 'FAILED', updated_at: new Date().toISOString() })
      .eq('id', job.output_asset_id as string);
    throw e;
  }
}

export async function pollPendingLoaderPostProcessJobs(limit = 3): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data: jobs } = await supabase
    .from('site00_post_process_jobs')
    .select('id')
    .eq('status', 'PROCESSING')
    .order('created_at', { ascending: true })
    .limit(limit);
  let completed = 0;
  for (const job of jobs ?? []) {
    const result = await pollLoaderPostProcessJob(job.id);
    if (result.done) completed += 1;
  }
  return completed;
}

export async function approveLoaderDerivative(versionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: version } = await supabase.from('site00_asset_versions').select('*').eq('id', versionId).maybeSingle();
  if (!version) throw new Error('Derivative version not found');

  await supabase.from('site00_asset_versions').update({ status: 'APPROVED' }).eq('id', versionId);
  await supabase
    .from('site00_logical_assets')
    .update({ status: 'APPROVED', approved_version_id: versionId, updated_at: new Date().toISOString() })
    .eq('id', version.asset_id);

  await recordReviewEvent({
    assetId: version.asset_id,
    assetVersionId: versionId,
    action: 'APPROVE',
    note: 'Transparent loader derivative approved — preserves approved master animation',
  });
}

export async function rejectLoaderDerivative(versionId: string, note?: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: version } = await supabase.from('site00_asset_versions').select('*').eq('id', versionId).maybeSingle();
  if (!version) throw new Error('Derivative version not found');

  await supabase.from('site00_asset_versions').update({ status: 'REJECTED' }).eq('id', versionId);
  await supabase
    .from('site00_logical_assets')
    .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
    .eq('id', version.asset_id);

  await recordReviewEvent({
    assetId: version.asset_id,
    assetVersionId: versionId,
    action: 'REJECT',
    note: note ?? 'Transparent derivative rejected — reprocess with alternate model',
  });
}


export async function promoteLoaderProductionSlot(versionId: string): Promise<{ slotKey: string; publicUrl: string; publicPath: string | null }> {
  const supabase = getSupabaseAdmin();
  const { data: version } = await supabase.from('site00_asset_versions').select('*').eq('id', versionId).maybeSingle();
  if (!version?.file_path) throw new Error('Approved derivative version missing file_path');
  if (version.status !== 'APPROVED' && version.status !== 'LOCKED') {
    throw new Error('Derivative must be APPROVED before lock');
  }

  await supabase.from('site00_asset_versions').update({ status: 'LOCKED' }).eq('id', versionId);
  await supabase
    .from('site00_logical_assets')
    .update({
      status: 'LOCKED',
      production_version_id: versionId,
      locked_at: new Date().toISOString(),
    })
    .eq('id', version.asset_id);

  await supabase
    .from('site00_asset_slots')
    .update({
      current_locked_asset_id: version.asset_id,
      current_locked_version_id: versionId,
      updated_at: new Date().toISOString(),
    })
    .eq('slot_key', LOADER_GEOMETRY_PRODUCTION_SLOT);

  await recordReviewEvent({
    assetId: version.asset_id,
    assetVersionId: versionId,
    action: 'LOCK',
    note: `Locked to ${LOADER_GEOMETRY_PRODUCTION_SLOT}`,
  });

  const storagePublicUrl = publicUrlForStoragePath(version.file_path) ?? '';
  const PUBLIC_LOADER_ALPHA_REL = 'public/site00/loader/v1/assts-loader-geometry-v1-alpha.webm';
  let publicPath: string | null = null;
  try {
    const buffer = await downloadUrlToBuffer(storagePublicUrl);
    const absDest = join(process.cwd(), PUBLIC_LOADER_ALPHA_REL);
    mkdirSync(join(process.cwd(), 'public/site00/loader/v1'), { recursive: true });
    writeFileSync(absDest, buffer);
    publicPath = PUBLIC_LOADER_ALPHA_REL.replace(/^public\//, '/');
  } catch {
    /* runtime may resolve from Supabase slot until next deploy sync */
  }

  return { slotKey: LOADER_GEOMETRY_PRODUCTION_SLOT, publicUrl: storagePublicUrl, publicPath };
}
