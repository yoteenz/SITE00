import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FOUNDER_ACTOR } from '../shared/site00-fiction-production/approvals.js';
import { repoPath } from '../shared/site00-fiction-production/paths.js';
import { loadSeasonMaster } from '../shared/site00-fiction-production/seasonMaster.js';
import { assembleProjectGraph } from '../shared/site00-production-graph/graph.js';
import {
  decideTake,
  evaluateGate,
  FakeProviderTransport,
  issueDispatchTicket,
  MediaSigner,
  MemoryMediaStore,
  memoryStore,
  OpenArtAgentSessionTransport,
  ProductionRunner,
  recordProblems,
  redeemDispatchTicket,
  reviseJobInputs,
  serializeRecord,
  TEST_FIXTURE,
  transitionJob,
  verifyStoreIntegrity,
  type Actor,
  type AnyRecord,
  type AssetRecord,
  type DispatchTicket,
  type GenerationJobRecord,
  type ProviderTransport,
  committedCredits,
  FOUNDER_ONLY,
  PROJECT_ROLES,
  ROLE_PERMISSIONS,
  type FakeBehaviour,
} from '../shared/site00-production-spine/index.js';
import { FfmpegFrameExtractor, FfprobeMediaProbe } from '../shared/site00-production-spine/node/ffmpeg.js';
import { jsonFileStore } from '../shared/site00-production-spine/node/jsonStore.js';
import { LocalPrivateMediaStore } from '../shared/site00-production-spine/node/localMedia.js';
import { SupabasePrivateMediaStore, type StorageClient } from '../shared/site00-production-spine/node/supabaseMedia.js';
import { buildSh01Records, EXCHANGE_PROJECT_ID, EXCHANGE_RECORDS_DIR, exchangeActorAdapter, SH01, sceneGateFrom } from '../shared/site00-production-spine/projects/theExchange.js';
import { authorizeStep, decideElement } from '../shared/site00-fiction-production/directorial/review.js';
import { loadSceneReviewState } from '../shared/site00-fiction-production/scenes/index.js';
import { theExchangeGraphPart } from '../shared/site00-production-spine/projects/theExchangeGraph.js';
import { getStudioWorldActorCatalogue } from '../shared/site00-studio-world/acting-catalogue/seedCatalogue.js';
import { getSite00ManagedProject, listDesignEnabledManagedProjects } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { makeSpineFixtureMedia, steppingClock, tempDir, type SpineFixtureMedia } from '../scripts/production/spineFixtures.js';

const root = process.cwd();
const FOUNDER: Actor = { id: FOUNDER_ACTOR, role: 'FOUNDER' };
const REVIEWER: Actor = { id: 'test:reviewer', role: 'REVIEWER' };
const ADMIN: Actor = { id: 'test:production-admin', role: 'PRODUCTION_ADMIN' };
const EDITOR: Actor = { id: 'test:editor', role: 'AUTHORIZED_EDITOR' };
const READER: Actor = { id: 'test:read-only', role: 'READ_ONLY' };
const SYSTEM: Actor = { id: 'system:test', role: 'SYSTEM' };
const TEST_QUOTE_SOURCE = { path: 'TEST_FIXTURE', recordId: 'fake-provider-quote', sha256: null };
const VIDEO = `JOB-${SH01.shotId}-VIDEO-01`;
const mark = <T extends AnyRecord>(r: T): T => ({ ...r, fixture: TEST_FIXTURE });
const code = (p: Promise<unknown>) => p.then(() => 'OK', (e: Error) => e.message.split(':')[0]);
const codeSync = (f: () => unknown) => {
  try {
    f();
    return 'OK';
  } catch (e) {
    return (e as Error).message.split(':')[0];
  }
};

let fx: SpineFixtureMedia;
beforeAll(() => {
  fx = makeSpineFixtureMedia();
});
afterAll(() => fs.rmSync(fx.dir, { recursive: true, force: true }));

/** A test store holding the SH01 setup, with optional test-only approvals that let the gate pass. */
async function harness(opts: { approve?: boolean; budgetCredits?: number; scene?: boolean; transport?: (fx: SpineFixtureMedia) => ProviderTransport; behaviour?: FakeBehaviour } = {}) {
  const store = memoryStore(EXCHANGE_PROJECT_ID);
  const media = new MemoryMediaStore();
  const clock = steppingClock();
  const { budget, shot, jobs } = buildSh01Records(root);
  await store.create(mark(budget));
  await store.create(mark(opts.approve ? { ...shot, requiredDecisions: shot.requiredDecisions.map((d) => ({ ...d, status: 'ANSWERED' as const })) } : shot));
  for (const j of jobs) await store.create(mark(j));
  let authorizeError = 'NOT_ATTEMPTED';
  const fake = (opts.transport?.(fx) ?? new FakeProviderTransport('OpenArt', { bytes: fx.video, mimeType: 'video/mp4' }, opts.behaviour)) as FakeProviderTransport;
  const runner = new ProductionRunner({ store, media, transports: { 'OA-NBP-I2I-2K-REF': fake, 'OA-K3O-I2V-PRO': fake }, sceneGate: () => (opts.scene === false ? { valid: false, reasons: ['PRODUCTION not authorized'] } : { valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), extractor: new FfmpegFrameExtractor(), clock });
  if (opts.approve) {
    const ref = await media.put({ projectId: EXCHANGE_PROJECT_ID, bytes: fx.frame, mimeType: 'image/png' });
    const at = clock();
    const asset: AssetRecord = { kind: 'ASSET', id: 'ASSET-TEST-REF', projectId: EXCHANGE_PROJECT_ID, schemaVersion: 1, revision: 1, createdAt: at, updatedAt: at, createdBy: 'test', fixture: TEST_FIXTURE, mediaType: 'IMAGE', mimeType: 'image/png', adapter: 'MEMORY_TEST', storageRef: ref.storageRef, contentSha256: ref.sha256, byteSize: ref.byteSize, verifiedAt: at, lineage: { sourceJobId: null, sourceTakeId: null, derivedFromAssetId: null, providerOperationId: 'NOT_AVAILABLE', providerSourceHost: 'NOT_AVAILABLE' } };
    await store.create(asset);
    await runner.authorizeBudget(SH01.budgetId, FOUNDER, { authorizedCredits: opts.budgetCredits ?? 255, decisionRefs: ['FD-S101-11'], note: 'TEST' });
    await runner.approveReference(SH01.shotId, 'KF-ENV-CITY-DUSK-A', asset.id, FOUNDER, { decisionRefs: ['FD-S101-08'], note: 'TEST' });
    await runner.requestAuthorization(VIDEO, FOUNDER);
    // A fresh test quote: the planning quote in the records is history, not a price to spend against.
    await runner.recordQuote(VIDEO, FOUNDER, { credits: 175, quotedAt: clock(), source: TEST_QUOTE_SOURCE });
    authorizeError = await code(runner.authorizeJob(VIDEO, FOUNDER, { maxCredits: 175, ttlSec: 600, decisionRefs: ['FD-S101-11'], note: 'TEST' }));
  }
  return { store, media, runner, fake, clock, authorizeError };
}

async function capturedTake() {
  const h = await harness({ approve: true });
  await h.runner.dispatch(VIDEO, FOUNDER);
  await h.runner.poll(VIDEO);
  const take = (await h.store.list('TAKE'))[0]!;
  return { ...h, take };
}

describe('production records (§16, §20, §23)', () => {
  it('commits the S1-01-SH01 setup exactly as built from the packet and quotes, and it holds together', async () => {
    const live = jsonFileStore(repoPath(EXCHANGE_RECORDS_DIR, root), { projectId: EXCHANGE_PROJECT_ID, live: true, readOnly: true });
    const { budget, shot, jobs } = buildSh01Records(root);
    for (const r of [budget, shot, ...jobs]) expect(serializeRecord((await live.get(r.kind, r.id))!), `${r.kind}/${r.id}`).toBe(serializeRecord(r));
    expect(await verifyStoreIntegrity(live)).toEqual([]);
    const files = fs.readdirSync(repoPath(EXCHANGE_RECORDS_DIR, root), { recursive: true }).filter((f) => String(f).endsWith('.json'));
    expect(files).toHaveLength(5);
    expect(await live.list('TAKE')).toEqual([]);
    expect(await live.list('APPROVAL')).toEqual([]);
  });

  it('prepares SH01 as PRODUCTION_SETUP_READY / GENERATION_AUTHORIZATION_PENDING at a 255-credit planning estimate', () => {
    const { budget, shot, jobs } = buildSh01Records(root);
    expect([shot.setup, shot.generation]).toEqual(['PRODUCTION_SETUP_READY', 'GENERATION_AUTHORIZATION_PENDING']);
    expect([shot.screenSec, shot.screenFrames, shot.generationSec, shot.fps]).toEqual([4, 96, 5, 24]);
    expect(shot.requiredDecisions.map((d) => [d.decisionId, d.status])).toEqual([['FD-S101-01', 'OPEN'], ['FD-S101-08', 'OPEN'], ['FD-S101-11', 'OPEN']]);
    expect(budget).toMatchObject({ status: 'PLANNING_ESTIMATE_ONLY', plannedCredits: 255, authorizedCredits: 0, approvalId: null });
    expect(jobs.map((j) => [j.id, j.quotedCost.credits, j.status])).toEqual([
      ['JOB-S1-01-SH01-REF-01', 40, 'DRAFT'],
      ['JOB-S1-01-SH01-REF-02', 40, 'DRAFT'],
      [VIDEO, 175, 'DRAFT'],
    ]);
    for (const j of jobs) expect([j.providerOperationId, j.actualSpend.credits]).toEqual(['NOT_AVAILABLE', 'NOT_AVAILABLE']);
  });

  it('refuses GENERATION_READY while any decision, reference or live provider check is outstanding', () => {
    const { shot } = buildSh01Records(root);
    const problems = recordProblems({ ...shot, generation: 'GENERATION_READY' });
    expect(problems.join('\n')).toMatch(/FD-S101-01 is OPEN[\s\S]*KF-ENV-CITY-DUSK-A is NOT_CREATED[\s\S]*live provider check is NOT_RUN/);
  });

  it('validates schema, and refuses unknown fields, URLs, secret-like fields and oversized records', () => {
    const { budget } = buildSh01Records(root);
    expect(recordProblems(budget)).toEqual([]);
    expect(recordProblems({ ...budget, extra: 1 }).join()).toMatch(/extra|Unrecognized/);
    expect(recordProblems({ ...budget, note: 'https://cdn.example.test/master.mp4' }).join()).toMatch(/URLs are not stored/);
    expect(recordProblems({ ...budget, lines: [{ ...budget.lines[0], apiKey: 'x' }] }).join()).toMatch(/secret-like/);
    expect(recordProblems({ ...budget, note: 'x'.repeat(300_000) }).join()).toMatch(/exceeds/);
  });

  it('writes idempotently, detects conflicts by revision, never changes an approval, and serializes deterministically', async () => {
    const { budget } = buildSh01Records(root);
    const s = memoryStore(EXCHANGE_PROJECT_ID);
    expect((await s.create(mark(budget))).created).toBe(true);
    expect((await s.create(mark(budget))).created).toBe(false);
    expect(await code(s.create(mark({ ...budget, note: 'changed' })))).toBe('CONFLICT');
    const v2 = await s.update(mark({ ...budget, note: 'v2' }), 1);
    expect(v2.revision).toBe(2);
    expect(await code(s.update(mark({ ...budget, note: 'stale' }), 1))).toBe('CONFLICT');
    const reversed = (v: unknown): unknown => (Array.isArray(v) ? v.map(reversed) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).reverse().map(([k, x]) => [k, reversed(x)])) : v);
    const a = serializeRecord(budget);
    expect(a).toBe(serializeRecord(reversed(budget) as AnyRecord));
    expect(a.endsWith('\n')).toBe(true);
    const h = await harness({ approve: true });
    const approval = (await h.store.list('APPROVAL'))[0]!;
    expect(await code(h.store.update(approval, 1))).toBe('IMMUTABLE_RECORD');
  });

  it('checks reference integrity and keeps each store to one project', async () => {
    const { budget, shot, jobs } = buildSh01Records(root);
    const s = memoryStore(EXCHANGE_PROJECT_ID);
    expect(await code(s.create(mark(jobs[0]!)))).toBe('REFERENCE_NOT_FOUND');
    await s.create(mark(budget));
    expect(await code(s.create(mark({ ...shot, projectId: 'jurnl' })))).toBe('CROSS_PROJECT_DENIED');
    expect(await code(memoryStore('jurnl').create(mark(budget)))).toBe('CROSS_PROJECT_DENIED');
    expect(await code(memoryStore(EXCHANGE_PROJECT_ID, true).create(mark(budget)))).toBe('FIXTURE_IN_LIVE_STORE');
    expect(await code(memoryStore(EXCHANGE_PROJECT_ID).create(budget))).toBe('FIXTURE_REQUIRED');
  });

  it('persists to repository JSON atomically, one file per record, and refuses another project’s file', async () => {
    const dir = tempDir('site00-spine-json-');
    const { budget, shot } = buildSh01Records(root);
    const s = jsonFileStore(dir, { projectId: EXCHANGE_PROJECT_ID, live: false });
    await s.create(mark(budget));
    await s.create(mark(shot));
    expect(fs.readdirSync(path.join(dir, 'BUDGET'))).toEqual([`${budget.id}.json`]);
    const reopened = jsonFileStore(dir, { projectId: EXCHANGE_PROJECT_ID, live: false });
    expect(await reopened.get('SHOT', shot.id)).toEqual(mark(shot));
    expect(await code(jsonFileStore(dir, { projectId: 'jurnl', live: false }).get('SHOT', shot.id))).toBe('CROSS_PROJECT_DENIED');
    expect(await code(jsonFileStore(dir, { projectId: EXCHANGE_PROJECT_ID, live: false, readOnly: 'pilot' }).create(mark({ ...budget, id: 'B2' })))).toBe('STORE_READ_ONLY');
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('job and take state machines (§17)', () => {
  const job = () => buildSh01Records(root).jobs[2]!;
  it('allows only listed transitions, by the listed roles, with evidence', () => {
    expect(codeSync(() => transitionJob(job(), 'RUNNING', SYSTEM, '2026-10-25T00:00:00Z', 'x'))).toBe('ILLEGAL_TRANSITION');
    expect(codeSync(() => transitionJob(job(), 'AWAITING_APPROVAL', REVIEWER, '2026-10-25T00:00:00Z', 'x'))).toBe('FORBIDDEN');
    const waiting = transitionJob(job(), 'AWAITING_APPROVAL', FOUNDER, '2026-10-25T00:00:00Z', 'x');
    expect(codeSync(() => transitionJob(waiting, 'AUTHORIZED', FOUNDER, '2026-10-25T00:00:00Z', 'x'))).toBe('MISSING_EVIDENCE');
    expect(codeSync(() => transitionJob(waiting, 'AUTHORIZED', SYSTEM, '2026-10-25T00:00:00Z', 'x', { approvalId: 'A' }))).toBe('FORBIDDEN');
    for (const terminal of ['CANCELED', 'CAPTURED'] as const) expect(codeSync(() => transitionJob({ ...job(), status: terminal }, 'AWAITING_APPROVAL', FOUNDER, '2026-10-25T00:00:00Z', 'x'))).toBe('ILLEGAL_TRANSITION');
  });

  it('leaves FAILED only on a founder retry request, which drops the old authorization', () => {
    const failed: GenerationJobRecord = { ...job(), status: 'FAILED', founderApprovalRef: 'APR-X', maxAuthorizedCost: { credits: 175 } };
    expect(codeSync(() => transitionJob(failed, 'QUEUED', SYSTEM, '2026-10-25T00:00:00Z', 'retry'))).toBe('ILLEGAL_TRANSITION');
    expect(codeSync(() => transitionJob(failed, 'AWAITING_APPROVAL', SYSTEM, '2026-10-25T00:00:00Z', 'retry', { retryRequest: 'x' }))).toBe('FORBIDDEN');
    const retry = transitionJob(failed, 'AWAITING_APPROVAL', FOUNDER, '2026-10-25T00:00:00Z', 'retry', { retryRequest: 'new start frame' });
    expect([retry.status, retry.founderApprovalRef, retry.maxAuthorizedCost.credits]).toEqual(['AWAITING_APPROVAL', null, null]);
  });

  it('voids an authorization when the inputs change', () => {
    const authorized: GenerationJobRecord = { ...job(), status: 'AUTHORIZED', founderApprovalRef: 'APR-X', maxAuthorizedCost: { credits: 175 } };
    const revised = reviseJobInputs(authorized, { settings: { ...authorized.settings, duration: 6 } }, FOUNDER, '2026-10-25T00:00:00Z', 'longer');
    expect(revised.inputHash).not.toBe(authorized.inputHash);
    expect([revised.status, revised.founderApprovalRef]).toEqual(['AWAITING_APPROVAL', null]);
    expect(reviseJobInputs(authorized, { settings: { ...authorized.settings } }, FOUNDER, '2026-10-25T00:00:00Z', 'same')).toBe(authorized);
  });

  it('reviews takes: the founder decides, a reviewer may hold, one selection per shot, and rejection is final', async () => {
    const { take } = await capturedTake();
    const at = '2026-10-25T15:00:00Z';
    expect(codeSync(() => decideTake(take, 'APPROVE', REVIEWER, at, 'A1', [take]))).toBe('FORBIDDEN');
    expect(codeSync(() => decideTake(take, 'SELECT_FOR_EDIT', FOUNDER, at, 'A1', [take]))).toBe('ILLEGAL_TRANSITION');
    const held = decideTake(take, 'HOLD', REVIEWER, at, 'A1', [take]);
    const approved = decideTake(held, 'APPROVE', FOUNDER, at, 'A2', [held]);
    const other = { ...approved, id: 'TAKE-OTHER', selectedForEdit: true };
    expect(codeSync(() => decideTake(approved, 'SELECT_FOR_EDIT', FOUNDER, at, 'A3', [approved, other]))).toBe('SELECTION_CONFLICT');
    const selected = decideTake(approved, 'SELECT_FOR_EDIT', FOUNDER, at, 'A3', [approved]);
    expect(codeSync(() => decideTake(selected, 'REJECT', FOUNDER, at, 'A4', [selected]))).toBe('SELECTION_CONFLICT');
    const rejected = decideTake(decideTake(selected, 'DESELECT_FOR_EDIT', FOUNDER, at, 'A4', [selected]), 'REJECT', FOUNDER, at, 'A5', []);
    for (const a of ['APPROVE', 'HOLD', 'REJECT', 'SELECT_FOR_EDIT'] as const) expect(codeSync(() => decideTake(rejected, a, FOUNDER, at, 'A6', [rejected]))).toBe('ILLEGAL_TRANSITION');
  });
});

describe('spend gate (§18)', () => {
  const blockedBy = async (h: Awaited<ReturnType<typeof harness>>, jobId = VIDEO) => {
    const out = await h.runner.dispatch(jobId, FOUNDER);
    return out.outcome === 'BLOCKED' ? [...new Set(out.reasons.map((r) => r.code))] : [out.outcome];
  };

  it('with no founder approval, no budget, open decisions and no references: no provider call', async () => {
    const h = await harness();
    expect(await blockedBy(h)).toEqual(['JOB_NOT_AUTHORIZED', 'NO_FOUNDER_APPROVAL', 'NO_APPLICABLE_BUDGET', 'DECISIONS_OPEN', 'REFERENCES_NOT_APPROVED']);
    expect(h.fake.received).toHaveLength(0);
  });

  it('with an invalid scene state: no provider call, and the founder cannot authorize', async () => {
    const h = await harness({ approve: true, scene: false });
    expect(h.authorizeError).toBe('GATE_BLOCKED');
    expect(await blockedBy(h)).toEqual(['JOB_NOT_AUTHORIZED', 'NO_FOUNDER_APPROVAL', 'INVALID_SCENE_STATE']);
    expect(h.fake.received).toHaveLength(0);
  });

  it('with an unknown quote: refused at authorization and at dispatch', async () => {
    const h = await harness({ approve: true });
    const ref = (await h.store.get('GENERATION_JOB', `JOB-${SH01.shotId}-REF-01`))!;
    await h.store.update({ ...ref, quotedCost: { ...ref.quotedCost, credits: null } }, ref.revision);
    await h.runner.requestAuthorization(ref.id, FOUNDER);
    expect(await code(h.runner.authorizeJob(ref.id, FOUNDER, { maxCredits: 40, ttlSec: 60, decisionRefs: [], note: null }))).toBe('GATE_BLOCKED');
    expect(await blockedBy(h, ref.id)).toContain('UNKNOWN_QUOTE');
  });

  it('with an expired or revoked authorization: no provider call, and the job goes back to waiting', async () => {
    const h = await harness({ approve: true });
    for (let i = 0; i < 700; i++) h.clock();
    expect(await blockedBy(h)).toEqual(['AUTHORIZATION_EXPIRED']);
    expect((await h.store.get('GENERATION_JOB', VIDEO))!.status).toBe('AWAITING_APPROVAL');
    const h2 = await harness({ approve: true });
    await h2.runner.revokeAuthorization(VIDEO, FOUNDER, 'TEST');
    expect(await blockedBy(h2)).toContain('NO_FOUNDER_APPROVAL');
    expect([h.fake.received.length, h2.fake.received.length]).toEqual([0, 0]);
  });

  it('with inputs changed after approval: a new approval is required', async () => {
    const h = await harness({ approve: true });
    const job = (await h.store.get('GENERATION_JOB', VIDEO))!;
    // A change written behind the runner's back (the approval still names the old inputs).
    await h.store.update({ ...job, inputHash: 'f'.repeat(64) }, job.revision);
    expect(await blockedBy(h)).toEqual(['APPROVAL_INVALIDATED_BY_INPUT_CHANGE']);
    expect((await h.store.get('GENERATION_JOB', VIDEO))!.founderApprovalRef).toBeNull();
  });

  it('makes a duplicate dispatch idempotent: one provider request', async () => {
    const h = await harness({ approve: true });
    expect((await h.runner.dispatch(VIDEO, FOUNDER)).outcome).toBe('SUBMITTED');
    expect((await h.runner.dispatch(VIDEO, FOUNDER)).outcome).toBe('DUPLICATE_IDEMPOTENT');
    expect(h.fake.received).toHaveLength(1);
  });

  it('never retries a failed job on its own, and rejects a retry that would pass the budget', async () => {
    const h = await harness({ approve: true, budgetCredits: 175, transport: (f) => new FakeProviderTransport('OpenArt', { bytes: f.video, mimeType: 'video/mp4' }, { failRun: 'TEST: provider failure' }) });
    await h.runner.dispatch(VIDEO, FOUNDER);
    const failed = await h.runner.poll(VIDEO);
    expect([failed.status, failed.attempts.length, h.fake.received.length]).toEqual(['FAILED', 1, 1]);
    expect((await h.runner.dispatch(VIDEO, FOUNDER)).outcome).toBe('BLOCKED');
    await h.runner.requestRetry(VIDEO, FOUNDER, 'TEST');
    expect(await code(h.runner.authorizeJob(VIDEO, FOUNDER, { maxCredits: 175, ttlSec: 600, decisionRefs: [], note: null }))).toBe('GATE_BLOCKED');
    const gi = await h.runner.gateInput((await h.store.get('GENERATION_JOB', VIDEO))!, FOUNDER);
    expect(evaluateGate(gi, { forAuthorization: true }).reasons.map((r) => r.code)).toEqual(['OVER_BUDGET']);
    expect(h.fake.received).toHaveLength(1);
  });

  it('issues tickets only through the gate; a copied, reused, mismatched or hand-made ticket buys nothing', async () => {
    const h = await harness({ approve: true });
    const job = (await h.store.get('GENERATION_JOB', VIDEO))!;
    const issued = issueDispatchTicket(await h.runner.gateInput(job, FOUNDER));
    const ticket = issued.ticket!;
    const req = { projectId: job.projectId, jobId: job.id, inputHash: job.inputHash, idempotencyKey: job.idempotencyKey, routeId: job.routeId };
    const now = '2026-10-25T13:00:30Z';
    expect(codeSync(() => redeemDispatchTicket({ ...ticket } as DispatchTicket, req, now))).toBe('NO_DISPATCH_TICKET');
    expect(codeSync(() => redeemDispatchTicket(ticket, { ...req, inputHash: '0'.repeat(64) }, now))).toBe('TICKET_MISMATCH');
    expect(codeSync(() => redeemDispatchTicket(ticket, { ...req, routeId: 'OA-NBP-I2I-2K-REF' }, now))).toBe('TICKET_MISMATCH');
    expect(codeSync(() => redeemDispatchTicket(ticket, req, '2099-01-01T00:00:00Z'))).toBe('TICKET_EXPIRED');
    expect(codeSync(() => redeemDispatchTicket(ticket, req, now))).toBe('OK');
    expect(codeSync(() => redeemDispatchTicket(ticket, req, now))).toBe('TICKET_ALREADY_USED');
    expect(codeSync(() => redeemDispatchTicket(null, req, now))).toBe('NO_DISPATCH_TICKET');
    expect(h.fake.received).toHaveLength(0);
  });

  it('keeps the real OpenArt route disabled: no flag, or no agent-session executor, means no call', async () => {
    const calls: string[] = [];
    const executor = { submit: async () => (calls.push('submit'), { operationId: 'X' }), poll: async () => ({ state: 'RUNNING' as const }), fetchOutput: async () => ({ bytes: new Uint8Array(), mimeType: 'video/mp4', sourceHost: 'UNKNOWN' as const }) };
    for (const t of [new OpenArtAgentSessionTransport({}), new OpenArtAgentSessionTransport({ SITE00_PROVIDER_EXECUTION: 'ENABLED' }), new OpenArtAgentSessionTransport({}, executor)]) {
      expect(t.status().enabled).toBe(false);
      expect(await code(t.submit({} as never, {} as DispatchTicket, '2026-10-25T00:00:00Z'))).toBe('PROVIDER_EXECUTION_DISABLED');
    }
    expect(process.env.SITE00_PROVIDER_EXECUTION).toBeUndefined();
    const enabled = new OpenArtAgentSessionTransport({ SITE00_PROVIDER_EXECUTION: 'ENABLED' }, executor);
    expect(await code(enabled.submit({ projectId: 'p', jobId: 'j', inputHash: 'h', idempotencyKey: 'k' } as never, {} as DispatchTicket, '2026-10-25T00:00:00Z'))).toBe('NO_DISPATCH_TICKET');
    expect(calls).toEqual([]);
  });

  it('refuses a fake transport on the live catalogue', () => {
    expect(codeSync(() => new ProductionRunner({ store: memoryStore(EXCHANGE_PROJECT_ID, true), media: { ...new MemoryMediaStore(), live: true } as never, transports: { x: new FakeProviderTransport('OpenArt', { bytes: new Uint8Array([1]), mimeType: 'video/mp4' }) }, sceneGate: () => ({ valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), clock: steppingClock() }))).toBe('FAKE_TRANSPORT_IN_LIVE');
  });
});

describe('runner, capture and review (§22)', () => {
  it('captures into private storage, verifies the hash, and puts a take into review without approving it', async () => {
    const { store, media, take, fake } = await capturedTake();
    const job = (await store.get('GENERATION_JOB', VIDEO))!;
    expect(job.transitions.map((t) => t.to)).toEqual(['AWAITING_APPROVAL', 'AUTHORIZED', 'QUEUED', 'RUNNING', 'SUCCEEDED', 'ASSET_CAPTURE_PENDING', 'CAPTURED']);
    expect(job.attempts).toEqual([expect.objectContaining({ attempt: 1, outcome: 'SUCCEEDED', quotedCredits: 175, chargedCredits: 0, operationId: 'FAKE-OP-001' })]);
    expect(take).toMatchObject({ decision: 'READY_FOR_REVIEW', selectedForEdit: false, resolution: '270x480', frameRate: 24, aspectRatio: '9:16', audioPresent: false, runtimeSec: 5, intendedEditSec: 4, continuity: { status: 'NOT_REVIEWED', approvalId: null, findings: [] } });
    expect((await media.verify(take.storageRef, take.contentSha256)).ok).toBe(true);
    const asset = (await store.get('ASSET', take.assetId))!;
    expect(asset.lineage).toEqual({ sourceJobId: VIDEO, sourceTakeId: null, derivedFromAssetId: null, providerOperationId: 'FAKE-OP-001', providerSourceHost: 'fake-provider.test' });
    expect(fake.received[0]!.inputs[0]).toMatchObject({ role: 'START_FRAME', referenceId: 'KF-ENV-CITY-DUSK-A' });
  });

  it('records a capture failure without calling the provider again', async () => {
    const h = await harness({ approve: true });
    await h.runner.dispatch(VIDEO, FOUNDER);
    (h.media as MemoryMediaStore).put = async () => {
      throw new Error('TEST: storage unavailable');
    };
    const job = await h.runner.poll(VIDEO);
    expect([job.status, h.fake.received.length, job.errors.at(-1)?.code]).toEqual(['ASSET_CAPTURE_FAILED', 1, 'ASSET_CAPTURE_FAILED']);
    expect(await h.store.list('TAKE')).toEqual([]);
  });

  it('a rejected take starts nothing: no new job, no new provider request', async () => {
    const { runner, store, take, fake } = await capturedTake();
    await runner.decideTake(take.id, 'REJECT', FOUNDER, { note: 'TEST' });
    expect((await store.list('GENERATION_JOB')).map((j) => j.status)).toEqual(['DRAFT', 'DRAFT', 'CAPTURED']);
    expect(fake.received).toHaveLength(1);
  });

  it('refuses to approve a take whose stored copy no longer matches its hash', async () => {
    const { runner, media, take } = await capturedTake();
    (media as MemoryMediaStore).corruptForTest(take.storageRef);
    expect(await code(runner.decideTake(take.id, 'APPROVE', FOUNDER, { note: null }))).toBe('MEDIA_UNVERIFIED');
  });
});

describe('roles and permissions (§07)', () => {
  it('gives spend, dispatch, reference and take approval to the founder alone', () => {
    for (const r of PROJECT_ROLES.filter((r) => r !== 'FOUNDER')) for (const p of FOUNDER_ONLY) expect(ROLE_PERMISSIONS[r], `${r} ${p}`).not.toContain(p);
    expect(ROLE_PERMISSIONS.AUTHORIZED_EDITOR).toContain('SELECT_FOR_EDIT');
    expect(ROLE_PERMISSIONS.REVIEWER).not.toContain('SELECT_FOR_EDIT');
    expect(ROLE_PERMISSIONS.READ_ONLY).toEqual(['VIEW', 'READ_MEDIA']);
  });

  it('enforces the table in the runner: wrong role, no record change', async () => {
    const { runner, store, take } = await capturedTake();
    for (const a of [REVIEWER, EDITOR, ADMIN, READER]) expect(await code(runner.decideTake(take.id, 'APPROVE', a, { note: null })), a.role).toBe('FORBIDDEN');
    expect(await code(runner.decideTake(take.id, 'HOLD', READER, { note: null }))).toBe('FORBIDDEN');
    expect(await code(runner.reviewContinuity(take.id, 'PASS', READER, null))).toBe('FORBIDDEN');
    expect(await code(runner.authorizeBudget(SH01.budgetId, ADMIN, { authorizedCredits: 1, decisionRefs: [], note: null }))).toBe('FORBIDDEN');
    expect((await store.get('TAKE', take.id))!.revision).toBe(take.revision);
    await runner.decideTake(take.id, 'APPROVE', FOUNDER, { note: 'TEST' });
    expect(await code(runner.decideTake(take.id, 'SELECT_FOR_EDIT', REVIEWER, { note: null }))).toBe('FORBIDDEN');
    expect((await runner.decideTake(take.id, 'SELECT_FOR_EDIT', EDITOR, { note: 'TEST editor selects' })).selectedForEdit).toBe(true);
  });

  it('records each decision with the state before and after and the subject version it was made on', async () => {
    const { runner, store, take } = await capturedTake();
    await runner.decideTake(take.id, 'HOLD', REVIEWER, { note: 'TEST' });
    await runner.reviewContinuity(take.id, 'ISSUES', REVIEWER, 'TEST', ['wet street reads dry in frames 40–60']);
    const history = (await store.list('APPROVAL')).filter((a) => a.subject.id === take.id).sort((x, y) => x.at.localeCompare(y.at));
    expect(history.map((a) => [a.decision, a.previousState, a.newState, a.sourceVersion])).toEqual([
      ['HOLD', 'READY_FOR_REVIEW', 'HELD', `TAKE/${take.id}@r1`],
      ['ISSUES', 'NOT_REVIEWED', 'ISSUES', `TAKE/${take.id}@r2`],
    ]);
    expect((await store.get('TAKE', take.id))!.continuity.findings).toEqual(['wet street reads dry in frames 40–60']);
    expect(await code(runner.reviewContinuity(take.id, 'ISSUES', REVIEWER, null, []))).toBe('FINDINGS_REQUIRED');
  });

  it('decides a take version once: a double click or a race between two reviewers records one decision', async () => {
    const { runner, store, take } = await capturedTake();
    const results = await Promise.all([runner.decideTake(take.id, 'APPROVE', FOUNDER, { note: 'TEST a' }), runner.decideTake(take.id, 'REJECT', FOUNDER, { note: 'TEST b' })].map((p) => p.then((t) => t.decision, (e: Error) => e.message.split(':')[0])));
    expect(results.filter((r) => r === 'CONFLICT')).toHaveLength(1);
    expect(results.filter((r) => r === 'APPROVED' || r === 'REJECTED')).toHaveLength(1);
    expect((await store.list('APPROVAL')).filter((a) => a.subject.id === take.id)).toHaveLength(1);
    expect(await code(runner.decideTake(take.id, 'APPROVE', FOUNDER, { note: null }))).toBe('ILLEGAL_TRANSITION');
    expect(await code(runner.decideTake('TAKE-DOES-NOT-EXIST', 'SELECT_FOR_EDIT', FOUNDER, { note: null }))).toBe('NOT_FOUND');
  });
});

describe('dispatch-time authorization (§14–§15)', () => {
  const reasons = async (h: Awaited<ReturnType<typeof harness>>, who: Actor = FOUNDER) => {
    const out = await h.runner.dispatch(VIDEO, who);
    return out.outcome === 'BLOCKED' ? [...new Set(out.reasons.map((r) => r.code))] : [out.outcome];
  };

  it('dispatches only for the founder: an admin or editor operator is refused, nothing sent', async () => {
    const h = await harness({ approve: true });
    for (const a of [ADMIN, EDITOR, REVIEWER, READER]) expect(await reasons(h, a), a.role).toEqual(['OPERATOR_NOT_AUTHORIZED']);
    expect(h.fake.calls.submit).toBe(0);
  });

  it('refuses a request changed after authorization: new quote, other route', async () => {
    const h = await harness({ approve: true });
    await h.store.update({ ...(await h.store.get('GENERATION_JOB', VIDEO))!, quotedCost: { credits: 170, quotedAt: h.clock(), source: TEST_QUOTE_SOURCE } }, (await h.store.get('GENERATION_JOB', VIDEO))!.revision);
    expect(await reasons(h)).toEqual(['QUOTE_CHANGED']);
    expect((await h.store.get('GENERATION_JOB', VIDEO))!.status).toBe('AWAITING_APPROVAL');
    const h2 = await harness({ approve: true });
    const j = (await h2.store.get('GENERATION_JOB', VIDEO))!;
    await h2.store.update({ ...j, routeId: 'OA-UNKNOWN-ROUTE' }, j.revision);
    expect(await h2.runner.dispatch(VIDEO, FOUNDER)).toMatchObject({ outcome: 'BLOCKED', reasons: [{ code: 'NO_TRANSPORT' }] });
    expect([h.fake.calls.submit, h2.fake.calls.submit]).toEqual([0, 0]);
  });

  it('treats a quote older than 24 hours as planning information: no authorization, no dispatch', async () => {
    const h = await harness({ approve: true });
    const job = (await h.store.get('GENERATION_JOB', VIDEO))!;
    await h.runner.revokeAuthorization(VIDEO, FOUNDER, 'TEST');
    await h.store.update({ ...(await h.store.get('GENERATION_JOB', VIDEO))!, quotedCost: { ...job.quotedCost, quotedAt: '2026-10-24T12:00:00Z' } }, job.revision + 1);
    expect(await code(h.runner.authorizeJob(VIDEO, FOUNDER, { maxCredits: 175, ttlSec: 600, decisionRefs: [], note: null }))).toBe('GATE_BLOCKED');
    const gi = await h.runner.gateInput((await h.store.get('GENERATION_JOB', VIDEO))!, FOUNDER);
    expect(evaluateGate(gi, { forAuthorization: true }).reasons.map((r) => r.code)).toEqual(['QUOTE_STALE']);
  });

  it('scene gate: an unknown quote stays unknown, and a scoped budget step covers only its scope', () => {
    let review = loadSceneReviewState(SH01.releaseId, root);
    const at = '2026-10-25T13:00:00Z';
    review = authorizeStep(authorizeStep(review, 'SCREENPLAY', FOUNDER_ACTOR, at, 'TEST'), 'DIRECTION', FOUNDER_ACTOR, at, 'TEST');
    for (const e of review.elements) if (e.state !== 'APPROVED') review = decideElement(review, e.elementId, 'APPROVED', FOUNDER_ACTOR, at, 'TEST');
    review = authorizeStep(authorizeStep(review, 'KEYFRAMES', FOUNDER_ACTOR, at, 'TEST'), 'GENERATION_BUDGET', FOUNDER_ACTOR, at, 'TEST', ['KF-ENV-CITY-DUSK-A']);
    const gate = sceneGateFrom(review);
    const { shot, jobs } = buildSh01Records(root);
    expect(gate(jobs[0]!, shot)).toEqual({ valid: true, reasons: [] });
    expect(gate({ ...jobs[0]!, quotedCost: { ...jobs[0]!.quotedCost, credits: null } }, shot).reasons).toEqual(['price UNKNOWN: quote before authorizing']);
    expect(gate({ ...jobs[0]!, producesReferenceId: 'KF-ENV-HALCYON-EXT' }, shot).reasons).toEqual(['KF-ENV-HALCYON-EXT is outside the authorized generation budget scope']);
  });

  it('never counts an unknown cost as zero', () => {
    const j = buildSh01Records(root).jobs[2]!;
    const unknown = { ...j, quotedCost: { ...j.quotedCost, credits: null }, attempts: [{ attempt: 1, authorizationId: 'A', ticketId: 'T', operationId: 'X', outcome: 'FAILED' as const, quotedCredits: null, chargedCredits: 'UNKNOWN' as const }] };
    expect(committedCredits(unknown)).toBeNull();
    expect(committedCredits({ ...unknown, attempts: [{ ...unknown.attempts[0]!, quotedCredits: 175 }] })).toBe(175);
    expect(committedCredits({ ...unknown, attempts: [{ ...unknown.attempts[0]!, chargedCredits: 12 }] })).toBe(12);
  });

  it('uses an authorization once: after a failed attempt the same authorization buys nothing', async () => {
    const h = await harness({ approve: true, behaviour: { failSubmit: 'TEST: provider refused' } });
    expect((await h.runner.dispatch(VIDEO, FOUNDER)).outcome).toBe('FAILED');
    const j = (await h.store.get('GENERATION_JOB', VIDEO))!;
    expect([j.attempts[0]!.outcome, j.attempts[0]!.chargedCredits]).toEqual(['FAILED', 'UNKNOWN']);
    // Force the job back to AUTHORIZED behind the runner's back: the gate still refuses the spent authorization.
    await h.store.update({ ...j, status: 'AUTHORIZED', founderApprovalRef: j.transitions.find((t) => t.to === 'AUTHORIZED')!.evidence.approvalId! }, j.revision);
    expect(await reasons(h)).toContain('AUTHORIZATION_ALREADY_USED');
    expect(h.fake.received).toHaveLength(1);
  });
});

describe('duplicate and retry protection (§16–§17)', () => {
  it('double click: two dispatches at once send one request', async () => {
    const h = await harness({ approve: true });
    const outs = await Promise.all([h.runner.dispatch(VIDEO, FOUNDER), h.runner.dispatch(VIDEO, FOUNDER), h.runner.dispatch(VIDEO, FOUNDER)]);
    expect(outs.filter((o) => o.outcome === 'SUBMITTED')).toHaveLength(1);
    expect(h.fake.received).toHaveLength(1);
  });

  it('lost provider response: RECONCILIATION_REQUIRED, looked up by key, never resent', async () => {
    const h = await harness({ approve: true, behaviour: { loseSubmitResponse: true } });
    const out = await h.runner.dispatch(VIDEO, FOUNDER);
    expect([out.outcome, out.job.status, out.job.attempts[0]!.outcome, out.job.attempts[0]!.chargedCredits]).toEqual(['RECONCILIATION_REQUIRED', 'RECONCILIATION_REQUIRED', 'UNCERTAIN', 'UNKNOWN']);
    expect((await h.runner.dispatch(VIDEO, FOUNDER)).outcome).toBe('DUPLICATE_IDEMPOTENT');
    expect(await code(h.runner.reconcile(VIDEO, REVIEWER))).toBe('FORBIDDEN');
    const found = await h.runner.reconcile(VIDEO, ADMIN);
    expect([found.status, found.providerOperationId]).toEqual(['RUNNING', 'FAKE-OP-001']);
    const done = await h.runner.poll(VIDEO);
    expect([done.status, h.fake.received.length, h.fake.calls.submit]).toEqual(['CAPTURED', 1, 1]);
  });

  it('timeout before the provider: the lookup says definitively not found → FAILED, spend counted at the quote', async () => {
    const h = await harness({ approve: true, behaviour: { dropBeforeProvider: true } });
    expect((await h.runner.dispatch(VIDEO, FOUNDER)).outcome).toBe('RECONCILIATION_REQUIRED');
    const failed = await h.runner.reconcile(VIDEO, SYSTEM);
    expect([failed.status, failed.attempts[0]!.outcome, committedCredits(failed)]).toEqual(['FAILED', 'FAILED', 175]);
    expect(h.fake.received).toHaveLength(0);
  });

  it('uncertain status the provider cannot answer: stays for a person to resolve', async () => {
    const h = await harness({ approve: true, behaviour: { loseSubmitResponse: true, noLookup: true } });
    await h.runner.dispatch(VIDEO, FOUNDER);
    expect((await h.runner.reconcile(VIDEO, SYSTEM)).status).toBe('RECONCILIATION_REQUIRED');
    expect(await code(h.runner.resolveReconciliation(VIDEO, EDITOR, { notSubmitted: 'x' }))).toBe('FORBIDDEN');
    expect((await h.runner.resolveReconciliation(VIDEO, ADMIN, { operationId: 'FAKE-OP-001' })).status).toBe('RUNNING');
    expect(h.fake.calls.submit).toBe(1);
  });

  it('worker restart mid-call: the orphaned QUEUED job is reconciled, not resubmitted', async () => {
    const h = await harness({ approve: true });
    const hang = new FakeProviderTransport('OpenArt', { bytes: fx.video, mimeType: 'video/mp4' });
    hang.submit = () => new Promise(() => {}); // the worker dies inside the provider call
    const doomed = new ProductionRunner({ store: h.store, media: h.media, transports: { 'OA-NBP-I2I-2K-REF': hang, 'OA-K3O-I2V-PRO': hang }, sceneGate: () => ({ valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), clock: h.clock });
    void doomed.dispatch(VIDEO, FOUNDER);
    for (let i = 0; i < 50 && (await h.store.get('GENERATION_JOB', VIDEO))!.status !== 'QUEUED'; i++) await new Promise((r) => setTimeout(r, 5));
    expect((await h.store.get('GENERATION_JOB', VIDEO))!.status).toBe('QUEUED');
    const later = steppingClock('2026-10-25T15:00:00Z');
    const restarted = new ProductionRunner({ store: h.store, media: h.media, transports: { 'OA-NBP-I2I-2K-REF': h.fake, 'OA-K3O-I2V-PRO': h.fake }, sceneGate: () => ({ valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), clock: later });
    expect(await restarted.recoverInterrupted()).toEqual([{ jobId: VIDEO, from: 'QUEUED', to: 'RECONCILIATION_REQUIRED' }]);
    expect((await restarted.dispatch(VIDEO, FOUNDER)).outcome).toBe('DUPLICATE_IDEMPOTENT');
    expect(h.fake.calls.submit).toBe(0);
  });

  it('provider accepted but the ledger write failed: reconciliation, never a resend', async () => {
    const h = await harness({ approve: true });
    const realUpdate = h.store.update.bind(h.store);
    let failOnce = true;
    h.store.update = (async (rec: AnyRecord, rev: number) => {
      if (failOnce && rec.kind === 'GENERATION_JOB' && rec.status === 'RUNNING') {
        failOnce = false;
        throw new Error('TEST: database unavailable for one write');
      }
      return realUpdate(rec, rev);
    }) as typeof h.store.update;
    const out = await h.runner.dispatch(VIDEO, FOUNDER);
    expect([out.outcome, out.job.status, out.job.errors.at(-1)?.code]).toEqual(['RECONCILIATION_REQUIRED', 'RECONCILIATION_REQUIRED', 'OPERATION_RECORD_FAILED']);
    expect((await h.runner.reconcile(VIDEO, SYSTEM)).status).toBe('RUNNING');
    expect(h.fake.calls.submit).toBe(1);
  });

  it('double callback and polling race: one result recorded, one take', async () => {
    const h = await harness({ approve: true });
    await h.runner.dispatch(VIDEO, FOUNDER);
    const [a, b] = await Promise.all([h.runner.poll(VIDEO), h.runner.poll(VIDEO)]);
    const final = (await h.store.get('GENERATION_JOB', VIDEO))!;
    expect(final.status).toBe('CAPTURED');
    expect([a.status, b.status].every((s) => ['CAPTURED', 'SUCCEEDED', 'ASSET_CAPTURE_PENDING'].includes(s))).toBe(true);
    expect(await h.store.list('TAKE')).toHaveLength(1);
    expect((await h.runner.poll(VIDEO)).status).toBe('CAPTURED');
    expect(h.fake.received).toHaveLength(1);
  });

  it('capture failure creates no new paid job: recapture reads the stored output, never submits', async () => {
    const h = await harness({ approve: true, behaviour: { failFetches: 1 } });
    await h.runner.dispatch(VIDEO, FOUNDER);
    expect((await h.runner.poll(VIDEO)).status).toBe('ASSET_CAPTURE_FAILED');
    expect(await code(h.runner.recapture(VIDEO, REVIEWER))).toBe('FORBIDDEN');
    expect((await h.runner.recapture(VIDEO, ADMIN)).status).toBe('CAPTURED');
    expect([h.fake.calls.submit, h.fake.received.length, (await h.store.list('GENERATION_JOB')).length, (await h.store.list('TAKE')).length]).toEqual([1, 1, 3, 1]);
  });
});

describe('private media storage (§21)', () => {
  it('stores content-addressed, detects corruption, and signs short, project-scoped reads', async () => {
    const signer = new MediaSigner('t'.repeat(32));
    const m = new MemoryMediaStore(signer);
    const a = await m.put({ projectId: EXCHANGE_PROJECT_ID, bytes: fx.frame, mimeType: 'image/png' });
    expect((await m.put({ projectId: EXCHANGE_PROJECT_ID, bytes: fx.frame, mimeType: 'image/png' })).created).toBe(false);
    expect(a.storageRef).toBe(`spine-media://MEMORY_TEST/test-fixtures/${EXCHANGE_PROJECT_ID}/${a.sha256}.png`);
    const now = '2026-10-25T13:00:00Z';
    const s = await m.signRead(a.storageRef, { projectId: EXCHANGE_PROJECT_ID, ttlSec: 300, now });
    expect(s.url.startsWith('/api/site00/production-spine?')).toBe(true);
    const q = Object.fromEntries(new URL(s.url, 'http://x').searchParams);
    expect(signer.check(q, now)).toBe(a.storageRef);
    expect(codeSync(() => signer.check(q, '2026-10-25T13:06:00Z'))).toBe('SIGNED_READ_EXPIRED');
    expect(codeSync(() => signer.check({ ...q, sig: q.sig!.replace(/^./, (c) => (c === '0' ? '1' : '0')) }, now))).toBe('SIGNED_READ_INVALID');
    expect(codeSync(() => signer.check({ ...q, project: 'jurnl' }, now))).toBe('SIGNED_READ_INVALID');
    expect(await code(m.signRead(a.storageRef, { projectId: 'jurnl', ttlSec: 300, now }))).toBe('CROSS_PROJECT_DENIED');
    expect(await code(m.signRead(a.storageRef, { projectId: EXCHANGE_PROJECT_ID, ttlSec: 3600, now }))).toBe('SIGNED_READ_TTL');
    m.corruptForTest(a.storageRef);
    expect((await m.verify(a.storageRef, a.sha256)).ok).toBe(false);
  });

  it('keeps local masters outside the repository, owner-only', async () => {
    expect(codeSync(() => new LocalPrivateMediaStore(path.join(root, 'media'), { repoRoot: root, live: true, signer: new MediaSigner(null) }))).toBe('MEDIA_ROOT_IN_REPOSITORY');
    const dir = tempDir('site00-spine-media-');
    const m = new LocalPrivateMediaStore(dir, { repoRoot: root, live: false, signer: new MediaSigner(null) });
    const a = await m.put({ projectId: EXCHANGE_PROJECT_ID, bytes: fx.video, mimeType: 'video/mp4' });
    const file = path.join(dir, 'test-fixtures', EXCHANGE_PROJECT_ID, `${a.sha256}.mp4`);
    expect(fs.statSync(file).mode & 0o777).toBe(0o600);
    expect((await m.verify(a.storageRef, a.sha256)).ok).toBe(true);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('uses only a private Supabase bucket (contract test against a stand-in client; live transfer not run)', async () => {
    expect(codeSync(() => new SupabasePrivateMediaStore({} as StorageClient, 'live-preview'))).toBe('PUBLIC_BUCKET_REFUSED');
    const objects = new Map<string, Uint8Array>();
    const client = (isPublic: boolean): StorageClient => ({
      getBucket: async (id) => ({ data: { id, public: isPublic }, error: null }),
      from: () => ({
        upload: async (p, b) => (objects.has(p) ? { data: null, error: { message: 'The resource already exists' } } : (objects.set(p, b), { data: {}, error: null })),
        download: async (p) => (objects.has(p) ? { data: { arrayBuffer: async () => objects.get(p)!.slice().buffer }, error: null } : { data: null, error: { message: 'not found' } }),
        createSignedUrl: async (p, s) => ({ data: { signedUrl: `signed:${p}?e=${s}` }, error: null }),
        remove: async (ps) => (ps.forEach((p) => objects.delete(p)), { data: {}, error: null }),
      }),
    });
    expect(await code(new SupabasePrivateMediaStore(client(true), 'site00-production-masters').put({ projectId: EXCHANGE_PROJECT_ID, bytes: fx.frame, mimeType: 'image/png' }))).toBe('PUBLIC_BUCKET_REFUSED');
    const s = new SupabasePrivateMediaStore(client(false), 'site00-production-masters');
    const a = await s.put({ projectId: EXCHANGE_PROJECT_ID, bytes: fx.frame, mimeType: 'image/png' });
    expect((await s.put({ projectId: EXCHANGE_PROJECT_ID, bytes: fx.frame, mimeType: 'image/png' })).created).toBe(false);
    expect((await s.verify(a.storageRef, a.sha256)).ok).toBe(true);
    expect((await s.signRead(a.storageRef, { projectId: EXCHANGE_PROJECT_ID, ttlSec: 5000, now: '2026-10-25T13:00:00Z' })).url).toMatch(/e=900$/);
    expect((await s.liveTransferCheck('2026-10-25T13:00:00Z')).ok).toBe(true);
    expect(process.env.SITE00_PRODUCTION_MEDIA_BUCKET).toBeUndefined();
  });
});

describe('frame extraction (§26)', () => {
  it('extracts a canonical continuity frame only from an approved take, keeping the source identity', async () => {
    const { runner, store, media, take } = await capturedTake();
    expect(await code(runner.extractFrame(take.id, 48, FOUNDER, { purpose: 'TEST' }))).toBe('TAKE_NOT_APPROVED');
    const inspect = await runner.extractFrame(take.id, 12, REVIEWER, { purpose: 'TEST inspection', inspectionOnly: true });
    expect(inspect.status).toBe('INSPECTION_ONLY');
    await runner.decideTake(take.id, 'APPROVE', FOUNDER, { note: 'TEST' });
    const c = await runner.extractFrame(take.id, 48, FOUNDER, { purpose: 'SH05–SH07 continuity (TEST)' });
    expect(c).toMatchObject({ status: 'CANONICAL', frameIndex: 48, timestampSec: 2, resolution: '270x480', sourceAssetId: take.assetId, sourceSha256: take.contentSha256, takeDecisionAtExtraction: 'APPROVED', shotId: SH01.shotId });
    const frame = (await store.get('ASSET', c.assetId))!;
    expect(frame.lineage).toMatchObject({ sourceTakeId: take.id, derivedFromAssetId: take.assetId });
    expect((await media.verify(frame.storageRef, c.contentSha256)).ok).toBe(true);
    expect((await runner.extractFrame(take.id, 48, FOUNDER, { purpose: 'again' })).id).toBe(c.id);
    expect(await code(runner.extractFrame(take.id, 500, FOUNDER, { purpose: 'TEST' }))).toBe('FRAME_INDEX');
    await runner.decideTake(take.id, 'HOLD', FOUNDER, { note: 'TEST' });
    expect((await store.get('CONTINUITY_REFERENCE', c.id))!.status).toBe('INVALIDATED');
  });

  it('extracts the same frame bytes every time (deterministic local fixture)', async () => {
    const x = new FfmpegFrameExtractor();
    const [a, b] = [await x.extract(fx.video, 30), await x.extract(fx.video, 30)];
    expect(Buffer.from(a.png).equals(Buffer.from(b.png))).toBe(true);
    expect([a.width, a.height]).toEqual([270, 480]);
  });
});

describe('THE EXCHANGE as a managed production project (§27)', () => {
  it('is a founder project with the record spine, DESIGN off, and an established EXPRESSION domain of its own', () => {
    expect(getSite00ManagedProject(EXCHANGE_PROJECT_ID)).toMatchObject({ designEnabled: false, productionSpine: true, ownership: 'FOUNDER', relationship: 'PERSONAL' });
    expect(listDesignEnabledManagedProjects().some((p) => p.projectId === EXCHANGE_PROJECT_ID)).toBe(false);
    const g = assembleProjectGraph({ project_id: EXCHANGE_PROJECT_ID, project_name: 'THE EXCHANGE', project_type: 'SERIALIZED_FICTION' }, [theExchangeGraphPart(EXCHANGE_PROJECT_ID)], []);
    expect([g.domains.EXPRESSION.established, g.domains.DESIGN.established, g.domains.EXPERIENCE.established, g.foreign_dropped]).toEqual([true, false, false, 0]);
    expect(JSON.stringify(g)).not.toMatch(/NDXBOOK|ndxbook|ENTRY 002|entry002/);
  });

  it('keeps Sloane, Gideon and Kai project-local: none is in the global Actor Catalogue, and importing is refused', () => {
    const global = JSON.stringify(getStudioWorldActorCatalogue()).toLowerCase();
    for (const name of ['sloane', 'gideon', 'kai-fontaine', 'kai fontaine']) expect(global).not.toContain(name);
    const adapter = exchangeActorAdapter(root);
    const c = adapter.candidates();
    expect(c.map((x) => x.projectLocalId)).toEqual(expect.arrayContaining(['sloane-lockwood', 'gideon-shaw', 'kai-fontaine']));
    for (const x of c) expect([x.globalActorId, x.importStatus]).toEqual([null, 'NOT_IMPORTED']);
    expect(codeSync(() => adapter.importToGlobal('sloane-lockwood'))).toBe('NOT_AUTHORIZED');
  });

  it('references the season without copying it: 86 releases, 127:40', () => {
    const master = loadSeasonMaster(root);
    expect([master.releases.length, master.releases.reduce((n, r) => n + r.runtimeTargetSec, 0)]).toEqual([86, 7660]);
    const { shot } = buildSh01Records(root);
    expect(shot.source.path).toBe('THE_EXCHANGE/SEASON_1/PRODUCTION_SCENES/S1-01/DIRECTORIAL_PACKET_V1.json');
  });
});

