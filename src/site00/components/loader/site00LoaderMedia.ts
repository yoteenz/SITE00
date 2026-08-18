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
/** Original OpenArt source — red luminous geometry on black (screen compositing). */
export const SITE00_LOADER_GEOMETRY_SOURCE_FILE = 'assts-loader-geometry-v1-source.mp4';
export const SITE00_LOADER_GEOMETRY_SOURCE_REMOTE = 'openart-output_kling-v2_aUsaRicK38pEp4ieayl8.mp4';
export const SITE00_LOADER_GEOMETRY_WEBM_FILE = 'assts-loader-geometry-v1-alpha.webm';
export const SITE00_LOADER_GEOMETRY_APNG_FILE = 'assts-loader-geometry-v1-alpha.apng';

function supabaseLivePreviewUrl(filename: string): string | null {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  if (!base) return null;
  return `${base}/storage/v1/object/public/live-preview/site00/${filename}`;
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

export function site00LoaderGeometryWebmUrl(): string {
  return `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_GEOMETRY_WEBM_FILE}`;
}

export function site00LoaderGeometryApngUrl(): string {
  return `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_GEOMETRY_APNG_FILE}`;
}

/** Original OpenArt animation — black background, screen/lighten compositing in browser. */
export function site00LoaderGeometrySourceUrl(): string {
  return `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_GEOMETRY_SOURCE_FILE}`;
}

export function site00LoaderGeometrySourceRemoteUrl(): string {
  return supabaseLivePreviewUrl(SITE00_LOADER_GEOMETRY_SOURCE_REMOTE) ?? site00LoaderGeometrySourceUrl();
}

/** Boot/cold-start preload — alpha derivative when available, not the heavy black-background master. */
export function site00LoaderGeometryPreloadUrl(mode: 'alpha' | 'screen' = 'alpha'): string {
  if (mode === 'screen') return site00LoaderGeometrySourceUrl();
  return site00LoaderPrefersApngGeometry()
    ? site00LoaderGeometryApngUrl()
    : site00LoaderGeometryWebmUrl();
}

/** iOS Safari — WebM alpha is unreliable; use transcoded APNG with true alpha. */
export function site00LoaderPrefersApngGeometry(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) return false;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/i.test(ua);
}
