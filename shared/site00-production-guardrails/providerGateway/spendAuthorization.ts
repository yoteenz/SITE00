import crypto from 'node:crypto';
import type { GenerationClass } from '../types.js';

export type SpendAuthorizationIssueInput = {
  projectId: string;
  actorId: string;
  provider: string;
  model: string;
  generationClass: GenerationClass;
  maxCredits: number;
  /** TTL seconds; default 900 */
  ttlSeconds?: number;
  purpose?: string;
};

export type SpendAuthorizationRecord = SpendAuthorizationIssueInput & {
  authorizationId: string;
  issuedAt: string;
  expiresAt: string;
  consumed: boolean;
};

const authorizations = new Map<string, SpendAuthorizationRecord>();

export function resetSpendAuthorizationStoreForTests(): void {
  authorizations.clear();
}

export function issueSpendAuthorization(input: SpendAuthorizationIssueInput): SpendAuthorizationRecord {
  const issuedAt = new Date();
  const ttl = input.ttlSeconds ?? 900;
  const expiresAt = new Date(issuedAt.getTime() + ttl * 1000);
  const authorizationId = `sauth_${crypto.randomBytes(12).toString('hex')}`;
  const record: SpendAuthorizationRecord = {
    ...input,
    authorizationId,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    consumed: false,
  };
  authorizations.set(authorizationId, record);
  return record;
}

export type SpendValidationResult =
  | { ok: true; record: SpendAuthorizationRecord }
  | { ok: false; blockedReason: 'UNAUTHORIZED_SPEND'; detail: string };

export function validateSpendAuthorization(
  authorizationId: string | null | undefined,
  request: {
    projectId: string;
    provider: string;
    generationClass: GenerationClass;
    estimatedCostCredits?: number | null;
  },
): SpendValidationResult {
  if (!authorizationId?.trim()) {
    return { ok: false, blockedReason: 'UNAUTHORIZED_SPEND', detail: 'Missing spend_authorization_id' };
  }
  const record = authorizations.get(authorizationId);
  if (!record) {
    return { ok: false, blockedReason: 'UNAUTHORIZED_SPEND', detail: 'Unknown or expired spend authorization' };
  }
  if (record.consumed) {
    return { ok: false, blockedReason: 'UNAUTHORIZED_SPEND', detail: 'Spend authorization already consumed' };
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { ok: false, blockedReason: 'UNAUTHORIZED_SPEND', detail: 'Spend authorization expired' };
  }
  if (record.projectId.toUpperCase() !== request.projectId.toUpperCase()) {
    return { ok: false, blockedReason: 'UNAUTHORIZED_SPEND', detail: 'Authorization project mismatch' };
  }
  if (record.provider !== request.provider) {
    return { ok: false, blockedReason: 'UNAUTHORIZED_SPEND', detail: 'Authorization provider mismatch' };
  }
  const est = request.estimatedCostCredits ?? 0;
  if (est > record.maxCredits) {
    return { ok: false, blockedReason: 'UNAUTHORIZED_SPEND', detail: 'Estimated cost exceeds authorized max' };
  }
  return { ok: true, record };
}

export function consumeSpendAuthorization(authorizationId: string): void {
  const record = authorizations.get(authorizationId);
  if (record) authorizations.set(authorizationId, { ...record, consumed: true });
}

/** Client-supplied founderConfirmedSpend alone is never sufficient for gateway dispatch. */
export function rejectCallerOnlySpendConfirmation(input: {
  founderConfirmedSpend?: boolean;
  spendAuthorizationId?: string | null;
}): Extract<SpendValidationResult, { ok: false }> | null {
  if (input.spendAuthorizationId) return null;
  if (input.founderConfirmedSpend === true) {
    return {
      ok: false,
      blockedReason: 'UNAUTHORIZED_SPEND',
      detail: 'founderConfirmedSpend body flag is not server-held spend authorization',
    };
  }
  return {
    ok: false,
    blockedReason: 'UNAUTHORIZED_SPEND',
    detail: 'Paid generation requires spend_authorization_id issued server-side',
  };
}
