import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminTable } from '../../components/operations/AdminTable';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';

type DiscoveryRow = {
  id: string;
  contact_name: string;
  email: string;
  build_class?: string;
  status: string;
  scheduled_at: string;
  owner_email?: string;
};

const STATUS_TABS = [
  { value: 'UPCOMING', label: 'UPCOMING' },
  { value: 'COMPLETED', label: 'COMPLETED' },
] as const;

function formatDateTime(iso: string) {
  return new Date(iso)
    .toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    .toUpperCase();
}

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? 'UPCOMING';
  const [items, setItems] = useState<DiscoveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    site00ProductionApi
      .discovery(status)
      .then((data) => setItems((data.items ?? []) as DiscoveryRow[]))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD DISCOVERY'))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ DISCOVERY ]</h1>
          <p className="site00-admin-page-subtitle">SCHEDULED DISCOVERY CALLS.</p>
        </div>
        <div className="site00-admin-period">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={status === tab.value ? 'active' : undefined}
              onClick={() => setSearchParams({ status: tab.value })}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading discovery" />
      ) : (
        <section className="site00-admin-panel">
          <AdminTable
            rows={items}
            emptyMessage={`NO ${status} DISCOVERY BOOKINGS.`}
            onRowClick={(row) => navigate(SITE00_ADMIN_ROUTES.discoveryBooking(row.id))}
            columns={[
              { key: 'contact', header: 'CONTACT', render: (row) => row.contact_name },
              { key: 'email', header: 'EMAIL', render: (row) => row.email, hideMobile: true },
              { key: 'build', header: 'BUILD CLASS', render: (row) => row.build_class ?? '—', hideMobile: true },
              {
                key: 'status',
                header: 'STATUS',
                render: (row) => <AdminStatusBadge status={row.status} />,
              },
              { key: 'scheduled', header: 'SCHEDULED', render: (row) => formatDateTime(row.scheduled_at) },
              { key: 'owner', header: 'OWNER', render: (row) => row.owner_email ?? '—', hideMobile: true },
            ]}
          />
        </section>
      )}
    </Site00AdminShell>
  );
}
