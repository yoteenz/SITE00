import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState } from '../components/pages/Site00PagePrimitives';
import { useProjectIdentity } from '../hooks/useProjectIdentity';
import { SITE00_ROUTES, site00ProjectOriginPath, site00ProjectPath } from '../config/routes';
import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import '../styles/site00-projects.css';

export default function ProjectIdentityPage() {
  const { projectSlug = '' } = useParams();
  const { state, error, brief, territories, hierarchy, bible, entering, enterIdentity, submitJudgment } =
    useProjectIdentity(projectSlug);

  if (!hasProjectCapability(projectSlug, 'BRAND_INTELLIGENCE')) {
    return (
      <EcosystemShell hidePageHeader>
        <EmptyState title="IDENTITY UNAVAILABLE" body="This project does not have Identity phase capability." />
      </EcosystemShell>
    );
  }

  const masterBrand = brief && typeof brief.masterBrand === 'string' ? brief.masterBrand : 'Astral World';
  const flagshipDistrict = brief && typeof brief.flagshipDistrict === 'string' ? brief.flagshipDistrict : 'Astréa';

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-page site00-page--project-identity">
        <nav className="site00-project-command__back">
          <Link to={site00ProjectPath(projectSlug)}>← {projectSlug.toUpperCase()}</Link>
          <Link to={site00ProjectOriginPath(projectSlug)}> · ORIGIN</Link>
          <Link to={SITE00_ROUTES.projects}> · PROJECTS</Link>
        </nav>

        <header className="site00-project-command__header">
          <p className="site00-label-red">IDENTITY · CREATIVE EXPLORATION</p>
          <h1 className="site00-project-command__title">{masterBrand} Identity</h1>
          <p className="site00-body">
            Client truth → creative exploration → judgment → explicit canon promotion. Nothing here becomes canon without founder approval.
          </p>
        </header>

        {state === 'loading' ? (
          <p className="site00-body">LOADING IDENTITY…</p>
        ) : state === 'error' ? (
          <EmptyState title="IDENTITY ERROR" body={error ?? 'Could not load identity data.'} />
        ) : (
          <>
            <section className="site00-project-command__section">
              <h2 className="site00-project-command__section-title">WORLD HIERARCHY</h2>
              <p className="site00-project-command__note">
                Master: <strong>{masterBrand}</strong> · Flagship district: <strong>{flagshipDistrict}</strong>
              </p>
              {hierarchy.length ? (
                <ul className="site00-project-command__activity">
                  {hierarchy.map((n) => (
                    <li key={n.id}>
                      <span className="site00-project-command__command-cat">{n.node_type}</span>
                      <strong>{n.display_name}</strong>
                      <span>{n.truth_layer}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <button type="button" className="site00-btn site00-btn--primary" disabled={entering} onClick={() => void enterIdentity()}>
                  {entering ? 'ENTERING…' : 'ENTER IDENTITY PHASE →'}
                </button>
              )}
            </section>

            {brief ? (
              <section className="site00-project-command__section">
                <h2 className="site00-project-command__section-title">IDENTITY BRIEF (DERIVED · NON-CANONICAL)</h2>
                <p className="site00-body">{typeof brief.note === 'string' ? brief.note : ''}</p>
                <p className="site00-body">Hierarchy: {typeof brief.productHierarchy === 'string' ? brief.productHierarchy : ''}</p>
              </section>
            ) : null}

            <section className="site00-project-command__section">
              <h2 className="site00-project-command__section-title">IDENTITY TERRITORIES ({territories.length})</h2>
              {territories.length ? (
                <ul className="site00-project-command__command-list">
                  {territories.map((t) => (
                    <li key={t.id}>
                      <span className="site00-project-command__command-cat">{t.status}</span>
                      <strong>{t.working_label}</strong>
                      <span>{t.strategic_premise}</span>
                      <div>
                        <button type="button" className="site00-btn" onClick={() => void submitJudgment(t.id, 'SELECT')}>
                          SELECT
                        </button>{' '}
                        <button type="button" className="site00-btn" onClick={() => void submitJudgment(t.id, 'REVISE')}>
                          REVISE
                        </button>{' '}
                        <button type="button" className="site00-btn" onClick={() => void submitJudgment(t.id, 'REJECT')}>
                          REJECT
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="site00-body">No territories yet. Enter Identity phase to generate exploration directions.</p>
              )}
            </section>

            {bible ? (
              <section className="site00-project-command__section">
                <h2 className="site00-project-command__section-title">PROJECT BIBLE (COMPILED VIEW)</h2>
                <p className="site00-project-command__note">
                  World formation: {(bible as { worldFormationState?: string }).worldFormationState ?? 'NOT_FORMED'}
                </p>
              </section>
            ) : null}

            {error ? <p className="site00-label-red">{error}</p> : null}
          </>
        )}
      </div>
    </EcosystemShell>
  );
}
