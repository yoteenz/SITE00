import { Link, useParams } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

const NAV_ITEMS = [
  { key: 'overview', label: 'OVERVIEW', path: (slug: string) => SITE00_ADMIN_ROUTES.evolveOrg(slug) },
  { key: 'connections', label: 'CONNECTIONS', path: (slug: string) => SITE00_ADMIN_ROUTES.evolveOrgConnections(slug) },
  { key: 'campaigns', label: 'CAMPAIGNS', path: (slug: string) => SITE00_ADMIN_ROUTES.evolveCampaigns(slug) },
  { key: 'calendar', label: 'CALENDAR', path: (slug: string) => SITE00_ADMIN_ROUTES.evolveCalendar(slug) },
  { key: 'emails', label: 'EMAIL', path: (slug: string) => SITE00_ADMIN_ROUTES.evolveEmails(slug) },
  { key: 'social', label: 'SOCIAL', path: (slug: string) => SITE00_ADMIN_ROUTES.evolveSocial(slug) },
  { key: 'production', label: 'PRODUCTION', path: (slug: string) => SITE00_ADMIN_ROUTES.evolveProductionNew(slug) },
  { key: 'plans', label: 'PLANS', path: (slug: string) => SITE00_ADMIN_ROUTES.evolvePlans(slug) },
  { key: 'pilot', label: 'PILOT', path: (slug: string) => SITE00_ADMIN_ROUTES.evolvePilot(slug) },
] as const;

type EvolveOrgNavProps = {
  active: (typeof NAV_ITEMS)[number]['key'];
};

export function EvolveOrgNav({ active }: EvolveOrgNavProps) {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();

  return (
    <nav className="site00-evolve-ops-nav" aria-label="EVOLVE workspace">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.key}
          to={item.path(orgSlug)}
          className={active === item.key ? 'site00-evolve-ops-nav__link active' : 'site00-evolve-ops-nav__link'}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function EvolveOrgBreadcrumb() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();

  return (
    <ul className="site00-email-debug-index">
      <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>← COMMAND</Link></li>
      <li><Link to={SITE00_ADMIN_ROUTES.evolve}>EVOLVE PORTFOLIO</Link></li>
      <li><Link to={SITE00_ADMIN_ROUTES.orchestrationProject(orgSlug)}>LAUNCH CONTROL</Link></li>
      <li><Link to={SITE00_ADMIN_ROUTES.evolveApprovals}>APPROVALS INBOX</Link></li>
    </ul>
  );
}
