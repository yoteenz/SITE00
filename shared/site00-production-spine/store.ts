import { stableStringify } from './hash.js';
import { assertValidRecord } from './validate.js';
import { SPINE_SCHEMA_VERSION, STORED_KINDS, SpineError, TEST_FIXTURE, type AnyRecord, type RecordOf, type StoredKind } from './types.js';

/**
 * Record persistence (§20). Business logic talks to RecordStore only; where the bytes live is a Backend. The pilot
 * backend is repository JSON (D-03, temporary); a Supabase backend can replace it without touching callers.
 *
 * Every store is scoped to one project. It validates each record, refuses another project's records, refuses test
 * fixtures when live, never changes an approval, makes repeated identical writes no-ops, detects conflicting writes
 * by revision, and checks that every record a write points at exists in the same project.
 */

export interface StoreBackend {
  readonly description: string;
  read(kind: StoredKind, id: string): Promise<string | null>;
  write(kind: StoredKind, id: string, text: string): Promise<void>;
  list(kind: StoredKind): Promise<string[]>;
}

export type StoreOptions = { projectId: string; live: boolean; readOnly?: boolean | string };

export interface RecordStore {
  readonly projectId: string;
  readonly live: boolean;
  readonly description: string;
  /** Null when writes are allowed; otherwise why they are not. */
  readonly readOnlyReason: string | null;
  get<K extends StoredKind>(kind: K, id: string): Promise<RecordOf<K> | null>;
  list<K extends StoredKind>(kind: K): Promise<RecordOf<K>[]>;
  /** Writes a new record. The same record twice is a no-op; a different record under the same id is a conflict. */
  create<R extends AnyRecord>(rec: R): Promise<{ record: R; created: boolean }>;
  /** Replaces a record whose stored revision is `expectedRevision`; the result carries revision + 1. */
  update<R extends AnyRecord>(rec: R, expectedRevision: number): Promise<R>;
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

  private parse<K extends StoredKind>(kind: K, id: string, text: string): RecordOf<K> {
    const rec = JSON.parse(text) as AnyRecord;
    if (rec.kind !== kind || rec.id !== id) throw new SpineError('STORE_CORRUPT', `${kind}/${id} holds ${rec.kind}/${rec.id}`);
    if (rec.projectId !== this.projectId) throw new SpineError('CROSS_PROJECT_DENIED', `${kind}/${id} belongs to ${rec.projectId}, not ${this.projectId}`);
    if (rec.schemaVersion !== SPINE_SCHEMA_VERSION) throw new SpineError('SCHEMA_VERSION', `${kind}/${id} is schema v${rec.schemaVersion}; this build reads v${SPINE_SCHEMA_VERSION}`);
    return rec as RecordOf<K>;
  }

  async get<K extends StoredKind>(kind: K, id: string): Promise<RecordOf<K> | null> {
    const text = await this.backend.read(kind, id);
    return text === null ? null : this.parse(kind, id, text);
  }

  async list<K extends StoredKind>(kind: K): Promise<RecordOf<K>[]> {
    const ids = (await this.backend.list(kind)).sort();
    const out: RecordOf<K>[] = [];
    for (const id of ids) out.push((await this.get(kind, id))!);
    return out;
  }

  private async guard(rec: AnyRecord) {
    if (this.readOnlyReason) throw new SpineError('STORE_READ_ONLY', this.readOnlyReason);
    if (rec.projectId !== this.projectId) throw new SpineError('CROSS_PROJECT_DENIED', `${rec.kind}/${rec.id} is for ${rec.projectId}; this store holds ${this.projectId}`);
    if (this.live && rec.fixture === TEST_FIXTURE) throw new SpineError('FIXTURE_IN_LIVE_STORE', `${rec.kind}/${rec.id} is test data; the live catalogue refuses it`);
    if (!this.live && rec.fixture !== TEST_FIXTURE) throw new SpineError('FIXTURE_REQUIRED', `${rec.kind}/${rec.id}: a test store holds only records marked ${TEST_FIXTURE}`);
    assertValidRecord(rec);
    for (const [kind, id] of outgoing(rec)) {
      if (kind === rec.kind && id === rec.id) continue;
      if (!(await this.get(kind, id))) throw new SpineError('REFERENCE_NOT_FOUND', `${rec.kind}/${rec.id} → ${kind}/${id} does not exist in ${this.projectId}`);
    }
  }

  async create<R extends AnyRecord>(rec: R): Promise<{ record: R; created: boolean }> {
    const existing = (await this.get(rec.kind, rec.id)) as R | null;
    if (existing) {
      if (serializeRecord(existing) === serializeRecord(rec)) return { record: existing, created: false };
      throw new SpineError('CONFLICT', `${rec.kind}/${rec.id} already exists with different content`);
    }
    if (rec.revision !== 1) throw new SpineError('CONFLICT', `${rec.kind}/${rec.id}: a new record starts at revision 1`);
    await this.guard(rec);
    await this.backend.write(rec.kind, rec.id, serializeRecord(rec));
    return { record: rec, created: true };
  }

  async update<R extends AnyRecord>(rec: R, expectedRevision: number): Promise<R> {
    if (rec.kind === 'APPROVAL') throw new SpineError('IMMUTABLE_RECORD', `APPROVAL/${rec.id}: approvals are never changed; record a new decision`);
    const existing = await this.get(rec.kind, rec.id);
    if (!existing) throw new SpineError('NOT_FOUND', `${rec.kind}/${rec.id}`);
    if (existing.revision !== expectedRevision) throw new SpineError('CONFLICT', `${rec.kind}/${rec.id} is at revision ${existing.revision}, not ${expectedRevision}`);
    if (existing.createdAt !== rec.createdAt || existing.createdBy !== rec.createdBy || existing.fixture !== rec.fixture) throw new SpineError('CONFLICT', `${rec.kind}/${rec.id}: creation fields cannot change`);
    const next = { ...rec, revision: expectedRevision + 1 } as R;
    await this.guard(next);
    await this.backend.write(rec.kind, rec.id, serializeRecord(next));
    return next;
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

export class MemoryBackend implements StoreBackend {
  readonly description = 'in-memory (tests)';
  private readonly files = new Map<string, string>();
  async read(kind: StoredKind, id: string) {
    return this.files.get(`${kind}/${id}`) ?? null;
  }
  async write(kind: StoredKind, id: string, text: string) {
    this.files.set(`${kind}/${id}`, text);
  }
  async list(kind: StoredKind) {
    return [...this.files.keys()].filter((k) => k.startsWith(`${kind}/`)).map((k) => k.slice(kind.length + 1));
  }
}

export const memoryStore = (projectId: string, live = false) => new ScopedRecordStore(new MemoryBackend(), { projectId, live });
