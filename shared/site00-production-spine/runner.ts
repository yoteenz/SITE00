import type { FrameExtractor, MediaProbe } from './frames.js';
import { aspectOf } from './frames.js';
import { evaluateGate, issueDispatchTicket, type GateInput, type GateReason, type SceneGateResult } from './gate.js';
import { sha256Hex } from './hash.js';
import { DISPATCHED_STATES, decideTake, reviseJobInputs, transitionJob } from './machines.js';
import type { MediaStore } from './media.js';
import { requirePermission } from './permissions.js';
import { buildProviderRequest, submitCertainty, type ProviderInput, type ProviderTransport } from './providers.js';
import type { RecordStore, WriteOp } from './store.js';
import {
  NOT_AVAILABLE,
  SPINE_SCHEMA_VERSION,
  SpineError,
  TEST_FIXTURE,
  UNKNOWN,
  type Actor,
  type AnyRecord,
  type ApprovalRecord,
  type AssetRecord,
  type AttemptOutcome,
  type ContinuityReferenceRecord,
  type GenerationJobRecord,
  type ShotRecord,
  type SourceRef,
  type StoredKind,
  type TakeAction,
  type TakeRecord,
  type Unknowable,
} from './types.js';

/**
 * The provider runner (§22, §14–§17): one path from an approved shot to a take in review.
 *
 *   load shot → resolve approved references → spend gate → job ledger (QUEUED) → provider request (ticketed)
 *   → provider status → capture output → private storage → hash verification → TAKE, READY_FOR_REVIEW
 *
 * It never retries a paid call, never regenerates after a rejection, and never approves anything itself. Every change
 * that touches more than one record is one atomic store batch. Every step is safe to repeat:
 *   dispatch twice            → the second finds the job dispatched (or loses the revision race) and sends nothing
 *   submit times out          → RECONCILIATION_REQUIRED; the provider is asked about the key, the request never resent
 *   worker restarts mid-call  → recoverInterrupted() moves the orphan to RECONCILIATION_REQUIRED
 *   two polls, two callbacks  → one records the result; the other reads it back
 *   capture fails             → ASSET_CAPTURE_FAILED; recapture reads the stored output again and spends nothing
 */

export const SYSTEM_ACTOR: Actor = { id: 'system:production-runner', role: 'SYSTEM' };

/** A QUEUED or capture-pending job untouched this long belongs to a worker that stopped. */
export const INTERRUPTED_AFTER_SEC = 300;
/** Longest a founder authorization may last. */
export const MAX_AUTHORIZATION_TTL_SEC = 24 * 3600;

export type RunnerDeps = {
  store: RecordStore;
  media: MediaStore;
  /** routeId → transport. A route with no transport cannot be dispatched. */
  transports: Readonly<Record<string, ProviderTransport>>;
  /** The project's route table. Defaults to the transports' routes. */
  routeIds?: readonly string[];
  sceneGate: (job: GenerationJobRecord, shot: ShotRecord) => SceneGateResult;
  probe: MediaProbe;
  extractor?: FrameExtractor;
  clock: () => string;
};

export type Reason = { code: string; detail: string };
export type DispatchOutcome =
  | { outcome: 'SUBMITTED'; job: GenerationJobRecord }
  | { outcome: 'DUPLICATE_IDEMPOTENT'; job: GenerationJobRecord }
  | { outcome: 'BLOCKED'; job: GenerationJobRecord; reasons: Reason[] }
  | { outcome: 'FAILED'; job: GenerationJobRecord }
  | { outcome: 'RECONCILIATION_REQUIRED'; job: GenerationJobRecord };

const pad = (n: number, w: number) => String(n).padStart(w, '0');
const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));
const isConflict = (e: unknown) => e instanceof SpineError && e.code === 'CONFLICT';
export const sourceVersion = (r: Pick<AnyRecord, 'kind' | 'id' | 'revision'>, suffix?: string) => `${r.kind}/${r.id}@r${r.revision}${suffix ? `#${suffix}` : ''}`;

const APPROVAL_CODE = { GENERATION_AUTHORIZATION: 'GEN', BUDGET_AUTHORIZATION: 'BUD', REFERENCE_APPROVAL: 'REF', TAKE_DECISION: 'TAKE', CONTINUITY_REVIEW: 'CONT' } as const;

type ApprovalFields = Omit<ApprovalRecord, 'kind' | 'id' | 'projectId' | 'schemaVersion' | 'revision' | 'createdAt' | 'updatedAt' | 'createdBy' | 'actor' | 'actorRole' | 'at' | 'sourceVersion' | 'subject'>;

export class ProductionRunner {
  private readonly routeIds: readonly string[];
  constructor(private readonly d: RunnerDeps) {
    if (d.store.live !== d.media.live) throw new SpineError('STORE_MISMATCH', 'records and media must both be live or both be test stores');
    if (d.store.live && Object.values(d.transports).some((t) => t.kind === 'FAKE_TEST')) throw new SpineError('FAKE_TRANSPORT_IN_LIVE', 'the fake provider writes test media; it cannot feed the live catalogue');
    this.routeIds = d.routeIds ?? Object.keys(d.transports);
  }

  private get now() {
    return this.d.clock();
  }

  get store() {
    return this.d.store;
  }

  /** Test stores mark every record they write. */
  private stamp<T extends object>(rec: T): T {
    return this.d.store.live ? rec : { ...rec, fixture: TEST_FIXTURE };
  }

  private async must<K extends StoredKind>(kind: K, id: string) {
    const r = await this.d.store.get(kind, id);
    if (!r) throw new SpineError('NOT_FOUND', `${kind}/${id} in ${this.d.store.projectId}`);
    return r;
  }

  private transportFor(job: GenerationJobRecord): ProviderTransport | null {
    return this.routeIds.includes(job.routeId) ? (this.d.transports[job.routeId] ?? null) : null;
  }

  async gateInput(job: GenerationJobRecord, operator: Actor | null): Promise<GateInput> {
    const shot = await this.must('SHOT', job.shotId);
    const approvals = await this.d.store.list('APPROVAL');
    const budget = await this.d.store.get('BUDGET', shot.budgetId);
    const ledger = budget ? (await this.d.store.list('GENERATION_JOB')).filter((j) => budget.shotIds.includes(j.shotId)) : [job];
    return {
      job,
      shot,
      authorization: approvals.find((a) => a.id === job.founderApprovalRef) ?? null,
      laterApprovals: approvals.filter((a) => a.subject.id === job.id),
      budget,
      budgetApproval: budget?.approvalId ? (approvals.find((a) => a.id === budget.approvalId) ?? null) : null,
      ledger: ledger.map((j) => (j.id === job.id ? job : j)),
      scene: this.d.sceneGate(job, shot),
      operator,
      routeIds: this.routeIds,
      now: this.now,
    };
  }

  private runtimeReasons(job: GenerationJobRecord): Reason[] {
    const t = this.transportFor(job);
    if (!t) return [{ code: 'NO_TRANSPORT', detail: `no transport for ${job.routeId}` }];
    const s = t.status();
    return s.enabled ? [] : [{ code: 'PROVIDER_EXECUTION_DISABLED', detail: s.reason }];
  }

  /** Why a job can or cannot be sent now by `operator` (the runtime gate first, then the spend gate). Writes nothing. */
  async dispatchPreview(jobId: string, operator: Actor | null): Promise<{ enabled: boolean; reasons: GateReason[] | Reason[] }> {
    const job = await this.must('GENERATION_JOB', jobId);
    const gate = evaluateGate(await this.gateInput(job, operator));
    const reasons = [...this.runtimeReasons(job), ...gate.reasons];
    return { enabled: reasons.length === 0, reasons };
  }

  /* ── approvals (each one an append-only event written with the change it causes) ──────────────── */

  private approval(subject: AnyRecord, fields: ApprovalFields, actor: Actor, suffix?: string): ApprovalRecord {
    const at = this.now;
    const id = `APR-${APPROVAL_CODE[fields.approvalKind]}-${subject.id}-r${subject.revision}${suffix ? `-${suffix}` : ''}`;
    return this.stamp({
      kind: 'APPROVAL',
      id,
      projectId: this.d.store.projectId,
      schemaVersion: SPINE_SCHEMA_VERSION,
      revision: 1,
      createdAt: at,
      updatedAt: at,
      createdBy: actor.id,
      actor: actor.id,
      actorRole: actor.role,
      at,
      subject: { kind: subject.kind, id: subject.id },
      sourceVersion: sourceVersion(subject, suffix),
      ...fields,
    });
  }

  /** Commits a batch; a lost revision race comes back as CONFLICT with what is stored now. */
  private async commit(ops: WriteOp[]) {
    try {
      return await this.d.store.apply(ops);
    } catch (e) {
      if (isConflict(e)) throw new SpineError('CONFLICT', `${errText(e).replace(/^CONFLICT: /, '')} — someone else changed it first; reload and decide again`);
      throw e;
    }
  }

  async authorizeBudget(budgetId: string, actor: Actor, opts: { authorizedCredits: number; decisionRefs: string[]; note: string | null }) {
    requirePermission(actor, 'AUTHORIZE_SPEND', 'authorizing a budget');
    const budget = await this.must('BUDGET', budgetId);
    if (budget.status !== 'PLANNING_ESTIMATE_ONLY') throw new SpineError('ILLEGAL_TRANSITION', `${budgetId} is ${budget.status}`);
    if (!(Number.isInteger(opts.authorizedCredits) && opts.authorizedCredits > 0)) throw new SpineError('BAD_AMOUNT', 'a budget authorizes a whole, positive number of credits');
    const a = this.approval(budget, { approvalKind: 'BUDGET_AUTHORIZATION', decision: 'AUTHORIZE', previousState: budget.status, newState: 'AUTHORIZED', note: opts.note, decisionRefs: opts.decisionRefs, supersedes: null, authorizedCredits: opts.authorizedCredits }, actor);
    const [, next] = await this.commit([{ create: a }, { update: { ...budget, status: 'AUTHORIZED', authorizedCredits: opts.authorizedCredits, approvalId: a.id, updatedAt: this.now }, expectedRevision: budget.revision }]);
    return next as typeof budget;
  }

  /** The founder approves an image as a shot reference; jobs that use it are rebound (and lose any authorization). */
  async approveReference(shotId: string, referenceId: string, assetId: string, actor: Actor, opts: { decisionRefs: string[]; note: string | null }) {
    requirePermission(actor, 'APPROVE_REFERENCE', 'approving a reference');
    const shot = await this.must('SHOT', shotId);
    const ref = shot.references.find((r) => r.referenceId === referenceId);
    if (!ref) throw new SpineError('NOT_FOUND', `${shotId} has no reference ${referenceId}`);
    const asset = await this.must('ASSET', assetId);
    if (asset.mediaType !== 'IMAGE') throw new SpineError('MEDIA_TYPE', `${assetId} is ${asset.mediaType}; a reference is an image`);
    if (!(await this.d.media.verify(asset.storageRef, asset.contentSha256)).ok) throw new SpineError('MEDIA_UNVERIFIED', `${assetId} does not match its hash`);
    // The decision is about this reference slot of this shot version; the asset is what fills it.
    const a = { ...this.approval(shot, { approvalKind: 'REFERENCE_APPROVAL', decision: 'APPROVE', previousState: ref.status, newState: 'APPROVED', note: opts.note, decisionRefs: opts.decisionRefs, supersedes: null }, actor, referenceId), subject: { kind: 'ASSET' as const, id: assetId } };
    const ops: WriteOp[] = [{ create: a }, { update: { ...shot, references: shot.references.map((r) => (r.referenceId === referenceId ? { ...r, status: 'APPROVED' as const, assetId } : r)), updatedAt: this.now }, expectedRevision: shot.revision }];
    for (const jobId of shot.jobIds) {
      const job = await this.must('GENERATION_JOB', jobId);
      if (!job.inputs.some((i) => i.referenceId === referenceId)) continue;
      const revised = reviseJobInputs(job, { inputs: job.inputs.map((i) => (i.referenceId === referenceId ? { ...i, assetId, contentSha256: asset.contentSha256 } : i)) }, actor, this.now, `${referenceId} approved as ${assetId}`);
      if (revised !== job) ops.push({ update: revised, expectedRevision: job.revision });
    }
    return (await this.commit(ops))[1] as ShotRecord;
  }

  async requestAuthorization(jobId: string, actor: Actor) {
    requirePermission(actor, 'PREPARE_JOB', 'requesting authorization');
    const job = await this.must('GENERATION_JOB', jobId);
    return this.d.store.update(transitionJob(job, 'AWAITING_APPROVAL', actor, this.now, 'authorization requested'), job.revision);
  }

  /**
   * Records a price read from the provider for this exact request. A quote is planning information, not permission:
   * an authorization names the quote it was given against, so a changed quote voids it at dispatch (QUOTE_CHANGED).
   */
  async recordQuote(jobId: string, actor: Actor, quote: { credits: number; quotedAt: string; source: SourceRef }) {
    requirePermission(actor, 'PREPARE_JOB', 'recording a quote');
    const job = await this.must('GENERATION_JOB', jobId);
    if (DISPATCHED_STATES.includes(job.status) || job.status === 'CANCELED' || job.status === 'FAILED') throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}; its quote is history`);
    if (!(Number.isInteger(quote.credits) && quote.credits >= 0)) throw new SpineError('BAD_AMOUNT', 'a quote is a whole number of credits; an unknown price is not recorded as a number');
    return this.d.store.update({ ...job, quotedCost: { credits: quote.credits, quotedAt: quote.quotedAt, source: quote.source }, updatedAt: this.now }, job.revision);
  }

  /** Founder authorization of one attempt of one job at its current inputs, quote and route. Refused unless the gate passes. */
  async authorizeJob(jobId: string, actor: Actor, opts: { maxCredits: number; ttlSec: number; decisionRefs: string[]; note: string | null }) {
    requirePermission(actor, 'AUTHORIZE_SPEND', 'authorizing generation');
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status !== 'AWAITING_APPROVAL') throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}, not AWAITING_APPROVAL`);
    if (!(opts.ttlSec > 0 && opts.ttlSec <= MAX_AUTHORIZATION_TTL_SEC)) throw new SpineError('AUTHORIZATION_TTL', `an authorization lasts 1 s – ${MAX_AUTHORIZATION_TTL_SEC / 3600} h`);
    const gate = evaluateGate(await this.gateInput(job, actor), { forAuthorization: true });
    if (!gate.allowed) throw new SpineError('GATE_BLOCKED', gate.reasons.map((r) => `${r.code} (${r.detail})`).join('; '));
    if (job.quotedCost.credits! > opts.maxCredits) throw new SpineError('EXCEEDS_AUTHORIZED_MAX', `${jobId} quotes ${job.quotedCost.credits}; maximum offered ${opts.maxCredits}`);
    const shot = await this.must('SHOT', job.shotId);
    const expiresAt = new Date(Date.parse(this.now) + opts.ttlSec * 1000).toISOString();
    const a = this.approval(
      job,
      {
        approvalKind: 'GENERATION_AUTHORIZATION',
        decision: 'AUTHORIZE',
        previousState: job.status,
        newState: 'AUTHORIZED',
        note: opts.note,
        decisionRefs: opts.decisionRefs,
        supersedes: job.founderApprovalRef,
        inputHash: job.inputHash,
        quotedCredits: job.quotedCost.credits!,
        maxCredits: opts.maxCredits,
        expiresAt,
        budgetId: shot.budgetId,
        routeId: job.routeId,
        scope: 'ONE_JOB_ONE_ATTEMPT',
        purpose: `${job.jobKind} for ${job.shotId}${job.producesReferenceId ? ` → ${job.producesReferenceId}` : ''} on ${job.provider} ${job.model} ${job.mode}`,
      },
      actor,
    );
    const next = transitionJob({ ...job, founderApprovalRef: a.id, maxAuthorizedCost: { credits: opts.maxCredits } }, 'AUTHORIZED', actor, this.now, 'founder authorized generation', { approvalId: a.id });
    return (await this.commit([{ create: a }, { update: next, expectedRevision: job.revision }]))[1] as GenerationJobRecord;
  }

  async revokeAuthorization(jobId: string, actor: Actor, note: string | null) {
    requirePermission(actor, 'AUTHORIZE_SPEND', 'revoking an authorization');
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status !== 'AUTHORIZED' || !job.founderApprovalRef) throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}; nothing to revoke`);
    const a = this.approval(job, { approvalKind: 'GENERATION_AUTHORIZATION', decision: 'REVOKE', previousState: job.status, newState: 'AWAITING_APPROVAL', note, decisionRefs: [], supersedes: job.founderApprovalRef }, actor);
    return (await this.commit([{ create: a }, { update: transitionJob(job, 'AWAITING_APPROVAL', actor, this.now, 'authorization revoked', { approvalId: a.id }), expectedRevision: job.revision }]))[1] as GenerationJobRecord;
  }

  /** A failed job is retried only on this explicit founder request, and only through a new authorization. */
  async requestRetry(jobId: string, actor: Actor, reason: string) {
    requirePermission(actor, 'AUTHORIZE_SPEND', 'requesting a retry');
    const job = await this.must('GENERATION_JOB', jobId);
    return this.d.store.update(transitionJob(job, 'AWAITING_APPROVAL', actor, this.now, `retry requested: ${reason}`, { retryRequest: reason }), job.revision);
  }

  async cancelJob(jobId: string, actor: Actor, reason: string) {
    requirePermission(actor, 'CANCEL_JOB', 'canceling a job');
    const job = await this.must('GENERATION_JOB', jobId);
    const closed = job.attempts.some((a) => a.outcome === 'OPEN' || a.outcome === 'UNCERTAIN') ? this.closeAttempt(job, 'CANCELED', UNKNOWN) : job;
    return this.d.store.update(transitionJob(closed, 'CANCELED', actor, this.now, `canceled: ${reason}`), job.revision);
  }

  /* ── execution ──────────────────────────────────────────────────────────────────────────────────── */

  private async providerInputs(job: GenerationJobRecord): Promise<{ inputs: ProviderInput[]; bad: Reason[] }> {
    const inputs: ProviderInput[] = [];
    const bad: Reason[] = [];
    for (const i of job.inputs) {
      const asset = i.assetId ? await this.d.store.get('ASSET', i.assetId) : null;
      if (!asset || asset.contentSha256 !== i.contentSha256 || !(await this.d.media.verify(asset.storageRef, asset.contentSha256)).ok) {
        bad.push({ code: 'REFERENCE_MEDIA_UNVERIFIED', detail: `${i.referenceId}: stored copy missing or not matching its hash` });
        continue;
      }
      inputs.push({ role: i.role, referenceId: i.referenceId, storageRef: asset.storageRef, sha256: asset.contentSha256 });
    }
    return { inputs, bad };
  }

  async dispatch(jobId: string, operator: Actor): Promise<DispatchOutcome> {
    const job = await this.must('GENERATION_JOB', jobId);
    if (DISPATCHED_STATES.includes(job.status)) return { outcome: 'DUPLICATE_IDEMPOTENT', job };
    const runtime = this.runtimeReasons(job);
    if (runtime.length) return { outcome: 'BLOCKED', job, reasons: runtime };
    const transport = this.transportFor(job)!;

    const issued = issueDispatchTicket(await this.gateInput(job, operator));
    if (!issued.ticket) {
      const voided = issued.reasons.find((r) => ['APPROVAL_INVALIDATED_BY_INPUT_CHANGE', 'AUTHORIZATION_EXPIRED', 'AUTHORIZATION_REVOKED', 'QUOTE_CHANGED'].includes(r.code));
      let after = job;
      if (job.status === 'AUTHORIZED' && voided)
        after = await this.d.store.update(transitionJob(job, 'AWAITING_APPROVAL', SYSTEM_ACTOR, this.now, `authorization void: ${voided.code}`), job.revision).catch((e) => {
          if (isConflict(e)) return job;
          throw e;
        });
      return { outcome: 'BLOCKED', job: after, reasons: issued.reasons };
    }
    const { inputs, bad } = await this.providerInputs(job);
    if (bad.length) return { outcome: 'BLOCKED', job, reasons: bad };
    const ticket = issued.ticket;

    const attempt = { attempt: job.attempts.length + 1, authorizationId: ticket.authorizationId, ticketId: ticket.ticketId, operationId: NOT_AVAILABLE, outcome: 'OPEN' as const, quotedCredits: ticket.quotedCredits, chargedCredits: NOT_AVAILABLE };
    // Persisting QUEUED before the call is the ledger entry. A second click, a second tab or a second server loses
    // the revision race here (and the database allows one open attempt per job), so only one request is ever sent.
    let queued: GenerationJobRecord;
    try {
      queued = await this.d.store.update(transitionJob({ ...job, attempts: [...job.attempts, attempt] }, 'QUEUED', SYSTEM_ACTOR, this.now, 'spend gate passed', { ticketId: ticket.ticketId, approvalId: ticket.authorizationId, operator: operator.id }), job.revision);
    } catch (e) {
      if (!isConflict(e)) throw e;
      const now = await this.must('GENERATION_JOB', jobId);
      return DISPATCHED_STATES.includes(now.status) ? { outcome: 'DUPLICATE_IDEMPOTENT', job: now } : { outcome: 'BLOCKED', job: now, reasons: [{ code: 'CONFLICT', detail: 'the job changed while dispatching; nothing was sent' }] };
    }

    let operationId: string;
    try {
      ({ operationId } = await transport.submit(buildProviderRequest(queued, inputs), ticket, this.now));
    } catch (e) {
      const certainty = submitCertainty(e);
      if (certainty === 'UNCERTAIN') {
        const open = { ...queued, attempts: queued.attempts.map((a) => (a.attempt === attempt.attempt ? { ...a, outcome: 'UNCERTAIN' as const, chargedCredits: UNKNOWN } : a)), errors: [...queued.errors, { at: this.now, code: 'PROVIDER_SUBMIT_UNCERTAIN', message: errText(e) }] };
        const next = transitionJob(open, 'RECONCILIATION_REQUIRED', SYSTEM_ACTOR, this.now, 'the provider may have the request; it is looked up, never resent', { error: errText(e) });
        return { outcome: 'RECONCILIATION_REQUIRED', job: await this.d.store.update(next, queued.revision) };
      }
      const charged = certainty === 'NOT_SENT' ? 0 : ((e as { reportedCredits?: Unknowable<number> }).reportedCredits ?? UNKNOWN);
      const failed = this.closeAttempt(queued, 'FAILED', charged);
      const code = certainty === 'NOT_SENT' ? 'PROVIDER_REQUEST_NOT_SENT' : 'PROVIDER_SUBMIT_FAILED';
      const next = transitionJob({ ...failed, errors: [...failed.errors, { at: this.now, code, message: errText(e) }] }, 'FAILED', SYSTEM_ACTOR, this.now, `${certainty === 'NOT_SENT' ? 'nothing left this process' : 'the provider refused the request'}; no automatic retry`, { error: errText(e) });
      return { outcome: 'FAILED', job: await this.d.store.update(next, queued.revision) };
    }
    return { outcome: 'SUBMITTED', job: await this.d.store.update(this.toRunning(queued, operationId, 'provider accepted the request'), queued.revision) };
  }

  private toRunning(job: GenerationJobRecord, operationId: string, reason: string, actor: Actor = SYSTEM_ACTOR): GenerationJobRecord {
    const live = job.attempts.find((a) => a.outcome === 'OPEN' || a.outcome === 'UNCERTAIN');
    const attempts = job.attempts.map((a) => (a === live ? { ...a, operationId, outcome: 'OPEN' as const, chargedCredits: NOT_AVAILABLE } : a));
    return transitionJob({ ...job, providerOperationId: operationId, submittedAt: job.submittedAt ?? this.now, attempts }, 'RUNNING', actor, this.now, reason, { operationId });
  }

  private closeAttempt(job: GenerationJobRecord, outcome: Exclude<AttemptOutcome, 'OPEN' | 'UNCERTAIN'>, charged: Unknowable<number>): GenerationJobRecord {
    const attempts = job.attempts.map((a) => (a.outcome === 'OPEN' || a.outcome === 'UNCERTAIN' ? { ...a, outcome, chargedCredits: charged } : a));
    const closed = attempts.filter((a) => a.outcome !== 'OPEN' && a.outcome !== 'UNCERTAIN');
    const actual: Unknowable<number> = !closed.length ? NOT_AVAILABLE : closed.every((a) => typeof a.chargedCredits === 'number') ? closed.reduce((n, a) => n + (a.chargedCredits as number), 0) : UNKNOWN;
    return { ...job, attempts, actualSpend: { credits: actual }, completedAt: this.now };
  }

  /**
   * Asks the provider what became of an uncertain submission, by idempotency key. Found → RUNNING. Definitively not
   * found → FAILED (spend still counted at the quote). Not answerable → stays RECONCILIATION_REQUIRED for a person.
   */
  async reconcile(jobId: string, actor: Actor) {
    if (actor.role !== 'SYSTEM') requirePermission(actor, 'RECONCILE', 'reconciling a job');
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status !== 'RECONCILIATION_REQUIRED') return job;
    const transport = this.transportFor(job);
    if (!transport) throw new SpineError('NO_TRANSPORT', job.routeId);
    const found = await transport.lookup(job.idempotencyKey);
    if (found.found) return this.d.store.update(this.toRunning(job, found.operationId, 'provider holds the request (found by idempotency key)', actor), job.revision);
    if (!found.definitive) return job;
    const failed = this.closeAttempt(job, 'FAILED', UNKNOWN);
    return this.d.store.update(transitionJob({ ...failed, errors: [...failed.errors, { at: this.now, code: 'PROVIDER_REQUEST_NOT_FOUND', message: found.detail }] }, 'FAILED', actor, this.now, 'the provider has no such request; no automatic retry', { error: found.detail, resolution: 'PROVIDER_LOOKUP_NOT_FOUND' }), job.revision);
  }

  /** A person resolves a reconciliation the provider could not answer, from what the provider's own records show. */
  async resolveReconciliation(jobId: string, actor: Actor, r: { operationId: string } | { notSubmitted: string }) {
    requirePermission(actor, 'RECONCILE', 'resolving a reconciliation');
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status !== 'RECONCILIATION_REQUIRED') throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}`);
    if ('operationId' in r) return this.d.store.update(this.toRunning(job, r.operationId, `${actor.id} matched the provider operation`, actor), job.revision);
    const failed = this.closeAttempt(job, 'FAILED', UNKNOWN);
    return this.d.store.update(transitionJob(failed, 'FAILED', actor, this.now, `not at the provider: ${r.notSubmitted}`, { error: r.notSubmitted, resolution: 'MANUAL_NOT_SUBMITTED' }), job.revision);
  }

  /**
   * After a restart: a QUEUED job (the worker died between the ledger entry and the provider's answer) becomes
   * RECONCILIATION_REQUIRED; a capture left pending becomes ASSET_CAPTURE_FAILED. Neither ever calls a provider.
   */
  async recoverInterrupted(): Promise<Array<{ jobId: string; from: string; to: string }>> {
    const out: Array<{ jobId: string; from: string; to: string }> = [];
    const cutoff = Date.parse(this.now) - INTERRUPTED_AFTER_SEC * 1000;
    for (const job of await this.d.store.list('GENERATION_JOB')) {
      if (Date.parse(job.updatedAt) > cutoff) continue;
      try {
        if (job.status === 'QUEUED') {
          const open = { ...job, attempts: job.attempts.map((a) => (a.outcome === 'OPEN' ? { ...a, outcome: 'UNCERTAIN' as const, chargedCredits: UNKNOWN } : a)) };
          await this.d.store.update(transitionJob(open, 'RECONCILIATION_REQUIRED', SYSTEM_ACTOR, this.now, 'worker stopped mid-dispatch; the request may have been sent', { error: 'INTERRUPTED' }), job.revision);
          out.push({ jobId: job.id, from: 'QUEUED', to: 'RECONCILIATION_REQUIRED' });
        } else if (job.status === 'ASSET_CAPTURE_PENDING') {
          await this.d.store.update(transitionJob({ ...job, errors: [...job.errors, { at: this.now, code: 'ASSET_CAPTURE_INTERRUPTED', message: 'worker stopped mid-capture' }] }, 'ASSET_CAPTURE_FAILED', SYSTEM_ACTOR, this.now, 'capture interrupted; recapture reads the stored output again', { error: 'INTERRUPTED' }), job.revision);
          out.push({ jobId: job.id, from: 'ASSET_CAPTURE_PENDING', to: 'ASSET_CAPTURE_FAILED' });
        }
      } catch (e) {
        if (!isConflict(e)) throw e; // another worker got there first
      }
    }
    return out;
  }

  /** Reads provider status once. Safe to repeat and to race: a job past RUNNING is returned as it stands. */
  async poll(jobId: string): Promise<GenerationJobRecord> {
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status === 'SUCCEEDED') return this.capture(job.id, SYSTEM_ACTOR);
    if (job.status !== 'RUNNING') {
      if (DISPATCHED_STATES.includes(job.status) || job.status === 'FAILED' || job.status === 'CANCELED') return job;
      throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}; it was never sent`);
    }
    if (typeof job.providerOperationId !== 'string' || job.providerOperationId === NOT_AVAILABLE || job.providerOperationId === UNKNOWN) throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is RUNNING without an operation id`);
    const transport = this.transportFor(job);
    if (!transport) throw new SpineError('NO_TRANSPORT', job.routeId);
    const p = await transport.poll(job.providerOperationId);
    if (p.state === 'RUNNING') return job;
    try {
      if (p.state === 'FAILED') {
        const failed = this.closeAttempt(job, 'FAILED', p.reportedCredits);
        return await this.d.store.update(transitionJob({ ...failed, errors: [...failed.errors, { at: this.now, code: 'PROVIDER_JOB_FAILED', message: p.error }] }, 'FAILED', SYSTEM_ACTOR, this.now, 'provider reported failure; no automatic retry', { error: p.error }), job.revision);
      }
      await this.d.store.update(transitionJob(this.closeAttempt(job, 'SUCCEEDED', p.reportedCredits), 'SUCCEEDED', SYSTEM_ACTOR, this.now, 'provider reported success'), job.revision);
    } catch (e) {
      if (!isConflict(e)) throw e;
      return this.must('GENERATION_JOB', jobId); // another poll or callback recorded it
    }
    return this.capture(job.id, SYSTEM_ACTOR);
  }

  /** ASSET_CAPTURE_FAILED → capture again. Reads the provider's stored output; never submits. */
  async recapture(jobId: string, actor: Actor) {
    requirePermission(actor, 'RECAPTURE', 'recapturing output');
    return this.capture(jobId, actor);
  }

  /**
   * Copies the provider's output into private storage, re-reads and hashes the copy, probes it, and records the asset
   * (and, for a video job, its TAKE in READY_FOR_REVIEW) and the CAPTURED job in one batch. Repeating it is harmless:
   * a captured job is returned as it is, and the media is content-addressed.
   */
  async capture(jobId: string, actor: Actor): Promise<GenerationJobRecord> {
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status === 'CAPTURED') return job;
    if (job.status !== 'SUCCEEDED' && job.status !== 'ASSET_CAPTURE_FAILED') throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}; there is no output to capture`);
    let pending: GenerationJobRecord;
    try {
      pending = await this.d.store.update(transitionJob(job, 'ASSET_CAPTURE_PENDING', actor, this.now, job.status === 'SUCCEEDED' ? 'capturing output' : 'capture requested again'), job.revision);
    } catch (e) {
      if (!isConflict(e)) throw e;
      return this.must('GENERATION_JOB', jobId); // another capture holds it
    }
    try {
      const transport = this.transportFor(pending);
      if (!transport) throw new SpineError('NO_TRANSPORT', pending.routeId);
      const out = await transport.fetchOutput(String(pending.providerOperationId));
      const sha = sha256Hex(out.bytes);
      const stored = await this.d.media.put({ projectId: pending.projectId, bytes: out.bytes, mimeType: out.mimeType });
      const check = await this.d.media.verify(stored.storageRef, sha);
      if (!check.ok) throw new SpineError('MEDIA_UNVERIFIED', `stored copy hashes to ${check.actual}, provider output to ${sha}`);
      const copy = await this.d.media.read(stored.storageRef);
      const probe = await this.d.probe.probe(copy, out.mimeType);
      const at = this.now;
      const attemptNo = pending.attempts.filter((a) => a.outcome === 'SUCCEEDED').at(-1)?.attempt ?? pending.attempts.length;
      const base = { projectId: pending.projectId, schemaVersion: SPINE_SCHEMA_VERSION, revision: 1, createdAt: at, updatedAt: at, createdBy: actor.id };
      const asset: AssetRecord = this.stamp({
        ...base,
        kind: 'ASSET',
        id: `ASSET-${pending.id}-A${pad(attemptNo, 2)}`,
        mediaType: out.mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        mimeType: out.mimeType,
        adapter: this.d.media.adapter,
        storageRef: stored.storageRef,
        contentSha256: sha,
        byteSize: stored.byteSize,
        verifiedAt: at,
        lineage: { sourceJobId: pending.id, sourceTakeId: null, derivedFromAssetId: null, providerOperationId: pending.providerOperationId, providerSourceHost: out.sourceHost },
      });
      const ops: WriteOp[] = [{ create: asset }];
      let takeId = 'NONE (image job)';
      if (pending.jobKind === 'VIDEO_I2V') {
        const shot = await this.must('SHOT', pending.shotId);
        const num = (await this.d.store.list('TAKE')).filter((t) => t.shotId === pending.shotId).length + 1;
        const w = probe.width,
          h = probe.height;
        const take: TakeRecord = this.stamp({
          ...base,
          kind: 'TAKE',
          id: `TAKE-${pending.shotId}-${pad(num, 2)}`,
          releaseId: pending.releaseId,
          sceneId: pending.sceneId,
          shotId: pending.shotId,
          jobId: pending.id,
          takeNumber: num,
          assetId: asset.id,
          storageRef: stored.storageRef,
          contentSha256: sha,
          runtimeSec: probe.runtimeSec,
          resolution: typeof w === 'number' && typeof h === 'number' ? `${w}x${h}` : UNKNOWN,
          frameRate: probe.frameRate,
          aspectRatio: typeof w === 'number' && typeof h === 'number' ? aspectOf(w, h) : UNKNOWN,
          audioPresent: probe.audioPresent,
          provider: pending.provider,
          model: pending.model,
          intendedEditSec: shot.screenSec,
          continuity: { status: 'NOT_REVIEWED', approvalId: null, findings: [] },
          decision: 'READY_FOR_REVIEW',
          selectedForEdit: false,
          approvalIds: [],
        });
        ops.push({ create: take });
        takeId = take.id;
      }
      ops.push({ update: transitionJob({ ...pending, outputAssetIds: [...pending.outputAssetIds, asset.id] }, 'CAPTURED', SYSTEM_ACTOR, this.now, 'output stored privately and hash-verified', { assetId: asset.id, takeId }), expectedRevision: pending.revision });
      return (await this.d.store.apply(ops)).at(-1) as GenerationJobRecord;
    } catch (e) {
      const current = await this.must('GENERATION_JOB', jobId);
      if (current.revision !== pending.revision) return current;
      const failed = { ...pending, errors: [...pending.errors, { at: this.now, code: 'ASSET_CAPTURE_FAILED', message: errText(e) }] };
      return this.d.store.update(transitionJob(failed, 'ASSET_CAPTURE_FAILED', SYSTEM_ACTOR, this.now, 'capture failed; the provider is not called again', { error: errText(e) }), pending.revision);
    }
  }

  /* ── review ─────────────────────────────────────────────────────────────────────────────────────── */

  async decideTake(takeId: string, action: TakeAction, actor: Actor, opts: { note: string | null; decisionRefs?: string[] } = { note: null }) {
    const take = await this.must('TAKE', takeId);
    const shotTakes = (await this.d.store.list('TAKE')).filter((t) => t.shotId === take.shotId);
    const draft = this.approval(take, { approvalKind: 'TAKE_DECISION', decision: action, previousState: null, newState: null, note: opts.note, decisionRefs: opts.decisionRefs ?? [], supersedes: null }, actor);
    const next = decideTake(take, action, actor, this.now, draft.id, shotTakes);
    if (action === 'APPROVE' || action === 'SELECT_FOR_EDIT') {
      const v = await this.d.media.verify(take.storageRef, take.contentSha256);
      if (!v.ok) throw new SpineError('MEDIA_UNVERIFIED', `${takeId}: the stored copy no longer matches its hash`);
    }
    const state = (t: TakeRecord) => (t.selectedForEdit ? 'SELECTED_FOR_EDIT' : t.decision);
    const prior = (await this.d.store.list('APPROVAL')).filter((a) => a.subject.id === takeId && a.approvalKind === 'TAKE_DECISION').sort((x, y) => x.at.localeCompare(y.at)).at(-1)?.id ?? null;
    const ops: WriteOp[] = [{ create: { ...draft, previousState: state(take), newState: state(next), supersedes: prior } }, { update: next, expectedRevision: take.revision }];
    if (take.decision === 'APPROVED' && next.decision !== 'APPROVED')
      for (const c of (await this.d.store.list('CONTINUITY_REFERENCE')).filter((c) => c.takeId === takeId && c.status === 'CANONICAL')) ops.push({ update: { ...c, status: 'INVALIDATED', updatedAt: this.now }, expectedRevision: c.revision });
    return (await this.commit(ops))[1] as TakeRecord;
  }

  async reviewContinuity(takeId: string, status: 'PASS' | 'ISSUES', actor: Actor, note: string | null, findings: string[] = []) {
    requirePermission(actor, 'REVIEW_CONTINUITY', 'a continuity review');
    const clean = findings.map((f) => f.trim()).filter(Boolean);
    if (status === 'ISSUES' && !clean.length) throw new SpineError('FINDINGS_REQUIRED', 'a continuity review with issues lists them');
    if (clean.length > 20 || clean.some((f) => f.length > 300)) throw new SpineError('FINDINGS_TOO_LONG', 'at most 20 findings of 300 characters');
    const take = await this.must('TAKE', takeId);
    const a = this.approval(take, { approvalKind: 'CONTINUITY_REVIEW', decision: status, previousState: take.continuity.status, newState: status, note, decisionRefs: [], supersedes: take.continuity.approvalId }, actor);
    const next = { ...take, continuity: { status, approvalId: a.id, findings: clean }, approvalIds: [...take.approvalIds, a.id], updatedAt: this.now };
    return (await this.commit([{ create: a }, { update: next, expectedRevision: take.revision }]))[1] as TakeRecord;
  }

  /**
   * Extracts one frame of a take's stored copy as a continuity reference. Only an APPROVED take yields a CANONICAL
   * reference; any other take yields an INSPECTION_ONLY frame, and only when asked for explicitly.
   */
  async extractFrame(takeId: string, frameIndex: number, actor: Actor, opts: { purpose: string; inspectionOnly?: boolean }): Promise<ContinuityReferenceRecord> {
    if (!this.d.extractor) throw new SpineError('NO_FRAME_EXTRACTOR', 'no frame extractor in this runtime');
    // An inspection frame is part of reviewing; a canonical continuity frame is a production decision.
    requirePermission(actor, opts.inspectionOnly ? 'REVIEW_CONTINUITY' : 'EXTRACT_FRAME', opts.inspectionOnly ? 'an inspection frame' : 'choosing a continuity frame');
    const take = await this.must('TAKE', takeId);
    const approved = take.decision === 'APPROVED';
    if (!approved && !opts.inspectionOnly) throw new SpineError('TAKE_NOT_APPROVED', `${takeId} is ${take.decision}; an unapproved take cannot be a canonical continuity reference`);
    if (typeof take.frameRate !== 'number') throw new SpineError('FRAME_RATE_UNKNOWN', `${takeId}: frame rate ${take.frameRate}; the timestamp cannot be stated`);
    if (!Number.isInteger(frameIndex) || frameIndex < 0) throw new SpineError('FRAME_INDEX', `frame ${frameIndex}`);
    const status = approved && !opts.inspectionOnly ? 'CANONICAL' : 'INSPECTION_ONLY';
    const id = `CREF-${takeId}-F${pad(frameIndex, 4)}`;
    const existing = await this.d.store.get('CONTINUITY_REFERENCE', id);
    if (existing) {
      if (existing.status === status) return existing;
      throw new SpineError('CONFLICT', `${id} already exists as ${existing.status}`);
    }
    const bytes = await this.d.media.read(take.storageRef);
    if (sha256Hex(bytes) !== take.contentSha256) throw new SpineError('MEDIA_UNVERIFIED', `${takeId}: the stored copy no longer matches its hash`);
    const frame = await this.d.extractor.extract(bytes, frameIndex);
    const stored = await this.d.media.put({ projectId: take.projectId, bytes: frame.png, mimeType: 'image/png' });
    if (!(await this.d.media.verify(stored.storageRef, stored.sha256)).ok) throw new SpineError('MEDIA_UNVERIFIED', 'extracted frame did not store intact');
    const at = this.now;
    const base = { projectId: take.projectId, schemaVersion: SPINE_SCHEMA_VERSION, revision: 1, createdAt: at, updatedAt: at, createdBy: actor.id };
    const asset: AssetRecord = this.stamp({ ...base, kind: 'ASSET', id: `ASSET-${id}`, mediaType: 'IMAGE', mimeType: 'image/png', adapter: this.d.media.adapter, storageRef: stored.storageRef, contentSha256: stored.sha256, byteSize: stored.byteSize, verifiedAt: at, lineage: { sourceJobId: take.jobId, sourceTakeId: take.id, derivedFromAssetId: take.assetId, providerOperationId: NOT_AVAILABLE, providerSourceHost: NOT_AVAILABLE } });
    const cref: ContinuityReferenceRecord = this.stamp({
      ...base,
      kind: 'CONTINUITY_REFERENCE',
      id,
      shotId: take.shotId,
      takeId: take.id,
      sourceAssetId: take.assetId,
      sourceSha256: take.contentSha256,
      frameIndex,
      timestampSec: Math.round((frameIndex / take.frameRate) * 1e6) / 1e6,
      resolution: `${frame.width}x${frame.height}`,
      assetId: asset.id,
      contentSha256: stored.sha256,
      takeDecisionAtExtraction: take.decision,
      status,
      purpose: opts.purpose,
    });
    return (await this.commit([{ create: asset }, { create: cref }]))[1] as ContinuityReferenceRecord;
  }
}
