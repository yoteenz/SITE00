import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { generateNdxbookVisualAssetPass, loadGeneratedAssetManifest, manifestKey } from './assetGeneration.js';
import { generateTerritories } from './territories.js';
import { synthesizeCreativeBrief } from './intelligenceBrief.js';
import { NDXBOOK_CREATIVE_ASSET_BRIEFS } from './visualAssetStrategy.js';

describe('NDXBOOK Creative Direction — governed FAL asset generation', () => {
  beforeEach(() => {
    vi.stubEnv('FAL_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('never fabricates assets when FAL_KEY is not configured', async () => {
    const result = await generateNdxbookVisualAssetPass('ndxbook', 'founder@test.com');
    expect(result.skipped).toBe(true);
    expect(result.generated).toHaveLength(0);
    expect(result.requested).toBe(0);
  });

  it('persisted manifest (if present on disk) never carries an APPROVED state — GENERATED never implies APPROVED', () => {
    const manifest = loadGeneratedAssetManifest('ndxbook');
    for (const asset of Object.values(manifest)) {
      expect(asset.approvalState).not.toBe('APPROVED');
      expect(['GENERATED', 'PROPOSED']).toContain(asset.approvalState);
      expect(asset.provenance).toBeTruthy();
      expect((asset.provenance as Record<string, unknown>).source).toBe('FAL');
    }
  });

  it('manifest keys correspond to real curated briefs, and territories.js attaches them onto matching specimens', () => {
    const manifest = loadGeneratedAssetManifest('ndxbook');
    const briefKeys = new Set(NDXBOOK_CREATIVE_ASSET_BRIEFS.map((b) => manifestKey(b.territoryKey, b.specimenType)));
    for (const key of Object.keys(manifest)) {
      expect(briefKeys.has(key)).toBe(true);
    }

    if (Object.keys(manifest).length > 0) {
      const brief = synthesizeCreativeBrief('ndxbook', [], 5);
      const territories = generateTerritories(brief);
      let attached = 0;
      for (const t of territories) {
        for (const s of t.specimens) {
          const key = manifestKey(t.rendererKey, s.specimenType);
          if (manifest[key]) {
            expect(s.imageAsset).toBeTruthy();
            expect(s.imageAsset?.url).toBe(manifest[key].url);
            attached++;
          }
        }
      }
      expect(attached).toBe(Object.keys(manifest).length);
    }
  });

  it('org isolation — a non-ndxbook org never receives NDXBOOK-specific generated imagery', () => {
    const brief = synthesizeCreativeBrief('some-other-org', [], 0);
    const territories = generateTerritories(brief);
    for (const t of territories) {
      for (const s of t.specimens) {
        expect(s.imageAsset).toBeFalsy();
      }
    }
  });

  it('specimens without a manifest entry keep imageAsset falsy (no auto-fabrication)', () => {
    const brief = synthesizeCreativeBrief('ndxbook', [], 5);
    const territories = generateTerritories(brief);
    const briefKeys = new Set(NDXBOOK_CREATIVE_ASSET_BRIEFS.map((b) => manifestKey(b.territoryKey, b.specimenType)));
    for (const t of territories) {
      for (const s of t.specimens) {
        const key = manifestKey(t.rendererKey, s.specimenType);
        if (!briefKeys.has(key)) {
          expect(s.imageAsset).toBeFalsy();
        }
      }
    }
  });
});
