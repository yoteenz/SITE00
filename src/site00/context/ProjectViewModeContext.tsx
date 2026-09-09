/**
 * B5.9R1 — Founder view-as-client session state.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  createDefaultViewModeSession,
  toggleViewAsClient,
  type ProjectViewMode,
  type ProjectViewModeSession,
  type ProjectRole,
  canToggleViewAsClient,
} from '../../../shared/site00-projects/projectViewMode.js';

type ProjectViewModeContextValue = {
  session: ProjectViewModeSession;
  viewMode: ProjectViewMode;
  isSimulatingClient: boolean;
  canToggle: boolean;
  toggleViewAsClient: (options?: { clientProjectSlug?: string | null }) => void;
  resetToFounderView: () => void;
};

const ProjectViewModeContext = createContext<ProjectViewModeContextValue | null>(null);

type ProjectViewModeProviderProps = {
  children: ReactNode;
  role?: ProjectRole;
};

export function ProjectViewModeProvider({ children, role = 'FOUNDER' }: ProjectViewModeProviderProps) {
  const [session, setSession] = useState<ProjectViewModeSession>(() =>
    createDefaultViewModeSession(canToggleViewAsClient(role)),
  );

  const handleToggle = useCallback(
    (options?: { clientProjectSlug?: string | null }) => {
      if (!canToggleViewAsClient(role)) return;
      const scrollY = window.scrollY;
      setSession((prev) => toggleViewAsClient(prev, options));
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
    },
    [role],
  );

  const resetToFounderView = useCallback(() => {
    setSession(createDefaultViewModeSession(true));
  }, []);

  const value = useMemo<ProjectViewModeContextValue>(
    () => ({
      session,
      viewMode: session.mode,
      isSimulatingClient: session.isSimulatingClient,
      canToggle: canToggleViewAsClient(role),
      toggleViewAsClient: handleToggle,
      resetToFounderView,
    }),
    [session, role, handleToggle, resetToFounderView],
  );

  return <ProjectViewModeContext.Provider value={value}>{children}</ProjectViewModeContext.Provider>;
}

export function useProjectViewMode(): ProjectViewModeContextValue {
  const ctx = useContext(ProjectViewModeContext);
  if (!ctx) {
    return {
      session: createDefaultViewModeSession(false),
      viewMode: 'CLIENT',
      isSimulatingClient: false,
      canToggle: false,
      toggleViewAsClient: () => {},
      resetToFounderView: () => {},
    };
  }
  return ctx;
}
