/**
 * P0.E.FT5.2 — Resolve visual authority for Astral World screens.
 * Hierarchy: canonical screen master → generated ACTIVE asset → board crop fallback.
 */

import type { AstralSceneId } from '../scenes/types.js';
import type { AstralAssetStoreSnapshot } from '../generation/assetResolver.js';
import { resolveAstralAsset } from '../generation/assetResolver.js';
import type { AstralAssetSlotKey } from '../generation/assetSlotRegistry.js';
import { getScreenMasterForScene, isCanonicalMasterAuthority } from './registry.js';

export type ScreenAuthorityResolution = {
  source: 'CANONICAL_SCREEN_MASTER' | 'GENERATED_ACTIVE' | 'BOARD_CROP' | 'FALLBACK';
  url: string;
  screenId?: string;
  masterVersion?: number;
  backgroundPosition?: string;
  backgroundSize?: string;
};

export function resolveScreenAuthority(
  sceneId: AstralSceneId,
  slotKey: AstralAssetSlotKey,
  store: AstralAssetStoreSnapshot,
  viewport: 'mobile' | 'desktop',
  origin = '',
): ScreenAuthorityResolution {
  const master = getScreenMasterForScene(sceneId, viewport);
  if (master && isCanonicalMasterAuthority(master.screenId)) {
    const url = master.canonicalMasterPath.startsWith('http')
      ? master.canonicalMasterPath
      : `${origin}${master.canonicalMasterPath}`;
    return {
      source: 'CANONICAL_SCREEN_MASTER',
      url,
      screenId: master.screenId,
      masterVersion: master.version,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    };
  }

  const generated = resolveAstralAsset(slotKey, store, origin);
  if (generated.source === 'ACTIVE' || generated.source === 'READY') {
    return {
      source: 'GENERATED_ACTIVE',
      url: generated.url,
      backgroundPosition: generated.backgroundPosition,
      backgroundSize: generated.backgroundSize,
    };
  }

  if (generated.source === 'REFERENCE') {
    return {
      source: 'BOARD_CROP',
      url: generated.url,
      backgroundPosition: generated.backgroundPosition,
      backgroundSize: generated.backgroundSize,
    };
  }

  return { source: 'FALLBACK', url: generated.url };
}

export function canonicalMasterBlocksBoardReference(screenId: string): boolean {
  return isCanonicalMasterAuthority(screenId);
}
