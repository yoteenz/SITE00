/**
 * P0.VR.8R3R1 — Capture orchestration inspector (Design → MORE) — API-backed.
 */

import { useEffect, useState } from 'react';
import type { CaptureOrchestrationInspectorState } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';

type Props = {
  projectId: string;
};

export function DesignCaptureOrchestrationInspector({ projectId }: Props) {
  const [inspector, setInspector] = useState<CaptureOrchestrationInspectorState | null>(null);

  useEffect(() => {
    void fetch(`/api/site00/page-mirror?projectId=${encodeURIComponent(projectId)}&view=capture-orchestration`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setInspector(data as CaptureOrchestrationInspectorState))
      .catch(() => setInspector(null));
  }, [projectId]);

  if (!inspector) {
    return (
      <section className="site00-dw-recovery-inspector" data-panel="capture-orchestration">
        <p>LOADING CAPTURE ORCHESTRATION…</p>
      </section>
    );
  }

  const run = inspector.activeRun;
  const worker = inspector.workerHealth;

  return (
    <section className="site00-dw-recovery-inspector" data-panel="capture-orchestration">
      <header className="site00-dw-recovery-inspector__head">
        <h3>CAPTURE ORCHESTRATION</h3>
        <span className="site00-dw-recovery-inspector__status">{worker.status}</span>
      </header>

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
          <dd>{inspector.queuedJobs}</dd>
        </div>
        <div>
          <dt>CAPTURING</dt>
          <dd>{inspector.capturingJobs}</dd>
        </div>
        <div>
          <dt>COMPLETED</dt>
          <dd>{inspector.completedJobs}</dd>
        </div>
        <div>
          <dt>FAILED</dt>
          <dd>{inspector.failedJobs}</dd>
        </div>
        <div>
          <dt>WORKER ID</dt>
          <dd>{worker.workerId}</dd>
        </div>
        <div>
          <dt>CONCURRENCY</dt>
          <dd>{inspector.concurrencyLimit}</dd>
        </div>
        <div>
          <dt>LAST DISPATCH</dt>
          <dd>{inspector.lastDispatchAt ?? '—'}</dd>
        </div>
        <div>
          <dt>LAST ERROR</dt>
          <dd>{inspector.lastError ?? '—'}</dd>
        </div>
        <div>
          <dt>DEPLOYMENT TARGET</dt>
          <dd>{inspector.deploymentTarget}</dd>
        </div>
        <div>
          <dt>API BUILD</dt>
          <dd>{inspector.buildReceipt?.apiBuild ?? '—'}</dd>
        </div>
      </dl>

      {inspector.lastEvent ? (
        <p className="site00-dw-recovery-inspector__event">
          LAST EVENT · {inspector.lastEvent.route ?? '—'} · {inspector.lastEvent.viewport ?? '—'} ·{' '}
          {inspector.lastEvent.message}
        </p>
      ) : null}

      {inspector.recentRuns.length ? (
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
