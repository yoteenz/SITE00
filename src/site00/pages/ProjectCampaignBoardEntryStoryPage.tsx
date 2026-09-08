import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { FounderWorkspaceShell } from '../components/founderWorkspace/FounderWorkspaceShell';
import { Entry001FormatSequenceWorkspace } from '../components/founderWorkspace/entry001CampaignPackage/Entry001FormatSequenceWorkspace';
import { useEntry001PackageState } from '../components/founderWorkspace/entry001CampaignPackage/useEntry001PackageState';
import { ingestionContextFromFormatFamily } from '../components/founderWorkspace/entry001CampaignPackage/entry001AssetClassification';
import '../styles/site00-founder-workspace.css';

export default function ProjectCampaignBoardEntryStoryPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const state = useEntry001PackageState();

  if (!hasProjectCapability(projectSlug, 'CONTENT_OPERATIONS')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Story workspace is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <FounderWorkspaceShell
        projectSlug={projectSlug}
        title="ENTRY 001 — STORY"
        hideWorkspaceHeader
        operate={
          <Entry001FormatSequenceWorkspace
            projectSlug={projectSlug}
            formatFamily="STORY"
            title="ENTRY 001 STORY SEQUENCE 001"
            assets={state.storyFrames}
            saveState={state.saveState}
            saveError={state.saveError}
            onReorder={(ids: string[]) => void state.reorderFormatSequence('STORY', ids)}
            onMove={(id: string, dir: 'left' | 'right') => state.moveSequenceItem('STORY', id, dir)}
            existingSequenceCount={state.storyFrames.length}
            onUploadFiles={(files) =>
              state.batchAddAssets(
                files,
                ingestionContextFromFormatFamily('STORY', {
                  projectId: projectSlug,
                  entryId: 'entry-001',
                  existingSequenceCount: state.storyFrames.length,
                  sourceRoute: 'entry/001/format/story',
                }),
              )
            }
          />
        }
        inspect={
          <p style={{ margin: 0, fontSize: 11, color: '#666' }}>
            Backend package: {state.backendMeta.packageId ?? '—'} · sequence v
            {state.backendMeta.storyVersion ?? 1}
          </p>
        }
      />
    </EcosystemShell>
  );
}
