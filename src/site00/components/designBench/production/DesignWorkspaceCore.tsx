/**
 * P0.VR.DESIGN-TWIN-FUNCTIONALITY1 — shared functional DESIGN workspace shell.
 *
 * Twin and production routes must not fork interaction implementations.
 */

import type { ReactNode } from 'react';

import { DesignAgentDock } from '../designAgent/DesignAgentDock';
import { DesignAgentDockProvider } from '../designAgent/DesignAgentDockContext';
import { TwinOpusDirectScreen, type DesignWorkspaceRole } from '../opusDirect/TwinOpusDirectScreen';

export type { DesignWorkspaceRole };

type Props = {
  projectSlug: string;
  role: DesignWorkspaceRole;
  banner?: ReactNode;
};

function DesignWorkspaceDevMarker() {
  if (!import.meta.env.DEV) return null;
  return (
    <div
      className="site00-design-route-dev-marker"
      data-design-implementation="NEW_WORKSPACE"
      aria-hidden
    >
      DESIGN IMPLEMENTATION: NEW_WORKSPACE
    </div>
  );
}

export function DesignWorkspaceCore({ projectSlug, role, banner }: Props) {
  return (
    <DesignAgentDockProvider>
      <DesignWorkspaceDevMarker />
      {banner}
      <TwinOpusDirectScreen projectSlug={projectSlug} workspaceRole={role} />
      <DesignAgentDock />
    </DesignAgentDockProvider>
  );
}
