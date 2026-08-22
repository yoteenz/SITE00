import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import type { EvolveMarketingPlan } from '../../types/evolve';

export default function EvolvePlansPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [plans, setPlans] = useState<EvolveMarketingPlan[]>([]);
  const [roadmap, setRoadmap] = useState<Array<Record<string, unknown>>>([]);
  const [objectives, setObjectives] = useState<Array<Record<string, unknown>>>([]);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, plansPayload, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.plans(orgSlug),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setPlans(plansPayload.plans);
      setRoadmap(plansPayload.roadmap);
      setObjectives(plansPayload.objectives);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <EvolveOrgShell
      orgSlug={orgSlug}
      orgName={orgName}
      activeNav="plans"
      title={`${orgName} · MARKETING PLANS`}
      subtitle="Quarterly plans, objectives, and deferred roadmap items"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading marketing plans…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading ? (
        <div className="site00-orchestration-grid">
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">ACTIVE OBJECTIVES</h2>
            {objectives.length === 0 ? (
              <p className="site00-control-empty">NO OBJECTIVES</p>
            ) : (
              <ul className="site00-evolve-ops-list">
                {objectives.map((o) => (
                  <li key={String(o.id)} className="site00-evolve-ops-list__row">
                    <p className="site00-evolve-ops-list__title">{String(o.title)}</p>
                    <p className="site00-orchestration-meta">{formatEvolveLabel(String(o.objective_key))}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {plans.map((plan) => (
            <section key={plan.id} className="site00-control-panel site00-evolve-ops-plan">
              <div className="site00-control-panel__head">
                <h2 className="site00-control-panel__title">{plan.period_label}</h2>
                <span className={`site00-control-priority__pill ${evolveStatusPillClass(plan.review_state)}`}>
                  {formatEvolveLabel(plan.review_state)}
                </span>
              </div>
              <p className="site00-orchestration-meta">
                {plan.period_start ?? '—'} → {plan.period_end ?? '—'}
              </p>
              <dl className="site00-evolve-dl">
                <dt>CAMPAIGN EXPECTATIONS</dt>
                <dd>
                  <ul>{plan.campaign_expectations.map((c, i) => <li key={i}>{String(c)}</li>)}</ul>
                </dd>
                <dt>CONTENT EXPECTATIONS</dt>
                <dd>
                  <ul>{plan.content_expectations.map((c, i) => <li key={i}>{String(c)}</li>)}</ul>
                </dd>
                <dt>PRODUCTION EXPECTATIONS</dt>
                <dd>
                  <ul>{plan.production_expectations.map((c, i) => <li key={i}>{String(c)}</li>)}</ul>
                </dd>
                <dt>MEASUREMENT TARGETS</dt>
                <dd>
                  <ul>{plan.measurement_targets.map((c, i) => <li key={i}>{String(c)}</li>)}</ul>
                </dd>
              </dl>
              {plan.metadata?.social_deferred ? (
                <p className="site00-evolve-ops-callout site00-evolve-ops-callout--info">
                  Social channels excluded by owner deferral — not a plan blocker.
                </p>
              ) : null}
            </section>
          ))}

          {plans.length === 0 ? (
            <section className="site00-control-panel site00-evolve-ops-empty">
              <h2 className="site00-control-panel__title">NO FORMAL PLANS YET</h2>
              <p className="site00-orchestration-meta">Generate manifest and run assessment to establish planning baseline.</p>
            </section>
          ) : null}

          {roadmap.length > 0 ? (
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">ROADMAP · DEFERRED &amp; LATER</h2>
              <ul className="site00-evolve-ops-list">
                {roadmap.map((r) => (
                  <li key={String(r.id)} className="site00-evolve-ops-list__row">
                    <p className="site00-evolve-ops-list__title">{String(r.title)}</p>
                    <span className={`site00-control-priority__pill ${evolveStatusPillClass(String(r.status))}`}>
                      {formatEvolveLabel(String(r.status))}
                    </span>
                    <p className="site00-orchestration-meta">{String(r.description)}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </EvolveOrgShell>
  );
}
