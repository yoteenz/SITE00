import type { ReactNode } from 'react';
import type { GuidedWorkflowStep } from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import {
  GUIDED_WORKFLOW_STEP_LABELS,
  GUIDED_WORKFLOW_STEP_NUMBERS,
  GUIDED_WORKFLOW_STEPS,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';

export function FounderCreativeWorkflowStepper({
  currentStep,
  onSelect,
}: {
  currentStep: GuidedWorkflowStep;
  onSelect?: (step: GuidedWorkflowStep) => void;
}) {
  return (
    <nav className="site00-fci-gw__stepper" aria-label="Creative ingestion workflow">
      {GUIDED_WORKFLOW_STEPS.map((step) => {
        const active = step === currentStep;
        const complete = GUIDED_WORKFLOW_STEP_NUMBERS[step] < GUIDED_WORKFLOW_STEP_NUMBERS[currentStep];
        return (
          <button
            key={step}
            type="button"
            className={`site00-fci-gw__step${active ? ' site00-fci-gw__step--active' : ''}${complete ? ' site00-fci-gw__step--complete' : ''}`}
            onClick={() => onSelect?.(step)}
            disabled={!onSelect}
          >
            <span className="site00-fci-gw__step-num">{String(GUIDED_WORKFLOW_STEP_NUMBERS[step]).padStart(2, '0')}</span>
            <span className="site00-fci-gw__step-label">{GUIDED_WORKFLOW_STEP_LABELS[step]}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function FounderCreativeWorkflowStageHeader({
  step,
  sequenceTitle,
  subtitle,
  badge,
}: {
  step: GuidedWorkflowStep;
  sequenceTitle: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <header className="site00-fci-gw__stage-header">
      <p className="site00-fci-gw__stage-kicker">
        Step {GUIDED_WORKFLOW_STEP_NUMBERS[step]} · {GUIDED_WORKFLOW_STEP_LABELS[step]}
      </p>
      <h2 className="site00-fci-gw__stage-title">{sequenceTitle}</h2>
      {subtitle ? <p className="site00-fci-gw__stage-subtitle">{subtitle}</p> : null}
      {badge ? <span className="site00-fci-gw__stage-badge">{badge}</span> : null}
    </header>
  );
}

export function FounderCreativeWorkflowFooterActions({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <footer className="site00-fci-gw__footer">
      <div className="site00-fci-gw__footer-primary">{primary}</div>
      {secondary ? <div className="site00-fci-gw__footer-secondary">{secondary}</div> : null}
    </footer>
  );
}
