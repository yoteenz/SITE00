/**
 * Character-family media resolution — portrait + geometry pack + mounted production asset variants.
 */
import { getProductionAsset, productionAssetPublicPath } from '../../../productionAssets/index.js';
import { buildInitialResidentFabricationManifest } from '../../../productionAssets/residentFabricationManifest.js';
import { geometrySlotCategory } from '../../../../../shared/site00-studio-world/resident-fabrication/residentGeometryCompleteRegistry.js';
import type { GeometryCompleteSlot } from '../../../../../shared/site00-studio-world/resident-fabrication/residentGeometryCompletePack.js';
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

function residentSwIdFromRealm(x: RealmRecord): string | null {
  const m = x.id.match(/SW-(\d{3})/i) ?? x.title?.match(/SW-(\d{3})/i);
  if (m) return `SW-${m[1]}`;
  const byName: Record<string, string> = {
    'etta vale': 'SW-001',
    'zuri xu': 'SW-002',
    'jules mercer': 'SW-003',
    'noa kline': 'SW-004',
    'caspian reed': 'SW-005',
    'iona wells': 'SW-006',
    'marlowe saint': 'SW-007',
    'elio vahn': 'SW-008',
    'elio "ev" vahn': 'SW-008',
  };
  const key = x.title?.toLowerCase().trim();
  return key ? byName[key] ?? null : null;
}

/** Canonical portrait first, then resident geometry pack, then lineage `to` assets. */
export function characterMediaAssets(x: RealmRecord): readonly CharacterMediaAsset[] {
  const out: CharacterMediaAsset[] = [];
  const seen = new Set<string>();
  if (x.img) {
    out.push({ id: `${x.id}.portrait`, label: 'PORTRAIT', url: x.img, status: x.status });
    seen.add(x.img);
  }
  const swId = residentSwIdFromRealm(x);
  if (swId) {
    for (const frame of buildInitialResidentFabricationManifest().filter((f) => f.resident_id === swId)) {
      if (frame.approval_status === 'NOT_GENERATED' || !frame.relative_path) continue;
      const url =
        frame.openart_output_url ??
        (frame.relative_path.startsWith('public/')
          ? `/${frame.relative_path.replace(/^public\//, '')}`
          : productionAssetPublicPath(frame.fabrication_asset_id));
      if (!url) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      const slot = frame.relative_path.split('/').pop()?.replace('.png', '') ?? frame.frame_type;
      const cat = geometrySlotCategory(slot as GeometryCompleteSlot);
      out.push({
        id: frame.fabrication_asset_id,
        label: cat,
        url,
        status: frame.approval_status.replace(/_/g, ' '),
      });
    }
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
