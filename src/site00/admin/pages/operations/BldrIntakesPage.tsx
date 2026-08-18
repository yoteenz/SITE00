import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminTable } from '../../components/operations/AdminTable';
import { AdminStatusBadge } from '../../components/operations/AdminStatusBadge';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';
import type { AdminBldrIntake } from '../../types/operations';

const BUILD_CLASSES = ['', 'SITE', 'WORLD', 'BRAND', 'SYSTEM'] as const;

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export default function BldrIntakesPage() {
  const navigate = useNavigate();
  const [buildClass, setBuildClass] = useState('');
  const [items, setItems] = useState<AdminBldrIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    site00ProductionApi
      .bldrIntakes({ buildClass: buildClass || undefined })
      .then((data) => setItems((data.items ?? []) as AdminBldrIntake[]))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD INTAKES'))
      .finally(() => setLoading(false));
  }, [buildClass]);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ BLDR INTAKES ]</h1>
          <p className="site00-admin-page-subtitle">BUILD REQUESTS FROM THE BLDR FLOW.</p>
        </div>
        <div className="site00-admin-period">
          {BUILD_CLASSES.map((bc) => (
            <button
              key={bc || 'all'}
              type="button"
              className={buildClass === bc ? 'active' : undefined}
              onClick={() => setBuildClass(bc)}
            >
              {bc || 'ALL'}
            </button>
          ))}
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading intakes" />
      ) : (
        <section className="site00-admin-panel">
          <AdminTable
            rows={items}
            emptyMessage="NO BLDR INTAKES FOUND."
            onRowClick={(row) => navigate(SITE00_ADMIN_ROUTES.bldrIntake(row.id))}
            columns={[
              {
                key: 'client',
                header: 'CLIENT',
                render: (row) =>
                  row.site00_identities?.display_name ?? row.site00_identities?.email ?? row.email ?? '—',
              },
              { key: 'build_class', header: 'BUILD CLASS', render: (row) => row.build_class },
              { key: 'type', header: 'TYPE', render: (row) => row.primary_type ?? '—', hideMobile: true },
              {
                key: 'status',
                header: 'STATUS',
                render: (row) => <AdminStatusBadge status={row.status} />,
              },
              { key: 'budget', header: 'BUDGET', render: (row) => row.budget_range ?? '—', hideMobile: true },
              { key: 'timeline', header: 'TIMELINE', render: (row) => row.timeline ?? '—', hideMobile: true },
              {
                key: 'submitted',
                header: 'SUBMITTED',
                render: (row) => formatDate(row.submitted_at ?? undefined),
                hideMobile: true,
              },
            ]}
          />
        </section>
      )}
    </Site00AdminShell>
  );
}
