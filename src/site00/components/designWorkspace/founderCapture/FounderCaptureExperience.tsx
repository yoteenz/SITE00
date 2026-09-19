/**
 * P0.VR.8R3R5 — Founder-facing capture workflow UI (presentation only).
 */

import { useMemo, useState } from 'react';
import type { CaptureTransportHealth } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureTransportReceipt.js';
import type { ProjectCaptureRunContract } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/browserClient.js';
import {
  buildCaptureFounderGuidance,
  founderSummaryChips,
  testWorkerStepLabel,
  TEST_WORKER_PROGRESS_STEPS,
  type CaptureFounderGuidanceInput,
  type TestWorkerProgressStep,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureFounderGuidance.js';
import { FOUNDER_CAPTURE_WORKFLOW_STAGES, workflowStageToId } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/founderCaptureWorkflow.js';

type Props = {
  projectName: string;
  guidanceInput: CaptureFounderGuidanceInput;
  transport: CaptureTransportHealth | null;
  run: ProjectCaptureRunContract | null;
  testWorkerProgress: TestWorkerProgressStep | null;
  testingWorker: boolean;
  transportChecking: boolean;
  onPrimaryAction: (action: string) => void;
  onViewDetails?: () => void;
  isNdxbook?: boolean;
};

function TestWorkerProgress({ currentStep, failed }: { currentStep: TestWorkerProgressStep | null; failed: boolean }) {
  const steps = TEST_WORKER_PROGRESS_STEPS;
  const activeIdx = currentStep
    ? steps.indexOf(currentStep as (typeof steps)[number])
    : failed
      ? -1
      : 0;

  return (
    <ol className="site00-founder-capture__test-steps" aria-label="Test worker progress">
      {steps.map((step, idx) => {
        const done = currentStep === 'COMPLETE' || idx < activeIdx;
        const active = currentStep === step || (testingWorkerActive(currentStep, step, idx));
        const failedStep = failed && idx === Math.max(activeIdx, 0);
        return (
          <li
            key={step}
            className={`site00-founder-capture__test-step${done ? ' is-done' : ''}${active ? ' is-active' : ''}${failedStep ? ' is-failed' : ''}`}
          >
            <span className="site00-founder-capture__test-step-icon" aria-hidden>
              {done ? '✓' : active ? '◉' : '○'}
            </span>
            <span>{testWorkerStepLabel(step)}</span>
          </li>
        );
      })}
    </ol>
  );
}

function testingWorkerActive(current: TestWorkerProgressStep | null, _step: TestWorkerProgressStep, idx: number): boolean {
  if (!current || current === 'COMPLETE' || current === 'FAILED') return false;
  const steps = TEST_WORKER_PROGRESS_STEPS;
  return steps[idx] === current;
}

export function FounderCaptureExperience({
  projectName,
  guidanceInput,
  transport,
  run,
  testWorkerProgress,
  testingWorker,
  transportChecking,
  onPrimaryAction,
  onViewDetails,
  isNdxbook = false,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const guidance = useMemo(() => buildCaptureFounderGuidance(guidanceInput), [guidanceInput]);
  const runActive =
    guidanceInput.isRefreshing ||
    (run?.contractValid && ['PLANNING', 'QUEUING', 'CAPTURING'].includes(run.status));
  const chips = founderSummaryChips(guidanceInput.summary, Boolean(runActive));
  const stageId = workflowStageToId(guidance.stage);
  const progressPct =
    run && run.totalTargets > 0
      ? Math.round(((run.completedCount + run.failedCount) / run.totalTargets) * 100)
      : 0;

  return (
    <div className={`site00-founder-capture${isNdxbook ? ' is-ndxbook' : ''}`} data-visual-state={guidance.visualState}>
      <nav className="site00-founder-capture__workflow" aria-label="Capture workflow">
        {FOUNDER_CAPTURE_WORKFLOW_STAGES.map((s) => (
          <span
            key={s.id}
            className={`site00-founder-capture__workflow-step${s.id === stageId ? ' is-current' : ''}`}
          >
            {s.shortLabel}
          </span>
        ))}
      </nav>

      <p className="site00-founder-capture__next-steps">
        <span className="site00-founder-capture__next-label">WHAT HAPPENS NEXT</span>
        {guidance.nextSteps.map((step, i) => (
          <span key={step}>
            {i + 1}. {step}
            {i < guidance.nextSteps.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </p>

      <article className={`site00-founder-capture__service-card is-${guidance.visualState}`}>
        <header>
          <span className="site00-founder-capture__eyebrow">CAPTURE SERVICE</span>
          <strong className="site00-founder-capture__headline">{guidance.headline}</strong>
          <p className="site00-founder-capture__support">{guidance.supportingText}</p>
        </header>

        {!detailsOpen && !testingWorker && guidance.stage === 'SERVICE_CHECK' ? (
          <dl className="site00-founder-capture__service-status">
            <div>
              <dt>API</dt>
              <dd>{guidanceInput.apiConnected ? 'CONNECTED' : 'OFFLINE'}</dd>
            </div>
            <div>
              <dt>WORKER</dt>
              <dd>{guidanceInput.workerHealthy ? 'READY' : 'NOT READY'}</dd>
            </div>
          </dl>
        ) : null}

        {!detailsOpen && guidance.serviceReady && !testingWorker && guidance.stage !== 'SERVICE_CHECK' ? (
          <p className="site00-founder-capture__ready-note">
            {guidance.stage === 'TEST_WORKER' && guidanceInput.testJobPassed
              ? 'WORKER READY ✓ — Test capture completed successfully.'
              : guidance.serviceReady && guidance.stage === 'CAPTURE_PROJECT' && !runActive
                ? 'Everything needed to capture your pages is online.'
                : null}
          </p>
        ) : null}

        {testingWorker || testWorkerProgress ? (
          <TestWorkerProgress
            currentStep={testWorkerProgress}
            failed={guidanceInput.testWorkerFailed || testWorkerProgress === 'FAILED'}
          />
        ) : null}

        {runActive && run && run.totalTargets > 0 ? (
          <div className="site00-founder-capture__progress">
            <div className="site00-founder-capture__progress-head">
              <span>REFRESHING {projectName.toUpperCase()}</span>
              <span>
                {run.completedCount + run.failedCount} / {run.totalTargets}
              </span>
            </div>
            <div className="site00-founder-capture__progress-bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        ) : null}

        <div className="site00-founder-capture__actions">
          {guidance.primaryAction ? (
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-founder-capture__primary"
              disabled={transportChecking || testingWorker || guidance.primaryAction === null}
              onClick={() => onPrimaryAction(guidance.primaryAction!)}
            >
              {testingWorker ? 'TESTING…' : guidance.primaryLabel}
            </button>
          ) : null}
          {(guidance.secondaryAction || onViewDetails) && !testingWorker ? (
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--outline"
              onClick={() => {
                if (guidance.secondaryAction === 'VIEW_DETAILS' || !guidance.secondaryAction) {
                  onViewDetails?.();
                  setDetailsOpen(true);
                } else {
                  onPrimaryAction(guidance.secondaryAction);
                }
              }}
            >
              {guidance.secondaryLabel ?? 'VIEW DETAILS'}
            </button>
          ) : null}
        </div>
      </article>

      <div className="site00-founder-capture__summary">
        {chips.map((chip) => (
          <div key={chip.key} className="site00-founder-capture__summary-chip">
            <strong>{chip.value}</strong>
            <span>{chip.label}</span>
          </div>
        ))}
      </div>

      {detailsOpen && transport ? (
        <details className="site00-founder-capture__details" open>
          <summary onClick={() => setDetailsOpen(false)}>SYSTEM DETAILS</summary>
          <dl className="site00-founder-capture__details-grid">
            <div><dt>API</dt><dd>{transport.apiReachable ? 'CONNECTED' : 'OFFLINE'}</dd></div>
            <div><dt>WORKER</dt><dd>{transport.workerStatus}</dd></div>
            <div><dt>BROWSER</dt><dd>{transport.browserReady ? 'READY' : 'NOT READY'}</dd></div>
            <div><dt>CONTRACT</dt><dd>{transport.contractVersion ?? '—'}</dd></div>
            <div><dt>BUILD</dt><dd>{transport.workerBuild ?? transport.apiBuild ?? '—'}</dd></div>
            {transport.workerId ? <div><dt>WORKER ID</dt><dd className="mono">{transport.workerId}</dd></div> : null}
            {transport.lastHeartbeat ? <div><dt>HEARTBEAT</dt><dd>{transport.lastHeartbeat}</dd></div> : null}
            {transport.lastError ? <div><dt>ERROR</dt><dd className="mono">{transport.lastError}</dd></div> : null}
            {run?.lastEvent ? <div><dt>LAST EVENT</dt><dd>{run.lastEvent.message}</dd></div> : null}
          </dl>
        </details>
      ) : (
        <button type="button" className="site00-founder-capture__details-toggle" onClick={() => setDetailsOpen(true)}>
          VIEW DETAILS
        </button>
      )}
    </div>
  );
}
