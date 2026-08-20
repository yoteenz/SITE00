import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

import type { SafeConnectionView } from '../../types/evolve';

type ReadinessItem = {
  key: string;
  label: string;
  state: string;
  detail?: string;
};

type ExpandedReadiness = {
  designation: string;
  currentState: string;
  globalPublishing: string;
  humanApprovalRequired: boolean;
  crossPosting: string;
  nextAction: string;
  pilotPurpose: string;
  items: ReadinessItem[];
};

export default function EvolvePilotControlPage() {
  const { orgSlug = 'ndxbook' } = useParams<{ orgSlug: string }>();
  const [readiness, setReadiness] = useState<ExpandedReadiness | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, payload, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.pilotReadiness(orgSlug),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setReadiness(payload as ExpandedReadiness);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pilot readiness');
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
      activeNav="pilot"
      title={`${orgName} · PILOT READINESS`}
      subtitle="What must happen before controlled automated publishing"
      organizations={organizations}
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading pilot readiness…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading && !error && readiness ? (
        <>
          <section className="site00-control-panel site00-evolve-ops-callout--info">
            <h2 className="site00-control-panel__title">{readiness.designation}</h2>
            <p>Current state: {readiness.currentState}</p>
            <p>Global publishing: {readiness.globalPublishing}</p>
            <p>Automation: MANUAL · Cross-posting: {readiness.crossPosting}</p>
            <p>Next action: {readiness.nextAction}</p>
            <p>
              <Link to={SITE00_ADMIN_ROUTES.evolveOrgConnections(orgSlug)}>Manage provider connections →</Link>
            </p>
          </section>

          <div className="site00-orchestration-grid">
            {readiness.items.map((item) => (
              <section key={item.key} className="site00-control-panel">
                <h2 className="site00-control-panel__title">{item.label}</h2>
                <span className={evolveStatusPillClass(item.state)}>{formatEvolveLabel(item.state)}</span>
                {item.detail ? <p className="site00-orchestration-meta">{item.detail}</p> : null}
              </section>
            ))}
          </div>
        </>
      ) : null}
    </EvolveOrgShell>
  );
}
