import type { VercelRequest } from '@vercel/node';
import { createServerSupabaseClient } from '../serverSupabase.js';
import {
  buildSignedRefreshCookieToken,
  refreshCookieExpiresAtUnix,
  SESSION_REFRESH_COOKIE_NAME,
  SESSION_REFRESH_COOKIE_MAX_AGE_SECONDS,
} from '../sessionRefreshCookie.js';
import {
  buildPlaywrightCaptureStorageState,
  buildSupabaseSessionLocalStorageValue,
  normalizeCaptureSiteOrigin,
  supabaseAuthStorageKeyFromUrl,
} from '../../../shared/site00-visual-reference/buildCaptureStorageState.js';

export type CaptureAuthBootstrapResult = {
  storageState: ReturnType<typeof buildPlaywrightCaptureStorageState>;
  storageStateJson: string;
  railwayVariables: {
    SITE00_CAPTURE_STORAGE_STATE_JSON: string;
    SITE00_CAPTURE_PRINCIPAL: 'PROJECT_OWNER';
    SITE00_CAPTURE_BASE_URL: string;
  };
  expiresAt: string;
  cookieExpiresAtUnix: number;
  principal: 'PROJECT_OWNER';
  authContextVersionSeed: string;
};

export type CaptureAuthBootstrapFailure = {
  status: 400 | 401 | 403 | 503;
  error: string;
  code: 'MISSING_REFRESH_TOKEN' | 'SESSION_MISMATCH' | 'SUPABASE_NOT_CONFIGURED' | 'MISSING_COOKIE_SECRET';
};

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

export async function buildCaptureAuthBootstrapForAdmin(params: {
  req: VercelRequest;
  adminUserId: string;
}): Promise<{ ok: true; result: CaptureAuthBootstrapResult } | { ok: false; failure: CaptureAuthBootstrapFailure }> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseAnon = process.env.SUPABASE_ANON_KEY?.trim();
  const cookieSecret = process.env.SESSION_COOKIE_SECRET?.trim();
  if (!supabaseUrl || !supabaseAnon) {
    return {
      ok: false,
      failure: {
        status: 503,
        error: 'Supabase not configured on API server',
        code: 'SUPABASE_NOT_CONFIGURED',
      },
    };
  }
  if (!cookieSecret) {
    return {
      ok: false,
      failure: {
        status: 503,
        error: 'SESSION_COOKIE_SECRET not configured on API server',
        code: 'MISSING_COOKIE_SECRET',
      },
    };
  }

  const body = parseBody(params.req);
  const refreshToken = typeof body?.refresh_token === 'string' ? body.refresh_token.trim() : '';
  if (!refreshToken) {
    return {
      ok: false,
      failure: {
        status: 400,
        error: 'Missing refresh_token — sign in on this device and try again',
        code: 'MISSING_REFRESH_TOKEN',
      },
    };
  }

  const supabase = createServerSupabaseClient(supabaseUrl, supabaseAnon);
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session || !data.user) {
    return {
      ok: false,
      failure: {
        status: 401,
        error: 'Session expired — sign out and sign in again, then retry export',
        code: 'SESSION_MISMATCH',
      },
    };
  }
  if (data.user.id !== params.adminUserId) {
    return {
      ok: false,
      failure: {
        status: 401,
        error: 'Session user mismatch',
        code: 'SESSION_MISMATCH',
      },
    };
  }

  const storageKey = supabaseAuthStorageKeyFromUrl(supabaseUrl);
  if (!storageKey) {
    return {
      ok: false,
      failure: {
        status: 503,
        error: 'Could not derive Supabase auth storage key',
        code: 'SUPABASE_NOT_CONFIGURED',
      },
    };
  }

  const baseUrl =
    process.env.SITE00_CAPTURE_BASE_URL?.trim() ||
    process.env.SITE00_PUBLIC_BASE_URL?.trim() ||
    'https://site00.com';
  const siteOrigin = normalizeCaptureSiteOrigin(baseUrl);
  const cookieExpiresAtUnix = refreshCookieExpiresAtUnix();
  const signedCookie = buildSignedRefreshCookieToken(
    { rt: data.session.refresh_token, uid: data.user.id, iat: Date.now() },
    cookieSecret,
  );
  const sessionJson = buildSupabaseSessionLocalStorageValue({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at ?? undefined,
    expires_in: data.session.expires_in ?? undefined,
    token_type: data.session.token_type,
    user: data.user,
  });
  const userJson = JSON.stringify(data.user);

  const storageState = buildPlaywrightCaptureStorageState({
    siteOrigin,
    sessionRefreshCookieName: SESSION_REFRESH_COOKIE_NAME,
    sessionRefreshCookieValue: signedCookie,
    cookieExpiresAtUnix,
    supabaseAuthStorageKey: storageKey,
    supabaseSessionJson: sessionJson,
    supabaseUserJson: userJson,
    secureCookies: siteOrigin.startsWith('https://'),
  });

  const storageStateJson = JSON.stringify(storageState);
  const expiresAt = new Date(cookieExpiresAtUnix * 1000).toISOString();

  return {
    ok: true,
    result: {
      storageState,
      storageStateJson,
      railwayVariables: {
        SITE00_CAPTURE_STORAGE_STATE_JSON: storageStateJson,
        SITE00_CAPTURE_PRINCIPAL: 'PROJECT_OWNER',
        SITE00_CAPTURE_BASE_URL: siteOrigin,
      },
      expiresAt,
      cookieExpiresAtUnix,
      principal: 'PROJECT_OWNER',
      authContextVersionSeed: storageStateJson.slice(0, 64),
    },
  };
}

export const CAPTURE_AUTH_BOOTSTRAP_COOKIE_TTL_DAYS = Math.floor(
  SESSION_REFRESH_COOKIE_MAX_AGE_SECONDS / (60 * 60 * 24),
);
