/**
 * P0.E.FT5 — Master visual convergence + immersive world lock
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ASTRAL_REFERENCE_MANIFEST } from '../shared/site00-astral-world/scenes/referenceManifest.js';
import { getAnchorsForScene } from '../shared/site00-astral-world/scenes/visualAnchors.js';
import {
  ASTRAL_IMMERSIVE_ROUTE_PREFIXES,
  isAstralImmersiveRoute,
} from '../shared/site00-astral-world/scenes/immersiveRoutes.js';
import { ASTRAL_PRIMARY_SCENE_IDS } from '../shared/site00-astral-world/scenes/sceneContracts.js';

describe('P0.E.FT5 Astral World Master Visual Convergence', () => {
  it('FT5-1 — canonical reference manifest covers all primary scenes', () => {
    expect(Object.keys(ASTRAL_REFERENCE_MANIFEST).length).toBeGreaterThanOrEqual(10);
    expect(ASTRAL_REFERENCE_MANIFEST.MASTER_DESKTOP_REFERENCE.authorityLevel).toBe('MASTER');
    expect(ASTRAL_REFERENCE_MANIFEST.MASTER_MOBILE_REFERENCE.viewport).toBe('mobile');
    for (const sceneId of ASTRAL_PRIMARY_SCENE_IDS) {
      expect(
        Object.values(ASTRAL_REFERENCE_MANIFEST).some((r) => r.relatedSceneId === sceneId),
      ).toBe(true);
    }
  });

  it('FT5-2 — visual anchors defined for major scenes', () => {
    for (const sceneId of ['HOME_ARRIVAL', 'ASTREA_DISTRICT', 'TAROT_SUITE', 'ASTRAL_MALL', 'COFFEE_SHOP'] as const) {
      expect(getAnchorsForScene(sceneId).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('FT5-3 — immersive route detection', () => {
    expect(isAstralImmersiveRoute('/projects/astral-world/debug/world/home')).toBe(true);
    expect(isAstralImmersiveRoute('/projects/astral-world/debug/world/astrea/tarot-suite')).toBe(true);
    expect(isAstralImmersiveRoute('/projects/astral-world/debug/world/notification-demo')).toBe(false);
    expect(ASTRAL_IMMERSIVE_ROUTE_PREFIXES).toContain('journal');
  });

  it('FT5-4 — primary pages use unified ImmersiveRouteFrame (no desktop panel split)', () => {
    for (const file of [
      'src/site00/astral-world/pages/AstralWorldHomePage.tsx',
      'src/site00/astral-world/pages/AstralWorldAstreaPage.tsx',
      'src/site00/astral-world/pages/AstralWorldReadersPage.tsx',
      'src/site00/astral-world/pages/AstralWorldFriendsPage.tsx',
      'src/site00/astral-world/pages/AstralWorldJournalPage.tsx',
      'src/site00/astral-world/pages/AstralWorldProfilePage.tsx',
      'src/site00/astral-world/pages/destinations/TarotSuitePage.tsx',
      'src/site00/astral-world/pages/destinations/AstralMallPage.tsx',
      'src/site00/astral-world/pages/destinations/CoffeeShopPage.tsx',
    ]) {
      const src = readFileSync(file, 'utf8');
      expect(src).toContain('ImmersiveRouteFrame');
      expect(src).not.toContain('aw-desktop-only');
      expect(src).not.toContain('DesktopHomeReferenceLayout');
      expect(src).not.toContain('DesktopAstreaLayout');
    }
  });

  it('FT5-5 — shell hides right rail on immersive routes', () => {
    const shell = readFileSync('src/site00/astral-world/components/AstralWorldExperienceShell.tsx', 'utf8');
    expect(shell).toContain('isAstralImmersiveRoute');
    expect(shell).toContain('aw-shell--immersive');
    expect(shell).toContain('!immersive ? <AstralWorldRightRail />');
  });

  it('FT5-6 — scene components use responsive viewport hook for hotspots', () => {
    for (const file of [
      'src/site00/astral-world/components/scenes/MobileAstreaScene.tsx',
      'src/site00/astral-world/components/scenes/MobileTarotSuiteScene.tsx',
      'src/site00/astral-world/components/scenes/MobileAstralMallScene.tsx',
      'src/site00/astral-world/components/scenes/MobileCoffeeShopScene.tsx',
    ]) {
      const src = readFileSync(file, 'utf8');
      expect(src).toContain('useAstralViewport');
      expect(src).toContain('getHotspotsForScene');
    }
  });

  it('FT5-7 — FT5 CSS immersive shell styles exist', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('.aw-shell--immersive');
    expect(css).toContain('.aw-route-scene--immersive');
  });

  it('FT5-8 — preflight audit and asset manifest docs exist', () => {
    expect(existsSync('docs/projects/astral-world/SITE00_ASTRAL_WORLD_P0E_FT5_PREFLIGHT_AUDIT.md')).toBe(true);
    expect(existsSync('docs/projects/astral-world/SITE00_ASTRAL_WORLD_P0E_FT5_ASSET_MANIFEST.md')).toBe(true);
  });

  it('FT5-9 — viewport hook exists', () => {
    expect(existsSync('src/site00/astral-world/hooks/useAstralViewport.ts')).toBe(true);
  });

  it('FT5-10 — no whole-page image cheat pattern in scene shell', () => {
    const scene = readFileSync('src/site00/astral-world/components/immersive/AstralWorldScene.tsx', 'utf8');
    expect(scene).toContain('AstralScene');
    expect(scene).not.toContain('backgroundImage: `url(');
  });
});
