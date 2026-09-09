/**
 * B5.9R1 / B5.9R10 — Founder view-as-client session state + client selector.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  createDefaultViewModeSession,
  enterClientSimulation,
  returnToFounderSimulation,
  selectSimulatedClient,
  setClientSelectorOpen,
  type ProjectViewMode,
  type ProjectViewModeSession,
  type ProjectRole,
  canToggleViewAsClient,
} from '../../../shared/site00-projects/projectViewMode.js';

type ProjectViewModeContextValue = {
  session: ProjectViewModeSession;
  viewMode: ProjectViewMode;
  isSimulatingClient: boolean;
  activeSimulatedClientId: string | null;
  clientSelectorOpen: boolean;
  canToggle: boolean;
  enterClientView: () => void;
  returnToFounderView: () => void;
  openClientSelector: () => void;
  closeClientSelector: () => void;
  selectSimulatedClient: (clientId: string, primaryProjectSlug?: string | null) => void;
  /** @deprecated */
  toggleViewAsClient: (options?: { clientProjectSlug?: string | null; clientId?: string | null }) => void;
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

  const preserveScroll = useCallback((mutator: (prev: ProjectViewModeSession) => ProjectViewModeSession) => {
    const scrollY = window.scrollY;
    setSession((prev) => mutator(prev));
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  }, []);

  const enterClientView = useCallback(() => {
    if (!canToggleViewAsClient(role)) return;
    preserveScroll((prev) => enterClientSimulation(prev));
  }, [preserveScroll, role]);

  const returnToFounderView = useCallback(() => {
    if (!canToggleViewAsClient(role)) return;
    preserveScroll((prev) => returnToFounderSimulation(prev));
  }, [preserveScroll, role]);

  const openClientSelector = useCallback(() => {
    if (!canToggleViewAsClient(role)) return;
    preserveScroll((prev) => setClientSelectorOpen(prev, true));
  }, [preserveScroll, role]);

  const closeClientSelector = useCallback(() => {
    preserveScroll((prev) => setClientSelectorOpen(prev, false));
  }, [preserveScroll]);

  const handleSelectClient = useCallback(
    (clientId: string, primaryProjectSlug?: string | null) => {
      if (!canToggleViewAsClient(role)) return;
      preserveScroll((prev) => selectSimulatedClient(prev, clientId, primaryProjectSlug ?? null));
    },
    [preserveScroll, role],
  );

  const handleLegacyToggle = useCallback(
    (options?: { clientProjectSlug?: string | null; clientId?: string | null }) => {
      if (!canToggleViewAsClient(role)) return;
      if (session.isSimulatingClient) {
        returnToFounderView();
        return;
      }
      if (options?.clientId) {
        handleSelectClient(options.clientId, options.clientProjectSlug ?? null);
        return;
      }
      enterClientView();
    },
    [session.isSimulatingClient, returnToFounderView, handleSelectClient, enterClientView, role],
  );

  const resetToFounderView = useCallback(() => {
    setSession(createDefaultViewModeSession(true));
  }, []);

  const value = useMemo<ProjectViewModeContextValue>(
    () => ({
      session,
      viewMode: session.mode,
      isSimulatingClient: session.isSimulatingClient,
      activeSimulatedClientId: session.activeSimulatedClientId,
      clientSelectorOpen: session.clientSelectorOpen,
      canToggle: canToggleViewAsClient(role),
      enterClientView,
      returnToFounderView,
      openClientSelector,
      closeClientSelector,
      selectSimulatedClient: handleSelectClient,
      toggleViewAsClient: handleLegacyToggle,
      resetToFounderView,
    }),
    [
      session,
      role,
      enterClientView,
      returnToFounderView,
      openClientSelector,
      closeClientSelector,
      handleSelectClient,
      handleLegacyToggle,
      resetToFounderView,
    ],
  );

  return <ProjectViewModeContext.Provider value={value}>{children}</ProjectViewModeContext.Provider>;
}

export function useProjectViewMode(): ProjectViewModeContextValue {
  const ctx = useContext(ProjectViewModeContext);
  if (!ctx) {
    const empty = createDefaultViewModeSession(false);
    return {
      session: empty,
      viewMode: 'CLIENT',
      isSimulatingClient: false,
      activeSimulatedClientId: null,
      clientSelectorOpen: false,
      canToggle: false,
      enterClientView: () => {},
      returnToFounderView: () => {},
      openClientSelector: () => {},
      closeClientSelector: () => {},
      selectSimulatedClient: () => {},
      toggleViewAsClient: () => {},
      resetToFounderView: () => {},
    };
  }
  return ctx;
}
