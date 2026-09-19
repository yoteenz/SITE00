import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { Entry001CampaignPackageWorkspace } from '../components/founderWorkspace/entry001CampaignPackage/Entry001CampaignPackageWorkspace';
import '../styles/site00-founder-workspace.css';

/** B5.2 — Entry 001 Campaign Package detail page inside Campaign Board architecture. */

export default function ProjectCampaignBoardEntryPackagePage() {
  const { projectSlug = '', entryNumber = '' } = useParams<{
    projectSlug: string;
    entryNumber: string;
  }>();

  if (!hasProjectCapability(projectSlug, 'CONTENT_OPERATIONS')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Campaign package pages are NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  if (entryNumber !== '001') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Entry {entryNumber} package page is not available yet.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="ENTRY 001 — CAMPAIGN PACKAGE"
        hideWorkspaceHeader
        operate={<Entry001CampaignPackageWorkspace projectSlug={projectSlug} />}
        inspect={
          <p style={{ margin: 0, fontSize: 11, color: '#666' }}>
            Entry 001 package archive · missing deliverables · derivation plan · Campaign Board deployment gate
          </p>
        }
      />
    </EcosystemShell>
  );
}
