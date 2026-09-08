/**
 * Sprint B4.9 — Final cinematic storyboard IDs and paths.
 */

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-001' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_VERSION = '001' as const;

export const ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_ID =
  'NDX-ENTRY-002-FINAL-CINEMATIC-STORYBOARD-STRIP-001' as const;

export const FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT = 15 as const;

export function buildEntry002FinalCinematicStoryboardPanelId(panelNumber: number): string {
  return `${ENTRY_002_FINAL_CINEMATIC_STORYBOARD_ID}-PANEL-${String(panelNumber).padStart(2, '0')}`;
}

export function buildEntry002FinalCinematicStoryboardStripStoragePath(): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/final-cinematic-storyboard/${ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_ID.toLowerCase()}.webp`;
}

export function buildEntry002FinalCinematicStoryboardPublicStripPath(): string {
  return `/assets/expression-engine/entry-002/final-cinematic-storyboard/${ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_ID.toLowerCase()}.jpg`;
}
