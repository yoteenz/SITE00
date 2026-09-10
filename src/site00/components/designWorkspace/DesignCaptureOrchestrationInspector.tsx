/**
 * P0.VR.8R3R3 — Capture orchestration + transport inspector (Design → MORE).
 */

import { useCallback, useEffect, useState } from 'react';
import type { CaptureOrchestrationInspectorState } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';
import type { CaptureTransportHealth } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportReceipt.js';
import { captureApiFetch, PAGE_MIRROR_PATH } from '../../services/captureApiFetch';
import { checkCaptureTransportHealth } from '../../services/checkCaptureTransportHealth';

type Props = {
  projectId: string;
};

export function DesignCaptureOrchestrationInspector({ projectId }: Props) {
  const [inspector, setInspector] = useState<CaptureOrchestrationInspectorState | null>(null);
  const [transport, setTransport] = useState<CaptureTransportHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [orch, transportResult] = await Promise.all([
      captureApiFetch<CaptureOrchestrationInspectorState>(
        `${PAGE_MIRROR_PATH}?projectId=${encodeURIComponent(projectId)}&view=capture-orchestration`,
      ),
      checkCaptureTransportHealth(projectId),
    ]);
    setInspector(orch.ok ? orch.data : null);
    setTransport(transportResult.health);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !inspector && !transport) {
    return (
      <section className="site00-dw-recovery-inspector" data-panel="capture-orchestration">
        <p>LOADING CAPTURE ORCHESTRATION…</p>
      </section>
    );
  }

  const run = inspector?.activeRun;
  const worker = inspector?.workerHealth;

  return (
    <section className="site00-dw-recovery-inspector" data-panel="capture-orchestration">
      <header className="site00-dw-recovery-inspector__head">
        <h3>CAPTURE ORCHESTRATION</h3>
        <span className="site00-dw-recovery-inspector__status">{transport?.status ?? worker?.status ?? '—'}</span>
      </header>

      <h4>TRANSPORT</h4>
      <dl className="site00-dw-recovery-inspector__grid">
        <div>
          <dt>FRONTEND BUILD</dt>
          <dd>{transport?.frontendBuild ?? '—'}</dd>
        </div>
        <div>
          <dt>API BUILD</dt>
          <dd>{transport?.apiBuild ?? inspector?.buildReceipt?.apiBuild ?? '—'}</dd>
        </div>
        <div>
          <dt>WORKER BUILD</dt>
          <dd>{transport?.workerBuild ?? inspector?.buildReceipt?.workerBuild ?? '—'}</dd>
        </div>
        <div>
          <dt>API BASE URL</dt>
          <dd>{transport?.apiBaseUrl ?? '—'}</dd>
        </div>
        <div>
          <dt>HEALTH ENDPOINT</dt>
          <dd>{transport?.healthEndpoint ?? '—'}</dd>
        </div>
        <div>
          <dt>API REACHABLE</dt>
          <dd>{transport?.apiReachable ? 'YES' : 'NO'}</dd>
        </div>
        <div>
          <dt>CORS</dt>
          <dd>{transport?.corsAllowed ? 'ALLOWED' : 'BLOCKED'}</dd>
        </div>
        <div>
          <dt>AUTH</dt>
          <dd>{transport?.authValid ? 'VALID' : 'FAILED'}</dd>
        </div>
        <div>
          <dt>CONTRACT</dt>
          <dd>{transport?.contractVersion ?? '—'}</dd>
        </div>
        <div>
          <dt>WORKER STATUS</dt>
          <dd>{transport?.workerStatus ?? worker?.status ?? '—'}</dd>
        </div>
        <div>
          <dt>LAST CHECK</dt>
          <dd>{transport?.lastCheckedAt ?? '—'}</dd>
        </div>
        <div>
          <dt>LAST ERROR</dt>
          <dd>{transport?.errors[0]?.replace(/_/g, ' ') ?? inspector?.lastError ?? '—'}</dd>
        </div>
      </dl>

      <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={() => void load()}>
        RETRY CONNECTION
      </button>

      <h4>ORCHESTRATION</h4>
      <dl className="site00-dw-recovery-inspector__grid">
        <div>
          <dt>ACTIVE RUN</dt>
          <dd>{run?.runId ?? '—'}</dd>
        </div>
        <div>
          <dt>RUN STATUS</dt>
          <dd>{run?.status ?? '—'}</dd>
        </div>
        <div>
          <dt>TOTAL TARGETS</dt>
          <dd>{run?.totalTargets ?? '—'}</dd>
        </div>
        <div>
          <dt>QUEUED JOBS</dt>
          <dd>{inspector?.queuedJobs ?? '—'}</dd>
        </div>
        <div>
          <dt>CAPTURING</dt>
          <dd>{inspector?.capturingJobs ?? '—'}</dd>
        </div>
        <div>
          <dt>COMPLETED</dt>
          <dd>{inspector?.completedJobs ?? '—'}</dd>
        </div>
        <div>
          <dt>FAILED</dt>
          <dd>{inspector?.failedJobs ?? '—'}</dd>
        </div>
        <div>
          <dt>WORKER ID</dt>
          <dd>{worker?.workerId ?? '—'}</dd>
        </div>
        <div>
          <dt>CONCURRENCY</dt>
          <dd>{inspector?.concurrencyLimit ?? '—'}</dd>
        </div>
        <div>
          <dt>LAST DISPATCH</dt>
          <dd>{inspector?.lastDispatchAt ?? '—'}</dd>
        </div>
        <div>
          <dt>DEPLOYMENT TARGET</dt>
          <dd>{inspector?.deploymentTarget ?? '—'}</dd>
        </div>
      </dl>

      {inspector?.lastEvent ? (
        <p className="site00-dw-recovery-inspector__event">
          LAST EVENT · {inspector.lastEvent.route ?? '—'} · {inspector.lastEvent.viewport ?? '—'} ·{' '}
          {inspector.lastEvent.message}
        </p>
      ) : null}

      {inspector?.recentRuns.length ? (
        <details>
          <summary>RECENT RUNS ({inspector.recentRuns.length})</summary>
          <ul>
            {inspector.recentRuns.map((r) => (
              <li key={r.runId}>
                {r.startedAt.slice(0, 10)} — {r.totalTargets} targets — {r.status} — ✓{r.completedCount} ✗{r.failedCount}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
