import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_ASSETS } from '../src/site00/productionAssets/productionAssetRegistry';
import { PRODUCTION_ROUTE_ASSET_MANIFESTS } from '../src/site00/productionAssets/routeAssetManifests';
import { STUDIO_WORLD_RESIDENTS } from '../src/site00/productionAssets/studioWorldResidents';

const KNOWN_ROUTES = [
  '/production',
  '/production/queue',
  '/production/activity',
  '/production/libraries',
  '/production/:slug/design',
  '/production/:slug/experience',
  '/production/:slug/expression',
];

describe('production OpenArt asset forensics mount1', () => {
  it('registry ids are unique and mounted files exist', () => {
    const ids = PRODUCTION_ASSETS.map((a) => a.assetId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const asset of PRODUCTION_ASSETS) {
      if (!asset.repoPath) continue;
      expect(existsSync(asset.repoPath), asset.assetId).toBe(true);
      if (asset.publicPath) expect(asset.publicPath.startsWith('/site00/')).toBe(true);
      expect(asset.publicPath ?? '').not.toMatch(/openart\.ai|api[_-]?key|secret/i);
      expect(asset.notes).not.toMatch(/sk-|Bearer /);
    }
  });

  it('manifests reference registry ids and known routes', () => {
    const ids = new Set(PRODUCTION_ASSETS.map((a) => a.assetId));
    for (const manifest of PRODUCTION_ROUTE_ASSET_MANIFESTS) {
      expect(KNOWN_ROUTES).toContain(manifest.route);
      for (const id of [...manifest.requiredAssetIds, ...manifest.optionalAssetIds]) {
        expect(ids.has(id), `${manifest.manifestId} ${id}`).toBe(true);
      }
    }
  });

  it('keeps residents, experience, expression, and library expressions distinct', () => {
    expect(STUDIO_WORLD_RESIDENTS.map((r) => r.id)).toEqual([
      'SW-001',
      'SW-002',
      'SW-003',
      'SW-004',
      'SW-005',
      'SW-006',
      'SW-007',
      'SW-008',
    ]);
    const exp = PRODUCTION_ASSETS.filter((a) => a.productionTab === 'experience').map((a) => a.assetId);
    const expr = PRODUCTION_ASSETS.filter((a) => a.productionTab === 'expression').map((a) => a.assetId);
    expect(exp.some((id) => id.startsWith('experience.'))).toBe(true);
    expect(expr.some((id) => id.startsWith('expression.'))).toBe(true);
    expect(exp.some((id) => id.startsWith('expression.'))).toBe(false);
    const library = PRODUCTION_ROUTE_ASSET_MANIFESTS.find((m) => m.manifestId === 'library.root');
    expect(library?.productionTab).toBe('library');
    expect(library?.manifestId).not.toContain('expression');
  });
});
