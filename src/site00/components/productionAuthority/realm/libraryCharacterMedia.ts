/**
 * Character-family media resolution — portrait + mounted production asset variants only (no invented categories).
 */
import { getProductionAsset, productionAssetPublicPath } from '../../../productionAssets/index.js';
import type { RealmRecord } from './realmData.js';

export type CharacterMediaAsset = {
  id: string;
  label: string;
  url: string;
  status: string | null;
};

function labelForAssetId(assetId: string, fallback: string): string {
  const lower = assetId.toLowerCase();
  if (lower.includes('full') && lower.includes('body')) return 'FULL BODY';
  if (lower.includes('fabrication')) return 'FABRICATION';
  if (lower.includes('performance')) return 'PERFORMANCE';
  if (lower.includes('wardrobe')) return 'WARDROBE';
  if (lower.includes('continuity')) return 'CONTINUITY';
  if (lower.includes('portrait')) return 'PORTRAIT';
  return fallback;
}

/** Canonical portrait first, then lineage `to` assets that resolve in the production registry. */
export function characterMediaAssets(x: RealmRecord): readonly CharacterMediaAsset[] {
  const out: CharacterMediaAsset[] = [];
  const seen = new Set<string>();
  if (x.img) {
    out.push({ id: `${x.id}.portrait`, label: 'PORTRAIT', url: x.img, status: x.status });
    seen.add(x.img);
  }
  for (const aid of x.to) {
    const a = getProductionAsset(aid);
    const url = a ? productionAssetPublicPath(a.assetId) : null;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({
      id: aid,
      label: labelForAssetId(aid, a?.assetRole.replace(/_/g, ' ').toUpperCase() ?? 'VARIANT'),
      url,
      status: a?.authorityStatus ? a.authorityStatus.replace(/_/g, ' ') : null,
    });
  }
  return out;
}
