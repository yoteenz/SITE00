import { useSearchParams } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { CampaignDirectorWorkspace } from '../../components/founderWorkspace/campaignDirector/CampaignDirectorWorkspace';
import '../../styles/site00-campaign-director.css';
import '../../styles/site00-brand-context.css';

export default function EvolveCampaignDirectorPage() {
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'forensic' ? 'forensic' : 'genesis';

  return (
    <Site00PublicShell>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1rem' }}>
        <CampaignDirectorWorkspace initialMode={mode} />
      </div>
    </Site00PublicShell>
  );
}
