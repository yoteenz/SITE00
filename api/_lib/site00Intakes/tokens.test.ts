import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetIntakeMemoryStore } from './memoryStore.js';
import { resetIntakeStoreModeCache } from './storeAdapter.js';
import { generateRawToken, hashToken, issueGuestAccessToken, resolveGuestAccessToken, revokeGuestAccessTokens } from './tokens.js';
import * as store from './storeAdapter.js';

describe('secure guest access tokens', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetIntakeMemoryStore();
    resetIntakeStoreModeCache();
  });

  it('generates cryptographically random raw tokens (never predictable/sequential)', () => {
    const a = generateRawToken();
    const b = generateRawToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });

  it('secure access token is generated on request', async () => {
    const issued = await issueGuestAccessToken('IDENTITY', 'intake-1', 'guest@example.com');
    expect(issued.rawToken).toBeTruthy();
    expect(issued.tokenId).toBeTruthy();
    expect(new Date(issued.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('raw token is never stored — only its hash is persisted', async () => {
    const issued = await issueGuestAccessToken('IDENTITY', 'intake-1', 'guest@example.com');
    const stored = await store.getAccessTokenByHash(hashToken(issued.rawToken));
    expect(stored).not.toBeNull();
    expect(stored?.tokenHash).not.toBe(issued.rawToken);
    expect(JSON.stringify(stored)).not.toContain(issued.rawToken);
  });

  it('token resolves to the correct intake', async () => {
    const issued = await issueGuestAccessToken('BUILDER', 'intake-42', 'guest@example.com');
    const resolution = await resolveGuestAccessToken(issued.rawToken);
    expect(resolution.ok).toBe(true);
    if (resolution.ok) {
      expect(resolution.token.intakeType).toBe('BUILDER');
      expect(resolution.token.intakeId).toBe('intake-42');
    }
  });

  it('expired token is denied', async () => {
    const issued = await issueGuestAccessToken('IDENTITY', 'intake-1', 'guest@example.com');
    const tokenRow = await store.getAccessTokenByHash(hashToken(issued.rawToken));
    await store.updateAccessToken(tokenRow!.id, { expiresAt: new Date(Date.now() - 1000).toISOString() });

    const resolution = await resolveGuestAccessToken(issued.rawToken);
    expect(resolution.ok).toBe(false);
    if (!resolution.ok) expect(resolution.reason).toBe('EXPIRED');
  });

  it('revoked token is denied', async () => {
    const issued = await issueGuestAccessToken('IDENTITY', 'intake-1', 'guest@example.com');
    await revokeGuestAccessTokens('IDENTITY', 'intake-1');

    const resolution = await resolveGuestAccessToken(issued.rawToken);
    expect(resolution.ok).toBe(false);
    if (!resolution.ok) expect(resolution.reason).toBe('REVOKED');
  });

  it('forged/unknown token is denied', async () => {
    const resolution = await resolveGuestAccessToken('a-completely-forged-token-value-that-was-never-issued');
    expect(resolution.ok).toBe(false);
    if (!resolution.ok) expect(resolution.reason).toBe('NOT_FOUND');
  });

  it('trivially short input is rejected without a store lookup (defensive)', async () => {
    const resolution = await resolveGuestAccessToken('short');
    expect(resolution.ok).toBe(false);
  });

  it('re-issuing a token safely rotates — prior token is revoked and replaced', async () => {
    const first = await issueGuestAccessToken('IDENTITY', 'intake-1', 'guest@example.com');
    const second = await issueGuestAccessToken('IDENTITY', 'intake-1', 'guest@example.com');

    const firstResolution = await resolveGuestAccessToken(first.rawToken);
    expect(firstResolution.ok).toBe(false);
    if (!firstResolution.ok) expect(firstResolution.reason).toBe('REVOKED');

    const secondResolution = await resolveGuestAccessToken(second.rawToken);
    expect(secondResolution.ok).toBe(true);
  });

  it('replay after resolution is still permitted (safe multi-use resume, not single-use)', async () => {
    const issued = await issueGuestAccessToken('IDENTITY', 'intake-1', 'guest@example.com');
    const first = await resolveGuestAccessToken(issued.rawToken);
    const second = await resolveGuestAccessToken(issued.rawToken);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
  });
});
