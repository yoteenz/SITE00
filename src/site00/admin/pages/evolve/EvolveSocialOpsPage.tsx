import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { EvolveSocialItem } from '../../types/evolve';

export default function EvolveSocialOpsPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [channels, setChannels] = useState<Array<Record<string, unknown>>>([]);
  const [deferred, setDeferred] = useState<Array<Record<string, unknown>>>([]);
  const [items, setItems] = useState<EvolveSocialItem[]>([]);
  const [roadmapDeferred, setRoadmapDeferred] = useState<Array<Record<string, unknown>>>([]);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, social, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.social(orgSlug),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setChannels(social.channels);
      setDeferred(social.deferredByOwner);
      setItems(social.items);
      setRoadmapDeferred(social.roadmapDeferred);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load social ops');
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasDeferred = deferred.length > 0 || roadmapDeferred.length > 0;

  return (
    <EvolveOrgShell
      orgSlug={orgSlug}
      orgName={orgName}
      activeNav="social"
      title={`${orgName} · SOCIAL OPS`}
      subtitle="Platform channels, owner deferrals, and publishing pipeline"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading social operations…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading ? (
        <div className="site00-orchestration-grid">
          {hasDeferred ? (
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">DEFERRED BY OWNER</h2>
              <p className="site00-evolve-ops-callout site00-evolve-ops-callout--info">
                Owner-elected deferrals are visible here — they are not launch blockers.
              </p>
              <ul className="site00-evolve-ops-list">
                {deferred.map((c) => (
                  <li key={String(c.channel_key)} className="site00-evolve-ops-list__row">
                    <span className="site00-control-priority__pill site00-control-priority__pill--info">
                      {String(c.channel_key)} · DEFERRED BY OWNER
                    </span>
                    {c.notes ? <p className="site00-orchestration-meta">{String(c.notes)}</p> : null}
                  </li>
                ))}
                {roadmapDeferred.map((r) => (
                  <li key={String(r.id)} className="site00-evolve-ops-list__row">
                    <span className="site00-control-priority__pill site00-control-priority__pill--info">
                      {String(r.title)} · DEFERRED BY OWNER
                    </span>
                    <p className="site00-orchestration-meta">{String(r.description)}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">SOCIAL CHANNELS</h2>
            {channels.length === 0 ? (
              <p className="site00-control-empty">NO SOCIAL CHANNELS CONFIGURED</p>
            ) : (
              <ul className="site00-orchestration-conn-list">
                {channels.map((c) => (
                  <li key={String(c.channel_key)} className="site00-orchestration-conn-row">
                    <div>
                      <p className="site00-orchestration-conn-row__name">{String(c.channel_key)}</p>
                      {c.owner_decision ? (
                        <p className="site00-orchestration-meta">{String(c.owner_decision).replace(/_/g, ' ')}</p>
                      ) : null}
                    </div>
                    <span className={`site00-control-priority__pill ${evolveStatusPillClass(String(c.channel_state))}`}>
                      {formatEvolveLabel(String(c.channel_state))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="site00-control-panel site00-evolve-ops-workspace">
            <h2 className="site00-control-panel__title">SOCIAL CONTENT PIPELINE</h2>
            {items.length === 0 ? (
              <p className="site00-control-empty">NO SOCIAL CONTENT ITEMS</p>
            ) : (
              <ul className="site00-evolve-ops-list">
                {items.map((item) => (
                  <li key={item.id} className="site00-evolve-ops-list__row site00-evolve-ops-list__row--card">
                    <div>
                      <p className="site00-evolve-ops-list__title">
                        {item.platform}
                        {item.format ? ` · ${item.format}` : ''}
                      </p>
                      <p className="site00-orchestration-meta">
                        {item.content_pillar ?? '—'}
                        {item.hook ? ` · "${item.hook}"` : ''}
                      </p>
                    </div>
                    <span className={`site00-control-priority__pill ${evolveStatusPillClass(item.publish_state)}`}>
                      {formatEvolveLabel(item.publish_state)}
                    </span>
                    {item.metadata?.owner_decision === 'DEFERRED_BY_OWNER' ? (
                      <p className="site00-evolve-ops-callout site00-evolve-ops-callout--info">
                        {String(item.metadata.note ?? 'Deferred by owner — not blocking')}
                      </p>
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
              <li><Link to={SITE00_ADMIN_ROUTES.evolveProductionNew(orgSlug)}>REQUEST PRODUCTION →</Link></li>
            </ul>
          </section>
        </div>
      ) : null}
    </EvolveOrgShell>
  );
}
