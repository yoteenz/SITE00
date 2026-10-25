import type { FrameExtractor, MediaProbe } from './frames.js';
import { aspectOf } from './frames.js';
import { evaluateGate, issueDispatchTicket, type GateInput, type GateReason, type SceneGateResult } from './gate.js';
import { sha256Hex } from './hash.js';
import { DISPATCHED_STATES, decideTake, reviseJobInputs, transitionJob } from './machines.js';
import type { MediaStore } from './media.js';
import { buildProviderRequest, type ProviderInput, type ProviderTransport } from './providers.js';
import type { RecordStore } from './store.js';
import {
  NOT_AVAILABLE,
  SPINE_SCHEMA_VERSION,
  SpineError,
  TEST_FIXTURE,
  UNKNOWN,
  type Actor,
  type ApprovalRecord,
  type AssetRecord,
  type ContinuityReferenceRecord,
  type GenerationJobRecord,
  type ShotRecord,
  type TakeAction,
  type TakeRecord,
  type Unknowable,
} from './types.js';

/**
 * The provider runner (§22): one path from an approved shot to a take in review.
 *
 *   load shot → resolve approved references → spend gate → job ledger (QUEUED) → provider request (ticketed)
 *   → provider status → capture output → private storage → hash verification → TAKE, READY_FOR_REVIEW
 *
 * It never retries, never regenerates after a rejection, and never approves anything itself.
 */

export const SYSTEM_ACTOR: Actor = { id: 'system:production-runner', role: 'SYSTEM' };

export type RunnerDeps = {
  store: RecordStore;
  media: MediaStore;
  /** routeId → transport. A route with no transport cannot be dispatched. */
  transports: Readonly<Record<string, ProviderTransport>>;
  sceneGate: (job: GenerationJobRecord, shot: ShotRecord) => SceneGateResult;
  probe: MediaProbe;
  extractor?: FrameExtractor;
  clock: () => string;
};

export type DispatchOutcome =
  | { outcome: 'SUBMITTED'; job: GenerationJobRecord }
  | { outcome: 'DUPLICATE_IDEMPOTENT'; job: GenerationJobRecord }
  | { outcome: 'BLOCKED'; job: GenerationJobRecord; reasons: Array<{ code: string; detail: string }> }
  | { outcome: 'FAILED'; job: GenerationJobRecord };

const pad = (n: number, w: number) => String(n).padStart(w, '0');
const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));

export class ProductionRunner {
  constructor(private readonly d: RunnerDeps) {
    if (d.store.live !== d.media.live) throw new SpineError('STORE_MISMATCH', 'records and media must both be live or both be test stores');
    if (d.store.live && Object.values(d.transports).some((t) => t.kind === 'FAKE_TEST')) throw new SpineError('FAKE_TRANSPORT_IN_LIVE', 'the fake provider writes test media; it cannot feed the live catalogue');
  }

  private get now() {
    return this.d.clock();
  }

  /** Test stores mark every record they write. */
  private stamp<T extends object>(rec: T): T {
    return this.d.store.live ? rec : { ...rec, fixture: TEST_FIXTURE };
  }

  private async must<K extends Parameters<RecordStore['get']>[0]>(kind: K, id: string) {
    const r = await this.d.store.get(kind, id);
    if (!r) throw new SpineError('NOT_FOUND', `${kind}/${id} in ${this.d.store.projectId}`);
    return r;
  }

  private transportFor(job: GenerationJobRecord): ProviderTransport | null {
    return this.d.transports[job.routeId] ?? null;
  }

  async gateInput(job: GenerationJobRecord): Promise<GateInput> {
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
      ledger,
      scene: this.d.sceneGate(job, shot),
      now: this.now,
    };
  }

  /** Why a job can or cannot be sent now (the runtime gate first, then the spend gate). Writes nothing. */
  async dispatchPreview(jobId: string): Promise<{ enabled: boolean; reasons: GateReason[] | Array<{ code: string; detail: string }> }> {
    const job = await this.must('GENERATION_JOB', jobId);
    const t = this.transportFor(job);
    const runtime = !t ? [{ code: 'NO_TRANSPORT', detail: `no transport for ${job.routeId}` }] : t.status().enabled ? [] : [{ code: 'PROVIDER_EXECUTION_DISABLED', detail: t.status().reason }];
    const gate = evaluateGate(await this.gateInput(job));
    const reasons = [...runtime, ...gate.reasons];
    return { enabled: reasons.length === 0, reasons };
  }

  /* ── approvals the founder records (supported workflow; nothing here is pre-approved) ───────────── */

  private approval(a: Omit<ApprovalRecord, 'kind' | 'projectId' | 'schemaVersion' | 'revision' | 'createdAt' | 'updatedAt' | 'createdBy' | 'actor' | 'actorRole' | 'at'>, actor: Actor): ApprovalRecord {
    const at = this.now;
    return this.stamp({ kind: 'APPROVAL', projectId: this.d.store.projectId, schemaVersion: SPINE_SCHEMA_VERSION, revision: 1, createdAt: at, updatedAt: at, createdBy: actor.id, actor: actor.id, actorRole: actor.role, at, ...a });
  }

  private async nextApprovalId(subjectId: string) {
    const n = (await this.d.store.list('APPROVAL')).filter((a) => a.subject.id === subjectId).length + 1;
    return `APR-${subjectId}-${pad(n, 3)}`;
  }

  private founderOnly(actor: Actor, what: string) {
    if (actor.role !== 'FOUNDER') throw new SpineError('FORBIDDEN', `${what} needs the founder; ${actor.id} is ${actor.role}`);
  }

  async authorizeBudget(budgetId: string, actor: Actor, opts: { authorizedCredits: number; decisionRefs: string[]; note: string | null }) {
    this.founderOnly(actor, 'authorizing a budget');
    const budget = await this.must('BUDGET', budgetId);
    if (budget.status !== 'PLANNING_ESTIMATE_ONLY') throw new SpineError('ILLEGAL_TRANSITION', `${budgetId} is ${budget.status}`);
    const a = this.approval({ id: await this.nextApprovalId(budgetId), approvalKind: 'BUDGET_AUTHORIZATION', subject: { kind: 'BUDGET', id: budgetId }, decision: 'AUTHORIZE', note: opts.note, decisionRefs: opts.decisionRefs, supersedes: null, authorizedCredits: opts.authorizedCredits }, actor);
    await this.d.store.create(a);
    return this.d.store.update({ ...budget, status: 'AUTHORIZED', authorizedCredits: opts.authorizedCredits, approvalId: a.id, updatedAt: this.now }, budget.revision);
  }

  /** The founder approves an image as a shot reference; jobs that use it are rebound (and lose any authorization). */
  async approveReference(shotId: string, referenceId: string, assetId: string, actor: Actor, opts: { decisionRefs: string[]; note: string | null }) {
    this.founderOnly(actor, 'approving a reference');
    const shot = await this.must('SHOT', shotId);
    const ref = shot.references.find((r) => r.referenceId === referenceId);
    if (!ref) throw new SpineError('NOT_FOUND', `${shotId} has no reference ${referenceId}`);
    const asset = await this.must('ASSET', assetId);
    if (asset.mediaType !== 'IMAGE') throw new SpineError('MEDIA_TYPE', `${assetId} is ${asset.mediaType}; a reference is an image`);
    if (!(await this.d.media.verify(asset.storageRef, asset.contentSha256)).ok) throw new SpineError('MEDIA_UNVERIFIED', `${assetId} does not match its hash`);
    const a = this.approval({ id: await this.nextApprovalId(assetId), approvalKind: 'REFERENCE_APPROVAL', subject: { kind: 'ASSET', id: assetId }, decision: 'APPROVE', note: opts.note, decisionRefs: opts.decisionRefs, supersedes: null }, actor);
    await this.d.store.create(a);
    const next = await this.d.store.update({ ...shot, references: shot.references.map((r) => (r.referenceId === referenceId ? { ...r, status: 'APPROVED' as const, assetId } : r)), updatedAt: this.now }, shot.revision);
    for (const jobId of shot.jobIds) {
      const job = await this.must('GENERATION_JOB', jobId);
      if (!job.inputs.some((i) => i.referenceId === referenceId)) continue;
      const revised = reviseJobInputs(job, { inputs: job.inputs.map((i) => (i.referenceId === referenceId ? { ...i, assetId, contentSha256: asset.contentSha256 } : i)) }, actor, this.now, `${referenceId} approved as ${assetId}`);
      if (revised !== job) await this.d.store.update(revised, job.revision);
    }
    return next;
  }

  async requestAuthorization(jobId: string, actor: Actor) {
    const job = await this.must('GENERATION_JOB', jobId);
    return this.d.store.update(transitionJob(job, 'AWAITING_APPROVAL', actor, this.now, 'authorization requested'), job.revision);
  }

  /** Founder authorization of one job at its current inputs. Refused, and nothing written, unless the gate would pass. */
  async authorizeJob(jobId: string, actor: Actor, opts: { maxCredits: number; ttlSec: number; decisionRefs: string[]; note: string | null }) {
    this.founderOnly(actor, 'authorizing generation');
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status !== 'AWAITING_APPROVAL') throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}, not AWAITING_APPROVAL`);
    const gate = evaluateGate(await this.gateInput(job), { forAuthorization: true });
    if (!gate.allowed) throw new SpineError('GATE_BLOCKED', gate.reasons.map((r) => `${r.code} (${r.detail})`).join('; '));
    if (job.quotedCost.credits! > opts.maxCredits) throw new SpineError('EXCEEDS_AUTHORIZED_MAX', `${jobId} quotes ${job.quotedCost.credits}; maximum offered ${opts.maxCredits}`);
    const shot = await this.must('SHOT', job.shotId);
    const expiresAt = new Date(Date.parse(this.now) + opts.ttlSec * 1000).toISOString();
    const a = this.approval({ id: await this.nextApprovalId(jobId), approvalKind: 'GENERATION_AUTHORIZATION', subject: { kind: 'GENERATION_JOB', id: jobId }, decision: 'AUTHORIZE', note: opts.note, decisionRefs: opts.decisionRefs, supersedes: job.founderApprovalRef, inputHash: job.inputHash, maxCredits: opts.maxCredits, expiresAt, budgetId: shot.budgetId }, actor);
    await this.d.store.create(a);
    const next = transitionJob({ ...job, founderApprovalRef: a.id, maxAuthorizedCost: { credits: opts.maxCredits } }, 'AUTHORIZED', actor, this.now, 'founder authorized generation', { approvalId: a.id });
    return this.d.store.update(next, job.revision);
  }

  async revokeAuthorization(jobId: string, actor: Actor, note: string | null) {
    this.founderOnly(actor, 'revoking an authorization');
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status !== 'AUTHORIZED' || !job.founderApprovalRef) throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}; nothing to revoke`);
    const a = this.approval({ id: await this.nextApprovalId(jobId), approvalKind: 'GENERATION_AUTHORIZATION', subject: { kind: 'GENERATION_JOB', id: jobId }, decision: 'REVOKE', note, decisionRefs: [], supersedes: job.founderApprovalRef }, actor);
    await this.d.store.create(a);
    return this.d.store.update(transitionJob(job, 'AWAITING_APPROVAL', actor, this.now, 'authorization revoked', { approvalId: a.id }), job.revision);
  }

  /** A failed job is retried only on this explicit founder request, and only through a new authorization. */
  async requestRetry(jobId: string, actor: Actor, reason: string) {
    this.founderOnly(actor, 'requesting a retry');
    const job = await this.must('GENERATION_JOB', jobId);
    return this.d.store.update(transitionJob(job, 'AWAITING_APPROVAL', actor, this.now, `retry requested: ${reason}`, { retryRequest: reason }), job.revision);
  }

  /* ── execution ──────────────────────────────────────────────────────────────────────────────────── */

  private async providerInputs(job: GenerationJobRecord): Promise<ProviderInput[] | Array<{ code: string; detail: string }>> {
    const out: ProviderInput[] = [];
    const bad: Array<{ code: string; detail: string }> = [];
    for (const i of job.inputs) {
      const asset = i.assetId ? await this.d.store.get('ASSET', i.assetId) : null;
      if (!asset || asset.contentSha256 !== i.contentSha256 || !(await this.d.media.verify(asset.storageRef, asset.contentSha256)).ok) {
        bad.push({ code: 'REFERENCE_MEDIA_UNVERIFIED', detail: `${i.referenceId}: stored copy missing or not matching its hash` });
        continue;
      }
      out.push({ role: i.role, referenceId: i.referenceId, storageRef: asset.storageRef, sha256: asset.contentSha256 });
    }
    return bad.length ? bad : out;
  }

  async dispatch(jobId: string): Promise<DispatchOutcome> {
    const job = await this.must('GENERATION_JOB', jobId);
    if (DISPATCHED_STATES.includes(job.status)) return { outcome: 'DUPLICATE_IDEMPOTENT', job };
    const transport = this.transportFor(job);
    const runtime = transport?.status();
    if (!transport || !runtime?.enabled) return { outcome: 'BLOCKED', job, reasons: [{ code: 'PROVIDER_EXECUTION_DISABLED', detail: runtime?.reason ?? `no transport for ${job.routeId}` }] };

    const gi = await this.gateInput(job);
    const issued = issueDispatchTicket(gi);
    if (!issued.ticket) {
      const voided = issued.reasons.find((r) => r.code === 'APPROVAL_INVALIDATED_BY_INPUT_CHANGE' || r.code === 'AUTHORIZATION_EXPIRED' || r.code === 'AUTHORIZATION_REVOKED');
      const after = job.status === 'AUTHORIZED' && voided ? await this.d.store.update(transitionJob(job, 'AWAITING_APPROVAL', SYSTEM_ACTOR, this.now, `authorization void: ${voided.code}`), job.revision) : job;
      return { outcome: 'BLOCKED', job: after, reasons: issued.reasons };
    }
    const inputs = await this.providerInputs(job);
    if (inputs.some((i) => 'code' in i)) return { outcome: 'BLOCKED', job, reasons: inputs as Array<{ code: string; detail: string }> };
    const ticket = issued.ticket;

    const attempt = { attempt: job.attempts.length + 1, authorizationId: ticket.authorizationId, ticketId: ticket.ticketId, operationId: NOT_AVAILABLE, outcome: 'OPEN' as const, chargedCredits: NOT_AVAILABLE };
    // Persisting QUEUED before the call is the ledger entry; a concurrent dispatch fails here on the revision check.
    const queued = await this.d.store.update(transitionJob({ ...job, attempts: [...job.attempts, attempt] }, 'QUEUED', SYSTEM_ACTOR, this.now, 'spend gate passed', { ticketId: ticket.ticketId, approvalId: ticket.authorizationId }), job.revision);
    let operationId: string;
    try {
      ({ operationId } = await transport.submit(buildProviderRequest(queued, inputs as ProviderInput[]), ticket, this.now));
    } catch (e) {
      const failed = this.closeAttempt(queued, 'FAILED', UNKNOWN);
      const next = transitionJob({ ...failed, errors: [...failed.errors, { at: this.now, code: 'PROVIDER_SUBMIT_FAILED', message: errText(e) }] }, 'FAILED', SYSTEM_ACTOR, this.now, 'provider refused the submission; no automatic retry', { error: errText(e) });
      return { outcome: 'FAILED', job: await this.d.store.update(next, queued.revision) };
    }
    const withOp = { ...queued, providerOperationId: operationId, submittedAt: this.now, attempts: queued.attempts.map((a) => (a.attempt === attempt.attempt ? { ...a, operationId } : a)) };
    return { outcome: 'SUBMITTED', job: await this.d.store.update(transitionJob(withOp, 'RUNNING', SYSTEM_ACTOR, this.now, 'provider accepted the request', { operationId }), queued.revision) };
  }

  private closeAttempt(job: GenerationJobRecord, outcome: 'SUCCEEDED' | 'FAILED' | 'CANCELED', charged: Unknowable<number>): GenerationJobRecord {
    const attempts = job.attempts.map((a) => (a.outcome === 'OPEN' ? { ...a, outcome, chargedCredits: charged } : a));
    const closed = attempts.filter((a) => a.outcome !== 'OPEN');
    const actual: Unknowable<number> = !closed.length ? NOT_AVAILABLE : closed.every((a) => typeof a.chargedCredits === 'number') ? closed.reduce((n, a) => n + (a.chargedCredits as number), 0) : UNKNOWN;
    return { ...job, attempts, actualSpend: { credits: actual }, completedAt: this.now };
  }

  /** Reads provider status once. A failure is recorded and left for the founder; nothing is resubmitted. */
  async poll(jobId: string) {
    const job = await this.must('GENERATION_JOB', jobId);
    if (job.status !== 'RUNNING' || typeof job.providerOperationId !== 'string' || job.providerOperationId === NOT_AVAILABLE || job.providerOperationId === UNKNOWN) throw new SpineError('ILLEGAL_TRANSITION', `${jobId} is ${job.status}; only a running job is polled`);
    const transport = this.transportFor(job);
    if (!transport) throw new SpineError('NO_TRANSPORT', job.routeId);
    const p = await transport.poll(job.providerOperationId);
    if (p.state === 'RUNNING') return job;
    if (p.state === 'FAILED') {
      const failed = this.closeAttempt(job, 'FAILED', p.reportedCredits);
      return this.d.store.update(transitionJob({ ...failed, errors: [...failed.errors, { at: this.now, code: 'PROVIDER_JOB_FAILED', message: p.error }] }, 'FAILED', SYSTEM_ACTOR, this.now, 'provider reported failure; no automatic retry', { error: p.error }), job.revision);
    }
    const done = await this.d.store.update(transitionJob(this.closeAttempt(job, 'SUCCEEDED', p.reportedCredits), 'SUCCEEDED', SYSTEM_ACTOR, this.now, 'provider reported success'), job.revision);
    return this.capture(done.id, SYSTEM_ACTOR);
  }

  /**
   * Copies the provider's output into private storage, re-reads and hashes the copy, probes it, and records the asset.
   * A video job yields a TAKE in READY_FOR_REVIEW; an image job yields an asset the founder may approve as a reference.
   */
  async capture(jobId: string, actor: Actor) {
    const job = await this.must('GENERATION_JOB', jobId);
    const pending = await this.d.store.update(transitionJob(job, 'ASSET_CAPTURE_PENDING', actor, this.now, job.status === 'SUCCEEDED' ? 'capturing output' : 'capture requested again'), job.revision);
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
      const n = pending.outputAssetIds.length + 1;
      const asset: AssetRecord = this.stamp({
        kind: 'ASSET',
        id: `ASSET-${pending.id}-${pad(n, 2)}`,
        projectId: pending.projectId,
        schemaVersion: SPINE_SCHEMA_VERSION,
        revision: 1,
        createdAt: at,
        updatedAt: at,
        createdBy: actor.id,
        mediaType: out.mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        mimeType: out.mimeType,
        adapter: this.d.media.adapter,
        storageRef: stored.storageRef,
        contentSha256: sha,
        byteSize: stored.byteSize,
        verifiedAt: at,
        lineage: { sourceJobId: pending.id, sourceTakeId: null, derivedFromAssetId: null, providerOperationId: pending.providerOperationId, providerSourceHost: out.sourceHost },
      });
      await this.d.store.create(asset);
      let takeId = '';
      if (pending.jobKind === 'VIDEO_I2V') {
        const takes = (await this.d.store.list('TAKE')).filter((t) => t.shotId === pending.shotId);
        const num = takes.length + 1;
        const w = probe.width, h = probe.height;
        const take: TakeRecord = this.stamp({
          kind: 'TAKE',
          id: `TAKE-${pending.shotId}-${pad(num, 2)}`,
          projectId: pending.projectId,
          schemaVersion: SPINE_SCHEMA_VERSION,
          revision: 1,
          createdAt: at,
          updatedAt: at,
          createdBy: actor.id,
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
          continuity: { status: 'NOT_REVIEWED', approvalId: null },
          decision: 'READY_FOR_REVIEW',
          selectedForEdit: false,
          approvalIds: [],
        });
        await this.d.store.create(take);
        takeId = take.id;
      }
      const captured = transitionJob({ ...pending, outputAssetIds: [...pending.outputAssetIds, asset.id] }, 'CAPTURED', SYSTEM_ACTOR, this.now, 'output stored privately and hash-verified', { assetId: asset.id, takeId: takeId || 'NONE (image job)' });
      return this.d.store.update(captured, pending.revision);
    } catch (e) {
      const failed = { ...pending, errors: [...pending.errors, { at: this.now, code: 'ASSET_CAPTURE_FAILED', message: errText(e) }] };
      return this.d.store.update(transitionJob(failed, 'ASSET_CAPTURE_FAILED', SYSTEM_ACTOR, this.now, 'capture failed; the provider is not called again', { error: errText(e) }), pending.revision);
    }
  }

  /* ── review ─────────────────────────────────────────────────────────────────────────────────────── */

  async decideTake(takeId: string, action: TakeAction, actor: Actor, opts: { note: string | null; decisionRefs?: string[] } = { note: null }) {
    const take = await this.must('TAKE', takeId);
    const shotTakes = (await this.d.store.list('TAKE')).filter((t) => t.shotId === take.shotId);
    const approvalId = await this.nextApprovalId(takeId);
    const next = decideTake(take, action, actor, this.now, approvalId, shotTakes);
    if (action === 'APPROVE' || action === 'SELECT_FOR_EDIT') {
      const v = await this.d.media.verify(take.storageRef, take.contentSha256);
      if (!v.ok) throw new SpineError('MEDIA_UNVERIFIED', `${takeId}: the stored copy no longer matches its hash`);
    }
    const prior = (await this.d.store.list('APPROVAL')).filter((a) => a.subject.id === takeId && a.approvalKind === 'TAKE_DECISION').at(-1)?.id ?? null;
    await this.d.store.create(this.approval({ id: approvalId, approvalKind: 'TAKE_DECISION', subject: { kind: 'TAKE', id: takeId }, decision: action, note: opts.note, decisionRefs: opts.decisionRefs ?? [], supersedes: prior }, actor));
    const saved = await this.d.store.update(next, take.revision);
    if (take.decision === 'APPROVED' && next.decision !== 'APPROVED') {
      for (const c of (await this.d.store.list('CONTINUITY_REFERENCE')).filter((c) => c.takeId === takeId && c.status === 'CANONICAL'))
        await this.d.store.update({ ...c, status: 'INVALIDATED', updatedAt: this.now }, c.revision);
    }
    return saved;
  }

  async reviewContinuity(takeId: string, status: 'PASS' | 'ISSUES', actor: Actor, note: string | null) {
    if (actor.role === 'SYSTEM') throw new SpineError('FORBIDDEN', 'a continuity review is a person’s judgement');
    const take = await this.must('TAKE', takeId);
    const approvalId = await this.nextApprovalId(takeId);
    await this.d.store.create(this.approval({ id: approvalId, approvalKind: 'CONTINUITY_REVIEW', subject: { kind: 'TAKE', id: takeId }, decision: status, note, decisionRefs: [], supersedes: take.continuity.approvalId }, actor));
    return this.d.store.update({ ...take, continuity: { status, approvalId }, approvalIds: [...take.approvalIds, approvalId], updatedAt: this.now }, take.revision);
  }

  /**
   * Extracts one frame of a take's stored copy as a continuity reference. Only an APPROVED take yields a CANONICAL
   * reference; any other take yields an INSPECTION_ONLY frame, and only when asked for explicitly.
   */
  async extractFrame(takeId: string, frameIndex: number, actor: Actor, opts: { purpose: string; inspectionOnly?: boolean }): Promise<ContinuityReferenceRecord> {
    if (!this.d.extractor) throw new SpineError('NO_FRAME_EXTRACTOR', 'no frame extractor in this runtime');
    if (actor.role === 'SYSTEM') throw new SpineError('FORBIDDEN', 'choosing a continuity frame is a person’s decision');
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
    await this.d.store.create(asset);
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
    await this.d.store.create(cref);
    return cref;
  }
}
