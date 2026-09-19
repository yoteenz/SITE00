/**
 * B5.9R1 / B5.9R10 — Founder vs Client project view modes + client simulation context.
 */

export const PROJECT_VIEW_MODES = ['FOUNDER', 'CLIENT'] as const;

export type ProjectViewMode = (typeof PROJECT_VIEW_MODES)[number];

export type ProjectRole =
  | 'FOUNDER'
  | 'ADMIN'
  | 'PROJECT_OWNER'
  | 'CLIENT'
  | 'COLLABORATOR'
  | 'REVIEWER';

export type ProjectViewModeSession = {
  mode: ProjectViewMode;
  /** True when founder/admin is simulating client view */
  isSimulatingClient: boolean;
  simulatedAt: string | null;
  /** Active simulated client — determines client-safe data in CLIENT mode */
  activeSimulatedClientId: string | null;
  /** Legacy slug hint — derived from active client memberships when set */
  simulatedClientProjectSlug: string | null;
  /** B5.9R10 — client selector popover open */
  clientSelectorOpen: boolean;
};

export function createDefaultViewModeSession(isFounderOrAdmin: boolean): ProjectViewModeSession {
  return {
    mode: isFounderOrAdmin ? 'FOUNDER' : 'CLIENT',
    isSimulatingClient: false,
    simulatedAt: null,
    activeSimulatedClientId: null,
    simulatedClientProjectSlug: null,
    clientSelectorOpen: false,
  };
}

export function enterClientSimulation(session: ProjectViewModeSession): ProjectViewModeSession {
  return {
    ...session,
    mode: 'CLIENT',
    isSimulatingClient: true,
    simulatedAt: session.simulatedAt ?? new Date().toISOString(),
    clientSelectorOpen: session.activeSimulatedClientId ? false : true,
  };
}

export function returnToFounderSimulation(session: ProjectViewModeSession): ProjectViewModeSession {
  return {
    ...session,
    mode: 'FOUNDER',
    isSimulatingClient: false,
    simulatedAt: null,
    clientSelectorOpen: false,
  };
}

export function selectSimulatedClient(
  session: ProjectViewModeSession,
  clientId: string,
  primaryProjectSlug?: string | null,
): ProjectViewModeSession {
  return {
    ...session,
    mode: 'CLIENT',
    isSimulatingClient: true,
    simulatedAt: session.simulatedAt ?? new Date().toISOString(),
    activeSimulatedClientId: clientId,
    simulatedClientProjectSlug: primaryProjectSlug ?? session.simulatedClientProjectSlug,
    clientSelectorOpen: false,
  };
}

export function setClientSelectorOpen(session: ProjectViewModeSession, open: boolean): ProjectViewModeSession {
  return { ...session, clientSelectorOpen: open };
}

/** @deprecated use enterClientSimulation / returnToFounderSimulation */
export function toggleViewAsClient(
  session: ProjectViewModeSession,
  options?: { clientProjectSlug?: string | null; clientId?: string | null },
): ProjectViewModeSession {
  if (session.isSimulatingClient) {
    return returnToFounderSimulation(session);
  }
  const next = enterClientSimulation(session);
  if (options?.clientId) {
    return selectSimulatedClient(next, options.clientId, options.clientProjectSlug ?? null);
  }
  if (options?.clientProjectSlug) {
    return { ...next, simulatedClientProjectSlug: options.clientProjectSlug };
  }
  return next;
}

export function effectiveViewMode(session: ProjectViewModeSession): ProjectViewMode {
  return session.mode;
}

export function canToggleViewAsClient(role: ProjectRole): boolean {
  return role === 'FOUNDER' || role === 'ADMIN';
}

export function modulesVisibleInViewMode(
  enabledModules: string[],
  clientVisibleModules: string[],
  viewMode: ProjectViewMode,
): string[] {
  if (viewMode === 'FOUNDER') return enabledModules;
  return enabledModules.filter((m) => clientVisibleModules.includes(m));
}
