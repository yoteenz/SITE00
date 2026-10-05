/**
 * Sprint B4.4 — pinned Entry 002 REEL storyboard asset identities.
 */

export const ENTRY_002_REEL_STORYBOARD_001 = 'NDX-ENTRY-002-REEL-STORYBOARD-001' as const;
export const ENTRY_002_REEL_STORYBOARD_STRIP_001 = 'NDX-ENTRY-002-REEL-STORYBOARD-STRIP-001' as const;

export const ENTRY_002_REEL_SB_PANEL_COUNT = 10 as const;

export function buildEntry002ReelStoryboardPanelId(panelNumber: number): string {
  const suffix = String(panelNumber).padStart(3, '0');
  return `NDX-ENTRY-002-REEL-SB-PANEL-${suffix}`;
}

export function buildEntry002ReelStoryboardPanelStoragePath(panelId: string): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/storyboard/${panelId.toLowerCase()}.webp`;
}

export function buildEntry002ReelStoryboardStripStoragePath(stripId: string): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/storyboard/${stripId.toLowerCase()}.webp`;
}

export const ENTRY_002_REEL_SB_ASPECT_RATIO = '9:16' as const;
export const ENTRY_002_REEL_SB_PANEL_DIMENSIONS = { width: 540, height: 960 } as const;
export const ENTRY_002_REEL_SB_STRIP_DIMENSIONS = { width: 5400, height: 960 } as const;
