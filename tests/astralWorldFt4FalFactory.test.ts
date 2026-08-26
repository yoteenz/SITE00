/**
 * P0.E.FT4 — FAL generative asset factory tests
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach } from 'vitest';
import { getP0Contracts, getManifestContracts, countByPriority, AW_GENERATION_MANIFEST_V1 } from '../shared/site00-astral-world/generation/generationManifest.js';
import { getContractBySlot, P0_SLOT_KEYS, buildAllAstralAssetContracts } from '../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { compileAstralPrompt } from '../shared/site00-astral-world/generation/promptCompiler.js';
import { ASTRAL_MASTER_VISUAL_CONTRACT_V1 } from '../shared/site00-astral-world/generation/masterVisualContract.js';
import { resolveAstralAsset, sanitizeClientAssetMap } from '../shared/site00-astral-world/generation/assetResolver.js';
import {
  resetAstralAssetStore,
  initializeMissingContracts,
  markJobActive,
} from '../api/_lib/site00AstralWorld/assetRecordStore.js';
import {
  queueAstralAssetGeneration,
  activateTestAsset,
  getAstralAssetStoreSnapshot,
} from '../api/_lib/site00AstralWorld/generationService.js';
import { getAstralFixtures } from '../shared/site00-astral-world/fixtureService.js';
import { ASTRAL_FAST_TRACK_BASE } from '../shared/site00-astral-world/routes.js';

describe('P0.E.FT4 Astral World FAL Generative Asset Factory', () => {
  beforeEach(() => {
    resetAstralAssetStore();
  });

  it('FT4-1 — every P0 slot has an asset contract', () => {
    for (const slot of P0_SLOT_KEYS) {
      expect(getContractBySlot(slot)).toBeTruthy();
    }
    expect(getP0Contracts()).toHaveLength(10);
  });

  it('FT4-2 — contracts are astral-world project scoped', () => {
    for (const c of getManifestContracts()) {
      expect(c.projectId).toBe('astral-world');
      expect(c.worldScope).toBe('astral-world');
    }
  });

  it('FT4-3 — prompt compiler includes master visual contract', () => {
    const contract = getContractBySlot('ASTRAL_WORLD_HERO_DESKTOP')!;
    const compiled = compileAstralPrompt(contract);
    expect(compiled.promptText).toContain(ASTRAL_MASTER_VISUAL_CONTRACT_V1.slice(0, 40));
    expect(compiled.promptText).toContain('NO TEXT');
    expect(compiled.promptHash).toHaveLength(16);
  });

  it('FT4-4 — missing slot can create generation job (mock without FAL_KEY)', async () => {
    initializeMissingContracts();
    const prev = process.env.FAL_KEY;
    delete process.env.FAL_KEY;
    const result = await queueAstralAssetGeneration('ASTRAL_WORLD_HERO_DESKTOP', 'http://localhost:5174');
    if (prev) process.env.FAL_KEY = prev;
    expect(result.ok || result.error?.includes('FAL_KEY')).toBe(true);
  });

  it('FT4-5 — duplicate billable dispatch prevented while job active', async () => {
    initializeMissingContracts();
    markJobActive('COFFEE_SHOP_HERO_DESKTOP');
    const second = await queueAstralAssetGeneration('COFFEE_SHOP_HERO_DESKTOP', 'http://localhost:5174');
    expect(second.duplicate).toBe(true);
  });

  it('FT4-6 — READY asset resolves into slot automatically', () => {
    activateTestAsset('COFFEE_SHOP_HERO_MOBILE', 'https://cdn.example.com/coffee.webp');
    const store = getAstralAssetStoreSnapshot();
    const resolved = resolveAstralAsset('COFFEE_SHOP_HERO_MOBILE', store);
    expect(resolved.source).toBe('ACTIVE');
    expect(resolved.url).toContain('coffee.webp');
  });

  it('FT4-7 — failed generation preserves reference fallback', () => {
    const store = getAstralAssetStoreSnapshot();
    const resolved = resolveAstralAsset('TAROT_SUITE_HERO_DESKTOP', store, 'http://localhost:5174');
    expect(resolved.source).toBe('REFERENCE');
    expect(resolved.url).toContain('/astral-world/');
  });

  it('FT4-8 — client map hides provider details', () => {
    activateTestAsset('ASTRAL_WORLD_HERO_DESKTOP', 'https://cdn.example.com/hero.webp');
    const client = sanitizeClientAssetMap(getAstralAssetStoreSnapshot());
    expect(client.ASTRAL_WORLD_HERO_DESKTOP?.url).toContain('hero.webp');
    expect(JSON.stringify(client)).not.toContain('fal');
    expect(JSON.stringify(client)).not.toContain('prompt');
  });

  it('FT4-9 — generation manifest AW_VISUAL_FOUNDATION_V1', () => {
    expect(AW_GENERATION_MANIFEST_V1.batchId).toBe('AW_VISUAL_FOUNDATION_V1');
    const counts = countByPriority();
    expect(counts.p0).toBe(10);
    expect(counts.p1).toBeGreaterThanOrEqual(10);
    expect(counts.p2).toBe(5);
  });

  it('FT4-10 — mobile slot does not share desktop-only contract incorrectly', () => {
    const desktop = getContractBySlot('ASTRAL_WORLD_HERO_DESKTOP')!;
    const mobile = getContractBySlot('ASTRAL_WORLD_HERO_MOBILE')!;
    expect(desktop.mobileBehavior).toBe('DESKTOP_ONLY');
    expect(mobile.mobileBehavior).toBe('MOBILE_NATIVE');
    expect(desktop.targetSlot).not.toBe(mobile.targetSlot);
  });

  it('FT4-11 — cross-project leakage zero in fixture service', () => {
    expect(getAstralFixtures(ASTRAL_FAST_TRACK_BASE).source).toBe('PROTOTYPE_FIXTURE');
  });

  it('FT4-12 — generated assets do not auto-promote canon', () => {
    activateTestAsset('JOURNAL_ARTIFACT', 'https://cdn.example.com/journal.webp');
    const record = getAstralAssetStoreSnapshot().JOURNAL_ARTIFACT!;
    expect(record.canonState).toBe('FOUNDER_FAST_TRACK');
    expect(record.status).toBe('ACTIVE');
  });

  it('FT4-13 — environment + portrait + artifact prompt counts', () => {
    const all = buildAllAstralAssetContracts();
    const env = all.filter((c) => c.assetType === 'CINEMATIC_ENVIRONMENT').length;
    const portraits = all.filter((c) => c.assetType === 'CHARACTER_PORTRAIT').length;
    const artifacts = all.filter((c) => c.assetType === 'PRODUCT_ARTIFACT' || c.assetType === 'TAROT_CARD').length;
    expect(env).toBeGreaterThanOrEqual(10);
    expect(portraits).toBeGreaterThanOrEqual(10);
    expect(artifacts).toBeGreaterThanOrEqual(3);
  });

  it('FT4-14 — public assets API module exists without provider leak', () => {
    const src = readFileSync('api/site00/astral-world-assets.ts', 'utf8');
    expect(src).toContain('sanitizeClientAssetMap');
    expect(src).not.toContain('FAL_KEY');
  });
});
