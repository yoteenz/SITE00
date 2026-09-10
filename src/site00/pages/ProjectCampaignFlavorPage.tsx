import { useParams } from 'react-router-dom';
import { CampaignFlavorWorkspace } from '../components/founderWorkspace/campaignStrategy/CampaignFlavorWorkspace';
import { NdxFounderWorkspacePage } from '../components/founderWorkspace/NdxFounderWorkspacePage';
import '../styles/site00-campaign-flavor.css';
import '../styles/site00-brand-context.css';
import '../styles/site00-founder-workspace.css';

export default function ProjectCampaignFlavorPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="CAMPAIGN FLAVOR"
      subtitle="Strategy + expression language · P0.CSI.1"
      operate={<CampaignFlavorWorkspace projectSlug={projectSlug} />}
      understand={
        <p style={{ margin: 0, fontSize: 11, color: '#999' }}>
          Upstream campaign expression layer — feeds concept territories without replacing them
        </p>
      }
      inspect={null}
      nonNdxFallback={
        <div style={{ padding: '1rem' }}>
          <CampaignFlavorWorkspace projectSlug={projectSlug} />
        </div>
      }
    />
  );
}
