import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { site00ProductionApi } from '../../services/productionApi';

type PipelinePayload = {
  pipeline: {
    identities: number;
    intakes: number;
    projects: number;
    sites: number;
    live: number;
    movement?: {
      identities: number;
      intakes: number;
      projects: number;
      sites: number;
      live: number;
    };
  };
  kpis: {
    identities: { total: number };
    intakes: { total: number };
    projects: { total: number };
    sites: { total: number };
  };
};

const PIPELINE_STEPS = [
  { key: 'identities' as const, label: 'IDENTITIES', href: SITE00_ADMIN_ROUTES.identities },
  { key: 'intakes' as const, label: 'BLDR INTAKES', href: SITE00_ADMIN_ROUTES.bldrIntakes },
  { key: 'projects' as const, label: 'PROJECTS', href: SITE00_ADMIN_ROUTES.projects },
  { key: 'sites' as const, label: 'SITES', href: SITE00_ADMIN_ROUTES.sites },
  { key: 'live' as const, label: 'LIVE', href: `${SITE00_ADMIN_ROUTES.sites}?filter=live` },
];

export default function ReportsPipelinePage() {
  const [data, setData] = useState<PipelinePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    site00ProductionApi
      .reportsPipeline()
      .then((payload) => setData(payload as unknown as PipelinePayload))
      .catch((e) => setError(e instanceof Error ? e.message : 'FAILED TO LOAD PIPELINE'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Site00AdminShell>
      <header className="site00-admin-dashboard-head">
        <div>
          <Link className="site00-admin-link-cta" to={SITE00_ADMIN_ROUTES.reports}>
            ← BACK TO REPORTS
          </Link>
          <h1 className="site00-admin-page-title">[ PIPELINE REPORT ]</h1>
          <p className="site00-admin-page-subtitle">FULL ECOSYSTEM FUNNEL — ALL TIME.</p>
        </div>
      </header>

      {error ? <p className="site00-admin-panel site00-admin-panel--error">{error}</p> : null}

      {loading ? (
        <div className="site00-admin-skeleton-grid" aria-busy="true" aria-label="Loading pipeline" />
      ) : data ? (
        <>
          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">PIPELINE FLOW</h2>
            <div className="site00-admin-pipeline-flow">
              {PIPELINE_STEPS.map((step, i, arr) => {
                const count = data.pipeline[step.key];
                const move = data.pipeline.movement?.[step.key];
                return (
                  <div key={step.label} className="site00-admin-pipeline-flow__step">
                    <Link to={step.href} className="site00-admin-pipeline-flow__label">
                      {step.label}
                    </Link>
                    <p className="site00-admin-pipeline-flow__count">{count}</p>
                    {move != null && move > 0 ? <p className="site00-admin-pipeline-flow__move">+{move}</p> : null}
                    {i < arr.length - 1 ? <span className="site00-admin-pipeline-flow__arrow" aria-hidden="true">→</span> : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="site00-admin-panel">
            <h2 className="site00-admin-panel__title">CONVERSION SNAPSHOT</h2>
            <div className="site00-admin-table-wrap">
              <table className="site00-admin-table">
                <thead>
                  <tr>
                    <th>STAGE</th>
                    <th>COUNT</th>
                    <th>% OF IDENTITIES</th>
                  </tr>
                </thead>
                <tbody>
                  {PIPELINE_STEPS.map((step) => {
                    const count = data.pipeline[step.key];
                    const base = data.pipeline.identities || 1;
                    const pct = Math.round((count / base) * 100);
                    return (
                      <tr key={step.key}>
                        <td>
                          <Link to={step.href}>{step.label}</Link>
                        </td>
                        <td>{count}</td>
                        <td>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </Site00AdminShell>
  );
}
