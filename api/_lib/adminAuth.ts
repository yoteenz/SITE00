/**
 * Admin-only API guard. Verifies the request has a valid Supabase session and the user's email is in the admin list.
 */
import type { VercelRequest } from '@vercel/node';
import { getAuthUser } from './auth.js';

/** Same as `FOUNDER_PRIVILEGED_ADMIN_EMAIL` in `src/utils/adminAuth.ts` — Fal NOIR live preview routes use this only. */
export const FOUNDER_PRIVILEGED_ADMIN_EMAIL = 'kateenaarmstrong@gmail.com';

const DEFAULT_ADMIN_EMAILS = [
  'admin@frontalslayer.com',
  'kateena.armstrong@frontalslayer.com',
  'kateenaarmstrong@gmail.com',
];

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  if (raw.trim()) {
    return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return DEFAULT_ADMIN_EMAILS;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const emailLower = (email ?? '').trim().toLowerCase();
  if (!emailLower) return false;
  return getAdminEmails().includes(emailLower);
}

export type AdminAuthFailure = {
  status: 401 | 403 | 503;
  error: string;
  code: 'MISSING_TOKEN' | 'INVALID_TOKEN' | 'NOT_ADMIN' | 'SUPABASE_NOT_CONFIGURED';
};

/** Structured admin auth check — distinguishes missing session (401) from non-admin email (403). */
export async function resolveAdminAuth(
  req: VercelRequest
): Promise<
  | { ok: true; user: { id: string; email: string; accessToken: string } }
  | { ok: false; failure: AdminAuthFailure }
> {
  if (!process.env.SUPABASE_URL?.trim() || !process.env.SUPABASE_ANON_KEY?.trim()) {
    return {
      ok: false,
      failure: {
        status: 503,
        error: 'Server not configured',
        code: 'SUPABASE_NOT_CONFIGURED',
      },
    };
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return {
      ok: false,
      failure: {
        status: 401,
        error: 'Sign in required',
        code: 'MISSING_TOKEN',
      },
    };
  }

  const user = await getAuthUser(req);
  if (!user) {
    return {
      ok: false,
      failure: {
        status: 401,
        error: 'Session expired or invalid',
        code: 'INVALID_TOKEN',
      },
    };
  }

  const adminEmails = getAdminEmails();
  const emailLower = (user.email || '').trim().toLowerCase();
  if (!adminEmails.includes(emailLower)) {
    return {
      ok: false,
      failure: {
        status: 403,
        error: 'Admin access denied',
        code: 'NOT_ADMIN',
      },
    };
  }

  return { ok: true, user };
}

/** Returns the authenticated user if they are an admin, otherwise null. */
export async function requireAdmin(
  req: VercelRequest
): Promise<{ id: string; email: string; accessToken: string } | null> {
  const result = await resolveAdminAuth(req);
  return result.ok ? result.user : null;
}

/** Valid session + founder Gmail only. Use for expensive Fal NOIR preview endpoints so other admins cannot invoke them. */
export async function requireAdminFounder(
  req: VercelRequest
): Promise<{ id: string; email: string; accessToken: string } | null> {
  const user = await getAuthUser(req);
  if (!user) return null;
  const emailLower = (user.email || '').trim().toLowerCase();
  if (emailLower !== FOUNDER_PRIVILEGED_ADMIN_EMAIL) return null;
  return user;
}
