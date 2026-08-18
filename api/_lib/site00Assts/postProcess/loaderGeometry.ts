import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { getSupabaseAdmin } from '../../supabase.js';
import {
  LOADER_GEOMETRY_DERIVATIVE_ASSET_KEY,
  LOADER_GEOMETRY_MASTER_ASSET_KEY,
  LOADER_GEOMETRY_MASTER_REMOTE_FILE,
  LOADER_GEOMETRY_MASTER_SLOT,
  LOADER_GEOMETRY_MASTER_STORAGE_PATH,
  LOADER_GEOMETRY_PRODUCTION_SLOT,
  type LoaderGeometrySourceMetadata,
} from './types.js';
import { SITE00_LOADER_GEOMETRY_CANONICAL_PROMPT, SITE00_LOADER_GEOMETRY_GENERATION } from '../../../../src/site00/components/loader/site00LoaderGeometryPrompt.js';
import { publicUrlForStoragePath, recordReviewEvent } from '../service.js';
import { uploadSite00AssetBuffer, SITE00_ASSETS_BUCKET } from '../storage.js';

const LOCAL_MASTER_PATH = join(process.cwd(), 'public/site00/loader/v1/assts-loader-geometry-v1-source.mp4');

export function inspectLoaderMasterMetadata(publicUrl: string, filePath: string): LoaderGeometrySourceMetadata {
  const probeTarget = existsSync(LOCAL_MASTER_PATH) ? LOCAL_MASTER_PATH : publicUrl;
  let probeJson: {
    streams?: Array<{ codec_type?: string; codec_name?: string; width?: number; height?: number; r_frame_rate?: string }>;
    format?: { duration?: string; size?: string };
  };

  try {
    const raw = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams ${JSON.stringify(probeTarget)}`, {
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
    });
    probeJson = JSON.parse(raw) as typeof probeJson;
  } catch (e) {
    throw new Error(`ffprobe failed for loader master: ${e instanceof Error ? e.message : String(e)}`);
  }

  const video = probeJson.streams?.find((s) => s.codec_type === 'video');
  const audio = probeJson.streams?.find((s) => s.codec_type === 'audio');
  if (!video) throw new Error('Loader master has no video stream');

  const [fpsNum, fpsDen] = (video.r_frame_rate ?? '24/1').split('/').map(Number);
  const frameRate = fpsDen ? fpsNum / fpsDen : 24;

  return {
    assetRole: 'LOADER_GEOMETRY_MASTER',
    container: 'mp4',
    videoCodec: video.codec_name ?? 'unknown',
    audioCodec: audio?.codec_name ?? null,
    width: video.width ?? 0,
    height: video.height ?? 0,
    frameRate,
    durationSeconds: Number(probeJson.format?.duration ?? 0),
    hasAlpha: false,
    fileSizeBytes: Number(probeJson.format?.size ?? 0),
    filePath,
    publicUrl,
    inspectedAt: new Date().toISOString(),
  };
}

export async function ensureLoaderMasterUploaded(): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = getSupabaseAdmin();
  const storagePath = LOADER_GEOMETRY_MASTER_STORAGE_PATH;

  const { data: existing } = await supabase.storage.from(SITE00_ASSETS_BUCKET).list('site00/loader/v1', {
    search: 'assts-loader-geometry-v1-source.mp4',
  });

  const alreadyThere = existing?.some((f) => f.name === 'assts-loader-geometry-v1-source.mp4');
  if (!alreadyThere) {
    if (!existsSync(LOCAL_MASTER_PATH)) {
      throw new Error(`Loader master not found locally at ${LOCAL_MASTER_PATH}`);
    }
    const buffer = readFileSync(LOCAL_MASTER_PATH);
    await uploadSite00AssetBuffer(storagePath, buffer, 'video/mp4');
  }

  return { publicUrl: publicUrlForStoragePath(storagePath), storagePath };
}

export async function ensureLoaderGeometryAssetsRegistered(): Promise<{
  masterAssetId: string;
  derivativeAssetId: string;
  masterVersionId: string | null;
  sourceMetadata: LoaderGeometrySourceMetadata;
}> {
  const supabase = getSupabaseAdmin();
  const { publicUrl, storagePath } = await ensureLoaderMasterUploaded();
  const sourceMetadata = inspectLoaderMasterMetadata(publicUrl, storagePath);

  for (const slotKey of [LOADER_GEOMETRY_MASTER_SLOT, LOADER_GEOMETRY_PRODUCTION_SLOT]) {
    await supabase.from('site00_asset_slots').upsert(
      {
        slot_key: slotKey,
        description:
          slotKey === LOADER_GEOMETRY_MASTER_SLOT
            ? 'Approved SITE 00 loader geometry master'
            : 'Locked transparent loader geometry production slot',
        asset_type: 'loader_geometry',
        environment: 'site00_loader',
      },
      { onConflict: 'slot_key' },
    );
  }

  const upsertAsset = async (assetKey: string, displayName: string, slotKey: string | null) => {
    const { data: existing } = await supabase.from('site00_logical_assets').select('*').eq('asset_key', assetKey).maybeSingle();
    if (existing) return existing;

    const { data: created, error } = await supabase
      .from('site00_logical_assets')
      .insert({
        asset_key: assetKey,
        display_name: displayName,
        asset_type: 'loader_geometry',
        category: 'site00_loader',
        semantic_slot_key: slotKey,
        status: assetKey === LOADER_GEOMETRY_MASTER_ASSET_KEY ? 'APPROVED' : 'QUEUED',
        required: true,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return created;
  };

  const masterAsset = await upsertAsset(
    LOADER_GEOMETRY_MASTER_ASSET_KEY,
    'Loader Geometry Master (OpenArt)',
    LOADER_GEOMETRY_MASTER_SLOT,
  );
  const derivativeAsset = await upsertAsset(
    LOADER_GEOMETRY_DERIVATIVE_ASSET_KEY,
    'Loader Geometry Transparent V01',
    LOADER_GEOMETRY_PRODUCTION_SLOT,
  );

  let masterVersionId: string | null = null;
  const { data: masterVersions } = await supabase
    .from('site00_asset_versions')
    .select('*')
    .eq('asset_id', masterAsset.id)
    .order('version_number', { ascending: false })
    .limit(1);

  if (!masterVersions?.length) {
    const { data: version, error } = await supabase
      .from('site00_asset_versions')
      .insert({
        asset_id: masterAsset.id,
        version_number: 1,
        file_path: storagePath,
        preview_path: storagePath,
        thumbnail_path: storagePath,
        generation_provider: SITE00_LOADER_GEOMETRY_GENERATION.provider,
        generation_model: `${SITE00_LOADER_GEOMETRY_GENERATION.model} (${SITE00_LOADER_GEOMETRY_GENERATION.openArtHistoryId})`,
        prompt_version: 'kling-v2-start-end-frame-10s',
        prompt_snapshot: SITE00_LOADER_GEOMETRY_CANONICAL_PROMPT,
        status: 'APPROVED',
        media_metadata: sourceMetadata,
        derivative_type: null,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    masterVersionId = version.id;

    await supabase
      .from('site00_logical_assets')
      .update({
        current_version_id: version.id,
        approved_version_id: version.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', masterAsset.id);

    await supabase
      .from('site00_asset_slots')
      .update({
        current_locked_asset_id: masterAsset.id,
        current_locked_version_id: version.id,
        updated_at: new Date().toISOString(),
      })
      .eq('slot_key', LOADER_GEOMETRY_MASTER_SLOT);

    await recordReviewEvent({
      assetId: masterAsset.id,
      assetVersionId: version.id,
      action: 'APPROVE',
      note: 'Registered approved loader geometry master (OpenArt source)',
    });
  } else {
    masterVersionId = masterVersions[0].id;
    await supabase
      .from('site00_asset_versions')
      .update({ media_metadata: sourceMetadata })
      .eq('id', masterVersionId);
  }

  return {
    masterAssetId: masterAsset.id,
    derivativeAssetId: derivativeAsset.id,
    masterVersionId,
    sourceMetadata,
  };
}

function enrichVersionRow(v: Record<string, unknown>) {
  const filePath = (v.file_path as string | null) ?? null;
  const previewPath = (v.preview_path as string | null) ?? (v.thumbnail_path as string | null) ?? filePath;
  return {
    ...v,
    previewUrl: publicUrlForStoragePath(previewPath),
    fileUrl: publicUrlForStoragePath(filePath),
  };
}

export async function getLoaderPipelineContext() {
  const supabase = getSupabaseAdmin();
  const registration = await ensureLoaderGeometryAssetsRegistered();

  const { data: masterAsset } = await supabase
    .from('site00_logical_assets')
    .select('*')
    .eq('asset_key', LOADER_GEOMETRY_MASTER_ASSET_KEY)
    .maybeSingle();
  const { data: derivativeAsset } = await supabase
    .from('site00_logical_assets')
    .select('*')
    .eq('asset_key', LOADER_GEOMETRY_DERIVATIVE_ASSET_KEY)
    .maybeSingle();

  const masterVersions = masterAsset
    ? (
        await supabase
          .from('site00_asset_versions')
          .select('*')
          .eq('asset_id', masterAsset.id)
          .order('version_number', { ascending: false })
      ).data ?? []
    : [];

  const derivativeVersions = derivativeAsset
    ? (
        await supabase
          .from('site00_asset_versions')
          .select('*')
          .eq('asset_id', derivativeAsset.id)
          .order('version_number', { ascending: false })
      ).data ?? []
    : [];

  const { data: jobs } = await supabase
    .from('site00_post_process_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const production = await supabase
    .from('site00_asset_slots')
    .select('*')
    .eq('slot_key', LOADER_GEOMETRY_PRODUCTION_SLOT)
    .maybeSingle();

  const productionResolved = await (
    await import('../slots.js')
  ).resolveProductionAsset(LOADER_GEOMETRY_PRODUCTION_SLOT);

  const latestJob = jobs?.[0] ?? null;
  const currentDerivative = derivativeVersions[0] ? enrichVersionRow(derivativeVersions[0]) : null;
  const masterVersion = masterVersions[0] ? enrichVersionRow(masterVersions[0]) : null;

  return {
    masterAsset,
    derivativeAsset,
    masterVersions: masterVersions.map((v) => enrichVersionRow(v)),
    derivativeVersions: derivativeVersions.map((v) => enrichVersionRow(v)),
    jobs: jobs ?? [],
    latestJob,
    productionSlot: production.data,
    productionResolved,
    sourceMetadata: registration.sourceMetadata,
    processors: (await import('./registry.js')).POST_PROCESSORS,
    reviewRoute: '/assts/loader-pipeline',
    semanticSlots: {
      master: LOADER_GEOMETRY_MASTER_SLOT,
      production: LOADER_GEOMETRY_PRODUCTION_SLOT,
    },
    comparison: {
      masterUrl: masterVersion?.fileUrl ?? registration.sourceMetadata.publicUrl,
      derivativeUrl: currentDerivative?.fileUrl ?? null,
      masterLabel: 'ORIGINAL MASTER',
      derivativeLabel: 'TRANSPARENT DERIVATIVE',
    },
  };
}
