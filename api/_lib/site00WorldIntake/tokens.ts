/**
 * World intake token utilities — hash only persisted.
 */

import { createHash, randomBytes } from 'node:crypto';

export function generateRawIntakeToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashIntakeToken(rawToken: string): string {
  return createHash('sha256').update(rawToken.trim()).digest('hex');
}

export type TokenResolution =
  | { ok: true; tokenHash: string }
  | { ok: false; reason: 'NOT_FOUND' | 'INVALID' };

export function validateRawTokenFormat(rawToken: string): TokenResolution {
  if (!rawToken || rawToken.trim().length < 16) return { ok: false, reason: 'INVALID' };
  return { ok: true, tokenHash: hashIntakeToken(rawToken) };
}
