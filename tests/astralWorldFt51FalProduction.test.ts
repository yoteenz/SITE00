/**
 * P0.E.FT5.1 — Live FAL asset production + slot inhabitation
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach } from 'vitest';
import { getProductionPreflight } from '../api/_lib/site00AstralWorld/generationService.js';
import {
  resetAstralAssetStore,
  initializeMissingContracts,
  upsertAstralAssetRecord,
} from '../api/_lib/site00AstralWorld/assetRecordStore.js';
import {
  activateFounderAsset,
  dispatchP0Batch,
  getAstralAssetStoreSnapshot,
} from '../api/_lib/site00AstralWorld/generationService.js';
import { getContractBySlot, P0_SLOT_KEYS } from '../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { resolveAstralAsset, sanitizeClientAssetMap } from '../shared/site00-astral-world/generation/assetResolver.js';
import { KIOSK_HOTSPOT_MAP } from '../src/site00/astral-world/components/scenes/MobileAstralMallScene.js';
import { getHotspotsForScene } from '../shared/site00-astral-world/scenes/hotspotRegistry.js';
import { PROTOTYPE_KIOSKS } from '../shared/site00-astral-world/fixtures.js';

describe('P0.E.FT5.1 Astral World FAL Production', () => {
  beforeEach(() => {
    resetAstralAssetStore();
  });

  it('FT51-1 — production preflight exposes credential availability without secrets', () => {
    const preflight = getProductionPreflight();
    expect(['AVAILABLE', 'MISSING']).toContain(preflight.falKey);
    expect(['AVAILABLE', 'MISSING']).toContain(preflight.supabaseStorage);
    expect(preflight.falKeyClientExposure).toBe('SAFE');
    expect(JSON.stringify(preflight)).not.toMatch(/fal_/i);
  });

  it('FT51-2 — COFFEE_SHOP_TABLE_SCENE contract complete', () => {
    const contract = getContractBySlot('COFFEE_SHOP_TABLE_SCENE');
    expect(contract).toBeTruthy();
    expect(contract!.priority).toBe('P1');
    expect(contract!.referenceSources.length).toBeGreaterThan(0);
    expect(contract!.targetSlot).toBe('COFFEE_SHOP_TABLE_SCENE');
  });

  it('FT51-3 — dispatch P0 skips duplicates when already active', async () => {
    initializeMissingContracts();
    upsertAstralAssetRecord({
      ...getAstralAssetStoreSnapshot().ASTRAL_WORLD_HERO_DESKTOP!,
      status: 'ACTIVE',
      outputUrl: 'https://cdn.example.com/hero.webp',
      version: 1,
    });
    const prev = process.env.FAL_KEY;
    delete process.env.FAL_KEY;
    const result = await dispatchP0Batch('http://localhost:5174');
    if (prev) process.env.FAL_KEY = prev;
    expect(result.skipped).toContain('ASTRAL_WORLD_HERO_DESKTOP');
  });

  it('FT51-4 — founder activate promotes approval without JSX changes', () => {
    initializeMissingContracts();
    upsertAstralAssetRecord({
      ...getAstralAssetStoreSnapshot().TAROT_SUITE_HERO_MOBILE!,
      status: 'READY',
      outputUrl: 'https://cdn.example.com/suite.webp',
      version: 1,
      approvalState: 'READY_FOR_VISUAL_REVIEW',
    });
    expect(activateFounderAsset('TAROT_SUITE_HERO_MOBILE').ok).toBe(true);
    expect(getAstralAssetStoreSnapshot().TAROT_SUITE_HERO_MOBILE?.approvalState).toBe('APPROVED');
    const resolved = resolveAstralAsset('TAROT_SUITE_HERO_MOBILE', getAstralAssetStoreSnapshot());
    expect(resolved.source).toBe('ACTIVE');
    expect(resolved.url).toContain('suite.webp');
  });

  it('FT51-5 — mall kiosk hotspots map to mall fixtures not coffee shop', () => {
    const mallHotspots = getHotspotsForScene('ASTRAL_MALL', true);
    for (const h of mallHotspots) {
      if (h.action !== 'OPEN_DRAWER') continue;
      const kioskId = KIOSK_HOTSPOT_MAP[h.target];
      expect(kioskId).toBeTruthy();
      const fixture = PROTOTYPE_KIOSKS.find((k) => k.id === kioskId);
      expect(fixture).toBeTruthy();
      expect(fixture!.label.toLowerCase()).not.toContain('coffee shop');
    }
    const tray = readFileSync('src/site00/astral-world/components/immersive/AstralKioskTray.tsx', 'utf8');
    expect(tray).not.toContain('Coffee Shop');
    expect(tray).not.toContain('coffee-shop');
  });

  it('FT51-6 — admin API supports dispatch and founder activate actions', () => {
    const admin = readFileSync('api/admin/site00-astral-world-generation.ts', 'utf8');
    expect(admin).toContain('dispatch-p0');
    expect(admin).toContain('dispatch-p1');
    expect(admin).toContain('activate');
    expect(admin).toContain('regenerate');
    expect(admin).toContain('preflight');
    expect(admin).not.toContain('FAL_KEY');
  });

  it('FT51-7 — asset manifest persistence module exists', () => {
    expect(existsSync('api/_lib/site00AstralWorld/assetManifestPersistence.ts')).toBe(true);
    const src = readFileSync('api/_lib/site00AstralWorld/assetManifestPersistence.ts', 'utf8');
    expect(src).toContain('saveAstralAssetManifest');
    expect(src).toContain('loadAstralAssetManifest');
  });

  it('FT51-8 — founder debug panel supports slot review controls', () => {
    const panel = readFileSync('src/site00/astral-world/components/AstralGenerationDebugPanel.tsx', 'utf8');
    expect(panel).toContain('Dispatch P0 batch');
    expect(panel).toContain('Side-by-side');
    expect(panel).toContain('Activate');
    expect(panel).toContain('Regenerate');
  });

  it('FT51-9 — P0 slot count remains 10', () => {
    expect(P0_SLOT_KEYS).toHaveLength(10);
  });

  it('FT51-10 — no hardcoded generated URLs in scene components', () => {
    const scene = readFileSync('src/site00/astral-world/components/immersive/AstralWorldScene.tsx', 'utf8');
    expect(scene).not.toMatch(/https:\/\/cdn\./);
  });

  it('FT51-11 — public asset map exposes only founder-activated ACTIVE slots', () => {
    initializeMissingContracts();
    const store = getAstralAssetStoreSnapshot();
    upsertAstralAssetRecord({
      ...store.ASTRAL_WORLD_HERO_DESKTOP!,
      status: 'READY',
      outputUrl: 'https://cdn.example.com/ready.webp',
      version: 1,
    });
    upsertAstralAssetRecord({
      ...store.TAROT_SUITE_HERO_MOBILE!,
      status: 'ACTIVE',
      outputUrl: 'https://cdn.example.com/active.webp',
      version: 1,
      approvalState: 'APPROVED',
    });
    const clientMap = sanitizeClientAssetMap(getAstralAssetStoreSnapshot());
    expect(clientMap.ASTRAL_WORLD_HERO_DESKTOP).toBeUndefined();
    expect(clientMap.TAROT_SUITE_HERO_MOBILE?.url).toContain('active.webp');
  });
});
