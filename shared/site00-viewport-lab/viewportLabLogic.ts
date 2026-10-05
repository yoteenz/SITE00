import type { ViewportLabPreset } from './presets.js';

export type ViewportLabOrientation = 'portrait' | 'landscape';

export type ViewportLabZoomMode = 'fit' | 0.5 | 0.75 | 1 | 1.25;

/** Preset dimensions are the canonical QA size; orientation toggles swap from that baseline. */
export function presetDefaultOrientation(preset: ViewportLabPreset): ViewportLabOrientation {
  return preset.height >= preset.width ? 'portrait' : 'landscape';
}

export function swapOrientationDimensions(
  width: number,
  height: number,
  orientation: ViewportLabOrientation,
): { width: number; height: number } {
  const isPortrait = height >= width;
  const wantPortrait = orientation === 'portrait';
  if (isPortrait === wantPortrait) return { width, height };
  return { width: height, height: width };
}

export function effectiveViewportSize(
  preset: ViewportLabPreset,
  orientation: ViewportLabOrientation,
): { width: number; height: number } {
  const baseline = presetDefaultOrientation(preset);
  if (orientation === baseline) {
    return { width: preset.width, height: preset.height };
  }
  return { width: preset.height, height: preset.width };
}

export function computePreviewScale(params: {
  frameWidth: number;
  frameHeight: number;
  workspaceWidth: number;
  workspaceHeight: number;
  zoom: ViewportLabZoomMode;
}): number {
  if (params.zoom !== 'fit') return params.zoom;
  if (params.workspaceWidth <= 0 || params.workspaceHeight <= 0) return 1;
  const pad = 24;
  const availW = Math.max(1, params.workspaceWidth - pad);
  const availH = Math.max(1, params.workspaceHeight - pad);
  return Math.min(1, availW / params.frameWidth, availH / params.frameHeight);
}

export function iframeRefreshKey(base: string, refreshNonce: number): string {
  return `${base}::${refreshNonce}`;
}
