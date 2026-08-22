import { describe, expect, it, vi, beforeEach } from 'vitest';

const signUpMock = vi.fn();
const getSessionMock = vi.fn();

vi.mock('../supabase', () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({
    auth: {
      signUp: signUpMock,
      getSession: getSessionMock,
    },
  }),
  isSupabaseUserEmailConfirmed: (user: { email_confirmed_at?: string | null }) => Boolean(user.email_confirmed_at),
  signOutIfSessionEmailUnconfirmed: vi.fn(),
}));

vi.mock('../syncFromApi', () => ({
  syncAllFromApi: vi.fn(async () => ({ email: 'test@example.com' })),
  buildMinimalUserFromSupabaseSession: vi.fn(),
  applyMinimalUserToStorage: vi.fn(),
  buildProfilePayloadForBackend: vi.fn(),
  didLastProfileSyncError: vi.fn(() => false),
}));

vi.mock('../sessionRestore', () => ({
  registerServerSessionCookie: vi.fn(),
}));

vi.mock('../adminAuth', () => ({
  onSignInSuccess: vi.fn(),
}));

vi.mock('../activity', () => ({
  trackActivity: vi.fn(),
}));

vi.mock('../profileSyncQueue', () => ({
  flushQueuedProfilePatch: vi.fn(),
}));

vi.mock('../../site00/api/intakesApi', () => ({
  claimGuestIntakes: vi.fn(async () => []),
}));

describe('site00SignUpWithPassword', () => {
  beforeEach(() => {
    signUpMock.mockReset();
    getSessionMock.mockReset();
  });

  it('rejects password mismatch', async () => {
    const { site00SignUpWithPassword } = await import('./site00CreateAccountActions');
    const result = await site00SignUpWithPassword({
      email: 'founder@example.com',
      password: 'secret123',
      confirmPassword: 'different',
    });
    expect(result).toEqual({ ok: false, message: 'PASSWORDS DO NOT MATCH.' });
  });

  it('rejects invalid email', async () => {
    const { site00SignUpWithPassword } = await import('./site00CreateAccountActions');
    const result = await site00SignUpWithPassword({
      email: 'not-an-email',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(result).toEqual({ ok: false, message: 'ENTER A VALID EMAIL ADDRESS.' });
  });

  it('handles verification-required signup', async () => {
    signUpMock.mockResolvedValue({
      data: { user: { email: 'new@example.com' }, session: null },
      error: null,
    });
    const { site00SignUpWithPassword } = await import('./site00CreateAccountActions');
    const result = await site00SignUpWithPassword({
      email: 'new@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(result).toEqual({ ok: true, kind: 'verification_required', email: 'new@example.com' });
  });

  it('maps already-registered errors safely', async () => {
    signUpMock.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });
    const { site00SignUpWithPassword } = await import('./site00CreateAccountActions');
    const result = await site00SignUpWithPassword({
      email: 'exists@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('ALREADY EXISTS');
    }
  });
});
