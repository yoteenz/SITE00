import type { DevicePreviewMode } from './types.js';

/** Reading widths inside device chrome — not decorative phone bezels. */
export const DEVICE_PREVIEW_WIDTHS: Record<DevicePreviewMode, number> = {
  mobile: 390,
  tablet: 768,
  desktop: 680,
};

export const DEVICE_PREVIEW_MIN_HEIGHT: Record<DevicePreviewMode, number> = {
  mobile: 720,
  tablet: 900,
  desktop: 960,
};

export function devicePreviewLabel(mode: DevicePreviewMode): string {
  return mode.toUpperCase();
}
