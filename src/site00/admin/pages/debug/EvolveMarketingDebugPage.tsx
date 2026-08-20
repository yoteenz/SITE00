import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { SITE00_ROUTES, site00EvolveMarketingEngagement } from '../../../config/routes';
import { getMarketingService } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import { CreativeIntakeEngine } from '../../../components/evolve/creative-intake/CreativeIntakeEngine';
import type { MarketingServiceCategory } from '../../../../../shared/site00-marketing/types';
import '../../../styles/site00-creative-intake.css';

const REVIEW_DISCIPLINES: MarketingServiceCategory[] = [
  'social-content',
  'brand-film',
  'campaign',
  'content-system',
];

const DEBUG_STATES = [
  { label: 'EVOLVE SELECTION', href: SITE00_ROUTES.evolveState },
  { label: 'MARKETING LANDING', href: SITE00_ROUTES.evolveMarketing },
  { label: 'SERVICE SELECTION', href: SITE00_ROUTES.evolveMarketingServices },
  { label: 'INTAKE (SOCIAL)', href: '/evolve/marketing/intake/social-content' },
  { label: 'INTAKE (BRAND FILM)', href: '/evolve/marketing/intake/brand-film' },
  { label: 'INTAKE (CAMPAIGN)', href: '/evolve/marketing/intake/campaign' },
  { label: 'INTAKE (CONTENT SYSTEM)', href: '/evolve/marketing/intake/content-system' },
  { label: 'ADMIN LIST', href: SITE00_ADMIN_ROUTES.marketingEngagements },
  { label: 'EMAIL PACK', href: SITE00_ADMIN_ROUTES.emailPack },
];

export default function EvolveMarketingDebugPage() {
  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="DEBUG · EVOLVE MARKETING"
        title="MARKETING & CONTENT REVIEW ROUTES"
        subtitle="Adaptive creative intake — headline-removal differentiation QA at 375 / 640 / desktop"
      />
      <ul className="site00-email-debug-index">
        {DEBUG_STATES.map((s) => (
          <li key={s.href}><Link to={s.href}>{s.label}</Link></li>
        ))}
        <li><span>BRIEF / ENGAGEMENT — create via intake flow; example engagement path: {site00EvolveMarketingEngagement('{id}')}</span></li>
      </ul>

      <section className="site00-control-panel" style={{ marginTop: '1.5rem' }}>
        <h2 className="site00-control-panel__title">CREATIVE INTAKE COMPARISON (HEADINGS HIDDEN)</h2>
        <p className="site00-marketing-note">Each panel uses data-signature-artifact for headline-removal test.</p>
        <div className="site00-creative-intake-review">
          {REVIEW_DISCIPLINES.map((id) => {
            const service = getMarketingService(id)!;
            return (
              <div key={id} className="site00-creative-intake-review__panel">
                <h3>{service.title} · {id}</h3>
                <CreativeIntakeEngine service={service} hideHeading onComplete={() => {}} />
              </div>
            );
          })}
        </div>
      </section>

      <p className="site00-marketing-note">
        Development: STUDIO_WORLD_ADAPTER=mock. Production: STUDIO_WORLD_ADAPTER=live with API credentials.
      </p>
    </Site00AdminShell>
  );
}
