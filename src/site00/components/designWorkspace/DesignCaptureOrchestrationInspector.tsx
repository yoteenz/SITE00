/**
 * P0.VR.8R3 — Capture orchestration inspector (Design → MORE).
 */

import { useMemo } from 'react';
import { buildCaptureOrchestrationInspectorState } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';

type Props = {
  projectId: string;
};

export function DesignCaptureOrchestrationInspector({ projectId }: Props) {
  const inspector = useMemo(() => buildCaptureOrchestrationInspectorState(projectId), [projectId]);
  const run = inspector.activeRun;

  return (
    <section className="site00-dw-recovery-inspector" data-panel="capture-orchestration">
      <header className="site00-dw-recovery-inspector__head">
        <h3>CAPTURE ORCHESTRATION</h3>
        <span className="site00-dw-recovery-inspector__status">{inspector.workerHealth.status}</span>
      </header>

      <dl className="site00-dw-recovery-inspector__grid">
        <div>
          <dt>ACTIVE RUN</dt>
          <dd>{run?.captureRefreshRunId ?? '—'}</dd>
        </div>
        <div>
          <dt>RUN STATUS</dt>
          <dd>{run?.status ?? '—'}</dd>
        </div>
        <div>
          <dt>TOTAL PAGES</dt>
          <dd>{run?.totalPages ?? '—'}</dd>
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
      </dl>

      {inspector.recentRuns.length ? (
        <details>
          <summary>RECENT RUNS ({inspector.recentRuns.length})</summary>
          <ul>
            {inspector.recentRuns.map((r) => (
              <li key={r.captureRefreshRunId}>
                {r.startedAt.slice(0, 10)} — {r.totalPages} pages — {r.status} — ✓{r.completedCount} ✗{r.failedCount}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
