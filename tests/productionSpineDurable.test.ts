import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FOUNDER_ACTOR } from '../shared/site00-fiction-production/approvals.js';
import { FakeProviderTransport, MemoryMediaStore, ProductionRunner, ScopedRecordStore, serializeRecord, sha256Hex, STORED_KINDS, TEST_FIXTURE, type Actor, type ApprovalRecord, type AssetRecord, type GenerationJobRecord, type TakeRecord } from '../shared/site00-production-spine/index.js';
import { FfprobeMediaProbe } from '../shared/site00-production-spine/node/ffmpeg.js';
import { SupabaseRpcBackend } from '../shared/site00-production-spine/node/supabaseStore.js';
import { planSpineStore } from '../shared/site00-production-spine/node/storeSelection.js';
import { buildSh01Records, EXCHANGE_PROJECT_ID, SH01 } from '../shared/site00-production-spine/projects/theExchange.js';
import { pgServerBin, sandboxRpcClient, SPINE_MIGRATIONS, startPgSandbox, type PgSandbox, type SqlOptions } from '../scripts/production/pgSandbox.js';
import { makeSpineFixtureMedia, markFixture, seedApprovedSh01, seedSh01Setup, steppingClock, VIDEO_JOB, type SpineFixtureMedia } from '../scripts/production/spineFixtures.js';

/**
 * The durable record store against a real PostgreSQL 16 database shaped like Supabase (throwaway local cluster, see
 * scripts/production/pgSandbox.ts). The same SupabaseRpcBackend the API uses talks to the migration's functions, so
 * these tests exercise the database's own constraints, triggers and row level security, not a mock of them.
 * Where no PostgreSQL server is installed the suite is skipped and reported as BLOCKED, never as passed.
 */

const root = process.cwd();
const FOUNDER: Actor = { id: FOUNDER_ACTOR, role: 'FOUNDER' };
const PG = pgServerBin();
const U_MEMBER = '00000000-0000-4000-8000-000000000001';
const U_OTHER_PROJECT = '00000000-0000-4000-8000-000000000002';
const U_NONE = '00000000-0000-4000-8000-000000000003';

let sb: PgSandbox;
let fx: SpineFixtureMedia;

const store = (projectId = EXCHANGE_PROJECT_ID) => new ScopedRecordStore(new SupabaseRpcBackend(sandboxRpcClient(sb), projectId, 'sandbox'), { projectId, live: false });
const errCode = (p: Promise<unknown>) => p.then(() => 'OK', (e: Error) => e.message.split(':')[0]);
/** Commits records straight through the database function, skipping every application check. */
async function rawCommit(ops: Array<{ kind: string; record: unknown; expectedRevision: number | null }>) {
  const r = await sandboxRpcClient(sb).rpc('site00_spine_commit', { p_ops: ops });
  return r.error ? `${r.error.code ?? ''} ${r.error.message}` : 'OK';
}
const as = (role: SqlOptions['role'], userId?: string) => ({ role, userId: userId ?? null });
const denied = (p: Promise<unknown>) => p.then(() => 'ALLOWED', (e: Error) => (/permission denied/.test(e.message) ? 'DENIED' : `ERROR ${e.message}`));

async function approvedRunner(s = store(), fake = new FakeProviderTransport('OpenArt', { bytes: fx.video, mimeType: 'video/mp4' })) {
  const media = new MemoryMediaStore();
  const clock = steppingClock();
  const runner = new ProductionRunner({ store: s, media, transports: { 'OA-NBP-I2I-2K-REF': fake, 'OA-K3O-I2V-PRO': fake }, sceneGate: () => ({ valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), clock });
  await seedApprovedSh01({ store: s, runner, media, clock, root, frame: fx.frame, founder: FOUNDER });
  return { store: s, runner, media, clock, fake };
}

async function reset() {
  sb.sqlSync(`alter table public.site00_spine_approval_events disable trigger user;
    truncate public.site00_spine_provider_operations, public.site00_spine_continuity_refs, public.site00_spine_takes, public.site00_spine_assets, public.site00_spine_jobs, public.site00_spine_shots, public.site00_spine_budgets, public.site00_spine_approval_events cascade;
    alter table public.site00_spine_approval_events enable trigger user;`);
}

describe.skipIf(!PG)('durable record store on PostgreSQL (§05, §09, §12, §13)', () => {
  beforeAll(() => {
    sb = startPgSandbox();
    fx = makeSpineFixtureMedia();
  }, 60_000);
  afterAll(() => {
    sb?.stop();
    if (fx) fs.rmSync(fx.dir, { recursive: true, force: true });
  });

  it('applies the migration additively and idempotently: tables, RLS, private bucket, service-role-only functions', () => {
    sb.applyFile(SPINE_MIGRATIONS[1]!);
    const tables = sb.sqlSync(`select string_agg(c.relname || ':' || c.relrowsecurity, ',' order by c.relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'site00_spine_%'`);
    expect(tables.split(',')).toEqual(['approval_events', 'assets', 'budgets', 'continuity_refs', 'jobs', 'members', 'provider_operations', 'shots', 'takes'].map((t) => `site00_spine_${t}:true`));
    expect(sb.sqlSync(`select project_key || '|' || (metadata->>'productionSpine') || '|' || (metadata->>'globalActorCatalogue') from site00_managed_projects where project_key = 'the-exchange'`)).toBe('the-exchange|true|NOT_IMPORTED');
    expect(sb.sqlSync(`select id || '|' || public from storage.buckets`)).toBe('site00-production-masters|false');
    for (const fn of ['site00_spine_commit(jsonb)', 'site00_spine_read(text,text,text)', 'site00_spine_records(text,text)', 'site00_spine_member_role(text,uuid)'])
      expect(sb.sqlSync(`select has_function_privilege('anon', 'public.${fn}', 'execute')::text || has_function_privilege('authenticated', 'public.${fn}', 'execute')::text || has_function_privilege('service_role', 'public.${fn}', 'execute')::text`), fn).toBe('falsefalsetrue');
    expect(sb.sqlSync(`select count(*) from pg_policies where tablename like 'site00_spine_%' and policyname = 'service_role_all' and roles = '{service_role}'`)).toBe('9');
  });

  it('keeps every record across connections and across a process restart', async () => {
    await reset();
    const { budget, shot, jobs } = await seedSh01Setup(store(), root);
    const fresh = store();
    for (const r of [budget, shot, ...jobs]) expect(serializeRecord((await fresh.get(r.kind, r.id))!)).toBe(serializeRecord(markFixture(r)));
    const probe = JSON.parse(execFileSync('npx', ['tsx', path.join(root, 'scripts/production/spineRestartProbe.ts'), sb.dir, String(sb.port), EXCHANGE_PROJECT_ID], { encoding: 'utf8' }).trim().split('\n').at(-1)!) as { pid: number; records: Record<string, string> };
    expect(probe.pid).not.toBe(process.pid);
    expect(probe.records).toEqual(Object.fromEntries([budget, shot, ...jobs].map((r) => [`${r.kind}/${r.id}`, sha256Hex(serializeRecord(markFixture(r)))])));
  });

  it('commits a batch atomically: one bad op rolls back the rest', async () => {
    await reset();
    const { budget, shot } = buildSh01Records(root);
    const out = await rawCommit([
      { kind: 'BUDGET', record: markFixture(budget), expectedRevision: null },
      { kind: 'SHOT', record: markFixture({ ...shot, budgetId: 'BUDGET-DOES-NOT-EXIST' }), expectedRevision: null },
    ]);
    expect(out).toMatch(/^23503 /);
    expect(await store().get('BUDGET', budget.id)).toBeNull();
  });

  it('compare-and-set holds under real concurrency: eight writers at one revision, one wins', async () => {
    await reset();
    const { budget } = await seedSh01Setup(store(), root);
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => errCode(store().update(markFixture({ ...budget, note: `writer ${i}` }), 1))));
    expect(results.filter((r) => r === 'OK')).toHaveLength(1);
    expect(results.filter((r) => r === 'CONFLICT')).toHaveLength(7);
    expect((await store().get('BUDGET', budget.id))!.revision).toBe(2);
  });

  it('two servers dispatching the same job at once send one provider request', async () => {
    await reset();
    const fake = new FakeProviderTransport('OpenArt', { bytes: fx.video, mimeType: 'video/mp4' });
    const a = await approvedRunner(store(), fake);
    const other = new ProductionRunner({ store: store(), media: a.media, transports: { 'OA-NBP-I2I-2K-REF': fake, 'OA-K3O-I2V-PRO': fake }, sceneGate: () => ({ valid: true, reasons: [] }), probe: new FfprobeMediaProbe(), clock: a.clock });
    const outs = await Promise.all([a.runner.dispatch(VIDEO_JOB, FOUNDER), other.dispatch(VIDEO_JOB, FOUNDER)]);
    expect(outs.filter((o) => o.outcome === 'SUBMITTED')).toHaveLength(1);
    expect(fake.received).toHaveLength(1);
    expect(sb.sqlSync(`select count(*) || '|' || string_agg(outcome || ':' || coalesce(quoted_credits::text, 'null'), ',') from site00_spine_provider_operations`)).toBe('1|OPEN:175');
    const done = await a.runner.poll(VIDEO_JOB);
    expect(done.status).toBe('CAPTURED');
    expect(sb.sqlSync(`select outcome || '|' || actual_status || '|' || quote_status from site00_spine_cost_records`)).toBe('SUCCEEDED|REPORTED|QUOTED');
    expect(sb.sqlSync(`select count(*) from site00_spine_takes where job_id = '${VIDEO_JOB}' and decision = 'READY_FOR_REVIEW'`)).toBe('1');
  });

  describe('constraints hold even when the application is bypassed', () => {
    let job: GenerationJobRecord;
    let take: TakeRecord;
    let asset: AssetRecord;
    beforeAll(async () => {
      await reset();
      const a = await approvedRunner();
      await a.runner.dispatch(VIDEO_JOB, FOUNDER);
      await a.runner.poll(VIDEO_JOB);
      const s = store();
      job = (await s.get('GENERATION_JOB', VIDEO_JOB))!;
      take = (await s.list('TAKE'))[0]!;
      asset = (await s.get('ASSET', take.assetId))!;
    });

    it('no duplicate job: an idempotency key belongs to one job', async () => {
      const clone = { ...buildSh01Records(root).jobs[0]!, id: 'JOB-S1-01-SH01-DUPLICATE', idempotencyKey: job.idempotencyKey, fixture: TEST_FIXTURE };
      expect(await rawCommit([{ kind: 'GENERATION_JOB', record: clone, expectedRevision: null }])).toMatch(/^23505 .*idempotency/);
    });

    it('no orphan take and no asset without provenance', async () => {
      const orphan = { ...take, id: 'TAKE-ORPHAN', jobId: 'JOB-DOES-NOT-EXIST', takeNumber: 9, revision: 1, approvalIds: [], decision: 'READY_FOR_REVIEW', selectedForEdit: false };
      expect(await rawCommit([{ kind: 'TAKE', record: orphan, expectedRevision: null }])).toMatch(/^23503 /);
      const foreign = { ...asset, id: 'ASSET-FOREIGN', storageRef: asset.storageRef.replace(`/${EXCHANGE_PROJECT_ID}/`, '/ndxbook/') };
      expect(await rawCommit([{ kind: 'ASSET', record: foreign, expectedRevision: null }])).toMatch(/^23514 .*provenance/);
      const unhashed = { ...asset, id: 'ASSET-WRONG-HASH', contentSha256: 'a'.repeat(64) };
      expect(await rawCommit([{ kind: 'ASSET', record: unhashed, expectedRevision: null }])).toMatch(/^23514 .*provenance/);
    });

    it('no approved take without founder authority, and no selection of a take that is not approved', async () => {
      const forged = { ...take, decision: 'APPROVED', revision: take.revision + 1 };
      expect(await rawCommit([{ kind: 'TAKE', record: forged, expectedRevision: take.revision }])).toMatch(/SPINE_FORBIDDEN/);
      const ev = (decision: string, actorRole: string, id: string): ApprovalRecord => ({ kind: 'APPROVAL', id, projectId: EXCHANGE_PROJECT_ID, schemaVersion: 1, revision: 1, createdAt: take.createdAt, updatedAt: take.createdAt, createdBy: 'test', fixture: TEST_FIXTURE, approvalKind: 'TAKE_DECISION', subject: { kind: 'TAKE', id: take.id }, decision: decision as ApprovalRecord['decision'], actor: 'test', actorRole: actorRole as ApprovalRecord['actorRole'], at: take.createdAt, previousState: 'READY_FOR_REVIEW', newState: 'APPROVED', sourceVersion: `TAKE/${take.id}@r${take.revision}#${id}`, note: null, decisionRefs: [], supersedes: null });
      expect(await rawCommit([{ kind: 'APPROVAL', record: ev('APPROVE', 'REVIEWER', 'APR-FORGED-1'), expectedRevision: null }])).toMatch(/^23514 .*take_authority/);
      const reviewerHold = ev('HOLD', 'REVIEWER', 'APR-FORGED-2');
      expect(await rawCommit([{ kind: 'APPROVAL', record: reviewerHold, expectedRevision: null }, { kind: 'TAKE', record: { ...take, decision: 'APPROVED', approvalIds: ['APR-FORGED-2'], revision: take.revision + 1 }, expectedRevision: take.revision }])).toMatch(/SPINE_FORBIDDEN/);
      expect(await rawCommit([{ kind: 'TAKE', record: { ...take, selectedForEdit: true, revision: take.revision + 1 }, expectedRevision: take.revision }])).toMatch(/^23514 .*takes_selection/);
      expect(await rawCommit([{ kind: 'APPROVAL', record: ev('SELECT_FOR_EDIT', 'REVIEWER', 'APR-FORGED-3'), expectedRevision: null }])).toMatch(/^23514 .*take_authority/);
    });

    it('no authorized job without a founder authorization for its exact inputs', async () => {
      const draft = buildSh01Records(root).jobs[0]!;
      const s = store();
      const ref = (await s.get('GENERATION_JOB', draft.id))!;
      expect(await rawCommit([{ kind: 'GENERATION_JOB', record: { ...ref, status: 'AUTHORIZED', revision: ref.revision + 1 }, expectedRevision: ref.revision }])).toMatch(/^23514 .*authorized_has_approval/);
      const auth = (await s.list('APPROVAL')).find((a) => a.approvalKind === 'GENERATION_AUTHORIZATION')!;
      expect(await rawCommit([{ kind: 'GENERATION_JOB', record: { ...ref, status: 'AUTHORIZED', founderApprovalRef: auth.id, revision: ref.revision + 1 }, expectedRevision: ref.revision }])).toMatch(/SPINE_FORBIDDEN/);
    });

    it('one attempt in flight per job, one operation per provider id, closed attempts never rewritten', async () => {
      const open = (n: number) => ({ attempt: n, authorizationId: 'X', ticketId: `TKT-T-${n}`, operationId: 'NOT_AVAILABLE', outcome: 'OPEN', quotedCredits: 40, chargedCredits: 'NOT_AVAILABLE' });
      const ref = (await store().get('GENERATION_JOB', buildSh01Records(root).jobs[1]!.id))!;
      expect(await rawCommit([{ kind: 'GENERATION_JOB', record: { ...ref, attempts: [open(1), open(2)], revision: ref.revision + 1 }, expectedRevision: ref.revision }])).toMatch(/^23505 .*in_flight/);
      const rewrite = { ...job, attempts: job.attempts.map((a) => ({ ...a, outcome: 'FAILED' })), revision: job.revision + 1 };
      expect(await rawCommit([{ kind: 'GENERATION_JOB', record: rewrite, expectedRevision: job.revision }])).toMatch(/SPINE_IMMUTABLE_RECORD/);
      const sameOp = { ...ref, attempts: [{ ...open(1), operationId: 'FAKE-OP-001' }], revision: ref.revision + 1 };
      expect(await rawCommit([{ kind: 'GENERATION_JOB', record: sameOp, expectedRevision: ref.revision }])).toMatch(/^23505 .*operation/);
    });

    it('approval history is append-only: no update, delete or truncate, even by the table owner', async () => {
      const a = (await store().list('APPROVAL'))[0]!;
      expect(await errCode(store().update(a, 1))).toBe('IMMUTABLE_RECORD');
      expect(await rawCommit([{ kind: 'APPROVAL', record: { ...a, note: 'rewritten', revision: 2 }, expectedRevision: 1 }])).toMatch(/SPINE_IMMUTABLE_RECORD/);
      for (const sql of [`update site00_spine_approval_events set record = record where id = '${a.id}'`, `delete from site00_spine_approval_events where id = '${a.id}'`, 'truncate site00_spine_approval_events cascade'])
        expect(await sb.sql(sql).then(() => 'CHANGED', (e: Error) => e.message), sql).toMatch(/SPINE_IMMUTABLE_RECORD/);
      const twin = { ...a, id: `${a.id}-TWIN` };
      expect(await rawCommit([{ kind: 'APPROVAL', record: twin, expectedRevision: null }])).toMatch(/^23505 .*once/);
    });
  });

  describe('row level security and project isolation (§07, §08)', () => {
    beforeAll(async () => {
      await reset();
      const a = await approvedRunner();
      await a.runner.dispatch(VIDEO_JOB, FOUNDER);
      await a.runner.poll(VIDEO_JOB);
      sb.sqlSync(`insert into auth.users (id, email) values ('${U_MEMBER}', 'member@test.invalid'), ('${U_OTHER_PROJECT}', 'other@test.invalid'), ('${U_NONE}', 'none@test.invalid') on conflict do nothing;
        insert into site00_spine_members (project_key, user_id, role, granted_by) values ('the-exchange', '${U_MEMBER}', 'READ_ONLY', 'test'), ('ndxbook', '${U_OTHER_PROJECT}', 'REVIEWER', 'test') on conflict do nothing;`);
      const { budget } = buildSh01Records(root);
      const other = markFixture({ ...budget, projectId: 'ndxbook', id: 'BUDGET-NDXBOOK-TEST' });
      sb.sqlSync(`insert into site00_spine_budgets (project_key, id, revision, record) values ('ndxbook', 'BUDGET-NDXBOOK-TEST', 1, '${JSON.stringify(other).replace(/'/g, "''")}'::jsonb) on conflict do nothing`);
    });

    const count = (sql: string, o: SqlOptions) => sb.sql(`select count(*) from ${sql}`, o);

    it('anon reads and writes nothing, and cannot call the store functions', async () => {
      for (const t of ['site00_spine_takes', 'site00_spine_approval_events', 'site00_spine_members', 'site00_spine_cost_records', 'site00_spine_edit_selections']) expect(await denied(count(t, as('anon'))), t).toBe('DENIED');
      expect(await denied(sb.sql(`select public.site00_spine_read('TAKE', 'the-exchange', 'x')`, as('anon')))).toBe('DENIED');
    });

    it('a signed-in user sees only the projects they are a member of', async () => {
      expect(await count('site00_spine_jobs', as('authenticated', U_NONE))).toBe('0');
      expect(await count('site00_spine_jobs', as('authenticated', U_MEMBER))).toBe('3');
      expect(await count('site00_spine_budgets', as('authenticated', U_MEMBER))).toBe('1');
      expect(await count(`site00_spine_budgets where project_key = 'ndxbook'`, as('authenticated', U_MEMBER))).toBe('0');
      expect(await count('site00_spine_jobs', as('authenticated', U_OTHER_PROJECT))).toBe('0');
      expect(await count('site00_spine_budgets', as('authenticated', U_OTHER_PROJECT))).toBe('1');
      expect(await count('site00_spine_cost_records', as('authenticated', U_MEMBER))).toBe('1');
      expect(await count('site00_spine_cost_records', as('authenticated', U_OTHER_PROJECT))).toBe('0');
      expect(await count('site00_spine_edit_selections', as('authenticated', U_NONE))).toBe('0');
      expect(await count('site00_spine_members', as('authenticated', U_MEMBER))).toBe('1');
      expect(await count('site00_spine_jobs', as('service_role'))).toBe('3');
    });

    it('no signed-in user writes directly or calls the store functions; the API (service role) is the only writer', async () => {
      expect(await denied(sb.sql(`update site00_spine_budgets set record = record`, as('authenticated', U_MEMBER)))).toBe('DENIED');
      expect(await denied(sb.sql(`delete from site00_spine_jobs`, as('authenticated', U_MEMBER)))).toBe('DENIED');
      expect(await denied(sb.sql(`insert into site00_spine_members (project_key, user_id, role, granted_by) values ('the-exchange', '${U_NONE}', 'FOUNDER', 'self')`, as('authenticated', U_NONE)))).toBe('DENIED');
      expect(await denied(sb.sql(`select public.site00_spine_commit('[]'::jsonb)`, as('authenticated', U_MEMBER)))).toBe('DENIED');
      expect(await denied(sb.sql(`select public.site00_spine_member_role('the-exchange', '${U_MEMBER}')`, as('authenticated', U_MEMBER)))).toBe('DENIED');
    });

    it('resolves project roles for the API from the members table only', async () => {
      const backend = new SupabaseRpcBackend(sandboxRpcClient(sb), EXCHANGE_PROJECT_ID, 'sandbox');
      expect([await backend.memberRole(U_MEMBER), await backend.memberRole(U_OTHER_PROJECT), await backend.memberRole(U_NONE)]).toEqual(['READ_ONLY', null, null]);
      expect(await errCode(new SupabaseRpcBackend(sandboxRpcClient(sb, as('authenticated', U_MEMBER)), EXCHANGE_PROJECT_ID, 'x').probe())).toBe('STORE_FORBIDDEN');
    });

    it('a store scoped to one project cannot read or write another project’s records', async () => {
      const ndx = store('ndxbook');
      expect((await ndx.list('GENERATION_JOB')).length).toBe(0);
      expect(await errCode(ndx.create(markFixture(buildSh01Records(root).budget)))).toBe('CROSS_PROJECT_DENIED');
      const r = await sandboxRpcClient(sb).rpc('site00_spine_read', { p_kind: 'BUDGET', p_project: 'ndxbook', p_id: buildSh01Records(root).budget.id });
      expect(r.data).toBeNull();
    });
  });

  it('opens nothing silently: store selection is explicit and refuses unsafe combinations', () => {
    expect(planSpineStore({}, root)).toMatchObject({ ok: true, mode: 'repository' });
    expect(planSpineStore({ SITE00_PRODUCTION_RECORD_STORE: 'supabase' }, root)).toMatchObject({ ok: false, code: 'STORE_NOT_CONFIGURED' });
    expect(planSpineStore({ SITE00_PRODUCTION_RECORD_STORE: 'supabase', SITE00_PRODUCTION_SPINE_ENVIRONMENT: 'PRODUCTION', SUPABASE_URL: 'x', SUPABASE_SERVICE_ROLE_KEY: 'y' }, root)).toMatchObject({ ok: false, code: 'PRODUCTION_STORE_NOT_APPROVED' });
    expect(planSpineStore({ SITE00_PRODUCTION_RECORD_STORE: 'supabase', SITE00_PRODUCTION_SPINE_ENVIRONMENT: 'STAGING', SUPABASE_URL: 'x', SUPABASE_SERVICE_ROLE_KEY: 'y', NODE_ENV: 'production' }, root)).toMatchObject({ ok: false, code: 'ENVIRONMENT_MISMATCH' });
    expect(planSpineStore({ SITE00_PRODUCTION_RECORD_STORE: 'supabase', SITE00_PRODUCTION_SPINE_ENVIRONMENT: 'STAGING', SUPABASE_URL: 'x', SUPABASE_SERVICE_ROLE_KEY: 'y' }, root)).toMatchObject({ ok: true, mode: 'supabase', bucket: 'site00-production-masters' });
    expect(planSpineStore({ SITE00_PRODUCTION_RECORD_STORE: 'fixture', NODE_ENV: 'production', SITE00_PRODUCTION_SPINE_FIXTURE_ROOT: '/tmp/x' }, root)).toMatchObject({ ok: false, code: 'FIXTURE_STORE_IN_PRODUCTION' });
    expect(planSpineStore({ SITE00_PRODUCTION_RECORD_STORE: 'fixture', SITE00_PRODUCTION_SPINE_FIXTURE_ROOT: path.join(root, 'x') }, root)).toMatchObject({ ok: false, code: 'FIXTURE_ROOT_IN_REPOSITORY' });
    expect(planSpineStore({ SITE00_PRODUCTION_RECORD_STORE: 'memory' }, root)).toMatchObject({ ok: false, code: 'STORE_NOT_CONFIGURED' });
  });

  it('fails loudly when the database is unreachable: no fallback to memory', async () => {
    const dead = new ScopedRecordStore(new SupabaseRpcBackend({ rpc: async () => Promise.reject(new Error('connect ECONNREFUSED')) }, EXCHANGE_PROJECT_ID, 'dead'), { projectId: EXCHANGE_PROJECT_ID, live: true });
    expect(await errCode(dead.get('TAKE', 'x'))).toBe('STORE_UNAVAILABLE');
    expect(await errCode(dead.create(buildSh01Records(root).budget))).toBe('STORE_UNAVAILABLE');
    expect(STORED_KINDS.length).toBe(7);
  });
});

describe.runIf(!PG)('durable record store on PostgreSQL', () => {
  it('BLOCKED: no PostgreSQL server binaries in this environment; durable-store checks did not run', () => {
    expect(PG).toBeNull();
  });
});

