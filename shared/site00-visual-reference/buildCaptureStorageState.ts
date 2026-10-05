/**
 * Build Playwright-compatible storage state for authenticated SITE 00 visual capture.
 * Used by founder bootstrap export and Railway SITE00_CAPTURE_STORAGE_STATE_* env vars.
 */

export type PlaywrightStorageStateCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Lax' | 'Strict' | 'None';
};

export type PlaywrightStorageState = {
  cookies: PlaywrightStorageStateCookie[];
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
};

export function supabaseAuthStorageKeyFromUrl(supabaseUrl: string): string | null {
  try {
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

export function normalizeCaptureSiteOrigin(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  if (!trimmed) return 'https://site00.com';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function captureCookieDomainFromOrigin(origin: string): string {
  try {
    return new URL(origin).hostname;
  } catch {
    return 'site00.com';
  }
}

export function buildSupabaseSessionLocalStorageValue(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user?: unknown;
}): string {
  return JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600),
    expires_in: session.expires_in ?? 3600,
    token_type: session.token_type ?? 'bearer',
    user: session.user ?? null,
  });
}

export function buildPlaywrightCaptureStorageState(params: {
  siteOrigin: string;
  sessionRefreshCookieName: string;
  sessionRefreshCookieValue: string;
  cookieExpiresAtUnix: number;
  supabaseAuthStorageKey: string;
  supabaseSessionJson: string;
  supabaseUserJson?: string | null;
  secureCookies?: boolean;
}): PlaywrightStorageState {
  const origin = normalizeCaptureSiteOrigin(params.siteOrigin);
  const domain = captureCookieDomainFromOrigin(origin);
  const secure = params.secureCookies ?? origin.startsWith('https://');

  const localStorage: Array<{ name: string; value: string }> = [
    { name: params.supabaseAuthStorageKey, value: params.supabaseSessionJson },
  ];
  if (params.supabaseUserJson) {
    localStorage.push({
      name: `${params.supabaseAuthStorageKey}-user`,
      value: params.supabaseUserJson,
    });
  }

  return {
    cookies: [
      {
        name: params.sessionRefreshCookieName,
        value: params.sessionRefreshCookieValue,
        domain,
        path: '/',
        expires: params.cookieExpiresAtUnix,
        httpOnly: true,
        secure,
        sameSite: 'Lax',
      },
    ],
    origins: [{ origin, localStorage }],
  };
}
