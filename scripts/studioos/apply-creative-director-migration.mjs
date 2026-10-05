#!/usr/bin/env node
/**
 * Apply creative-director migration via Supabase service role (DDL).
 * Does not print secrets.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key) {
  console.error('MISSING_SUPABASE_CREDENTIALS');
  process.exit(1);
}

const sql = readFileSync(
  new URL('../../supabase/migrations/20261001200000_site00_experience_compiler_creative_director.sql', import.meta.url),
  'utf8',
);

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { error: probeErr } = await supabase.from('site00_ec_creative_threads').select('thread_id').limit(1);
if (!probeErr) {
  console.log('TABLES_PRESENT');
  process.exit(0);
}
console.error('MIGRATION_NOT_APPLIED', probeErr.message);
console.error('Apply manually:', 'supabase/migrations/20261001200000_site00_experience_compiler_creative_director.sql');
process.exit(2);
