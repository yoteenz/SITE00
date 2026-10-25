import { jobIdempotencyKey, jobInputHash } from './hash.js';
import { SpineError, type Actor, type ActorRole, type GenerationJobRecord, type JobState, type TakeAction, type TakeDecisionState, type TakeRecord } from './types.js';

/**
 * Job execution and take review are separate machines (§17). A job records what was asked of a provider and what came
 * back; a take records what the founder thinks of the result. Nothing in either machine moves on its own:
 *   - a FAILED job leaves FAILED only by an explicit founder retry request, which needs a new authorization;
 *   - a REJECTED take stays rejected and starts no new job;
 *   - a SUCCEEDED job yields a take READY_FOR_REVIEW, never an approved one.
 */

type Rule = { who: readonly ActorRole[]; needs?: readonly string[] };

export const JOB_TRANSITIONS: Readonly<Record<JobState, Partial<Record<JobState, Rule>>>> = {
  DRAFT: { AWAITING_APPROVAL: { who: ['FOUNDER', 'SYSTEM'] }, CANCELED: { who: ['FOUNDER'] } },
  AWAITING_APPROVAL: { AUTHORIZED: { who: ['FOUNDER'], needs: ['approvalId'] }, DRAFT: { who: ['FOUNDER', 'SYSTEM'] }, CANCELED: { who: ['FOUNDER'] } },
  AUTHORIZED: { QUEUED: { who: ['SYSTEM'], needs: ['ticketId'] }, AWAITING_APPROVAL: { who: ['FOUNDER', 'SYSTEM'] }, CANCELED: { who: ['FOUNDER'] } },
  QUEUED: { RUNNING: { who: ['SYSTEM'], needs: ['operationId'] }, FAILED: { who: ['SYSTEM'], needs: ['error'] }, CANCELED: { who: ['FOUNDER'] } },
  RUNNING: { SUCCEEDED: { who: ['SYSTEM'] }, FAILED: { who: ['SYSTEM'], needs: ['error'] }, CANCELED: { who: ['FOUNDER'] } },
  SUCCEEDED: { ASSET_CAPTURE_PENDING: { who: ['SYSTEM'] } },
  ASSET_CAPTURE_PENDING: { CAPTURED: { who: ['SYSTEM'], needs: ['assetId', 'takeId'] }, ASSET_CAPTURE_FAILED: { who: ['SYSTEM'], needs: ['error'] } },
  // Capturing again reads the provider's stored output; it never resubmits, so it spends nothing.
  ASSET_CAPTURE_FAILED: { ASSET_CAPTURE_PENDING: { who: ['FOUNDER'] } },
  // The only way out of FAILED: a founder retry request. It clears the old authorization, so the spend gate runs again.
  FAILED: { AWAITING_APPROVAL: { who: ['FOUNDER'], needs: ['retryRequest'] } },
  CANCELED: {},
  CAPTURED: {},
};

/** States in which a job has been handed to (or may still be with) a provider. Dispatching again is a duplicate. */
export const DISPATCHED_STATES: readonly JobState[] = ['QUEUED', 'RUNNING', 'SUCCEEDED', 'ASSET_CAPTURE_PENDING', 'ASSET_CAPTURE_FAILED', 'CAPTURED'];

export function canTransitionJob(from: JobState, to: JobState, role: ActorRole): boolean {
  return JOB_TRANSITIONS[from][to]?.who.includes(role) ?? false;
}

export function transitionJob(job: GenerationJobRecord, to: JobState, actor: Actor, at: string, reason: string, evidence: Record<string, string> = {}): GenerationJobRecord {
  const rule = JOB_TRANSITIONS[job.status][to];
  if (!rule) throw new SpineError('ILLEGAL_TRANSITION', `${job.id}: ${job.status} → ${to} is not a job transition`);
  if (!rule.who.includes(actor.role)) throw new SpineError('FORBIDDEN', `${job.id}: ${job.status} → ${to} needs ${rule.who.join(' or ')}; ${actor.id} is ${actor.role}`);
  for (const k of rule.needs ?? []) if (!evidence[k]?.trim()) throw new SpineError('MISSING_EVIDENCE', `${job.id}: ${job.status} → ${to} needs ${k}`);
  if (to === 'AUTHORIZED' && job.founderApprovalRef !== evidence.approvalId) throw new SpineError('MISSING_EVIDENCE', `${job.id}: authorization ${evidence.approvalId} is not the job's founder approval`);
  const leavesAuthorization = to === 'AWAITING_APPROVAL' || to === 'DRAFT';
  return {
    ...job,
    status: to,
    founderApprovalRef: leavesAuthorization ? null : job.founderApprovalRef,
    maxAuthorizedCost: leavesAuthorization ? { credits: null } : job.maxAuthorizedCost,
    updatedAt: at,
    transitions: [...job.transitions, { from: job.status, to, at, actor: actor.id, reason, evidence }],
  };
}

/** Changing what the provider would be asked for voids any authorization: the job goes back to waiting for one. */
export function reviseJobInputs(job: GenerationJobRecord, change: Partial<Pick<GenerationJobRecord, 'inputs' | 'settings' | 'prompt' | 'requestedOutputs'>>, actor: Actor, at: string, reason: string): GenerationJobRecord {
  if (!['DRAFT', 'AWAITING_APPROVAL', 'AUTHORIZED'].includes(job.status)) throw new SpineError('ILLEGAL_TRANSITION', `${job.id}: inputs cannot change once the job is ${job.status}`);
  if (actor.role !== 'FOUNDER') throw new SpineError('FORBIDDEN', `${job.id}: only the founder changes a job's inputs`);
  const next = { ...job, ...change };
  const inputHash = jobInputHash(next);
  if (inputHash === job.inputHash) return job;
  const revised = { ...next, inputHash, idempotencyKey: jobIdempotencyKey(job.id, inputHash), updatedAt: at };
  // Only an AUTHORIZED job holds an authorization; it goes back to waiting for a new one.
  return job.status === 'AUTHORIZED' ? transitionJob(revised, 'AWAITING_APPROVAL', actor, at, `inputs changed: ${reason}`) : revised;
}

/* ── takes ──────────────────────────────────────────────────────────────────────────────────────────── */

type TakeRule = { from: readonly TakeDecisionState[]; who: readonly ActorRole[] };

export const TAKE_RULES: Readonly<Record<TakeAction, TakeRule>> = {
  APPROVE: { from: ['READY_FOR_REVIEW', 'HELD'], who: ['FOUNDER'] },
  HOLD: { from: ['READY_FOR_REVIEW', 'APPROVED'], who: ['FOUNDER', 'REVIEWER'] },
  REJECT: { from: ['READY_FOR_REVIEW', 'HELD', 'APPROVED'], who: ['FOUNDER'] },
  SELECT_FOR_EDIT: { from: ['APPROVED'], who: ['FOUNDER'] },
  DESELECT_FOR_EDIT: { from: ['APPROVED'], who: ['FOUNDER'] },
};

/** The state a take shows: SELECTED_FOR_EDIT is an approved take chosen for the cut. */
export const takeDisplayState = (t: Pick<TakeRecord, 'decision' | 'selectedForEdit'>) => (t.selectedForEdit ? 'SELECTED_FOR_EDIT' : t.decision);

/**
 * Applies a review action. `shotTakes` are the other takes of the same shot: only one may be selected for edit, and
 * a selected take must be deselected before its approval is withdrawn.
 */
export function decideTake(take: TakeRecord, action: TakeAction, actor: Actor, at: string, approvalId: string, shotTakes: readonly TakeRecord[]): TakeRecord {
  const rule = TAKE_RULES[action];
  if (!rule.who.includes(actor.role)) throw new SpineError('FORBIDDEN', `${take.id}: ${action} needs ${rule.who.join(' or ')}; ${actor.id} is ${actor.role}`);
  if (!rule.from.includes(take.decision)) throw new SpineError('ILLEGAL_TRANSITION', `${take.id}: ${action} is not allowed from ${takeDisplayState(take)}`);
  if (action === 'SELECT_FOR_EDIT') {
    if (take.selectedForEdit) throw new SpineError('ILLEGAL_TRANSITION', `${take.id} is already selected for edit`);
    const other = shotTakes.find((t) => t.id !== take.id && t.shotId === take.shotId && t.selectedForEdit);
    if (other) throw new SpineError('SELECTION_CONFLICT', `${other.id} is selected for edit on ${take.shotId}; deselect it first`);
  }
  if (action === 'DESELECT_FOR_EDIT' && !take.selectedForEdit) throw new SpineError('ILLEGAL_TRANSITION', `${take.id} is not selected for edit`);
  if ((action === 'HOLD' || action === 'REJECT') && take.selectedForEdit) throw new SpineError('SELECTION_CONFLICT', `${take.id} is selected for edit; deselect it before withdrawing approval`);
  const decision: TakeDecisionState = action === 'APPROVE' ? 'APPROVED' : action === 'HOLD' ? 'HELD' : action === 'REJECT' ? 'REJECTED' : take.decision;
  return { ...take, decision, selectedForEdit: action === 'SELECT_FOR_EDIT' ? true : action === 'DESELECT_FOR_EDIT' ? false : take.selectedForEdit, approvalIds: [...take.approvalIds, approvalId], updatedAt: at };
}
