import type { ClientActionRequest, ClientActionType } from '../../../shared/site00-digital-foundation/types.js';

export type ClientApprovalDecision = 'APPROVE' | 'REQUEST_CHANGE';

const APPROVAL_ACTION_TYPES = new Set<ClientActionType>([
  'APPROVE_DOMAIN',
  'APPROVE_SIGNATURE',
  'APPROVE_DNS_CHANGE',
  'REVIEW_FINAL_RECORD',
  'CONFIRM_EMAIL_ADDRESS',
  'CONFIRM_PRIMARY_EMAIL',
  'CHOOSE_EMAIL_ADDRESS',
  'CHOOSE_DOMAIN',
]);

export function parseClientApprovalDecision(response: Record<string, unknown>): ClientApprovalDecision {
  const raw = String(response.decision ?? response.action ?? 'APPROVE').toUpperCase();
  if (raw === 'REQUEST_CHANGE' || raw === 'REQUEST-CHANGE' || raw === 'REVISION') {
    return 'REQUEST_CHANGE';
  }
  return 'APPROVE';
}

export function isApprovalGatedAction(actionType: ClientActionType): boolean {
  return APPROVAL_ACTION_TYPES.has(actionType);
}

export function approvalSubjectForAction(actionType: ClientActionType): string {
  switch (actionType) {
    case 'APPROVE_DOMAIN':
    case 'CHOOSE_DOMAIN':
      return 'DOMAIN';
    case 'CONFIRM_EMAIL_ADDRESS':
    case 'CONFIRM_PRIMARY_EMAIL':
    case 'CHOOSE_EMAIL_ADDRESS':
      return 'EMAIL_ADDRESS';
    case 'APPROVE_SIGNATURE':
      return 'SIGNATURE';
    case 'APPROVE_DNS_CHANGE':
      return 'DNS_CHANGE';
    case 'REVIEW_FINAL_RECORD':
      return 'FINAL_RECORD';
    default:
      return actionType;
  }
}

export function targetVersionFromResponse(response: Record<string, unknown>, fallback = 1): number {
  const v = response.target_version ?? response.version;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function actionRequiresExplicitApproval(req: ClientActionRequest): boolean {
  return isApprovalGatedAction(req.action_type);
}
