import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EvolveOrgShell } from '../../components/evolve/EvolveOrgShell';
import { evolveStatusPillClass, formatEvolveLabel } from '../../components/evolve/evolveFormatters';
import { site00EvolveApi } from '../../services/evolveApi';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { SafeConnectionView } from '../../types/evolve';

type ProviderOption = {
  providerKey: string;
  displayName: string;
  category: string;
  adapterStatus: string;
};

export default function EvolveOrgConnectionsPage() {
  const { orgSlug = 'site-00' } = useParams<{ orgSlug: string }>();
  const [connections, setConnections] = useState<SafeConnectionView[]>([]);
  const [availableProviders, setAvailableProviders] = useState<ProviderOption[]>([]);
  const [pilot, setPilot] = useState<Record<string, unknown>>({});
  const [fence, setFence] = useState<Record<string, unknown>>({});
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [orgName, setOrgName] = useState(orgSlug.toUpperCase());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgs, payload, { overview }] = await Promise.all([
        site00EvolveApi.organizations(),
        site00EvolveApi.connections(orgSlug),
        site00EvolveApi.overview(orgSlug),
      ]);
      setOrganizations(orgs.organizations.map((o) => ({ slug: o.slug, name: o.name })));
      setOrgName(overview.organizationName);
      const all = [
        ...payload.buckets.CONNECTED,
        ...payload.buckets.NEEDS_ATTENTION,
        ...payload.buckets.AVAILABLE,
      ];
      setConnections(all);
      setAvailableProviders(payload.availableProviders);
      setPilot(payload.pilot);
      setFence(payload.publishingFence);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const startWizard = () => {
    setWizardStep('SELECT_PROVIDER');
    setSelectedProvider('');
  };

  const initiateConnection = async () => {
    if (!selectedProvider) return;
    setBusy(true);
    try {
      await site00EvolveApi.initiateConnection(orgSlug, selectedProvider);
      setWizardStep(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initiate connection');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (connectionId: string) => {
    setBusy(true);
    try {
      await site00EvolveApi.verifyConnection(orgSlug, connectionId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  };

  const sync = async (connectionId: string) => {
    setBusy(true);
    try {
      await site00EvolveApi.syncConnection(orgSlug, connectionId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async (connectionId: string) => {
    if (!window.confirm('Disconnect this provider connection?')) return;
    setBusy(true);
    try {
      await site00EvolveApi.disconnectConnection(orgSlug, connectionId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disconnect failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <EvolveOrgShell
      orgSlug={orgSlug}
      orgName={orgName}
      activeNav="connections"
      title={`${orgName} · CONNECTIONS`}
      subtitle="External provider connections — status, health, capabilities"
      organizations={organizations}
      actions={
        <button type="button" className="site00-control-btn" onClick={startWizard} disabled={busy}>
          CONNECT PROVIDER
        </button>
      }
    >
      {loading ? <p className="site00-evolve-ops-loading">Loading connections…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {!loading ? (
        <>
          <section className="site00-control-panel site00-evolve-ops-callout--info">
            <p>
              Publishing fence: {String(fence.reason ?? 'DISABLED')} · Automation: {String(pilot.automationMode ?? 'MANUAL')}
            </p>
            {orgSlug === 'ndxbook' ? (
              <p>
                <Link to={SITE00_ADMIN_ROUTES.evolvePilot(orgSlug)}>View pilot readiness control center →</Link>
              </p>
            ) : null}
          </section>

          {wizardStep ? (
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">CONNECTION WIZARD</h2>
              <ol className="site00-evolve-ops-list">
                <li>Select provider (explicit account selection required after authorization)</li>
              </ol>
              <select
                className="site00-control-input"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="">Choose provider…</option>
                {availableProviders.map((p) => (
                  <option key={p.providerKey} value={p.providerKey}>
                    {p.displayName} ({p.category}) — {p.adapterStatus}
                  </option>
                ))}
              </select>
              <div className="site00-evolve-ops-actions">
                <button type="button" className="site00-control-btn" disabled={!selectedProvider || busy} onClick={() => void initiateConnection()}>
                  AUTHORIZE &amp; SAVE
                </button>
                <button type="button" className="site00-control-btn site00-control-btn--ghost" onClick={() => setWizardStep(null)}>
                  CANCEL
                </button>
              </div>
            </section>
          ) : null}

          <div className="site00-orchestration-grid">
            {connections.length === 0 ? (
              <section className="site00-control-panel">
                <h2 className="site00-control-panel__title">NOT CONNECTED</h2>
                <p>All providers remain NOT_CONNECTED until explicitly authorized.</p>
              </section>
            ) : (
              connections.map((c) => (
                <section key={c.id} className="site00-control-panel">
                  <h2 className="site00-control-panel__title">{c.displayName}</h2>
                  <p className="site00-orchestration-meta">{formatEvolveLabel(c.providerCategory)} · {c.providerKey}</p>
                  <p>
                    <span className={evolveStatusPillClass(c.status)}>{formatEvolveLabel(c.status)}</span>{' '}
                    <span className={evolveStatusPillClass(c.health)}>{formatEvolveLabel(c.health)}</span>
                  </p>
                  {c.externalAccountName ? (
                    <p className="site00-orchestration-meta">Account: {c.externalAccountName}</p>
                  ) : null}
                  {c.externalPropertyName ? (
                    <p className="site00-orchestration-meta">Property: {c.externalPropertyName}</p>
                  ) : null}
                  {c.recommendedAction ? <p className="site00-evolve-ops-callout">{c.recommendedAction}</p> : null}
                  <ul className="site00-evolve-ops-list">
                    {Object.entries(c.capabilityMap).slice(0, 6).map(([cap, avail]) => (
                      <li key={cap}>
                        {cap}: {avail}
                      </li>
                    ))}
                  </ul>
                  <div className="site00-evolve-ops-actions">
                    <button type="button" className="site00-control-btn site00-control-btn--ghost" disabled={busy} onClick={() => void verify(c.id)}>
                      VERIFY
                    </button>
                    <button type="button" className="site00-control-btn site00-control-btn--ghost" disabled={busy} onClick={() => void sync(c.id)}>
                      SYNC NOW
                    </button>
                    <button type="button" className="site00-control-btn site00-control-btn--ghost" disabled={busy} onClick={() => void disconnect(c.id)}>
                      DISCONNECT
                    </button>
                  </div>
                </section>
              ))
            )}
          </div>
        </>
      ) : null}
    </EvolveOrgShell>
  );
}
