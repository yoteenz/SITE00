import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState, SearchField } from '../components/pages/Site00PagePrimitives';
import { ProjectWorkspaceEntry } from '../components/projectWorkspace/ProjectWorkspaceEntry';
import { Site00ProjectWorkspace } from '../components/projectWorkspace/Site00ProjectWorkspace';
import { mapProjectsToWorkspaceIndex } from '../../../shared/site00-brand-lore/projectWorkspace/projectsPageMapping.js';
import { buildProjectWorkspaceBible } from '../../../shared/site00-brand-lore/projectWorkspace/projectWorkspaceBible.js';
import { useSite00ProjectsIndex } from '../hooks/useSite00Projects';
import { SITE00_ROUTES } from '../config/routes';
import '../styles/site00-projects.css';

const workspaceBible = buildProjectWorkspaceBible();

export default function ProjectsPage() {
  const { projects, clientProjects, state, error, reload } = useSite00ProjectsIndex();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.displayName ?? '').toLowerCase().includes(q) ||
        (p.slug ?? '').toLowerCase().includes(q) ||
        (p.internalLabel?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [projects, query]);

  const workspaceIndex = useMemo(
    () => mapProjectsToWorkspaceIndex(filtered),
    [filtered],
  );

  return (
    <EcosystemShell>
      <div className="site00-page site00-page--projects site00-page--projects-workspace">
        <Site00ProjectWorkspace activeZone="ON_THE_BENCH" reviewTrayVisible={workspaceIndex.reviewTray.length > 0}>
          <header className="site00-projects-header site00-pws-index-header">
            <p className="site00-label-red">SITE 00 · PROJECT WORKSPACE</p>
            <h1 className="site00-projects-header__title">ACTIVE PRODUCTION FLOOR</h1>
            <p className="site00-body site00-projects-header__sub">{workspaceBible.workspaceThesis}</p>
            <p className="site00-body site00-pws-index-header__prompt">
              WHAT IS BEING WORKED ON? · WHAT NEEDS YOUR ATTENTION? · WHERE DO YOU ENTER A PROJECT?
            </p>
          </header>

          <div className="site00-page-toolbar">
            <SearchField value={query} onChange={setQuery} placeholder="FIND PROJECT…" id="projects-search" />
          </div>

          {state === 'loading' ? (
            <p className="site00-body">LOADING WORKSPACE…</p>
          ) : state === 'error' ? (
            <div className="site00-projects-error">
              <EmptyState
                title="WORKSPACE INDEX UNAVAILABLE"
                body={error ?? 'PROJECT DATA COULD NOT BE LOADED.'}
              />
              <button type="button" className="site00-btn site00-btn--primary site00-projects-error__retry" onClick={reload}>
                RETRY →
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="NO MATCHING PROJECTS" body="ADJUST SEARCH OR RETURN LATER." />
          ) : (
            <>
              {workspaceIndex.activePiece ? (
                <section className="site00-pws-index-active" aria-label="Active piece">
                  <h2 className="site00-pws-zone__title">ACTIVE PIECE</h2>
                  <ProjectWorkspaceEntry entry={workspaceIndex.activePiece} variant="dominant" />
                </section>
              ) : null}

              <section className="site00-pws-index-bench" aria-label="On the bench">
                <h2 className="site00-pws-zone__title">ON THE BENCH</h2>
                <div className="site00-pws-entry-list site00-pws-entry-list--asymmetric">
                  {workspaceIndex.onTheBench
                    .filter((e) => e.slug !== workspaceIndex.activePiece?.slug)
                    .map((entry) => (
                      <ProjectWorkspaceEntry key={entry.slug} entry={entry} />
                    ))}
                </div>
              </section>

              {workspaceIndex.reviewTray.length > 0 ? (
                <section className="site00-pws-index-review" aria-label="Review tray">
                  <h2 className="site00-pws-zone__title">REVIEW TRAY · NEEDS YOUR EYES</h2>
                  <div className="site00-pws-entry-list">
                    {workspaceIndex.reviewTray.map((entry) => (
                      <ProjectWorkspaceEntry key={entry.slug} entry={entry} variant="compact" />
                    ))}
                  </div>
                </section>
              ) : (
                <p className="site00-project-command__note">
                  REVIEW TRAY empty — {workspaceIndex.dataDependencies[0] ?? 'no pending judgments on index'}
                </p>
              )}

              {workspaceIndex.workHistory.length > 0 ? (
                <section className="site00-pws-index-history site00-pws-zone--peripheral" aria-label="Work history">
                  <h2 className="site00-pws-zone__title">RECENT WORK</h2>
                  <ul className="site00-pws-history-list">
                    {workspaceIndex.workHistory.slice(0, 5).map((entry) => (
                      <li key={entry.slug}>
                        <Link to={entry.detailRoute}>{entry.displayName}</Link>
                        {entry.recentActivity ? <span> · {entry.recentActivity}</span> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="site00-pws-index-dossier site00-pws-zone--contextual" aria-label="Dossier access">
                <h2 className="site00-pws-zone__title">DOSSIER ACCESS</h2>
                <div className="site00-pws-entry-list site00-pws-entry-list--dossier">
                  {workspaceIndex.dossierAccess.map((entry) => (
                    <ProjectWorkspaceEntry key={`dossier-${entry.slug}`} entry={entry} variant="compact" />
                  ))}
                </div>
              </section>
            </>
          )}
        </Site00ProjectWorkspace>

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
