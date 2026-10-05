/** Boot-critical loader media — versioned paths + approved Supabase production assets. */

import { getSite00OriginWideViewportSnapshot } from '../shell/site00OriginViewport';
import { SITE00_LOADER_MEDIA_FOCAL } from '../../config/desktop-environment-presentation';

export const SITE00_LOADER_ASSET_VERSION = 'v1';

export const SITE00_LOADER_ASSET_BASE = `/site00/loader/${SITE00_LOADER_ASSET_VERSION}`;

/** Local fallback when Supabase env is unavailable (dev offline). */
export const SITE00_LOADER_BACKGROUND_FILE = 'assts-loader-background-v1.png';
/** Approved mobile environment — 711×1536 composition reference (Supabase live-preview). */
export const SITE00_LOADER_BACKGROUND_REMOTE = 'IMG_0404.png';
/** Approved desktop static environment — BLDR production asset (Supabase live-preview). */
export const SITE00_LOADER_BACKGROUND_DESKTOP_REMOTE = 'BLDR/4EEB4F70-BF07-4EFE-B324-10C94AE018B5.png';
/** Dev reference overlay — falls back to background when missing locally. */
export const SITE00_LOADER_REF_MAP_FILE = 'assts-loader-ref-map-v1.png';
/** Approved mobile full-frame environment animation — 1312×2816 portrait. */
export const SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE = 'BLDR/openart-output_1787107938282_745c8292.mp4';
/** Approved desktop full-frame environment animation — 2560×1440 landscape. */
export const SITE00_LOADER_ENVIRONMENT_ANIMATION_DESKTOP_REMOTE = 'BLDR/openart-output_1787109389654_e04aea07.mp4';
/** Footer double-00 mark above red SITE 00 signature (Supabase live-preview). */
export const SITE00_LOADER_FOOTER_MARK_REMOTE = 'LOADING/2B361A6E-863F-4CAF-AAFD-40F49205EEA2.png';

/** Public project ref — live-preview bucket is intentionally public. */
export const SITE00_PUBLIC_PROJECT_REF = 'hyycomvcaqxxvyrfupes';

function site00LivePreviewStorageBase(): string {
  const ref =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.match(/https?:\/\/([^.]+)\./)?.[1] ??
    SITE00_PUBLIC_PROJECT_REF;
  return `https://${ref}.supabase.co/storage/v1/object/public/live-preview/site00/`;
}

function supabaseLivePreviewUrl(path: string): string {
  return `${site00LivePreviewStorageBase()}${path}`;
}

/** Approved mobile loader environment — canonical 711×1536 artboard background. */
export function site00LoaderBackgroundUrl(): string {
  return supabaseLivePreviewUrl(SITE00_LOADER_BACKGROUND_REMOTE);
}

/** Approved desktop loader environment — BLDR landscape master. */
export function site00LoaderDesktopBackgroundUrl(): string {
  return supabaseLivePreviewUrl(SITE00_LOADER_BACKGROUND_DESKTOP_REMOTE);
}

export function resolveSite00LoaderBackgroundUrl(presentation: 'mobile' | 'desktop'): string {
  return presentation === 'desktop' ? site00LoaderDesktopBackgroundUrl() : site00LoaderBackgroundUrl();
}

/** Viewport-driven media presentation — background + animation only (not UI composition). */
export function resolveSite00LoaderMediaPresentation(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'mobile';
  return getSite00OriginWideViewportSnapshot() ? 'desktop' : 'mobile';
}

/** Static background cover anchor — locked center; fills viewport edge-to-edge. */
export function resolveSite00LoaderBackgroundFocal(presentation: 'mobile' | 'desktop'): string {
  return presentation === 'desktop'
    ? SITE00_LOADER_MEDIA_FOCAL.background.desktop
    : SITE00_LOADER_MEDIA_FOCAL.background.mobile;
}

/** Animation cover anchor — mobile MP4 focal tuned to meet static still at center. */
export function resolveSite00LoaderAnimationFocal(presentation: 'mobile' | 'desktop'): string {
  return presentation === 'desktop'
    ? SITE00_LOADER_MEDIA_FOCAL.animation.desktop
    : SITE00_LOADER_MEDIA_FOCAL.animation.mobile;
}

/** @deprecated Use resolveSite00LoaderBackgroundFocal / resolveSite00LoaderAnimationFocal */
export function resolveSite00LoaderMediaFocal(presentation: 'mobile' | 'desktop'): string {
  return resolveSite00LoaderBackgroundFocal(presentation);
}

/** Reference map for artboard overlay test — falls back to approved background. */
export function site00LoaderRefMapUrl(): string {
  return `${SITE00_LOADER_ASSET_BASE}/${SITE00_LOADER_REF_MAP_FILE}`;
}

/** Presentation-specific full-frame environment animation URL. */
export function resolveSite00LoaderEnvironmentAnimationUrl(presentation: 'mobile' | 'desktop'): string {
  const remote =
    presentation === 'desktop'
      ? SITE00_LOADER_ENVIRONMENT_ANIMATION_DESKTOP_REMOTE
      : SITE00_LOADER_ENVIRONMENT_ANIMATION_MOBILE_REMOTE;
  return supabaseLivePreviewUrl(remote);
}

/** Boot/cold-start preload — presentation-specific environment animation MP4. */
export function resolveSite00LoaderAnimationPreloadUrl(presentation?: 'mobile' | 'desktop'): string {
  const mode = presentation ?? resolveSite00LoaderMediaPresentation();
  return resolveSite00LoaderEnvironmentAnimationUrl(mode);
}

/** @deprecated Use resolveSite00LoaderEnvironmentAnimationUrl — mobile default preserved for callers. */
export function site00LoaderEnvironmentAnimationUrl(): string {
  return resolveSite00LoaderEnvironmentAnimationUrl('mobile');
}

/** @deprecated Legacy geometry preload — redirects to presentation-aware animation preload. */
export function site00LoaderGeometryPreloadUrl(_mode: 'alpha' | 'screen' = 'alpha'): string {
  return resolveSite00LoaderAnimationPreloadUrl();
}

/** Footer double-00 mark — above red SITE 00 signature label. */
export function resolveSite00LoaderFooterMarkUrl(): string {
  return supabaseLivePreviewUrl(SITE00_LOADER_FOOTER_MARK_REMOTE);
}
