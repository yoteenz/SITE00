/**
 * P0.E.FT5.2 — Canonical screen master + SITE 00 pipeline adoption tests
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  ASTRAL_WORLD_BOARD_TO_SCREEN_MAP,
  getBoardToScreenEntry,
} from '../shared/site00-astral-world/screen-masters/boardToScreenMap.js';
import {
  getScreenMaster,
  getScreenMasterForScene,
  initializeScreenMasterRegistry,
  resetScreenMasterRegistryForTest,
  registerExtractedPilotMaster,
  isCanonicalMasterAuthority,
  setScreenVisualLock,
  getScreenVisualLock,
} from '../shared/site00-astral-world/screen-masters/registry.js';
import { reconcileFt51Assets, markRegenerationRequired } from '../shared/site00-astral-world/screen-masters/ft51Reconciliation.js';
import {
  initializeAstralWorldProductionAdapter,
  countRegisteredAstralScreens,
  buildDesignScreenDefinitions,
} from '../shared/site00-astral-world/screen-masters/vr2Adapter.js';
import { resolveScreenAuthority, canonicalMasterBlocksBoardReference } from '../shared/site00-astral-world/screen-masters/resolveScreenAuthority.js';
import { getScreenAssetManifest } from '../shared/site00-astral-world/screen-masters/screenAssetManifests.js';
import { compileAstralPrompt } from '../shared/site00-astral-world/generation/promptCompiler.js';
import { getContractBySlot } from '../shared/site00-astral-world/generation/assetSlotRegistry.js';
import { clearCanonicalRegistryForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferenceRegistry.js';
import { clearDesignScreenRegistryForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';

describe('P0.E.FT5.2 Astral World Canonical Screen Masters', () => {
  beforeEach(() => {
    resetScreenMasterRegistryForTest();
    clearCanonicalRegistryForTest();
    clearDesignScreenRegistryForTest();
  });

  it('FT52-1 — board-to-screen map registers mobile and desktop masters', () => {
    const mobile = ASTRAL_WORLD_BOARD_TO_SCREEN_MAP.filter((e) => e.viewport === 'mobile');
    const desktop = ASTRAL_WORLD_BOARD_TO_SCREEN_MAP.filter((e) => e.viewport === 'desktop');
    expect(mobile.length).toBeGreaterThanOrEqual(10);
    expect(desktop.length).toBeGreaterThanOrEqual(10);
    expect(getBoardToScreenEntry('AW_M_01_WORLD_ENTRY')?.route).toContain('/home');
  });

  it('FT52-2 — each screen has project scope, route, viewport, state', () => {
    initializeScreenMasterRegistry();
    const pilot = getScreenMaster('AW_M_01_WORLD_ENTRY');
    expect(pilot?.projectId).toBe('astral-world');
    expect(pilot?.route).toContain('home');
    expect(pilot?.viewportClass).toBe('mobile');
    expect(pilot?.targetViewportWidth).toBe(390);
    expect(pilot?.sourceBoard).toBe('MASTER_MOBILE_REFERENCE');
    expect(pilot?.sourceRegion.width).toBeGreaterThan(0);
  });

  it('FT52-3 — source lineage preserved on canonical master', () => {
    initializeScreenMasterRegistry();
    const pilot = getScreenMaster('AW_M_01_WORLD_ENTRY')!;
    expect(pilot.sourceRegionPath).toContain('source-region.png');
    expect(pilot.canonicalMasterPath).toContain('AW_M_01_WORLD_ENTRY');
    expect(pilot.responsivePair).toBe('AW_D_01_WORLD_ENTRY');
  });

  it('FT52-4 — mobile/desktop independently addressable', () => {
    initializeScreenMasterRegistry();
    const mobile = getScreenMasterForScene('HOME_ARRIVAL', 'mobile');
    const desktop = getScreenMasterForScene('HOME_ARRIVAL', 'desktop');
    expect(mobile?.screenId).toBe('AW_M_01_WORLD_ENTRY');
    expect(desktop?.screenId).toBe('AW_D_01_WORLD_ENTRY');
    expect(mobile?.screenId).not.toBe(desktop?.screenId);
  });

  it('FT52-5 — screen asset manifest resolves for pilot', () => {
    const manifest = getScreenAssetManifest('AW_M_01_WORLD_ENTRY');
    expect(manifest.length).toBeGreaterThan(0);
    expect(manifest[0].slotKey).toBe('ASTRAL_WORLD_HERO_MOBILE');
    expect(manifest[0].role).toBe('BACKGROUND_ENVIRONMENT');
  });

  it('FT52-6 — screen-bound prompt includes canonical screen master', () => {
    initializeScreenMasterRegistry();
    const master = getScreenMaster('AW_M_01_WORLD_ENTRY')!;
    const contract = getContractBySlot('ASTRAL_WORLD_HERO_MOBILE')!;
    const compiled = compileAstralPrompt(contract, undefined, {
      screenMaster: master,
      assetRole: 'BACKGROUND_ENVIRONMENT',
      compositionRequirements: ['Leave upper safe region unobstructed for live UI.'],
    });
    expect(compiled.promptText).toContain('AW_M_01_WORLD_ENTRY');
    expect(compiled.promptText).toContain('RECONSTRUCT THIS EXACT SCREEN');
    expect(compiled.screenMasterId).toBe('AW_M_01_WORLD_ENTRY');
  });

  it('FT52-7 — FT5.1 reconciliation preserves lineage classifications', () => {
    const reconciled = reconcileFt51Assets();
    expect(reconciled.length).toBeGreaterThan(20);
    const hero = reconciled.find((r) => r.slotKey === 'ASTRAL_WORLD_HERO_MOBILE');
    expect(hero?.classification).toBe('SCREEN_ALIGNED_REUSABLE');
    expect(hero?.servesScreens).toContain('AW_M_01_WORLD_ENTRY');
    const regen = markRegenerationRequired(reconciled, 'COFFEE_SHOP_HERO_MOBILE', 'AW_M_05_COFFEE_SHOP');
    expect(regen.find((r) => r.slotKey === 'COFFEE_SHOP_HERO_MOBILE')?.classification).toBe('REQUIRES_REGENERATION');
  });

  it('FT52-8 — canonical master blocks whole-board reference when authority active', () => {
    registerExtractedPilotMaster({ width: 390, height: 844, approvalState: 'MASTER_READY_FOR_REVIEW' });
    expect(isCanonicalMasterAuthority('AW_M_01_WORLD_ENTRY')).toBe(true);
    expect(canonicalMasterBlocksBoardReference('AW_M_01_WORLD_ENTRY')).toBe(true);
    const authority = resolveScreenAuthority('HOME_ARRIVAL', 'ASTRAL_WORLD_HERO_MOBILE', {}, 'mobile', '');
    expect(authority.source).toBe('CANONICAL_SCREEN_MASTER');
    expect(authority.url).toContain('AW_M_01_WORLD_ENTRY');
  });

  it('FT52-9 — VR2 adapter registers Astral screens without parallel pipeline', () => {
    initializeAstralWorldProductionAdapter();
    const counts = countRegisteredAstralScreens();
    expect(counts.mobile).toBeGreaterThanOrEqual(10);
    expect(counts.desktop).toBeGreaterThanOrEqual(10);
    const defs = buildDesignScreenDefinitions();
    expect(defs.some((d) => d.screenId === 'AW_M_01_WORLD_ENTRY')).toBe(true);
    expect(existsSync('shared/site00-astral-world/screen-masters/vr2Adapter.ts')).toBe(true);
    expect(existsSync('shared/site00-astral-world/screen-masters/AstralPageGenerator.ts')).toBe(false);
  });

  it('FT52-10 — screen visual lock is independent per screen', () => {
    setScreenVisualLock('AW_M_01_WORLD_ENTRY', true);
    setScreenVisualLock('AW_M_02_ASTREA_DISTRICT', false);
    expect(getScreenVisualLock('AW_M_01_WORLD_ENTRY').screenVisualLock).toBe(true);
    expect(getScreenVisualLock('AW_M_02_ASTREA_DISTRICT').screenVisualLock).toBe(false);
  });

  it('FT52-11 — pilot canonical master files exist on disk', () => {
    expect(existsSync('docs/projects/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/source-region.png')).toBe(true);
    expect(existsSync('docs/projects/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/canonical-master-v1.png')).toBe(true);
    expect(existsSync('public/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/canonical-master-v1.png')).toBe(true);
  });

  it('FT52-12 — board-to-screen map doc exists', () => {
    const map = readFileSync('shared/site00-astral-world/screen-masters/boardToScreenMap.ts', 'utf8');
    expect(map).toContain('ASTRAL_WORLD_BOARD_TO_SCREEN_MAP');
    expect(map).toContain('AW_M_15_READER_SELECTED');
  });

  it('FT52-13 — SITE00 VR2 pipeline reused (audit marker in docs)', () => {
    const doc = readFileSync('docs/projects/astral-world/SITE00_ASTRAL_WORLD_P0E_FT52_SCREEN_MASTERS.md', 'utf8');
    expect(doc).toContain('P0.VR.2');
    expect(doc).toContain('PARALLEL_ASTRAL_PIPELINE_CREATED: FALSE');
  });

  it('FT52-14 — existing Astral functionality preserved (scene contracts intact)', () => {
    const contracts = readFileSync('shared/site00-astral-world/scenes/sceneContracts.ts', 'utf8');
    expect(contracts).toContain('HOME_ARRIVAL');
    expect(contracts).toContain('assetSlotKeyMobile');
  });

  it('FT52-15 — pilot resolves to canonical master when ready for review', () => {
    initializeScreenMasterRegistry();
    const authority = resolveScreenAuthority('HOME_ARRIVAL', 'ASTRAL_WORLD_HERO_MOBILE', {}, 'mobile', '');
    expect(authority.source).toBe('CANONICAL_SCREEN_MASTER');
    expect(authority.url).toContain('AW_M_01_WORLD_ENTRY');
  });
});

describe('P0.VR.2 pipeline regression (Astral adapter)', () => {
  it('FT52-16 — canonical reference registry module intact', () => {
    const src = readFileSync(
      'shared/site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferenceRegistry.ts',
      'utf8',
    );
    expect(src).toContain('registerCanonicalVisualReference');
  });
});
