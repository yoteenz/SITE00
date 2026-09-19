/**
 * P0.CSI.1 — EVOLVE Creative Evolution entry for Campaign Flavor.
 */

import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { CampaignFlavorWorkspace } from '../../components/founderWorkspace/campaignStrategy/CampaignFlavorWorkspace';
import '../../styles/site00-campaign-flavor.css';
import '../../styles/site00-brand-context.css';

export default function EvolveCampaignFlavorPage() {
  return (
    <Site00PublicShell>
      <div className="site00-evolve-campaign-flavor" style={{ maxWidth: 960, margin: '0 auto', padding: '1rem' }}>
        <CampaignFlavorWorkspace clientMode={false} />
      </div>
    </Site00PublicShell>
  );
}
