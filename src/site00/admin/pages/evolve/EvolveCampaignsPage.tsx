import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { EvolveCampaignListRow } from '../../types/evolve';

export default function EvolveCampaignsPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [campaigns, setCampaigns] = useState<EvolveCampaignListRow[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, { campaigns: rows }, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.campaigns(orgSlug),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setCampaigns(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load campaigns');
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
      activeNav="campaigns"
      title={`${orgName} · CAMPAIGNS`}
      subtitle="Active and planned campaigns — production, approval, and blockers at a glance"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading campaign workspace…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading && campaigns.length === 0 ? (
        <section className="site00-control-panel site00-evolve-ops-empty">
          <h2 className="site00-control-panel__title">NO CAMPAIGNS YET</h2>
          <p className="site00-orchestration-meta">Run assessment and generate manifest to seed campaign work.</p>
          <Link to={SITE00_ADMIN_ROUTES.evolveOrg(orgSlug)} className="site00-control-panel__link">
            RETURN TO OVERVIEW →
          </Link>
        </section>
      ) : null}

      {!loading && campaigns.length > 0 ? (
        <section className="site00-control-panel site00-evolve-ops-workspace">
          <div className="site00-control-panel__head">
            <h2 className="site00-control-panel__title">CAMPAIGN WORKSPACE</h2>
            <button type="button" className="site00-orchestration-link-btn" onClick={() => void load()}>
              REFRESH
            </button>
          </div>
          <div className="site00-evolve-ops-table-wrap">
            <table className="site00-admin-table site00-control-table site00-evolve-ops-table">
              <thead>
                <tr>
                  <th>CAMPAIGN</th>
                  <th>OBJECTIVE</th>
                  <th>STATUS</th>
                  <th>CHANNELS</th>
                  <th>TARGET DATE</th>
                  <th>NEXT MILESTONE</th>
                  <th>PRODUCTION STATE</th>
                  <th>APPROVAL STATE</th>
                  <th>BLOCKERS</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="site00-evolve-ops-table__row">
                    <td>
                      <Link to={SITE00_ADMIN_ROUTES.evolveCampaign(orgSlug, c.id)} className="site00-evolve-ops-table__link">
                        {c.title}
                      </Link>
                    </td>
                    <td className="site00-evolve-ops-table__meta">{c.objective ?? '—'}</td>
                    <td>
                      <span className={`site00-control-priority__pill ${evolveStatusPillClass(c.status)}`}>
                        {formatEvolveLabel(c.status)}
                      </span>
                    </td>
                    <td className="site00-evolve-ops-table__channels">{c.channels.join(' · ') || '—'}</td>
                    <td>{c.targetDate ?? '—'}</td>
                    <td className="site00-evolve-ops-table__meta">{c.nextMilestone ?? '—'}</td>
                    <td>
                      <span className={`site00-control-priority__pill ${evolveStatusPillClass(c.productionState)}`}>
                        {formatEvolveLabel(c.productionState)}
                      </span>
                    </td>
                    <td>
                      <span className={`site00-control-priority__pill ${evolveStatusPillClass(c.approvalState)}`}>
                        {formatEvolveLabel(c.approvalState)}
                      </span>
                    </td>
                    <td className="site00-evolve-ops-table__blockers">
                      {c.blockers.length === 0 ? (
                        <span className="site00-control-empty">NONE</span>
                      ) : (
                        c.blockers.map((b) => (
                          <span key={b} className="site00-control-priority__pill site00-control-priority__pill--blocked">
                            {b}
                          </span>
                        ))
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </EvolveOrgShell>
  );
}
