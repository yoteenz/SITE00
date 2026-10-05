import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  RESIDENT_GEOMETRY_FRAMES,
  STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES,
} from '../shared/site00-studio-world/resident-fabrication/residentGeometryFrames.js';
import {
  buildCastingPanelResidentGeometryMap,
  buildInitialResidentFabricationManifest,
  fabricationAssetId,
  RESIDENT_FABRICATION_PACK_ROOT,
} from '../src/site00/productionAssets/residentFabricationManifest.js';
import { getProductionAsset } from '../src/site00/productionAssets/productionAssetRegistry.js';

describe('studioWorldResidentFabricationGeometryOpenart1', () => {
  it('8 residents × 16 geometry frames in manifest scaffold', () => {
    const m = buildInitialResidentFabricationManifest();
    expect(m).toHaveLength(8 * 16);
    expect(new Set(m.map((r) => r.resident_id)).size).toBe(8);
    expect(RESIDENT_GEOMETRY_FRAMES).toHaveLength(16);
  });

  it('each profile portrait asset exists on disk (lite authority)', () => {
    for (const p of STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES) {
      const rec = getProductionAsset(p.portraitAssetId);
      expect(rec?.repoPath, p.residentId).toBeTruthy();
      const abs = path.join(process.cwd(), rec!.repoPath!);
      expect(fs.existsSync(abs), abs).toBe(true);
    }
  });

  it('casting / fabrication stage map leaves performance and wardrobe NOT_GENERATED', () => {
    const map = buildCastingPanelResidentGeometryMap();
    for (const id of ['SW-001', 'SW-002', 'SW-003', 'SW-004', 'SW-005', 'SW-006', 'SW-007', 'SW-008'] as const) {
      expect(map[id].performance.status).toBe('NOT_GENERATED');
      expect(map[id].wardrobe.status).toBe('NOT_GENERATED');
      expect(map[id].continuity.status).toBe('NOT_GENERATED');
    }
  });

  it('fabrication asset ids are unique per frame', () => {
    const ids = buildInitialResidentFabricationManifest().map((r) => r.fabrication_asset_id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(fabricationAssetId('SW-001', 1)).toBe('fabrication.sw-001.geometry.f01');
  });

  it('pack root is under artifacts (not public runtime mount)', () => {
    expect(RESIDENT_FABRICATION_PACK_ROOT.startsWith('artifacts/')).toBe(true);
  });
});
