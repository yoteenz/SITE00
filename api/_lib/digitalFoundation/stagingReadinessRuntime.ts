/**
 * Reconcile founder readiness copy with verified staging runtime (no secrets).
 */
import { isSupabaseDfPersistenceEnabled } from './persistence/supabaseStore.js';
import {
  SITE00_STAGING_FRONTEND_ORIGIN,
  SITE00_STAGING_SUPABASE_PROJECT_REF,
  isSupabaseIsolationVerifiedForStaging,
  resolveConfiguredPublicAppOrigin,
} from './stagingEnvConfig.js';
import type { DfDatabaseSecuritySnapshot } from './stagingDatabaseSecurityProbe.js';
import type { FounderReadinessReport } from './founderReadiness.js';

export const STAGING_READINESS_DEPLOY_PREFIXES = ['bc405656', '3bbea4dd'] as const;

export type FounderReadinessBuildContext = {
  founder_admin_verified: boolean;
  founder_email?: string | null;
};

export function maskFounderEmail(email: string): string {
  const trimmed = email.trim();
  const m = trimmed.match(/^(.{1,2}).+(@.+)$/);
  return m ? `${m[1]}•••${m[2]}` : '•••';
}

function stripStaleStagingInstructions(report: FounderReadinessReport): void {
  const stale = (line: string) =>
    line.includes('20261015120000') ||
    line.includes('#1648') ||
    line.includes('#1649') ||
    line.includes('apply migration') ||
    line.includes('deploy #') ||
    line.includes('After RLS migration') ||
    line.includes('Code deployed on Railway — external E2E test has not passed');

  report.unverified = report.unverified.filter((line) => !stale(line));
  report.needs_founder = report.needs_founder.filter((line) => !stale(line));
  report.blocked = report.blocked.filter(
    (line) => !line.includes('20261015120000') && !line.includes('PostgREST anon can read'),
  );
}

export function applyStagingRuntimeReconciliation(
  report: FounderReadinessReport,
  ctx: FounderReadinessBuildContext,
  db: DfDatabaseSecuritySnapshot | null,
): void {
  stripStaleStagingInstructions(report);

  const deploySha = report.deployment.commit_short ?? '';
  const deployOk = STAGING_READINESS_DEPLOY_PREFIXES.some((p) => deploySha.startsWith(p));
  if (deployOk) {
    report.activation.deployment_performed = true;
    report.ready.push(`Staging API deployment verified (commit ${deploySha})`);
  }

  const origin = resolveConfiguredPublicAppOrigin();
  if (origin?.replace(/\/$/, '') === SITE00_STAGING_FRONTEND_ORIGIN.replace(/\/$/, '')) {
    report.ready.push('Public staging origin configured for invitation and intake links');
    report.unverified = report.unverified.filter((line) => !line.includes('Public app origin matches staging frontend'));
  }

  if (isSupabaseIsolationVerifiedForStaging() && isSupabaseDfPersistenceEnabled()) {
    report.ready.push(`Persistent storage enabled on staging Supabase (${SITE00_STAGING_SUPABASE_PROJECT_REF})`);
    report.unverified = report.unverified.filter((line) => !line.includes('Persistence flag ON — apply'));
  }

  if (db?.persistence_safe && isSupabaseIsolationVerifiedForStaging()) {
    report.activation.remote_migration_applied = true;
    report.ready.push(
      'project_messages table secured for staging (RLS aligned; anon PostgREST cannot read rows)',
    );
  }

  if (ctx.founder_admin_verified && ctx.founder_email) {
    report.activation.founder_login_verified = true;
    report.ready.push(`Founder admin API session verified (${maskFounderEmail(ctx.founder_email)})`);
  } else {
    report.unverified.push('Founder admin session not verified on this readiness request — sign in if create test client fails');
  }

  const intakeBlockers = report.blocked.filter(
    (b) => !b.includes('Stripe') && !b.includes('PostgREST'),
  );
  report.activation.synthetic_intake_ready =
    report.env.founder_test_mode &&
    report.env.allowlist_configured &&
    report.env.supabase_persistence &&
    report.staging_identities.supabase_staging_isolation_verified &&
    !report.env.transactional_send_flag &&
    intakeBlockers.length === 0 &&
    ctx.founder_admin_verified;

  // Full E2E (allowlisted email send + Stripe checkout) stays off until explicit authorization.
  report.activation.e2e_authorized = false;
}
