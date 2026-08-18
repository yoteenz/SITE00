import { getSupabaseAdmin } from '../supabase.js';

export const SITE00_ASSETS_BUCKET = process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';
export const SITE00_STORAGE_ROOT = 'site00/assts';

export function buildVersionStoragePath(
  batchKey: string,
  assetKey: string,
  versionNumber: number,
  ext: 'webp' | 'png' = 'webp',
  tier: 'generated' | 'approved' | 'production' = 'generated',
): string {
  const safeBatch = batchKey.replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeAsset = assetKey.replace(/[^a-zA-Z0-9-_]/g, '_');
  const ver = String(versionNumber).padStart(2, '0');
  return `${SITE00_STORAGE_ROOT}/batches/${safeBatch}/${tier}/${safeAsset}_v${ver}.${ext}`;
}

export function buildThumbnailPath(fullPath: string): string {
  return fullPath.replace(/(\.[a-z]+)$/i, '_thumb$1');
}

export async function uploadSite00AssetBuffer(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(SITE00_ASSETS_BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from(SITE00_ASSETS_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

export async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}
