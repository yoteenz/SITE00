import { beforeEach, describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: fromMock,
  }),
}));

describe('probeDfDatabaseSecurity', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    fromMock.mockReset();
  });

  it('marks persistence unsafe when anon can read rows', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example-project.supabase.co'); // pragma: allowlist secret
    vi.stubEnv('SUPABASE_ANON_KEY', 'anon-key-test');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key-test');
    fromMock.mockReturnValue({
      select: () => ({
        limit: async () => ({ data: [{ message_id: 'x' }], error: null }),
      }),
    });
    const { probeDfDatabaseSecurity } = await import('../api/_lib/digitalFoundation/stagingDatabaseSecurityProbe.js');
    const snap = await probeDfDatabaseSecurity();
    expect(snap.project_messages_table.anon_select).toBe('allowed_rows');
    expect(snap.persistence_safe).toBe(false);
  });

  it('treats permission errors as denied for anon', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example-project.supabase.co'); // pragma: allowlist secret
    vi.stubEnv('SUPABASE_ANON_KEY', 'anon-key-test');
    fromMock.mockReturnValue({
      select: () => ({
        limit: async () => ({ data: null, error: { message: 'permission denied for table', code: '42501' } }),
      }),
    });
    const { probeDfDatabaseSecurity } = await import('../api/_lib/digitalFoundation/stagingDatabaseSecurityProbe.js');
    const snap = await probeDfDatabaseSecurity();
    expect(snap.project_messages_table.anon_select).toBe('denied');
    expect(snap.persistence_safe).toBe(true);
  });
});
