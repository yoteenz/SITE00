import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { SITE00_ROUTES, site00EvolveMarketingEngagement } from '../../../config/routes';
import { getMarketingService } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import { MARKETING_CONTENT_SERVICES } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import { CreativeIntakeEngine } from '../../../components/evolve/creative-intake/CreativeIntakeEngine';
import type { MarketingServiceCategory } from '../../../../../shared/site00-marketing/types';
import '../../../styles/site00-creative-intake.css';

const REVIEW_DISCIPLINES: MarketingServiceCategory[] = MARKETING_CONTENT_SERVICES.map((s) => s.id);

const DEBUG_STATES = [
  { label: 'EVOLVE SELECTION', href: SITE00_ROUTES.evolveState },
  { label: 'MARKETING LANDING', href: SITE00_ROUTES.evolveMarketing },
  { label: 'SERVICE SELECTION', href: SITE00_ROUTES.evolveMarketingServices },
  ...REVIEW_DISCIPLINES.map((id) => ({
    label: `INTAKE (${id.toUpperCase()})`,
    href: `/evolve/marketing/intake/${id}`,
  })),
  { label: 'ADMIN LIST', href: SITE00_ADMIN_ROUTES.marketingEngagements },
  { label: 'EMAIL PACK', href: SITE00_ADMIN_ROUTES.emailPack },
];

export default function EvolveMarketingDebugPage() {
  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="DEBUG · EVOLVE MARKETING"
        title="MARKETING & CONTENT REVIEW ROUTES"
        subtitle="7-DISCIPLINE CREATIVE INTAKE — HEADLINE-REMOVAL DIFFERENTIATION QA AT 375 / 640 / DESKTOP"
      />
      <ul className="site00-email-debug-index">
        {DEBUG_STATES.map((s) => (
          <li key={s.href}><Link to={s.href}>{s.label}</Link></li>
        ))}
        <li><span>BRIEF / ENGAGEMENT — CREATE VIA INTAKE FLOW; EXAMPLE: {site00EvolveMarketingEngagement('{id}')}</span></li>
      </ul>

      <section className="site00-control-panel" style={{ marginTop: '1.5rem' }}>
        <h2 className="site00-control-panel__title">CREATIVE INTAKE COMPARISON (HEADINGS HIDDEN)</h2>
        <p className="site00-marketing-note">EACH PANEL USES data-signature-artifact FOR HEADLINE-REMOVAL TEST. ALL TEXT UPPERCASE.</p>
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
        READ-ONLY VISUAL QA — NO EMAILS, NO PUBLISH, NO PRODUCTION MUTATION.
      </p>
    </Site00AdminShell>
  );
}
