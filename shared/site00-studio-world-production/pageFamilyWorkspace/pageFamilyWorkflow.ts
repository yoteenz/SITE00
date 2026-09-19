/**
 * P0.PCI.3 — Reconstruction workflow primary actions.
 */

import { RECONSTRUCTION_WORKFLOW_STEPS, type PageFamily, type ReconstructionWorkflowStep } from './types.js';

export { RECONSTRUCTION_WORKFLOW_STEPS };
import {
  getWorkflowStep,
  isFamilyApproved,
  isFamilyStructureConfirmed,
} from './pageFamilyStore.js';

export type WorkflowAction = {
  primaryLabel: string;
  secondaryLabel?: string;
  step: ReconstructionWorkflowStep;
  stepIndex: number;
};

export function resolveWorkflowAction(family: PageFamily): WorkflowAction {
  const step = getWorkflowStep(family.familyId);
  const structureOk = isFamilyStructureConfirmed(family.familyId);
  const familyOk = isFamilyApproved(family.familyId);
  const derivatives = family.nodes.filter((n) => n.level > 0);
  const pendingDesign = derivatives.filter((n) => n.designStatus !== 'APPROVED');

  if (step === 'DETECT_LINKS' || !structureOk) {
    return { primaryLabel: 'CONFIRM FAMILY', secondaryLabel: 'EDIT STRUCTURE', step: 'CONFIRM_FAMILY', stepIndex: 2 };
  }
  if (!familyOk) {
    return { primaryLabel: 'APPROVE FAMILY', step: 'CONFIRM_FAMILY', stepIndex: 2 };
  }
  if (pendingDesign.length > 0) {
    return {
      primaryLabel: 'APPROVE DESIGN',
      secondaryLabel: 'NEXT CHILD',
      step: 'REVIEW_CHILD',
      stepIndex: 3,
    };
  }
  return { primaryLabel: 'VERIFY WIRING', step: 'VERIFY_WIRING', stepIndex: 5 };
}

export const WORKFLOW_STEP_LABELS: Record<ReconstructionWorkflowStep, string> = {
  DETECT_LINKS: 'DETECT LINKS',
  CONFIRM_FAMILY: 'CONFIRM FAMILY',
  REVIEW_CHILD: 'REVIEW CHILD',
  APPROVE_DESIGN: 'APPROVE DESIGN',
  VERIFY_WIRING: 'VERIFY WIRING',
};
