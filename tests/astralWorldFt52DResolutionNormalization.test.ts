/**
 * P0.E.FT5.2D — Canonical resolution normalization + overlay realignment tests
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AW_M_01_SHELL_SOURCE,
  AW_D_01_SHELL_SOURCE,
  canonicalPctRectStyle,
  pctRectToNorm,
  resolveNormRectPixels,
} from '../shared/site00-astral-world/screen-masters/canonicalScreenStage.js';
import {
  AW_M_01_CANONICAL,
  AW_M_01_FINAL_COMPOSITION_REFERENCE,
  AW_M_01_LAYERED_ASSET_MANIFEST,
  AW_M_01_OVERLAY_ANCHORS,
  AW_M_01_WORLD_ENTRY_BACKGROUND_V2,
  resolveAwM01BackgroundPath,
} from '../shared/site00-astral-world/screen-masters/awM01LayeredAssets.js';
import {
  AW_D_01_CANONICAL,
  AW_D_01_FINAL_COMPOSITION_REFERENCE,
  AW_D_01_LAYERED_ASSET_MANIFEST,
  AW_D_01_OVERLAY_ANCHORS,
  AW_D_01_WORLD_ENTRY_BACKGROUND_V2,
  resolveAwD01BackgroundPath,
} from '../shared/site00-astral-world/screen-masters/awD01LayeredAssets.js';

describe('P0.E.FT5.2D canonical resolution normalization', () => {
  it('FT52D-1 — mobile canonical reference dimensions = 854×1842', () => {
    expect(AW_M_01_FINAL_COMPOSITION_REFERENCE.nativeWidth).toBe(854);
    expect(AW_M_01_FINAL_COMPOSITION_REFERENCE.nativeHeight).toBe(1842);
  });

  it('FT52D-2 — mobile normalized background dimensions = 854×1842', () => {
    expect(AW_M_01_WORLD_ENTRY_BACKGROUND_V2.nativeWidth).toBe(854);
    expect(AW_M_01_WORLD_ENTRY_BACKGROUND_V2.nativeHeight).toBe(1842);
    expect(existsSync('public/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V2.png')).toBe(true);
    expect(resolveAwM01BackgroundPath()).toContain('BACKGROUND_V2');
  });

  it('FT52D-3 — desktop canonical reference dimensions = 1536×1024', () => {
    expect(AW_D_01_FINAL_COMPOSITION_REFERENCE.nativeWidth).toBe(1536);
    expect(AW_D_01_FINAL_COMPOSITION_REFERENCE.nativeHeight).toBe(1024);
  });

  it('FT52D-4 — desktop normalized background dimensions = 1536×1024', () => {
    expect(AW_D_01_WORLD_ENTRY_BACKGROUND_V2.nativeWidth).toBe(1536);
    expect(AW_D_01_WORLD_ENTRY_BACKGROUND_V2.nativeHeight).toBe(1024);
    expect(existsSync('public/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V2.png')).toBe(true);
    expect(resolveAwD01BackgroundPath()).toContain('BACKGROUND_V2');
  });

  it('FT52D-5 — shell and overlays use same CanonicalScreenStage transform', () => {
    const m01 = readFileSync('src/site00/astral-world/components/scenes/AwM01WorldEntryScreen.tsx', 'utf8');
    const d01 = readFileSync('src/site00/astral-world/components/scenes/AwD01WorldEntryScreen.tsx', 'utf8');
    expect(m01).toContain('CanonicalScreenStage');
    expect(d01).toContain('CanonicalScreenStage');
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain('.aw-canonical-stage__inner');
    expect(css).toContain('.aw-canonical-stage__overlays');
  });

  it('FT52D-6 — no independent x/y background stretching (object-fit: fill removed)', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).not.toMatch(/aw-m01-layered__bg[\s\S]*object-fit:\s*fill/);
    expect(css).not.toMatch(/aw-d01-layered__bg[\s\S]*object-fit:\s*fill/);
    expect(css).toContain('.aw-canonical-stage__bg');
    expect(css).toContain('object-fit: contain');
  });

  it('FT52D-7 — canonical normalized positions resolve correctly', () => {
    const hero = pctRectToNorm(AW_M_01_OVERLAY_ANCHORS.HERO_TITLE_CENTER);
    const px = resolveNormRectPixels(hero, 854, 1842);
    expect(px.left).toBeGreaterThan(0);
    expect(px.top).toBeGreaterThan(0);
    expect(px.width).toBeGreaterThan(0);
    expect(px.height).toBeGreaterThan(0);
    const style = canonicalPctRectStyle(AW_M_01_OVERLAY_ANCHORS.HERO_TITLE_CENTER);
    expect(style.left).toContain('%');
    expect(style.top).toContain('%');
  });

  it('FT52D-8 — screen references cannot resolve as icon assets', () => {
    for (const entry of Object.values(AW_M_01_LAYERED_ASSET_MANIFEST)) {
      if (entry.resolutionType === 'ICON_ASSET') {
        expect(entry.resolver).toBe('ICON_ASSET');
      }
    }
    for (const entry of Object.values(AW_D_01_LAYERED_ASSET_MANIFEST)) {
      if (entry.resolutionType === 'ICON_ASSET') {
        expect(entry.resolver).toBe('ICON_ASSET');
      }
    }
    const m01 = readFileSync('src/site00/astral-world/components/scenes/AwM01WorldEntryScreen.tsx', 'utf8');
    expect(m01).not.toContain('REFERENCE_CROP');
    expect(m01).not.toContain('resolveAwM01DestinationIconCrop');
  });

  it('FT52D-9 — destination icons use isolated SVG assets', () => {
    expect(AW_M_01_LAYERED_ASSET_MANIFEST.TAROT_DESTINATION_ICON.resolver).toBe('ICON_ASSET');
    expect(AW_D_01_LAYERED_ASSET_MANIFEST.TAROT_DESTINATION_ICON.resolver).toBe('ICON_ASSET');
    const m01 = readFileSync('src/site00/astral-world/components/scenes/AwM01WorldEntryScreen.tsx', 'utf8');
    expect(m01).toContain('TarotSuiteIcon');
    expect(m01).toContain('CoffeeShopIcon');
    expect(m01).toContain('AstralMallIcon');
  });

  it('FT52D-10 — avatar uses isolated avatar asset resolver', () => {
    expect(AW_M_01_LAYERED_ASSET_MANIFEST.CURRENT_USER_AVATAR.resolver).toBe('USER_PORTRAIT');
    expect(AW_M_01_LAYERED_ASSET_MANIFEST.CURRENT_USER_AVATAR.resolutionType).toBe('AVATAR_ASSET');
    const m01 = readFileSync('src/site00/astral-world/components/scenes/AwM01WorldEntryScreen.tsx', 'utf8');
    expect(m01).toContain('AstralPortrait');
  });

  it('FT52D-11 — bottom nav anchors to baked nav region', () => {
    expect(AW_M_01_OVERLAY_ANCHORS.BOTTOM_NAV.region).toBe('NAV_SHELL');
    expect(AW_D_01_OVERLAY_ANCHORS.BOTTOM_NAV.region).toBe('NAV_SHELL');
  });

  it('FT52D-12 — no legacy 941×1672 overlay assumptions remain', () => {
    const m01 = readFileSync('src/site00/astral-world/components/scenes/AwM01WorldEntryScreen.tsx', 'utf8');
    expect(m01).not.toContain('width={941}');
    expect(m01).not.toContain('852');
    expect(AW_M_01_CANONICAL.referenceWidth).toBe(854);
    expect(AW_M_01_CANONICAL.referenceHeight).toBe(1842);
    expect(AW_M_01_SHELL_SOURCE.width).toBe(941);
    expect(AW_M_01_SHELL_SOURCE.height).toBe(1672);
  });

  it('FT52D-13 — no legacy 1672×941 overlay assumptions remain', () => {
    const assets = readFileSync('shared/site00-astral-world/screen-masters/awD01LayeredAssets.ts', 'utf8');
    expect(assets).not.toContain('canonicalViewportWidth: 1280');
    expect(AW_D_01_CANONICAL.referenceWidth).toBe(1536);
    expect(AW_D_01_CANONICAL.referenceHeight).toBe(1024);
    expect(AW_D_01_SHELL_SOURCE.width).toBe(1672);
    expect(AW_D_01_SHELL_SOURCE.height).toBe(941);
  });

  it('FT52D-14 — mobile routing preserved', () => {
    const scene = readFileSync('src/site00/astral-world/components/scenes/MobileArrivalScene.tsx', 'utf8');
    expect(scene).toContain('AwM01WorldEntryScreen');
  });

  it('FT52D-15 — desktop routing preserved', () => {
    const scene = readFileSync('src/site00/astral-world/components/scenes/MobileArrivalScene.tsx', 'utf8');
    expect(scene).toContain('AwD01WorldEntryScreen');
  });
});
