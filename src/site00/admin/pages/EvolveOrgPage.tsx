import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../config/routes';
import type { EvolveOverview } from '../types/evolve';

export default function EvolveOrgPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [overview, setOverview] = useState<EvolveOverview | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, { overview: o }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((org) => ({ slug: org.slug, name: org.name })));
      setOverview(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load EVOLVE');
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAssessment() {
    setBusy(true);
    try {
      await site00EvolveApi.runAssessment(orgSlug);
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (overview && !overview.isMarketingClient) {
    return (
      <EvolveOrgShell
        orgSlug={orgSlug}
        orgName={overview.organizationName}
        activeNav="overview"
        subtitle="Production infrastructure — not a managed marketing client"
        organizations={organizations}
      >
        <section className="site00-control-panel">
          <h2 className="site00-control-panel__title">STUDIO WORLD</h2>
          <p>Marketing OS does not apply to production infrastructure organizations.</p>
          <Link to={SITE00_ADMIN_ROUTES.orchestrationProject(orgSlug)} className="site00-control-panel__link">
            OPEN LAUNCH CONTROL →
          </Link>
        </section>
      </EvolveOrgShell>
    );
  }

  return (
    <EvolveOrgShell
      orgSlug={orgSlug}
      orgName={overview?.organizationName ?? orgSlug.toUpperCase()}
      activeNav="overview"
      subtitle="Operational command — intelligence, pipeline, and next actions"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading EVOLVE workspace…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {overview ? (
        <>
          <div className="site00-evolve-ops-metrics">
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">MARKETING HEALTH</p>
              <p className="site00-evolve-ops-metric__value site00-evolve-ops-metric__value--small">
                <span className={`site00-control-priority__pill ${evolveStatusPillClass(overview.marketingHealth)}`}>
                  {formatEvolveLabel(overview.marketingHealth)}
                </span>
              </p>
            </section>
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">ACTIVE CAMPAIGNS</p>
              <p className="site00-evolve-ops-metric__value">{overview.activeCampaigns}</p>
            </section>
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">NEEDS APPROVAL</p>
              <p className="site00-evolve-ops-metric__value">{overview.needsApproval}</p>
            </section>
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">PRODUCTION QUEUE</p>
              <p className="site00-evolve-ops-metric__value">{overview.productionQueue}</p>
            </section>
          </div>

          <div className="site00-orchestration-grid">
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">INTELLIGENCE</h2>
              <dl className="site00-evolve-dl">
                <dt>CURRENT OBJECTIVE</dt>
                <dd>{overview.currentObjective ?? '—'}</dd>
                <dt>NEXT BEST ACTION</dt>
                <dd>{overview.nextBestAction?.title ?? '—'}</dd>
                <dt>PERFORMANCE SIGNAL</dt>
                <dd>{overview.latestPerformanceSignal ?? '—'}</dd>
                <dt>NEXT PUBLISHING EVENT</dt>
                <dd>{overview.nextPublishingEvent ?? '—'}</dd>
              </dl>
              <button type="button" disabled={busy} onClick={() => void runAssessment()}>
                RUN ASSESSMENT
              </button>
            </section>

            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">CONTENT PIPELINE</h2>
              <dl className="site00-evolve-dl">
                <dt>PLANNED</dt>
                <dd>{overview.contentPipeline.planned}</dd>
                <dt>IN PRODUCTION</dt>
                <dd>{overview.contentPipeline.inProduction}</dd>
                <dt>AWAITING REVIEW</dt>
                <dd>{overview.contentPipeline.awaitingReview}</dd>
              </dl>
              <Link to={SITE00_ADMIN_ROUTES.evolveCalendar(orgSlug)} className="site00-control-panel__link">
                OPEN CALENDAR →
              </Link>
            </section>

            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">CHANNELS</h2>
              <ul className="site00-orchestration-conn-list">
                {overview.channels.slice(0, 8).map((c) => (
                  <li key={c.channelKey} className="site00-orchestration-conn-row">
                    <p className="site00-orchestration-conn-row__name">{c.channelKey}</p>
                    <span className={`site00-control-priority__pill ${evolveStatusPillClass(c.state)}`}>
                      {formatEvolveLabel(c.state)}
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="site00-email-debug-index">
                <li><Link to={SITE00_ADMIN_ROUTES.evolveEmails(orgSlug)}>EMAIL OPS →</Link></li>
                <li><Link to={SITE00_ADMIN_ROUTES.evolveSocial(orgSlug)}>SOCIAL OPS →</Link></li>
              </ul>
            </section>

            {overview.blockers.length > 0 ? (
              <section className="site00-control-panel">
                <h2 className="site00-control-panel__title">BLOCKERS</h2>
                <ul className="site00-evolve-ops-list">
                  {overview.blockers.map((b) => (
                    <li key={b}>
                      <span className="site00-control-priority__pill site00-control-priority__pill--blocked">{b}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {overview.deferredItems.length > 0 ? (
              <section className="site00-control-panel">
                <h2 className="site00-control-panel__title">DEFERRED (NOT BLOCKERS)</h2>
                <ul className="site00-evolve-ops-list">
                  {overview.deferredItems.map((d) => (
                    <li key={d}>
                      <span className="site00-control-priority__pill site00-control-priority__pill--info">{d}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">WORKSPACE</h2>
              <ul className="site00-email-debug-index">
                <li><Link to={SITE00_ADMIN_ROUTES.evolveCampaigns(orgSlug)}>CAMPAIGNS →</Link></li>
                <li><Link to={SITE00_ADMIN_ROUTES.evolvePlans(orgSlug)}>PLANS →</Link></li>
                <li><Link to={SITE00_ADMIN_ROUTES.evolveProductionNew(orgSlug)}>PRODUCTION BRIEF →</Link></li>
                <li><Link to={SITE00_ADMIN_ROUTES.evolveApprovals}>APPROVALS INBOX →</Link></li>
              </ul>
            </section>
          </div>
        </>
      ) : null}
    </EvolveOrgShell>
  );
}
