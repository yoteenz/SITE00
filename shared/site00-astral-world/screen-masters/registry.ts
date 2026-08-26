/**
 * P0.E.FT5.2 — Canonical screen master registry.
 */

import type { AstralSceneId } from '../scenes/types.js';
import {
  ASTRAL_WORLD_BOARD_TO_SCREEN_MAP,
  getBoardEntryForScene,
  getBoardToScreenEntry,
} from './boardToScreenMap.js';
import { getScreenAssetManifest } from './screenAssetManifests.js';
import type {
  CanonicalScreenMaster,
  ScreenMasterApprovalState,
  ScreenVisualLockRecord,
} from './types.js';
import { ASTRAL_WORLD_PROJECT_ID } from './types.js';

const PILOT_ANCHORS = [
  { anchorId: 'TOP_WORLD_EDGE' as const, xPercent: 50, yPercent: 8, notes: 'Master universe label' },
  { anchorId: 'CITY_HORIZON' as const, xPercent: 50, yPercent: 28, notes: 'Cinematic depth horizon' },
  { anchorId: 'ASTREA_CENTER' as const, xPercent: 50, yPercent: 42, notes: 'District glow center' },
  { anchorId: 'PRIMARY_TITLE_ORIGIN' as const, xPercent: 50, yPercent: 58, notes: 'Welcome title' },
  { anchorId: 'ENTER_ACTION_ORIGIN' as const, xPercent: 50, yPercent: 68, notes: 'Enter Astréa CTA' },
  { anchorId: 'BOTTOM_HUD_LINE' as const, xPercent: 50, yPercent: 88, notes: 'World action tokens' },
  { anchorId: 'NAV_BASELINE' as const, xPercent: 50, yPercent: 96, notes: 'Bottom nav baseline' },
];

const masters = new Map<string, CanonicalScreenMaster>();
const visualLocks = new Map<string, ScreenVisualLockRecord>();

function masterDir(screenId: string, viewport: 'mobile' | 'desktop'): string {
  return `docs/projects/astral-world/screen-masters/${viewport}/${screenId}`;
}

function publicMasterPath(screenId: string, viewport: 'mobile' | 'desktop', version: number): string {
  return `/astral-world/screen-masters/${viewport}/${screenId}/canonical-master-v${version}.png`;
}

function buildMasterFromBoardEntry(
  entry: (typeof ASTRAL_WORLD_BOARD_TO_SCREEN_MAP)[number],
  overrides?: Partial<CanonicalScreenMaster>,
): CanonicalScreenMaster {
  const now = new Date().toISOString();
  const { width, height } = entry.sourceRegion;
  const dir = masterDir(entry.screenId, entry.viewport);
  const version = overrides?.version ?? 1;
  return {
    screenId: entry.screenId,
    projectId: ASTRAL_WORLD_PROJECT_ID,
    route: entry.route,
    screenName: entry.screenName,
    viewportClass: entry.viewport,
    targetViewportWidth: entry.targetViewportWidth,
    state: entry.state,
    referenceLevel: 'CANONICAL_SCREEN_MASTER',
    sourceBoard: entry.sourceBoard,
    sourceRegion: entry.sourceRegion,
    sourceRegionPath: `${dir}/source-region.png`,
    canonicalMasterPath: publicMasterPath(entry.screenId, entry.viewport, version),
    width,
    height,
    aspectRatio: `${width}/${height}`,
    version,
    approvalState: 'SOURCE_IDENTIFIED',
    referenceAuthority: true,
    relatedSceneId: entry.relatedSceneId as AstralSceneId,
    responsivePair: entry.responsivePair,
    assetManifest: getScreenAssetManifest(entry.screenId),
    visualAnchors: entry.screenId === 'AW_M_01_WORLD_ENTRY' ? PILOT_ANCHORS : [],
    supersedes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function initializeScreenMasterRegistry(): void {
  if (masters.size > 0) return;
  for (const entry of ASTRAL_WORLD_BOARD_TO_SCREEN_MAP) {
    const master = buildMasterFromBoardEntry(entry);
    if (entry.screenId === 'AW_M_01_WORLD_ENTRY') {
      master.approvalState = 'MASTER_READY_FOR_REVIEW';
      master.canonicalMasterPath = '/astral-world/screen-masters/mobile/AW_M_01_WORLD_ENTRY/canonical-master-v1.png';
      master.width = 390;
      master.height = 216;
      master.aspectRatio = '390/216';
      master.referenceLevel = 'CANONICAL_SCREEN_MASTER';
    }
    masters.set(entry.screenId, master);
  }
}

export function getScreenMaster(screenId: string): CanonicalScreenMaster | null {
  initializeScreenMasterRegistry();
  return masters.get(screenId) ?? null;
}

export function getScreenMasterForScene(
  sceneId: AstralSceneId,
  viewport: 'mobile' | 'desktop',
): CanonicalScreenMaster | null {
  initializeScreenMasterRegistry();
  const entry = getBoardEntryForScene(sceneId, viewport);
  if (!entry) return null;
  return masters.get(entry.screenId) ?? null;
}

export function listScreenMasters(filter?: {
  viewport?: 'mobile' | 'desktop';
  approvalState?: ScreenMasterApprovalState;
}): CanonicalScreenMaster[] {
  initializeScreenMasterRegistry();
  return [...masters.values()].filter((m) => {
    if (filter?.viewport && m.viewportClass !== filter.viewport) return false;
    if (filter?.approvalState && m.approvalState !== filter.approvalState) return false;
    return true;
  });
}

export function upsertScreenMaster(master: CanonicalScreenMaster): void {
  masters.set(master.screenId, { ...master, updatedAt: new Date().toISOString() });
}

export function updateScreenMasterApproval(
  screenId: string,
  approvalState: ScreenMasterApprovalState,
  patch?: Partial<CanonicalScreenMaster>,
): CanonicalScreenMaster | null {
  const existing = getScreenMaster(screenId);
  if (!existing) return null;
  const updated: CanonicalScreenMaster = {
    ...existing,
    ...patch,
    approvalState,
    updatedAt: new Date().toISOString(),
  };
  masters.set(screenId, updated);
  return updated;
}

export function setScreenVisualLock(screenId: string, locked: boolean, blockedBy?: string): void {
  visualLocks.set(screenId, { screenId, screenVisualLock: locked, blockedBy });
}

export function getScreenVisualLock(screenId: string): ScreenVisualLockRecord {
  return visualLocks.get(screenId) ?? { screenId, screenVisualLock: false };
}

export function isCanonicalMasterAuthority(screenId: string): boolean {
  const master = getScreenMaster(screenId);
  if (!master) return false;
  return (
    master.approvalState === 'MASTER_APPROVED'
    || master.approvalState === 'MASTER_LOCKED'
    || master.approvalState === 'MASTER_READY_FOR_REVIEW'
  );
}

export function shouldUseBoardReference(screenId: string): boolean {
  return !isCanonicalMasterAuthority(screenId);
}

export function resetScreenMasterRegistryForTest(): void {
  masters.clear();
  visualLocks.clear();
}

export function registerExtractedPilotMaster(input: {
  width: number;
  height: number;
  version?: number;
  approvalState?: ScreenMasterApprovalState;
  vr2ReferenceId?: string;
}): CanonicalScreenMaster {
  const entry = getBoardToScreenEntry('AW_M_01_WORLD_ENTRY');
  if (!entry) throw new Error('Pilot screen AW_M_01_WORLD_ENTRY not in board map');
  const version = input.version ?? 1;
  const master = buildMasterFromBoardEntry(entry, {
    width: input.width,
    height: input.height,
    aspectRatio: `${input.width}/${input.height}`,
    version,
    approvalState: input.approvalState ?? 'MASTER_READY_FOR_REVIEW',
    referenceLevel: 'CANONICAL_SCREEN_MASTER',
    visualAnchors: PILOT_ANCHORS,
    assetManifest: getScreenAssetManifest('AW_M_01_WORLD_ENTRY'),
    vr2ReferenceId: input.vr2ReferenceId,
    sourceRegionPath: `${masterDir('AW_M_01_WORLD_ENTRY', 'mobile')}/source-region.png`,
    canonicalMasterPath: publicMasterPath('AW_M_01_WORLD_ENTRY', 'mobile', version),
  });
  masters.set(master.screenId, master);
  return master;
}

export { PILOT_ANCHORS };
