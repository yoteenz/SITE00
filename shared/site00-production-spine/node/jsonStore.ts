import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ScopedRecordStore, type StoreBackend, type StoreOptions } from '../store.js';
import { SpineError, type StoredKind } from '../types.js';

/**
 * Repository JSON backend (D-03): one file per record at `<root>/<KIND>/<id>.json`, written atomically (temp file,
 * then rename). Temporary pilot persistence for a single operator; not the multi-user production database.
 */
export class JsonFileBackend implements StoreBackend {
  constructor(readonly root: string) {}

  get description() {
    return `repository JSON at ${this.root}`;
  }

  private file(kind: StoredKind, id: string) {
    if (!/^[A-Za-z0-9._:-]+$/.test(id) || id.includes('..')) throw new SpineError('STORE_PATH', `unsafe record id ${id}`);
    return path.join(this.root, kind, `${id.replace(/:/g, '_')}.json`);
  }

  async read(kind: StoredKind, id: string) {
    const f = this.file(kind, id);
    return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  }

  async write(kind: StoredKind, id: string, text: string) {
    const f = this.file(kind, id);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const tmp = `${f}.tmp-${process.pid}-${randomBytes(4).toString('hex')}`;
    fs.writeFileSync(tmp, text, 'utf8');
    fs.renameSync(tmp, f);
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
