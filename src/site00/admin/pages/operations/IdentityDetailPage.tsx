import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminIdentity } from '../../types/operations';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

type DetailPayload = {
  identity: AdminIdentity;
  intakes: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  sites: Array<Record<string, unknown>>;
  submissions: Array<Record<string, unknown>>;
  notes: Array<Record<string, unknown>>;
};

export default function IdentityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    site00ProductionApi
      .identity(id)
      .then((payload) => setData(payload as unknown as DetailPayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD IDENTITY'))
      .finally(() => setLoading(false));
  }, [id]);

  const identity = data?.identity;

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.identities}>
            ← BACK TO IDENTITIES
          </Link>
          <h1 className="site00-admin-page-title">
            {loading ? '[ IDENTITY ]' : `[ ${identity?.display_name ?? identity?.email ?? 'IDENTITY'} ]`}
          </h1>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading identity" />
      ) : identity ? (
        <div className="site00-admin-dashboard-grid">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">PROFILE</h2>
            <dl className="site00-admin-dl">
              <dt>EMAIL</dt>
              <dd>{identity.email}</dd>
              <dt>DISPLAY NAME</dt>
              <dd>{identity.display_name ?? '—'}</dd>
              <dt>IDNTY STATE</dt>
              <dd>{identity.idnty_state ?? '—'}</dd>
              <dt>ACCOUNT STATUS</dt>
              <dd>
                <AdminStatusBadge status={identity.account_status} />
              </dd>
              <dt>ONBOARDING</dt>
              <dd>
                <AdminStatusBadge status={identity.onboarding_status} />
              </dd>
              <dt>CLIENT</dt>
              <dd>{identity.is_client ? 'YES' : 'NO'}</dd>
              <dt>CREATED</dt>
              <dd>{formatDate(identity.created_at)}</dd>
              {identity.last_active_at ? (
                <>
                  <dt>LAST ACTIVE</dt>
                  <dd>{formatDate(identity.last_active_at)}</dd>
                </>
              ) : null}
            </dl>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">IDNTY SUBMISSIONS</h2>
            {(data?.submissions ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO IDNTY SUBMISSIONS.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.submissions ?? []).map((s) => (
                  <li key={String(s.id)} className="site00-admin-activity-list__item">
                    <div>
                      <p className="site00-admin-activity-list__summary">{String(s.identity_state ?? 'SUBMISSION')}</p>
                      <p className="site00-admin-activity-list__entity">
                        <AdminStatusBadge status={String(s.status ?? 'DRAFT')} />
                      </p>
                    </div>
                    {s.completed_at ? <time dateTime={String(s.completed_at)}>{formatDate(String(s.completed_at))}</time> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">BLDR INTAKES</h2>
            {(data?.intakes ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO BLDR INTAKES.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.intakes ?? []).map((intake) => (
                  <li key={String(intake.id)} className="site00-admin-activity-list__item">
                    <Link to={SITE00_ADMIN_ROUTES.bldrIntake(String(intake.id))}>
                      {String(intake.build_class)} — {String(intake.primary_type ?? 'INTAKE')}
                    </Link>
                    <AdminStatusBadge status={String(intake.status ?? 'NEW')} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">PROJECTS</h2>
            {(data?.projects ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO PROJECTS.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.projects ?? []).map((project) => (
                  <li key={String(project.id)} className="site00-admin-activity-list__item">
                    <Link to={SITE00_ADMIN_ROUTES.project(String(project.id))}>{String(project.name)}</Link>
                    <AdminStatusBadge status={String(project.current_phase ?? 'DISCOVERY')} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">SITES</h2>
            {(data?.sites ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO SITES.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.sites ?? []).map((site) => (
                  <li key={String(site.id)} className="site00-admin-activity-list__item">
                    <Link to={SITE00_ADMIN_ROUTES.site(String(site.id))}>{String(site.name)}</Link>
                    <AdminStatusBadge status={String(site.status ?? 'DRAFT')} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">NOTES</h2>
            {(data?.notes ?? []).length === 0 ? (
              <p className="site00-admin-empty">NO ADMIN NOTES.</p>
            ) : (
              <ul className="site00-admin-activity-list">
                {(data?.notes ?? []).map((note) => (
                  <li key={String(note.id)} className="site00-admin-activity-list__item">
                    <div>
                      <p className="site00-admin-activity-list__summary">{String(note.body)}</p>
                      <p className="site00-admin-activity-list__entity">{String(note.author_email ?? 'ADMIN')}</p>
                    </div>
                    {note.created_at ? <time dateTime={String(note.created_at)}>{formatDate(String(note.created_at))}</time> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </Site00AdminShell>
  );
}
