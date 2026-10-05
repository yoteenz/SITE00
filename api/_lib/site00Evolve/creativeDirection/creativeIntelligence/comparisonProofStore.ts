/**
 * Durable comparison proof asset manifest — Supabase storage paths, not expiring FAL URLs.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from '../../../supabase.js';
import { SITE00_ASSETS_BUCKET } from '../../../site00Assts/storage.js';
import type { ComparisonProofAsset, ComparisonProofType } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_DIR = join(__dirname, '..', 'generatedAssets');
const NDXBOOK_COMPARISON_SET_KEY = 'ndxbook:6-direction:v24:5e71f429';

type PersistedComparisonProofAsset = Omit<ComparisonProofAsset, 'url'>;

function manifestPath(): string {
  return join(MANIFEST_DIR, 'ndxbook.comparisonProofs.json');
}

export function comparisonSetKeyFor(fingerprint: string, profileVersion: number): string {
  return `ndxbook:6-direction:v${profileVersion}:${fingerprint}`;
}

export function loadComparisonProofManifest(): ComparisonProofAsset[] {
  const path = manifestPath();
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, 'utf8');
    const persisted = JSON.parse(raw) as PersistedComparisonProofAsset[];
    const supabase = getSupabaseAdmin();
    return persisted.map((entry) => {
      const { data } = supabase.storage.from(SITE00_ASSETS_BUCKET).getPublicUrl(entry.storagePath);
      return { ...entry, url: data.publicUrl };
    });
  } catch {
    return [];
  }
}

function saveComparisonProofManifest(assets: ComparisonProofAsset[]): void {
  if (!existsSync(MANIFEST_DIR)) mkdirSync(MANIFEST_DIR, { recursive: true });
  const persisted: PersistedComparisonProofAsset[] = assets.map(({ url: _url, ...rest }) => rest);
  writeFileSync(manifestPath(), `${JSON.stringify(persisted, null, 2)}\n`, 'utf8');
}

export function findComparisonProofAsset(params: {
  jobKey: string;
  assets?: ComparisonProofAsset[];
}): ComparisonProofAsset | null {
  const list = params.assets ?? loadComparisonProofManifest();
  return list.find((a) => buildAssetJobKey(a) === params.jobKey) ?? null;
}

export function buildAssetJobKey(asset: ComparisonProofAsset): string {
  return `${asset.comparisonSetKey}:${asset.directionId}:${asset.proofType}:${asset.promptHash}:${asset.model ?? 'code-native'}:${asset.referenceHash ?? 'none'}`;
}

export function groupProofAssetsByDirection(
  assets: ComparisonProofAsset[],
  comparisonSetKey: string,
): Record<string, Partial<Record<ComparisonProofType, ComparisonProofAsset>>> {
  const grouped: Record<string, Partial<Record<ComparisonProofType, ComparisonProofAsset>>> = {};
  for (const asset of assets) {
    if (asset.comparisonSetKey !== comparisonSetKey) continue;
    if (asset.qaState !== 'ACCEPT') continue;
    if (asset.productionState !== 'READY') continue;
    grouped[asset.directionId] ??= {};
    grouped[asset.directionId]![asset.proofType] = asset;
  }
  return grouped;
}

export function upsertComparisonProofAsset(asset: ComparisonProofAsset): ComparisonProofAsset {
  const all = loadComparisonProofManifest().filter((a) => buildAssetJobKey(a) !== buildAssetJobKey(asset));
  all.push(asset);
  saveComparisonProofManifest(all);
  return asset;
}

export function storagePathForComparisonProof(params: {
  comparisonIndex: number;
  proofType: ComparisonProofType;
  iteration: number;
}): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9-_]/g, '_');
  const iter = params.iteration > 0 ? `_i${params.iteration}` : '';
  return `site00/creative-direction/ndxbook/proofs/${String(params.comparisonIndex).padStart(2, '0')}/${safe(params.proofType)}${iter}.webp`;
}

export function createComparisonProofAssetId(): string {
  return randomUUID();
}

export { NDXBOOK_COMPARISON_SET_KEY };
