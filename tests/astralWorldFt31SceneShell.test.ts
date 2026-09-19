/**
 * P0.E.FT3.1 — Scene-first immersive shell reconstruction tests
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ASTRAL_PRIMARY_SCENE_IDS,
  ASTRAL_SCENE_CONTRACTS,
  ASTRAL_HOTSPOTS,
  ASTRAL_SCENE_OBJECTS,
  getHotspotsForScene,
  getSceneContract,
} from '../shared/site00-astral-world/scenes/index.js';
import { slotKeyFromCrop } from '../shared/site00-astral-world/generation/assetSlotRegistry.js';

describe('P0.E.FT3.1 Astral World Scene-First Shell', () => {
  it('FT31-1 — scene contract registry covers primary immersive routes', () => {
    expect(existsSync('shared/site00-astral-world/scenes/sceneContracts.ts')).toBe(true);
    expect(ASTRAL_PRIMARY_SCENE_IDS.length).toBeGreaterThanOrEqual(9);
    for (const id of ASTRAL_PRIMARY_SCENE_IDS) {
      expect(ASTRAL_SCENE_CONTRACTS[id]).toBeTruthy();
      expect(ASTRAL_SCENE_CONTRACTS[id].assetSlotKeyMobile).toBeTruthy();
    }
  });

  it('FT31-2 — scene contracts map to FAL asset slots via crop keys', () => {
    for (const id of ASTRAL_PRIMARY_SCENE_IDS) {
      const c = getSceneContract(id);
      expect(slotKeyFromCrop(c.backgroundCropMobile)).toBeTruthy();
    }
  });

  it('FT31-3 — hotspot registry defines responsive district and destination anchors', () => {
    expect(ASTRAL_HOTSPOTS.length).toBeGreaterThanOrEqual(10);
    const astrea = getHotspotsForScene('ASTREA_DISTRICT', true);
    expect(astrea.some((h) => h.hotspotId === 'DEST_TAROT_SUITE')).toBe(true);
    expect(astrea.some((h) => h.hotspotId === 'DEST_COFFEE_SHOP')).toBe(true);
    const coffee = getHotspotsForScene('COFFEE_SHOP', true);
    expect(coffee.filter((h) => h.hotspotId.startsWith('TABLE_')).length).toBeGreaterThanOrEqual(3);
  });

  it('FT31-4 — scene object model includes destinations, tables, artifacts', () => {
    expect(ASTRAL_SCENE_OBJECTS.length).toBeGreaterThanOrEqual(8);
    const kinds = new Set(ASTRAL_SCENE_OBJECTS.map((o) => o.kind));
    expect(kinds.has('DESTINATION')).toBe(true);
    expect(kinds.has('TABLE')).toBe(true);
    expect(kinds.has('JOURNAL')).toBe(true);
    expect(kinds.has('AVATAR')).toBe(true);
  });

  it('FT31-5 — immersive shell primitives exist', () => {
    for (const file of [
      'src/site00/astral-world/components/immersive/AstralWorldScene.tsx',
      'src/site00/astral-world/components/immersive/AstralDrawer.tsx',
      'src/site00/astral-world/components/immersive/AstralHUD.tsx',
      'src/site00/astral-world/components/immersive/AstralOverlay.tsx',
      'src/site00/astral-world/components/immersive/AstralSceneTransition.tsx',
    ]) {
      expect(existsSync(file)).toBe(true);
    }
    const hotspot = readFileSync('src/site00/astral-world/components/immersive/AstralHotspot.tsx', 'utf8');
    expect(hotspot).toContain('AstralHotspotLayer');
    expect(hotspot).toContain('hotspotStyle');
  });

  it('FT31-6 — mobile scene layouts replace document-page stacks on primary routes', () => {
    for (const scene of [
      'MobileArrivalScene.tsx',
      'MobileAstreaScene.tsx',
      'MobileTarotSuiteScene.tsx',
      'MobileAstralMallScene.tsx',
      'MobileCoffeeShopScene.tsx',
      'MobileFindReaderScene.tsx',
      'MobileFriendsScene.tsx',
      'MobileJournalScene.tsx',
      'MobileProfileScene.tsx',
    ]) {
      expect(existsSync(`src/site00/astral-world/components/scenes/${scene}`)).toBe(true);
    }
    const home = readFileSync('src/site00/astral-world/components/scenes/MobileArrivalScene.tsx', 'utf8');
    expect(home).toContain('AwM01WorldEntryScreen');
    expect(home).not.toContain('WhosHerePanel');
    expect(home).toContain('WhosHereWorldOverlay');
    expect(home).toContain('TakeMeSomewhereWorldOverlay');
    expect(existsSync('src/site00/astral-world/components/scenes/AwM01WorldEntryScreen.tsx')).toBe(true);
  });

  it('FT31-7 — pages wire unified immersive scene shells (FT5)', () => {
    for (const page of [
      'src/site00/astral-world/pages/AstralWorldHomePage.tsx',
      'src/site00/astral-world/pages/AstralWorldAstreaPage.tsx',
      'src/site00/astral-world/pages/destinations/TarotSuitePage.tsx',
      'src/site00/astral-world/pages/destinations/AstralMallPage.tsx',
      'src/site00/astral-world/pages/destinations/CoffeeShopPage.tsx',
      'src/site00/astral-world/pages/AstralWorldReadersPage.tsx',
      'src/site00/astral-world/pages/AstralWorldFriendsPage.tsx',
      'src/site00/astral-world/pages/AstralWorldJournalPage.tsx',
      'src/site00/astral-world/pages/AstralWorldProfilePage.tsx',
    ]) {
      const src = readFileSync(page, 'utf8');
      expect(src).toContain('ImmersiveRouteFrame');
      expect(src).not.toContain('aw-desktop-only');
    }
  });

  it('FT31-8 — contextual drawers and overlays used instead of full utility pages on mobile', () => {
    const mall = readFileSync('src/site00/astral-world/components/scenes/MobileAstralMallScene.tsx', 'utf8');
    expect(mall).toContain('AstralKioskTray');
    expect(mall).toContain('AstralHotspotLayer');
    const readers = readFileSync('src/site00/astral-world/components/scenes/MobileFindReaderScene.tsx', 'utf8');
    expect(readers).toContain('AstralReaderOrbit');
    expect(readers).toContain('ReaderDetailTray');
    const coffee = readFileSync('src/site00/astral-world/components/scenes/MobileCoffeeShopScene.tsx', 'utf8');
    expect(coffee).toContain('Join Her Table');
  });

  it('FT31-9 — experience shell includes scene transitions', () => {
    const shell = readFileSync('src/site00/astral-world/components/AstralWorldExperienceShell.tsx', 'utf8');
    expect(shell).toContain('AstralSceneTransition');
  });

  it('FT31-10 — scene-first CSS block and world HUD nav styling', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('.aw-world-scene');
    expect(css).toContain('.aw-drawer');
    expect(css).toContain('.aw-hud-chip');
    expect(css).toContain('prefers-reduced-motion');
    expect(css).toContain('backdrop-filter');
  });

  it('FT31-11 — AstralWorldScene exposes FAL-ready data-asset-slot', () => {
    const scene = readFileSync('src/site00/astral-world/components/immersive/AstralWorldScene.tsx', 'utf8');
    expect(scene).toContain('data-asset-slot');
    expect(scene).toContain('data-scene-id');
  });
});
