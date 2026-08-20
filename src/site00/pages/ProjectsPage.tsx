import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState, MetricCard, SearchField } from '../components/pages/Site00PagePrimitives';
import { useSite00ProjectsIndex } from '../hooks/useSite00Projects';
import { SITE00_ROUTES } from '../config/routes';
import '../styles/site00-projects.css';

const UNAVAILABLE = '—';

export default function ProjectsPage() {
  const { projects, clientProjects, summary, state, sourceLabel, error, reload } = useSite00ProjectsIndex();
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

  const showMetrics = state === 'ready' || state === 'partial';
  const metrics = showMetrics && summary
    ? {
        total: String(summary.total),
        founder: String(summary.founderIndex),
        client: String(summary.clientProjects),
      }
    : {
        total: UNAVAILABLE,
        founder: UNAVAILABLE,
        client: UNAVAILABLE,
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
          <MetricCard label="TOTAL PROJECTS" value={metrics.total} />
          <MetricCard label="FOUNDER INDEX" value={metrics.founder} />
          <MetricCard label="CLIENT PROJECTS" value={metrics.client} />
          <MetricCard label="SOURCE" value={sourceLabel} />
        </div>

        <div className="site00-page-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="SEARCH PROJECTS…" id="projects-search" />
        </div>

        {state === 'loading' ? (
          <p className="site00-body">LOADING PROJECTS…</p>
        ) : state === 'error' ? (
          <div className="site00-projects-error">
            <EmptyState
              title="PROJECT INDEX UNAVAILABLE"
              body={error ?? 'PROJECT DATA COULD NOT BE LOADED — NOT AN EMPTY PROJECT LIST.'}
            />
            <button type="button" className="site00-btn site00-btn--primary site00-projects-error__retry" onClick={reload}>
              RETRY →
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="NO MATCHING PROJECTS" body="ADJUST SEARCH OR RETURN LATER." />
        ) : (
          <>
            {state === 'partial' ? (
              <p className="site00-project-command__note site00-projects-partial-note">
                PARTIAL ENRICHMENT — SOME PROJECT METADATA UNAVAILABLE. IDENTITIES REMAIN TRUTHFUL.
              </p>
            ) : null}
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
                      {project.enrichmentStatus === 'PARTIAL' ? (
                        <p className="site00-project-index-card__partial">ENRICHMENT PARTIAL</p>
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
          </>
        )}

        {showMetrics && clientProjects && clientProjects.length > 0 ? (
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
