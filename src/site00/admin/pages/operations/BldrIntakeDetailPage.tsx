import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

type IntakeDetail = {
  intake: Record<string, unknown> & {
    id: string;
    build_class: string;
    primary_type?: string;
    status: string;
    budget_range?: string;
    timeline?: string;
    email?: string;
    audience?: string;
    answers?: Record<string, unknown>;
    project_id?: string;
    submitted_at?: string;
    site00_identities?: { id?: string; display_name?: string; email?: string };
    site00_projects?: { id: string; name: string; slug: string } | null;
  };
  idntySubmission: Record<string, unknown> | null;
  notes: Array<Record<string, unknown>>;
};

export default function BldrIntakeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<IntakeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    site00ProductionApi
      .bldrIntake(id)
      .then((payload) => setData(payload as unknown as IntakeDetail))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD INTAKE'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const intake = data?.intake;
  const project = intake?.site00_projects;
  const identity = intake?.site00_identities;

  const handleMarkReviewed = () => {
    if (!id) return;
    setActionLoading('review');
    site00ProductionApi
      .markIntakeReviewed(id)
      .then(load)
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO MARK REVIEWED'))
      .finally(() => setActionLoading(null));
  };

  const handleConvert = () => {
    if (!id) return;
    setActionLoading('convert');
    site00ProductionApi
      .convertIntakeToProject(id)
      .then((result) => {
        load();
        if (result.projectId) navigate(SITE00_ADMIN_ROUTES.project(result.projectId));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO CONVERT'))
      .finally(() => setActionLoading(null));
  };

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.bldrIntakes}>
            ← BACK TO BLDR INTAKES
          </Link>
          <h1 className="site00-admin-page-title">
            {loading ? '[ BLDR INTAKE ]' : `[ ${intake?.build_class ?? 'INTAKE'} — ${intake?.primary_type ?? 'DETAIL'} ]`}
          </h1>
        </div>
        {intake ? (
          <div className="site00-admin-period">
            <button type="button" disabled={actionLoading !== null} onClick={handleMarkReviewed}>
              {actionLoading === 'review' ? 'MARKING…' : 'MARK REVIEWED'}
            </button>
            <button type="button" disabled={actionLoading !== null} onClick={handleConvert}>
              {actionLoading === 'convert' ? 'CONVERTING…' : 'CONVERT TO PROJECT'}
            </button>
          </div>
        ) : null}
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading intake" />
      ) : intake ? (
        <div className="site00-admin-dashboard-grid">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">INTAKE SUMMARY</h2>
            <dl className="site00-admin-dl">
              <dt>STATUS</dt>
              <dd>
                <AdminStatusBadge status={intake.status} />
              </dd>
              <dt>BUILD CLASS</dt>
              <dd>{intake.build_class}</dd>
              <dt>TYPE</dt>
              <dd>{intake.primary_type ?? '—'}</dd>
              <dt>AUDIENCE</dt>
              <dd>{intake.audience ?? '—'}</dd>
              <dt>BUDGET</dt>
              <dd>{intake.budget_range ?? '—'}</dd>
              <dt>TIMELINE</dt>
              <dd>{intake.timeline ?? '—'}</dd>
              <dt>EMAIL</dt>
              <dd>{intake.email ?? '—'}</dd>
              <dt>SUBMITTED</dt>
              <dd>{formatDate(intake.submitted_at)}</dd>
              {project ? (
                <>
                  <dt>PROJECT</dt>
                  <dd>
                    <Link to={SITE00_ADMIN_ROUTES.project(project.id)}>{project.name}</Link>
                  </dd>
                </>
              ) : null}
            </dl>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">ANSWERS</h2>
            {intake.answers ? (
              <pre className="site00-admin-code">{JSON.stringify(intake.answers, null, 2)}</pre>
            ) : (
              <p className="site00-admin-empty">NO ANSWERS RECORDED.</p>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">IDNTY CONTEXT</h2>
            {identity?.id ? (
              <dl className="site00-admin-dl">
                <dt>IDENTITY</dt>
                <dd>
                  <Link to={SITE00_ADMIN_ROUTES.identity(String(identity.id))}>
                    {identity.display_name ?? identity.email}
                  </Link>
                </dd>
              </dl>
            ) : (
              <p className="site00-admin-empty">NO LINKED IDENTITY.</p>
            )}
            {data?.idntySubmission ? (
              <>
                <h3 className="site00-admin-panel__subtitle">LATEST IDNTY SUBMISSION</h3>
                <pre className="site00-admin-code">{JSON.stringify(data.idntySubmission, null, 2)}</pre>
              </>
            ) : null}
          </section>

          {(data?.notes ?? []).length > 0 ? (
            <section className="site00-admin-panel">
              <h2 className="site00-admin-panel__title">NOTES</h2>
              <ul className="site00-admin-activity-list">
                {(data?.notes ?? []).map((note) => (
                  <li key={String(note.id)} className="site00-admin-activity-list__item">
                    <p className="site00-admin-activity-list__summary">{String(note.body)}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </Site00AdminShell>
  );
}
