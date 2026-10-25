import { ScopedRecordStore, type StoreBackend, type StoreOp, type StoreOptions } from '../store.js';
import { SpineError, type StoredKind } from '../types.js';

/**
 * Durable record store on Supabase Postgres (migration 20261026100000_site00_production_spine_records.sql). Every
 * call goes through the service-role-only functions site00_spine_read / _records / _list / _commit, so the database
 * enforces the same rules as the application: a batch commits atomically, each update is compare-and-set on its
 * revision, approval events are append-only, foreign keys reach only records of the same project, and a take or job
 * can reach APPROVED / AUTHORIZED only through a matching founder approval event.
 *
 * There is no fallback. If the database cannot be reached the call fails with STORE_UNAVAILABLE and nothing is kept in
 * memory in its place.
 */

export type RpcError = { message: string; code?: string; details?: string | null; hint?: string | null };
/** The slice of a supabase-js client this backend uses: `client.rpc(fn, args)`. */
export interface SpineRpcClient {
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: RpcError | null }>;
}

const PREFIX: Record<string, string> = {
  SPINE_CONFLICT: 'CONFLICT',
  SPINE_IMMUTABLE_RECORD: 'IMMUTABLE_RECORD',
  SPINE_FORBIDDEN: 'FORBIDDEN',
  SPINE_REFERENCE_NOT_FOUND: 'REFERENCE_NOT_FOUND',
  SPINE_KIND: 'SCHEMA_INVALID',
  SPINE_SCHEMA_INVALID: 'SCHEMA_INVALID',
};
const SQLSTATE: Record<string, string> = {
  '23505': 'CONFLICT', // unique violation: duplicate job, approval, ticket, operation or selection
  '23503': 'REFERENCE_NOT_FOUND', // foreign key: orphan take, asset without its job, unknown approval
  '23514': 'CONSTRAINT_VIOLATION', // check: provenance, hash, role-for-decision, status vocabulary
  '23502': 'CONSTRAINT_VIOLATION',
  '42501': 'STORE_FORBIDDEN', // the key in use is not service_role
  '42883': 'STORE_SCHEMA_MISSING', // function missing: migration not applied
  '42P01': 'STORE_SCHEMA_MISSING',
  PGRST202: 'STORE_SCHEMA_MISSING',
};

export function spineErrorFromRpc(fn: string, e: RpcError): SpineError {
  const prefix = /^(SPINE_[A-Z_]+):\s*/.exec(e.message);
  if (prefix && PREFIX[prefix[1]!]) return new SpineError(PREFIX[prefix[1]!]!, e.message.slice(prefix[0].length));
  const code = e.code ? SQLSTATE[e.code] : undefined;
  if (code) return new SpineError(code, `${fn}: ${e.message}`);
  return new SpineError('STORE_UNAVAILABLE', `${fn}: ${e.message}`);
}

export class SupabaseRpcBackend implements StoreBackend {
  readonly durable = true;
  constructor(
    private readonly client: SpineRpcClient,
    readonly projectId: string,
    readonly label: string,
  ) {}

  get description() {
    return `Supabase Postgres (${this.label})`;
  }

  private async call<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    let r: { data: unknown; error: RpcError | null };
    try {
      r = await this.client.rpc(fn, args);
    } catch (e) {
      throw new SpineError('STORE_UNAVAILABLE', `${fn}: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (r.error) throw spineErrorFromRpc(fn, r.error);
    return r.data as T;
  }

  async read(kind: StoredKind, id: string) {
    const rec = await this.call<unknown>('site00_spine_read', { p_kind: kind, p_project: this.projectId, p_id: id });
    return rec === null || rec === undefined ? null : JSON.stringify(rec);
  }

  async list(kind: StoredKind) {
    return (await this.call<string[] | null>('site00_spine_list', { p_kind: kind, p_project: this.projectId })) ?? [];
  }

  async readAll(kind: StoredKind) {
    return ((await this.call<unknown[] | null>('site00_spine_records', { p_kind: kind, p_project: this.projectId })) ?? []).map((r) => JSON.stringify(r));
  }

  async commit(ops: StoreOp[]) {
    for (const op of ops) {
      const rec = JSON.parse(op.text) as { projectId?: string };
      if (rec.projectId !== this.projectId) throw new SpineError('CROSS_PROJECT_DENIED', `${op.kind}/${op.id} is not ${this.projectId}`);
    }
    await this.call<number>('site00_spine_commit', { p_ops: ops.map((o) => ({ kind: o.kind, record: JSON.parse(o.text), expectedRevision: o.expectedRevision })) });
  }

  /** Confirms the schema is present and the key can use it, before the store is handed out. */
  async probe(): Promise<void> {
    await this.call('site00_spine_list', { p_kind: 'SHOT', p_project: this.projectId });
  }

  /** The caller's role on this project from site00_spine_members, or null when they are not a member. */
  async memberRole(userId: string): Promise<string | null> {
    return (await this.call<string | null>('site00_spine_member_role', { p_project: this.projectId, p_user: userId })) ?? null;
  }
}

export const supabaseRecordStore = (client: SpineRpcClient, label: string, opts: StoreOptions) => new ScopedRecordStore(new SupabaseRpcBackend(client, opts.projectId, label), opts);
