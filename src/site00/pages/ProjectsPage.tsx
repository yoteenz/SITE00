import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState, MetricCard, SearchField } from '../components/pages/Site00PagePrimitives';
import { useSite00ProjectsIndex } from '../hooks/useSite00Projects';
import { SITE00_ROUTES } from '../config/routes';
import '../styles/site00-projects.css';

export default function ProjectsPage() {
  const { projects, clientProjects, state, error } = useSite00ProjectsIndex();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.internalLabel?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [projects, query]);

  const metrics = {
    total: projects.length + (clientProjects?.length ?? 0),
    active: projects.filter((p) => !p.currentPhase.includes('ARCHIVED')).length,
    founder: projects.length,
    client: clientProjects?.length ?? 0,
  };

  return (
    <EcosystemShell>
      <div className="site00-page site00-page--projects">
        <header className="site00-projects-header">
          <p className="site00-label-red">PROJECT INDEX</p>
          <h1 className="site00-projects-header__title">PROJECTS</h1>
          <p className="site00-body site00-projects-header__sub">
            REAL SITE 00 PROJECT TRUTH — FRONTAL SLAYER, STUDIO WORLD, AND NDXBOOK INDEXED FROM CANONICAL SYSTEMS.
          </p>
        </header>

        <div className="site00-eco-metrics site00-eco-metrics--4">
          <MetricCard label="TOTAL PROJECTS" value={String(metrics.total)} />
          <MetricCard label="FOUNDER INDEX" value={String(metrics.founder)} />
          <MetricCard label="CLIENT PROJECTS" value={String(metrics.client)} />
          <MetricCard label="SOURCE" value="LIVE" />
        </div>

        <div className="site00-page-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="SEARCH PROJECTS…" id="projects-search" />
        </div>

        {state === 'loading' ? (
          <p className="site00-body">LOADING PROJECTS…</p>
        ) : state === 'error' ? (
          <EmptyState title="COULD NOT LOAD PROJECTS" body={error ?? 'REAL PROJECT DATA UNAVAILABLE — NO DEMO FALLBACK SHOWN.'} />
        ) : filtered.length === 0 ? (
          <EmptyState title="NO MATCHING PROJECTS" body="ADJUST SEARCH OR RETURN LATER." />
        ) : (
          <ul className="site00-project-index-list">
            {filtered.map((project) => (
              <li key={project.slug} className="site00-project-index-card">
                <Link to={project.detailRoute} className="site00-project-index-card__link">
                  <div className="site00-project-index-card__mark" aria-hidden="true">◈</div>
                  <div className="site00-project-index-card__body">
                    <p className="site00-project-index-card__kicker">{project.currentSystem}</p>
                    <p className="site00-project-index-card__name">{project.displayName}</p>
                    {project.internalLabel ? (
                      <p className="site00-project-index-card__internal">{project.internalLabel}</p>
                    ) : null}
                    <p className="site00-project-index-card__phase">{project.currentPhase}</p>
                    {project.focusNow ? (
                      <p className="site00-project-index-card__focus">
                        FOCUS NOW · {project.focusNow}
                      </p>
                    ) : null}
                    <p className="site00-project-index-card__org">
                      {project.classification.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className="site00-project-index-card__cta">OPEN PROJECT →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {clientProjects && clientProjects.length > 0 ? (
          <section className="site00-projects-client-section">
            <h2 className="site00-eco-panel__title">CLIENT STUDIO PROJECTS</h2>
            <ul className="site00-project-list">
              {clientProjects.map((p) => (
                <li key={p.id} className="site00-project-row">
                  <Link to={p.studioRoute} className="site00-project-row__link">
                    <div className="site00-project-row__body">
                      <p className="site00-project-row__name">{p.name}</p>
                      <p className="site00-project-row__desc">CLIENT STUDIO · {p.slug}</p>
                    </div>
                    <span className="site00-project-row__menu" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="site00-eco-mobile-cta">
          <Link to={SITE00_ROUTES.evolveState} className="site00-btn-outline site00-btn-outline--block">
            EVOLVE →
          </Link>
        </div>
      </div>
    </EcosystemShell>
  );
}
