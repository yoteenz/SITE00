/**
 * B5.9R9R1 / B5.9R10 — Founder-only account + client simulation system inspector.
 */

import type { AccountDisplayIdentity } from '../../../../shared/site00-projects/accountDisplayIdentity.js';
import {
  clientCanAccessProject,
  getClient,
  getClientProjectIds,
  getClientProjectMemberships,
} from '../../../../shared/site00-projects/clientSimulation/clientDirectoryService.js';
import { projectLabelForSlug } from '../../../../shared/site00-projects/clientSimulation/janeDoeFixture.js';
import { useProjectViewMode } from '../../context/ProjectViewModeContext';
import { useSite00ProjectsIndex } from '../../hooks/useSite00Projects';

type ProjectsAccountIdentityInspectorProps = {
  identity: AccountDisplayIdentity;
  isHydrating: boolean;
};

function InspectorRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="site00-pidx-identity-inspector__row">
      <span className="site00-pidx-identity-inspector__label">{label}</span>
      <span className="site00-pidx-identity-inspector__value">{value?.trim() ? value : '—'}</span>
    </div>
  );
}

export function ProjectsAccountIdentityInspector({ identity, isHydrating }: ProjectsAccountIdentityInspectorProps) {
  const { viewMode, isSimulatingClient, activeSimulatedClientId, clientSelectorOpen } = useProjectViewMode();
  const { clientProjects } = useSite00ProjectsIndex();

  const client = activeSimulatedClientId ? getClient(activeSimulatedClientId, clientProjects ?? []) : null;
  const memberships = activeSimulatedClientId ? getClientProjectMemberships(activeSimulatedClientId) : [];
  const projectIds = activeSimulatedClientId ? getClientProjectIds(activeSimulatedClientId) : [];
  const deniedSite00 = activeSimulatedClientId ? clientCanAccessProject(activeSimulatedClientId, 'site00') : false;

  return (
    <details className="site00-pidx-identity-inspector">
      <summary>SYSTEM INSPECTOR · ACCOUNT IDENTITY</summary>
      <div className="site00-pidx-identity-inspector__body">
        <InspectorRow label="ACTIVE VIEW MODE" value={viewMode} />
        <InspectorRow label="SIMULATING CLIENT" value={isSimulatingClient ? 'YES' : 'NO'} />
        <InspectorRow label="CLIENT SELECTOR OPEN" value={clientSelectorOpen ? 'YES' : 'NO'} />
        <InspectorRow label="ACTIVE CLIENT ID" value={activeSimulatedClientId} />
        <InspectorRow label="ACTIVE CLIENT NAME" value={client?.fullName ?? null} />
        <InspectorRow label="IS DEMO CLIENT" value={client?.isDemoFixture ? 'YES' : 'NO'} />
        <InspectorRow label="MEMBERSHIP COUNT" value={memberships.length ? String(memberships.length) : null} />
        <InspectorRow label="AUTHORIZED PROJECT IDS" value={projectIds.join(', ') || null} />
        <InspectorRow label="AUTHORIZED PROJECT NAMES" value={projectIds.map(projectLabelForSlug).join(', ') || null} />
        <InspectorRow label="DENIED PROJECTS" value={deniedSite00 ? 'NONE' : 'SITE 00 BLOCKED'} />
        <InspectorRow label="FIREWALL STATUS" value={deniedSite00 ? 'LEAK' : 'PASS'} />
        <InspectorRow label="AUTH USER ID" value={identity.userId} />
        <InspectorRow label="IDENTITY SOURCE" value={identity.source} />
        <InspectorRow label="FIRST NAME FOUND" value={identity.firstName} />
        <InspectorRow label="LAST NAME FOUND" value={identity.lastName} />
        <InspectorRow label="FULL NAME" value={identity.fullName} />
        <InspectorRow label="RESOLUTION STATUS" value={identity.resolutionStatus} />
        <InspectorRow label="HYDRATING" value={isHydrating ? 'YES' : 'NO'} />
      </div>
    </details>
  );
}
