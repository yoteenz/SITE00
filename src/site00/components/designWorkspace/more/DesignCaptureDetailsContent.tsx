/**
 * P0.VR.MOF.R2 — Raw capture diagnostics (details drawer only).
 */

import type { CaptureOrchestrationInspectorState } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';
import type { CaptureTransportHealth } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportReceipt.js';

type Props = {
  inspector: CaptureOrchestrationInspectorState | null;
  transport: CaptureTransportHealth | null;
};

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="site00-dw-more-tool__detail-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function DetailGrid({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <dl className="site00-dw-more-tool__detail-grid">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DesignCaptureDetailsContent({ inspector, transport }: Props) {
  const run = inspector?.activeRun;
  const worker = inspector?.workerHealth;

  return (
    <div className="site00-dw-more-tool__details">
      <DetailSection title="TRANSPORT">
        <DetailGrid
          rows={[
            { label: 'FRONTEND BUILD', value: transport?.frontendBuild ?? '—' },
            { label: 'API BUILD', value: transport?.apiBuild ?? inspector?.buildReceipt?.apiBuild ?? '—' },
            { label: 'WORKER BUILD', value: transport?.workerBuild ?? inspector?.buildReceipt?.workerBuild ?? '—' },
            { label: 'API BASE URL', value: transport?.apiBaseUrl ?? '—' },
            { label: 'HEALTH ENDPOINT', value: transport?.healthEndpoint ?? '—' },
            { label: 'API REACHABLE', value: transport?.apiReachable ? 'YES' : 'NO' },
            { label: 'CORS', value: transport?.corsAllowed ? 'ALLOWED' : 'BLOCKED' },
            { label: 'AUTH', value: transport?.authValid ? 'VALID' : 'FAILED' },
            { label: 'CONTRACT', value: transport?.contractVersion ?? '—' },
            { label: 'LAST CHECK', value: transport?.lastCheckedAt ?? '—' },
          ]}
        />
      </DetailSection>

      <DetailSection title="WORKER">
        <DetailGrid
          rows={[
            { label: 'WORKER ID', value: transport?.workerId ?? worker?.workerId ?? '—' },
            { label: 'STATUS', value: transport?.workerStatus ?? worker?.status ?? '—' },
            {
              label: 'LAST HEARTBEAT',
              value:
                transport?.heartbeatAgeMs != null
                  ? `${Math.round(transport.heartbeatAgeMs / 1000)}s AGO`
                  : transport?.lastHeartbeat ?? worker?.lastHeartbeat ?? '—',
            },
            { label: 'ACTIVE JOBS', value: String(worker?.activeJobCount ?? '—') },
            { label: 'QUEUE DEPTH', value: String(worker?.queueDepth ?? inspector?.queuedJobs ?? '—') },
          ]}
        />
      </DetailSection>

      <DetailSection title="BROWSER">
        <DetailGrid
          rows={[
            { label: 'BROWSER', value: transport?.browserReady ? 'READY' : 'NOT READY' },
            { label: 'PLAYWRIGHT', value: transport?.playwrightReady ? 'READY' : 'NOT READY' },
            { label: 'DEPENDENCIES', value: transport?.missingLibraries?.length ? 'MISSING' : transport?.browserReady ? 'READY' : 'UNKNOWN' },
            { label: 'CHROMIUM REV', value: transport?.chromiumRevision ?? '—' },
            { label: 'EXECUTABLE', value: transport?.chromiumExecutablePath ?? '—' },
            { label: 'MISSING LIBS', value: transport?.missingLibraries?.length ? transport.missingLibraries.join(', ') : '—' },
            { label: 'DEPLOY STRATEGY', value: transport?.deploymentStrategy ?? '—' },
            { label: 'TEST JOB', value: transport?.testJobPassed ? 'PASSED' : 'NOT RUN' },
            { label: 'TEST SCREENSHOT', value: transport?.testScreenshotPath ?? '—' },
          ]}
        />
      </DetailSection>

      <DetailSection title="QUEUE">
        <DetailGrid
          rows={[
            { label: 'QUEUED JOBS', value: String(inspector?.queuedJobs ?? '—') },
            { label: 'CAPTURING', value: String(inspector?.capturingJobs ?? '—') },
            { label: 'COMPLETED', value: String(inspector?.completedJobs ?? '—') },
            { label: 'FAILED', value: String(inspector?.failedJobs ?? '—') },
            { label: 'CONCURRENCY', value: String(inspector?.concurrencyLimit ?? '—') },
          ]}
        />
      </DetailSection>

      <DetailSection title="BUILD">
        <DetailGrid
          rows={[
            { label: 'FRONTEND', value: transport?.frontendBuild ?? '—' },
            { label: 'API', value: transport?.apiBuild ?? '—' },
            { label: 'WORKER', value: transport?.workerBuild ?? '—' },
            { label: 'DEPLOYMENT TARGET', value: inspector?.deploymentTarget ?? '—' },
          ]}
        />
      </DetailSection>

      <DetailSection title="ERRORS">
        <DetailGrid
          rows={[
            {
              label: 'LAST ERROR',
              value: transport?.lastError?.replace(/_/g, ' ') ?? transport?.errors[0]?.replace(/_/g, ' ') ?? inspector?.lastError ?? '—',
            },
            { label: 'RUN STATUS', value: run?.status ?? '—' },
            { label: 'ACTIVE RUN', value: run?.runId ?? '—' },
          ]}
        />
      </DetailSection>

      {inspector?.lastEvent ? (
        <p className="site00-dw-more-tool__detail-event">
          EVENT · {inspector.lastEvent.route ?? '—'} · {inspector.lastEvent.message}
        </p>
      ) : null}

      {inspector?.recentRuns.length ? (
        <details className="site00-dw-more-tool__detail-expand">
          <summary>RECENT RUNS ({inspector.recentRuns.length})</summary>
          <ul>
            {inspector.recentRuns.map((r) => (
              <li key={r.runId}>
                {r.startedAt.slice(0, 10)} — {r.totalTargets} targets — {r.status}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
