import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildFounderReadinessReport } from '../api/_lib/digitalFoundation/founderReadiness.js';
import { applyStagingRuntimeReconciliation } from '../api/_lib/digitalFoundation/stagingReadinessRuntime.js';

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('staging readiness runtime reconciliation', () => {
  it('marks synthetic intake ready when founder session verified on staging stack', () => {
    vi.stubEnv('SITE00_DF_FOUNDER_TEST_MODE', '1');
    vi.stubEnv('SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST', 'founder@test.com');
    vi.stubEnv('SITE00_DF_PERSISTENCE_TEST', '1');
    vi.stubEnv('SUPABASE_URL', 'https://soocqbyjkxeubfjnuwvf.supabase.co'); // pragma: allowlist secret
    vi.stubEnv('SITE00_PUBLIC_APP_ORIGIN', 'https://carefree-luck-staging.up.railway.app');

    const report = buildFounderReadinessReport();
    report.deployment.commit_short = 'bc4056560c3f';
    applyStagingRuntimeReconciliation(
      report,
      { founder_admin_verified: true, founder_email: 'founder@test.com' },
      {
        supabase_project_ref: 'soocqbyjkxeubfjnuwvf',
        project_messages_table: { anon_select: 'denied', service_role_select: 'denied' },
        persistence_safe: true,
        notes: [],
      },
    );

    expect(report.activation.founder_login_verified).toBe(true);
    expect(report.activation.remote_migration_applied).toBe(true);
    expect(report.activation.deployment_performed).toBe(true);
    expect(report.activation.synthetic_intake_ready).toBe(true);
    expect(report.activation.e2e_authorized).toBe(false);
    expect(report.unverified.some((u) => u.includes('20261015120000'))).toBe(false);
  });
});
