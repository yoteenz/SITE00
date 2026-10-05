import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../components/control/ControlPageHeader';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import type { EvolveOverview } from '../types/evolve';

type OrgPortfolioRow = {
  slug: string;
  name: string;
  classification: string;
  overview: EvolveOverview;
};

export default function EvolveOverviewPage() {
  const [orgs, setOrgs] = useState<OrgPortfolioRow[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ organizations }, { approvals }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.approvalsInbox(),
      ]);
      setPendingApprovals(approvals.length);

      const summaries = await Promise.all(
        organizations
          .filter((o) => o.classification !== 'PRODUCTION_INFRASTRUCTURE')
          .map(async (o) => {
            const { overview } = await site00EvolveApi.overview(o.slug);
            return { slug: o.slug, name: o.name, classification: o.classification, overview };
          }),
      );
      setOrgs(summaries);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load EVOLVE portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalCampaigns = orgs.reduce((n, o) => n + o.overview.activeCampaigns, 0);
  const attentionOrgs = orgs.filter((o) =>
    ['ATTENTION_REQUIRED', 'BLOCKED', 'ASSESSMENT_REQUIRED'].includes(o.overview.marketingHealth),
  ).length;

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / EVOLVE"
        title="MARKETING OS · PORTFOLIO"
        subtitle="Cross-org operational view — campaigns, pipeline, approvals, and health"
        actions={
          <Link to={SITE00_ADMIN_ROUTES.evolveApprovals} className="site00-control-panel__link">
            APPROVALS INBOX{pendingApprovals > 0 ? ` (${pendingApprovals})` : ''} →
          </Link>
        }
      />

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>← COMMAND</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.evolveDebug}>DEBUG INSPECTOR</Link></li>
      </ul>

      {loading ? <p className="site00-evolve-ops-loading">Loading portfolio…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading ? (
        <>
          <div className="site00-evolve-ops-metrics">
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">MARKETING CLIENTS</p>
              <p className="site00-evolve-ops-metric__value">{orgs.length}</p>
            </section>
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">ACTIVE CAMPAIGNS</p>
              <p className="site00-evolve-ops-metric__value">{totalCampaigns}</p>
            </section>
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">NEEDS ATTENTION</p>
              <p className="site00-evolve-ops-metric__value">{attentionOrgs}</p>
            </section>
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">PENDING APPROVALS</p>
              <p className="site00-evolve-ops-metric__value">{pendingApprovals}</p>
            </section>
          </div>

          <div className="site00-orchestration-grid">
            {orgs.map((org) => {
              const o = org.overview;
              return (
                <section key={org.slug} className="site00-control-panel site00-evolve-ops-portfolio-card">
                  <div className="site00-control-panel__head">
                    <h2 className="site00-control-panel__title">{org.name}</h2>
                    <span className={`site00-control-priority__pill ${evolveStatusPillClass(o.marketingHealth)}`}>
                      {formatEvolveLabel(o.marketingHealth)}
                    </span>
                  </div>
                  <p className="site00-orchestration-meta">{org.classification.replace(/_/g, ' ')}</p>
                  <dl className="site00-evolve-dl">
                    <dt>CURRENT OBJECTIVE</dt>
                    <dd>{o.currentObjective ?? '—'}</dd>
                    <dt>ACTIVE CAMPAIGNS</dt>
                    <dd>{o.activeCampaigns}</dd>
                    <dt>CONTENT PIPELINE</dt>
                    <dd>
                      {o.contentPipeline.planned} planned · {o.contentPipeline.inProduction} in production ·{' '}
                      {o.contentPipeline.awaitingReview} review
                    </dd>
                    <dt>NEXT ACTION</dt>
                    <dd>{o.needsApproval > 0 ? `${o.needsApproval} approval(s)` : o.nextBestAction?.title ?? '—'}</dd>
                  </dl>
                  {o.deferredItems.length > 0 ? (
                    <p className="site00-orchestration-meta">
                      Deferred: {o.deferredItems.join(' · ')}
                    </p>
                  ) : null}
                  <ul className="site00-email-debug-index">
                    <li>
                      <Link to={SITE00_ADMIN_ROUTES.evolveOrg(org.slug)} className="site00-control-panel__link">
                        OPEN WORKSPACE →
                      </Link>
                    </li>
                    <li><Link to={SITE00_ADMIN_ROUTES.evolveCampaigns(org.slug)}>CAMPAIGNS</Link></li>
                    <li><Link to={SITE00_ADMIN_ROUTES.evolveCalendar(org.slug)}>CALENDAR</Link></li>
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      ) : null}
    </Site00AdminShell>
  );
}
