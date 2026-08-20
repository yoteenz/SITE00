import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';

type ReadinessItem = {
  key: string;
  label: string;
  state: string;
  detail?: string;
};

export default function EvolvePilotControlPage() {
  const { orgSlug = 'ndxbook' } = useParams<{ orgSlug: string }>();
  const [items, setItems] = useState<ReadinessItem[]>([]);
  const [fence, setFence] = useState<Record<string, unknown>>({});
  const [automationMode, setAutomationMode] = useState('MANUAL');
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, readiness, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.pilotReadiness(orgSlug),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      setItems(readiness.items);
      setFence(readiness.publishingFence);
      setAutomationMode(readiness.automationMode);
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

      {!loading && !error ? (
        <>
          <section className="site00-control-panel site00-evolve-ops-callout--info">
            <p>
              Global + organization publishing fences: {fence.canPublish ? 'OPEN' : String(fence.reason ?? 'DISABLED')}
            </p>
            <p>Automation mode: {automationMode} — publishing and automation remain DISABLED this sprint.</p>
            <p>
              <Link to={SITE00_ADMIN_ROUTES.evolveOrgConnections(orgSlug)}>Manage provider connections →</Link>
            </p>
          </section>

          <div className="site00-orchestration-grid">
            {items.map((item) => (
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
