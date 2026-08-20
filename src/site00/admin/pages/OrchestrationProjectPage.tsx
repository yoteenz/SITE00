import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ControlPageHeader } from '../components/control/ControlPageHeader';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { ProjectSwitcher } from '../components/orchestration/ProjectSwitcher';
import { LaunchManifestPanel } from '../components/orchestration/LaunchManifestPanel';
import { NeedsYouPanel } from '../components/orchestration/NeedsYouPanel';
import { ExternalConnectionHealthPanel, DriftVisibilityPanel } from '../components/orchestration/ExternalConnectionHealthPanel';
import { OrchestrationCommandQueue } from '../components/orchestration/OrchestrationCommandQueue';
import { ActivityLedger } from '../components/control/ActivityLedger';
import { site00OrchestrationApi } from '../services/orchestrationApi';
import type { ProjectControlSnapshot } from '../types/orchestration';
import { SITE00_ADMIN_ROUTES } from '../config/routes';

export default function OrchestrationProjectPage() {
  const { orgSlug = '' } = useParams<{ orgSlug: string }>();
  const [data, setData] = useState<ProjectControlSnapshot | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string; clientFacing?: boolean }>>([]);
  const [commandQueue, setCommandQueue] = useState<Array<import('../types/orchestration').CommandQueueDisplayItem>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orgSlug) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, dash] = await Promise.all([
        site00OrchestrationApi.project(orgSlug),
        site00OrchestrationApi.dashboard(),
      ]);
      setData(detail);
      setOrganizations(dash.organizations.map((o) => ({ slug: o.slug, name: o.name, clientFacing: o.clientFacing })));
      setCommandQueue(dash.commandQueue.filter((c) => c.organizationSlug === orgSlug));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'FAILED TO LOAD PROJECT');
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const isInfrastructure = data?.organization.classification === 'PRODUCTION_INFRASTRUCTURE';

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / CONTROL · PROJECT"
        title={data?.organization.name ?? orgSlug.toUpperCase()}
        subtitle={isInfrastructure ? 'Production infrastructure — not a client launch brand' : 'Operational project control'}
        actions={<ProjectSwitcher organizations={organizations} selected={orgSlug} includeAll />}
      />

      <ul className="site00-email-debug-index">
        <li><Link to={SITE00_ADMIN_ROUTES.dashboard}>← COMMAND</Link></li>
        <li><Link to={SITE00_ADMIN_ROUTES.reconciliation}>RECONCILIATION INBOX →</Link></li>
      </ul>

      {loading ? <p>Loading project control…</p> : null}
      {error ? <p className="site00-orchestration-error">{error}</p> : null}

      {data ? (
        <div className="site00-orchestration-grid">
          <section className="site00-control-panel">
            <h2 className="site00-control-panel__title">PROJECT IDENTITY</h2>
            <p>{data.organization.name} · {data.organization.classification.replace(/_/g, ' ')}</p>
            <p className="site00-orchestration-meta">Reconciliation: {data.organization.reconciliation_state.replace(/_/g, ' ')}</p>
            <p className="site00-orchestration-meta">Health: {data.organization.project_health ?? '—'}</p>
          </section>

          {!isInfrastructure && data.launchTarget ? (
            <LaunchManifestPanel
              requirements={data.requirements}
              targetName={data.launchTarget.name}
              isProvisional={data.launchTarget.isProvisional}
              readinessExplanation={data.readiness?.explanation ?? []}
              readinessScore={data.readiness?.readinessScore ?? null}
              completeItems={data.readiness?.completeItems ?? 0}
              requiredItems={data.readiness?.requiredItems ?? 0}
              blockingReasons={
                data.readiness?.contributingRequirements
                  ?.filter((c) => c.blockingReason)
                  .map((c) => c.blockingReason!) ?? []
              }
            />
          ) : null}

          {isInfrastructure ? (
            <section className="site00-control-panel">
              <h2 className="site00-control-panel__title">INFRASTRUCTURE STATUS</h2>
              <p>Studio World powers production intelligence. Connection may be PARTIAL until live signal normalization is complete.</p>
              <ExternalConnectionHealthPanel connections={data.connections} />
            </section>
          ) : (
            <>
              <NeedsYouPanel items={data.needsYou} />
              <OrchestrationCommandQueue items={commandQueue} orgFilter={orgSlug} />
              <section className="site00-control-panel">
                <h2 className="site00-control-panel__title">ACTIVE WORKSTREAMS</h2>
                <ul>{data.workstreams.map((w) => <li key={w.key}>{w.title} — {w.status} ({w.stage})</li>)}</ul>
              </section>
              <section className="site00-control-panel">
                <h2 className="site00-control-panel__title">BLOCKERS</h2>
                {data.blockers.length === 0 ? <p className="site00-control-empty">NO BLOCKERS</p> : (
                  <ul>{data.blockers.map((b) => <li key={b.requirementId}>{b.title}: {b.reason}</li>)}</ul>
                )}
              </section>
              <section className="site00-control-panel">
                <h2 className="site00-control-panel__title">NEXT ACTIONS</h2>
                <ul>{data.nextActions.map((a, i) => <li key={i}>{a.action}{a.blocker ? ` — ${a.blocker}` : ''}</li>)}</ul>
              </section>
              <section className="site00-control-panel">
                <h2 className="site00-control-panel__title">EVIDENCE</h2>
                <ul>{data.evidence.slice(0, 10).map((e, i) => <li key={i}>[{e.confidence}] {e.title} {e.repository ?? ''} {e.sourcePath ?? ''}</li>)}</ul>
              </section>
              <section className="site00-control-panel">
                <h2 className="site00-control-panel__title">DEFERRED → EVOLVE</h2>
                {data.evolveItems.length === 0 ? <p className="site00-control-empty">NONE</p> : (
                  <ul>{data.evolveItems.map((e, i) => <li key={i}>{e.title} — {e.status}</li>)}</ul>
                )}
              </section>
            </>
          )}

          <ExternalConnectionHealthPanel connections={data.connections} />
          <DriftVisibilityPanel alerts={data.driftAlerts} />
          <ActivityLedger
            items={data.activity.map((a) => ({
              id: a.id,
              summary: a.summary,
              eventType: a.eventType,
              projectName: a.organizationName,
              timestamp: a.timestamp,
              clockTime: a.clockTime,
            }))}
          />
        </div>
      ) : null}
    </Site00AdminShell>
  );
}
