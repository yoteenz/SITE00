/**
 * P0.E.FT3.2 — Immersive interaction language + portrait extraction + hotspot tuning
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  FRIEND_SEMANTIC_KEYS,
  getIsolatedPortrait,
  ISOLATED_PORTRAIT_ASSETS,
  READER_SEMANTIC_KEYS,
  semanticKeyForPerson,
} from '../shared/site00-astral-world/portraitAssetRegistry.js';
import { getHotspotsForScene } from '../shared/site00-astral-world/scenes/hotspotRegistry.js';
import { resolvePortraitAsset } from '../shared/site00-astral-world/generation/assetResolver.js';

describe('P0.E.FT3.2 Astral World Immersive Interaction Language', () => {
  it('FT32-1 — isolated portrait asset registry covers seeded readers and friends', () => {
    expect(existsSync('shared/site00-astral-world/portraitAssetRegistry.ts')).toBe(true);
    expect(READER_SEMANTIC_KEYS.length).toBe(6);
    expect(FRIEND_SEMANTIC_KEYS.length).toBe(4);
    expect(getIsolatedPortrait('reader-madame-j')?.semanticKey).toBe('READER_MADAME_J');
    expect(getIsolatedPortrait('friend-jane')?.semanticKey).toBe('FRIEND_JANE_DOE');
    expect(semanticKeyForPerson('reader-kai')).toBe('READER_KAI_ORACLE');
  });

  it('FT32-2 — portrait resolver prefers isolated extraction over loose board crops', () => {
    const resolved = resolvePortraitAsset('reader-madame-j', {}, '');
    expect(resolved.source).toBe('REFERENCE');
    expect(resolved.backgroundSize).toContain('420%');
    expect(resolved.slotKey).toContain('READER_PORTRAIT');
  });

  it('FT32-3 — Find My Reader uses world-native discovery (not directory)', () => {
    const mobile = readFileSync('src/site00/astral-world/components/scenes/MobileFindReaderScene.tsx', 'utf8');
    expect(mobile).toContain('AstralInvokeField');
    expect(mobile).toContain('AstralReaderOrbit');
    expect(mobile).toContain('ASTREA_DISTRICT');
    expect(mobile).not.toContain('aw-card');
    expect(mobile).not.toContain('AstralDrawer');
    const desktop = readFileSync('src/site00/astral-world/pages/AstralWorldReadersPage.tsx', 'utf8');
    expect(desktop).not.toContain('aw-kiosk-grid');
    expect(desktop).not.toContain('placeholder="Search readers..."');
  });

  it('FT32-4 — Astral Mall spatial kiosks replace pricing grid on primary scenes', () => {
    const mobile = readFileSync('src/site00/astral-world/components/scenes/MobileAstralMallScene.tsx', 'utf8');
    expect(mobile).toContain('AstralKioskTray');
    expect(mobile).not.toContain('aw-kiosk-tray-list');
    expect(mobile).not.toContain('aw-kiosk-grid');
    const desktop = readFileSync('src/site00/astral-world/pages/destinations/AstralMallPage.tsx', 'utf8');
    expect(desktop).toContain('AstralHotspotLayer');
    expect(desktop).not.toContain('aw-kiosk-grid');
  });

  it('FT32-5 — mall hotspot registry maps five scene kiosks', () => {
    const mallMobile = getHotspotsForScene('ASTRAL_MALL', true);
    expect(mallMobile.some((h) => h.hotspotId === 'MALL_QUICK_PULL')).toBe(true);
    expect(mallMobile.some((h) => h.hotspotId === 'MALL_YES_NO')).toBe(true);
    expect(mallMobile.some((h) => h.hotspotId === 'MALL_GENERAL_INSIGHT')).toBe(true);
    expect(mallMobile.length).toBeGreaterThanOrEqual(5);
  });

  it('FT32-6 — Astréa hotspot alignment includes mobile and desktop adjustments', () => {
    const mobile = getHotspotsForScene('ASTREA_DISTRICT', true);
    const desktop = getHotspotsForScene('ASTREA_DISTRICT', false);
    for (const id of ['DEST_TAROT_SUITE', 'DEST_ASTRAL_MALL', 'DEST_COFFEE_SHOP']) {
      expect(mobile.find((h) => h.hotspotId === id)).toBeTruthy();
      expect(desktop.find((h) => h.hotspotId === id)).toBeTruthy();
    }
    const tarotMobile = mobile.find((h) => h.hotspotId === 'DEST_TAROT_SUITE')!;
    expect(tarotMobile.rect.yPercent).toBeGreaterThan(50);
  });

  it('FT32-7 — immersive interaction components exist', () => {
    for (const file of [
      'src/site00/astral-world/components/immersive/AstralInvokeField.tsx',
      'src/site00/astral-world/components/immersive/AstralKioskTray.tsx',
      'src/site00/astral-world/components/immersive/AstralCategorySigil.tsx',
      'src/site00/astral-world/components/immersive/AstralReaderOrbit.tsx',
      'src/site00/astral-world/components/scenes/overlays/ReaderDetailTray.tsx',
      'src/site00/astral-world/components/scenes/SpatialPresenceGroups.tsx',
    ]) {
      expect(existsSync(file)).toBe(true);
    }
  });

  it('FT32-8 — Who\'s Here and Friends use spatial presence groups', () => {
    expect(readFileSync('src/site00/astral-world/components/scenes/overlays/WhosHereWorldOverlay.tsx', 'utf8')).toContain('SpatialPresenceGroups');
    expect(readFileSync('src/site00/astral-world/components/scenes/MobileFriendsScene.tsx', 'utf8')).toContain('SpatialPresenceGroups');
  });

  it('FT32-9 — hotspot emblem visual language', () => {
    const hotspot = readFileSync('src/site00/astral-world/components/immersive/AstralHotspot.tsx', 'utf8');
    expect(hotspot).toContain('aw-hotspot__emblem');
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('.aw-invoke-field');
    expect(css).toContain('.aw-kiosk-tray');
    expect(css).toContain('.aw-reader-orbit');
  });

  it('FT32-10 — FAL semantic portrait keys connected', () => {
    for (const key of ['READER_MADAME_J', 'FRIEND_JANE_DOE'] as const) {
      const spec = ISOLATED_PORTRAIT_ASSETS[key];
      expect(spec.falSlotKey).toBeTruthy();
      expect(spec.fixtureId).toBeTruthy();
    }
  });

  it('FT32-11 — Take Me Somewhere uses intention tokens not chip bars', () => {
    const overlay = readFileSync('src/site00/astral-world/components/scenes/overlays/TakeMeSomewhereWorldOverlay.tsx', 'utf8');
    expect(overlay).toContain('aw-intention-token');
    expect(overlay).not.toContain('aw-chips');
  });
});
