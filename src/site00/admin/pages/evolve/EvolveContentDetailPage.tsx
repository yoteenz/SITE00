import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { EvolveCalendarItem } from '../../types/evolve';

export default function EvolveContentDetailPage() {
  const { orgSlug = 'site-00', itemId = '' } = useParams<{ orgSlug: string; itemId: string }>();
  const [item, setItem] = useState<EvolveCalendarItem | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      const [orgs, { item: calItem }, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.calendarItem(orgSlug, itemId),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setItem(calItem);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Content item not found');
    } finally {
      setLoading(false);
    }
  }, [orgSlug, itemId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <EvolveOrgShell
      orgSlug={orgSlug}
      orgName={orgName}
      activeNav="calendar"
      title={item?.title ?? 'Content Item'}
      subtitle="Content detail — channel, production, and approval requirements"
      organizations={organizations}
    >
      <p className="site00-evolve-ops-back">
        <Link to={SITE00_ADMIN_ROUTES.evolveCalendar(orgSlug)}>← CONTENT CALENDAR</Link>
      </p>

      {loading ? <p className="site00-evolve-ops-loading">Loading content item…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {item ? (
        <div className="site00-orchestration-grid">
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">CONTENT STATUS</h2>
            <div className="site00-evolve-ops-pill-row">
              <span className={`site00-control-priority__pill ${evolveStatusPillClass(item.status)}`}>
                {formatEvolveLabel(item.status)}
              </span>
              {item.production_required ? (
                <span className="site00-control-priority__pill site00-control-priority__pill--action">
                  PRODUCTION REQUIRED
                </span>
              ) : null}
              {item.approval_required ? (
                <span className="site00-control-priority__pill site00-control-priority__pill--milestone">
                  APPROVAL REQUIRED
                </span>
              ) : null}
            </div>
            <dl className="site00-evolve-dl">
              <dt>CHANNEL</dt>
              <dd>{item.channel_key}</dd>
              <dt>CONTENT TYPE</dt>
              <dd>{item.content_type}</dd>
              <dt>PLANNED DATE</dt>
              <dd>{item.planned_date ?? 'TBD'}</dd>
              <dt>OBJECTIVE</dt>
              <dd>{item.objective ?? '—'}</dd>
              <dt>CONTENT PILLAR</dt>
              <dd>{item.content_pillar ?? '—'}</dd>
              {item.campaign_id ? (
                <>
                  <dt>LINKED CAMPAIGN</dt>
                  <dd>
                    <Link to={SITE00_ADMIN_ROUTES.evolveCampaign(orgSlug, item.campaign_id)}>
                      VIEW CAMPAIGN →
                    </Link>
                  </dd>
                </>
              ) : null}
            </dl>
          </section>

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">OPERATOR ACTIONS</h2>
            <ul className="site00-email-debug-index">
              {item.channel_key === 'EMAIL' ? (
                <li><Link to={SITE00_ADMIN_ROUTES.evolveEmails(orgSlug)}>EMAIL OPS →</Link></li>
              ) : null}
              {['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'LINKEDIN'].includes(item.channel_key) ? (
                <li><Link to={SITE00_ADMIN_ROUTES.evolveSocial(orgSlug)}>SOCIAL OPS →</Link></li>
              ) : null}
              {item.production_required ? (
                <li><Link to={SITE00_ADMIN_ROUTES.evolveProductionNew(orgSlug)}>REQUEST PRODUCTION →</Link></li>
              ) : null}
              <li><Link to={SITE00_ADMIN_ROUTES.evolveApprovals}>APPROVALS INBOX →</Link></li>
            </ul>
          </section>
        </div>
      ) : null}
    </EvolveOrgShell>
  );
}
