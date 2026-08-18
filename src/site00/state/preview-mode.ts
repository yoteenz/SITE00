/**
 * Composer / QA presentation override — shared across public routes.
 * AUTO follows viewport; mobile/desktop are explicit preview overrides.
 */

export type Site00PresentationOverride = 'auto' | 'mobile' | 'desktop';

/** @deprecated Use Site00PresentationOverride */
export type Site00PreviewDeviceMode = 'mobile' | 'desktop';

export const SITE00_PRESENTATION_OVERRIDE_KEY = 'site00_presentation_override_v2';

/** Legacy key — ignored on read; cleared on write to prevent stale desktop lock-in */
const LEGACY_PREVIEW_KEY = 'site00_preview_device_mode';

export function readStoredPresentationOverride(): Site00PresentationOverride | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SITE00_PRESENTATION_OVERRIDE_KEY);
    if (raw === 'auto' || raw === 'mobile' || raw === 'desktop') return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredPresentationOverride(mode: Site00PresentationOverride): void {
  if (typeof window === 'undefined') return;
  try {
    if (mode === 'auto') {
      window.sessionStorage.removeItem(SITE00_PRESENTATION_OVERRIDE_KEY);
    } else {
      window.sessionStorage.setItem(SITE00_PRESENTATION_OVERRIDE_KEY, mode);
    }
    window.sessionStorage.removeItem(LEGACY_PREVIEW_KEY);
  } catch {
    /* ignore */
  }
}

/** @deprecated Use readStoredPresentationOverride */
export function readStoredPreviewDeviceMode(): Site00PreviewDeviceMode | null {
  const mode = readStoredPresentationOverride();
  if (mode === 'mobile' || mode === 'desktop') return mode;
  return null;
}

/** @deprecated Use writeStoredPresentationOverride */
export function writeStoredPreviewDeviceMode(mode: Site00PreviewDeviceMode): void {
  writeStoredPresentationOverride(mode);
}

export function defaultPreviewDeviceModeForViewport(): Site00PreviewDeviceMode {
  if (typeof window === 'undefined') return 'mobile';
  return window.matchMedia('(min-width: 768px)').matches ? 'desktop' : 'mobile';
}
