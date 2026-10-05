import {
  GROK_TWIN_TEST_A_ACCEPTED_EXT,
  GROK_TWIN_TEST_A_ACCEPTED_MIMES,
  GROK_TWIN_TEST_A_MAX_BYTES,
} from './constants.js';
import type { GrokDesignBenchMime } from './types.js';

export interface GrokReferenceUploadCandidate {
  filename: string;
  mime: string;
  byteLength: number;
}

export interface GrokReferenceUploadResult {
  ok: boolean;
  reason: string | null;
  mime: GrokDesignBenchMime | null;
}

const MIME_BY_EXT: Record<string, GrokDesignBenchMime> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

export function normalizeGrokReferenceExt(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

export function resolveGrokReferenceMime(filename: string, mime: string): GrokDesignBenchMime | null {
  const normalized = mime.toLowerCase();
  if ((GROK_TWIN_TEST_A_ACCEPTED_MIMES as readonly string[]).includes(normalized)) {
    return normalized as GrokDesignBenchMime;
  }
  return MIME_BY_EXT[normalizeGrokReferenceExt(filename)] ?? null;
}

export function validateGrokReferenceUpload(candidate: GrokReferenceUploadCandidate): GrokReferenceUploadResult {
  if (!candidate.filename.trim()) {
    return { ok: false, reason: 'Filename required', mime: null };
  }
  const ext = normalizeGrokReferenceExt(candidate.filename);
  if (!(GROK_TWIN_TEST_A_ACCEPTED_EXT as readonly string[]).includes(ext)) {
    return { ok: false, reason: 'Accepted: PNG JPG JPEG WEBP', mime: null };
  }
  const mime = resolveGrokReferenceMime(candidate.filename, candidate.mime);
  if (!mime) {
    return { ok: false, reason: 'Accepted: PNG JPG JPEG WEBP', mime: null };
  }
  if (!Number.isFinite(candidate.byteLength) || candidate.byteLength <= 0) {
    return { ok: false, reason: 'Empty file', mime: null };
  }
  if (candidate.byteLength > GROK_TWIN_TEST_A_MAX_BYTES) {
    return { ok: false, reason: 'File exceeds 18MB limit', mime: null };
  }
  return { ok: true, reason: null, mime };
}

export function formatAspectRatio(width: number, height: number): string {
  if (!width || !height) return '—';
  const g = gcd(Math.round(width), Math.round(height));
  return `${Math.round(width / g)}:${Math.round(height / g)}`;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}
