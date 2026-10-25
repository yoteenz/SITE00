import { randomUUID } from 'node:crypto';
import { DISPATCHED_STATES } from './machines.js';
import { SpineError, type ApprovalRecord, type BudgetRecord, type GenerationJobRecord, type ShotRecord } from './types.js';

/**
 * The spend gate (§18). It runs immediately before any provider call and is the only issuer of dispatch tickets.
 * A provider transport refuses to act without a ticket it can redeem, so no caller can reach a provider around it.
 *
 *   no founder authorization            → no call        changed inputs since authorization → new approval
 *   authorization expired or revoked    → no call        no authorized budget for the shot   → no call
 *   unknown quote                       → no call        quote above the authorized maximum → no call
 *   budget already committed (retries)  → no call        scene review state not authorized  → no call
 *   founder decisions still open        → no call        references not approved             → no call
 *   job already dispatched              → idempotent, no call
 */

export type GateCode =
  | 'PROJECT_MISMATCH'
  | 'JOB_NOT_AUTHORIZED'
  | 'DUPLICATE_REQUEST'
  | 'NO_FOUNDER_APPROVAL'
  | 'AUTHORIZATION_REVOKED'
  | 'APPROVAL_INVALIDATED_BY_INPUT_CHANGE'
  | 'AUTHORIZATION_EXPIRED'
  | 'NO_APPLICABLE_BUDGET'
  | 'UNKNOWN_QUOTE'
  | 'EXCEEDS_AUTHORIZED_MAX'
  | 'OVER_BUDGET'
  | 'INVALID_SCENE_STATE'
  | 'DECISIONS_OPEN'
  | 'REFERENCES_NOT_APPROVED';

export type GateReason = { code: GateCode; detail: string };

export type SceneGateResult = { valid: boolean; reasons: string[] };

export type GateInput = {
  job: GenerationJobRecord;
  shot: ShotRecord;
  /** The job's current founder authorization (job.founderApprovalRef), if any. */
  authorization: ApprovalRecord | null;
  /** Later approvals on the same job; a REVOKE among them withdraws the authorization. */
  laterApprovals: readonly ApprovalRecord[];
  budget: BudgetRecord | null;
  budgetApproval: ApprovalRecord | null;
  /** Every job the budget covers, including this one. */
  ledger: readonly GenerationJobRecord[];
  scene: SceneGateResult;
  now: string;
};

export type GateResult = { allowed: boolean; reasons: GateReason[] };

/**
 * Credits a job has committed: every dispatched attempt counts its reported charge, or its quote when the provider
 * reported none. Failed and canceled attempts count too, so a retry can never spend past the budget.
 */
export function committedCredits(j: GenerationJobRecord): number {
  const quote = j.quotedCost.credits ?? 0;
  return j.attempts.reduce((n, a) => n + (typeof a.chargedCredits === 'number' ? a.chargedCredits : quote), 0);
}

export function evaluateGate(g: GateInput, opts: { forAuthorization?: boolean } = {}): GateResult {
  const { job, shot, authorization: a, budget, budgetApproval, now } = g;
  const reasons: GateReason[] = [];
  const no = (code: GateCode, detail: string) => reasons.push({ code, detail });
  if (job.projectId !== shot.projectId || job.shotId !== shot.shotId) no('PROJECT_MISMATCH', `${job.id} does not belong to ${shot.projectId}/${shot.shotId}`);

  if (DISPATCHED_STATES.includes(job.status)) no('DUPLICATE_REQUEST', `${job.id} is already ${job.status}; nothing is sent twice`);
  if (!opts.forAuthorization && job.status !== 'AUTHORIZED') no('JOB_NOT_AUTHORIZED', `${job.id} is ${job.status}`);

  if (!opts.forAuthorization) {
    if (!a || a.approvalKind !== 'GENERATION_AUTHORIZATION' || a.decision !== 'AUTHORIZE' || a.actorRole !== 'FOUNDER' || a.subject.id !== job.id) no('NO_FOUNDER_APPROVAL', `${job.id} has no founder generation authorization`);
    else {
      if (g.laterApprovals.some((x) => x.approvalKind === 'GENERATION_AUTHORIZATION' && x.decision === 'REVOKE' && x.subject.id === job.id && x.at >= a.at)) no('AUTHORIZATION_REVOKED', `${a.id} was revoked`);
      if (a.inputHash !== job.inputHash) no('APPROVAL_INVALIDATED_BY_INPUT_CHANGE', `${a.id} approved inputs ${a.inputHash?.slice(0, 12)}; the job now asks for ${job.inputHash.slice(0, 12)}`);
      if (!a.expiresAt || a.expiresAt <= now) no('AUTHORIZATION_EXPIRED', `${a.id} expired at ${a.expiresAt ?? 'never set'}`);
      if (a.budgetId !== shot.budgetId) no('NO_APPLICABLE_BUDGET', `${a.id} names budget ${a.budgetId}, the shot uses ${shot.budgetId}`);
    }
  }

  const budgetOk = budget && budget.id === shot.budgetId && budget.status === 'AUTHORIZED' && budget.shotIds.includes(shot.shotId) && budgetApproval?.id === budget.approvalId && budgetApproval.approvalKind === 'BUDGET_AUTHORIZATION' && budgetApproval.decision === 'AUTHORIZE' && budgetApproval.actorRole === 'FOUNDER';
  if (!budgetOk) no('NO_APPLICABLE_BUDGET', budget ? `${budget.id} is ${budget.status}${budget.approvalId ? '' : ' with no founder authorization'}` : `no budget ${shot.budgetId}`);

  const quote = job.quotedCost.credits;
  if (quote === null) no('UNKNOWN_QUOTE', `${job.id}: no exact quote for ${job.model} ${job.mode}; quote before authorizing`);
  else {
    const max = opts.forAuthorization ? null : (a?.maxCredits ?? null);
    if (max !== null && quote > max) no('EXCEEDS_AUTHORIZED_MAX', `${job.id} quotes ${quote}; authorized ${max}`);
    if (budgetOk) {
      const others = g.ledger.filter((x) => x.id !== job.id).reduce((n, x) => n + committedCredits(x), 0);
      const total = others + committedCredits(job) + quote;
      if (total > budget!.authorizedCredits) no('OVER_BUDGET', `${budget!.id}: ${others + committedCredits(job)} committed + ${quote} > ${budget!.authorizedCredits} authorized`);
    }
  }

  if (!g.scene.valid) no('INVALID_SCENE_STATE', g.scene.reasons.join('; ') || 'scene review state does not allow this job');
  for (const d of shot.requiredDecisions) if (d.status !== 'ANSWERED') no('DECISIONS_OPEN', `${d.decisionId} (${d.role.toLowerCase().replace(/_/g, ' ')}) is ${d.status}`);
  for (const i of job.inputs) {
    const ref = shot.references.find((r) => r.referenceId === i.referenceId);
    if (!ref || ref.status !== 'APPROVED' || !i.assetId || !i.contentSha256 || ref.assetId !== i.assetId) no('REFERENCES_NOT_APPROVED', `${i.referenceId} (${i.role}) is ${ref?.status ?? 'unknown'}`);
  }
  return { allowed: reasons.length === 0, reasons };
}

/* ── dispatch tickets ───────────────────────────────────────────────────────────────────────────────── */

export type DispatchTicket = Readonly<{
  ticketId: string;
  projectId: string;
  jobId: string;
  inputHash: string;
  idempotencyKey: string;
  authorizationId: string;
  quotedCredits: number;
  maxCredits: number;
  issuedAt: string;
  expiresAt: string;
}>;

/** Tickets this process issued. Identity matters: a copied or hand-built object is not a ticket. */
const ISSUED = new WeakMap<DispatchTicket, { redeemed: boolean }>();

export const TICKET_TTL_SEC = 120;

export function issueDispatchTicket(g: GateInput): { ticket: DispatchTicket } | { ticket: null; reasons: GateReason[] } {
  const result = evaluateGate(g);
  if (!result.allowed) return { ticket: null, reasons: result.reasons };
  const expiresAt = new Date(Math.min(Date.parse(g.now) + TICKET_TTL_SEC * 1000, Date.parse(g.authorization!.expiresAt!))).toISOString();
  const ticket: DispatchTicket = Object.freeze({
    ticketId: `TKT-${randomUUID()}`,
    projectId: g.job.projectId,
    jobId: g.job.id,
    inputHash: g.job.inputHash,
    idempotencyKey: g.job.idempotencyKey,
    authorizationId: g.authorization!.id,
    quotedCredits: g.job.quotedCost.credits!,
    maxCredits: g.authorization!.maxCredits!,
    issuedAt: g.now,
    expiresAt,
  });
  ISSUED.set(ticket, { redeemed: false });
  return { ticket };
}

/** Called by a transport before it does anything. One ticket buys one submission of exactly the gated request. */
export function redeemDispatchTicket(ticket: DispatchTicket | null | undefined, req: { projectId: string; jobId: string; inputHash: string; idempotencyKey: string }, now: string): void {
  const state = ticket ? ISSUED.get(ticket) : undefined;
  if (!ticket || !state) throw new SpineError('NO_DISPATCH_TICKET', `${req.jobId}: a provider call needs a ticket from the spend gate`);
  if (state.redeemed) throw new SpineError('TICKET_ALREADY_USED', `${ticket.ticketId} was already redeemed`);
  if (ticket.expiresAt <= now) throw new SpineError('TICKET_EXPIRED', `${ticket.ticketId} expired at ${ticket.expiresAt}`);
  for (const k of ['projectId', 'jobId', 'inputHash', 'idempotencyKey'] as const)
    if (ticket[k] !== req[k]) throw new SpineError('TICKET_MISMATCH', `${ticket.ticketId} was issued for ${k} ${ticket[k]}, not ${req[k]}`);
  state.redeemed = true;
}
