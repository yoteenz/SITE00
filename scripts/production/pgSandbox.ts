import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * A throwaway local PostgreSQL cluster shaped like a Supabase project, for testing migrations and the durable record
 * store without touching any live project. It creates the anon / authenticated / service_role roles with Supabase's
 * default grants, stubs auth.users, auth.uid() (from request.jwt.claim.sub) and storage.buckets, and applies the
 * migrations it is given. Nothing here can reach a network database: it connects only through its own socket dir.
 *
 * Needs the PostgreSQL server binaries (initdb, pg_ctl). Where they are missing, pgServerBin() returns null and callers
 * report the database checks as BLOCKED rather than passing them.
 */

export type SqlRole = 'postgres' | 'service_role' | 'authenticated' | 'anon';
export type SqlOptions = { role?: SqlRole; userId?: string | null };

export type PgSandbox = {
  readonly dir: string;
  readonly port: number;
  readonly description: string;
  /** Runs SQL as the given role; returns unaligned, tuples-only output. Throws with the server's message on error. */
  sql(text: string, opts?: SqlOptions): Promise<string>;
  sqlSync(text: string, opts?: SqlOptions): string;
  applyFile(file: string): void;
  stop(): void;
};

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

export function pgServerBin(): string | null {
  const fromEnv = process.env.PGBIN;
  const candidates = fromEnv ? [fromEnv] : fs.existsSync('/usr/lib/postgresql') ? fs.readdirSync('/usr/lib/postgresql').sort((a, b) => Number(b) - Number(a)).map((v) => `/usr/lib/postgresql/${v}/bin`) : [];
  for (const c of candidates) if (fs.existsSync(path.join(c, 'initdb')) && fs.existsSync(path.join(c, 'pg_ctl'))) return c;
  return null;
}

const asRoot = typeof process.getuid === 'function' && process.getuid() === 0;

function runAsOwner(cmd: string[], cwd: string) {
  const r = asRoot ? spawnSync('su', ['postgres', '-s', '/bin/sh', '-c', cmd.map((c) => `'${c.replace(/'/g, `'\\''`)}'`).join(' ')], { cwd, encoding: 'utf8' }) : spawnSync(cmd[0]!, cmd.slice(1), { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd[0]} failed: ${r.stderr || r.stdout}`);
}

/** Supabase-like roles, grants and the auth / storage stubs the migrations reference. */
export const SUPABASE_BOOTSTRAP_SQL = `
create extension if not exists pgcrypto;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create schema storage;
create table storage.buckets (id text primary key, name text not null, public boolean not null default false, file_size_limit bigint, allowed_mime_types text[], created_at timestamptz not null default now());
`;

/** The migrations the record spine needs, in order: the managed-project registry, then the spine itself. */
export const SPINE_MIGRATIONS = ['supabase/migrations/20260826123000_site00_design_control_plane_bridge.sql', 'supabase/migrations/20261026100000_site00_production_spine_records.sql'];

const preamble = (opts: SqlOptions = {}) => {
  const role = opts.role ?? 'postgres';
  const lines = ['\\set ON_ERROR_STOP 1', '\\set VERBOSITY verbose'];
  if (role !== 'postgres') lines.push(`set role ${role};`);
  if (opts.userId) lines.push(`select set_config('request.jwt.claim.sub', '${opts.userId.replace(/[^0-9a-f-]/gi, '')}', false) \\g /dev/null`);
  return lines.join('\n');
};

export function startPgSandbox(opts: { migrations?: string[]; bootstrap?: string } = {}): PgSandbox {
  const bin = pgServerBin();
  if (!bin) throw new Error('BLOCKED: no local PostgreSQL server binaries (initdb, pg_ctl)');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spine-pg-'));
  if (asRoot) spawnSync('chown', ['postgres', dir]);
  const port = 56000 + (randomBytes(2).readUInt16BE(0) % 2000);
  runAsOwner([path.join(bin, 'initdb'), '-D', path.join(dir, 'data'), '-A', 'trust', '-U', 'postgres'], dir);
  runAsOwner([path.join(bin, 'pg_ctl'), '-D', path.join(dir, 'data'), '-o', `-p ${port} -k ${dir} -c listen_addresses=''`, '-l', path.join(dir, 'log'), '-w', 'start'], dir);
  const base = ['-X', '-q', '-t', '-A', '-h', dir, '-p', String(port), '-U', 'postgres', '-d', 'postgres'];
  const fail = (stderr: string) => {
    const m = /ERROR:\s+(?:([0-9A-Z]{5}):\s+)?([\s\S]*?)(?:\n(?:DETAIL|HINT|CONTEXT|LINE|LOCATION|QUERY)|$)/.exec(stderr);
    return Object.assign(new Error((m?.[2] ?? stderr).trim()), { code: m?.[1] });
  };
  const sandbox: PgSandbox = {
    dir,
    port,
    description: `throwaway PostgreSQL ${path.basename(path.dirname(bin))} at ${dir} (port ${port}, socket only)`,
    sql(text, o) {
      return new Promise((resolve, reject) => {
        const p = spawn('psql', base, { stdio: ['pipe', 'pipe', 'pipe'] });
        let out = '';
        let err = '';
        p.stdout.on('data', (d) => (out += d));
        p.stderr.on('data', (d) => (err += d));
        p.on('close', (code) => (code === 0 ? resolve(out.trim()) : reject(fail(err))));
        p.stdin.end(`${preamble(o)}\n${text}\n`);
      });
    },
    sqlSync(text, o) {
      const r = spawnSync('psql', base, { input: `${preamble(o)}\n${text}\n`, encoding: 'utf8' });
      if (r.status !== 0) throw fail(r.stderr);
      return r.stdout.trim();
    },
    applyFile(file) {
      const r = spawnSync('psql', [...base, '-v', 'ON_ERROR_STOP=1', '-f', path.isAbsolute(file) ? file : path.join(ROOT, file)], { encoding: 'utf8' });
      if (r.status !== 0) throw new Error(`${file}: ${r.stderr.trim()}`);
    },
    stop() {
      try {
        runAsOwner([path.join(bin, 'pg_ctl'), '-D', path.join(dir, 'data'), '-m', 'immediate', 'stop'], dir);
      } catch {
        /* already stopped */
      }
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
  try {
    sandbox.sqlSync(opts.bootstrap ?? SUPABASE_BOOTSTRAP_SQL);
    for (const m of opts.migrations ?? SPINE_MIGRATIONS) sandbox.applyFile(m);
  } catch (e) {
    sandbox.stop();
    throw e;
  }
  return sandbox;
}

/** A literal no record body can close early: dollar-quoted with a random tag. */
export function dollarQuote(text: string): string {
  let tag: string;
  do tag = `$q${randomBytes(6).toString('hex')}$`;
  while (text.includes(tag));
  return `${tag}${text}${tag}`;
}

/**
 * A supabase-js-shaped RPC client over the sandbox, so SupabaseRpcBackend runs unchanged against a real Postgres.
 * Each call is its own session (like a PostgREST request) under the given role.
 */
export function sandboxRpcClient(sb: PgSandbox, opts: SqlOptions = { role: 'service_role' }) {
  const lit = (v: unknown) => (v === null || v === undefined ? 'null' : typeof v === 'string' ? dollarQuote(v) : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `${dollarQuote(JSON.stringify(v))}::jsonb`);
  return {
    calls: 0,
    async rpc(fn: string, args: Record<string, unknown>) {
      this.calls++;
      if (!/^[a-z0-9_]+$/.test(fn)) return { data: null, error: { message: `bad function ${fn}` } };
      const named = Object.entries(args).map(([k, v]) => `${k.replace(/[^a-z0-9_]/g, '')} => ${lit(v)}`).join(', ');
      try {
        const out = await sb.sql(`select coalesce(to_jsonb(public.${fn}(${named}))::text, 'null');`, opts);
        return { data: JSON.parse(out) as unknown, error: null };
      } catch (e) {
        return { data: null, error: { message: (e as Error).message, code: (e as { code?: string }).code } };
      }
    },
  };
}
