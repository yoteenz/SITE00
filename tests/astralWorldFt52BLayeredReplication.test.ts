/**
 * P0.E.FT5.2B — AW_M_01 layered background + live overlay replication tests
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AW_M_01_LAYERED_ASSET_MANIFEST,
  AW_M_01_WORLD_ENTRY_BACKGROUND_V1,
  resolveAwM01BackgroundPath,
} from '../shared/site00-astral-world/screen-masters/awM01LayeredAssets.js';

describe('P0.E.FT5.2B AW_M_01 layered replication', () => {
  it('FT52B-1 — production background registered (not hardcoded URL)', () => {
    expect(AW_M_01_WORLD_ENTRY_BACKGROUND_V1.slotKey).toBe('AW_M_01_WORLD_ENTRY_BACKGROUND_V1');
    expect(resolveAwM01BackgroundPath()).toContain('AW_M_01_WORLD_ENTRY_BACKGROUND_V1.png');
    expect(existsSync('public/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/AW_M_01_WORLD_ENTRY_BACKGROUND_V1.png')).toBe(true);
  });

  it('FT52B-2 — screen-specific asset manifest covers required slots', () => {
    expect(AW_M_01_LAYERED_ASSET_MANIFEST.TAROT_DESTINATION_ICON.cropKey).toBe('TAROT_SUITE_MOBILE');
    expect(AW_M_01_LAYERED_ASSET_MANIFEST.NAV_HOME_ICON.resolver).toBe('INLINE_SVG');
    expect(Object.keys(AW_M_01_LAYERED_ASSET_MANIFEST).length).toBeGreaterThanOrEqual(10);
  });

  it('FT52B-3 — component uses layered DOM (no CSS panel recreation)', () => {
    const src = readFileSync('src/site00/astral-world/components/scenes/AwM01WorldEntryScreen.tsx', 'utf8');
    expect(src).toContain('aw-m01-layered__bg');
    expect(src).not.toContain('AstralScene');
    expect(src).not.toContain('aw-m01-astrea__frame');
    expect(src).toContain('M01BottomNav');
  });

  it('FT52B-4 — shell mobile nav hidden when layered screen active', () => {
    const css = readFileSync('src/site00/astral-world/styles/astral-world.css', 'utf8');
    expect(css).toContain(':has(.aw-m01-layered) .aw-mobile-nav');
    expect(css).toContain('display: none');
  });
});
