/**
 * Resident geometry fabrication records — FABRICATION_IN_REVIEW only (not runtime canonical portraits).
 */
import type { ProductionAssetRecord } from './types.js';
import {
  buildInitialResidentFabricationManifest,
  type ResidentFabricationFrameRecord,
} from './residentFabricationManifest.js';

export type { ResidentFabricationFrameRecord };

/** Panel / casting UI: geometry stage pointers keyed by resident id. */
export { buildCastingPanelResidentGeometryMap } from './residentFabricationManifest.js';

export function residentFabricationRecordsFromManifest(
  frames: readonly ResidentFabricationFrameRecord[],
): ProductionAssetRecord[] {
  return frames
    .filter((f) => f.openart_output_url)
    .map((f) => ({
      assetId: f.fabrication_asset_id,
      canonicalName: `${f.resident_id.toLowerCase()}.${f.frame_type}`,
      sourceType: 'OPENART' as const,
      repoPath: f.relative_path.startsWith('artifacts/') ? f.relative_path : null,
      publicPath: null,
      productionTab: 'expression' as const,
      assetRole: 'RESIDENT_FABRICATION_GEOMETRY',
      authorityStatus: 'FABRICATION_IN_REVIEW' as const,
      usedByRoutes: [] as readonly string[],
      variantOf: f.identity_source,
      confidence: f.identity_confidence,
      notes: `Geometry frame ${f.frame_number} ${f.frame_type}. approval=${f.approval_status}. ${f.continuity_notes}`,
    }));
}

export function defaultResidentFabricationManifestFrames(): ResidentFabricationFrameRecord[] {
  return buildInitialResidentFabricationManifest();
}
