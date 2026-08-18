import type { Site00ManifestAsset } from './types.js';
import { getBatchManifestByKey } from './manifests.js';
import {
  getAssetByKey,
  getVersionsForAsset,
  listAssetsForBatch,
  publicUrlForStoragePath,
  type DbAsset,
} from './service.js';

export const VAULT_LIBRARY_ASSET_KEY = 's00_env_assts_library_mobile';

/** Canonical production slot aliases (resolve to primary ASSTS mobile slots). */
export const ASSTS_CANONICAL_SLOT_ALIASES: Record<string, string> = {
  'site00.assetVault.environments.library': 'assts.library.environment.mobile',
  'site00.assetVault.environments.batchReview': 'assts.batch.environment.mobile',
  'site00.assetVault.environments.inspection': 'assts.inspection.environment.mobile',
};

export const PRIMARY_TO_CANONICAL_ALIAS: Record<string, string> = Object.fromEntries(
  Object.entries(ASSTS_CANONICAL_SLOT_ALIASES).map(([alias, primary]) => [primary, alias]),
);

export function resolvePrimarySlotKey(slotKey: string): string {
  return ASSTS_CANONICAL_SLOT_ALIASES[slotKey] ?? slotKey;
}

export function getManifestAssetMeta(batchKey: string, assetKey: string) {
  const manifest = getBatchManifestByKey(batchKey);
  return manifest?.assets.find((a) => a.assetKey === assetKey) ?? null;
}

export function isVaultLibraryAsset(manifestAsset: Site00ManifestAsset | null, assetKey: string): boolean {
  if (manifestAsset?.environmentRole === 'library') return true;
  return assetKey === VAULT_LIBRARY_ASSET_KEY;
}

export function manifestUsesVaultLineage(manifest: Site00BatchManifest | null): boolean {
  return Boolean(manifest?.useVaultLineage);
}

/** Latest library environment file URL in batch — master reference for child zones. */
export async function getVaultMasterReferenceUrl(batchId: string): Promise<string | null> {
  const assets = await listAssetsForBatch(batchId);
  const library =
    assets.find((a) => a.asset_key === VAULT_LIBRARY_ASSET_KEY) ??
    assets.find((a) => getManifestAssetMeta('', a.asset_key)?.environmentRole === 'library');

  if (!library) {
    const batch = assets[0]?.batch_id;
    if (!batch) return null;
  }

  const libAsset = library ?? (await getAssetByKey(VAULT_LIBRARY_ASSET_KEY));
  if (!libAsset) return null;

  const versions = await getVersionsForAsset(libAsset.id);
  const withFile = versions
    .filter((v) => v.file_path || v.preview_path || v.thumbnail_path)
    .sort((a, b) => b.version_number - a.version_number);

  const pick =
    withFile.find((v) => v.id === libAsset.current_version_id) ??
    withFile.find((v) => ['NEEDS_REVIEW', 'APPROVED', 'LOCKED'].includes(v.status)) ??
    withFile[0];

  if (!pick) return null;
  const path = pick.preview_path ?? pick.file_path ?? pick.thumbnail_path;
  return path ? publicUrlForStoragePath(path) : null;
}

export async function assetHasActiveGeneration(asset: DbAsset): Promise<boolean> {
  if (asset.status === 'REGENERATING') return true;

  const supabase = (await import('../supabase.js')).getSupabaseAdmin();
  const { data: activeJobs } = await supabase
    .from('site00_generation_jobs')
    .select('id')
    .eq('asset_id', asset.id)
    .in('status', ['QUEUED', 'GENERATING'])
    .limit(1);

  return Boolean(activeJobs?.length);
}

export function vaultReferencePromptBlock(): string {
  return `REFERENCE IMAGE CONDITIONING: The attached image is the CANONICAL ASSET VAULT master environment (Library / Vault Entrance). Preserve EXACTLY: repeating monumental white marble arch geometry, material language, lighting, palette, floor reflection, glass/acrylic details, chrome restraint, Site 00 red micro-accents, and world identity. Change ONLY camera position and room function as described below. Do NOT invent a new building or unrelated interior.`;
}

/** Optional founder-supplied art-direction still (monumental arch hero) for library master seed. */
export function getVaultArtDirectionReferenceUrl(): string | null {
  const url = process.env.SITE00_ASSTS_VAULT_ART_DIRECTION_URL?.trim();
  return url || null;
}

export function vaultArtDirectionPromptBlock(): string {
  return `ART DIRECTION REFERENCE: The attached image is the approved Asset Vault architectural hero reference. Match its monumental repeating rounded marble arches, crisp white palette, polished reflective floor, symmetrical depth, glass/acrylic details, and Site 00 red micro-accents. Establish this as the canonical Asset Vault master environment. Environment photography ONLY — no UI, text, or people.`;
}
