import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ControlPageHeader } from '../components/control/ControlPageHeader';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { site00EvolveApi } from '../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../config/routes';

type OrgSummary = {
  slug: string;
  name: string;
  classification: string;
  overview?: Record<string, unknown>;
};

export default function EvolveOverviewPage() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { organizations } = await site00EvolveApi.organizations();
      const summaries = await Promise.all(
        organizations
          .filter((o) => o.classification !== 'PRODUCTION_INFRASTRUCTURE')
          .map(async (o) => {
            const { overview } = await site00EvolveApi.overview(o.slug);
            return { ...o, overview };
          }),
      );
      setOrgs(summaries);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load EVOLVE');
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
        title="MARKETING OS"
        subtitle="Post-launch growth orchestration — organization-specific intelligence"
        actions={
          <Link to={SITE00_ADMIN_ROUTES.evolveDebug} className="site00-control-panel__link">
            DEBUG INSPECTOR →
          </Link>
        }
      />

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>← COMMAND</Link></li>
      </ul>

      {loading ? <p>Loading EVOLVE…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      <div className="site00-orchestration-grid">
        {orgs.map((org) => {
          const o = org.overview as {
            marketingHealth?: string;
            currentObjective?: string;
            nextBestAction?: { title?: string };
            activeCampaigns?: number;
            needsApproval?: number;
          } | undefined;
          return (
            <section key={org.slug} className="site00-control-panel">
              <h2 className="site00-control-panel__title">{org.name}</h2>
              <p className="site00-orchestration-meta">EVOLVE · {org.classification.replace(/_/g, ' ')}</p>
              <dl className="site00-evolve-dl">
                <dt>CURRENT OBJECTIVE</dt>
                <dd>{o?.currentObjective ?? '—'}</dd>
                <dt>MARKETING HEALTH</dt>
                <dd>{o?.marketingHealth?.replace(/_/g, ' ') ?? '—'}</dd>
                <dt>ACTIVE CAMPAIGNS</dt>
                <dd>{o?.activeCampaigns ?? 0}</dd>
                <dt>NEEDS YOU</dt>
                <dd>{o?.needsApproval ? `${o.needsApproval} approval(s)` : o?.nextBestAction?.title ?? '—'}</dd>
              </dl>
              <Link to={SITE00_ADMIN_ROUTES.evolveOrg(org.slug)} className="site00-control-panel__link">
                OPEN EVOLVE →
              </Link>
            </section>
          );
        })}
      </div>
    </Site00AdminShell>
  );
}
