/**
 * Founder-run verification of the production record spine on a real Supabase project (§08, §11, §29).
 * Not run in this sprint: no staging project was approved for changes, and production is never changed here.
 *
 *   STAGING (after migrations 20260826123000, 20261026090000 and 20261026100000 are applied there):
 *     SITE00_SPINE_VERIFY_TARGET=STAGING SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… SUPABASE_ANON_KEY=… \
 *       npx tsx scripts/production/verify-spine-supabase.ts
 *     Writes TEST_FIXTURE records under a dedicated project key `spine-verification` (staging only; approval events
 *     are append-only, so they stay), round-trips one probe object through the private bucket and removes it.
 *
 *   PRODUCTION, after the founder-approved deployment, read-only:
 *     SITE00_SPINE_VERIFY_TARGET=PRODUCTION_READ_ONLY … npx tsx scripts/production/verify-spine-supabase.ts
 *     Writes nothing. Checks the functions answer, anon is refused, and the bucket exists and is private.
 *
 * Prints one JSON line per check and exits non-zero on any failure. Keys are read from the environment only.
 */
import { createClient } from '@supabase/supabase-js';
import { buildSh01Records } from '../../shared/site00-production-spine/projects/theExchange.js';
import { SupabasePrivateMediaStore, type StorageClient } from '../../shared/site00-production-spine/node/supabaseMedia.js';
import { SupabaseRpcBackend, type SpineRpcClient } from '../../shared/site00-production-spine/node/supabaseStore.js';
import { DEFAULT_MASTERS_BUCKET } from '../../shared/site00-production-spine/node/storeSelection.js';
import { ScopedRecordStore } from '../../shared/site00-production-spine/store.js';
import { TEST_FIXTURE, type AnyRecord } from '../../shared/site00-production-spine/types.js';

const target = process.env.SITE00_SPINE_VERIFY_TARGET;
if (target !== 'STAGING' && target !== 'PRODUCTION_READ_ONLY') {
  console.error('Set SITE00_SPINE_VERIFY_TARGET to STAGING or PRODUCTION_READ_ONLY.');
  process.exit(2);
}
const url = process.env.SUPABASE_URL ?? '';
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const anonKey = process.env.SUPABASE_ANON_KEY ?? '';
if (!url || !service || !anonKey) {
  console.error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY are required.');
  process.exit(2);
}

const admin = createClient(url, service, { auth: { persistSession: false } });
const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const bucket = process.env.SITE00_PRODUCTION_MEDIA_BUCKET?.trim() || DEFAULT_MASTERS_BUCKET;
let failed = 0;
const emit = (check: string, ok: boolean, detail: string) => {
  if (!ok) failed++;
  console.log(JSON.stringify({ target, check, result: ok ? 'PASS' : 'FAIL', detail }));
};
const code = (p: Promise<unknown>) => p.then(() => 'OK', (e: Error) => e.message.split(':')[0]);

async function main() {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const exchange = new SupabaseRpcBackend(admin as unknown as SpineRpcClient, 'the-exchange', target!);
  emit('store functions answer for service_role', (await code(exchange.probe())) === 'OK', 'site00_spine_list');

  const anonRead = await anon.from('site00_spine_jobs').select('id').limit(1);
  emit('anon cannot read spine tables', !!anonRead.error || (anonRead.data ?? []).length === 0, anonRead.error?.message ?? `${anonRead.data?.length ?? 0} rows`);
  const anonCommit = await anon.rpc('site00_spine_commit', { p_ops: [] });
  emit('anon cannot call site00_spine_commit', !!anonCommit.error, anonCommit.error?.message ?? 'ALLOWED');

  const media = new SupabasePrivateMediaStore(admin.storage as unknown as StorageClient, bucket);
  emit(`bucket ${bucket} exists and is private`, (await code(media.assertPrivateBucket())) === 'OK', bucket);
  const publicUrl = admin.storage.from(bucket).getPublicUrl('the-exchange/does-not-matter.mp4').data.publicUrl;
  const publicFetch = await fetch(publicUrl).then((r) => r.status, () => 0);
  emit('public URL path refuses (bucket not public)', publicFetch === 400 || publicFetch === 403 || publicFetch === 404, `HTTP ${publicFetch}`);

  if (target === 'PRODUCTION_READ_ONLY') return;

  // STAGING only from here: writes TEST_FIXTURE records under a dedicated project key.
  const key = 'spine-verification';
  const reg = await admin.from('site00_managed_projects').upsert({ project_key: key, display_name: 'SPINE VERIFICATION (staging)', project_type: 'TEST', runtime_mode: 'SITE00_MANAGED', design_enabled: false, marketing_enabled: false, metadata: { productionSpine: true, testOnly: true } }, { onConflict: 'project_key', ignoreDuplicates: true });
  emit('verification project row', !reg.error, reg.error?.message ?? key);
  const store = new ScopedRecordStore(new SupabaseRpcBackend(admin as unknown as SpineRpcClient, key, 'staging verification'), { projectId: key, live: false });
  const run = now.replace(/[^0-9]/g, '');
  const { budget } = buildSh01Records(process.cwd());
  const b: AnyRecord = { ...budget, id: `BUDGET-VERIFY-${run}`, projectId: key, shotIds: [], lines: [], fixture: TEST_FIXTURE, createdAt: now, updatedAt: now };
  emit('create a record', (await code(store.create(b))) === 'OK', b.id);
  const again = new ScopedRecordStore(new SupabaseRpcBackend(createClient(url, service, { auth: { persistSession: false } }) as unknown as SpineRpcClient, key, 'second client'), { projectId: key, live: false });
  emit('a second client reads it back identically', JSON.stringify(await again.get('BUDGET', b.id)) === JSON.stringify(await store.get('BUDGET', b.id)), b.id);
  const racers = await Promise.all([0, 1, 2, 3].map((i) => code(store.update({ ...b, note: `writer ${i}` }, 1))));
  emit('compare-and-set: one of four concurrent writers wins', racers.filter((r) => r === 'OK').length === 1 && racers.filter((r) => r === 'CONFLICT').length === 3, racers.join(','));
  const foreign = new ScopedRecordStore(new SupabaseRpcBackend(admin as unknown as SpineRpcClient, 'the-exchange', 'cross-project'), { projectId: 'the-exchange', live: false });
  emit('another project cannot see it', (await foreign.get('BUDGET', b.id)) === null, 'the-exchange scope');

  const transfer = await media.liveTransferCheck(now);
  emit('private bucket round trip (upload, hash, sign, remove)', transfer.ok, transfer.steps.join(' → '));
}

await main().catch((e) => emit('unexpected error', false, (e as Error).message));
process.exit(failed ? 1 : 0);
