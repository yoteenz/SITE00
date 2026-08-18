import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { AdminKpiCard } from '../../components/operations/AdminKpiCard';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

type ReportsPayload = {
  pipeline: {
    identities: number;
    intakes: number;
    projects: number;
    sites: number;
    live: number;
  };
  kpis: {
    identities: { total: number; newInPeriod: number };
    intakes: { total: number; newInPeriod: number };
    projects: { total: number; newInPeriod: number };
    sites: { total: number; newInPeriod: number };
    revenue: { paid: number; outstanding: number };
  };
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .reportsPipeline()
      .then((payload) => setData(payload as unknown as ReportsPayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD REPORTS'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">[ REPORTS ]</h1>
          <p className="site00-admin-page-subtitle">ECOSYSTEM KPIs AND PIPELINE INSIGHTS.</p>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading reports" />
      ) : data ? (
        <>
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">REPORTS</h2>
            <ul className="site00-admin-activity-list">
              <li className="site00-admin-activity-list__item">
                <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.reportsPipeline}>
                  PIPELINE REPORT →
                </Link>
              </li>
              <li className="site00-admin-activity-list__item">
                <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.activity}>
                  ACTIVITY FEED →
                </Link>
              </li>
            </ul>
          </section>

          <section className="site00-admin-kpi-row">
            <AdminKpiCard label="IDENTITIES" value={data.kpis.identities.total} />
            <AdminKpiCard label="BLDR INTAKES" value={data.kpis.intakes.total} />
            <AdminKpiCard label="PROJECTS" value={data.kpis.projects.total} />
            <AdminKpiCard label="SITES" value={data.kpis.sites.total} />
            <AdminKpiCard label="LIVE SITES" value={data.pipeline.live} />
            <AdminKpiCard label="REVENUE PAID" value={formatCurrency(data.kpis.revenue.paid)} />
            <AdminKpiCard
              label="OUTSTANDING"
              value={formatCurrency(data.kpis.revenue.outstanding)}
              deltaLabel={data.kpis.revenue.outstanding > 0 ? 'OPEN INVOICES' : undefined}
            />
          </section>
        </>
      ) : null}
    </Site00AdminShell>
  );
}
