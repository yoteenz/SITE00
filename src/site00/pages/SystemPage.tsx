import { HubSteps, PublicHubPage } from '../components/public-redesign/PublicHubLayouts';
import { SITE00_SYSTEM_LAYERS } from '../config/seed/site00-page-seed';

export default function SystemPage() {
  return (
    <PublicHubPage section="idnty" page="system" crumb="LOCATION / SYSTEM" title="SYSTEM" subtitle="THE FOUNDATION." width="wide">
      <div className="s00pr-hubsplit">
        <HubSteps label="SITE 00 SYSTEM LAYERS" items={SITE00_SYSTEM_LAYERS.map((layer) => ({ num: layer.num, title: layer.title, body: layer.description }))} />
        <div className="s00pr-hubstack" role="img" aria-label="SYSTEM LAYER STACK">
          {[...SITE00_SYSTEM_LAYERS].reverse().map((layer) => (
            <span key={layer.id} className="s00pr-hubstack__plate">
              {layer.title}
            </span>
          ))}
        </div>
      </div>
    </PublicHubPage>
  );
}
