/**
 * Production JURNL auth via Supabase (Wave 5). Never uses design-preview seed accounts.
 */
import { getSupabase, isSupabaseUserEmailConfirmed, signOutIfSessionEmailUnconfirmed } from '../../../../utils/supabase';
import type { AuthErrorCode, JurnlAccount, JurnlAuthAdapter, JurnlSession, SocialProvider } from './adapters';

function mapAuthError(message: string): AuthErrorCode {
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'INCORRECT_PASSWORD';
  if (m.includes('already registered') || m.includes('already exists')) return 'EMAIL_IN_USE';
  if (m.includes('network') || m.includes('fetch')) return 'NETWORK';
  return 'NOT_CONFIGURED';
}

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

export function createSupabaseJurnlAuthAdapter(): JurnlAuthAdapter {
  const client = () => getSupabase();

  return {
    kind: 'SUPABASE' as const,
    signUp: async (input) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const { data, error } = await sb.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: { data: { first_name: input.firstName, last_name: input.lastName } },
      });
      if (error) return { ok: false, code: mapAuthError(error.message) };
      if (!data.user) return { ok: false, code: 'NETWORK' };
      return { ok: true, value: accountFromUser(data.user) };
    },
    signIn: async (email, password) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) return { ok: false, code: mapAuthError(error.message) };
      if (!data.user) return { ok: false, code: 'INCORRECT_PASSWORD' };
      if (!isSupabaseUserEmailConfirmed(data.user)) {
        await signOutIfSessionEmailUnconfirmed(sb, data.session, { clearAppAuth: false });
        return { ok: false, code: 'NOT_CONFIGURED' };
      }
      return { ok: true, value: accountFromUser(data.user) };
    },
    resendVerification: async (email) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const { error } = await sb.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
      return error ? { ok: false, code: mapAuthError(error.message) } : { ok: true, value: true };
    },
    changeEmail: async () => ({ ok: false, code: 'NOT_CONFIGURED' }),
    confirmEmailLink: async () => ({ ok: false, code: 'NOT_CONFIGURED' }),
    requestPasswordReset: async (email) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase());
      return error ? { ok: false, code: mapAuthError(error.message) } : { ok: true, value: true };
    },
    validateResetToken: async () => ({ ok: true, value: true }),
    resetPassword: async (_token, password) => {
      const sb = client();
      if (!sb) return { ok: false, code: 'NOT_CONFIGURED' };
      const { error } = await sb.auth.updateUser({ password });
      return error ? { ok: false, code: mapAuthError(error.message) } : { ok: true, value: true };
    },
    social: async (_provider: SocialProvider) => ({ ok: false, code: 'PROVIDER_NOT_CONFIGURED' }),
    deleteAccount: async () => ({ ok: false, code: 'NOT_CONFIGURED' }),
    listSessions: async (): Promise<JurnlSession[]> => [{ id: 'this-device', label: 'THIS DEVICE', detail: 'NOW', current: true }],
    revokeSession: async () => ({ ok: false, code: 'NOT_CONFIGURED' }),
  };
}
