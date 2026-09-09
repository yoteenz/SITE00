/**
 * B5.9R1 — Founder vs Client project view modes.
 * View-as-client is session simulation — not a permanent permission change.
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
  /** Client project slug locked when entering simulated client view */
  simulatedClientProjectSlug: string | null;
};

export function createDefaultViewModeSession(isFounderOrAdmin: boolean): ProjectViewModeSession {
  return {
    mode: isFounderOrAdmin ? 'FOUNDER' : 'CLIENT',
    isSimulatingClient: false,
    simulatedAt: null,
    simulatedClientProjectSlug: null,
  };
}

export function toggleViewAsClient(
  session: ProjectViewModeSession,
  options?: { clientProjectSlug?: string | null },
): ProjectViewModeSession {
  if (session.isSimulatingClient) {
    return { mode: 'FOUNDER', isSimulatingClient: false, simulatedAt: null, simulatedClientProjectSlug: null };
  }
  return {
    mode: 'CLIENT',
    isSimulatingClient: true,
    simulatedAt: new Date().toISOString(),
    simulatedClientProjectSlug: options?.clientProjectSlug ?? null,
  };
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
