import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import defaultHandler, { createProductionSpineHandler, type SpineContext } from '../api/site00/production-spine.js';
import { FOUNDER_ACTOR } from '../shared/site00-fiction-production/approvals.js';
import { repoPath } from '../shared/site00-fiction-production/paths.js';
import { MediaSigner, MemoryMediaStore, memoryStore, OpenArtAgentSessionTransport, ProductionRunner, SpineError, TEST_FIXTURE, type Actor, type TakesWorkspaceView } from '../shared/site00-production-spine/index.js';
import { FfprobeMediaProbe } from '../shared/site00-production-spine/node/ffmpeg.js';
import { jsonFileStore } from '../shared/site00-production-spine/node/jsonStore.js';
import { spineProject } from '../shared/site00-production-spine/projects/index.js';
import { EXCHANGE_PROJECT_ID, EXCHANGE_RECORDS_DIR, SH01 } from '../shared/site00-production-spine/projects/theExchange.js';
import { callHandler, runSh01DryRun } from '../scripts/production/sh01DryRun.js';
import { pgServerBin } from '../scripts/production/pgSandbox.js';
import { steppingClock } from '../scripts/production/spineFixtures.js';

const root = process.cwd();
const FOUNDER: Actor = { id: FOUNDER_ACTOR, role: 'FOUNDER' };
const REVIEWER: Actor = { id: 'reviewer:test', role: 'REVIEWER' };
const READER: Actor = { id: 'reader:test', role: 'READ_ONLY' };
const actors: Record<string, Actor> = { founder: FOUNDER, reviewer: REVIEWER, reader: READER };

/** The live catalogue, read-only, behind the real (disabled) OpenArt route. */
function liveHandler(overrides: Partial<SpineContext> = {}) {
  const project = spineProject(EXCHANGE_PROJECT_ID)!;
  const store = jsonFileStore(repoPath(EXCHANGE_RECORDS_DIR, root), { projectId: EXCHANGE_PROJECT_ID, live: true, readOnly: 'test: live catalogue is read only' });
  const media = { ...new MemoryMediaStore(), live: true } as unknown as MemoryMediaStore;
  const openart = new OpenArtAgentSessionTransport({});
  const runner = new ProductionRunner({ store, media, transports: Object.fromEntries(project.routeIds.map((r) => [r, openart])), routeIds: project.routeIds, sceneGate: project.sceneGate(root), probe: new FfprobeMediaProbe(), clock: steppingClock() });
  const refs = project.refs(root, project.providers(() => ({ execution: 'DISABLED', reason: openart.status().reason, transportId: openart.transportId })));
  const ctx: SpineContext = { store, media, runner, refs, ...overrides };
  return createProductionSpineHandler({
    authenticate: async (req) => {
      const a = actors[String(req.headers['x-test-actor'])];
      if (a) return { ok: true, actor: a };
      return req.headers['x-test-actor'] ? { ok: false, status: 403, error: 'not a member', code: 'NOT_A_PROJECT_MEMBER' } : { ok: false, status: 401, error: 'Sign in required', code: 'MISSING_TOKEN' };
    },
    open: async (id) => (id === EXCHANGE_PROJECT_ID ? ctx : null),
    signer: new MediaSigner(null),
    now: () => '2026-10-25T13:00:00Z',
  });
}

const as = (who: string) => ({ 'x-test-actor': who });

describe('production spine API', () => {
  it('requires an admin session: the default wiring refuses without one', async () => {
    const r = await callHandler(defaultHandler, { method: 'GET', query: { action: 'workspace', project: EXCHANGE_PROJECT_ID } });
    expect([401, 503]).toContain(r.status);
    expect(r.json?.workspace).toBeUndefined();
  });

  it('serves the live SH01 workspace: no takes, every requirement listed, generate disabled', async () => {
    const h = liveHandler();
    expect((await callHandler(h, { method: 'GET', query: { action: 'workspace', project: EXCHANGE_PROJECT_ID } })).status).toBe(401);
    const r = await callHandler(h, { method: 'GET', query: { action: 'workspace', project: EXCHANGE_PROJECT_ID }, headers: as('founder') });
    expect(r.status).toBe(200);
    const ws = r.json!.workspace as TakesWorkspaceView;
    expect(ws.catalogue).toMatchObject({ kind: 'LIVE' });
    expect(ws.project).toMatchObject({ releases: 86, runtime: '127:40', castAuthority: 'PROJECT_LOCAL', globalActorCatalogue: 'NOT_IMPORTED' });
    const s = ws.shots[0]!;
    expect([s.shotId, s.setup, s.generation, s.takes.length, s.generate.enabled]).toEqual([SH01.shotId, 'PRODUCTION_SETUP_READY', 'GENERATION_AUTHORIZATION_PENDING', 0, false]);
    expect(s.budget).toMatchObject({ status: 'PLANNING_ESTIMATE_ONLY', plannedCredits: 255, authorizedCredits: 0, committedCredits: 0, actualCredits: 'NOT_AVAILABLE' });
    expect(ws.providers.every((p) => p.execution === 'DISABLED')).toBe(true);
    // Six separate readiness stages; technical readiness is not creative approval, creative approval is not spend.
    expect(s.readiness.map((r) => [r.stage, r.met])).toEqual([
      ['TECHNICALLY_READY', false],
      ['CREATIVELY_APPROVED', false],
      ['FINANCIALLY_AUTHORIZED', false],
      ['GENERATION_RUNNING', false],
      ['TAKE_READY_FOR_REVIEW', false],
      ['TAKE_APPROVED', false],
    ]);
    expect(s.readiness[0]!.checks.filter((c) => !c.met).map((c) => c.label)).toEqual(['Durable record store', 'Private master storage', 'Provider route available']);
    expect(s.readiness[1]!.checks.filter((c) => !c.met).map((c) => c.label)).toEqual(['FD-S101-01 (screenplay)', 'FD-S101-08 (city reference)', 'KF-ENV-CITY-DUSK-A approved']);
    expect(ws.catalogue).toMatchObject({ durable: false });
    expect(ws.viewer.permissions).toContain('AUTHORIZE_SPEND');
  });

  it('rejects dispatch: the reviewer may not, and the founder is blocked by the disabled route', async () => {
    const h = liveHandler();
    const before = fs.readFileSync(repoPath(`${EXCHANGE_RECORDS_DIR}/GENERATION_JOB/JOB-S1-01-SH01-VIDEO-01.json`, root), 'utf8');
    expect((await callHandler(h, { method: 'POST', body: { action: 'dispatch', project: EXCHANGE_PROJECT_ID, jobId: 'JOB-S1-01-SH01-VIDEO-01' }, headers: as('reviewer') })).status).toBe(403);
    expect((await callHandler(h, { method: 'POST', body: { action: 'dispatch', project: EXCHANGE_PROJECT_ID, jobId: 'JOB-S1-01-SH01-VIDEO-01' }, headers: as('stranger') })).json?.code).toBe('NOT_A_PROJECT_MEMBER');
    expect((await callHandler(h, { method: 'GET', query: { action: 'workspace', project: EXCHANGE_PROJECT_ID }, headers: as('reader') })).status).toBe(200);
    expect((await callHandler(h, { method: 'POST', body: { action: 'continuity-review', project: EXCHANGE_PROJECT_ID, takeId: 'TAKE-X', status: 'PASS' }, headers: as('reader') })).status).toBe(403);
    const r = await callHandler(h, { method: 'POST', body: { action: 'dispatch', project: EXCHANGE_PROJECT_ID, jobId: 'JOB-S1-01-SH01-VIDEO-01' }, headers: as('founder') });
    expect([r.status, r.json?.outcome, (r.json?.reasons as Array<{ code: string }>)[0]?.code]).toEqual([409, 'BLOCKED', 'PROVIDER_EXECUTION_DISABLED']);
    expect(fs.readFileSync(repoPath(`${EXCHANGE_RECORDS_DIR}/GENERATION_JOB/JOB-S1-01-SH01-VIDEO-01.json`, root), 'utf8')).toBe(before);
  });

  it('scopes every request to a spine project and maps refusals to HTTP status', async () => {
    const h = liveHandler();
    expect((await callHandler(h, { method: 'GET', query: { action: 'workspace', project: 'jurnl' }, headers: as('founder') })).json?.code).toBe('NOT_A_SPINE_PROJECT');
    expect((await callHandler(h, { method: 'POST', body: { action: 'take-decision', project: EXCHANGE_PROJECT_ID, takeId: 'TAKE-X', decision: 'LOVE_IT' }, headers: as('founder') })).status).toBe(400);
    expect((await callHandler(h, { method: 'POST', body: { action: 'take-decision', project: EXCHANGE_PROJECT_ID, takeId: 'TAKE-X', decision: 'APPROVE' }, headers: as('founder') })).status).toBe(404);
    expect((await callHandler(h, { method: 'GET', query: { action: 'media', project: EXCHANGE_PROJECT_ID, ref: 'spine-media://MEMORY_TEST/test-fixtures/the-exchange/' + '0'.repeat(64) + '.mp4', exp: '1792900000', sig: 'ab' } })).status).toBe(403);
    const readOnly = liveHandler({ runner: { decideTake: async () => Promise.reject(new SpineError('STORE_READ_ONLY', 'production')) } as unknown as ProductionRunner });
    expect((await callHandler(readOnly, { method: 'POST', body: { action: 'take-decision', project: EXCHANGE_PROJECT_ID, takeId: 'TAKE-X', decision: 'HOLD' }, headers: as('founder') })).status).toBe(503);
  });

  it('serves a signed media link only while a record of that project names the media (revocation)', async () => {
    const signer = new MediaSigner('s'.repeat(32));
    const media = new MemoryMediaStore(signer);
    const store = memoryStore(EXCHANGE_PROJECT_ID);
    const project = spineProject(EXCHANGE_PROJECT_ID)!;
    const runner = new ProductionRunner({ store, media, transports: {}, sceneGate: () => ({ valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), clock: steppingClock() });
    const ctx: SpineContext = { store, media, runner, refs: project.refs(root, project.providers(() => ({ execution: 'DISABLED', reason: 'test', transportId: 'none' }))) };
    const h = createProductionSpineHandler({ authenticate: async () => ({ ok: true, actor: FOUNDER }), open: async (id) => (id === EXCHANGE_PROJECT_ID ? ctx : null), signer, now: () => '2026-10-25T13:00:00Z' });
    const put = await media.put({ projectId: EXCHANGE_PROJECT_ID, bytes: new Uint8Array([1, 2, 3]), mimeType: 'image/png' });
    const link = signer.sign(put.storageRef, { projectId: EXCHANGE_PROJECT_ID, ttlSec: 300, now: '2026-10-25T13:00:00Z' });
    const q = Object.fromEntries(new URL(link.url, 'http://x').searchParams);
    expect((await callHandler(h, { method: 'GET', query: q })).json?.code).toBe('MEDIA_NOT_FOUND');
    await store.create({ kind: 'ASSET', id: 'ASSET-TEST-LINK', projectId: EXCHANGE_PROJECT_ID, schemaVersion: 1, revision: 1, createdAt: '2026-10-25T13:00:00Z', updatedAt: '2026-10-25T13:00:00Z', createdBy: 'test', fixture: TEST_FIXTURE, mediaType: 'IMAGE', mimeType: 'image/png', adapter: 'MEMORY_TEST', storageRef: put.storageRef, contentSha256: put.sha256, byteSize: 3, verifiedAt: '2026-10-25T13:00:00Z', lineage: { sourceJobId: null, sourceTakeId: null, derivedFromAssetId: null, providerOperationId: 'NOT_AVAILABLE', providerSourceHost: 'NOT_AVAILABLE' } });
    expect((await callHandler(h, { method: 'GET', query: q })).status).toBe(200);
  });

  it('exposes no endpoint that authorizes generation or a budget (D-11 is not granted)', async () => {
    const h = liveHandler();
    for (const action of ['authorize-job', 'authorize-budget', 'approve-reference', 'request-retry'])
      expect((await callHandler(h, { method: 'POST', body: { action, project: EXCHANGE_PROJECT_ID }, headers: as('founder') })).json?.code).toBe('UNKNOWN_ACTION');
    const src = fs.readFileSync(path.join(root, 'api/site00/production-spine.ts'), 'utf8');
    expect(src).not.toMatch(/authorizeJob|authorizeBudget|approveReference|FakeProviderTransport/);
  });
});

describe('S1-01-SH01 zero-spend dry run v2 (§27)', () => {
  it('passes all twenty steps on the durable store with no network call, no credit and no change to the live records', async () => {
    const r = await runSh01DryRun(root);
    try {
      expect(r.durableStore).toMatch(pgServerBin() ? /^PostgreSQL sandbox/ : /BLOCKED/);
      expect(r.steps.map((s) => [s.n, s.pass, s.title])).toEqual(r.steps.map((s) => [s.n, true, s.title]));
      expect(r.steps).toHaveLength(20);
      expect([r.providerNetworkCalls, r.realProviderRequests, r.creditsSpent, r.liveRecordsUnchanged]).toEqual([0, 0, 0, true]);
      expect(r.steps.map((s) => s.title)).toEqual([
        'SH01 loads from production records',
        'Missing approvals are visible',
        'Generate is blocked',
        'Authorization requires the correct role',
        'Authorization is bound to shot and fingerprint',
        'Unquoted spend is blocked',
        'The fake transport completes the authorized test transaction',
        'Output is stored privately',
        'The hash is verified',
        'The take persists',
        'The take is retrievable after a process restart',
        'A reviewer can approve',
        'Unauthorized review is denied',
        'SELECT FOR EDIT records the selection',
        'Duplicate execution is prevented',
        'Capture failure creates no new paid job',
        'Cross-project access is denied',
        'Signed URL expiry works',
        'No real request occurs',
        'No credits are spent',
      ]);
    } finally {
      fs.rmSync(r.workDir, { recursive: true, force: true });
    }
  });
});

describe('EXPRESSION → TAKES wiring (§24, §27)', () => {
  const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

  it('mounts the spine Takes workspace only for spine projects, on the existing TAKES route, with no new navigation tab', async () => {
    const { hasProductionSpine } = await import('../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js');
    const { EXPRESSION_ROUTES } = await import('../src/site00/components/productionAuthority/expression/expressionRoutes');
    const { WORKSPACE_DOMAINS } = await import('../shared/site00-production-graph/types.js');
    const { listHostProductionProjects } = await import('../src/site00/projectRuntime/projectHostProfile');
    expect(hasProductionSpine(EXCHANGE_PROJECT_ID)).toBe(true);
    for (const p of ['ndxbook', 'jurnl', 'all-in-one-enterprises', 'frontal-slayer', 'astral-world', 'studio-world']) expect(hasProductionSpine(p), p).toBe(false);
    expect(read('src/site00/components/production/ExpressionSubScreens.tsx')).toMatch(/resolved\.route\.id === 'takes' && hasProductionSpine\(slug\)/);
    expect(EXPRESSION_ROUTES.filter((r) => r.family === 'performance').map((r) => r.id)).toEqual(['root', 'scenes', 'beats', 'takes']);
    expect([...WORKSPACE_DOMAINS]).toEqual(['HUB', 'INBOX', 'EXPERIENCE', 'DESIGN', 'EXPRESSION', 'LIBRARY', 'ACTIVITY']);
    expect(listHostProductionProjects().find((p) => p.slug === EXCHANGE_PROJECT_ID)).toMatchObject({ name: 'THE EXCHANGE', kind: 'PERSONAL' });
  });

  it('has no inert or circular controls: every button acts or says why it cannot', () => {
    const tsx = read('src/site00/components/productionAuthority/expression/families/ProductionTakes.tsx');
    const css = read('src/site00/styles/site00-production-takes.css');
    const btns = tsx.match(/<Btn\b[\s\S]*?testId=/g) ?? [];
    expect(btns.length).toBeGreaterThanOrEqual(2);
    for (const b of btns) {
      expect(b, b).toMatch(/onClick=/);
      expect(b, b).toMatch(/reason=/);
    }
    expect(css).not.toMatch(/border-radius:\s*50%|9999px/);
    expect(tsx).toMatch(/TEST FIXTURE DATA — NOT THE PRODUCTION CATALOGUE/);
  });
});
