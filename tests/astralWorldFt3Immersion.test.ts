/**
 * P0.E.FT3 — Immersion recovery + reference-shell reconstruction tests
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ASTRAL_PORTRAIT_CROPS,
  ASTRAL_REFERENCE_CROPS,
  getPortraitCrop,
  getReferenceCrop,
} from '../shared/site00-astral-world/referenceCropRegistry.js';

describe('P0.E.FT3 Astral World Immersion Recovery', () => {
  it('FT3-1 — reference crop registry centralizes environment surfaces', () => {
    expect(existsSync('shared/site00-astral-world/referenceCropRegistry.ts')).toBe(true);
    expect(ASTRAL_REFERENCE_CROPS.ASTRAL_WORLD_HERO.src).toContain('/astral-world/bg-desktop-cinematic.png');
    expect(ASTRAL_REFERENCE_CROPS.COFFEE_SHOP_MOBILE.src).toContain('/astral-world/bg-mobile-cinematic.png');
    expect(getReferenceCrop('TAROT_SUITE').aspectRatio).toBe('4/5');
  });

  it('FT3-2 — portrait crops cover seeded demo identities', () => {
    const required = [
      'friend-jane',
      'friend-marcus',
      'friend-luna',
      'friend-lux',
      'reader-madame-j',
      'reader-kai',
      'reader-earth-mama',
      'reader-sage',
      'reader-orion',
      'reader-aria',
      'user-demo-teena',
    ] as const;
    for (const id of required) {
      expect(getPortraitCrop(id)).toBeTruthy();
      expect(ASTRAL_PORTRAIT_CROPS[id]).toBeTruthy();
    }
  });

  it('FT3-3 — immersive primitives exist', () => {
    for (const file of [
      'src/site00/astral-world/components/immersive/AstralScene.tsx',
      'src/site00/astral-world/components/immersive/AstralPortrait.tsx',
      'src/site00/astral-world/components/immersive/AstralEnvironmentCard.tsx',
      'src/site00/astral-world/components/immersive/AstralStatusChip.tsx',
      'src/site00/astral-world/components/immersive/AstralPresenceItem.tsx',
      'src/site00/astral-world/components/immersive/AstralHotspot.tsx',
    ]) {
      expect(existsSync(file)).toBe(true);
    }
  });

  it('FT3-4 — home layouts use environment-first AstralScene surfaces', () => {
    const desktop = readFileSync('src/site00/astral-world/components/DesktopHomeReferenceLayout.tsx', 'utf8');
    const mobile = readFileSync('src/site00/astral-world/components/MobileHomeReferenceLayout.tsx', 'utf8');
    expect(desktop).toContain('AstralScene');
    expect(desktop).toContain('AstralEnvironmentCard');
    expect(desktop).toContain('AstralPortrait');
    expect(mobile).toContain('AstralEnvironmentCard');
    expect(mobile).not.toMatch(/aw-avatar[^"]*">\{featuredReader\.avatarInitials\}/);
  });

  it('FT3-5 — social panels use portraits not initials as primary identity', () => {
    const whosHere = readFileSync('src/site00/astral-world/components/WhosHerePanel.tsx', 'utf8');
    expect(whosHere).toContain('AstralPresenceItem');
    expect(whosHere).not.toContain('aw-avatar');
    const friends = readFileSync('src/site00/astral-world/components/scenes/MobileFriendsScene.tsx', 'utf8');
    expect(friends).toContain('SpatialPresenceGroups');
  });

  it('FT3-6 — destination scenes use cinematic AstralWorldScene heroes', () => {
    for (const scene of [
      'src/site00/astral-world/components/scenes/MobileTarotSuiteScene.tsx',
      'src/site00/astral-world/components/scenes/MobileAstralMallScene.tsx',
      'src/site00/astral-world/components/scenes/MobileCoffeeShopScene.tsx',
      'src/site00/astral-world/components/scenes/MobileAstreaScene.tsx',
    ]) {
      const src = readFileSync(scene, 'utf8');
      expect(src).toContain('AstralWorldScene');
      expect(src).not.toContain('aw-hero__bg--pending');
    }
  });

  it('FT3-7 — Take Me Somewhere shows image-led routing preview', () => {
    const panel = readFileSync('src/site00/astral-world/components/TakeMeSomewherePanel.tsx', 'utf8');
    expect(panel).toContain('aw-routing-preview');
    expect(panel).toContain('AstralScene');
  });

  it('FT3-8 — journal, profile, daily card, deck use visual artifacts', () => {
    expect(readFileSync('src/site00/astral-world/components/scenes/MobileJournalScene.tsx', 'utf8')).toContain('aw-journal');
    expect(readFileSync('src/site00/astral-world/components/scenes/MobileProfileScene.tsx', 'utf8')).toContain('AstralPortrait');
    expect(readFileSync('src/site00/astral-world/pages/AstralWorldDailyCardPage.tsx', 'utf8')).toContain('aw-daily-card-visual');
    expect(readFileSync('src/site00/astral-world/pages/AstralWorldCreateDeckPage.tsx', 'utf8')).toContain('aw-deck-visual');
  });

  it('FT3-9 — immersion CSS block present', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('.aw-scene');
    expect(css).toContain('.aw-portrait');
    expect(css).toContain('.aw-env-card');
    expect(css).not.toContain('REFERENCE_ASSET_PENDING');
  });

  it('FT3-10 — readers scene is portrait-led', () => {
    const readers = readFileSync('src/site00/astral-world/components/scenes/MobileFindReaderScene.tsx', 'utf8');
    expect(readers).toContain('AstralReaderOrbit');
    expect(readers).not.toMatch(/className="aw-avatar"/);
  });
});
