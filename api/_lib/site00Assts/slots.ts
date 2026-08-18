import { getSupabaseAdmin } from '../supabase.js';
import type { ProductionAssetResolution } from './types.js';
import { publicUrlForStoragePath } from './service.js';
import { ASSTS_CANONICAL_SLOT_ALIASES, resolvePrimarySlotKey } from './vaultLineage.js';

/** Canonical hero asset until slot lock promotion in Supabase. */
const ASSTS_LIBRARY_HERO_ASSET_PATH = '52D76B9A-8808-4A00-A89D-28767F21E385.png';

function canonicalLibraryHeroUrl(): string | null {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, '');
  if (!base) return null;
  return `${base}/storage/v1/object/public/live-preview/site00/${ASSTS_LIBRARY_HERO_ASSET_PATH}`;
}

export const ASSTS_FALLBACK_SLOTS: Record<string, { cssClass: string }> = {
  'assts.library.environment.mobile': { cssClass: 'site00-assts-env-fallback--library' },
  'assts.library.hero.mobile': { cssClass: 'site00-assts-env-fallback--library-hero' },
  'assts.batch.environment.mobile': { cssClass: 'site00-assts-env-fallback--batch' },
  'assts.inspection.environment.mobile': { cssClass: 'site00-assts-env-fallback--inspection' },
};

export async function resolveProductionAsset(slotKey: string): Promise<ProductionAssetResolution> {
  const primaryKey = resolvePrimarySlotKey(slotKey);
  const supabase = getSupabaseAdmin();
  const { data: slot } = await supabase.from('site00_asset_slots').select('*').eq('slot_key', primaryKey).maybeSingle();

  if (slot?.current_locked_version_id) {
    const { data: version } = await supabase
      .from('site00_asset_versions')
      .select('*')
      .eq('id', slot.current_locked_version_id)
      .maybeSingle();
    if (version?.file_path) {
      return {
        slotKey,
        source: 'locked',
        url: publicUrlForStoragePath(version.file_path),
        thumbnailUrl: publicUrlForStoragePath(version.thumbnail_path ?? version.preview_path ?? version.file_path),
        versionId: version.id,
        assetId: version.asset_id,
      };
    }
  }

  const heroUrl = canonicalLibraryHeroUrl();
  return {
    slotKey,
    source: 'fallback',
    url: primaryKey === 'assts.library.hero.mobile' || slotKey === 'assts.library.hero.mobile' ? heroUrl : null,
    thumbnailUrl:
      primaryKey === 'assts.library.hero.mobile' || slotKey === 'assts.library.hero.mobile' ? heroUrl : null,
  };
}

async function promoteSlot(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  slotKey: string,
  assetId: string,
  approvedVersionId: string,
): Promise<void> {
  await supabase
    .from('site00_asset_slots')
    .update({
      current_locked_asset_id: assetId,
      current_locked_version_id: approvedVersionId,
      updated_at: new Date().toISOString(),
    })
    .eq('slot_key', slotKey);
}

export async function lockBatchAndPromoteSlots(batchId: string): Promise<{ ok: boolean; error?: string; slots?: string[] }> {
  const supabase = getSupabaseAdmin();

  const { data: batch } = await supabase.from('site00_batches').select('*').eq('id', batchId).single();
  if (!batch) return { ok: false, error: 'Batch not found' };
  if (batch.status === 'LOCKED') return { ok: true, slots: [] };

  const { data: assets } = await supabase.from('site00_logical_assets').select('*').eq('batch_id', batchId);
  const required = (assets ?? []).filter((a) => a.required);

  const notReady = required.filter((a) => !a.approved_version_id);
  if (notReady.length) {
    return { ok: false, error: `Batch not ready — ${notReady.length} required asset(s) missing approval` };
  }

  const promoted: string[] = [];

  for (const asset of required) {
    const approvedVersionId = asset.approved_version_id as string;
    const slotKey = asset.semantic_slot_key as string | null;
    if (!slotKey) continue;

    await supabase.from('site00_asset_versions').update({ status: 'LOCKED' }).eq('id', approvedVersionId);

    await supabase
      .from('site00_logical_assets')
      .update({
        status: 'LOCKED',
        production_version_id: approvedVersionId,
        locked_at: new Date().toISOString(),
      })
      .eq('id', asset.id);

    await promoteSlot(supabase, slotKey, asset.id, approvedVersionId);
    promoted.push(slotKey);

    const aliasEntry = Object.entries(ASSTS_CANONICAL_SLOT_ALIASES).find(([, primary]) => primary === slotKey);
    if (aliasEntry) {
      await promoteSlot(supabase, aliasEntry[0], asset.id, approvedVersionId);
      promoted.push(aliasEntry[0]);
    }

    await supabase.from('site00_review_events').insert({
      asset_id: asset.id,
      asset_version_id: approvedVersionId,
      batch_id: batchId,
      action: 'LOCK',
      note: `Promoted to slot ${slotKey}`,
    });
  }

  await supabase
    .from('site00_batches')
    .update({ status: 'LOCKED', locked_at: new Date().toISOString() })
    .eq('id', batchId);

  await supabase.from('site00_review_events').insert({
    batch_id: batchId,
    asset_id: required[0]?.id,
    action: 'BATCH_LOCKED',
    note: `Batch ${batch.batch_key} locked — canonical Asset Vault environments`,
  });

  return { ok: true, slots: promoted };
}
