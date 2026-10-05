/**
 * P0.E.FT5.2 — Per-screen asset manifests.
 */

import type { ScreenAssetManifestEntry } from './types.js';

export const PILOT_WORLD_ENTRY_MANIFEST: ScreenAssetManifestEntry[] = [
  {
    slotKey: 'AW_M_01_WORLD_ENTRY_BACKGROUND_V2',
    role: 'BACKGROUND_ENVIRONMENT',
    required: true,
    useExactIfApproved: true,
    safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
    focalPoint: 'center top',
  },
  {
    slotKey: 'ASTRAL_WORLD_HERO_MOBILE',
    role: 'BACKGROUND_ENVIRONMENT',
    required: true,
    useExactIfApproved: true,
    safeZone: { top: 12, bottom: 28, left: 6, right: 6 },
    focalPoint: 'center 30%',
  },
  {
    slotKey: 'TAROT_SUITE_MOBILE',
    role: 'MIDGROUND_LAYER',
    required: true,
    useExactIfApproved: true,
    safeZone: { top: 0, bottom: 0, left: 0, right: 40 },
    focalPoint: 'right center',
  },
  {
    slotKey: 'COFFEE_SHOP_MOBILE',
    role: 'MIDGROUND_LAYER',
    required: true,
    useExactIfApproved: true,
    safeZone: { top: 0, bottom: 0, left: 0, right: 40 },
    focalPoint: 'right center',
  },
  {
    slotKey: 'ASTRAL_MALL_MOBILE',
    role: 'MIDGROUND_LAYER',
    required: true,
    useExactIfApproved: true,
    safeZone: { top: 0, bottom: 0, left: 0, right: 40 },
    focalPoint: 'right center',
  },
];

export const SCREEN_ASSET_MANIFESTS: Record<string, ScreenAssetManifestEntry[]> = {
  AW_M_01_WORLD_ENTRY: PILOT_WORLD_ENTRY_MANIFEST,
  AW_D_01_WORLD_ENTRY: [
    {
      slotKey: 'AW_D_01_WORLD_ENTRY_BACKGROUND_V2',
      role: 'BACKGROUND_ENVIRONMENT',
      required: true,
      useExactIfApproved: true,
      safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
      focalPoint: 'center top',
    },
    {
      slotKey: 'ASTRAL_WORLD_HERO_DESKTOP',
      role: 'BACKGROUND_ENVIRONMENT',
      required: true,
      useExactIfApproved: true,
      safeZone: { top: 8, bottom: 24, left: 248, right: 328 },
      focalPoint: 'center top',
    },
  ],
  AW_M_05_COFFEE_SHOP: [
    { slotKey: 'COFFEE_SHOP_HERO_MOBILE', role: 'BACKGROUND_ENVIRONMENT', required: true },
    { slotKey: 'COFFEE_SHOP_TABLE_SCENE', role: 'FOREGROUND_LAYER', required: true },
  ],
};

export function getScreenAssetManifest(screenId: string): ScreenAssetManifestEntry[] {
  return SCREEN_ASSET_MANIFESTS[screenId] ?? [];
}
