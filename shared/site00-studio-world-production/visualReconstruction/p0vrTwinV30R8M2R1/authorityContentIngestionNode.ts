import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

export function hashAuthorityBytes(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

export function readAuthorityBytesFromPublicUri(uri: string): { bytes: Buffer; byteLength: number } | null {
  const rel = uri.replace(/^\//, '');
  const abs = `${process.cwd()}/public/${rel}`;
  if (!existsSync(abs)) return null;
  const bytes = readFileSync(abs);
  return { bytes, byteLength: bytes.length };
}
