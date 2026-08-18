/** Session-persisted Composer preview device mode — shared across public routes. */

export type Site00PreviewDeviceMode = 'mobile' | 'desktop';

export const SITE00_PREVIEW_DEVICE_MODE_KEY = 'site00_preview_device_mode';

export function readStoredPreviewDeviceMode(): Site00PreviewDeviceMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SITE00_PREVIEW_DEVICE_MODE_KEY);
    if (raw === 'mobile' || raw === 'desktop') return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredPreviewDeviceMode(mode: Site00PreviewDeviceMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SITE00_PREVIEW_DEVICE_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function defaultPreviewDeviceModeForViewport(): Site00PreviewDeviceMode {
  if (typeof window === 'undefined') return 'mobile';
  return window.matchMedia('(min-width: 768px)').matches ? 'desktop' : 'mobile';
}
