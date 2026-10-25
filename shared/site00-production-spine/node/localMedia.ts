import fs from 'node:fs';
import path from 'node:path';
import { sha256Hex } from '../hash.js';
import { MediaSigner, parseStorageRef, storageRefFor, type MediaStore, type StoredMedia } from '../media.js';
import { SpineError } from '../types.js';

/**
 * Private media on the local filesystem, content-addressed under a root that must lie outside the repository (large
 * media is never committed). Files are owner-only. Reads go through the spine API's signed, expiring links.
 * Suitable for development and the agent-session pilot; it is not durable production storage.
 */
export class LocalPrivateMediaStore implements MediaStore {
  readonly adapter = 'LOCAL_PRIVATE' as const;
  constructor(
    private readonly root: string,
    opts: { repoRoot: string; live: boolean; signer: MediaSigner; bucket?: string },
  ) {
    const abs = path.resolve(root);
    const repo = path.resolve(opts.repoRoot);
    if (abs === repo || abs.startsWith(`${repo}${path.sep}`)) throw new SpineError('MEDIA_ROOT_IN_REPOSITORY', `${abs} is inside the repository; production media never lives there`);
    this.live = opts.live;
    this.signer = opts.signer;
    this.bucket = opts.bucket ?? (opts.live ? 'production-masters' : 'test-fixtures');
  }
  readonly live: boolean;
  readonly signer: MediaSigner;
  readonly bucket: string;

  private fileFor(ref: string) {
    const p = parseStorageRef(ref);
    if (p.adapter !== this.adapter || p.bucket !== this.bucket) throw new SpineError('STORAGE_REF', `${ref} is not held by this store`);
    return path.join(this.root, p.bucket, p.key);
  }

  async put({ projectId, bytes, mimeType }: { projectId: string; bytes: Uint8Array; mimeType: string }): Promise<StoredMedia> {
    const sha256 = sha256Hex(bytes);
    const storageRef = storageRefFor(this.adapter, this.bucket, projectId, sha256, mimeType);
    const f = this.fileFor(storageRef);
    const created = !fs.existsSync(f);
    if (created) {
      fs.mkdirSync(path.dirname(f), { recursive: true, mode: 0o700 });
      fs.writeFileSync(`${f}.part`, bytes, { mode: 0o600 });
      fs.renameSync(`${f}.part`, f);
    }
    return { storageRef, sha256, byteSize: bytes.byteLength, mimeType, created };
  }

  async read(storageRef: string) {
    const f = this.fileFor(storageRef);
    if (!fs.existsSync(f)) throw new SpineError('MEDIA_NOT_FOUND', storageRef);
    return new Uint8Array(fs.readFileSync(f));
  }

  async verify(storageRef: string, sha256: string) {
    const f = this.fileFor(storageRef);
    const actual = fs.existsSync(f) ? sha256Hex(fs.readFileSync(f)) : null;
    return { ok: actual === sha256 && parseStorageRef(storageRef).sha256 === sha256, actual };
  }

  async signRead(storageRef: string, opts: { projectId: string; ttlSec: number; now: string }) {
    if (!fs.existsSync(this.fileFor(storageRef))) throw new SpineError('MEDIA_NOT_FOUND', storageRef);
    return this.signer.sign(storageRef, opts);
  }
}
