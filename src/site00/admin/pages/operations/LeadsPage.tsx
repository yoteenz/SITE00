import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminTable } from '../../components/operations/AdminTable';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminLead } from '../../types/operations';

const STATUS_FILTERS = ['', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

function formatCurrency(n?: number) {
  if (n == null) return '—';
  return `$${n.toLocaleString()}`;
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const [items, setItems] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    site00ProductionApi
      .leads({ status: status || undefined })
      .then((data) => setItems((data.items ?? []) as AdminLead[]))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD LEADS'))
      .finally(() => setLoading(false));
  }, [status]);

  const setStatus = (next: string) => {
    if (next) setSearchParams({ status: next });
    else setSearchParams({});
  };

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ LEADS ]</h1>
          <p className="site00-admin-page-subtitle">INBOUND PROSPECTS AND PIPELINE ENTRIES.</p>
        </div>
        <div className="site00-admin-period">
          {STATUS_FILTERS.map((s) => (
            <button key={s || 'all'} type="button" className={status === s ? 'active' : undefined} onClick={() => setStatus(s)}>
              {s || 'ALL'}
            </button>
          ))}
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading leads" />
      ) : (
        <section className="site00-admin-panel">
          <AdminTable
            rows={items}
            emptyMessage="NO LEADS FOUND."
            onRowClick={(row) => navigate(SITE00_ADMIN_ROUTES.lead(row.id))}
            columns={[
              { key: 'contact', header: 'CONTACT', render: (row) => row.contact_name },
              { key: 'email', header: 'EMAIL', render: (row) => row.email, hideMobile: true },
              { key: 'source', header: 'SOURCE', render: (row) => row.source, hideMobile: true },
              {
                key: 'status',
                header: 'STATUS',
                render: (row) => <AdminStatusBadge status={row.status} />,
              },
              { key: 'build', header: 'BUILD CLASS', render: (row) => row.build_class ?? '—', hideMobile: true },
              { key: 'value', header: 'EST. VALUE', render: (row) => formatCurrency(row.estimated_value ?? undefined), hideMobile: true },
              { key: 'created', header: 'CREATED', render: (row) => formatDate(row.created_at), hideMobile: true },
            ]}
          />
        </section>
      )}
    </Site00AdminShell>
  );
}
