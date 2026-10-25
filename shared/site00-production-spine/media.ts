import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { sha256Hex } from './hash.js';
import { SpineError, type MediaAdapterId } from './types.js';

/**
 * Private media storage (§21). Masters are content-addressed (`spine-media://<adapter>/<bucket>/<project>/<sha256>.<ext>`),
 * verified by re-reading and hashing, and read only through short-lived signed reads scoped to their project.
 * Nothing here returns a permanent public URL, and a provider's temporary URL is never the master.
 */

export type StoredMedia = { storageRef: string; sha256: string; byteSize: number; mimeType: string; created: boolean };
export type SignedRead = { url: string; expiresAt: string };

export const MAX_SIGNED_READ_SEC = 900;

export interface MediaStore {
  readonly adapter: MediaAdapterId;
  /** True when this store holds production masters; a test store holds fixtures only. */
  readonly live: boolean;
  put(input: { projectId: string; bytes: Uint8Array; mimeType: string }): Promise<StoredMedia>;
  /** Server-side read of the stored copy (never the provider's). */
  read(storageRef: string): Promise<Uint8Array>;
  verify(storageRef: string, sha256: string): Promise<{ ok: boolean; actual: string | null }>;
  signRead(storageRef: string, opts: { projectId: string; ttlSec: number; now: string }): Promise<SignedRead>;
}

const EXT: Record<string, string> = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export function mediaExtension(mimeType: string): string {
  const ext = EXT[mimeType];
  if (!ext) throw new SpineError('MEDIA_TYPE', `${mimeType} is not a production media type`);
  return ext;
}

export type ParsedRef = { adapter: MediaAdapterId; bucket: string; projectId: string; sha256: string; ext: string; key: string };

export function parseStorageRef(ref: string): ParsedRef {
  const m = /^spine-media:\/\/(MEMORY_TEST|LOCAL_PRIVATE|SUPABASE_PRIVATE)\/([a-z0-9-]+)\/([a-z0-9-]+)\/([0-9a-f]{64})\.([a-z0-9]+)$/.exec(ref);
  if (!m) throw new SpineError('STORAGE_REF', `not a spine media reference: ${ref}`);
  const [, adapter, bucket, projectId, sha256, ext] = m;
  return { adapter: adapter as MediaAdapterId, bucket, projectId, sha256, ext, key: `${projectId}/${sha256}.${ext}` };
}

export const storageRefFor = (adapter: MediaAdapterId, bucket: string, projectId: string, sha256: string, mimeType: string) => `spine-media://${adapter}/${bucket}/${projectId}/${sha256}.${mediaExtension(mimeType)}`;

/* ── signed reads served by the spine API (memory and local adapters) ─────────────────────────────── */

export class MediaSigner {
  private readonly key: Buffer;
  constructor(secret: string | null, readonly endpoint = '/api/site00/production-spine') {
    if (secret !== null && secret.length < 32) throw new SpineError('MEDIA_SIGNING', 'the media signing secret must be at least 32 characters');
    this.key = secret === null ? randomBytes(32) : Buffer.from(secret, 'utf8');
  }

  private mac(projectId: string, ref: string, exp: number) {
    return createHmac('sha256', this.key).update(`${projectId}\n${ref}\n${exp}`).digest('hex');
  }

  sign(ref: string, opts: { projectId: string; ttlSec: number; now: string }): SignedRead {
    const parsed = parseStorageRef(ref);
    if (parsed.projectId !== opts.projectId) throw new SpineError('CROSS_PROJECT_DENIED', `${ref} belongs to ${parsed.projectId}`);
    if (!(opts.ttlSec > 0 && opts.ttlSec <= MAX_SIGNED_READ_SEC)) throw new SpineError('SIGNED_READ_TTL', `a signed read lasts 1–${MAX_SIGNED_READ_SEC} s`);
    const exp = Math.floor(Date.parse(opts.now) / 1000) + Math.floor(opts.ttlSec);
    const q = new URLSearchParams({ action: 'media', project: opts.projectId, ref, exp: String(exp), sig: this.mac(opts.projectId, ref, exp) });
    return { url: `${this.endpoint}?${q.toString()}`, expiresAt: new Date(exp * 1000).toISOString() };
  }

  /** Returns the storage reference a valid, unexpired signature grants, or throws. */
  check(params: { project?: string; ref?: string; exp?: string; sig?: string }, now: string): string {
    const { project, ref, exp, sig } = params;
    if (!project || !ref || !exp || !sig) throw new SpineError('SIGNED_READ_INVALID', 'missing signed-read parameters');
    const e = Number(exp);
    const nowSec = Math.floor(Date.parse(now) / 1000);
    if (!Number.isInteger(e) || e <= nowSec) throw new SpineError('SIGNED_READ_EXPIRED', 'this media link has expired');
    if (e - nowSec > MAX_SIGNED_READ_SEC) throw new SpineError('SIGNED_READ_INVALID', 'signed read lasts too long');
    const want = Buffer.from(this.mac(project, ref, e), 'hex');
    const got = Buffer.from(sig, 'hex');
    if (want.length !== got.length || !timingSafeEqual(want, got)) throw new SpineError('SIGNED_READ_INVALID', 'bad signature');
    if (parseStorageRef(ref).projectId !== project) throw new SpineError('CROSS_PROJECT_DENIED', `${ref} is not ${project} media`);
    return ref;
  }
}

/** Content-addressed bytes in memory. Test fixtures only: it is never live. */
export class MemoryMediaStore implements MediaStore {
  readonly adapter = 'MEMORY_TEST' as const;
  readonly live = false;
  private readonly blobs = new Map<string, Uint8Array>();
  constructor(
    readonly signer = new MediaSigner(null),
    readonly bucket = 'test-fixtures',
  ) {}

  async put({ projectId, bytes, mimeType }: { projectId: string; bytes: Uint8Array; mimeType: string }): Promise<StoredMedia> {
    const sha256 = sha256Hex(bytes);
    const storageRef = storageRefFor(this.adapter, this.bucket, projectId, sha256, mimeType);
    const created = !this.blobs.has(storageRef);
    if (created) this.blobs.set(storageRef, new Uint8Array(bytes));
    return { storageRef, sha256, byteSize: bytes.byteLength, mimeType, created };
  }

  async read(storageRef: string) {
    const b = this.blobs.get(storageRef);
    if (!b) throw new SpineError('MEDIA_NOT_FOUND', storageRef);
    return new Uint8Array(b);
  }

  async verify(storageRef: string, sha256: string) {
    const b = this.blobs.get(storageRef);
    const actual = b ? sha256Hex(b) : null;
    return { ok: actual === sha256 && parseStorageRef(storageRef).sha256 === sha256, actual };
  }

  async signRead(storageRef: string, opts: { projectId: string; ttlSec: number; now: string }) {
    if (!this.blobs.has(storageRef)) throw new SpineError('MEDIA_NOT_FOUND', storageRef);
    return this.signer.sign(storageRef, opts);
  }

  /** Test hook: corrupts a stored copy so verification can be shown to fail. */
  corruptForTest(storageRef: string) {
    const b = this.blobs.get(storageRef);
    if (b) b[0] = b[0]! ^ 0xff;
  }
}
