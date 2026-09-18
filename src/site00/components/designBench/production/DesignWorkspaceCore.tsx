/**
 * P0.VR.DESIGN-TWIN-FUNCTIONALITY1 — shared functional DESIGN workspace shell.
 *
 * Twin and production routes must not fork interaction implementations.
 */

import type { ReactNode } from 'react';

import { DesignAgentDock } from '../designAgent/DesignAgentDock';
import { DesignAgentDockProvider } from '../designAgent/DesignAgentDockContext';
import DesignGrokDock from '../designAgent/DesignGrokDock';
import { DesignGrokDockProvider } from '../designAgent/DesignGrokDockContext';
import { TwinOpusDirectScreen, type DesignWorkspaceRole } from '../opusDirect/TwinOpusDirectScreen';

import '../../../styles/site00-twin-opus-direct.css';
import '../../../styles/site00-twin-opus-list.css';
import '../../../styles/site00-design-production-child.css';
import '../../../styles/site00-design-child-surface.css';
import '../../../styles/site00-design-agent.css';
import '../../../styles/site00-design-workspace-typography.css';

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
    <div className="site00-design-workspace" data-design-workspace-typography="uppercase-plus-2px">
      <DesignAgentDockProvider>
        <DesignGrokDockProvider>
          <DesignWorkspaceDevMarker />
          {banner}
          <TwinOpusDirectScreen projectSlug={projectSlug} workspaceRole={role} />
          <DesignAgentDock />
          <DesignGrokDock projectSlug={projectSlug} />
        </DesignGrokDockProvider>
      </DesignAgentDockProvider>
    </div>
  );
}
