import { describe, expect, it } from 'vitest';
import {
  SITE00_FOUNDER_READINESS_PATH,
  SITE00_STAGING_PUBLIC_ORIGIN,
  isSite00PasswordRecoveryHash,
  site00AuthCallbackUrl,
  site00SafeReturnPath,
} from './site00AuthRedirect';

const STAGING = SITE00_STAGING_PUBLIC_ORIGIN;

describe('site00AuthCallbackUrl', () => {
  it('returns the staging sign-in route and keeps the founder workspace', () => {
    const url = site00AuthCallbackUrl(STAGING, SITE00_FOUNDER_READINESS_PATH);
    expect(url).toBe(
      'https://carefree-luck-staging.up.railway.app/origin/sign-in?returnTo=%2Fadmin%2Fsite00%2Ffoundation-readiness',
    );
    expect(url).not.toContain('localhost');
    expect(url).not.toContain('api.site00.com');
    expect(url).not.toContain('hyycomvcaqxxvyrfupes');
  });

  it('refuses a missing origin and the Supabase default localhost:3000', () => {
    expect(() => site00AuthCallbackUrl('', SITE00_FOUNDER_READINESS_PATH)).toThrow('SITE00_AUTH_ORIGIN_REQUIRED');
    expect(() => site00AuthCallbackUrl('http://localhost:3000', SITE00_FOUNDER_READINESS_PATH)).toThrow(
      'SITE00_AUTH_ORIGIN_REQUIRED',
    );
  });

  it('drops off-site return paths back to the founder workspace', () => {
    expect(site00SafeReturnPath('https://evil.example/admin')).toBe(SITE00_FOUNDER_READINESS_PATH);
    expect(site00SafeReturnPath('//evil.example')).toBe(SITE00_FOUNDER_READINESS_PATH);
    const url = site00AuthCallbackUrl(STAGING, 'https://evil.example');
    expect(url).toContain(encodeURIComponent(SITE00_FOUNDER_READINESS_PATH));
  });

  it('recognizes a Supabase recovery hash', () => {
    expect(isSite00PasswordRecoveryHash('#access_token=abc&type=recovery')).toBe(true);
    expect(isSite00PasswordRecoveryHash('#access_token=abc&type=signup')).toBe(false);
  });
});
