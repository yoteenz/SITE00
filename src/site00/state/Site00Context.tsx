import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isSite00PublicDesktopPath, site00PublicMobilePath } from '../config/site00-public-pages';
import { isSite00OriginDesktopPath } from '../config/routes';
import {
  defaultPreviewDeviceModeForViewport,
  readStoredPreviewDeviceMode,
  writeStoredPreviewDeviceMode,
  type Site00PreviewDeviceMode,
} from './preview-mode';
import { INITIAL_SITE00_STATE, site00Reducer, type HomeMode, type Site00State } from './types';
import {
  site00OriginMobileLayoutPreviewActive,
} from '../components/shell/site00OriginViewport';

type Site00ContextValue = {
  state: Site00State;
  setHomeMode: (mode: HomeMode) => void;
  selectIdentityState: (stateId: string) => void;
  selectBuildClass: (classId: string) => void;
  selectEvolvePath: (pathId: string) => void;
  clearSelections: () => void;
  setPreviewDeviceMode: (mode: Site00PreviewDeviceMode) => void;
  /** True when public/Origin routes should render desktop presentation. */
  isPreviewDesktop: boolean;
};

const Site00Context = createContext<Site00ContextValue | null>(null);

function resolveInitialPreviewMode(pathname: string): Site00PreviewDeviceMode {
  if (isSite00PublicDesktopPath(pathname) || isSite00OriginDesktopPath(pathname)) {
    return 'desktop';
  }
  const stored = readStoredPreviewDeviceMode();
  if (stored) return stored;
  return defaultPreviewDeviceModeForViewport();
}

export function Site00Provider({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();
  const [state, dispatch] = useReducer(site00Reducer, INITIAL_SITE00_STATE, (base) => ({
    ...base,
    previewDeviceMode: resolveInitialPreviewMode(pathname),
  }));

  useEffect(() => {
    if (isSite00PublicDesktopPath(pathname) || isSite00OriginDesktopPath(pathname)) {
      dispatch({ type: 'SET_PREVIEW_DEVICE_MODE', mode: 'desktop' });
      return;
    }
    if (site00OriginMobileLayoutPreviewActive(search)) {
      dispatch({ type: 'SET_PREVIEW_DEVICE_MODE', mode: 'mobile' });
    }
  }, [pathname, search]);

  useEffect(() => {
    writeStoredPreviewDeviceMode(state.previewDeviceMode);
  }, [state.previewDeviceMode]);

  /** Honor composer Mobile/Desktop selection on all viewports (artboard scales on phones). */
  const isPreviewDesktop = useMemo(() => {
    if (site00OriginMobileLayoutPreviewActive(search)) return false;
    return state.previewDeviceMode === 'desktop';
  }, [state.previewDeviceMode, search]);

  const value: Site00ContextValue = {
    state,
    setHomeMode: (mode) => dispatch({ type: 'SET_HOME_MODE', mode }),
    selectIdentityState: (stateId) => dispatch({ type: 'SELECT_IDENTITY_STATE', stateId }),
    selectBuildClass: (classId) => dispatch({ type: 'SELECT_BUILD_CLASS', classId }),
    selectEvolvePath: (pathId) => dispatch({ type: 'SELECT_EVOLVE_PATH', pathId }),
    clearSelections: () => dispatch({ type: 'CLEAR_SELECTIONS' }),
    setPreviewDeviceMode: (mode) => dispatch({ type: 'SET_PREVIEW_DEVICE_MODE', mode }),
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

/** Navigation href — same semantic route; preview mode is global state, not URL suffix. */
export function site00PreviewNavHref(targetHref: string, _currentPathname?: string): string {
  const base = targetHref.replace(/\/$/, '').replace(/\/desktop$/, '');
  return base || '/';
}

/** @deprecated Prefer site00PreviewNavHref — strips legacy /desktop suffix from paths. */
export function site00PublicNavHrefFromPreview(targetHref: string, currentPathname: string): string {
  void currentPathname;
  return site00PreviewNavHref(targetHref);
}

export { site00PublicMobilePath };
