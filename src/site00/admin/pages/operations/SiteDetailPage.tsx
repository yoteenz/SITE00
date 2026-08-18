import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

type SiteDetail = {
  site: Record<string, unknown> & {
    id: string;
    name: string;
    domain?: string;
    status: string;
    health: string;
    owner_email?: string;
    last_deploy_at?: string;
    site00_projects?: { id: string; name: string; slug: string; client_email?: string } | null;
    site00_identities?: { id: string; display_name?: string; email: string } | null;
  };
};

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    site00ProductionApi
      .site(id)
      .then((payload) => setData(payload as unknown as SiteDetail))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD SITE'))
      .finally(() => setLoading(false));
  }, [id]);

  const site = data?.site;
  const project = site?.site00_projects;
  const identity = site?.site00_identities;

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.sites}>
            ← BACK TO SITES
          </Link>
          <h1 className="site00-admin-page-title">{loading ? '[ SITE ]' : `[ ${site?.name ?? 'SITE'} ]`}</h1>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading site" />
      ) : site ? (
        <div className="site00-admin-dashboard-grid">
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">OVERVIEW</h2>
            <dl className="site00-admin-dl">
              <dt>DOMAIN</dt>
              <dd>{site.domain ?? '—'}</dd>
              <dt>STATUS</dt>
              <dd>
                <AdminStatusBadge status={site.status} />
              </dd>
              <dt>HEALTH</dt>
              <dd>
                <AdminStatusBadge status={site.health} tone={site.health === 'OK' ? 'green' : 'red'} />
              </dd>
              <dt>OWNER EMAIL</dt>
              <dd>{site.owner_email ?? '—'}</dd>
              <dt>LAST DEPLOY</dt>
              <dd>{formatDate(site.last_deploy_at)}</dd>
            </dl>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">PROJECT</h2>
            {project ? (
              <dl className="site00-admin-dl">
                <dt>NAME</dt>
                <dd>
                  <Link to={SITE00_ADMIN_ROUTES.project(project.id)}>{project.name}</Link>
                </dd>
                <dt>SLUG</dt>
                <dd>{project.slug}</dd>
                {project.client_email ? (
                  <>
                    <dt>CLIENT EMAIL</dt>
                    <dd>{project.client_email}</dd>
                  </>
                ) : null}
              </dl>
            ) : (
              <p className="site00-admin-empty">NO LINKED PROJECT.</p>
            )}
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">CLIENT</h2>
            {identity ? (
              <dl className="site00-admin-dl">
                <dt>IDENTITY</dt>
                <dd>
                  <Link to={SITE00_ADMIN_ROUTES.identity(identity.id)}>
                    {identity.display_name ?? identity.email}
                  </Link>
                </dd>
                <dt>EMAIL</dt>
                <dd>{identity.email}</dd>
              </dl>
            ) : (
              <p className="site00-admin-empty">NO LINKED CLIENT IDENTITY.</p>
            )}
          </section>
        </div>
      ) : null}
    </Site00AdminShell>
  );
}
