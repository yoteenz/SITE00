/**
 * Restart probe: a separate process opens the durable store from nothing and reports what it finds. Used by the dry
 * run and the durable-store tests to show records survive the writer's process.
 *
 *   npx tsx scripts/production/spineRestartProbe.ts <sandbox socket dir> <port> <projectId>
 */
import { spawn } from 'node:child_process';
import { sha256Hex } from '../../shared/site00-production-spine/hash.js';
import { SupabaseRpcBackend, type SpineRpcClient } from '../../shared/site00-production-spine/node/supabaseStore.js';
import { ScopedRecordStore, serializeRecord } from '../../shared/site00-production-spine/store.js';
import { STORED_KINDS } from '../../shared/site00-production-spine/types.js';
import { dollarQuote } from './pgSandbox.js';

const [dir, port, projectId] = process.argv.slice(2);
if (!dir || !port || !projectId) throw new Error('usage: spineRestartProbe <dir> <port> <projectId>');

const psql = (sql: string) =>
  new Promise<string>((resolve, reject) => {
    const p = spawn('psql', ['-X', '-q', '-t', '-A', '-h', dir, '-p', port, '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1']);
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (c) => (c === 0 ? resolve(out.trim()) : reject(new Error(err.trim()))));
    p.stdin.end(`set role service_role;\n${sql}\n`);
  });
const client: SpineRpcClient = {
  async rpc(fn, args) {
    const named = Object.entries(args).map(([k, v]) => `${k} => ${typeof v === 'string' ? dollarQuote(v) : `${dollarQuote(JSON.stringify(v))}::jsonb`}`).join(', ');
    try {
      return { data: JSON.parse(await psql(`select coalesce(to_jsonb(public.${fn}(${named}))::text, 'null');`)) as unknown, error: null };
    } catch (e) {
      return { data: null, error: { message: (e as Error).message } };
    }
  },
};
const store = new ScopedRecordStore(new SupabaseRpcBackend(client, projectId, 'restart probe'), { projectId, live: false });
const out: Record<string, string> = {};
for (const k of STORED_KINDS) for (const r of await store.list(k)) out[`${r.kind}/${r.id}`] = sha256Hex(serializeRecord(r));
console.log(JSON.stringify({ pid: process.pid, records: out }));
