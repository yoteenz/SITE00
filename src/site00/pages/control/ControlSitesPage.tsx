import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { SiteRow } from '../../components/ecosystem/SiteRow';
import { EmptyState, MetricCard, SearchField } from '../../components/pages/Site00PagePrimitives';
import { useEcosystemData } from '../../hooks/useEcosystemData';
import { SITE00_ROUTES } from '../../config/routes';

const STATUS_FILTERS = [
  { id: 'all', label: 'ALL' },
  { id: 'published', label: 'PUBLISHED' },
  { id: 'draft', label: 'DRAFT' },
];

export default function ControlSitesPage() {
  const { sites, siteMetrics, siteActivity, siteTeam } = useEcosystemData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return sites.filter((s) => {
      const matchesQuery =
        !query.trim() ||
        s.domain.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && s.status === 'Published') ||
        (statusFilter === 'draft' && s.status !== 'Published');
      return matchesQuery && matchesStatus;
    });
  }, [sites, query, statusFilter]);

  const headerActions = (
    <Link to={SITE00_ROUTES.bldr} className="site00-btn-outline site00-ecosystem-header__cta">
      + NEW SITE
    </Link>
  );

  return (
    <EcosystemShell headerActions={headerActions}>
      <div className="site00-page site00-page--control-sites">
        <div className="site00-eco-metrics site00-eco-metrics--4">
          <MetricCard label="ACTIVE SITES" value={String(siteMetrics.active)} />
          <MetricCard label="DRAFT SITES" value={String(siteMetrics.draft)} />
          <MetricCard label="TOTAL SITES" value={String(siteMetrics.total)} />
          <MetricCard label="TEAM SITES" value={String(siteMetrics.team)} />
        </div>

        <div className="site00-page-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search sites…" id="sites-search" />
          <div className="site00-eco-filters" role="group" aria-label="Filter by status">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`site00-eco-filters__btn ${statusFilter === f.id ? 'site00-eco-filters__btn--active' : ''}`.trim()}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="NO SITES YET"
            body="Sites appear here when you create and publish digital properties from BLDR."
          />
        ) : (
          <ul className="site00-site-list">
            {filtered.map((site) => (
              <SiteRow key={site.id} site={site} />
            ))}
          </ul>
        )}

        <div className="site00-eco-continuation">
          <section className="site00-eco-panel" aria-labelledby="site-activity-heading">
            <h2 id="site-activity-heading" className="site00-eco-panel__title">
              SITE ACTIVITY
            </h2>
            <ul className="site00-eco-activity-feed">
              {siteActivity.map((item) => (
                <li key={item.id} className="site00-eco-activity-feed__row">
                  <span className="site00-eco-activity-feed__entity">{item.entity}</span>
                  <span className="site00-eco-activity-feed__action">— {item.action}</span>
                  <span className="site00-eco-activity-feed__time">{item.timeAgo}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="site00-eco-panel" aria-labelledby="site-team-heading">
            <h2 id="site-team-heading" className="site00-eco-panel__title">
              YOUR TEAM
            </h2>
            <ul className="site00-eco-team">
              {siteTeam.map((member) => (
                <li key={member.id} className="site00-eco-team__row">
                  <span className="site00-eco-team__avatar">{member.initials}</span>
                  <div>
                    <p className="site00-eco-team__name">{member.name}</p>
                    <p className="site00-eco-team__role">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="site00-eco-mobile-cta">
          <Link to={SITE00_ROUTES.bldr} className="site00-btn-outline site00-btn-outline--block">
            + NEW SITE
          </Link>
        </div>
      </div>
    </EcosystemShell>
  );
}
