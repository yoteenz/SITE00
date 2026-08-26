/**
 * P0.E.FT5.2C — AW_D_01 desktop layered background + live overlay replication tests
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AW_D_01_LAYERED_ASSET_MANIFEST,
  AW_D_01_WORLD_ENTRY_BACKGROUND_V1,
  resolveAwD01BackgroundPath,
} from '../shared/site00-astral-world/screen-masters/awD01LayeredAssets.js';
import { getScreenAssetManifest } from '../shared/site00-astral-world/screen-masters/screenAssetManifests.js';

describe('P0.E.FT5.2C AW_D_01 desktop layered replication', () => {
  it('FT52C-1 — production desktop background registered', () => {
    expect(AW_D_01_WORLD_ENTRY_BACKGROUND_V1.slotKey).toBe('AW_D_01_WORLD_ENTRY_BACKGROUND_V1');
    expect(resolveAwD01BackgroundPath()).toContain('AW_D_01_WORLD_ENTRY_BACKGROUND_V1.png');
    expect(existsSync('public/astral-world/screen-masters/desktop/AW_D_01_WORLD_ENTRY/AW_D_01_WORLD_ENTRY_BACKGROUND_V1.png')).toBe(true);
    expect(AW_D_01_WORLD_ENTRY_BACKGROUND_V1.nativeWidth).toBe(1672);
  });

  it('FT52C-2 — screen asset manifest includes background V1', () => {
    const manifest = getScreenAssetManifest('AW_D_01_WORLD_ENTRY');
    expect(manifest[0]?.slotKey).toBe('AW_D_01_WORLD_ENTRY_BACKGROUND_V1');
    expect(AW_D_01_LAYERED_ASSET_MANIFEST.TAROT_DESTINATION_ICON.cropKey).toBe('TAROT_SUITE');
    expect(Object.keys(AW_D_01_LAYERED_ASSET_MANIFEST).length).toBeGreaterThanOrEqual(14);
  });

  it('FT52C-3 — desktop component uses layered DOM (no CSS panel recreation)', () => {
    const src = readFileSync('src/site00/astral-world/components/scenes/AwD01WorldEntryScreen.tsx', 'utf8');
    expect(src).toContain('aw-d01-layered__bg');
    expect(src).not.toContain('AstralScene');
    expect(src).not.toContain('aw-ref-astrea');
    expect(src).toContain('D01TopNav');
    expect(src).toContain('D01BottomNav');
  });

  it('FT52C-4 — arrival scene routes desktop to AW_D_01', () => {
    const src = readFileSync('src/site00/astral-world/components/scenes/MobileArrivalScene.tsx', 'utf8');
    expect(src).toContain('AwD01WorldEntryScreen');
    expect(src).not.toContain('DesktopHomeReferenceLayout');
  });

  it('FT52C-5 — shell nav hidden when desktop layered screen active', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain(':has(.aw-d01-layered) .aw-shell__nav');
    expect(css).toContain('display: none');
  });
});
