import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { Entry001FormatSequenceWorkspace } from '../components/founderWorkspace/entry001CampaignPackage/Entry001FormatSequenceWorkspace';
import { useEntry001PackageState } from '../components/founderWorkspace/entry001CampaignPackage/useEntry001PackageState';
import '../styles/site00-founder-workspace.css';

export default function ProjectCampaignBoardEntryCarouselPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const state = useEntry001PackageState();

  if (!hasProjectCapability(projectSlug, 'CONTENT_OPERATIONS')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Carousel workspace is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="ENTRY 001 — CAROUSEL"
        hideWorkspaceHeader
        operate={
          <Entry001FormatSequenceWorkspace
            projectSlug={projectSlug}
            formatFamily="CAROUSEL"
            title="ENTRY 001 CAROUSEL 001"
            assets={state.carouselSlides}
            saveState={state.saveState}
            saveError={state.saveError}
            onReorder={(ids: string[]) => void state.reorderFormatSequence('CAROUSEL', ids)}
            onMove={(id: string, dir: 'left' | 'right') => state.moveSequenceItem('CAROUSEL', id, dir)}
          />
        }
        inspect={
          <p style={{ margin: 0, fontSize: 11, color: '#666' }}>
            Backend package: {state.backendMeta.packageId ?? '—'} · sequence v
            {state.backendMeta.carouselVersion ?? 1}
          </p>
        }
      />
    </EcosystemShell>
  );
}
