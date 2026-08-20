import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { SITE00_ROUTES, site00EvolveMarketingEngagement } from '../../../config/routes';

const DEBUG_STATES = [
  { label: 'EVOLVE SELECTION', href: SITE00_ROUTES.evolveState },
  { label: 'MARKETING LANDING', href: SITE00_ROUTES.evolveMarketing },
  { label: 'SERVICE SELECTION', href: SITE00_ROUTES.evolveMarketingServices },
  { label: 'INTAKE (CAMPAIGN)', href: '/evolve/marketing/intake/campaign' },
  { label: 'ADMIN LIST', href: SITE00_ADMIN_ROUTES.marketingEngagements },
  { label: 'EMAIL PACK', href: SITE00_ADMIN_ROUTES.emailPack },
];

export default function EvolveMarketingDebugPage() {
  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="DEBUG · EVOLVE MARKETING"
        title="MARKETING & CONTENT REVIEW ROUTES"
        subtitle="ADAPTER: mock (dev) / live (production) · docs/STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md"
      />
      <ul className="site00-email-debug-index">
        {DEBUG_STATES.map((s) => (
          <li key={s.href}><Link to={s.href}>{s.label}</Link></li>
        ))}
        <li><span>BRIEF / ENGAGEMENT — create via intake flow; example engagement path: {site00EvolveMarketingEngagement('{id}')}</span></li>
      </ul>
      <p className="site00-marketing-note">
        Development: STUDIO_WORLD_ADAPTER=mock. Production: STUDIO_WORLD_ADAPTER=live with API credentials.
      </p>
    </Site00AdminShell>
  );
}
