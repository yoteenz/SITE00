/**
 * F16 upload guard (metadata-only build). Validates before any future blob upload wiring.
 */
export type UploadGuardResult = { ok: true } | { ok: false; code: string; message: string };

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
]);

export function sanitizeUploadFilename(name: string): string {
  const base = name.replace(/\\/g, '/').split('/').pop() ?? 'file';
  return base.replace(/[^\w.\-()+ ]/g, '_').slice(0, 180);
}

export function validateRecordUpload(file: { name: string; type: string; size: number }): UploadGuardResult {
  if (!file.name.trim()) return { ok: false, code: 'EMPTY_NAME', message: 'FILE NAME REQUIRED' };
  if (file.size <= 0) return { ok: false, code: 'EMPTY_FILE', message: 'FILE IS EMPTY' };
  if (file.size > MAX_BYTES) return { ok: false, code: 'TOO_LARGE', message: 'FILE EXCEEDS SIZE LIMIT' };
  const raw = file.name.replace(/\\/g, '/');
  if (raw.includes('..')) return { ok: false, code: 'PATH_TRAVERSAL', message: 'INVALID FILE NAME' };
  if (!sanitizeUploadFilename(file.name).trim()) return { ok: false, code: 'INVALID_NAME', message: 'INVALID FILE NAME' };
  const mime = (file.type || '').toLowerCase();
  if (mime && !ALLOWED_MIME.has(mime)) return { ok: false, code: 'MIME_BLOCKED', message: 'FILE TYPE NOT ALLOWED' };
  return { ok: true };
}
