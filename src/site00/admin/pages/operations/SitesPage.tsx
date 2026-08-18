import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminTable } from '../../components/operations/AdminTable';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminSite } from '../../types/operations';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export default function SitesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') ?? '';
  const issuesOnly = filter === 'issues';
  const [items, setItems] = useState<AdminSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    site00ProductionApi
      .sites({ filter: issuesOnly ? 'issues' : undefined })
      .then((data) => setItems((data.items ?? []) as AdminSite[]))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD SITES'))
      .finally(() => setLoading(false));
  }, [issuesOnly]);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ SITES ]</h1>
          <p className="site00-admin-page-subtitle">
            {issuesOnly ? 'SITES WITH HEALTH ISSUES.' : 'DEPLOYED AND IN-BUILD PROPERTIES.'}
          </p>
        </div>
        {issuesOnly ? (
          <button type="button" className="site00-admin-btn" onClick={() => navigate(SITE00_ADMIN_ROUTES.sites)}>
            SHOW ALL SITES
          </button>
        ) : (
          <button
            type="button"
            className="site00-admin-btn"
            onClick={() => navigate(`${SITE00_ADMIN_ROUTES.sites}?filter=issues`)}
          >
            SHOW ISSUES ONLY
          </button>
        )}
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading sites" />
      ) : (
        <section className="site00-admin-panel">
          <AdminTable
            rows={items}
            emptyMessage={issuesOnly ? 'NO SITE ISSUES FOUND.' : 'NO SITES FOUND.'}
            onRowClick={(row) => navigate(SITE00_ADMIN_ROUTES.site(row.id))}
            columns={[
              { key: 'name', header: 'SITE', render: (row) => row.name },
              { key: 'domain', header: 'DOMAIN', render: (row) => row.domain ?? '—', hideMobile: true },
              {
                key: 'status',
                header: 'STATUS',
                render: (row) => <AdminStatusBadge status={row.status} />,
              },
              {
                key: 'health',
                header: 'HEALTH',
                render: (row) => (
                  <AdminStatusBadge status={row.health} tone={row.health === 'OK' ? 'green' : 'red'} />
                ),
              },
              {
                key: 'project',
                header: 'PROJECT',
                render: (row) => row.site00_projects?.name ?? '—',
                hideMobile: true,
              },
              {
                key: 'deploy',
                header: 'LAST DEPLOY',
                render: (row) => formatDate(row.last_deploy_at ?? undefined),
                hideMobile: true,
              },
            ]}
          />
        </section>
      )}
    </Site00AdminShell>
  );
}
