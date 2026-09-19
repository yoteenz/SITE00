/**
 * P0.VR.MOF.R2 — Capture test worker wizard screen (separate state, not inline dump).
 */

import {
  TEST_WORKER_PROGRESS_STEPS,
  testWorkerStepLabel,
  type TestWorkerProgressStep,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureFounderGuidance.js';

type Props = {
  currentStep: TestWorkerProgressStep | null;
  failed: boolean;
  mode: 'testing' | 'success' | 'failure';
  onRetry?: () => void;
  onReturn?: () => void;
  onViewDetails?: () => void;
  onViewTestResult?: () => void;
};

export function CaptureTestWorkerFlow({
  currentStep,
  failed,
  mode,
  onRetry,
  onReturn,
  onViewDetails,
  onViewTestResult,
}: Props) {
  const steps = TEST_WORKER_PROGRESS_STEPS;
  const activeIdx = currentStep ? steps.indexOf(currentStep as (typeof steps)[number]) : failed ? -1 : 0;
  const activeStep =
    currentStep && steps.includes(currentStep as (typeof steps)[number])
      ? currentStep
      : steps[Math.max(activeIdx, 0)];

  if (mode === 'success') {
    return (
      <div className="site00-dw-more-tool__test-flow" data-mode="success">
        <p className="site00-dw-more-tool__test-headline">WORKER READY ✓</p>
        <ul className="site00-dw-more-tool__test-checklist">
          <li>BROWSER READY</li>
          <li>TEST CAPTURE COMPLETE</li>
        </ul>
        <div className="site00-dw-more-tool__actions">
          {onReturn ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onReturn}>
              RETURN TO PAGES
            </button>
          ) : null}
          {onViewTestResult ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onViewTestResult}>
              VIEW TEST RESULT
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (mode === 'failure') {
    return (
      <div className="site00-dw-more-tool__test-flow" data-mode="failure">
        <p className="site00-dw-more-tool__test-headline">WORKER NEEDS ATTENTION</p>
        <p className="site00-dw-more-tool__test-support">
          Chromium is installed, but a required system library may be missing. Retry the test or view details.
        </p>
        <p className="site00-dw-more-tool__test-code">WORKER_TEST_FAILED</p>
        <div className="site00-dw-more-tool__actions">
          {onRetry ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onRetry}>
              RETRY TEST
            </button>
          ) : null}
          {onViewDetails ? (
            <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onViewDetails}>
              VIEW DETAILS
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="site00-dw-more-tool__test-flow" data-mode="testing" aria-label="Test worker progress">
      <p className="site00-dw-more-tool__test-headline">TESTING CAPTURE WORKER</p>
      <p className="site00-dw-more-tool__test-active">{testWorkerStepLabel(activeStep as TestWorkerProgressStep)}</p>
      <ol className="site00-dw-more-tool__test-steps">
        {steps.map((step, idx) => {
          const done = currentStep === 'COMPLETE' || idx < activeIdx;
          const active = step === activeStep && currentStep !== 'COMPLETE';
          return (
            <li
              key={step}
              className={`${done ? 'is-done' : ''}${active ? ' is-active' : ''}${failed && idx === activeIdx ? ' is-failed' : ''}`}
            >
              <span aria-hidden>{done ? '✓' : active ? '◉' : '○'}</span>
              <span>{testWorkerStepLabel(step)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
