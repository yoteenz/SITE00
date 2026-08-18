import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import { BracketHeading, EmptyState, FilterTabs, PageIntro } from '../components/pages/Site00PagePrimitives';
import { SITE00_PORTFOLIO_SEED } from '../config/seed/site00-page-seed';
import { SITE00_ROUTES } from '../config/routes';
import { StatusBadge } from '../components/pages/Site00PagePrimitives';
import { useSignedInFromStorage } from '../../hooks/useSignedInFromStorage';

const FILTERS = [
  { id: 'all', label: 'ALL PROJECTS' },
  { id: 'completed', label: 'COMPLETED' },
  { id: 'in-progress', label: 'IN PROGRESS' },
];

export default function SitesPortfolioPage() {
  const [isSignedIn] = useSignedInFromStorage();
  const [filter, setFilter] = useState('all');
  const projects = useMemo(() => {
    if (filter === 'all') return SITE00_PORTFOLIO_SEED;
    return SITE00_PORTFOLIO_SEED.filter((p) => p.status === filter);
  }, [filter]);

  if (isSignedIn) {
    return <Navigate to={SITE00_ROUTES.controlSites} replace />;
  }

  return (
    <Site00PublicShell mobileActiveNav="origin">
      <div className="site00-page site00-page--sites-portfolio">
        <PageIntro
          title={<BracketHeading>SITES</BracketHeading>}
          subtitle="WE DESIGN. WE BUILD. WE LAUNCH."
            body="A CURATED VIEW OF SITE 00 WORK — PUBLISHED PROJECTS AND IN-PROGRESS BUILDS AVAILABLE FOR PUBLIC SHOWCASE."
        />

        <FilterTabs tabs={FILTERS} active={filter} onChange={setFilter} />

        {projects.length === 0 ? (
          <EmptyState
            title="NO PUBLISHED PROJECTS YET"
            body="WHEN PROJECTS ARE APPROVED FOR PUBLIC SHOWCASE, THEY WILL APPEAR HERE."
          />
        ) : (
          <div className="site00-portfolio-grid">
            {projects.map((project) => (
              <article key={project.id} className="site00-portfolio-card">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt="" className="site00-portfolio-card__image" />
                ) : (
                  <div className="site00-portfolio-card__image site00-portfolio-card__image--placeholder" />
                )}
                <div className="site00-portfolio-card__body">
                  <StatusBadge
                    status={project.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                    tone={project.status === 'completed' ? 'published' : 'progress'}
                  />
                  <h2 className="site00-portfolio-card__title">{project.name}</h2>
                  <p className="site00-portfolio-card__desc">{project.description}</p>
                  <Link to={`${SITE00_ROUTES.sites}/${project.id}`} className="site00-link-red">
                    VIEW PROJECT →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="site00-page-cta">
          <div>
            <p className="site00-label-red">HAVE A PROJECT IN MIND?</p>
            <p className="site00-body">LET&apos;S BUILD SOMETHING EXCEPTIONAL.</p>
          </div>
          <Link to={SITE00_ROUTES.bldr} className="site00-link-red">
            START A PROJECT →
          </Link>
        </section>
      </div>
    </Site00PublicShell>
  );
}
