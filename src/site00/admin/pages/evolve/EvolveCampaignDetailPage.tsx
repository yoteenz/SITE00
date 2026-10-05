import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { EvolveCampaignListRow, EvolveCalendarItem } from '../../types/evolve';

export default function EvolveCampaignDetailPage() {
  const { orgSlug = 'site-00', campaignId = '' } = useParams<{ orgSlug: string; campaignId: string }>();
  const [listRow, setListRow] = useState<EvolveCampaignListRow | null>(null);
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [calendar, setCalendar] = useState<EvolveCalendarItem[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const [orgs, detail, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.campaign(orgSlug, campaignId),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setListRow(detail.listRow);
      setCampaign(detail.campaign);
      setCalendar(detail.calendar);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Campaign not found');
    } finally {
      setLoading(false);
    }
  }, [orgSlug, campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  const title = (campaign?.title as string) ?? listRow?.title ?? 'Campaign';

  return (
    <EvolveOrgShell
      orgSlug={orgSlug}
      orgName={orgName}
      activeNav="campaigns"
      title={title}
      subtitle="Campaign command — narrative, channels, calendar, production lineage"
      organizations={organizations}
    >
      <p className="site00-evolve-ops-back">
        <Link to={SITE00_ADMIN_ROUTES.evolveCampaigns(orgSlug)}>← ALL CAMPAIGNS</Link>
      </p>

      {loading ? <p className="site00-evolve-ops-loading">Loading campaign…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {listRow && campaign ? (
        <div className="site00-orchestration-grid">
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">CAMPAIGN STATUS</h2>
            <div className="site00-evolve-ops-pill-row">
              <span className={`site00-control-priority__pill ${evolveStatusPillClass(listRow.status)}`}>
                {formatEvolveLabel(listRow.status)}
              </span>
              <span className={`site00-control-priority__pill ${evolveStatusPillClass(listRow.productionState)}`}>
                PRODUCTION · {formatEvolveLabel(listRow.productionState)}
              </span>
              <span className={`site00-control-priority__pill ${evolveStatusPillClass(listRow.approvalState)}`}>
                APPROVAL · {formatEvolveLabel(listRow.approvalState)}
              </span>
            </div>
            <dl className="site00-evolve-dl">
              <dt>OBJECTIVE</dt>
              <dd>{listRow.objective ?? '—'}</dd>
              <dt>TARGET DATE</dt>
              <dd>{listRow.targetDate ?? '—'}</dd>
              <dt>NEXT MILESTONE</dt>
              <dd>{listRow.nextMilestone ?? '—'}</dd>
              <dt>CHANNELS</dt>
              <dd>{listRow.channels.join(' · ') || '—'}</dd>
              <dt>SUCCESS METRIC</dt>
              <dd>{String(campaign.success_metric ?? '—')}</dd>
            </dl>
          </section>

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">NARRATIVE</h2>
            <dl className="site00-evolve-dl">
              <dt>WHY</dt>
              <dd>{String(campaign.why ?? '—')}</dd>
              <dt>AUDIENCE</dt>
              <dd>{String(campaign.audience ?? '—')}</dd>
              <dt>MESSAGE</dt>
              <dd>{String(campaign.message ?? '—')}</dd>
              <dt>CALL TO ACTION</dt>
              <dd>{String(campaign.call_to_action ?? '—')}</dd>
              <dt>DELIVERABLES</dt>
              <dd>{String(campaign.deliverables_summary ?? '—')}</dd>
            </dl>
          </section>

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">BLOCKERS</h2>
            {listRow.blockers.length === 0 ? (
              <p className="site00-control-empty">NO BLOCKERS</p>
            ) : (
              <ul className="site00-evolve-ops-list">
                {listRow.blockers.map((b) => (
                  <li key={b}>
                    <span className="site00-control-priority__pill site00-control-priority__pill--blocked">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">CONTENT CALENDAR</h2>
            {calendar.length === 0 ? (
              <p className="site00-control-empty">NO CALENDAR ITEMS LINKED</p>
            ) : (
              <ul className="site00-evolve-ops-list">
                {calendar.map((item) => (
                  <li key={item.id} className="site00-evolve-ops-list__row">
                    <Link to={SITE00_ADMIN_ROUTES.evolveCalendarItem(orgSlug, item.id)}>
                      {item.title}
                    </Link>
                    <span className="site00-orchestration-meta">
                      {item.channel_key} · {formatEvolveLabel(item.status)}
                      {item.planned_date ? ` · ${item.planned_date}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to={SITE00_ADMIN_ROUTES.evolveCalendar(orgSlug)} className="site00-control-panel__link">
              OPEN FULL CALENDAR →
            </Link>
          </section>

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">ACTIONS</h2>
            <ul className="site00-email-debug-index">
              <li>
                <Link to={SITE00_ADMIN_ROUTES.evolveProductionNew(orgSlug)}>REQUEST PRODUCTION →</Link>
              </li>
              <li>
                <Link to={SITE00_ADMIN_ROUTES.evolveApprovals}>APPROVALS INBOX →</Link>
              </li>
            </ul>
          </section>
        </div>
      ) : null}
    </EvolveOrgShell>
  );
}
