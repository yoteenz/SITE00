/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — Opus + Grok launchers in the view row.
 */

import { DesignAgentOpenButton } from '../designAgent/DesignAgentDockContext';
import { DesignGrokOpenButton } from '../designAgent/DesignGrokDockContext';

export function DesignWorkspaceAgentButtons() {
  return (
    <div className="tod-viewrow__agents" role="group" aria-label="Design agents">
      <DesignAgentOpenButton className="tod-agent-iconBtn tod-agent-iconBtn--opus" interactionId="view-row-opus" />
      <DesignGrokOpenButton />
    </div>
  );
}
