import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { SafeConnectionView } from '../../types/evolve';

type OrgGroup = {
  organizationSlug: string;
  organizationName: string;
  publishingStatus: string;
  connections: SafeConnectionView[];
};

export default function EvolveConnectionsPortfolioPage() {
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await site00EvolveApi.connectionsPortfolio();
      setGroups(data.groups);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / EVOLVE"
        title="EXTERNAL CONNECTIONS"
        subtitle="Portfolio view — provider connections grouped by organization"
      />
      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>← COMMAND</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.evolve}>EVOLVE PORTFOLIO</Link></li>
      </ul>

      {loading ? <p className="site00-evolve-ops-loading">Loading connections…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading && !error ? (
        <div className="site00-orchestration-grid">
          {groups.map((group) => (
            <section key={group.organizationSlug} className="site00-control-panel">
              <h2 className="site00-control-panel__title">
                <Link to={SITE00_ADMIN_ROUTES.evolveOrgConnections(group.organizationSlug)}>
                  {group.organizationName}
                </Link>
              </h2>
              <p className="site00-orchestration-meta">
                Publishing: {formatEvolveLabel(group.publishingStatus)} · {group.connections.length} connection(s)
              </p>
              {group.connections.length === 0 ? (
                <p className="site00-evolve-ops-callout">No connections — all providers NOT_CONNECTED</p>
              ) : (
                <ul className="site00-evolve-ops-list">
                  {group.connections.map((c) => (
                    <li key={c.id} className="site00-evolve-ops-list__row">
                      <Link to={SITE00_ADMIN_ROUTES.evolveOrgConnections(group.organizationSlug)}>
                        <strong>{c.displayName}</strong>
                      </Link>
                      <span className={evolveStatusPillClass(c.status)}>{formatEvolveLabel(c.status)}</span>
                      <span className={evolveStatusPillClass(c.health)}>{formatEvolveLabel(c.health)}</span>
                      {c.recommendedAction ? (
                        <p className="site00-orchestration-meta">{c.recommendedAction}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      ) : null}
    </Site00AdminShell>
  );
}
