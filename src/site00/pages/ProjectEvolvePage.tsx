import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState } from '../components/pages/Site00PagePrimitives';
import { ProjectPrivilegedUtilities } from '../components/access/ProjectPrivilegedUtilities';
import { useSite00ProjectDetail } from '../hooks/useSite00Projects';
import { SITE00_ROUTES, site00ProjectPath } from '../config/routes';
import { site00ProjectCreativeDirectionRoute } from '../../../shared/site00-access/routes';
import type { Site00FounderProjectSlug } from '../../../shared/site00-projects/types';
import '../styles/site00-projects.css';

export default function ProjectEvolvePage() {
  const { projectSlug = '' } = useParams();
  const { project, state, error } = useSite00ProjectDetail(projectSlug);

  return (
    <EcosystemShell>
      <div className="site00-page site00-page--project-evolve">
        <nav className="site00-project-command__back">
          <Link to={site00ProjectPath(projectSlug)}>← {project?.displayName ?? 'PROJECT'}</Link>
        </nav>

        {state === 'loading' ? (
          <p className="site00-body">LOADING EVOLVE…</p>
        ) : state === 'error' || !project ? (
          <EmptyState title="PROJECT NOT FOUND" body={error ?? 'NO TRUTHFUL PROJECT RECORD FOR THIS SLUG.'} />
        ) : (
          <>
            <header className="site00-project-command__header">
              <p className="site00-label-red">EVOLVE</p>
              <h1 className="site00-project-command__title">{project.displayName}</h1>
              <p className="site00-body">CANONICAL CLIENT EVOLVE SURFACE — MARKETING OPERATIONS FOR THIS PROJECT.</p>
            </header>

            <div className="site00-project-command__grid">
              <section className="site00-project-command__section">
                <h2 className="site00-project-command__section-title">CURRENT STATE</h2>
                <div className="site00-project-command__row">
                  <span className="site00-project-command__label">PHASE</span>
                  <span className="site00-project-command__value">{project.currentPhase}</span>
                </div>
                <div className="site00-project-command__row">
                  <span className="site00-project-command__label">MARKETING HEALTH</span>
                  <span className="site00-project-command__value">{project.overview.marketingHealth ?? '—'}</span>
                </div>
                <div className="site00-project-command__row">
                  <span className="site00-project-command__label">ACTIVE CAMPAIGNS</span>
                  <span className="site00-project-command__value">{String(project.evolve.activeCampaigns)}</span>
                </div>
                <div className="site00-project-command__row">
                  <span className="site00-project-command__label">NEEDS APPROVAL</span>
                  <span className="site00-project-command__value">{String(project.evolve.needsApproval)}</span>
                </div>
              </section>

              <section className="site00-project-command__section">
                <h2 className="site00-project-command__section-title">SURFACES</h2>
                <ul className="site00-project-command__surfaces">
                  {project.creativeDirection ? (
                    <li>
                      <Link to={site00ProjectCreativeDirectionRoute(project.slug)}>CREATIVE DIRECTION →</Link>
                    </li>
                  ) : null}
                  <li>
                    <Link to={SITE00_ROUTES.evolveMarketing}>MARKETING & CONTENT INTAKE →</Link>
                  </li>
                  <li>
                    <Link to={project.channelsRoute}>CONNECTIONS →</Link>
                  </li>
                </ul>
              </section>
            </div>

            {project.slug === 'frontal-slayer' || project.slug === 'studio-world' || project.slug === 'ndxbook' ? (
              <ProjectPrivilegedUtilities
                slug={project.slug as Site00FounderProjectSlug}
                organizationUuid={project.organizationUuid}
              />
            ) : null}
          </>
        )}
      </div>
    </EcosystemShell>
  );
}
