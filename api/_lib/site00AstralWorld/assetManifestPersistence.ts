/**
 * P0.E.FT5.1 — Persist Astral World asset records to Supabase storage.
 */

import { getSupabaseAdmin } from '../supabase.js';
import { SITE00_ASSETS_BUCKET } from '../site00Assts/storage.js';
import type { AstralAssetRecord } from '../../../shared/site00-astral-world/generation/types.js';
import { AW_VISUAL_FOUNDATION_BATCH } from '../../../shared/site00-astral-world/generation/types.js';

const MANIFEST_PATH = `site00/astral-world/generation/${AW_VISUAL_FOUNDATION_BATCH}/manifest.json`;

export function astralManifestStoragePath(): string {
  return MANIFEST_PATH;
}

export async function loadAstralAssetManifest(): Promise<Record<string, AstralAssetRecord> | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from(SITE00_ASSETS_BUCKET).download(MANIFEST_PATH);
    if (error || !data) return null;
    const text = await data.text();
    const parsed = JSON.parse(text) as Record<string, AstralAssetRecord>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveAstralAssetManifest(records: Record<string, AstralAssetRecord>): Promise<void> {
  const supabase = getSupabaseAdmin();
  const body = JSON.stringify(records, null, 2);
  const { error } = await supabase.storage.from(SITE00_ASSETS_BUCKET).upload(
    MANIFEST_PATH,
    Buffer.from(body, 'utf8'),
    { contentType: 'application/json', upsert: true },
  );
  if (error) throw new Error(`Failed to persist Astral asset manifest: ${error.message}`);
}

export async function hydrateAstralAssetStore(
  records: Map<string, AstralAssetRecord>,
): Promise<boolean> {
  const loaded = await loadAstralAssetManifest();
  if (!loaded) return false;
  for (const [key, record] of Object.entries(loaded)) {
    records.set(key, record);
  }
  return true;
}
