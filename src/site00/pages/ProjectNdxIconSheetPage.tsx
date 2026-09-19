import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { NdxIconSheetPanel } from '../components/founderWorkspace/NdxIconSheetPanel';
import '../styles/site00-founder-workspace.css';

export default function ProjectNdxIconSheetPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();

  if (!hasProjectCapability(projectSlug, 'PROJECT_CORE')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>NDX icon sheet is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="NDX ICON SHEET"
        subtitle="P0.UI.3 · canonical SVG registry · inactive / active · size tokens"
        operate={<NdxIconSheetPanel />}
      />
    </EcosystemShell>
  );
}
