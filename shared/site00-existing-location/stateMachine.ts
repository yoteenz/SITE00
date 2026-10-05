import type { ExistingLocationCaseStatus } from './types';

/** Allowed client-driven transitions (server enforces). */
export const CLIENT_ALLOWED_TRANSITIONS: Partial<Record<ExistingLocationCaseStatus, ExistingLocationCaseStatus[]>> = {
  DRAFT: ['INTAKE_COMPLETE'],
  INTAKE_COMPLETE: ['ACCESS_REQUIRED'],
  QUOTE_READY: ['AWAITING_CLIENT_APPROVAL'],
  AWAITING_CLIENT_APPROVAL: ['APPROVED'],
  APPROVED: ['CHECKOUT_PENDING'],
  CHECKOUT_PENDING: ['PAID', 'COMPLIMENTARY_APPROVED'],
};

export function canClientTransition(from: ExistingLocationCaseStatus, to: ExistingLocationCaseStatus): boolean {
  return CLIENT_ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminalStatus(status: ExistingLocationCaseStatus): boolean {
  return status === 'COMPLETE' || status === 'CANCELLED';
}
