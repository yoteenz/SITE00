import { stableStringify } from './hash.js';
import { assertValidRecord } from './validate.js';
import { SPINE_SCHEMA_VERSION, STORED_KINDS, SpineError, TEST_FIXTURE, type AnyRecord, type RecordOf, type StoredKind } from './types.js';

/**
 * Record persistence (§05, §12, §13). Business logic talks to RecordStore only; where the bytes live is a Backend:
 *   SupabaseRpcBackend  durable, multi-user (node/supabaseStore.ts): the production and staging store
 *   JsonFileBackend     repository JSON (node/jsonStore.ts): development, and the read-only planning catalogue
 *   MemoryBackend       tests only
 *
 * Every store is scoped to one project. It validates each record, refuses another project's records, refuses test
 * fixtures when live, never changes an approval, makes a repeated identical create a no-op, and checks that every
 * record a write points at exists in the same project. A batch (`apply`) commits all of its writes or none, and each
 * update succeeds only if the stored revision is the one the caller read (compare-and-set), so two writers racing on
 * one record cannot both win.
 */

/** One write in a batch. expectedRevision null: insert, refused if the id exists. Otherwise: replace that revision. */
export type StoreOp = { kind: StoredKind; id: string; text: string; expectedRevision: number | null };

export interface StoreBackend {
  readonly description: string;
  /** True when records survive a process restart and are shared by every server instance. */
  readonly durable: boolean;
  read(kind: StoredKind, id: string): Promise<string | null>;
  list(kind: StoredKind): Promise<string[]>;
  /** Optional bulk read: every record of a kind, in id order. */
  readAll?(kind: StoredKind): Promise<string[]>;
  /** Applies every op or none. Throws SpineError CONFLICT when an insert's id exists or an update's revision moved. */
  commit(ops: StoreOp[]): Promise<void>;
}

export type StoreOptions = { projectId: string; live: boolean; readOnly?: boolean | string };

export type WriteOp = { create: AnyRecord } | { update: AnyRecord; expectedRevision: number };

export interface RecordStore {
  readonly projectId: string;
  readonly live: boolean;
  readonly durable: boolean;
  readonly description: string;
  /** Null when writes are allowed; otherwise why they are not. */
  readonly readOnlyReason: string | null;
  get<K extends StoredKind>(kind: K, id: string): Promise<RecordOf<K> | null>;
  list<K extends StoredKind>(kind: K): Promise<RecordOf<K>[]>;
  /** Writes a new record. The same record twice is a no-op; a different record under the same id is a conflict. */
  create<R extends AnyRecord>(rec: R): Promise<{ record: R; created: boolean }>;
  /** Replaces a record whose stored revision is `expectedRevision`; the result carries revision + 1. */
  update<R extends AnyRecord>(rec: R, expectedRevision: number): Promise<R>;
  /** Several creates and updates, committed together or not at all. Returns the records as stored, in op order. */
  apply(ops: WriteOp[]): Promise<AnyRecord[]>;
}

/** Deterministic bytes: sorted keys, two-space indent, trailing newline. */
export const serializeRecord = (rec: AnyRecord): string => `${stableStringify(rec, 2)}\n`;

export const RETENTION: Record<StoredKind, { keep: 'PERMANENT' | 'WHILE_REFERENCED'; deletion: string }> = {
  APPROVAL: { keep: 'PERMANENT', deletion: 'Never. A reversed decision is a new approval record.' },
  BUDGET: { keep: 'PERMANENT', deletion: 'Never. A closed budget stays as the spend record.' },
  GENERATION_JOB: { keep: 'PERMANENT', deletion: 'Never. Failed and canceled jobs are the retry and spend history.' },
  SHOT: { keep: 'PERMANENT', deletion: 'Never while the release exists.' },
  TAKE: { keep: 'PERMANENT', deletion: 'Never automatically. A rejected take keeps its record; archiving its media is a founder decision.' },
  ASSET: { keep: 'WHILE_REFERENCED', deletion: 'Media of a rejected take may be archived by founder decision after 90 days; the record and hash stay.' },
  CONTINUITY_REFERENCE: { keep: 'PERMANENT', deletion: 'Never. An invalidated reference is marked INVALIDATED, not removed.' },
};

type Refs = Array<[StoredKind, string]>;

/** Records a write points at. They must exist, in the same project, before the write is accepted. */
function outgoing(rec: AnyRecord): Refs {
  switch (rec.kind) {
    case 'SHOT':
      return [['BUDGET', rec.budgetId]];
    case 'GENERATION_JOB':
      return [
        ['SHOT', rec.shotId],
        ...(rec.founderApprovalRef ? ([['APPROVAL', rec.founderApprovalRef]] as Refs) : []),
        ...rec.inputs.filter((i) => i.assetId).map((i): [StoredKind, string] => ['ASSET', i.assetId!]),
        ...rec.outputAssetIds.map((a): [StoredKind, string] => ['ASSET', a]),
      ];
    case 'TAKE':
      return [['SHOT', rec.shotId], ['GENERATION_JOB', rec.jobId], ['ASSET', rec.assetId], ...rec.approvalIds.map((a): [StoredKind, string] => ['APPROVAL', a])];
    case 'ASSET':
      return [
        ...(rec.lineage.sourceJobId ? ([['GENERATION_JOB', rec.lineage.sourceJobId]] as Refs) : []),
        ...(rec.lineage.sourceTakeId ? ([['TAKE', rec.lineage.sourceTakeId]] as Refs) : []),
        ...(rec.lineage.derivedFromAssetId ? ([['ASSET', rec.lineage.derivedFromAssetId]] as Refs) : []),
      ];
    case 'APPROVAL':
      return [[rec.subject.kind, rec.subject.id], ...(rec.budgetId ? ([['BUDGET', rec.budgetId]] as Refs) : []), ...(rec.supersedes ? ([['APPROVAL', rec.supersedes]] as Refs) : [])];
    case 'BUDGET':
      return rec.approvalId ? [['APPROVAL', rec.approvalId]] : [];
    case 'CONTINUITY_REFERENCE':
      return [['SHOT', rec.shotId], ['TAKE', rec.takeId], ['ASSET', rec.sourceAssetId], ['ASSET', rec.assetId]];
  }
}

/** References checked only by a full scan, because they point both ways (a shot lists its jobs, a job names its shot). */
function deferred(rec: AnyRecord): Refs {
  if (rec.kind === 'SHOT') return rec.jobIds.map((j): [StoredKind, string] => ['GENERATION_JOB', j]);
  if (rec.kind === 'BUDGET') return rec.shotIds.map((s): [StoredKind, string] => ['SHOT', s]);
  return [];
}

export class ScopedRecordStore implements RecordStore {
  readonly projectId: string;
  readonly live: boolean;
  readonly readOnlyReason: string | null;

  constructor(
    private readonly backend: StoreBackend,
    opts: StoreOptions,
  ) {
    this.projectId = opts.projectId;
    this.live = opts.live;
    this.readOnlyReason = opts.readOnly ? (typeof opts.readOnly === 'string' ? opts.readOnly : 'store opened read-only') : null;
  }

  get description() {
    return this.backend.description;
  }

  get durable() {
    return this.backend.durable;
  }

  private parse<K extends StoredKind>(kind: K, id: string | null, text: string): RecordOf<K> {
    const rec = JSON.parse(text) as AnyRecord;
    if (rec.kind !== kind || (id !== null && rec.id !== id)) throw new SpineError('STORE_CORRUPT', `${kind}/${id} holds ${rec.kind}/${rec.id}`);
    if (rec.projectId !== this.projectId) throw new SpineError('CROSS_PROJECT_DENIED', `${kind}/${rec.id} belongs to ${rec.projectId}, not ${this.projectId}`);
    if (rec.schemaVersion !== SPINE_SCHEMA_VERSION) throw new SpineError('SCHEMA_VERSION', `${kind}/${rec.id} is schema v${rec.schemaVersion}; this build reads v${SPINE_SCHEMA_VERSION}`);
    return rec as RecordOf<K>;
  }

  async get<K extends StoredKind>(kind: K, id: string): Promise<RecordOf<K> | null> {
    const text = await this.backend.read(kind, id);
    return text === null ? null : this.parse(kind, id, text);
  }

  async list<K extends StoredKind>(kind: K): Promise<RecordOf<K>[]> {
    if (this.backend.readAll) return (await this.backend.readAll(kind)).map((t) => this.parse(kind, null, t)).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const ids = (await this.backend.list(kind)).sort();
    const out: RecordOf<K>[] = [];
    for (const id of ids) out.push((await this.get(kind, id))!);
    return out;
  }

  private check(rec: AnyRecord) {
    if (this.readOnlyReason) throw new SpineError('STORE_READ_ONLY', this.readOnlyReason);
    if (rec.projectId !== this.projectId) throw new SpineError('CROSS_PROJECT_DENIED', `${rec.kind}/${rec.id} is for ${rec.projectId}; this store holds ${this.projectId}`);
    if (this.live && rec.fixture === TEST_FIXTURE) throw new SpineError('FIXTURE_IN_LIVE_STORE', `${rec.kind}/${rec.id} is test data; the live catalogue refuses it`);
    if (!this.live && rec.fixture !== TEST_FIXTURE) throw new SpineError('FIXTURE_REQUIRED', `${rec.kind}/${rec.id}: a test store holds only records marked ${TEST_FIXTURE}`);
    assertValidRecord(rec);
  }

  async create<R extends AnyRecord>(rec: R): Promise<{ record: R; created: boolean }> {
    const existing = (await this.get(rec.kind, rec.id)) as R | null;
    if (existing && serializeRecord(existing) === serializeRecord(rec)) return { record: existing, created: false };
    const [record] = await this.apply([{ create: rec }]);
    return { record: record as R, created: true };
  }

  async update<R extends AnyRecord>(rec: R, expectedRevision: number): Promise<R> {
    return (await this.apply([{ update: rec, expectedRevision }]))[0] as R;
  }

  async apply(ops: WriteOp[]): Promise<AnyRecord[]> {
    if (!ops.length) return [];
    const pending = new Map<string, AnyRecord>();
    const out: AnyRecord[] = [];
    const commit: StoreOp[] = [];
    const key = (k: StoredKind, id: string) => `${k}/${id}`;
    const lookup = async (k: StoredKind, id: string) => pending.get(key(k, id)) ?? (await this.get(k, id));
    for (const op of ops) {
      if ('create' in op) {
        const rec = op.create;
        const existing = await lookup(rec.kind, rec.id);
        if (existing) {
          if (!pending.has(key(rec.kind, rec.id)) && serializeRecord(existing) === serializeRecord(rec)) {
            out.push(existing);
            continue;
          }
          throw new SpineError('CONFLICT', `${rec.kind}/${rec.id} already exists with different content`);
        }
        if (rec.revision !== 1) throw new SpineError('CONFLICT', `${rec.kind}/${rec.id}: a new record starts at revision 1`);
        this.check(rec);
        pending.set(key(rec.kind, rec.id), rec);
        commit.push({ kind: rec.kind, id: rec.id, text: serializeRecord(rec), expectedRevision: null });
        out.push(rec);
      } else {
        const rec = op.update;
        if (rec.kind === 'APPROVAL') throw new SpineError('IMMUTABLE_RECORD', `APPROVAL/${rec.id}: approvals are never changed; record a new decision`);
        const existing = await lookup(rec.kind, rec.id);
        if (!existing) throw new SpineError('NOT_FOUND', `${rec.kind}/${rec.id}`);
        if (existing.revision !== op.expectedRevision) throw new SpineError('CONFLICT', `${rec.kind}/${rec.id} is at revision ${existing.revision}, not ${op.expectedRevision}`);
        if (existing.createdAt !== rec.createdAt || existing.createdBy !== rec.createdBy || existing.fixture !== rec.fixture) throw new SpineError('CONFLICT', `${rec.kind}/${rec.id}: creation fields cannot change`);
        const next = { ...rec, revision: op.expectedRevision + 1 } as AnyRecord;
        this.check(next);
        const k = key(rec.kind, rec.id);
        const prior = commit.findIndex((c) => key(c.kind, c.id) === k);
        // Two writes to one record in a batch fold into one, so the backend sees a single insert or update.
        if (prior >= 0) commit[prior] = { ...commit[prior]!, text: serializeRecord(next) };
        else commit.push({ kind: rec.kind, id: rec.id, text: serializeRecord(next), expectedRevision: op.expectedRevision });
        pending.set(k, next);
        out.push(next);
      }
    }
    for (const rec of pending.values())
      for (const [kind, id] of outgoing(rec)) {
        if (kind === rec.kind && id === rec.id) continue;
        if (!(await lookup(kind, id))) throw new SpineError('REFERENCE_NOT_FOUND', `${rec.kind}/${rec.id} → ${kind}/${id} does not exist in ${this.projectId}`);
      }
    if (commit.length) await this.backend.commit(commit);
    return out;
  }
}

/** Full scan: schema, project and every reference, including the two-way ones writes cannot check. */
export async function verifyStoreIntegrity(store: RecordStore): Promise<string[]> {
  const out: string[] = [];
  const all: AnyRecord[] = [];
  for (const kind of STORED_KINDS) {
    try {
      all.push(...((await store.list(kind)) as AnyRecord[]));
    } catch (e) {
      out.push(String((e as Error).message));
    }
  }
  const has = new Set(all.map((r) => `${r.kind}/${r.id}`));
  for (const r of all) {
    try {
      assertValidRecord(r);
    } catch (e) {
      out.push(`${r.kind}/${r.id}: ${(e as Error).message}`);
    }
    for (const [kind, id] of [...outgoing(r), ...deferred(r)]) if (!has.has(`${kind}/${id}`)) out.push(`${r.kind}/${r.id} → ${kind}/${id} is missing`);
  }
  return out;
}

/** Checks a batch against current revisions; shared by the in-process backends. */
export function checkRevisions(ops: StoreOp[], current: (kind: StoredKind, id: string) => string | null): void {
  for (const op of ops) {
    const text = current(op.kind, op.id);
    if (op.expectedRevision === null) {
      if (text !== null) throw new SpineError('CONFLICT', `${op.kind}/${op.id} already exists`);
    } else {
      if (text === null) throw new SpineError('NOT_FOUND', `${op.kind}/${op.id}`);
      const rev = (JSON.parse(text) as { revision: number }).revision;
      if (rev !== op.expectedRevision) throw new SpineError('CONFLICT', `${op.kind}/${op.id} is at revision ${rev}, not ${op.expectedRevision}`);
    }
  }
}

export class MemoryBackend implements StoreBackend {
  readonly description = 'in-memory (tests)';
  readonly durable = false;
  private readonly files = new Map<string, string>();
  async read(kind: StoredKind, id: string) {
    return this.files.get(`${kind}/${id}`) ?? null;
  }
  async list(kind: StoredKind) {
    return [...this.files.keys()].filter((k) => k.startsWith(`${kind}/`)).map((k) => k.slice(kind.length + 1));
  }
  async commit(ops: StoreOp[]) {
    // Check and write with no await between them: atomic within this process.
    checkRevisions(ops, (k, id) => this.files.get(`${k}/${id}`) ?? null);
    for (const op of ops) this.files.set(`${op.kind}/${op.id}`, op.text);
  }
}

export const memoryStore = (projectId: string, live = false) => new ScopedRecordStore(new MemoryBackend(), { projectId, live });
