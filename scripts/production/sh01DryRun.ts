/**
 * S1-01-SH01 zero-spend dry run, version 2 (sprint P0…FIRST-SHOT-READINESS.V1 §27). Twenty steps, each with the
 * evidence it produced.
 *
 * Steps 1–3 read the live planning catalogue (repository JSON, read-only) through the real, disabled OpenArt route.
 * Steps 4–18 run in an isolated test environment: a throwaway PostgreSQL 16 database carrying the production spine
 * migration (the durable store the API uses in supabase mode, reached through the same SupabaseRpcBackend), private
 * test media under a temp directory outside the repository, test-only approvals marked TEST_FIXTURE, the fake
 * provider, and the spine API handler in-process. A second process reads the records back to prove they survive a
 * restart. Steps 19–20 check that nothing reached a provider and nothing was spent; the live records are hashed
 * before and after.
 *
 * Without PostgreSQL server binaries the durable steps run on a temp-directory JSON store and say so in their evidence.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createProductionSpineHandler, type SpineContext } from '../../api/site00/production-spine.js';
import { FOUNDER_ACTOR } from '../../shared/site00-fiction-production/approvals.js';
import { repoPath } from '../../shared/site00-fiction-production/paths.js';
import { evaluateGate } from '../../shared/site00-production-spine/gate.js';
import { sha256Hex } from '../../shared/site00-production-spine/hash.js';
import { MediaSigner } from '../../shared/site00-production-spine/media.js';
import { FfprobeMediaProbe, FfmpegFrameExtractor } from '../../shared/site00-production-spine/node/ffmpeg.js';
import { jsonFileStore } from '../../shared/site00-production-spine/node/jsonStore.js';
import { LocalPrivateMediaStore } from '../../shared/site00-production-spine/node/localMedia.js';
import { SupabaseRpcBackend } from '../../shared/site00-production-spine/node/supabaseStore.js';
import { spineProject } from '../../shared/site00-production-spine/projects/index.js';
import { EXCHANGE_PROJECT_ID, EXCHANGE_RECORDS_DIR, SH01 } from '../../shared/site00-production-spine/projects/theExchange.js';
import { FakeProviderTransport, OpenArtAgentSessionTransport, requestProblems } from '../../shared/site00-production-spine/providers.js';
import { ProductionRunner } from '../../shared/site00-production-spine/runner.js';
import { ScopedRecordStore, serializeRecord, type RecordStore } from '../../shared/site00-production-spine/store.js';
import { STORED_KINDS, TEST_FIXTURE, type Actor } from '../../shared/site00-production-spine/types.js';
import type { TakesWorkspaceView } from '../../shared/site00-production-spine/view.js';
import { buildTakesWorkspace } from '../../shared/site00-production-spine/workspace.js';
import { getSite00ManagedProject } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { pgServerBin, sandboxRpcClient, startPgSandbox, type PgSandbox } from './pgSandbox.js';
import { makeSpineFixtureMedia, seedApprovedSh01, seedSh01Setup, steppingClock, TEST_QUOTE_SOURCE, tempDir, VIDEO_JOB } from './spineFixtures.js';

export type DryRunStep = { n: number; title: string; pass: boolean; evidence: string };
export type DryRunResult = { steps: DryRunStep[]; durableStore: string; providerNetworkCalls: number; realProviderRequests: number; creditsSpent: number; liveRecordsUnchanged: boolean; workDir: string };

const FOUNDER: Actor = { id: FOUNDER_ACTOR, role: 'FOUNDER' };
const TEST: Record<string, Actor> = {
  founder: { id: 'test:founder', role: 'FOUNDER' },
  admin: { id: 'test:production-admin', role: 'PRODUCTION_ADMIN' },
  editor: { id: 'test:authorized-editor', role: 'AUTHORIZED_EDITOR' },
  reviewer: { id: 'test:reviewer', role: 'REVIEWER' },
  reader: { id: 'test:read-only', role: 'READ_ONLY' },
};
const REF_02 = `JOB-${SH01.shotId}-REF-02`;
const REF_01 = `JOB-${SH01.shotId}-REF-01`;
const codeOf = (p: Promise<unknown>) => p.then(() => 'OK', (e: Error) => e.message.split(':')[0]!);

/** Hash of every live record file, to prove the dry run left the catalogue untouched. */
function liveRecordHashes(root: string) {
  const dir = repoPath(EXCHANGE_RECORDS_DIR, root);
  const out: Record<string, string> = {};
  for (const kind of fs.readdirSync(dir)) for (const f of fs.readdirSync(path.join(dir, kind))) out[`${kind}/${f}`] = sha256Hex(fs.readFileSync(path.join(dir, kind, f)));
  return out;
}

type Call = { status: number; json: Record<string, unknown> | null; bytes: Buffer | null; headers: Record<string, string> };

/** Drives a Vercel-style handler in-process. */
export async function callHandler(handler: (req: VercelRequest, res: VercelResponse) => Promise<unknown>, req: { method: string; query?: Record<string, string>; body?: unknown; headers?: Record<string, string> }): Promise<Call> {
  const out: Call = { status: 200, json: null, bytes: null, headers: {} };
  const res = {
    setHeader(k: string, v: string) {
      out.headers[k.toLowerCase()] = String(v);
      return res;
    },
    status(c: number) {
      out.status = c;
      return res;
    },
    json(p: unknown) {
      out.json = JSON.parse(JSON.stringify(p)) as Record<string, unknown>;
      return res;
    },
    end(d?: unknown) {
      if (d !== undefined) out.bytes = Buffer.isBuffer(d) ? d : Buffer.from(String(d));
      return res;
    },
  };
  await handler({ method: req.method, query: req.query ?? {}, body: req.body ?? {}, headers: req.headers ?? {} } as unknown as VercelRequest, res as unknown as VercelResponse);
  return out;
}

export async function runSh01DryRun(root = process.cwd(), workDir = tempDir('site00-sh01-dry-run-')): Promise<DryRunResult> {
  const steps: DryRunStep[] = [];
  const step = (title: string, pass: boolean, evidence: string) => steps.push({ n: steps.length + 1, title, pass, evidence });
  const before = liveRecordHashes(root);

  // Count every network call made while the dry run is in progress.
  const realFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = (async (...a: Parameters<typeof fetch>) => {
    networkCalls += 1;
    return realFetch(...a);
  }) as typeof fetch;

  let sb: PgSandbox | null = null;
  try {
    /* 1–3: the live planning catalogue, read-only, with the real (disabled) OpenArt route */
    const project = spineProject(EXCHANGE_PROJECT_ID)!;
    const managed = getSite00ManagedProject(EXCHANGE_PROJECT_ID);
    const openart = new OpenArtAgentSessionTransport(process.env);
    const refs = project.refs(root, project.providers(() => ({ execution: 'DISABLED', reason: openart.status().reason, transportId: openart.transportId })));
    const live = jsonFileStore(repoPath(EXCHANGE_RECORDS_DIR, root), { projectId: EXCHANGE_PROJECT_ID, live: true, readOnly: 'dry run: the live catalogue is read, never written' });
    const nullMedia = new LocalPrivateMediaStore(path.join(workDir, 'live-media-unused'), { repoRoot: root, live: true, signer: new MediaSigner(null) });
    const liveRunner = new ProductionRunner({ store: live, media: nullMedia, transports: Object.fromEntries(project.routeIds.map((r) => [r, openart])), routeIds: project.routeIds, sceneGate: project.sceneGate(root), probe: new FfprobeMediaProbe(), clock: () => new Date().toISOString() });

    // The isolated durable store.
    const pg = pgServerBin();
    let store: RecordStore;
    let durableStore: string;
    if (pg) {
      sb = startPgSandbox();
      store = new ScopedRecordStore(new SupabaseRpcBackend(sandboxRpcClient(sb), EXCHANGE_PROJECT_ID, 'dry-run sandbox'), { projectId: EXCHANGE_PROJECT_ID, live: false });
      durableStore = `PostgreSQL sandbox with migration 20261026100000 (${sb.description})`;
    } else {
      store = jsonFileStore(path.join(workDir, 'records'), { projectId: EXCHANGE_PROJECT_ID, live: false });
      durableStore = 'temp-directory JSON (no PostgreSQL server in this environment: durable-store evidence BLOCKED)';
    }

    const shot = (await live.get('SHOT', SH01.shotId))!;
    const budget = (await live.get('BUDGET', shot.budgetId))!;
    const jobs = await Promise.all(shot.jobIds.map(async (id) => (await live.get('GENERATION_JOB', id))!));
    step(
      'SH01 loads from production records',
      !!managed?.productionSpine && refs.project.releases === 86 && refs.release.runtimeTargetSec === 45 && shot.setup === 'PRODUCTION_SETUP_READY' && shot.generation === 'GENERATION_AUTHORIZATION_PENDING' && jobs.length === 3,
      `THE EXCHANGE (${refs.project.releases} releases) → ${refs.release.releaseId} (${refs.release.runtimeTargetSec} s) → ${shot.shotId}: ${shot.setup} / ${shot.generation}, ${shot.screenSec} s on screen (${shot.screenFrames} frames at ${shot.fps} fps); budget ${budget.id} ${budget.status} (${budget.plannedCredits} cr planning estimate); jobs ${jobs.map((j) => j.id.replace(`JOB-${SH01.shotId}-`, '')).join(', ')}`,
    );

    const ws: TakesWorkspaceView = await buildTakesWorkspace({ refs, store: live, media: nullMedia, runner: liveRunner, viewer: FOUNDER, now: new Date().toISOString() });
    const sv = ws.shots[0]!;
    const ladder = Object.fromEntries(sv.readiness.map((r) => [r.stage, r]));
    const unmet = (s: string) => ladder[s]!.checks.filter((c) => !c.met).map((c) => c.label);
    step(
      'Missing approvals are visible',
      !ladder.TECHNICALLY_READY!.met && !ladder.CREATIVELY_APPROVED!.met && !ladder.FINANCIALLY_AUTHORIZED!.met && unmet('CREATIVELY_APPROVED').length >= 3 && sv.readiness.length === 6,
      `six separate stages, none implied by another. TECHNICALLY READY no: ${unmet('TECHNICALLY_READY').join('; ')}. CREATIVELY APPROVED no: ${unmet('CREATIVELY_APPROVED').join('; ')}. FINANCIALLY AUTHORIZED no: ${unmet('FINANCIALLY_AUTHORIZED').join('; ')}`,
    );

    const blocked = await liveRunner.dispatch(VIDEO_JOB, FOUNDER);
    const codes = new Set(sv.jobs.flatMap((j) => j.dispatch.reasons.map((r) => r.code)));
    step(
      'Generate is blocked',
      sv.generate.enabled === false && sv.jobs.every((j) => !j.dispatch.enabled) && blocked.outcome === 'BLOCKED' && blocked.reasons[0]?.code === 'PROVIDER_EXECUTION_DISABLED',
      `generate.enabled=false; live dispatch by the founder → ${blocked.outcome} (${blocked.outcome === 'BLOCKED' ? blocked.reasons.map((r) => r.code).join(', ') : ''}); gate reasons shown: ${[...codes].sort().join(', ')}`,
    );

    /* 4–18: the isolated test environment on the durable store */
    const media = makeSpineFixtureMedia(workDir);
    const signer = new MediaSigner(null);
    const testMedia = new LocalPrivateMediaStore(path.join(workDir, 'media'), { repoRoot: root, live: false, signer });
    const fakeVideo = new FakeProviderTransport('OpenArt', { bytes: media.video, mimeType: 'video/mp4' });
    const fakeImage = new FakeProviderTransport('OpenArt', { bytes: media.frame, mimeType: 'image/png' }, { failFetches: 1 }, 'FAKE-IMG-OP');
    const clock = steppingClock('2026-10-25T14:00:00Z');
    const transports = { 'OA-NBP-I2I-2K-REF': fakeImage, 'OA-K3O-I2V-PRO': fakeVideo };
    const runner = new ProductionRunner({ store, media: testMedia, transports, routeIds: project.routeIds, sceneGate: () => ({ valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), extractor: new FfmpegFrameExtractor(), clock });

    // Wrong roles first: none of them can authorize anything, and the database refuses a forged one.
    const wrong: string[] = [];
    await seedSh01Setup(store, root, { answerDecisions: true });
    for (const k of ['admin', 'editor', 'reviewer', 'reader']) wrong.push(`${TEST[k]!.role} → ${await codeOf(runner.authorizeBudget(SH01.budgetId, TEST[k]!, { authorizedCredits: 255, decisionRefs: [], note: 'TEST' }))}`);
    let forged = 'not tried (no database)';
    if (sb) {
      const job = (await store.get('GENERATION_JOB', VIDEO_JOB))!;
      const ev = { kind: 'APPROVAL', id: 'APR-FORGED-ADMIN', projectId: EXCHANGE_PROJECT_ID, schemaVersion: 1, revision: 1, createdAt: clock(), updatedAt: clock(), createdBy: 'test', fixture: TEST_FIXTURE, approvalKind: 'GENERATION_AUTHORIZATION', subject: { kind: 'GENERATION_JOB', id: VIDEO_JOB }, decision: 'AUTHORIZE', actor: 'test', actorRole: 'PRODUCTION_ADMIN', at: clock(), previousState: 'DRAFT', newState: 'AUTHORIZED', sourceVersion: `GENERATION_JOB/${VIDEO_JOB}@r${job.revision}`, note: null, decisionRefs: [], supersedes: null, inputHash: job.inputHash };
      const r = await sandboxRpcClient(sb).rpc('site00_spine_commit', { p_ops: [{ kind: 'APPROVAL', record: ev, expectedRevision: null }] });
      forged = r.error ? `${r.error.code} ${/constraint "([^"]+)"/.exec(r.error.message)?.[1] ?? r.error.message}` : 'ACCEPTED';
    }
    step('Authorization requires the correct role', wrong.every((w) => w.endsWith('FORBIDDEN')) && (!sb || forged.startsWith('23514')), `${wrong.join('; ')}; a non-founder GENERATION_AUTHORIZATION written straight to the database → ${forged}`);

    // Test-only approvals by a test founder: the store is reset to the plain setup and approved end to end.
    if (sb) sb.sqlSync('truncate public.site00_spine_jobs, public.site00_spine_shots, public.site00_spine_budgets cascade');
    else fs.rmSync(path.join(workDir, 'records'), { recursive: true, force: true });
    const authorized = await seedApprovedSh01({ store, runner, media: testMedia, clock, root, frame: media.frame, founder: TEST.founder! });
    const auth = (await store.get('APPROVAL', authorized.founderApprovalRef!))!;
    const gi = await runner.gateInput(authorized, TEST.founder!);
    const changed = evaluateGate({ ...gi, job: { ...authorized, inputHash: 'f'.repeat(64) } }).reasons.map((r) => r.code);
    const otherShot = evaluateGate({ ...gi, shot: { ...gi.shot, shotId: 'S1-01-SH02', budgetId: 'BUDGET-OTHER' } }).reasons.map((r) => r.code);
    step(
      'Authorization is bound to shot and fingerprint',
      auth.inputHash === authorized.inputHash && auth.budgetId === shot.budgetId && auth.routeId === authorized.routeId && auth.scope === 'ONE_JOB_ONE_ATTEMPT' && changed.includes('APPROVAL_INVALIDATED_BY_INPUT_CHANGE') && otherShot.includes('PROJECT_MISMATCH'),
      `${auth.id}: ${auth.subject.kind}/${auth.subject.id}, input fingerprint ${auth.inputHash!.slice(0, 16)}…, route ${auth.routeId}, quote ${auth.quotedCredits} cr, ceiling ${auth.maxCredits} cr, scope ${auth.scope}, expires ${auth.expiresAt}; same authorization against a changed request → ${changed.join(', ')}; against another shot → ${[...new Set(otherShot)].join(', ')}`,
    );

    const ref1 = (await store.get('GENERATION_JOB', REF_01))!;
    await store.update({ ...ref1, quotedCost: { ...ref1.quotedCost, credits: null } }, ref1.revision);
    await runner.requestAuthorization(REF_01, TEST.founder!);
    const unquoted = await codeOf(runner.authorizeJob(REF_01, TEST.founder!, { maxCredits: 40, ttlSec: 600, decisionRefs: [], note: 'TEST' }));
    const unquotedDispatch = await runner.dispatch(REF_01, TEST.founder!);
    // The records' planning quote, judged at the moment this run executes.
    const staleGate = evaluateGate({ ...gi, job: { ...authorized, quotedCost: jobs[2]!.quotedCost }, now: new Date().toISOString() }).reasons.map((r) => r.code);
    step(
      'Unquoted spend is blocked',
      unquoted === 'GATE_BLOCKED' && unquotedDispatch.outcome === 'BLOCKED' && unquotedDispatch.reasons.some((r) => r.code === 'UNKNOWN_QUOTE') && staleGate.includes('QUOTE_STALE') && fakeImage.calls.submit === 0,
      `${REF_01} with no quote: authorization → ${unquoted}; dispatch → ${unquotedDispatch.outcome} (${unquotedDispatch.outcome === 'BLOCKED' ? [...new Set(unquotedDispatch.reasons.map((r) => r.code))].join(', ') : ''}); the records' planning quote (${jobs[2]!.quotedCost.credits} cr, ${jobs[2]!.quotedCost.quotedAt}) judged now → ${staleGate.filter((c) => c.startsWith('QUOTE')).join(', ')}; provider calls 0`,
    );

    const sent = await runner.dispatch(VIDEO_JOB, TEST.founder!);
    const req = fakeVideo.received[0];
    const polled = await runner.poll(VIDEO_JOB);
    step(
      'The fake transport completes the authorized test transaction',
      sent.outcome === 'SUBMITTED' && !!req && requestProblems(req).length === 0 && req.inputs[0]?.role === 'START_FRAME' && polled.status === 'CAPTURED' && fakeVideo.received.length === 1,
      `${sent.outcome} → ${polled.status}; ${req?.model} ${req?.mode} ${JSON.stringify(req?.settings)}; start frame ${req?.inputs[0]?.sha256.slice(0, 12)}…; operation ${polled.providerOperationId}; transitions ${polled.transitions.map((t) => t.to).join(' → ')}`,
    );

    const asset = (await store.get('ASSET', polled.outputAssetIds[0]!))!;
    const file = path.join(workDir, 'media', 'test-fixtures', EXCHANGE_PROJECT_ID, `${asset.contentSha256}.mp4`);
    const mode = fs.existsSync(file) ? fs.statSync(file).mode & 0o777 : -1;
    const recordsText = (await Promise.all(STORED_KINDS.map((k) => store.list(k)))).flat().map((r) => JSON.stringify(r)).join('\n');
    step(
      'Output is stored privately',
      asset.adapter === 'LOCAL_PRIVATE' && mode === 0o600 && !path.resolve(file).startsWith(path.resolve(root)) && !/https?:\/\//.test(recordsText),
      `${asset.id} → ${asset.storageRef}; file mode ${mode.toString(8)} outside the repository; no URL stored in any record (production uses the private Supabase bucket site00-production-masters)`,
    );

    const v = await testMedia.verify(asset.storageRef, sha256Hex(media.video));
    step('The hash is verified', v.ok && asset.contentSha256 === sha256Hex(media.video), `stored copy sha256 ${v.actual?.slice(0, 16)}… equals the provider output; provenance: the database accepts the asset only because its storage reference is content-addressed by that hash in this project`);

    const take = (await store.list('TAKE'))[0]!;
    const row = sb ? sb.sqlSync(`select decision || '|' || fixture || '|' || content_sha256 from site00_spine_takes where project_key = 'the-exchange' and id = '${take.id}'`) : 'n/a';
    step(
      'The take persists',
      take.decision === 'READY_FOR_REVIEW' && take.fixture === TEST_FIXTURE && take.intendedEditSec === shot.screenSec && (!sb || row === `READY_FOR_REVIEW|true|${take.contentSha256}`),
      `${take.id}: ${take.decision}; probed ${take.resolution}, ${take.frameRate} fps, ${take.runtimeSec} s, audio ${take.audioPresent}; intended edit ${take.intendedEditSec} s; database row ${row}`,
    );

    let restart = 'BLOCKED: no database';
    let restartOk = false;
    if (sb) {
      const out = execFileSync('npx', ['tsx', path.join(root, 'scripts/production/spineRestartProbe.ts'), sb.dir, String(sb.port), EXCHANGE_PROJECT_ID], { encoding: 'utf8' }).trim().split('\n').at(-1)!;
      const probe = JSON.parse(out) as { pid: number; records: Record<string, string> };
      restartOk = probe.pid !== process.pid && probe.records[`TAKE/${take.id}`] === sha256Hex(serializeRecord(take));
      restart = `process ${probe.pid} (this run is ${process.pid}) opened the store from nothing and read ${Object.keys(probe.records).length} records; ${take.id} identical`;
    }
    step('The take is retrievable after a process restart', restartOk, restart);

    const open = async (): Promise<SpineContext> => ({ store, media: testMedia, runner, refs });
    const handlerAt = (now: () => string) =>
      createProductionSpineHandler({
        authenticate: async (r) => {
          const a = TEST[String(r.headers['x-test-actor'])];
          return a ? { ok: true, actor: a } : { ok: false, status: 403, error: 'not a member of the-exchange', code: 'NOT_A_PROJECT_MEMBER' };
        },
        open: async (id) => (id === EXCHANGE_PROJECT_ID ? open() : null),
        signer,
        now,
      });
    const handler = handlerAt(clock);
    const post = (who: string, body: Record<string, unknown>) => callHandler(handler, { method: 'POST', body: { project: EXCHANGE_PROJECT_ID, ...body }, headers: { 'x-test-actor': who } });

    const hold = await post('reviewer', { action: 'take-decision', takeId: take.id, decision: 'HOLD', note: 'TEST: reviewer holds for the founder' });
    const continuity = await post('reviewer', { action: 'continuity-review', takeId: take.id, status: 'PASS', note: 'TEST', findings: [] });
    const approve = await post('founder', { action: 'take-decision', takeId: take.id, decision: 'APPROVE', note: 'TEST: founder approves' });
    step(
      'A reviewer can approve',
      hold.status === 200 && continuity.status === 200 && approve.status === 200 && (approve.json?.take as { decision: string }).decision === 'APPROVED',
      `take approval authority is the founder's (FOUNDER role); REVIEWER members review: reviewer HOLD → ${hold.status}, reviewer continuity PASS → ${continuity.status}, founder APPROVE → ${approve.status} (APPROVED)`,
    );

    const take2 = (await store.get('TAKE', take.id))!;
    const reviewerApprove = await post('reviewer', { action: 'take-decision', takeId: take.id, decision: 'REJECT' });
    const readerHold = await post('reader', { action: 'take-decision', takeId: take.id, decision: 'HOLD' });
    const outsider = await post('stranger', { action: 'take-decision', takeId: take.id, decision: 'HOLD' });
    const reviewerSelect = await post('reviewer', { action: 'take-decision', takeId: take.id, decision: 'SELECT_FOR_EDIT' });
    let dbReviewerApprove = 'not tried (no database)';
    if (sb) {
      const ev = { kind: 'APPROVAL', id: 'APR-FORGED-REVIEWER', projectId: EXCHANGE_PROJECT_ID, schemaVersion: 1, revision: 1, createdAt: clock(), updatedAt: clock(), createdBy: 'test', fixture: TEST_FIXTURE, approvalKind: 'TAKE_DECISION', subject: { kind: 'TAKE', id: take.id }, decision: 'REJECT', actor: 'test', actorRole: 'REVIEWER', at: clock(), previousState: 'APPROVED', newState: 'REJECTED', sourceVersion: `TAKE/${take.id}@r${take2.revision}`, note: null, decisionRefs: [], supersedes: null };
      const r = await sandboxRpcClient(sb).rpc('site00_spine_commit', { p_ops: [{ kind: 'APPROVAL', record: ev, expectedRevision: null }] });
      dbReviewerApprove = r.error ? `${r.error.code} ${/constraint "([^"]+)"/.exec(r.error.message)?.[1] ?? r.error.message}` : 'ACCEPTED';
    }
    const unchanged = (await store.get('TAKE', take.id))!.revision === take2.revision;
    step(
      'Unauthorized review is denied',
      reviewerApprove.status === 403 && readerHold.status === 403 && outsider.status === 403 && reviewerSelect.status === 403 && unchanged && (!sb || dbReviewerApprove.startsWith('23514')),
      `reviewer REJECT → ${reviewerApprove.status}; read-only HOLD → ${readerHold.status}; non-member → ${outsider.status} ${outsider.json?.code}; reviewer SELECT_FOR_EDIT → ${reviewerSelect.status}; take unchanged at r${take2.revision}; a reviewer's decision written straight to the database → ${dbReviewerApprove}`,
    );

    const select = await post('editor', { action: 'take-decision', takeId: take.id, decision: 'SELECT_FOR_EDIT', note: 'TEST: editor selects for the cut' });
    const selected = (await store.get('TAKE', take.id))!;
    const view = sb ? sb.sqlSync(`select shot_id || '|' || take_id from site00_spine_edit_selections where project_key = 'the-exchange'`) : 'n/a';
    const selEvent = (await store.list('APPROVAL')).find((a) => a.subject.id === take.id && a.decision === 'SELECT_FOR_EDIT');
    step(
      'SELECT FOR EDIT records the selection',
      select.status === 200 && selected.selectedForEdit && selEvent?.actorRole === 'AUTHORIZED_EDITOR' && selEvent.previousState === 'APPROVED' && selEvent.newState === 'SELECTED_FOR_EDIT' && (!sb || view === `${SH01.shotId}|${take.id}`),
      `editor SELECT_FOR_EDIT → ${select.status}; ${selected.id} selectedForEdit=${selected.selectedForEdit} r${selected.revision}; event ${selEvent?.id} ${selEvent?.previousState} → ${selEvent?.newState} on ${selEvent?.sourceVersion}; edit-selection view: ${view}`,
    );

    const again = await runner.dispatch(VIDEO_JOB, TEST.founder!);
    const secondServer = new ProductionRunner({ store, media: testMedia, transports, routeIds: project.routeIds, sceneGate: () => ({ valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), clock });
    const again2 = await secondServer.dispatch(VIDEO_JOB, TEST.founder!);
    const apiAgain = await post('founder', { action: 'dispatch', jobId: VIDEO_JOB });
    const ops = sb ? sb.sqlSync(`select count(*) from site00_spine_provider_operations where job_id = '${VIDEO_JOB}'`) : String((await store.get('GENERATION_JOB', VIDEO_JOB))!.attempts.length);
    step(
      'Duplicate execution is prevented',
      again.outcome === 'DUPLICATE_IDEMPOTENT' && again2.outcome === 'DUPLICATE_IDEMPOTENT' && apiAgain.status === 200 && fakeVideo.received.length === 1 && ops === '1',
      `dispatch again → ${again.outcome}; from a second server → ${again2.outcome}; through the API → ${apiAgain.status} ${apiAgain.json?.outcome}; provider requests ${fakeVideo.received.length}; provider-operation rows ${ops} (the database allows one in-flight attempt per job and one row per ticket)`,
    );

    await runner.recordQuote(REF_02, TEST.founder!, { credits: 40, quotedAt: clock(), source: TEST_QUOTE_SOURCE });
    await runner.requestAuthorization(REF_02, TEST.founder!);
    await runner.authorizeJob(REF_02, TEST.founder!, { maxCredits: 40, ttlSec: 600, decisionRefs: ['FD-S101-11'], note: 'TEST' });
    const jobsBefore = (await store.list('GENERATION_JOB')).length;
    await runner.dispatch(REF_02, TEST.founder!);
    const failed = await runner.poll(REF_02);
    const recaptured = await runner.recapture(REF_02, TEST.admin!);
    step(
      'Capture failure creates no new paid job',
      failed.status === 'ASSET_CAPTURE_FAILED' && recaptured.status === 'CAPTURED' && fakeImage.calls.submit === 1 && fakeImage.received.length === 1 && (await store.list('GENERATION_JOB')).length === jobsBefore && recaptured.attempts.length === 1,
      `${REF_02}: capture → ${failed.status} (${failed.errors.at(-1)?.message}); production admin recapture → ${recaptured.status}; provider submissions ${fakeImage.calls.submit}, output reads ${fakeImage.calls.fetchOutput}; jobs ${jobsBefore} before and after`,
    );

    const foreignApi = await callHandler(handler, { method: 'GET', query: { action: 'workspace', project: 'ndxbook' }, headers: { 'x-test-actor': 'founder' } });
    const wsCall = await callHandler(handler, { method: 'GET', query: { action: 'workspace', project: EXCHANGE_PROJECT_ID }, headers: { 'x-test-actor': 'reader' } });
    const preview = (wsCall.json?.workspace as TakesWorkspaceView).shots[0]!.takes[0]!.preview!;
    const q = Object.fromEntries(new URL(preview.url, 'http://local').searchParams);
    const crossLink = await callHandler(handler, { method: 'GET', query: { ...q, project: 'ndxbook' } });
    let crossStore = 'n/a';
    if (sb) {
      const ndx = new ScopedRecordStore(new SupabaseRpcBackend(sandboxRpcClient(sb), 'ndxbook', 'dry-run sandbox'), { projectId: 'ndxbook', live: false });
      crossStore = `ndxbook-scoped store sees ${(await ndx.list('TAKE')).length} takes; writing an Exchange record through it → ${await codeOf(ndx.create(take))}`;
      sb.sqlSync(`insert into auth.users (id, email) values ('00000000-0000-4000-8000-0000000000aa', 'other@test.invalid') on conflict do nothing; insert into site00_spine_members (project_key, user_id, role, granted_by) values ('ndxbook', '00000000-0000-4000-8000-0000000000aa', 'REVIEWER', 'test') on conflict do nothing;`);
      crossStore += `; a signed-in ndxbook reviewer sees ${await sb.sql(`select count(*) from site00_spine_takes`, { role: 'authenticated', userId: '00000000-0000-4000-8000-0000000000aa' })} Exchange takes (RLS)`;
    }
    step(
      'Cross-project access is denied',
      foreignApi.status === 404 && crossLink.status === 403 && (!sb || /sees 0 takes.*CROSS_PROJECT_DENIED.*sees 0 Exchange takes/.test(crossStore)),
      `workspace for ndxbook through the Exchange spine → ${foreignApi.status} ${foreignApi.json?.code}; an Exchange media link presented as ndxbook → ${crossLink.status} ${crossLink.json?.code}; ${crossStore}`,
    );

    const read = await callHandler(handler, { method: 'GET', query: q });
    const late = new Date(Date.parse(preview.expiresAt) + 1000).toISOString();
    const expired = await callHandler(handlerAt(() => late), { method: 'GET', query: q });
    const tampered = await callHandler(handler, { method: 'GET', query: { ...q, exp: String(Number(q.exp) + 600) } });
    step(
      'Signed URL expiry works',
      read.status === 200 && !!read.bytes && sha256Hex(read.bytes) === take.contentSha256 && expired.status === 403 && expired.json?.code === 'SIGNED_READ_EXPIRED' && tampered.status === 403,
      `signed read (expires ${preview.expiresAt}) → ${read.status}, ${read.bytes?.byteLength} bytes, hash matches; the same link one second after expiry → ${expired.status} ${expired.json?.code}; extended expiry → ${tampered.status} ${tampered.json?.code}`,
    );

    step('No real request occurs', networkCalls === 0 && !openart.status().enabled && fakeVideo.received.length + fakeImage.received.length === 2, `network calls during the run: ${networkCalls}; OpenArt route: ${openart.status().reason}; the only requests went to the in-process fake (${fakeVideo.received.length} video, ${fakeImage.received.length} image)`);

    const after = liveRecordHashes(root);
    const liveUnchanged = JSON.stringify(before) === JSON.stringify(after);
    step('No credits are spent', liveUnchanged && budget.authorizedCredits === 0 && jobs.every((j) => j.attempts.length === 0) && polled.actualSpend.credits === 0, `live records unchanged (${Object.keys(after).length} files, same hashes); live budget authorized 0 cr; live jobs never attempted; the fake reported 0 cr`);

    return { steps, durableStore, providerNetworkCalls: networkCalls, realProviderRequests: 0, creditsSpent: 0, liveRecordsUnchanged: liveUnchanged, workDir };
  } finally {
    globalThis.fetch = realFetch;
    sb?.stop();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const r = await runSh01DryRun();
  console.log(`durable store: ${r.durableStore}\n`);
  for (const s of r.steps) console.log(`${String(s.n).padStart(2)} ${s.pass ? 'PASS' : 'FAIL'}  ${s.title}\n     ${s.evidence}`);
  console.log(`\nprovider network calls ${r.providerNetworkCalls}; real provider requests ${r.realProviderRequests}; credits spent ${r.creditsSpent}; live records unchanged ${r.liveRecordsUnchanged}`);
  if (process.argv.includes('--json')) fs.writeFileSync(process.argv[process.argv.indexOf('--json') + 1]!, `${JSON.stringify({ ...r, workDir: undefined }, null, 2)}\n`);
  fs.rmSync(r.workDir, { recursive: true, force: true });
  if (r.steps.some((s) => !s.pass)) process.exit(1);
}
