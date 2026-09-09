/**
 * B5.9R9R1 — Founder-only account identity system inspector for Projects page QA.
 */

import type { AccountDisplayIdentity } from '../../../../shared/site00-projects/accountDisplayIdentity.js';
import { useProjectViewMode } from '../../context/ProjectViewModeContext';

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
  const { viewMode, isSimulatingClient, session } = useProjectViewMode();

  return (
    <details className="site00-pidx-identity-inspector">
      <summary>SYSTEM INSPECTOR · ACCOUNT IDENTITY</summary>
      <div className="site00-pidx-identity-inspector__body">
        <InspectorRow label="ACTIVE VIEW MODE" value={viewMode} />
        <InspectorRow label="SIMULATING CLIENT" value={isSimulatingClient ? 'YES' : 'NO'} />
        <InspectorRow label="SIMULATED CLIENT SLUG" value={session.simulatedClientProjectSlug} />
        <InspectorRow label="AUTH USER ID" value={identity.userId} />
        <InspectorRow label="ACTIVE ACCOUNT ID" value={identity.accountId} />
        <InspectorRow label="IDENTITY SOURCE" value={identity.source} />
        <InspectorRow label="SOURCE RECORD ID" value={identity.sourceRecordId} />
        <InspectorRow label="FIRST NAME FOUND" value={identity.firstName} />
        <InspectorRow label="LAST NAME FOUND" value={identity.lastName} />
        <InspectorRow label="FULL NAME" value={identity.fullName} />
        <InspectorRow label="DISPLAY NAME" value={identity.displayName} />
        <InspectorRow label="RESOLUTION STATUS" value={identity.resolutionStatus} />
        <InspectorRow label="FALLBACK REASON" value={identity.fallbackReason} />
        <InspectorRow label="HYDRATING" value={isHydrating ? 'YES' : 'NO'} />
      </div>
    </details>
  );
}
