import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState, MetricCard, SearchField } from '../components/pages/Site00PagePrimitives';
import { useClientProjects } from '../hooks/useClientProjects';
import { SITE00_ROUTES } from '../config/routes';
import { useEcosystemData } from '../hooks/useEcosystemData';

const STATUS_FILTERS = [
  { id: 'all', label: 'ALL' },
  { id: 'active', label: 'ACTIVE' },
] as const;

export default function ProjectsPage() {
  const { projects: apiProjects, state: apiState } = useClientProjects();
  const { projectMetrics, projectActivity, myRoles } = useEcosystemData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]['id']>('all');

  const projects = apiState === 'ready' && apiProjects.length > 0 ? apiProjects : [];

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || p.status === 'ACTIVE' || p.paymentState === 'CONFIRMED';
      return matchesQuery && matchesStatus;
    });
  }, [projects, query, statusFilter]);

  const metrics = {
    total: projects.length || projectMetrics.total,
    active: projects.filter((p) => p.status === 'ACTIVE').length || projectMetrics.active,
    completed: projectMetrics.completed,
    archived: projectMetrics.archived,
  };

  return (
    <EcosystemShell>
      <div className="site00-page site00-page--projects">
        <div className="site00-eco-metrics site00-eco-metrics--4">
          <MetricCard label="TOTAL PROJECTS" value={String(metrics.total)} />
          <MetricCard label="ACTIVE PROJECTS" value={String(metrics.active)} />
          <MetricCard label="COMPLETED" value={String(metrics.completed)} />
          <MetricCard label="ARCHIVED" value={String(metrics.archived)} />
        </div>

        <div className="site00-page-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="SEARCH PROJECTS…" id="projects-search" />
          <div className="site00-eco-filters" role="group" aria-label="FILTER BY STATUS">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`site00-eco-filters__btn ${statusFilter === f.id ? 'site00-eco-filters__btn--active' : ''}`.trim()}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {apiState === 'loading' ? (
          <p className="site00-body">LOADING PROJECTS…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="NO PROJECTS YET"
            body="START FROM IDNTY, BLDR, OR EVOLVE TO CREATE YOUR FIRST SITE 00 PROJECT."
          />
        ) : (
          <ul className="site00-project-list">
            {filtered.map((project) => (
              <li key={project.id} className="site00-project-row">
                <Link to={project.studioRoute} className="site00-project-row__link">
                  <div className="site00-project-row__thumb" aria-hidden="true" />
                  <div className="site00-project-row__body">
                    <p className="site00-project-row__name">{project.name}</p>
                    <p className="site00-project-row__desc">
                      {project.buildClass ?? 'SITE'} · {project.currentPhase.replace(/_/g, ' ')} · {project.productionReadinessPct}% READY
                    </p>
                    <div className="site00-project-row__meta">
                      <span className="site00-project-row__date">{project.status}</span>
                    </div>
                  </div>
                  <span className="site00-project-row__menu" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="site00-eco-continuation">
          <section className="site00-eco-panel" aria-labelledby="project-activity-heading">
            <h2 id="project-activity-heading" className="site00-eco-panel__title">
              PROJECT ACTIVITY
            </h2>
            <ul className="site00-eco-activity-feed">
              {projectActivity.map((item) => (
                <li key={item.id} className="site00-eco-activity-feed__row">
                  <span className="site00-eco-activity-feed__entity">{item.entity}</span>
                  <span className="site00-eco-activity-feed__action">{item.action}</span>
                  <span className="site00-eco-activity-feed__time">{item.timeAgo}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="site00-eco-panel" aria-labelledby="my-roles-heading">
            <h2 id="my-roles-heading" className="site00-eco-panel__title">
              MY ROLES
            </h2>
            <ul className="site00-eco-roles">
              {myRoles.map((role) => (
                <li key={role.role} className="site00-eco-roles__row">
                  <span className="site00-eco-roles__label">{role.role}</span>
                  <span className="site00-eco-roles__count">{role.count} projects</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="site00-eco-mobile-cta">
          <Link to={SITE00_ROUTES.bldr} className="site00-btn-outline site00-btn-outline--block">
            + NEW PROJECT
          </Link>
          <Link to={SITE00_ROUTES.evolveState} className="site00-btn-outline site00-btn-outline--block">
            + EVOLVE
          </Link>
        </div>
      </div>
    </EcosystemShell>
  );
}
