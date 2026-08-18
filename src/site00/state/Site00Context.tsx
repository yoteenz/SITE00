import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isSite00PublicDesktopPath } from '../config/site00-public-pages';
import { isSite00OriginDesktopPath } from '../config/routes';
import {
  readPresentationQueryOverride,
} from '../presentation/presentation-query';
import { site00ViewportPresentationFromWindow } from '../presentation/breakpoints';
import {
  readStoredPresentationOverride,
  writeStoredPresentationOverride,
  type Site00PresentationOverride,
} from './preview-mode';
import { INITIAL_SITE00_STATE, site00Reducer, type HomeMode, type Site00State } from './types';
import { site00OriginMobileLayoutPreviewActive } from '../components/shell/site00OriginViewport';

type Site00ContextValue = {
  state: Site00State;
  setHomeMode: (mode: HomeMode) => void;
  selectIdentityState: (stateId: string) => void;
  selectBuildClass: (classId: string) => void;
  selectEvolvePath: (pathId: string) => void;
  clearSelections: () => void;
  setPresentationOverride: (mode: Site00PresentationOverride) => void;
  /** @deprecated Use setPresentationOverride */
  setPreviewDeviceMode: (mode: 'mobile' | 'desktop') => void;
  /** True when resolved presentation is desktop (override or viewport) */
  isPreviewDesktop: boolean;
};

const Site00Context = createContext<Site00ContextValue | null>(null);

function resolveInitialPresentationOverride(pathname: string, search: string): Site00PresentationOverride {
  if (readPresentationQueryOverride(search)) {
    return 'auto';
  }
  if (isSite00PublicDesktopPath(pathname) || isSite00OriginDesktopPath(pathname)) {
    return 'desktop';
  }
  if (site00OriginMobileLayoutPreviewActive(search)) {
    return 'mobile';
  }
  const stored = readStoredPresentationOverride();
  if (stored) return stored;
  return 'auto';
}

function resolveIsPreviewDesktop(
  override: Site00PresentationOverride,
  pathname: string,
  search: string,
): boolean {
  const query = readPresentationQueryOverride(search);
  if (query === 'desktop') return true;
  if (query === 'mobile') return false;
  if (site00OriginMobileLayoutPreviewActive(search)) return false;
  if (override === 'desktop') return true;
  if (override === 'mobile') return false;
  if (isSite00PublicDesktopPath(pathname) || isSite00OriginDesktopPath(pathname)) {
    return true;
  }
  return site00ViewportPresentationFromWindow() === 'desktop';
}

export function Site00Provider({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();
  const [state, dispatch] = useReducer(site00Reducer, INITIAL_SITE00_STATE, (base) => ({
    ...base,
    presentationOverride: resolveInitialPresentationOverride(pathname, search),
  }));

  useEffect(() => {
    if (readPresentationQueryOverride(search)) return;
    if (isSite00PublicDesktopPath(pathname) || isSite00OriginDesktopPath(pathname)) {
      dispatch({ type: 'SET_PRESENTATION_OVERRIDE', mode: 'desktop' });
      return;
    }
    if (site00OriginMobileLayoutPreviewActive(search)) {
      dispatch({ type: 'SET_PRESENTATION_OVERRIDE', mode: 'mobile' });
    }
  }, [pathname, search]);

  useEffect(() => {
    writeStoredPresentationOverride(state.presentationOverride);
  }, [state.presentationOverride]);

  const isPreviewDesktop = useMemo(
    () => resolveIsPreviewDesktop(state.presentationOverride, pathname, search),
    [state.presentationOverride, pathname, search],
  );

  const value: Site00ContextValue = {
    state,
    setHomeMode: (mode) => dispatch({ type: 'SET_HOME_MODE', mode }),
    selectIdentityState: (stateId) => dispatch({ type: 'SELECT_IDENTITY_STATE', stateId }),
    selectBuildClass: (classId) => dispatch({ type: 'SELECT_BUILD_CLASS', classId }),
    selectEvolvePath: (pathId) => dispatch({ type: 'SELECT_EVOLVE_PATH', pathId }),
    clearSelections: () => dispatch({ type: 'CLEAR_SELECTIONS' }),
    setPresentationOverride: (mode) => dispatch({ type: 'SET_PRESENTATION_OVERRIDE', mode }),
    setPreviewDeviceMode: (mode) => dispatch({ type: 'SET_PRESENTATION_OVERRIDE', mode }),
    isPreviewDesktop,
  };

  return <Site00Context.Provider value={value}>{children}</Site00Context.Provider>;
}

export function useSite00(): Site00ContextValue {
  const ctx = useContext(Site00Context);
  if (!ctx) {
    throw new Error('useSite00 must be used within Site00Provider');
  }
  return ctx;
}

/** Optional hook for components outside provider (returns null) */
export function useSite00Optional(): Site00ContextValue | null {
  return useContext(Site00Context);
}

/** Navigation href — canonical route; presentation is resolver-driven, not URL suffix. */
export function site00PreviewNavHref(targetHref: string, _currentPathname?: string): string {
  const base = targetHref.replace(/\/$/, '').replace(/\/desktop$/, '');
  return base || '/';
}

/** @deprecated Prefer site00PreviewNavHref — strips legacy /desktop suffix from paths. */
export function site00PublicNavHrefFromPreview(targetHref: string, currentPathname: string): string {
  void currentPathname;
  return site00PreviewNavHref(targetHref);
}

export { site00PublicMobilePath } from '../config/site00-public-pages';
