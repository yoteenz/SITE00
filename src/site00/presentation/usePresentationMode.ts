import { useMemo, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { site00OriginMobileLayoutPreviewActive } from '../components/shell/site00OriginViewport';
import { isSite00OriginDesktopPath } from '../config/routes';
import { isSite00PublicDesktopPath } from '../config/site00-public-pages';
import { useSite00 } from '../state/Site00Context';
import type { Site00PresentationOverride } from '../state/preview-mode';
import {
  site00ViewportBand,
  site00ViewportPresentationFromWindow,
  subscribeSite00ViewportPresentation,
  type Site00ViewportBand,
} from './breakpoints';
import { readPresentationQueryOverride } from './presentation-query';

export type Site00PresentationMode = 'mobile' | 'desktop';

export type Site00PresentationSnapshot = {
  mode: Site00PresentationMode;
  viewportBand: Site00ViewportBand;
  viewportMode: Site00PresentationMode;
  override: Site00PresentationOverride;
  queryOverride: ReturnType<typeof readPresentationQueryOverride>;
  isMobilePresentation: boolean;
  isDesktopPresentation: boolean;
};

function subscribeViewport(onStoreChange: () => void) {
  return subscribeSite00ViewportPresentation(onStoreChange);
}

function getViewportSnapshot(): Site00PresentationMode {
  return site00ViewportPresentationFromWindow();
}

function getViewportBandSnapshot(): Site00ViewportBand {
  if (typeof window === 'undefined') return 'mobile';
  return site00ViewportBand(window.innerWidth);
}

function resolveEffectiveMode(
  override: Site00PresentationOverride,
  queryOverride: ReturnType<typeof readPresentationQueryOverride>,
  viewportMode: Site00PresentationMode,
  pathname: string,
  search: string,
): Site00PresentationMode {
  if (queryOverride) return queryOverride;
  if (site00OriginMobileLayoutPreviewActive(search)) return 'mobile';
  if (override === 'mobile') return 'mobile';
  if (override === 'desktop') return 'desktop';
  if (isSite00PublicDesktopPath(pathname) || isSite00OriginDesktopPath(pathname)) {
    return 'desktop';
  }
  if (override === 'auto') return viewportMode;
  return viewportMode;
}

/**
 * Canonical SITE 00 presentation resolver.
 * Priority: ?view= → legacy mobile layout query → explicit override → legacy /desktop path → AUTO (viewport).
 */
export function usePresentationMode(): Site00PresentationSnapshot {
  const { pathname, search } = useLocation();
  const { state } = useSite00();
  const viewportMode = useSyncExternalStore(
    subscribeViewport,
    getViewportSnapshot,
    (): Site00PresentationMode => 'mobile',
  );
  const viewportBand = useSyncExternalStore(
    subscribeViewport,
    getViewportBandSnapshot,
    (): Site00ViewportBand => 'mobile',
  );

  const queryOverride = useMemo(() => readPresentationQueryOverride(search), [search]);

  const mode = useMemo(
    () => resolveEffectiveMode(state.presentationOverride, queryOverride, viewportMode, pathname, search),
    [state.presentationOverride, queryOverride, viewportMode, pathname, search],
  );

  return useMemo(
    () => ({
      mode,
      viewportBand,
      viewportMode,
      override: state.presentationOverride,
      queryOverride,
      isMobilePresentation: mode === 'mobile',
      isDesktopPresentation: mode === 'desktop',
    }),
    [mode, viewportBand, viewportMode, state.presentationOverride, queryOverride],
  );
}

/** SSR-safe hook for components that only need viewport band without override context. */
export function useSite00ViewportPresentation(): Site00PresentationMode {
  return useSyncExternalStore(subscribeViewport, getViewportSnapshot, () => 'mobile');
}
