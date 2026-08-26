/**
 * P0.E.FT3.1 — Astral World scene-first architecture types.
 */

import type { ReferenceCropKey } from '../referenceCropRegistry.js';
import type { AstralAssetSlotKey } from '../generation/assetSlotRegistry.js';

export type AstralSceneId =
  | 'HOME_ARRIVAL'
  | 'ASTREA_DISTRICT'
  | 'TAROT_SUITE'
  | 'ASTRAL_MALL'
  | 'COFFEE_SHOP'
  | 'FIND_MY_READER'
  | 'FRIENDS_PRESENCE'
  | 'JOURNAL_ARTIFACT'
  | 'PROFILE_AVATAR';

export type AstralSceneObjectKind =
  | 'DESTINATION'
  | 'READER'
  | 'FRIEND'
  | 'TABLE'
  | 'KIOSK'
  | 'JOURNAL'
  | 'TAROT_CARD'
  | 'AVATAR'
  | 'PORTAL';

export type HotspotAction =
  | 'NAVIGATE'
  | 'OPEN_DRAWER'
  | 'OPEN_OVERLAY'
  | 'START_READING'
  | 'JOIN_TABLE';

export type SceneLayer = 'environment' | 'objects' | 'presence' | 'interaction' | 'hud';

export type HotspotRect = {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
};

export type HotspotAdjustment = Partial<HotspotRect>;

export type AstralHotspotDef = {
  hotspotId: string;
  sceneId: AstralSceneId;
  assetAnchor?: string;
  label: string;
  action: HotspotAction;
  /** Route section or drawer/overlay id */
  target: string;
  rect: HotspotRect;
  mobileAdjustment?: HotspotAdjustment;
  desktopAdjustment?: HotspotAdjustment;
};

export type AstralSceneObjectDef = {
  objectId: string;
  sceneId: AstralSceneId;
  kind: AstralSceneObjectKind;
  label: string;
  position: HotspotRect;
  visualAssetKey?: AstralAssetSlotKey | ReferenceCropKey;
  presenceState?: string;
  actionState?: string;
  overlayBehavior?: 'drawer' | 'overlay' | 'transition';
  target?: string;
};

export type AstralSceneContract = {
  sceneId: AstralSceneId;
  label: string;
  backgroundCrop: ReferenceCropKey;
  backgroundCropMobile: ReferenceCropKey;
  assetSlotKey: AstralAssetSlotKey;
  assetSlotKeyMobile: AstralAssetSlotKey;
  focalPoint: string;
  overlaySafeZones: { top: number; bottom: number; left: number; right: number };
  contentSafeRegion: HotspotRect;
  fallbackCrop: ReferenceCropKey;
};

export function mergeHotspotRect(base: HotspotRect, adj?: HotspotAdjustment): HotspotRect {
  if (!adj) return base;
  return {
    xPercent: adj.xPercent ?? base.xPercent,
    yPercent: adj.yPercent ?? base.yPercent,
    widthPercent: adj.widthPercent ?? base.widthPercent,
    heightPercent: adj.heightPercent ?? base.heightPercent,
  };
}

export function hotspotStyle(rect: HotspotRect): Record<string, string> {
  return {
    left: `${rect.xPercent}%`,
    top: `${rect.yPercent}%`,
    width: `${rect.widthPercent}%`,
    height: `${rect.heightPercent}%`,
  };
}
