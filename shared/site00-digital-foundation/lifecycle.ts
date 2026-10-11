import type { DigitalFoundationArtifactState } from './types.js';

const ALLOWED: Record<DigitalFoundationArtifactState, DigitalFoundationArtifactState[]> = {
  INVITED: ['OPENED', 'ARCHIVED'],
  OPENED: ['INTAKE_IN_PROGRESS', 'ARCHIVED'],
  INTAKE_IN_PROGRESS: ['INTAKE_COMPLETE', 'OPENED', 'ARCHIVED'],
  INTAKE_COMPLETE: ['RECOMMENDATION_READY', 'ARCHIVED'],
  RECOMMENDATION_READY: ['QUOTE_READY', 'INTAKE_IN_PROGRESS', 'ARCHIVED'],
  QUOTE_READY: ['AWAITING_ACCEPTANCE', 'RECOMMENDATION_READY', 'ARCHIVED'],
  AWAITING_ACCEPTANCE: ['AWAITING_PAYMENT', 'QUOTE_READY', 'ARCHIVED'],
  AWAITING_PAYMENT: ['PAID', 'AWAITING_ACCEPTANCE', 'ARCHIVED'],
  PAID: ['PROJECT_ACTIVE', 'ARCHIVED'],
  PROJECT_ACTIVE: ['IN_PROGRESS', 'WAITING_ON_CLIENT', 'WAITING_ON_PROVIDER', 'ARCHIVED'],
  IN_PROGRESS: ['WAITING_ON_CLIENT', 'WAITING_ON_PROVIDER', 'FINAL_VERIFICATION', 'ARCHIVED'],
  WAITING_ON_CLIENT: ['IN_PROGRESS', 'WAITING_ON_PROVIDER', 'ARCHIVED'],
  WAITING_ON_PROVIDER: ['IN_PROGRESS', 'WAITING_ON_CLIENT', 'ARCHIVED'],
  FINAL_VERIFICATION: ['COMPLETE', 'IN_PROGRESS', 'ARCHIVED'],
  COMPLETE: ['BUILD_OPPORTUNITY', 'ARCHIVED'],
  BUILD_OPPORTUNITY: ['ARCHIVED'],
  ARCHIVED: [],
};

export function canTransitionArtifactState(
  from: DigitalFoundationArtifactState,
  to: DigitalFoundationArtifactState,
): boolean {
  if (from === to) return true;
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertArtifactTransition(
  from: DigitalFoundationArtifactState,
  to: DigitalFoundationArtifactState,
): void {
  if (!canTransitionArtifactState(from, to)) {
    throw new Error(`INVALID_ARTIFACT_TRANSITION:${from}->${to}`);
  }
}
