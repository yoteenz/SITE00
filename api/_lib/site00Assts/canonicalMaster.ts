import { getSupabaseAdmin } from '../supabase.js';
import { publicUrlForStoragePath } from './service.js';
import type { Site00BatchManifest } from './types.js';

/** Locked user-supplied world source — NOT a FAL generation candidate. */
export const CANONICAL_MASTER_ASSET_KEY = 's00_env_assts_canonical_master';

export const CANONICAL_MASTER_SLOT_KEY = 'site00.assetVault.environments.canonicalMaster';

export const ASSTS_WORLD_IDENTITY = 'ASSTS_ASSET_VAULT_V1';

/** Production PNG in live-preview bucket (founder-supplied). */
export const CANONICAL_MASTER_STORAGE_PATH =
  process.env.SITE00_ASSTS_CANONICAL_MASTER_PATH?.trim() ||
  'site00/8574773C-D4F6-49B3-A7BA-C4D4B2C1E6F7.png';

export const CANONICAL_REFERENCE_MODEL = 'fal-ai/nano-banana-pro/edit';

/** Documented conditioning intent — nano-banana-pro/edit uses image_urls as primary anchor. */
export const CANONICAL_REFERENCE_STRENGTH = 'high-preservation';

export function manifestUsesCanonicalReference(manifest: Site00BatchManifest | null): boolean {
  return Boolean(manifest?.useCanonicalReference);
}

export function getCanonicalMasterPublicUrl(): string | null {
  return publicUrlForStoragePath(CANONICAL_MASTER_STORAGE_PATH);
}

export async function getCanonicalMasterAsset() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site00_logical_assets')
    .select('*')
    .eq('asset_key', CANONICAL_MASTER_ASSET_KEY)
    .maybeSingle();
  return data;
}

export async function getCanonicalMasterReferenceUrl(): Promise<string | null> {
  const asset = await getCanonicalMasterAsset();
  if (asset?.current_version_id) {
    const supabase = getSupabaseAdmin();
    const { data: version } = await supabase
      .from('site00_asset_versions')
      .select('file_path, preview_path, thumbnail_path')
      .eq('id', asset.current_version_id)
      .maybeSingle();
    const path = version?.preview_path ?? version?.file_path ?? version?.thumbnail_path;
    if (path) return publicUrlForStoragePath(path);
  }
  return getCanonicalMasterPublicUrl();
}

export function canonicalReferencePromptBlock(viewInstruction: string): string {
  return `REFERENCE IMAGE IS THE CANONICAL ARCHITECTURAL MASTER.

Render a new camera view inside the exact same architectural environment shown in the supplied reference.

Preserve the identity of the building: monumental symmetrical white marble Asset Vault, repeated nested illuminated arches, very tall vaulted proportions, polished reflective white marble floor, delicate pale-gray marble veining, recessed symmetrical display niches, translucent glass/acrylic display structures, restrained metallic detailing, glowing architectural edge lighting, circular luminous ceiling architecture, bright central vanishing point, and small precise red four-point Site 00 alignment emblems.

This is NOT a redesign and NOT a new building. Maintain the same architectural vocabulary, materials, proportions, lighting temperature, geometry, luxury level, and futuristic museum-vault atmosphere as the reference.

Photorealistic luxury architectural visualization. Extremely high material fidelity. Physically believable reflections. Bright white high-key lighting. Clean symmetrical geometry. Mobile vertical 9:16 framing. Environment photography ONLY.

DO NOT: different building, generic modern interior, office, hotel, apartment, retail store, generic gallery, conference room, dominant windows, furniture, chairs, benches, plants, people, signage, text, dark lighting, yellow/cream lighting, wood, black architecture, industrial architecture, random doors, blue accents, gold-dominant accents, asymmetrical redesign, low ceiling, flat empty box.

VIEW INSTRUCTION:
${viewInstruction}`;
}

/** Register locked canonical master asset (user-supplied PNG). Idempotent. */
export async function ensureCanonicalMasterRegistered(): Promise<{ assetId: string; versionId: string }> {
  const supabase = getSupabaseAdmin();
  const publicUrl = getCanonicalMasterPublicUrl();
  if (!publicUrl) throw new Error('Canonical master public URL could not be resolved');

  await supabase.from('site00_asset_slots').upsert(
    {
      slot_key: CANONICAL_MASTER_SLOT_KEY,
      description: 'ASSTS canonical environment master (world source)',
      asset_type: 'environment',
      environment: 'assts',
    },
    { onConflict: 'slot_key' },
  );

  let asset = await getCanonicalMasterAsset();

  if (!asset) {
    const { data: created, error } = await supabase
      .from('site00_logical_assets')
      .insert({
        asset_key: CANONICAL_MASTER_ASSET_KEY,
        display_name: 'ASSTS / CANONICAL ENVIRONMENT MASTER',
        asset_type: 'environment',
        category: 'ASSTS / ENVIRONMENTS',
        status: 'LOCKED',
        required: false,
        semantic_slot_key: CANONICAL_MASTER_SLOT_KEY,
        locked_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    asset = created;
  } else if (asset.status !== 'LOCKED') {
    await supabase
      .from('site00_logical_assets')
      .update({ status: 'LOCKED', locked_at: new Date().toISOString() })
      .eq('id', asset.id);
  }

  const { data: existingVersion } = await supabase
    .from('site00_asset_versions')
    .select('id')
    .eq('asset_id', asset.id)
    .eq('version_number', 1)
    .maybeSingle();

  let versionId = existingVersion?.id;

  if (!versionId) {
    const { data: version, error: vErr } = await supabase
      .from('site00_asset_versions')
      .insert({
        asset_id: asset.id,
        version_number: 1,
        file_path: CANONICAL_MASTER_STORAGE_PATH,
        thumbnail_path: CANONICAL_MASTER_STORAGE_PATH,
        preview_path: CANONICAL_MASTER_STORAGE_PATH,
        generation_provider: 'user-supplied',
        generation_model: null,
        prompt_version: 'locked-v1',
        prompt_snapshot: 'Founder-supplied ASSTS canonical environment master — world source of truth.',
        status: 'LOCKED',
        generation_parameters: {
          worldIdentity: ASSTS_WORLD_IDENTITY,
          role: 'CANONICAL_MASTER',
          userSupplied: true,
        },
      })
      .select('id')
      .single();
    if (vErr) throw new Error(vErr.message);
    versionId = version.id;
  }

  await supabase
    .from('site00_logical_assets')
    .update({
      current_version_id: versionId,
      production_version_id: versionId,
      approved_version_id: versionId,
      status: 'LOCKED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', asset.id);

  await supabase
    .from('site00_asset_slots')
    .update({
      current_locked_asset_id: asset.id,
      current_locked_version_id: versionId,
      updated_at: new Date().toISOString(),
    })
    .eq('slot_key', CANONICAL_MASTER_SLOT_KEY);

  return { assetId: asset.id, versionId };
}

export async function getCanonicalMasterReviewContext() {
  const asset = await getCanonicalMasterAsset();
  const url = await getCanonicalMasterReferenceUrl();
  return {
    assetKey: CANONICAL_MASTER_ASSET_KEY,
    assetId: asset?.id ?? null,
    previewUrl: url,
    worldIdentity: ASSTS_WORLD_IDENTITY,
    storagePath: CANONICAL_MASTER_STORAGE_PATH,
    role: 'CANONICAL_MASTER' as const,
  };
}
