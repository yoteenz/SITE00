/** Boot-critical loader media — versioned paths + approved Supabase production assets. */

export const SITE00_LOADER_ASSET_VERSION = 'v1';

export const SITE00_LOADER_ASSET_BASE = `/site00/loader/${SITE00_LOADER_ASSET_VERSION}`;

/** Local fallback when Supabase env is unavailable (dev offline). */
export const SITE00_LOADER_BACKGROUND_FILE = 'assts-loader-background-v1.png';
/** Approved master environment — 711×1536 composition reference (Supabase live-preview). */
export const SITE00_LOADER_BACKGROUND_REMOTE = 'IMG_0404.png';
/** Approved desktop landscape environment — 1672×941 (Supabase live-preview). */
export const SITE00_LOADER_BACKGROUND_DESKTOP_REMOTE = '4EEB4F70-BF07-4EFE-B324-10C94AE018B5.png';
/** Dev reference overlay — falls back to background when missing locally. */
export const SITE00_LOADER_REF_MAP_FILE = 'assts-loader-ref-map-v1.png';
/** Approved full-frame environment animation — 1312×2816 portrait (Supabase live-preview). */
export const SITE00_LOADER_ENVIRONMENT_ANIMATION_REMOTE = 'BLDR/openart-output_1787107938282_745c8292.mp4';

function supabaseLivePreviewUrl(path: string): string | null {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  if (!base) return null;
  return `${base}/storage/v1/object/public/live-preview/site00/${path}`;
}

/** Approved loader environment — canonical 711×1536 artboard background. */
export function site00LoaderBackgroundUrl(): string {
  return supabaseLivePreviewUrl(SITE00_LOADER_BACKGROUND_REMOTE) ?? `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_BACKGROUND_FILE}`;
}

/** Approved Asset Vault desktop loader environment — landscape 1672×941 master. */
export function site00LoaderDesktopBackgroundUrl(): string {
  return (
    supabaseLivePreviewUrl(SITE00_LOADER_BACKGROUND_DESKTOP_REMOTE) ??
    `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_BACKGROUND_FILE}`
  );
}

export function resolveSite00LoaderBackgroundUrl(presentation: 'mobile' | 'desktop'): string {
  return presentation === 'desktop' ? site00LoaderDesktopBackgroundUrl() : site00LoaderBackgroundUrl();
}

/** Reference map for artboard overlay test — falls back to approved background. */
export function site00LoaderRefMapUrl(): string {
  return `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_REF_MAP_FILE}`;
}

/** Canonical full-frame environment animation — replaces legacy geometry overlay assets. */
export function site00LoaderEnvironmentAnimationUrl(): string {
  return (
    supabaseLivePreviewUrl(SITE00_LOADER_ENVIRONMENT_ANIMATION_REMOTE) ??
    supabaseLivePreviewUrl(SITE00_LOADER_ENVIRONMENT_ANIMATION_REMOTE.replace(/^BLDR\//, '')) ??
    ''
  );
}

/** Boot/cold-start preload — approved environment animation MP4 only. */
export function site00LoaderAnimationPreloadUrl(): string {
  return site00LoaderEnvironmentAnimationUrl();
}

/** @deprecated Legacy geometry preload — redirects to environment animation. */
export function site00LoaderGeometryPreloadUrl(_mode: 'alpha' | 'screen' = 'alpha'): string {
  return site00LoaderAnimationPreloadUrl();
}
