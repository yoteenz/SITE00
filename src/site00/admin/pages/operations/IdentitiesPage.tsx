import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminTable } from '../../components/operations/AdminTable';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { AdminKpiCard } from '../../components/operations/AdminKpiCard';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminIdentity } from '../../types/operations';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export default function IdentitiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState<AdminIdentity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    site00ProductionApi
      .identities({ search: debouncedSearch || undefined })
      .then((data) => {
        setItems((data.items ?? []) as AdminIdentity[]);
        setTotal(data.total ?? 0);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD IDENTITIES'))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  const clients = items.filter((i) => i.is_client).length;

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ IDENTITIES ]</h1>
          <p className="site00-admin-page-subtitle">ECOSYSTEM MEMBERS AND ONBOARDING STATE.</p>
        </div>
        <input
          type="search"
          className="site00-admin-search-input"
          placeholder="SEARCH BY EMAIL OR NAME…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search identities"
        />
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading identities" />
      ) : (
        <>
          <section className="site00-admin-kpi-row">
            <AdminKpiCard label="TOTAL IDENTITIES" value={total} />
            <AdminKpiCard label="IN LIST" value={items.length} />
            <AdminKpiCard label="CLIENTS" value={clients} />
          </section>

          <section className="site00-admin-panel">
            <AdminTable
              rows={items}
              emptyMessage="NO IDENTITIES FOUND."
              onRowClick={(row) => navigate(SITE00_ADMIN_ROUTES.identity(row.id))}
              columns={[
                {
                  key: 'identity',
                  header: 'IDENTITY',
                  render: (row) => row.display_name ?? row.email.split('@')[0].toUpperCase(),
                },
                { key: 'email', header: 'EMAIL', render: (row) => row.email, hideMobile: true },
                {
                  key: 'idnty_state',
                  header: 'IDNTY STATE',
                  render: (row) => row.idnty_state ?? '—',
                  hideMobile: true,
                },
                {
                  key: 'onboarding',
                  header: 'ONBOARDING',
                  render: (row) => <AdminStatusBadge status={row.onboarding_status} />,
                },
                {
                  key: 'created',
                  header: 'CREATED',
                  render: (row) => formatDate(row.created_at),
                  hideMobile: true,
                },
              ]}
            />
          </section>
        </>
      )}
    </Site00AdminShell>
  );
}
