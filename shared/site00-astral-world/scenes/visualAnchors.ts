/**
 * P0.E.FT5 — Visual anchor system for scene-aligned UI placement.
 */

import type { AstralSceneId } from './types.js';

export type VisualAnchorId =
  | 'TOP_WORLD_EDGE'
  | 'CENTER_SCENE_AXIS'
  | 'LEFT_ARCHITECTURAL_EDGE'
  | 'RIGHT_ARCHITECTURAL_EDGE'
  | 'PRIMARY_PORTAL'
  | 'PRIMARY_TABLE'
  | 'PRIMARY_KIOSK'
  | 'DISTRICT_CENTER'
  | 'BOTTOM_HUD_LINE'
  | 'READER_CLUSTER'
  | 'SOCIAL_TABLE_CLUSTER'
  | 'CONTENT_SAFE_OVERLAY'
  | 'FLOATING_HUD';

export type VisualAnchorSpec = {
  anchorId: VisualAnchorId;
  xPercent: number;
  yPercent: number;
  widthPercent?: number;
  heightPercent?: number;
  notes?: string;
};

/** Per-scene anchor map — align live UI to architectural composition */
export const ASTRAL_SCENE_ANCHORS: Partial<Record<AstralSceneId, VisualAnchorSpec[]>> = {
  HOME_ARRIVAL: [
    { anchorId: 'TOP_WORLD_EDGE', xPercent: 50, yPercent: 8, notes: 'Master universe label' },
    { anchorId: 'CENTER_SCENE_AXIS', xPercent: 50, yPercent: 42, notes: 'Cinematic depth axis' },
    { anchorId: 'PRIMARY_PORTAL', xPercent: 50, yPercent: 62, notes: 'Enter Astréa CTA' },
    { anchorId: 'BOTTOM_HUD_LINE', xPercent: 50, yPercent: 88, notes: 'World action tokens' },
    { anchorId: 'FLOATING_HUD', xPercent: 50, yPercent: 6, notes: 'Live occupancy chips' },
  ],
  ASTREA_DISTRICT: [
    { anchorId: 'LEFT_ARCHITECTURAL_EDGE', xPercent: 14, yPercent: 52, notes: 'Tarot Suite portal' },
    { anchorId: 'DISTRICT_CENTER', xPercent: 50, yPercent: 40, notes: 'Mall center spire' },
    { anchorId: 'RIGHT_ARCHITECTURAL_EDGE', xPercent: 82, yPercent: 52, notes: 'Coffee Shop corner' },
    { anchorId: 'CONTENT_SAFE_OVERLAY', xPercent: 50, yPercent: 72, notes: 'District title safe zone' },
    { anchorId: 'FLOATING_HUD', xPercent: 50, yPercent: 6, notes: 'Compact world stats' },
  ],
  TAROT_SUITE: [
    { anchorId: 'PRIMARY_TABLE', xPercent: 50, yPercent: 58, notes: 'Reading table object' },
    { anchorId: 'READER_CLUSTER', xPercent: 82, yPercent: 38, notes: 'Reader availability wall' },
    { anchorId: 'CONTENT_SAFE_OVERLAY', xPercent: 50, yPercent: 68, notes: 'Suite title' },
  ],
  ASTRAL_MALL: [
    { anchorId: 'PRIMARY_KIOSK', xPercent: 50, yPercent: 46, notes: 'Central quick-pull kiosk' },
    { anchorId: 'LEFT_ARCHITECTURAL_EDGE', xPercent: 18, yPercent: 52, notes: 'Love kiosk' },
    { anchorId: 'RIGHT_ARCHITECTURAL_EDGE', xPercent: 78, yPercent: 50, notes: 'Career kiosk' },
    { anchorId: 'BOTTOM_HUD_LINE', xPercent: 50, yPercent: 82, notes: 'Kiosk tray anchor' },
  ],
  COFFEE_SHOP: [
    { anchorId: 'SOCIAL_TABLE_CLUSTER', xPercent: 50, yPercent: 55, notes: 'Live table row' },
    { anchorId: 'PRIMARY_TABLE', xPercent: 38, yPercent: 52, notes: 'Join Her Table focus' },
    { anchorId: 'CONTENT_SAFE_OVERLAY', xPercent: 50, yPercent: 62, notes: 'Community title' },
  ],
  FIND_MY_READER: [
    { anchorId: 'READER_CLUSTER', xPercent: 50, yPercent: 38, notes: 'Portrait orbit center' },
    { anchorId: 'CONTENT_SAFE_OVERLAY', xPercent: 50, yPercent: 78, notes: 'Invoke lens + sigils' },
  ],
  FRIENDS_PRESENCE: [
    { anchorId: 'READER_CLUSTER', xPercent: 50, yPercent: 45, notes: 'Spatial presence groups' },
    { anchorId: 'CONTENT_SAFE_OVERLAY', xPercent: 50, yPercent: 72, notes: 'Where are my people' },
  ],
  JOURNAL_ARTIFACT: [
    { anchorId: 'CENTER_SCENE_AXIS', xPercent: 50, yPercent: 50, notes: 'Open book artifact' },
    { anchorId: 'CONTENT_SAFE_OVERLAY', xPercent: 50, yPercent: 48, notes: 'Page tabs overlay' },
  ],
  PROFILE_AVATAR: [
    { anchorId: 'CENTER_SCENE_AXIS', xPercent: 50, yPercent: 28, notes: 'Dominant avatar' },
    { anchorId: 'BOTTOM_HUD_LINE', xPercent: 50, yPercent: 72, notes: 'Your World portals grid' },
  ],
};

export function getAnchorsForScene(sceneId: AstralSceneId): VisualAnchorSpec[] {
  return ASTRAL_SCENE_ANCHORS[sceneId] ?? [];
}
