import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { EvolveCalendarItem } from '../../types/evolve';

export default function EvolveCalendarPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [items, setItems] = useState<EvolveCalendarItem[]>([]);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [pipeline, setPipeline] = useState({ planned: 0, inProduction: 0, awaitingReview: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, { calendar }, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.calendar(orgSlug),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setPipeline(overview.contentPipeline);
      setItems(calendar.sort((a, b) => (a.planned_date ?? '').localeCompare(b.planned_date ?? '')));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar');
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
      activeNav="calendar"
      title={`${orgName} · CONTENT CALENDAR`}
      subtitle="Planned publishing pipeline — production and approval states"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading content calendar…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading ? (
        <>
          <div className="site00-evolve-ops-metrics">
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">PLANNED</p>
              <p className="site00-evolve-ops-metric__value">{pipeline.planned}</p>
            </section>
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">IN PRODUCTION</p>
              <p className="site00-evolve-ops-metric__value">{pipeline.inProduction}</p>
            </section>
            <section className="site00-control-panel site00-evolve-ops-metric">
              <p className="site00-evolve-ops-metric__label">AWAITING REVIEW</p>
              <p className="site00-evolve-ops-metric__value">{pipeline.awaitingReview}</p>
            </section>
          </div>

          {items.length === 0 ? (
            <section className="site00-control-panel site00-evolve-ops-empty">
              <h2 className="site00-control-panel__title">CALENDAR EMPTY</h2>
              <p className="site00-orchestration-meta">Content items appear here once campaigns and manifest work begins.</p>
            </section>
          ) : (
            <section className="site00-control-panel site00-evolve-ops-workspace">
              <h2 className="site00-control-panel__title">PUBLISHING PIPELINE</h2>
              <ul className="site00-evolve-ops-calendar">
                {items.map((item) => (
                  <li key={item.id} className="site00-evolve-ops-calendar__item">
                    <div className="site00-evolve-ops-calendar__date">
                      {item.planned_date ?? 'TBD'}
                    </div>
                    <div className="site00-evolve-ops-calendar__body">
                      <Link
                        to={SITE00_ADMIN_ROUTES.evolveCalendarItem(orgSlug, item.id)}
                        className="site00-evolve-ops-calendar__title"
                      >
                        {item.title}
                      </Link>
                      <p className="site00-orchestration-meta">
                        {item.channel_key} · {item.content_type}
                        {item.content_pillar ? ` · ${item.content_pillar}` : ''}
                      </p>
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
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : null}
    </EvolveOrgShell>
  );
}
