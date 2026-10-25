import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { checkRevisions, ScopedRecordStore, type StoreBackend, type StoreOp, type StoreOptions } from '../store.js';
import { SpineError, type StoredKind } from '../types.js';

/**
 * Repository JSON backend (D-03): one file per record at `<root>/<KIND>/<id>.json`. A batch is checked against the
 * current revisions and written under an in-process lock, each file through a temp file and a rename. Development and
 * the read-only planning catalogue only: it is neither shared between server instances nor atomic across processes,
 * so it is never the production store (`durable` is false).
 */
const LOCKS = new Map<string, Promise<void>>();

export class JsonFileBackend implements StoreBackend {
  readonly durable = false;
  constructor(readonly root: string) {}

  /** Names the folder without exposing the server's filesystem layout. */
  get description() {
    const rel = path.relative(process.cwd(), path.resolve(this.root));
    return rel && !rel.startsWith('..') && !path.isAbsolute(rel) ? `repository JSON (${rel})` : 'JSON files in a temporary directory';
  }

  private file(kind: StoredKind, id: string) {
    if (!/^[A-Za-z0-9._:-]+$/.test(id) || id.includes('..')) throw new SpineError('STORE_PATH', `unsafe record id ${id}`);
    return path.join(this.root, kind, `${id.replace(/:/g, '_')}.json`);
  }

  async read(kind: StoredKind, id: string) {
    const f = this.file(kind, id);
    return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  }

  private writeFile(kind: StoredKind, id: string, text: string) {
    const f = this.file(kind, id);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const tmp = `${f}.tmp-${process.pid}-${randomBytes(4).toString('hex')}`;
    fs.writeFileSync(tmp, text, 'utf8');
    return () => fs.renameSync(tmp, f);
  }

  async commit(ops: StoreOp[]) {
    const root = path.resolve(this.root);
    const prev = LOCKS.get(root) ?? Promise.resolve();
    let release!: () => void;
    const mine = new Promise<void>((r) => (release = r));
    LOCKS.set(root, prev.then(() => mine));
    await prev;
    try {
      checkRevisions(ops, (k, id) => {
        const f = this.file(k, id);
        return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
      });
      const renames = ops.map((op) => this.writeFile(op.kind, op.id, op.text));
      for (const r of renames) r();
    } finally {
      release();
    }
  }

  async list(kind: StoredKind) {
    const dir = path.join(this.root, kind);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => (JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as { id: string }).id);
  }
}

export const jsonFileStore = (root: string, opts: StoreOptions) => new ScopedRecordStore(new JsonFileBackend(root), opts);
