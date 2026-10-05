/**
 * P0.VR.DESIGN-ASSET-MANAGEMENT1 — page asset manifest, regenerate/replace fixtures, UI guards.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  approveFounderUploadReplacement,
  approveRegeneratedAsset,
  listActivePageAssets,
  listPageAssetHistory,
  requestFixtureAssetRegeneration,
  stageFounderUploadReplacement,
  syncActivePageAssetManifest,
  validatePageAssetUpload,
} from '../shared/site00-design-workspace-production/designPageActiveAssetManifest.js';
import { createFixtureGrokStagedAsset, persistStagedGrokAsset } from '../shared/site00-design-workspace-production/designGrokAssetModel.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-ASSET-MANAGEMENT1', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    const memStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    };
    vi.stubGlobal('localStorage', memStorage);
    vi.stubGlobal('window', { localStorage: memStorage });
    const approved = createFixtureGrokStagedAsset({
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      slot: 'hero-image',
      runId: 'seed-run',
    });
    persistStagedGrokAsset({ ...approved, status: 'APPROVED' });
    syncActivePageAssetManifest('ndxbook', 'ndxbook:overview');
  });

  it('lists active page assets from manifest (page-scoped)', () => {
    const assets = listActivePageAssets('ndxbook', 'ndxbook:overview');
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((a) => a.pageId === 'ndxbook:overview')).toBe(true);
  });

  it('fixture regenerate stages new asset without replacing active until approval', () => {
    const active = listActivePageAssets('ndxbook', 'ndxbook:overview')[0]!;
    const result = requestFixtureAssetRegeneration({
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      sourceAssetId: active.assetId,
      instruction: 'Improve lighting',
    });
    expect(result?.staged.status).toBe('STAGED');
    expect(result?.staged.slot).toBe(active.slot);
    const sourceAfter = listActivePageAssets('ndxbook', 'ndxbook:overview').find((a) => a.slot === active.slot);
    expect(sourceAfter?.assetId).toBe(active.assetId);
    expect(listPageAssetHistory('ndxbook', 'ndxbook:overview', active.slot).some((e) => e.type === 'asset_regenerated')).toBe(
      true,
    );
  });

  it('approve regenerated asset updates manifest pointer and preserves history', () => {
    const active = listActivePageAssets('ndxbook', 'ndxbook:overview')[0]!;
    const result = requestFixtureAssetRegeneration({
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      sourceAssetId: active.assetId,
    });
    const approved = approveRegeneratedAsset('ndxbook', 'ndxbook:overview', result!.staged.assetId);
    expect(approved?.isActiveForSlot).toBe(true);
    expect(approved?.assetId).toBe(result!.staged.assetId);
    expect(approved?.assetId).not.toBe(active.assetId);
    expect(listPageAssetHistory('ndxbook', 'ndxbook:overview', active.slot).some((e) => e.type === 'asset_version_activated')).toBe(
      true,
    );
  });

  it('validates upload type and size for replace flow', () => {
    const active = listActivePageAssets('ndxbook', 'ndxbook:overview')[0]!;
    const bad = validatePageAssetUpload({
      mimeType: 'application/pdf',
      byteSize: 1000,
      width: 512,
      height: 512,
      slotFormat: active.format,
      slotWidth: active.width,
      slotHeight: active.height,
    });
    expect(bad.ok).toBe(false);
    const good = validatePageAssetUpload({
      mimeType: 'image/png',
      byteSize: 1000,
      width: active.width,
      height: active.height,
      slotFormat: active.format,
      slotWidth: active.width,
      slotHeight: active.height,
    });
    expect(good.ok).toBe(true);
  });

  it('founder replace stages then approves without deleting prior version', () => {
    const active = listActivePageAssets('ndxbook', 'ndxbook:overview')[0]!;
    const dataUrl =
      'data:image/svg+xml,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="#222" width="100%" height="100%"/></svg>');
    const staged = stageFounderUploadReplacement({
      projectId: 'ndxbook',
      pageId: 'ndxbook:overview',
      sourceAssetId: active.assetId,
      previewDataUrl: dataUrl,
      format: 'SVG',
      width: 64,
      height: 64,
      byteSize: 400,
    });
    expect(staged?.status).toBe('STAGED');
    const next = approveFounderUploadReplacement('ndxbook', 'ndxbook:overview', staged!.assetId);
    expect(next?.origin).toBe('FOUNDER_UPLOAD');
    expect(listPageAssetHistory('ndxbook', 'ndxbook:overview', active.slot).some((e) => e.type === 'asset_version_replaced')).toBe(
      true,
    );
  });

  it('wires PAGE ASSETS drawer and action controls in UI source', () => {
    expect(read('src/site00/components/designBench/opusDirect/PageAssetsManagementPanel.tsx')).toContain(
      'CONFIRM REGENERATE',
    );
    expect(read('src/site00/components/designBench/opusDirect/PageAssetsManagementPanel.tsx')).toContain(
      'CONFIRM REPLACEMENT',
    );
    expect(read('src/site00/components/designBench/opusDirect/DesignPageSystemReviewSection.tsx')).toContain(
      'openPageAssetsPanel',
    );
    expect(read('src/site00/components/designBench/opusDirect/TwinOpusDirectOverlays.tsx')).toContain('OV-PAGE-ASSETS');
    expect(read('src/site00/components/designBench/opusDirect/PageAssetsManagementPanel.tsx')).not.toContain('fetch(');
  });
});
