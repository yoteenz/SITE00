/**
 * P0.E.FT5.2 — Astral World board-to-screen map.
 * Permanently removes ambiguity between source boards and individual screens.
 */

import { ASTRAL_FAST_TRACK_BASE } from '../routes.js';
import type { SourceRegionSpec, SourceBoardId } from './types.js';

export type BoardToScreenEntry = {
  screenId: string;
  route: string;
  screenName: string;
  viewport: 'mobile' | 'desktop';
  targetViewportWidth: number;
  state: 'default' | 'overlay' | 'drawer' | 'transport' | 'selected';
  sourceBoard: SourceBoardId;
  sourceRegion: SourceRegionSpec;
  relatedSceneId: string;
  responsivePair: string;
};

const BASE = ASTRAL_FAST_TRACK_BASE;

/** Mobile board 941×1672 — screens stacked vertically; regions in board pixels */
function mobileEntryRegion(): SourceRegionSpec {
  return { x: 0, y: 0, width: 941, height: 520, backgroundPosition: '68% 12%', backgroundSize: '320% auto' };
}

function mobileScreenRegion(y: number, height: number, position: string): SourceRegionSpec {
  return { x: 0, y, width: 941, height, backgroundPosition: position, backgroundSize: '300% auto' };
}

/** Desktop board 1672×941 — regions in board pixels */
function desktopHeroRegion(): SourceRegionSpec {
  return { x: 0, y: 0, width: 1672, height: 520, backgroundPosition: '42% 6%', backgroundSize: '185% auto' };
}

function desktopQuadrantRegion(x: number, y: number, w: number, h: number, position: string): SourceRegionSpec {
  return { x, y, width: w, height: h, backgroundPosition: position, backgroundSize: '220% auto' };
}

export const ASTRAL_WORLD_BOARD_TO_SCREEN_MAP: BoardToScreenEntry[] = [
  // ── Mobile primary screens ──
  {
    screenId: 'AW_M_01_WORLD_ENTRY',
    route: `${BASE}/home`,
    screenName: 'World Entry',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileEntryRegion(),
    relatedSceneId: 'HOME_ARRIVAL',
    responsivePair: 'AW_D_01_WORLD_ENTRY',
  },
  {
    screenId: 'AW_M_02_ASTREA_DISTRICT',
    route: `${BASE}/astrea`,
    screenName: 'Astréa District',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 22%'),
    relatedSceneId: 'ASTREA_DISTRICT',
    responsivePair: 'AW_D_02_ASTREA_DISTRICT',
  },
  {
    screenId: 'AW_M_03_TAROT_SUITE',
    route: `${BASE}/astrea/tarot-suite`,
    screenName: 'Tarot Suite',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 48%'),
    relatedSceneId: 'TAROT_SUITE',
    responsivePair: 'AW_D_03_TAROT_SUITE',
  },
  {
    screenId: 'AW_M_04_ASTRAL_MALL',
    route: `${BASE}/astrea/astral-mall`,
    screenName: 'Astral Mall',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 58%'),
    relatedSceneId: 'ASTRAL_MALL',
    responsivePair: 'AW_D_04_ASTRAL_MALL',
  },
  {
    screenId: 'AW_M_05_COFFEE_SHOP',
    route: `${BASE}/astrea/coffee-shop`,
    screenName: 'Coffee Shop',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 38%'),
    relatedSceneId: 'COFFEE_SHOP',
    responsivePair: 'AW_D_05_COFFEE_SHOP',
  },
  {
    screenId: 'AW_M_06_FIND_MY_READER',
    route: `${BASE}/readers`,
    screenName: 'Find My Reader',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(1112, 560, '68% 68%'),
    relatedSceneId: 'FIND_MY_READER',
    responsivePair: 'AW_D_06_FIND_MY_READER',
  },
  {
    screenId: 'AW_M_07_WHOS_HERE',
    route: `${BASE}/home`,
    screenName: "Who's Here Overlay",
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'overlay',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(0, 520, '68% 32%'),
    relatedSceneId: 'HOME_ARRIVAL',
    responsivePair: 'AW_D_07_WHOS_HERE',
  },
  {
    screenId: 'AW_M_08_FRIENDS',
    route: `${BASE}/friends`,
    screenName: 'Friends',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(1112, 560, '68% 32%'),
    relatedSceneId: 'FRIENDS_PRESENCE',
    responsivePair: 'AW_D_08_FRIENDS',
  },
  {
    screenId: 'AW_M_09_JOURNAL',
    route: `${BASE}/journal`,
    screenName: 'Journal',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(1112, 560, '68% 78%'),
    relatedSceneId: 'JOURNAL_ARTIFACT',
    responsivePair: 'AW_D_09_JOURNAL',
  },
  {
    screenId: 'AW_M_10_PROFILE',
    route: `${BASE}/profile`,
    screenName: 'Profile',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'default',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 85%'),
    relatedSceneId: 'PROFILE_AVATAR',
    responsivePair: 'AW_D_10_PROFILE',
  },
  {
    screenId: 'AW_M_11_TAKE_ME_SOMEWHERE_DEFAULT',
    route: `${BASE}/home`,
    screenName: 'Take Me Somewhere',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'overlay',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 45%'),
    relatedSceneId: 'HOME_ARRIVAL',
    responsivePair: 'AW_D_11_TAKE_ME_SOMEWHERE_DEFAULT',
  },
  {
    screenId: 'AW_M_12_TAKE_ME_SOMEWHERE_RESULT',
    route: `${BASE}/home`,
    screenName: 'Take Me Somewhere Result',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'transport',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 45%'),
    relatedSceneId: 'HOME_ARRIVAL',
    responsivePair: 'AW_D_12_TAKE_ME_SOMEWHERE_RESULT',
  },
  {
    screenId: 'AW_M_13_COFFEE_TABLE_SELECTED',
    route: `${BASE}/astrea/coffee-shop`,
    screenName: 'Coffee Table Selected',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'selected',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 38%'),
    relatedSceneId: 'COFFEE_SHOP',
    responsivePair: 'AW_D_13_COFFEE_TABLE_SELECTED',
  },
  {
    screenId: 'AW_M_14_KIOSK_SELECTED',
    route: `${BASE}/astrea/astral-mall`,
    screenName: 'Kiosk Selected',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'selected',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(556, 556, '68% 58%'),
    relatedSceneId: 'ASTRAL_MALL',
    responsivePair: 'AW_D_14_KIOSK_SELECTED',
  },
  {
    screenId: 'AW_M_15_READER_SELECTED',
    route: `${BASE}/readers`,
    screenName: 'Reader Selected',
    viewport: 'mobile',
    targetViewportWidth: 390,
    state: 'selected',
    sourceBoard: 'MASTER_MOBILE_REFERENCE',
    sourceRegion: mobileScreenRegion(1112, 560, '68% 68%'),
    relatedSceneId: 'FIND_MY_READER',
    responsivePair: 'AW_D_15_READER_SELECTED',
  },
  // ── Desktop primary screens ──
  {
    screenId: 'AW_D_01_WORLD_ENTRY',
    route: `${BASE}/home`,
    screenName: 'World Entry',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopHeroRegion(),
    relatedSceneId: 'HOME_ARRIVAL',
    responsivePair: 'AW_M_01_WORLD_ENTRY',
  },
  {
    screenId: 'AW_D_02_ASTREA_DISTRICT',
    route: `${BASE}/astrea`,
    screenName: 'Astréa District',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(400, 200, 872, 520, '50% 38%'),
    relatedSceneId: 'ASTREA_DISTRICT',
    responsivePair: 'AW_M_02_ASTREA_DISTRICT',
  },
  {
    screenId: 'AW_D_03_TAROT_SUITE',
    route: `${BASE}/astrea/tarot-suite`,
    screenName: 'Tarot Suite',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(0, 420, 560, 520, '18% 72%'),
    relatedSceneId: 'TAROT_SUITE',
    responsivePair: 'AW_M_03_TAROT_SUITE',
  },
  {
    screenId: 'AW_D_04_ASTRAL_MALL',
    route: `${BASE}/astrea/astral-mall`,
    screenName: 'Astral Mall',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(560, 420, 560, 520, '50% 72%'),
    relatedSceneId: 'ASTRAL_MALL',
    responsivePair: 'AW_M_04_ASTRAL_MALL',
  },
  {
    screenId: 'AW_D_05_COFFEE_SHOP',
    route: `${BASE}/astrea/coffee-shop`,
    screenName: 'Coffee Shop',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(1120, 420, 552, 520, '82% 72%'),
    relatedSceneId: 'COFFEE_SHOP',
    responsivePair: 'AW_M_05_COFFEE_SHOP',
  },
  {
    screenId: 'AW_D_06_FIND_MY_READER',
    route: `${BASE}/readers`,
    screenName: 'Find My Reader',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(1200, 0, 472, 420, '86% 32%'),
    relatedSceneId: 'FIND_MY_READER',
    responsivePair: 'AW_M_06_FIND_MY_READER',
  },
  {
    screenId: 'AW_D_07_WHOS_HERE',
    route: `${BASE}/home`,
    screenName: "Who's Here",
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'overlay',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(1200, 0, 472, 420, '88% 28%'),
    relatedSceneId: 'HOME_ARRIVAL',
    responsivePair: 'AW_M_07_WHOS_HERE',
  },
  {
    screenId: 'AW_D_08_FRIENDS',
    route: `${BASE}/friends`,
    screenName: 'Friends',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(1200, 0, 472, 420, '88% 28%'),
    relatedSceneId: 'FRIENDS_PRESENCE',
    responsivePair: 'AW_M_08_FRIENDS',
  },
  {
    screenId: 'AW_D_09_JOURNAL',
    route: `${BASE}/journal`,
    screenName: 'Journal',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(1200, 420, 472, 520, '88% 55%'),
    relatedSceneId: 'JOURNAL_ARTIFACT',
    responsivePair: 'AW_M_09_JOURNAL',
  },
  {
    screenId: 'AW_D_10_PROFILE',
    route: `${BASE}/profile`,
    screenName: 'Profile',
    viewport: 'desktop',
    targetViewportWidth: 1280,
    state: 'default',
    sourceBoard: 'MASTER_DESKTOP_REFERENCE',
    sourceRegion: desktopQuadrantRegion(0, 420, 400, 520, '12% 55%'),
    relatedSceneId: 'PROFILE_AVATAR',
    responsivePair: 'AW_M_10_PROFILE',
  },
];

export function getBoardToScreenEntry(screenId: string): BoardToScreenEntry | undefined {
  return ASTRAL_WORLD_BOARD_TO_SCREEN_MAP.find((e) => e.screenId === screenId);
}

export function getBoardEntriesForViewport(viewport: 'mobile' | 'desktop'): BoardToScreenEntry[] {
  return ASTRAL_WORLD_BOARD_TO_SCREEN_MAP.filter((e) => e.viewport === viewport);
}

export function getBoardEntryForScene(sceneId: string, viewport: 'mobile' | 'desktop'): BoardToScreenEntry | undefined {
  return ASTRAL_WORLD_BOARD_TO_SCREEN_MAP.find(
    (e) => e.relatedSceneId === sceneId && e.viewport === viewport && e.state === 'default',
  );
}
