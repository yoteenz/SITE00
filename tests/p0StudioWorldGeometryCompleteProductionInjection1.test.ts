import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildMasterGeometryCompleteManifest,
  listGeometryCompleteResidents,
} from '../shared/site00-studio-world/resident-fabrication/residentGeometryCompleteRegistry.js';
import {
  GEOMETRY_COMPLETE_FRAMES_PER_RESIDENT,
  RESIDENT_OUTFIT_SYSTEM,
} from '../shared/site00-studio-world/resident-fabrication/residentGeometryCompletePack.js';
import {
  buildCurrentFabricationSourceAuthority,
  FABRICATION_BATCH_STATUS,
} from '../shared/site00-studio-world/resident-fabrication/fabricationSourceAuthority.js';
import { buildInitialResidentFabricationManifest } from '../src/site00/productionAssets/residentFabricationManifest.js';
import { characterMediaAssets } from '../src/site00/components/productionAuthority/realm/libraryCharacterMedia.js';

describe('p0StudioWorldGeometryCompleteProductionInjection1', () => {
  it('all 8 residents have geometry manifests with 14 target slots', () => {
    const master = buildMasterGeometryCompleteManifest();
    expect(master.residents).toHaveLength(8);
    for (const r of master.residents) {
      expect(r.assets).toHaveLength(GEOMETRY_COMPLETE_FRAMES_PER_RESIDENT);
      expect(RESIDENT_OUTFIT_SYSTEM[r.resident_id]).toBe(r.outfit_system);
    }
  });

  it('women leggings / men compression shorts uniform authority paths exist', () => {
    for (const id of listGeometryCompleteResidents()) {
      const auth = buildCurrentFabricationSourceAuthority(id);
      expect(auth?.outfitSystem).toBe(RESIDENT_OUTFIT_SYSTEM[id]);
      const uniformPath = path.join(process.cwd(), auth!.fullBodyAuthority.repoPath);
      expect(fs.existsSync(uniformPath), uniformPath).toBe(true);
    }
  });

  it('fabrication manifest has 16 frames per resident (2 anchors + 14 new roles)', () => {
    const m = buildInitialResidentFabricationManifest();
    expect(m).toHaveLength(8 * 16);
    const roles = m.map((x) => x.fabrication_asset_id);
    expect(new Set(roles).size).toBe(roles.length);
  });

  it('Expression fabrication batch status reflects geometry-complete review', () => {
    expect(FABRICATION_BATCH_STATUS).toBe('GEOMETRY_COMPLETE_IN_REVIEW');
  });

  it('Library character media includes portrait anchor for Jules when realm record matches', () => {
    const media = characterMediaAssets({
      id: 'char-sw-003',
      title: 'Jules Mercer',
      kicker: 'CHARACTER',
      sub: '',
      lifecycle: 'LIVE',
      tone: 'green',
      facts: [],
      tags: [],
      source: 'test',
      version: null,
      usedBy: [],
      from: [],
      to: [],
      open: null,
      metric: null,
      img: '/site00/studio-world-residents/casting-thumbnails-v1/SW-RESIDENT-003_JULES_MERCER.jpg',
      status: 'CANON',
    } as Parameters<typeof characterMediaAssets>[0]);
    expect(media.some((m) => m.label === 'PORTRAIT')).toBe(true);
    const anchors = media.filter((m) => m.url.includes('00_APPROVED'));
    expect(anchors.length).toBeGreaterThanOrEqual(1);
  });
});
