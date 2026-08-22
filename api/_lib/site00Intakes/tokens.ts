/**
 * Secure guest access tokens. Raw tokens are cryptographically random and NEVER persisted —
 * only a sha256 hash is stored. The raw token is returned once (API response / email payload)
 * and can never be recovered from the database afterward.
 */
import { randomBytes, createHash } from 'crypto';
import * as store from './storeAdapter.js';
import type { IntakeType } from '../../../shared/site00-intakes/types.js';
import type { AccessTokenRecord } from './types.js';

const GUEST_ACCESS_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function generateRawToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export type IssuedGuestAccess = {
  rawToken: string;
  tokenId: string;
  expiresAt: string;
};

/**
 * Issues a fresh guest-access token for an intake, rotating (revoking) any prior active
 * GUEST_ACCESS tokens for the same intake so there is always at most one live token per
 * intake — a "safe rotation" replay-mitigation rather than strict single-use, since a guest
 * legitimately needs to reopen their resume link more than once before expiry.
 */
export async function issueGuestAccessToken(
  intakeType: IntakeType,
  intakeId: string,
  guestEmail: string,
): Promise<IssuedGuestAccess> {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + GUEST_ACCESS_TOKEN_TTL_MS).toISOString();

  const created = await store.createAccessToken({
    intakeType,
    intakeId,
    tokenHash,
    purpose: 'GUEST_ACCESS',
    guestEmail,
    expiresAt,
  });

  const priorActive = await store.listActiveTokensForIntake(intakeType, intakeId, 'GUEST_ACCESS');
  await Promise.all(
    priorActive
      .filter((t) => t.id !== created.id)
      .map((t) =>
        store.updateAccessToken(t.id, { revokedAt: new Date().toISOString(), replacedByTokenId: created.id }),
      ),
  );

  return { rawToken, tokenId: created.id, expiresAt };
}

export type TokenResolution =
  | { ok: true; token: AccessTokenRecord }
  | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' };

/** Resolves a raw token to its record. Never trusts the caller with intake type/id — those come from the resolved row. */
export async function resolveGuestAccessToken(rawToken: string): Promise<TokenResolution> {
  if (!rawToken || rawToken.trim().length < 16) return { ok: false, reason: 'NOT_FOUND' };
  const tokenHash = hashToken(rawToken.trim());
  const token = await store.getAccessTokenByHash(tokenHash);
  if (!token) return { ok: false, reason: 'NOT_FOUND' };
  if (token.revokedAt) return { ok: false, reason: 'REVOKED' };
  if (new Date(token.expiresAt).getTime() < Date.now()) return { ok: false, reason: 'EXPIRED' };

  await store.updateAccessToken(token.id, {
    lastUsedAt: new Date().toISOString(),
    usedCount: token.usedCount + 1,
  });

  return { ok: true, token };
}

export async function revokeGuestAccessTokens(intakeType: IntakeType, intakeId: string): Promise<void> {
  const active = await store.listActiveTokensForIntake(intakeType, intakeId, 'GUEST_ACCESS');
  await Promise.all(active.map((t) => store.updateAccessToken(t.id, { revokedAt: new Date().toISOString() })));
}
