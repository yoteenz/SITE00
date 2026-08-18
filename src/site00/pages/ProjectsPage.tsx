import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectRow } from '../components/ecosystem/ProjectRow';
import { EmptyState, MetricCard, SearchField } from '../components/pages/Site00PagePrimitives';
import { useEcosystemData } from '../hooks/useEcosystemData';
import { SITE00_ROUTES } from '../config/routes';
import type { ProjectStatus } from '../config/seed/site00-ecosystem-seed';

const STATUS_FILTERS: { id: string; label: string; match?: ProjectStatus | 'ALL' }[] = [
  { id: 'all', label: 'ALL', match: 'ALL' },
  { id: 'active', label: 'ACTIVE', match: 'ACTIVE' },
  { id: 'progress', label: 'IN PROGRESS', match: 'IN PROGRESS' },
  { id: 'draft', label: 'DRAFT', match: 'DRAFT' },
  { id: 'archived', label: 'ARCHIVED', match: 'ARCHIVED' },
];

const SERVICE_FILTERS: { id: string; label: string; match?: 'IDNTY' | 'BLDR' | 'EVOLVE' | 'ALL' }[] = [
  { id: 'service-all', label: 'ALL', match: 'ALL' },
  { id: 'service-idnty', label: 'IDNTY', match: 'IDNTY' },
  { id: 'service-bldr', label: 'BLDR', match: 'BLDR' },
  { id: 'service-evolve', label: 'EVOLVE', match: 'EVOLVE' },
];

export default function ProjectsPage() {
  const { projects, projectMetrics, projectActivity, myRoles } = useEcosystemData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('service-all');

  const filtered = useMemo(() => {
    const filterDef = STATUS_FILTERS.find((f) => f.id === statusFilter);
    const serviceDef = SERVICE_FILTERS.find((f) => f.id === serviceFilter);
    return projects.filter((p) => {
      const matchesQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = !filterDef?.match || filterDef.match === 'ALL' || p.status === filterDef.match;
      const matchesService =
        !serviceDef?.match ||
        serviceDef.match === 'ALL' ||
        p.serviceLine === serviceDef.match;
      return matchesQuery && matchesStatus && matchesService;
    });
  }, [projects, query, statusFilter, serviceFilter]);

  const headerActions = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Link to={SITE00_ROUTES.evolveState} className="site00-btn-outline site00-ecosystem-header__cta">
        + EVOLVE
      </Link>
      <Link to={SITE00_ROUTES.bldr} className="site00-btn-outline site00-ecosystem-header__cta">
        + NEW BUILD
      </Link>
    </div>
  );

  return (
    <EcosystemShell headerActions={headerActions}>
      <div className="site00-page site00-page--projects">
        <div className="site00-eco-metrics site00-eco-metrics--4">
          <MetricCard label="TOTAL PROJECTS" value={String(projectMetrics.total)} />
          <MetricCard label="ACTIVE PROJECTS" value={String(projectMetrics.active)} />
          <MetricCard label="COMPLETED" value={String(projectMetrics.completed)} />
          <MetricCard label="ARCHIVED" value={String(projectMetrics.archived)} />
        </div>

        <div className="site00-page-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search projects…" id="projects-search" />
          <div className="site00-eco-filters" role="group" aria-label="Filter by status">
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
          <div className="site00-eco-filters" role="group" aria-label="Filter by service">
            {SERVICE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`site00-eco-filters__btn ${serviceFilter === f.id ? 'site00-eco-filters__btn--active' : ''}`.trim()}
                onClick={() => setServiceFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="NO PROJECTS YET"
            body="Start from IDNTY, BLDR, or EVOLVE to create your first SITE 00 project."
          />
        ) : (
          <ul className="site00-project-list">
            {filtered.map((project) => (
              <ProjectRow key={project.id} project={project} />
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
        </div>
      </div>
    </EcosystemShell>
  );
}
