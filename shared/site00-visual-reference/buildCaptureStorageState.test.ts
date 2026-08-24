import { describe, expect, it } from 'vitest';
import {
  buildPlaywrightCaptureStorageState,
  buildSupabaseSessionLocalStorageValue,
  captureCookieDomainFromOrigin,
  normalizeCaptureSiteOrigin,
  supabaseAuthStorageKeyFromUrl,
} from './buildCaptureStorageState.js';

describe('buildCaptureStorageState', () => {
  it('derives Supabase auth storage key from project URL', () => {
    expect(supabaseAuthStorageKeyFromUrl('https://exampleprojectref.supabase.co')).toBe(
      'sb-exampleprojectref-auth-token',
    );
  });

  it('normalizes capture site origin', () => {
    expect(normalizeCaptureSiteOrigin('site00.com')).toBe('https://site00.com');
    expect(normalizeCaptureSiteOrigin('https://site00.com/')).toBe('https://site00.com');
  });

  it('builds Playwright storage state with HttpOnly session cookie and Supabase localStorage', () => {
    const sessionJson = buildSupabaseSessionLocalStorageValue({
      access_token: 'access-abc',
      refresh_token: 'refresh-xyz',
      expires_at: 1_700_000_000,
      expires_in: 3600,
      user: { id: 'user-1', email: 'founder@example.com' },
    });

    const state = buildPlaywrightCaptureStorageState({
      siteOrigin: 'https://site00.com',
      sessionRefreshCookieName: 'baw_session_rt',
      sessionRefreshCookieValue: 'signed-cookie-token',
      cookieExpiresAtUnix: 1_800_000_000,
      supabaseAuthStorageKey: 'sb-test-auth-token',
      supabaseSessionJson: sessionJson,
      supabaseUserJson: JSON.stringify({ id: 'user-1', email: 'founder@example.com' }),
    });

    expect(captureCookieDomainFromOrigin('https://site00.com')).toBe('site00.com');
    expect(state.cookies).toHaveLength(1);
    expect(state.cookies[0]).toMatchObject({
      name: 'baw_session_rt',
      value: 'signed-cookie-token',
      domain: 'site00.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    });
    expect(state.origins).toHaveLength(1);
    expect(state.origins[0].origin).toBe('https://site00.com');
    expect(state.origins[0].localStorage.map((e) => e.name)).toEqual([
      'sb-test-auth-token',
      'sb-test-auth-token-user',
    ]);
    expect(JSON.parse(state.origins[0].localStorage[0].value)).toMatchObject({
      access_token: 'access-abc',
      refresh_token: 'refresh-xyz',
    });
  });
});
