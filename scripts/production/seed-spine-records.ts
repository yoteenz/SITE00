/**
 * Seeds THE EXCHANGE's SH01 planning records (budget, shot, three jobs: no approvals, nothing authorized) from the
 * repository catalogue into the durable Supabase store. Founder-run, once, after the migration is deployed to the
 * target. Idempotent: an identical record is a no-op; a different record under the same id stops the run.
 *
 *   SITE00_SPINE_SEED_TARGET=STAGING|PRODUCTION SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     npx tsx scripts/production/seed-spine-records.ts [--dry-run]
 *
 * PRODUCTION also needs SITE00_PRODUCTION_SPINE_DEPLOYMENT=FOUNDER_APPROVED, the same switch the API checks.
 */
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import { jsonFileStore } from '../../shared/site00-production-spine/node/jsonStore.js';
import { SupabaseRpcBackend, type SpineRpcClient } from '../../shared/site00-production-spine/node/supabaseStore.js';
import { EXCHANGE_PROJECT_ID, EXCHANGE_RECORDS_DIR } from '../../shared/site00-production-spine/projects/theExchange.js';
import { ScopedRecordStore, serializeRecord, verifyStoreIntegrity } from '../../shared/site00-production-spine/store.js';

const target = process.env.SITE00_SPINE_SEED_TARGET;
const dryRun = process.argv.includes('--dry-run');
if (target !== 'STAGING' && target !== 'PRODUCTION') throw new Error('Set SITE00_SPINE_SEED_TARGET to STAGING or PRODUCTION.');
if (target === 'PRODUCTION' && process.env.SITE00_PRODUCTION_SPINE_DEPLOYMENT !== 'FOUNDER_APPROVED') throw new Error('Production seeding needs SITE00_PRODUCTION_SPINE_DEPLOYMENT=FOUNDER_APPROVED.');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');

const source = jsonFileStore(path.join(process.cwd(), EXCHANGE_RECORDS_DIR), { projectId: EXCHANGE_PROJECT_ID, live: true, readOnly: 'seed source' });
const problems = await verifyStoreIntegrity(source);
if (problems.length) throw new Error(`repository catalogue is inconsistent:\n${problems.join('\n')}`);
const dest = new ScopedRecordStore(new SupabaseRpcBackend(createClient(url, key, { auth: { persistSession: false } }) as unknown as SpineRpcClient, EXCHANGE_PROJECT_ID, target), { projectId: EXCHANGE_PROJECT_ID, live: true });

// Dependency order: a shot names its budget, a job names its shot.
for (const kind of ['BUDGET', 'SHOT', 'GENERATION_JOB'] as const) {
  for (const rec of await source.list(kind)) {
    const existing = await dest.get(kind, rec.id);
    if (existing && serializeRecord(existing) === serializeRecord(rec)) {
      console.log(JSON.stringify({ kind, id: rec.id, result: 'ALREADY_PRESENT' }));
      continue;
    }
    if (existing) throw new Error(`${kind}/${rec.id} already exists in ${target} with different content (revision ${existing.revision}); not overwritten`);
    if (!dryRun) await dest.create(rec);
    console.log(JSON.stringify({ kind, id: rec.id, result: dryRun ? 'WOULD_CREATE' : 'CREATED' }));
  }
}
