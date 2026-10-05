import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { EvolveEmailItem } from '../../types/evolve';

export default function EvolveEmailOpsPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [providerState, setProviderState] = useState('NOT_CONNECTED');
  const [channelState, setChannelState] = useState<string | null>(null);
  const [items, setItems] = useState<EvolveEmailItem[]>([]);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, emailOps, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.emails(orgSlug),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setProviderState(emailOps.providerState);
      setChannelState(String(emailOps.channel?.channel_state ?? 'PLANNED'));
      setItems(emailOps.items);
      setBlockers(emailOps.blockers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load email ops');
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
      activeNav="emails"
      title={`${orgName} · EMAIL OPS`}
      subtitle="Lifecycle and campaign email — provider connection and delivery pipeline"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading email operations…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading ? (
        <div className="site00-orchestration-grid">
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">EMAIL PROVIDER</h2>
            <div className="site00-evolve-ops-pill-row">
              <span className={`site00-control-priority__pill ${evolveStatusPillClass(providerState)}`}>
                PROVIDER · {formatEvolveLabel(providerState)}
              </span>
              <span className={`site00-control-priority__pill ${evolveStatusPillClass(channelState ?? '')}`}>
                CHANNEL · {formatEvolveLabel(channelState)}
              </span>
            </div>
            {providerState === 'NOT_CONNECTED' ? (
              <p className="site00-evolve-ops-callout site00-evolve-ops-callout--blocked">
                Email provider is not connected. Lifecycle and campaign sends require provider integration — delivery
                states remain draft until connected.
              </p>
            ) : null}
            {blockers.length > 0 ? (
              <ul className="site00-evolve-ops-list">
                {blockers.map((b) => (
                  <li key={b}>
                    <span className="site00-control-priority__pill site00-control-priority__pill--blocked">{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="site00-control-panel site00-evolve-ops-workspace">
            <h2 className="site00-control-panel__title">EMAIL PIPELINE</h2>
            {items.length === 0 ? (
              <p className="site00-control-empty">NO EMAIL ITEMS IN PIPELINE</p>
            ) : (
              <ul className="site00-evolve-ops-list">
                {items.map((item) => (
                  <li key={item.id} className="site00-evolve-ops-list__row site00-evolve-ops-list__row--card">
                    <div>
                      <p className="site00-evolve-ops-list__title">{item.subject ?? item.email_type}</p>
                      <p className="site00-orchestration-meta">
                        {formatEvolveLabel(item.email_type)}
                        {item.audience ? ` · ${item.audience}` : ''}
                      </p>
                    </div>
                    <div className="site00-evolve-ops-pill-row">
                      <span className={`site00-control-priority__pill ${evolveStatusPillClass(item.approval_state)}`}>
                        {formatEvolveLabel(item.approval_state)}
                      </span>
                      <span className={`site00-control-priority__pill ${evolveStatusPillClass(item.delivery_state)}`}>
                        {formatEvolveLabel(item.delivery_state)}
                      </span>
                    </div>
                    {item.metadata?.blocked_by ? (
                      <p className="site00-orchestration-error-text">{String(item.metadata.blocked_by)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">RELATED</h2>
            <ul className="site00-email-debug-index">
              <li><Link to={SITE00_ADMIN_ROUTES.evolveCalendar(orgSlug)}>CONTENT CALENDAR →</Link></li>
              <li><Link to={SITE00_ADMIN_ROUTES.emailPack}>EMAIL TEMPLATE GALLERY →</Link></li>
            </ul>
          </section>
        </div>
      ) : null}
    </EvolveOrgShell>
  );
}
