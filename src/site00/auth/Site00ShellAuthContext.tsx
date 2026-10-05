import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  deriveSite00ShellAccess,
  resolveSite00ShellAuthMode,
  type Site00ShellAccess,
  type Site00ShellAuthMode,
} from './site00ShellAuthState';

type Site00ShellAuthContextValue = Site00ShellAccess & {
  authMode: Site00ShellAuthMode;
};

const Site00ShellAuthContext = createContext<Site00ShellAuthContextValue | null>(null);

export function Site00ShellAuthProvider({
  children,
  authLoading = false,
  previewGuestRouteOverride = false,
}: {
  children: ReactNode;
  authLoading?: boolean;
  previewGuestRouteOverride?: boolean;
}) {
  const { pathname } = useLocation();
  const value = useMemo(() => {
    const authMode = resolveSite00ShellAuthMode(pathname, {
      authLoading,
      previewGuestForce: previewGuestRouteOverride ? true : undefined,
    });
    const access = deriveSite00ShellAccess(authMode);
    return { ...access, authMode };
  }, [authLoading, pathname, previewGuestRouteOverride]);

  return <Site00ShellAuthContext.Provider value={value}>{children}</Site00ShellAuthContext.Provider>;
}

export function useSite00ShellAuth(): Site00ShellAuthContextValue {
  const ctx = useContext(Site00ShellAuthContext);
  if (!ctx) {
    const authMode = resolveSite00ShellAuthMode(
      typeof window !== 'undefined' ? window.location.pathname : '/',
    );
    const access = deriveSite00ShellAccess(authMode);
    return { ...access, authMode };
  }
  return ctx;
}
