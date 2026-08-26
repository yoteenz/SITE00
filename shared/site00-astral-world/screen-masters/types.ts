/**
 * P0.E.FT5.2 — Canonical screen master types.
 * Adapts SITE 00 P0.VR.2 CanonicalVisualReference for Astral World WORLD_SCREEN.
 */

import type { DesignViewportClass } from '../../site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import type { AstralSceneId } from '../scenes/types.js';
import type { AstralAssetSlotKey } from '../generation/assetSlotRegistry.js';

export const ASTRAL_WORLD_PROJECT_ID = 'astral-world' as const;

export const SCREEN_MASTER_APPROVAL_STATES = [
  'SOURCE_IDENTIFIED',
  'MASTER_RECONSTRUCTING',
  'MASTER_READY_FOR_REVIEW',
  'MASTER_APPROVED',
  'MASTER_LOCKED',
  'SUPERSEDED',
] as const;

export type ScreenMasterApprovalState = (typeof SCREEN_MASTER_APPROVAL_STATES)[number];

export const REFERENCE_LEVELS = ['SOURCE_BOARD', 'SCREEN_SOURCE_REGION', 'CANONICAL_SCREEN_MASTER'] as const;
export type ReferenceLevel = (typeof REFERENCE_LEVELS)[number];

export type SourceBoardId = 'MASTER_DESKTOP_REFERENCE' | 'MASTER_MOBILE_REFERENCE';

export type SourceRegionSpec = {
  /** Pixel coordinates on source board */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Optional CSS-equivalent crop hint from legacy registry */
  backgroundPosition?: string;
  backgroundSize?: string;
};

export type ScreenVisualAnchorId =
  | 'TOP_WORLD_EDGE'
  | 'CITY_HORIZON'
  | 'ASTREA_CENTER'
  | 'PRIMARY_TITLE_ORIGIN'
  | 'ENTER_ACTION_ORIGIN'
  | 'BOTTOM_HUD_LINE'
  | 'NAV_BASELINE'
  | 'WINDOW_LINE'
  | 'MAIN_TABLE_CENTER'
  | 'FOREGROUND_TABLE_EDGE'
  | 'SOCIAL_GROUP_CENTER'
  | 'JOIN_HER_TABLE_ANCHOR';

export type ScreenVisualAnchor = {
  anchorId: ScreenVisualAnchorId;
  xPercent: number;
  yPercent: number;
  notes?: string;
};

export type ScreenAssetRole =
  | 'BACKGROUND_ENVIRONMENT'
  | 'FOREGROUND_LAYER'
  | 'MIDGROUND_LAYER'
  | 'CHARACTER_GROUP'
  | 'OBJECT'
  | 'PORTRAIT'
  | 'AMBIENT_LAYER'
  | 'ARCHITECTURAL_STRUCTURE';

export type ScreenAssetManifestEntry = {
  slotKey: AstralAssetSlotKey | string;
  role: ScreenAssetRole;
  required: boolean;
  /** Exact approved asset — skip regeneration if present */
  useExactIfApproved?: boolean;
  safeZone?: { top: number; bottom: number; left: number; right: number };
  focalPoint?: string;
};

export type CanonicalScreenMaster = {
  screenId: string;
  projectId: typeof ASTRAL_WORLD_PROJECT_ID;
  route: string;
  screenName: string;
  viewportClass: DesignViewportClass;
  targetViewportWidth: number;
  state: 'default' | 'overlay' | 'drawer' | 'transport' | 'selected';
  referenceLevel: ReferenceLevel;
  sourceBoard: SourceBoardId;
  sourceRegion: SourceRegionSpec;
  sourceRegionPath: string;
  canonicalMasterPath: string;
  width: number;
  height: number;
  aspectRatio: string;
  version: number;
  approvalState: ScreenMasterApprovalState;
  referenceAuthority: true;
  relatedSceneId: AstralSceneId;
  responsivePair?: string;
  assetManifest: ScreenAssetManifestEntry[];
  visualAnchors: ScreenVisualAnchor[];
  interactionContract?: string;
  supersedes: number | null;
  vr2ReferenceId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Ft51AssetReconciliationClass =
  | 'SCREEN_ALIGNED_REUSABLE'
  | 'POTENTIALLY_REUSABLE'
  | 'REQUIRES_REGENERATION'
  | 'UNBOUND_EXPLORATION';

export type Ft51AssetReconciliation = {
  slotKey: string;
  classification: Ft51AssetReconciliationClass;
  servesScreens: string[];
  reason: string;
};

export type ScreenVisualLockRecord = {
  screenId: string;
  screenVisualLock: boolean;
  blockedBy?: string;
};
