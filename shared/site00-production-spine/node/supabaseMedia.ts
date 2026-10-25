import { sha256Hex } from '../hash.js';
import { MAX_SIGNED_READ_SEC, parseStorageRef, storageRefFor, type MediaStore, type StoredMedia } from '../media.js';
import { SpineError } from '../types.js';

/**
 * Private Supabase Storage for production masters. The bucket must already exist and be private; this adapter never
 * creates or reconfigures buckets. Buckets the codebase creates public (STUDIO_ASSETS_BUCKET, default `live-preview`)
 * are refused by name as well.
 *
 * Live verification needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and an authenticated transfer test
 * (`liveTransferCheck`). Without them the adapter is untested against the real service.
 */

type Result<T> = Promise<{ data: T | null; error: { message: string } | null }>;
export interface StorageBucketApi {
  upload(path: string, body: Uint8Array, opts: { contentType: string; upsert: boolean }): Result<unknown>;
  download(path: string): Result<{ arrayBuffer(): Promise<ArrayBuffer> }>;
  createSignedUrl(path: string, expiresIn: number): Result<{ signedUrl: string }>;
  remove(paths: string[]): Result<unknown>;
}
export interface StorageClient {
  getBucket(id: string): Result<{ id: string; public: boolean }>;
  from(bucket: string): StorageBucketApi;
}

export const KNOWN_PUBLIC_BUCKETS = ['live-preview'];

export class SupabasePrivateMediaStore implements MediaStore {
  readonly adapter = 'SUPABASE_PRIVATE' as const;
  readonly live = true;
  private checked = false;
  constructor(
    private readonly storage: StorageClient,
    readonly bucket: string,
  ) {
    if (KNOWN_PUBLIC_BUCKETS.includes(bucket) || bucket === process.env.STUDIO_ASSETS_BUCKET?.trim()) throw new SpineError('PUBLIC_BUCKET_REFUSED', `${bucket} is a public asset bucket; production masters need a private one`);
  }

  /** Refuses to touch a bucket that is missing or public. */
  async assertPrivateBucket() {
    if (this.checked) return;
    const { data, error } = await this.storage.getBucket(this.bucket);
    if (error || !data) throw new SpineError('BUCKET_UNAVAILABLE', `${this.bucket}: ${error?.message ?? 'not found'}`);
    if (data.public) throw new SpineError('PUBLIC_BUCKET_REFUSED', `${this.bucket} is public`);
    this.checked = true;
  }

  private keyFor(ref: string) {
    const p = parseStorageRef(ref);
    if (p.adapter !== this.adapter || p.bucket !== this.bucket) throw new SpineError('STORAGE_REF', `${ref} is not held by this store`);
    return p.key;
  }

  async put({ projectId, bytes, mimeType }: { projectId: string; bytes: Uint8Array; mimeType: string }): Promise<StoredMedia> {
    await this.assertPrivateBucket();
    const sha256 = sha256Hex(bytes);
    const storageRef = storageRefFor(this.adapter, this.bucket, projectId, sha256, mimeType);
    const { error } = await this.storage.from(this.bucket).upload(this.keyFor(storageRef), bytes, { contentType: mimeType, upsert: false });
    // Content-addressed: an existing object under this key is the same bytes; verify() proves it.
    const created = !error;
    if (error && !/exists|duplicate/i.test(error.message)) throw new SpineError('MEDIA_UPLOAD_FAILED', error.message);
    return { storageRef, sha256, byteSize: bytes.byteLength, mimeType, created };
  }

  async read(storageRef: string) {
    await this.assertPrivateBucket();
    const { data, error } = await this.storage.from(this.bucket).download(this.keyFor(storageRef));
    if (error || !data) throw new SpineError('MEDIA_NOT_FOUND', `${storageRef}: ${error?.message ?? 'empty'}`);
    return new Uint8Array(await data.arrayBuffer());
  }

  async verify(storageRef: string, sha256: string) {
    try {
      const actual = sha256Hex(await this.read(storageRef));
      return { ok: actual === sha256 && parseStorageRef(storageRef).sha256 === sha256, actual };
    } catch {
      return { ok: false, actual: null };
    }
  }

  async signRead(storageRef: string, opts: { projectId: string; ttlSec: number; now: string }) {
    await this.assertPrivateBucket();
    if (parseStorageRef(storageRef).projectId !== opts.projectId) throw new SpineError('CROSS_PROJECT_DENIED', storageRef);
    const ttl = Math.min(Math.max(1, Math.floor(opts.ttlSec)), MAX_SIGNED_READ_SEC);
    const { data, error } = await this.storage.from(this.bucket).createSignedUrl(this.keyFor(storageRef), ttl);
    if (error || !data) throw new SpineError('SIGNED_READ_FAILED', error?.message ?? 'no url');
    return { url: data.signedUrl, expiresAt: new Date(Date.parse(opts.now) + ttl * 1000).toISOString() };
  }

  /** Authenticated round trip: upload a probe, read it back, compare hashes, sign a read, delete the probe. */
  async liveTransferCheck(now: string): Promise<{ ok: boolean; steps: string[] }> {
    const steps: string[] = [];
    const probe = new TextEncoder().encode(`site00 production-spine transfer check ${now}`);
    const ref = storageRefFor(this.adapter, this.bucket, 'site00-transfer-check', sha256Hex(probe), 'image/png');
    try {
      await this.assertPrivateBucket();
      steps.push('bucket private');
      await this.put({ projectId: 'site00-transfer-check', bytes: probe, mimeType: 'image/png' });
      steps.push('uploaded');
      const v = await this.verify(ref, sha256Hex(probe));
      steps.push(v.ok ? 'read back, hash matches' : 'read back, HASH MISMATCH');
      await this.signRead(ref, { projectId: 'site00-transfer-check', ttlSec: 60, now });
      steps.push('signed read issued');
      await this.storage.from(this.bucket).remove([this.keyFor(ref)]);
      steps.push('probe removed');
      return { ok: v.ok, steps };
    } catch (e) {
      steps.push(`failed: ${(e as Error).message}`);
      return { ok: false, steps };
    }
  }
}
