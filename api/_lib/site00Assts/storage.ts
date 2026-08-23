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

export function getSite00AssetPublicUrl(storagePath: string): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(SITE00_ASSETS_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function uploadSite00AssetBuffer(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
  options?: { upsert?: boolean },
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(SITE00_ASSETS_BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: options?.upsert === true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return { publicUrl: getSite00AssetPublicUrl(storagePath), storagePath };
}

export async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

/** Returns true when the object exists in the configured assets bucket. */
export async function site00StorageObjectExists(storagePath: string): Promise<boolean> {
  const normalized = storagePath.replace(/^\/+/, '').trim();
  if (!normalized) return false;
  const supabase = getSupabaseAdmin();
  const lastSlash = normalized.lastIndexOf('/');
  const folder = lastSlash >= 0 ? normalized.slice(0, lastSlash) : '';
  const name = lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized;
  const { data, error } = await supabase.storage.from(SITE00_ASSETS_BUCKET).list(folder, { limit: 100 });
  if (error) return false;
  return (data ?? []).some((entry) => entry.name === name);
}
