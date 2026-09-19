/**
 * P0.PCI.3 — Bottom reconstruction workflow step rail + primary CTA.
 */

import {
  RECONSTRUCTION_WORKFLOW_STEPS,
  WORKFLOW_STEP_LABELS,
  type WorkflowAction,
} from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyWorkflow.js';
import type { ReconstructionWorkflowStep } from '../../../../../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';

type Props = {
  currentStep: ReconstructionWorkflowStep;
  action: WorkflowAction;
  onPrimary: () => void;
  onSecondary?: () => void;
  reviewLabel?: string;
};

export function ReconstructionWorkflowRail({ currentStep, action, onPrimary, onSecondary, reviewLabel }: Props) {
  const currentIdx = RECONSTRUCTION_WORKFLOW_STEPS.indexOf(currentStep);

  return (
    <footer className="site00-pfw-workflow">
      <div className="site00-pfw-workflow__rail" aria-label="Reconstruction workflow">
        <p className="site00-pfw-workflow__kicker">RECONSTRUCTION WORKFLOW · STEP {action.stepIndex} OF 5</p>
        <ol>
          {RECONSTRUCTION_WORKFLOW_STEPS.map((step, idx) => (
            <li
              key={step}
              className={`${idx < currentIdx ? 'is-done' : ''}${idx === currentIdx ? ' is-current' : ''}`}
            >
              <span aria-hidden>{idx < currentIdx ? '✓' : idx + 1}</span>
              <span>{WORKFLOW_STEP_LABELS[step]}</span>
            </li>
          ))}
        </ol>
        {reviewLabel ? <p className="site00-pfw-workflow__review">{reviewLabel}</p> : null}
      </div>
      <div className="site00-pfw-workflow__actions">
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onPrimary}>
          {action.primaryLabel}
        </button>
        {action.secondaryLabel && onSecondary ? (
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onSecondary}>
            {action.secondaryLabel}
          </button>
        ) : null}
      </div>
    </footer>
  );
}
