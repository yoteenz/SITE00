import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminKpiCard } from '../components/operations/AdminKpiCard';
import { AdminStatusBadge } from '../components/operations/AdminStatusBadge';
import { EcosystemMap } from '../components/operations/EcosystemMap';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import { site00ProductionApi } from '../services/productionApi';
import type { AdminActivityItem, AdminDashboardPayload, AdminPeriod, AdminProjectRow } from '../types/operations';

const PERIODS: { value: AdminPeriod; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: 'all', label: 'ALL' },
];

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}H AGO`;
  return `${Math.floor(hrs / 24)}D AGO`;
}

export default function Site00AdminDashboardPage() {
  const [period, setPeriod] = useState<AdminPeriod>('30d');
  const [data, setData] = useState<AdminDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('ADMIN');

  useEffect(() => {
    import('../../../utils/supabase').then(({ getSupabase }) => {
      const supabase = getSupabase();
      if (!supabase) return;
      void supabase.auth.getUser().then(({ data: authData }) => {
        const u = authData.user;
        if (!u?.email) return;
        const local = u.user_metadata?.full_name as string | undefined;
        setAdminName((local ?? u.email.split('@')[0]?.replace(/\./g, ' ')).toUpperCase());
      });
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    site00ProductionApi
      .dashboard(period)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD DASHBOARD'))
      .finally(() => setLoading(false));
  }, [period]);

  const approvalMatch = data?.signals.find((s) => s.type === 'APPROVAL')?.title.match(/^(\d+)/);
  const approvalBadge = approvalMatch ? Number(approvalMatch[1]) : undefined;

  return (
    <Site00AdminShell approvalBadge={approvalBadge}>
      <header className="site00-admin-dashboard-head">
        <div>
          <h1 className="site00-admin-page-title">WELCOME BACK, {adminName}.</h1>
          <p className="site00-admin-page-subtitle">HERE&apos;S WHAT&apos;S HAPPENING ACROSS YOUR ECOSYSTEM.</p>
        </div>
        <div className="site00-admin-period" role="tablist" aria-label="Dashboard period">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="tab"
              aria-selected={period === p.value}
              className={period === p.value ? 'active' : undefined}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading dashboard" />
      ) : data ? (
        <>
          <section className="site00-admin-kpi-row">
            <AdminKpiCard label="IDENTITIES" value={data.kpis.identities.total} deltaLabel={`+${data.kpis.identities.newInPeriod} IN PERIOD`} href={SITE00_ADMIN_ROUTES.identities} />
            <AdminKpiCard label="BLDR INTAKES" value={data.kpis.intakes.total} deltaLabel={`${data.kpis.intakes.pendingReview} PENDING REVIEW`} href={SITE00_ADMIN_ROUTES.bldrIntakes} />
            <AdminKpiCard label="LEADS" value={data.kpis.leads.total} deltaLabel={`+${data.kpis.leads.newInPeriod} IN PERIOD`} href={SITE00_ADMIN_ROUTES.leads} />
            <AdminKpiCard label="ACTIVE PROJECTS" value={data.kpis.projects.active} href={SITE00_ADMIN_ROUTES.projects} />
            <AdminKpiCard label="LIVE SITES" value={data.kpis.sites.live} href={`${SITE00_ADMIN_ROUTES.sites}?filter=live`} />
            <AdminKpiCard label="REVENUE PAID" value={formatCurrency(data.kpis.revenue.paid)} href={SITE00_ADMIN_ROUTES.finance} />
          </section>

          <div className="site00-admin-dashboard-grid">
            <section className="site00-admin-panel site00-admin-panel--wide">
              <h2 className="site00-admin-panel__title">ECOSYSTEM MAP</h2>
              <EcosystemMap nodes={data.ecosystem.nodes} edges={data.ecosystem.edges} />
            </section>

            <section className="site00-admin-panel">
              <h2 className="site00-admin-panel__title">
                <Link to={SITE00_ADMIN_ROUTES.activity}>ACTIVITY →</Link>
              </h2>
              {data.activity.length === 0 ? (
                <p className="site00-admin-empty">NO RECENT ACTIVITY.</p>
              ) : (
                <ul className="site00-admin-activity-list">
                  {data.activity.map((item: AdminActivityItem) => (
                    <li key={item.id} className="site00-admin-activity-list__item">
                      <div>
                        <p className="site00-admin-activity-list__summary">{item.summary}</p>
                        {item.entity_label ? (
                          <p className="site00-admin-activity-list__entity">{item.entity_label}</p>
                        ) : null}
                      </div>
                      <time dateTime={item.created_at}>{timeAgo(item.created_at)}</time>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="site00-admin-panel">
              <h2 className="site00-admin-panel__title">
                <Link to={SITE00_ADMIN_ROUTES.ctrlRoom}>SIGNALS →</Link>
              </h2>
              {data.signals.length === 0 ? (
                <p className="site00-admin-empty">NO ATTENTION SIGNALS.</p>
              ) : (
                <ul className="site00-admin-signals">
                  {data.signals.map((signal) => (
                    <li key={signal.id} className="site00-admin-signals__item">
                      <p className="site00-admin-signals__type">{signal.type}</p>
                      {signal.href ? (
                        <Link to={signal.href} className="site00-admin-signals__title">
                          {signal.title}
                        </Link>
                      ) : (
                        <p className="site00-admin-signals__title">{signal.title}</p>
                      )}
                      {signal.priority ? <AdminStatusBadge status={signal.priority} tone="red" /> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="site00-admin-panel">
              <h2 className="site00-admin-panel__title">
                <Link to={SITE00_ADMIN_ROUTES.reportsPipeline}>PIPELINE →</Link>
              </h2>
              <div className="site00-admin-pipeline-flow site00-admin-pipeline-flow--compact">
                {[
                  { key: 'identities', label: 'IDENTITIES', href: SITE00_ADMIN_ROUTES.identities },
                  { key: 'intakes', label: 'INTAKES', href: SITE00_ADMIN_ROUTES.bldrIntakes },
                  { key: 'projects', label: 'PROJECTS', href: SITE00_ADMIN_ROUTES.projects },
                  { key: 'sites', label: 'SITES', href: SITE00_ADMIN_ROUTES.sites },
                  { key: 'live', label: 'LIVE', href: `${SITE00_ADMIN_ROUTES.sites}?filter=live` },
                ].map((step, i, arr) => (
                  <div key={step.key} className="site00-admin-pipeline-flow__step">
                    <Link to={step.href} className="site00-admin-pipeline-flow__label">
                      {step.label}
                    </Link>
                    <p className="site00-admin-pipeline-flow__count">
                      {data.pipeline[step.key as keyof typeof data.pipeline]}
                    </p>
                    {i < arr.length - 1 ? <span className="site00-admin-pipeline-flow__arrow" aria-hidden="true">→</span> : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="site00-admin-panel site00-admin-panel--wide">
              <h2 className="site00-admin-panel__title">
                <Link to={SITE00_ADMIN_ROUTES.projects}>TOP PROJECTS →</Link>
              </h2>
              {data.topProjects.length === 0 ? (
                <p className="site00-admin-empty">NO ACTIVE PROJECTS.</p>
              ) : (
                <ul className="site00-admin-activity-list">
                  {data.topProjects.map((project: AdminProjectRow) => (
                    <li key={project.id} className="site00-admin-activity-list__item">
                      <div>
                        <Link to={SITE00_ADMIN_ROUTES.project(project.id)} className="site00-admin-activity-list__summary">
                          {project.name}
                        </Link>
                        <p className="site00-admin-activity-list__entity">
                          {project.current_phase} · {project.production_readiness_pct ?? 0}% PRODUCTION
                        </p>
                      </div>
                      <AdminStatusBadge status={project.project_health} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      ) : null}
    </Site00AdminShell>
  );
}
