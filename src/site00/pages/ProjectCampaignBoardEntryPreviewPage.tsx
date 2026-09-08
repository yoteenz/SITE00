import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { Entry001PackagePreviewWorkspace } from '../components/founderWorkspace/entry001CampaignPackage/Entry001PackagePreviewWorkspace';
import { useEntry001PackageState } from '../components/founderWorkspace/entry001CampaignPackage/useEntry001PackageState';
import '../styles/site00-founder-workspace.css';

/** B5.5 — Entry 001 package preview page. */

export default function ProjectCampaignBoardEntryPreviewPage() {
  const { projectSlug = '', entryNumber = '' } = useParams<{ projectSlug: string; entryNumber: string }>();
  const { packagePreview } = useEntry001PackageState();

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
        <p>Entry {entryNumber} preview is not available yet.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="ENTRY 001 — PACKAGE PREVIEW"
        hideWorkspaceHeader
        operate={<Entry001PackagePreviewWorkspace projectSlug={projectSlug} composition={packagePreview} />}
        inspect={
          <p style={{ margin: 0, fontSize: 11, color: '#666' }}>
            Live social package preview · previewReadiness vs campaignBoardEligibility · partial construction
          </p>
        }
      />
    </EcosystemShell>
  );
}
