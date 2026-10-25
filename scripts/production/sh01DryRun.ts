/**
 * S1-01-SH01 zero-spend dry run (sprint §28). Twenty steps, each with the evidence it produced.
 *
 * Steps 1–7 read the live catalogue (repository JSON, opened read-only) with the real, disabled OpenArt route.
 * Steps 8–18 run in an isolated test environment under a temp directory: test-only approvals, the fake provider,
 * the local private media adapter, and the spine API handler in-process. Steps 19–20 check that nothing reached a
 * provider and nothing was spent. The live records are hashed before and after.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'node:fs';
import path from 'node:path';
import { createProductionSpineHandler, type SpineContext } from '../../api/site00/production-spine.js';
import { FOUNDER_ACTOR } from '../../shared/site00-fiction-production/approvals.js';
import { authorizeStep, decideElement, type SceneReviewState } from '../../shared/site00-fiction-production/directorial/review.js';
import { repoPath } from '../../shared/site00-fiction-production/paths.js';
import { loadSceneReviewState } from '../../shared/site00-fiction-production/scenes/index.js';
import { sha256Hex } from '../../shared/site00-production-spine/hash.js';
import { MediaSigner } from '../../shared/site00-production-spine/media.js';
import { FfprobeMediaProbe, FfmpegFrameExtractor } from '../../shared/site00-production-spine/node/ffmpeg.js';
import { jsonFileStore } from '../../shared/site00-production-spine/node/jsonStore.js';
import { LocalPrivateMediaStore } from '../../shared/site00-production-spine/node/localMedia.js';
import { spineProject } from '../../shared/site00-production-spine/projects/index.js';
import { EXCHANGE_PROJECT_ID, EXCHANGE_RECORDS_DIR, SH01, sceneGateFrom } from '../../shared/site00-production-spine/projects/theExchange.js';
import { FakeProviderTransport, OpenArtAgentSessionTransport, requestProblems } from '../../shared/site00-production-spine/providers.js';
import { ProductionRunner } from '../../shared/site00-production-spine/runner.js';
import { STORED_KINDS, TEST_FIXTURE, type Actor, type AnyRecord } from '../../shared/site00-production-spine/types.js';
import { buildTakesWorkspace } from '../../shared/site00-production-spine/workspace.js';
import type { TakesWorkspaceView } from '../../shared/site00-production-spine/view.js';
import { getSite00ManagedProject } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { makeSpineFixtureMedia, steppingClock, tempDir } from './spineFixtures.js';

export type DryRunStep = { n: number; title: string; pass: boolean; evidence: string };
export type DryRunResult = { steps: DryRunStep[]; providerNetworkCalls: number; realProviderRequests: number; creditsSpent: number; liveRecordsUnchanged: boolean; workDir: string };

const FOUNDER: Actor = { id: FOUNDER_ACTOR, role: 'FOUNDER' };
const TEST_FOUNDER: Actor = { id: 'test:founder', role: 'FOUNDER' };
const TEST_REVIEWER: Actor = { id: 'test:reviewer', role: 'REVIEWER' };

/** Hash of every live record file, to prove the dry run left the catalogue untouched. */
function liveRecordHashes(root: string) {
  const dir = repoPath(EXCHANGE_RECORDS_DIR, root);
  const out: Record<string, string> = {};
  for (const kind of fs.readdirSync(dir)) for (const f of fs.readdirSync(path.join(dir, kind))) out[`${kind}/${f}`] = sha256Hex(fs.readFileSync(path.join(dir, kind, f)));
  return out;
}

/** A test copy of the scene review state with every element approved and every step authorized for SH01 only. */
function testReviewState(root: string): SceneReviewState {
  let s = loadSceneReviewState(SH01.releaseId, root);
  const at = '2026-10-25T13:00:00Z';
  s = authorizeStep(s, 'SCREENPLAY', FOUNDER_ACTOR, at, 'TEST FIXTURE');
  s = authorizeStep(s, 'DIRECTION', FOUNDER_ACTOR, at, 'TEST FIXTURE');
  for (const e of s.elements) if (e.state !== 'APPROVED') s = decideElement(s, e.elementId, 'APPROVED', FOUNDER_ACTOR, at, 'TEST FIXTURE');
  s = authorizeStep(s, 'KEYFRAMES', FOUNDER_ACTOR, at, 'TEST FIXTURE');
  s = authorizeStep(s, 'GENERATION_BUDGET', FOUNDER_ACTOR, at, 'TEST FIXTURE');
  return authorizeStep(s, 'PRODUCTION', FOUNDER_ACTOR, at, 'TEST FIXTURE', [SH01.shotId]);
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

  try {
    /* 1–7: the live catalogue, read-only, with the real (disabled) OpenArt route */
    const project = spineProject(EXCHANGE_PROJECT_ID)!;
    const managed = getSite00ManagedProject(EXCHANGE_PROJECT_ID);
    const openart = new OpenArtAgentSessionTransport(process.env);
    const providers = project.providers(() => ({ execution: 'DISABLED', reason: openart.status().reason, transportId: openart.transportId }));
    const refs = project.refs(root, providers);
    step('Founder opens THE EXCHANGE project', !!managed?.productionSpine && managed.designEnabled === false && refs.project.releases === 86 && refs.project.runtimeSec === 7660, `managed project ${managed?.projectId} (productionSpine, DESIGN off); ${refs.project.releases} releases, ${Math.floor(refs.project.runtimeSec / 60)}:${String(refs.project.runtimeSec % 60).padStart(2, '0')}; cast ${refs.project.castAuthority}, global catalogue ${refs.project.globalActorCatalogue}`);
    step('Founder selects S1-01', refs.release.releaseId === 'S1-01' && refs.release.runtimeTargetSec === 45, `${refs.release.releaseId} "${refs.release.title}", ${refs.release.runtimeTargetSec} s; packet ${refs.scene.packetStatus}; screenplay ${refs.scene.screenplayStatus}`);

    const live = jsonFileStore(repoPath(EXCHANGE_RECORDS_DIR, root), { projectId: EXCHANGE_PROJECT_ID, live: true, readOnly: 'dry run: the live catalogue is read, never written' });
    const liveMedia = new LocalPrivateMediaStore(path.join(workDir, 'live-media-unused'), { repoRoot: root, live: true, signer: new MediaSigner(null) });
    const liveRunner = new ProductionRunner({ store: live, media: liveMedia, transports: Object.fromEntries(project.routeIds.map((r) => [r, openart])), sceneGate: project.sceneGate(root), probe: new FfprobeMediaProbe(), clock: steppingClock() });
    const shot = (await live.get('SHOT', SH01.shotId))!;
    step('Founder selects SH01', shot.setup === 'PRODUCTION_SETUP_READY' && shot.generation === 'GENERATION_AUTHORIZATION_PENDING', `${shot.shotId}: ${shot.setup} / ${shot.generation}; ${shot.screenSec} s on screen (${shot.screenFrames} frames at ${shot.fps} fps), ${shot.generationSec} s generated`);

    const budget = (await live.get('BUDGET', shot.budgetId))!;
    const jobs = await Promise.all(shot.jobIds.map(async (id) => (await live.get('GENERATION_JOB', id))!));
    step('System loads current planning requirements', shot.requiredDecisions.length === 3 && jobs.length === 3 && budget.plannedCredits === 255 && budget.status === 'PLANNING_ESTIMATE_ONLY', `decisions ${shot.requiredDecisions.map((d) => d.decisionId).join(', ')}; reference ${shot.references.map((r) => `${r.referenceId} ${r.status}`).join(', ')}; jobs ${jobs.map((j) => `${j.id.replace(`JOB-${SH01.shotId}-`, '')} ${j.quotedCost.credits} cr`).join(', ')}; budget ${budget.plannedCredits} cr ${budget.status}`);

    const ws: TakesWorkspaceView = await buildTakesWorkspace({ refs, store: live, media: liveMedia, runner: liveRunner, viewer: FOUNDER, now: '2026-10-25T13:00:00Z' });
    const sv = ws.shots[0]!;
    const codes = new Set(sv.jobs.flatMap((j) => j.dispatch.reasons.map((r) => r.code)));
    const missing = sv.requiredDecisions.filter((d) => d.status === 'OPEN').map((d) => d.decisionId);
    step('System identifies missing approvals', missing.length === 3 && ['DECISIONS_OPEN', 'NO_APPLICABLE_BUDGET', 'INVALID_SCENE_STATE', 'NO_FOUNDER_APPROVAL', 'REFERENCES_NOT_APPROVED', 'PROVIDER_EXECUTION_DISABLED'].every((c) => codes.has(c)), `open: ${missing.join(', ')}; gate reasons: ${[...codes].sort().join(', ')}`);
    step('Generate is disabled', sv.generate.enabled === false && sv.jobs.every((j) => !j.dispatch.enabled), `generate.enabled=false; first reason: ${sv.generate.reasons[0]?.code}: ${sv.generate.reasons[0]?.detail}`);

    const videoId = `JOB-${SH01.shotId}-VIDEO-01`;
    const blocked = await liveRunner.dispatch(videoId);
    let liveFakeRefusal = 'not refused';
    try {
      new ProductionRunner({ store: live, media: liveMedia, transports: { 'OA-K3O-I2V-PRO': new FakeProviderTransport('OpenArt', { bytes: new Uint8Array([0]), mimeType: 'video/mp4' }) }, sceneGate: project.sceneGate(root), probe: new FfprobeMediaProbe(), clock: steppingClock() });
    } catch (e) {
      liveFakeRefusal = (e as Error).message.split(':')[0]!;
    }

    // The isolated test environment: copies of the live setup records, marked as test data, with no approvals yet.
    const media = makeSpineFixtureMedia(workDir);
    const signer = new MediaSigner(null);
    const store = jsonFileStore(path.join(workDir, 'records'), { projectId: EXCHANGE_PROJECT_ID, live: false });
    const testMedia = new LocalPrivateMediaStore(path.join(workDir, 'media'), { repoRoot: root, live: false, signer });
    const fake = new FakeProviderTransport('OpenArt', { bytes: media.video, mimeType: 'video/mp4' });
    const clock = steppingClock('2026-10-25T14:00:00Z');
    const mark = <T extends AnyRecord>(r: T): T => ({ ...r, fixture: TEST_FIXTURE });
    await store.create(mark(budget));
    await store.create(mark(shot));
    for (const j of jobs) await store.create(mark(j));
    const unapproved = new ProductionRunner({ store, media: testMedia, transports: { 'OA-K3O-I2V-PRO': fake }, sceneGate: project.sceneGate(root), probe: new FfprobeMediaProbe(), clock });
    const refused = await unapproved.dispatch(videoId);
    const forged = await fake
      .submit({ projectId: EXCHANGE_PROJECT_ID, jobId: videoId, inputHash: jobs[2]!.inputHash, idempotencyKey: jobs[2]!.idempotencyKey, routeId: 'OA-K3O-I2V-PRO', provider: 'OpenArt', model: 'kling-3-omni', mode: 'image2video', settings: jobs[2]!.settings, prompt: 'x', inputs: [] }, Object.freeze({ ticketId: 'TKT-FORGED', projectId: EXCHANGE_PROJECT_ID, jobId: videoId, inputHash: jobs[2]!.inputHash, idempotencyKey: jobs[2]!.idempotencyKey, authorizationId: 'none', quotedCredits: 175, maxCredits: 175, issuedAt: clock(), expiresAt: '2099-01-01T00:00:00Z' }), clock())
      .then(() => 'accepted', (e: Error) => e.message.split(':')[0]!);
    step('Unauthorized provider dispatch is rejected', blocked.outcome === 'BLOCKED' && blocked.reasons[0]?.code === 'PROVIDER_EXECUTION_DISABLED' && liveFakeRefusal === 'FAKE_TRANSPORT_IN_LIVE' && refused.outcome === 'BLOCKED' && forged === 'NO_DISPATCH_TICKET' && fake.received.length === 0, `live: ${blocked.outcome} (${blocked.outcome === 'BLOCKED' ? blocked.reasons.map((r) => r.code).join(', ') : ''}); fake transport on the live catalogue → ${liveFakeRefusal}; test copy without approvals: ${refused.outcome} (${refused.outcome === 'BLOCKED' ? [...new Set(refused.reasons.map((r) => r.code))].join(', ') : ''}); forged ticket → ${forged}; fake provider received ${fake.received.length} requests`);

    /* 8–18: test-only approvals, then the full path through the fake provider */
    const runner = new ProductionRunner({ store, media: testMedia, transports: { 'OA-NBP-I2I-2K-REF': fake, 'OA-K3O-I2V-PRO': fake }, sceneGate: sceneGateFrom(testReviewState(root)), probe: new FfprobeMediaProbe(), extractor: new FfmpegFrameExtractor(), clock });
    const testShot = (await store.get('SHOT', shot.shotId))!;
    await store.update({ ...testShot, requiredDecisions: testShot.requiredDecisions.map((d) => ({ ...d, status: 'ANSWERED' as const })), updatedAt: clock() }, testShot.revision);
    const ref = await testMedia.put({ projectId: EXCHANGE_PROJECT_ID, bytes: media.frame, mimeType: 'image/png' });
    const at = clock();
    await store.create({ kind: 'ASSET', id: 'ASSET-TEST-FIXTURE-KF-ENV-CITY-DUSK-A', projectId: EXCHANGE_PROJECT_ID, schemaVersion: 1, revision: 1, createdAt: at, updatedAt: at, createdBy: TEST_FOUNDER.id, fixture: TEST_FIXTURE, mediaType: 'IMAGE', mimeType: 'image/png', adapter: testMedia.adapter, storageRef: ref.storageRef, contentSha256: ref.sha256, byteSize: ref.byteSize, verifiedAt: at, lineage: { sourceJobId: null, sourceTakeId: null, derivedFromAssetId: null, providerOperationId: 'NOT_AVAILABLE', providerSourceHost: 'NOT_AVAILABLE' } });
    await runner.authorizeBudget(shot.budgetId, TEST_FOUNDER, { authorizedCredits: 255, decisionRefs: ['FD-S101-11'], note: 'TEST FIXTURE: not a founder decision' });
    await runner.approveReference(shot.shotId, 'KF-ENV-CITY-DUSK-A', 'ASSET-TEST-FIXTURE-KF-ENV-CITY-DUSK-A', TEST_FOUNDER, { decisionRefs: ['FD-S101-08'], note: 'TEST FIXTURE: stands in for a founder-supplied photograph' });
    await runner.requestAuthorization(videoId, TEST_FOUNDER);
    const authorized = await runner.authorizeJob(videoId, TEST_FOUNDER, { maxCredits: 175, ttlSec: 900, decisionRefs: ['FD-S101-11'], note: 'TEST FIXTURE: not a founder decision' });
    const all = (await Promise.all(STORED_KINDS.map((k) => store.list(k)))).flat();
    step('Test-only approval fixtures are injected into an isolated test environment', authorized.status === 'AUTHORIZED' && all.every((r) => r.fixture === TEST_FIXTURE) && !path.resolve(workDir).startsWith(path.resolve(root)), `${all.length} records under a temp directory outside the repository, every one marked ${TEST_FIXTURE}; decisions answered in the test copy only; test founder authorized budget 255 cr and ${videoId} up to 175 cr; scene review state approved in a test copy only`);

    const sent = await runner.dispatch(videoId);
    const req = fake.received[0];
    step('The fake provider receives a valid request', sent.outcome === 'SUBMITTED' && fake.received.length === 1 && !!req && requestProblems(req).length === 0 && req.inputs[0]?.role === 'START_FRAME', `${sent.outcome}; ${req?.model} ${req?.mode} ${JSON.stringify(req?.settings)}; start frame ${req?.inputs[0]?.sha256.slice(0, 12)}…; operation ${sent.job.providerOperationId}`);

    const polled = await runner.poll(videoId);
    step('The fake provider returns a mock media artifact', polled.status === 'CAPTURED' && polled.actualSpend.credits === 0, `job ${polled.status}; provider reported ${polled.actualSpend.credits} credits; ${media.video.byteLength} bytes of test pattern video`);

    const asset = (await store.get('ASSET', polled.outputAssetIds[0]!))!;
    step('The asset is captured by the test storage adapter', asset.adapter === 'LOCAL_PRIVATE' && asset.storageRef.startsWith('spine-media://LOCAL_PRIVATE/test-fixtures/') && asset.fixture === TEST_FIXTURE, `${asset.id} → ${asset.storageRef}`);

    const v = await testMedia.verify(asset.storageRef, sha256Hex(media.video));
    step('The output hash is verified', v.ok && asset.contentSha256 === sha256Hex(media.video), `stored copy sha256 ${v.actual?.slice(0, 16)}… equals the provider output`);

    const take = (await store.list('TAKE'))[0]!;
    step('A genuine test Take record is created', take.decision === 'READY_FOR_REVIEW' && take.fixture === TEST_FIXTURE && take.resolution === '270x480' && take.frameRate === 24 && take.audioPresent === false, `${take.id}: ${take.decision}; probed ${take.resolution}, ${take.frameRate} fps, ${take.runtimeSec} s, audio ${take.audioPresent}`);

    const open = async (): Promise<SpineContext> => ({ store, media: testMedia, runner, refs });
    const actors: Record<string, Actor> = { founder: TEST_FOUNDER, reviewer: TEST_REVIEWER };
    const handler = createProductionSpineHandler({
      authenticate: async (r) => {
        const a = actors[String(r.headers['x-test-actor'])];
        return a ? { ok: true, actor: a } : { ok: false, status: 401, error: 'Sign in required', code: 'MISSING_TOKEN' };
      },
      open: async (id) => (id === EXCHANGE_PROJECT_ID ? open() : null),
      signer,
      now: clock,
    });
    const wsCall = await callHandler(handler, { method: 'GET', query: { action: 'workspace', project: EXCHANGE_PROJECT_ID }, headers: { 'x-test-actor': 'reviewer' } });
    const tv = (wsCall.json?.workspace as TakesWorkspaceView | undefined)?.shots[0]?.takes[0];
    step('The Take appears in the review experience', wsCall.status === 200 && tv?.takeId === take.id && tv.fixture && (wsCall.json?.workspace as TakesWorkspaceView).catalogue.kind === 'TEST_FIXTURE' && !!tv.preview, `GET workspace → ${wsCall.status}; ${tv?.takeId} ${tv?.state}, catalogue TEST_FIXTURE, signed preview until ${tv?.preview?.expiresAt}`);

    const hold = await callHandler(handler, { method: 'POST', body: { action: 'take-decision', project: EXCHANGE_PROJECT_ID, takeId: take.id, decision: 'HOLD', note: 'TEST: reviewer holds for the founder' }, headers: { 'x-test-actor': 'reviewer' } });
    const reviewerApprove = await callHandler(handler, { method: 'POST', body: { action: 'take-decision', project: EXCHANGE_PROJECT_ID, takeId: take.id, decision: 'APPROVE' }, headers: { 'x-test-actor': 'reviewer' } });
    const approve = await callHandler(handler, { method: 'POST', body: { action: 'take-decision', project: EXCHANGE_PROJECT_ID, takeId: take.id, decision: 'APPROVE', note: 'TEST: founder approves' }, headers: { 'x-test-actor': 'founder' } });
    step('An authorized test reviewer approves or holds it', hold.status === 200 && reviewerApprove.status === 403 && approve.status === 200 && (approve.json?.take as { decision: string }).decision === 'APPROVED', `reviewer HOLD → ${hold.status}; reviewer APPROVE → ${reviewerApprove.status} (founder only); founder APPROVE → ${approve.status}`);

    const reopened = jsonFileStore(path.join(workDir, 'records'), { projectId: EXCHANGE_PROJECT_ID, live: false });
    const persisted = (await reopened.get('TAKE', take.id))!;
    const history = (await reopened.list('APPROVAL')).filter((a) => a.subject.id === take.id);
    const immutable = await reopened.update(history[0]!, 1).then(() => 'changed', (e: Error) => e.message.split(':')[0]);
    step('Approval history persists', persisted.decision === 'APPROVED' && history.length === 2 && immutable === 'IMMUTABLE_RECORD', `a fresh store reads ${persisted.id} ${persisted.decision} with ${history.map((h) => `${h.id} ${h.decision} by ${h.actorRole}`).join(', ')}; editing an approval → ${immutable}`);

    const select = await callHandler(handler, { method: 'POST', body: { action: 'take-decision', project: EXCHANGE_PROJECT_ID, takeId: take.id, decision: 'SELECT_FOR_EDIT' }, headers: { 'x-test-actor': 'founder' } });
    const selected = (await reopened.get('TAKE', take.id))!;
    step('Selection for editing updates the record', select.status === 200 && selected.selectedForEdit && selected.revision === take.revision + 3, `${selected.id} selectedForEdit=${selected.selectedForEdit}, revision ${selected.revision}`);

    const ws2 = await callHandler(handler, { method: 'GET', query: { action: 'workspace', project: EXCHANGE_PROJECT_ID }, headers: { 'x-test-actor': 'founder' } });
    const preview = (ws2.json?.workspace as TakesWorkspaceView).shots[0]!.takes[0]!.preview!;
    const q = Object.fromEntries(new URL(preview.url, 'http://local').searchParams);
    const read = await callHandler(handler, { method: 'GET', query: q });
    const recordsText = (await Promise.all(STORED_KINDS.map((k) => reopened.list(k)))).flat().map((r) => JSON.stringify(r)).join('\n');
    step('The test asset is retrievable without a provider URL', read.status === 200 && !!read.bytes && sha256Hex(read.bytes) === take.contentSha256 && !/https?:\/\//.test(recordsText), `signed read (${preview.url.split('?')[0]}, expires ${preview.expiresAt}) → ${read.status}, ${read.bytes?.byteLength} bytes, hash matches; no URL stored in any record`);

    step('No real provider request occurs', networkCalls === 0 && !openart.status().enabled && fake.received.length === 1, `network calls during the run: ${networkCalls}; OpenArt route disabled: ${openart.status().reason}`);

    const after = liveRecordHashes(root);
    const unchanged = JSON.stringify(before) === JSON.stringify(after);
    step('No credits are spent', unchanged && budget.authorizedCredits === 0 && jobs.every((j) => j.attempts.length === 0), `live records unchanged (${Object.keys(after).length} files, same hashes); live budget authorized 0 cr; live jobs never attempted; fake provider reported 0 cr`);

    return { steps, providerNetworkCalls: networkCalls, realProviderRequests: 0, creditsSpent: 0, liveRecordsUnchanged: unchanged, workDir };
  } finally {
    globalThis.fetch = realFetch;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const r = await runSh01DryRun();
  for (const s of r.steps) console.log(`${String(s.n).padStart(2)} ${s.pass ? 'PASS' : 'FAIL'}  ${s.title}\n     ${s.evidence}`);
  console.log(`\nprovider network calls ${r.providerNetworkCalls}; real provider requests ${r.realProviderRequests}; credits spent ${r.creditsSpent}; live records unchanged ${r.liveRecordsUnchanged}`);
  fs.rmSync(r.workDir, { recursive: true, force: true });
  if (r.steps.some((s) => !s.pass)) process.exit(1);
}
