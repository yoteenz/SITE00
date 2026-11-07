/**
 * Production JURNL auth via Supabase Auth (the existing supported stack; JURNL never stores passwords).
 * Never uses design-preview seed accounts.
 *
 * Email links: Supabase sends verification / recovery links that return to this app. With the default templates the
 * session arrives in the URL and supabase-js picks it up (detectSessionInUrl); a template that sends `token_hash` is
 * verified with verifyOtp. Delivery depends on the project's configured email provider (SMTP) — it is not proven by
 * these code paths alone.
 */
import { getSupabase, isSupabaseUserEmailConfirmed, signOutIfSessionEmailUnconfirmed } from '../../../../utils/supabase';
import type { AuthErrorCode, JurnlAccount, JurnlAuthAdapter, JurnlSession, SocialProvider } from './adapters';

/** Maps Supabase Auth errors to JURNL codes. Messages / codes are matched, never shown raw to the user. */
export function mapAuthError(message: string, status?: number, code?: string): AuthErrorCode {
  const m = message.toLowerCase();
  const c = (code ?? '').toLowerCase();
  if (status === 429 || c.includes('rate_limit') || m.includes('rate limit') || m.includes('too many')) return 'RATE_LIMITED';
  if (c === 'email_not_confirmed' || m.includes('email not confirmed')) return 'EMAIL_NOT_VERIFIED';
  if (c === 'invalid_credentials' || m.includes('invalid login') || m.includes('invalid credentials')) return 'INCORRECT_PASSWORD';
  if (c === 'user_already_exists' || c === 'email_exists' || m.includes('already registered') || m.includes('already exists')) return 'EMAIL_IN_USE';
  if (c === 'weak_password' || m.includes('password should') || m.includes('weak password')) return 'WEAK_PASSWORD';
  if (c === 'otp_expired' || m.includes('expired') || m.includes('invalid') && m.includes('token')) return 'INVALID_LINK';
  if (m.includes('network') || m.includes('fetch') || m.includes('timeout')) return 'NETWORK';
  return 'NOT_CONFIGURED';
}

const errOf = (e: { message: string; status?: number; code?: string }) => mapAuthError(e.message, e.status, e.code);

function accountFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }): JurnlAccount {
  const meta = user.user_metadata ?? {};
  const firstName = String(meta.first_name ?? meta.firstName ?? 'JURNL').trim().toUpperCase() || 'JURNL';
  const lastName = String(meta.last_name ?? meta.lastName ?? 'USER').trim().toUpperCase() || 'USER';
  return {
    firstName,
    lastName,
    email: (user.email ?? '').trim().toUpperCase(),
    emailVerified: Boolean((user as { email_confirmed_at?: string }).email_confirmed_at),
  };
}

export type SupabaseAuthAdapterOptions = {
  /** Absolute app base, e.g. https://site00.com/jurnl/app — links in emails return under it. */
  appBaseUrl?: string;
  apiBase?: string;
};

function appBase(opts: SupabaseAuthAdapterOptions): string | undefined {
  if (opts.appBaseUrl) return opts.appBaseUrl.replace(/\/$/, '');
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/jurnl/app`;
}

export function createSupabaseJurnlAuthAdapter(opts: SupabaseAuthAdapterOptions = {}): JurnlAuthAdapter {
  const client = () => getSupabase();
  const base = () => appBase(opts);

  return {
    kind: 'SUPABASE' as const,
    signUp: async (input) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const redirect = base();
      const { data, error } = await sb.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: { data: { first_name: input.firstName, last_name: input.lastName }, ...(redirect ? { emailRedirectTo: `${redirect}/entry/verify-email` } : {}) },
      });
      if (error) return { ok: false, code: errOf(error) };
      if (!data.user) return { ok: false, code: 'NETWORK' };
      // With email confirmation on, Supabase answers an existing address with a user that has no identities
      // (it does not reveal the account exists by error). JURNL treats that as EMAIL_IN_USE.
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) return { ok: false, code: 'EMAIL_IN_USE' };
      return { ok: true, value: accountFromUser(data.user) };
    },
    signIn: async (email, password) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) return { ok: false, code: errOf(error) };
      if (!data.user) return { ok: false, code: 'INCORRECT_PASSWORD' };
      if (!isSupabaseUserEmailConfirmed(data.user)) {
        await signOutIfSessionEmailUnconfirmed(sb, data.session, { clearAppAuth: false });
        return { ok: false, code: 'EMAIL_NOT_VERIFIED' };
      }
      return { ok: true, value: accountFromUser(data.user) };
    },
    resendVerification: async (email) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const redirect = base();
      const { error } = await sb.auth.resend({ type: 'signup', email: email.trim().toLowerCase(), ...(redirect ? { options: { emailRedirectTo: `${redirect}/entry/verify-email` } } : {}) });
      return error ? { ok: false, code: errOf(error) } : { ok: true, value: true };
    },
    changeEmail: async () => ({ ok: false, code: 'NOT_CONFIGURED' }),
    /** `link` is a Supabase `token_hash` (custom template) — verified by Supabase, never locally. */
    confirmEmailLink: async (_email, link) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      if (!link) return { ok: false, code: 'INVALID_LINK' };
      const { error } = await sb.auth.verifyOtp({ type: 'email', token_hash: link });
      return error ? { ok: false, code: errOf(error) === 'NOT_CONFIGURED' ? 'INVALID_LINK' : errOf(error) } : { ok: true, value: true };
    },
    requestPasswordReset: async (email) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const redirect = base();
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), redirect ? { redirectTo: `${redirect}/entry/new-password` } : undefined);
      // Same answer whether or not the address has an account (no account enumeration), except throttling.
      if (error && errOf(error) === 'RATE_LIMITED') return { ok: false, code: 'RATE_LIMITED' };
      if (error && errOf(error) === 'NETWORK') return { ok: false, code: 'NETWORK' };
      return { ok: true, value: true };
    },
    /** The reset link must have produced a recovery session (URL session or `token_hash`); otherwise the link is invalid. */
    validateResetToken: async (token) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      if (token) {
        const { error } = await sb.auth.verifyOtp({ type: 'recovery', token_hash: token });
        if (error) return { ok: false, code: 'INVALID_LINK' };
        return { ok: true, value: true };
      }
      const { data } = await sb.auth.getSession();
      return data.session ? { ok: true, value: true } : { ok: false, code: 'INVALID_LINK' };
    },
    resetPassword: async (_token, password) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const { error } = await sb.auth.updateUser({ password });
      return error ? { ok: false, code: errOf(error) } : { ok: true, value: true };
    },
    changePassword: async (email, currentPassword, nextPassword) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const check = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: currentPassword });
      if (check.error) return { ok: false, code: errOf(check.error) };
      const { error } = await sb.auth.updateUser({ password: nextPassword });
      return error ? { ok: false, code: errOf(error) } : { ok: true, value: true };
    },
    social: async (_provider: SocialProvider) => ({ ok: false, code: 'PROVIDER_NOT_CONFIGURED' }),
    /** Server-side deletion: bank access is revoked first; the account is deleted only if every step succeeds. */
    deleteAccount: async () => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const { data } = await sb.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return { ok: false, code: 'NOT_CONFIGURED' };
      try {
        const res = await fetch(`${(opts.apiBase ?? '').replace(/\/$/, '')}/api/jurnl/account-delete`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: '{}' });
        if (!res.ok) return { ok: false, code: res.status === 429 ? 'RATE_LIMITED' : 'NOT_CONFIGURED' };
        await sb.auth.signOut();
        return { ok: true, value: true };
      } catch {
        return { ok: false, code: 'NETWORK' };
      }
    },
    listSessions: async (): Promise<JurnlSession[]> => [{ id: 'this-device', label: 'THIS DEVICE', detail: 'NOW', current: true }],
    revokeSession: async () => ({ ok: false, code: 'NOT_CONFIGURED' }),
  };
}
