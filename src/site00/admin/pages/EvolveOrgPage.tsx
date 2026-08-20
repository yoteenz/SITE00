import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ControlPageHeader } from '../components/control/ControlPageHeader';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { ProjectSwitcher } from '../components/orchestration/ProjectSwitcher';
import { site00EvolveApi } from '../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../config/routes';

type Tab = 'overview' | 'strategy' | 'campaigns' | 'production' | 'approvals';

export default function EvolveOrgPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) ?? 'overview';
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [debug, orgs] = await Promise.all([
        site00EvolveApi.debug(orgSlug),
        site00EvolveApi.organizations(),
      ]);
      setPayload(debug);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const overview = payload?.overview as Record<string, unknown> | undefined;
  const channels = (payload?.channels as Array<{ channel_key: string; channel_state: string; owner_decision?: string }>) ?? [];
  const isInfra = (payload?.organization as { classification?: string })?.classification === 'PRODUCTION_INFRASTRUCTURE';

  async function runAssessment() {
    setBusy(true);
    try {
      await site00EvolveApi.runAssessment(orgSlug);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function generateManifest() {
    setBusy(true);
    try {
      await site00EvolveApi.generateManifest(orgSlug);
      await load();
      setSearchParams({ tab: 'strategy' });
    } finally {
      setBusy(false);
    }
  }

  if (isInfra) {
    return (
      <Site00AdminShell>
        <ControlPageHeader kicker="00 / EVOLVE" title="STUDIO WORLD" subtitle="Production infrastructure — not a managed marketing client" />
        <p><Link to={SITE00_ADMIN_ROUTES.evolve}>← EVOLVE OVERVIEW</Link></p>
      </Site00AdminShell>
    );
  }

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / EVOLVE"
        title={(overview?.organizationName as string) ?? orgSlug.toUpperCase()}
        subtitle="Marketing intelligence · strategy · campaigns · production"
        actions={<ProjectSwitcher organizations={organizations} selected={orgSlug} subRoute="evolve" />}
      />

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>← COMMAND</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.evolve}>EVOLVE INDEX</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.orchestrationProject(orgSlug)}>LAUNCH CONTROL</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.evolveDebug}>DEBUG</Link></li>
      </ul>

      <nav className="site00-evolve-tabs">
        {(['overview', 'strategy', 'campaigns', 'production', 'approvals'] as Tab[]).map((t) => (
          <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => setSearchParams({ tab: t })}>
            {t.toUpperCase()}
          </button>
        ))}
      </nav>

      {loading ? <p>Loading…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {overview && tab === 'overview' ? (
        <div className="site00-orchestration-grid">
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">INTELLIGENCE</h2>
            <dl className="site00-evolve-dl">
              <dt>CURRENT OBJECTIVE</dt>
              <dd>{String(overview.currentObjective ?? '—')}</dd>
              <dt>MARKETING HEALTH</dt>
              <dd>{String(overview.marketingHealth ?? '—').replace(/_/g, ' ')}</dd>
              <dt>NEXT BEST ACTION</dt>
              <dd>{(overview.nextBestAction as { title?: string })?.title ?? '—'}</dd>
              <dt>PERFORMANCE SIGNAL</dt>
              <dd>{String(overview.latestPerformanceSignal ?? '—')}</dd>
            </dl>
            <button type="button" disabled={busy} onClick={() => void runAssessment()}>RUN ASSESSMENT</button>
          </section>
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">CHANNELS</h2>
            <ul className="site00-evolve-channel-list">
              {channels.map((c) => (
                <li key={c.channel_key}>
                  <strong>{c.channel_key}</strong> — {c.channel_state}
                  {c.owner_decision ? ` · ${c.owner_decision}` : ''}
                </li>
              ))}
            </ul>
          </section>
          {(overview.deferredItems as string[])?.length ? (
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">DEFERRED (NOT BLOCKERS)</h2>
              <ul>{(overview.deferredItems as string[]).map((d) => <li key={d}>{d}</li>)}</ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {tab === 'strategy' && payload ? (
        <section className="site00-control-panel">
          <h2 className="site00-control-panel__title">MARKETING MANIFEST</h2>
          <button type="button" disabled={busy} onClick={() => void generateManifest()}>GENERATE MANIFEST</button>
          <pre className="site00-evolve-debug-pre">{JSON.stringify({ manifest: payload.manifest, items: payload.manifestItems }, null, 2)}</pre>
        </section>
      ) : null}

      {tab === 'campaigns' && payload ? (
        <pre className="site00-evolve-debug-pre">{JSON.stringify(payload.campaigns, null, 2)}</pre>
      ) : null}

      {tab === 'production' && payload ? (
        <pre className="site00-evolve-debug-pre">{JSON.stringify({ requests: payload.productionRequests, studioWorld: payload.studioWorld }, null, 2)}</pre>
      ) : null}

      {tab === 'approvals' && payload ? (
        <pre className="site00-evolve-debug-pre">{JSON.stringify(payload.approvals, null, 2)}</pre>
      ) : null}
    </Site00AdminShell>
  );
}
