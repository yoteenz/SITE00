import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState } from '../components/pages/Site00PagePrimitives';
import { useProjectOrigin } from '../hooks/useProjectOrigin';
import { SITE00_ROUTES, site00ProjectPath } from '../config/routes';
import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import '../styles/site00-projects.css';

function StatusBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="site00-project-command__row">
      <span className="site00-project-command__label">{label}</span>
      <span className="site00-project-command__value">{value}</span>
    </div>
  );
}

export default function ProjectOriginPage() {
  const { projectSlug = '' } = useParams();
  const { state, error, health, records, summary, ingesting, runIngestion } = useProjectOrigin(projectSlug);

  if (!hasProjectCapability(projectSlug, 'ORIGIN_INGESTION')) {
    return (
      <EcosystemShell hidePageHeader>
        <EmptyState title="ORIGIN UNAVAILABLE" body="This project does not have Origin ingestion capability." />
      </EcosystemShell>
    );
  }

  const unresolved = records.filter((r) => r.payload.category === 'UNRESOLVED_DECISIONS');

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-page site00-page--project-origin">
        <nav className="site00-project-command__back">
          <Link to={site00ProjectPath(projectSlug)}>← {projectSlug.toUpperCase()}</Link>
          <Link to={SITE00_ROUTES.projects}> · PROJECTS</Link>
        </nav>

        <header className="site00-project-command__header">
          <p className="site00-label-red">ORIGIN · CLIENT TRUTH</p>
          <h1 className="site00-project-command__title">{projectSlug === 'astral-world' ? 'Astral World' : projectSlug} Origin</h1>
          <p className="site00-body">
            Client-supplied source truth only. Nothing here is brand canon, world canon, or visual canon until explicitly promoted in a later phase.
          </p>
        </header>

        {state === 'loading' ? (
          <p className="site00-body">LOADING ORIGIN…</p>
        ) : state === 'error' ? (
          <EmptyState title="ORIGIN ERROR" body={error ?? 'Could not load origin data.'} />
        ) : (
          <>
            <section className="site00-project-command__section">
              <h2 className="site00-project-command__section-title">INGESTION STATUS</h2>
              {health ? (
                <>
                  <StatusBadge label="PROJECT STATUS" value={health.projectStatus} />
                  <StatusBadge label="ORIGIN STATUS" value={health.originStatus} />
                  <StatusBadge label="CLIENT TRUTH RECORDS" value={health.clientTruthRecordCount} />
                  <StatusBadge label="SOURCE REFERENCES" value={health.sourceReferenceCount} />
                  <StatusBadge label="UNRESOLVED DECISIONS" value={health.unresolvedDecisionCount} />
                  <StatusBadge label="CANON FROM ORIGIN" value={health.canonRecordCountCreatedByOrigin} />
                  <StatusBadge label="CROSS-PROJECT LEAKS" value={health.crossProjectLeakCount} />
                </>
              ) : null}
              {health?.projectStatus === 'PRE_INGESTION' ? (
                <button
                  type="button"
                  className="site00-btn site00-btn--primary site00-project-command__cta"
                  disabled={ingesting}
                  onClick={() => void runIngestion()}
                >
                  {ingesting ? 'INGESTING…' : 'RUN ORIGIN INGESTION →'}
                </button>
              ) : (
                <p className="site00-project-command__note">Origin ingestion complete — source records preserved below.</p>
              )}
              {error ? <p className="site00-label-red">{error}</p> : null}
            </section>

            {summary ? (
              <section className="site00-project-command__section">
                <h2 className="site00-project-command__section-title">ORIGIN SUMMARY (DERIVED · NON-CANONICAL)</h2>
                <p className="site00-project-command__note">{summary.summary.note}</p>
                <StatusBadge label="SOURCE RECORDS" value={summary.summary.clientTruthCount} />
                <StatusBadge label="UNRESOLVED" value={summary.summary.unresolvedCount} />
                <StatusBadge label="IS CANONICAL" value={summary.is_canonical ? 'YES' : 'NO'} />
              </section>
            ) : null}

            <section className="site00-project-command__section">
              <h2 className="site00-project-command__section-title">UNRESOLVED DECISIONS</h2>
              {unresolved.length ? (
                <ul className="site00-project-command__command-list">
                  {unresolved.map((r) => (
                    <li key={r.id}>
                      <strong>{r.title}</strong>
                      <span>{typeof r.payload.content === 'string' ? r.payload.content : JSON.stringify(r.payload.content)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="site00-body">No unresolved decisions captured yet.</p>
              )}
            </section>

            <section className="site00-project-command__section">
              <h2 className="site00-project-command__section-title">CLIENT TRUTH RECORDS</h2>
              {records.length ? (
                <ul className="site00-project-command__activity">
                  {records.map((r) => (
                    <li key={r.id}>
                      <span className="site00-project-command__command-cat">{String(r.payload.category ?? '—')}</span>
                      <strong>{r.title ?? 'Untitled'}</strong>
                      <span>{r.status} · {r.source ?? 'unknown source'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="site00-body">No client truth records yet. Run ingestion to seed Astral World source material.</p>
              )}
            </section>
          </>
        )}
      </div>
    </EcosystemShell>
  );
}
