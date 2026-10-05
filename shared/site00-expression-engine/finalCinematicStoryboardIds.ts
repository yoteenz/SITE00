/**
 * Sprint B4.9 / B4.9R — Final cinematic storyboard IDs and paths.
 */

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-001' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-002' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-003' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-004' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-005' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-006' as const;

/** @deprecated use ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID */
export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID = ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_VERSION = '004' as const;
export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_VERSION = '005' as const;
export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_VERSION = '006' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_006_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-STRIP-006' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_004_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-STRIP-004' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_005_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-STRIP-005' as const;

export const REEL_STORYBOARD_MOMENT_COUNT_TARGET = 9 as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_VERSION = '001' as const;
export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_VERSION = '002' as const;
export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_VERSION = '003' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_003_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-STRIP-003' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_001_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-STRIP-001' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_002_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-STRIP-002' as const;

/** @deprecated */
export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_ID = ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_001_ID;

export const FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET = 16 as const;
export const FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_MIN = 12 as const;

/** @deprecated B4.9 used 15 */
export const FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT = 15 as const;

export function buildEntry002FinalCinematicStoryboardPanelId(
  storyboardId: string,
  panelNumber: number,
): string {
  return `${storyboardId}-PANEL-${String(panelNumber).padStart(2, '0')}`;
}

export function buildEntry002FinalCinematicStoryboardPanelAssetId(
  storyboardId: string,
  panelNumber: number,
  version = '001',
): string {
  return `${buildEntry002FinalCinematicStoryboardPanelId(storyboardId, panelNumber)}-ASSET-${version}`;
}

export function buildEntry002FinalCinematicStoryboardPanelPublicPath(
  storyboardId: string,
  panelNumber: number,
  version = '001',
): string {
  const panelId = buildEntry002FinalCinematicStoryboardPanelId(storyboardId, panelNumber).toLowerCase();
  return `/assets/expression-engine/entry-002/final-cinematic-storyboard/panels/${panelId}-v${version}.jpg`;
}

export function buildEntry002FinalCinematicStoryboardStripStoragePath(stripId: string): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/final-cinematic-storyboard/${stripId.toLowerCase()}.webp`;
}

export function buildEntry002FinalCinematicStoryboardPublicStripPath(stripId: string): string {
  return `/assets/expression-engine/entry-002/final-cinematic-storyboard/${stripId.toLowerCase()}.jpg`;
}
