import { useParams, useSearchParams } from 'react-router-dom';
import { CampaignDirectorWorkspace } from '../components/founderWorkspace/campaignDirector/CampaignDirectorWorkspace';
import { NdxFounderWorkspacePage } from '../components/founderWorkspace/NdxFounderWorkspacePage';
import '../styles/site00-campaign-director.css';
import '../styles/site00-founder-workspace.css';

export default function ProjectCampaignDirectorPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'forensic' ? 'forensic' : 'genesis';

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="CAMPAIGN DIRECTOR"
      subtitle="World genesis + creative direction · P0.CGO.1"
      operate={<CampaignDirectorWorkspace projectSlug={projectSlug} initialMode={mode} />}
      understand={
        <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
          Protects concept intelligence through execution — concept fidelity over pretty generics
        </p>
      }
      inspect={null}
      nonNdxFallback={
        <div style={{ padding: '1rem' }}>
          <CampaignDirectorWorkspace projectSlug={projectSlug} initialMode={mode} />
        </div>
      }
    />
  );
}
