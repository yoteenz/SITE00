import { Link } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

type ProjectSwitcherProps = {
  organizations: Array<{ slug: string; name: string; clientFacing?: boolean }>;
  selected?: string;
  includeAll?: boolean;
  /** When set, navigate to orchestration project sub-route instead of project root */
  subRoute?: 'evolve';
};

export function ProjectSwitcher({ organizations, selected, includeAll, subRoute }: ProjectSwitcherProps) {
  const hrefFor = (slug: string) =>
    subRoute === 'evolve' ? SITE00_ADMIN_ROUTES.evolveOrg(slug) : SITE00_ADMIN_ROUTES.orchestrationProject(slug);

  return (
    <label className="site00-orchestration-switcher">
      <span className="site00-orchestration-switcher__label">PROJECT</span>
      <select
        className="site00-orchestration-switcher__select"
        value={selected ?? ''}
        onChange={(e) => {
          const slug = e.target.value;
          if (!slug) {
            window.location.href = SITE00_ADMIN_ROUTES.dashboard;
          } else {
            window.location.href = hrefFor(slug);
          }
        }}
      >
        {includeAll ? <option value="">ALL PROJECTS</option> : null}
        {organizations.map((o) => (
          <option key={o.slug} value={o.slug}>{o.name}</option>
        ))}
      </select>
      <Link to={SITE00_ADMIN_ROUTES.dashboard} className="site00-orchestration-switcher__all">PORTFOLIO →</Link>
    </label>
  );
}
