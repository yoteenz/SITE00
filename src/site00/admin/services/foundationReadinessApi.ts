import { foundationFetch } from './foundationAdminApi';

export type IntegrationStatusLabel = 'READY' | 'ACTION_REQUIRED' | 'BLOCKED' | 'UNVERIFIED';

export type EnvVarGroup = {
  id: string;
  primary: string;
  aliases: string[];
  purpose: string;
  required: boolean;
  satisfied: boolean;
  present_names: string[];
  status: IntegrationStatusLabel;
  note?: string;
};

export type DfDatabaseSecuritySnapshot = {
  supabase_project_ref: string | null;
  project_messages_table: {
    anon_select: 'denied' | 'allowed_rows' | 'not_configured' | 'error';
    service_role_select: 'denied' | 'allowed_rows' | 'not_configured' | 'error';
  };
  persistence_safe: boolean;
  notes: string[];
};

export type FounderReadinessReport = {
  overall_status: 'BLOCKED' | 'ACTION_REQUIRED' | 'AWAITING_FOUNDER_APPROVAL' | 'UNVERIFIED';
  ready: string[];
  needs_founder: string[];
  blocked: string[];
  unverified: string[];
  env_var_groups: EnvVarGroup[];
  database_security: DfDatabaseSecuritySnapshot | null;
  activation: {
    e2e_authorized: boolean;
    synthetic_intake_ready: boolean;
    remote_migration_applied: boolean;
    deployment_performed: boolean;
    founder_login_verified: boolean;
  };
  staging_identities: {
    expected_frontend_origin: string;
    expected_api_origin: string;
    configured_public_origin: string | null;
    effective_public_origin: string;
    supabase_project_ref: string | null;
    supabase_staging_isolation_verified: boolean;
    persistence_store: 'supabase' | 'memory';
    email_sending_enabled: boolean;
    stripe_key_mode: 'test' | 'live' | 'missing' | 'unrecognized';
    e2e_passed: false;
  };
  env: {
    founder_test_mode: boolean;
    transactional_send_flag: boolean;
    resend_configured: boolean;
    allowlist_configured: boolean;
    supabase_persistence: boolean;
    stripe_secret_present: boolean;
    stripe_webhook_secret_present: boolean;
    resend_webhook_secret_present: boolean;
    transactional_from_present: boolean;
    transactional_reply_to_present: boolean;
  };
  deployment: {
    commit_short: string | null;
    pr1642_reference: string;
    package_marker: string;
  };
  env_vars: { name: string; present: boolean }[];
};

export type TestInvitationPreview = {
  intent_id: string;
  template_id: string;
  subject: string;
  recipient_masked: string;
  from_identity: string;
  invitation_link_valid: boolean;
  invitation_uses_configured_origin: boolean;
  configured_public_origin: string;
  invitation_links: string[];
  ready_to_send: boolean;
  blockers: string[];
};

export type EmailEventRow = {
  intent_id: string;
  artifact_id: string;
  event_type: string;
  template_id: string;
  status: string;
  recipient_email: string;
  provider_message_id: string | null;
  last_error: string | null;
  created_at: string;
};

export type TestJourney = {
  artifact_id: string;
  state: string;
  intake_state: string;
  payment_state: string;
  surface: string;
  personalized_url: string;
  token_masked: string;
  email_events: EmailEventRow[];
  event_count: number;
};

export const foundationReadinessApi = {
  readinessReport: () => foundationFetch<FounderReadinessReport>('/api/admin/site00-foundation?action=readiness-report'),
  createTestClient: (body: { contact_email: string; display_name: string; contact_name?: string }) =>
    foundationFetch<{ artifact: { artifact_id: string; public_token: string }; personalized_url: string }>(
      '/api/admin/site00-foundation',
      { method: 'POST', body: { action: 'create-test-client', ...body } },
    ),
  testJourney: (artifactId: string) =>
    foundationFetch<TestJourney>(`/api/admin/site00-foundation?action=test-journey&id=${encodeURIComponent(artifactId)}`),
  advanceTestIntake: (artifact_id: string) =>
    foundationFetch<TestJourney>('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'advance-test-intake', artifact_id },
    }),
  advanceTestQuote: (artifact_id: string) =>
    foundationFetch<TestJourney>('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'advance-test-quote', artifact_id },
    }),
  prepareTestInvitation: (intent_id: string) =>
    foundationFetch<TestInvitationPreview>(
      `/api/admin/site00-foundation?action=prepare-test-invitation&intent_id=${encodeURIComponent(intent_id)}`,
    ),
  dispatchTestEmail: (intent_id: string, founder_approved_send = false) =>
    foundationFetch<{ preview: TestInvitationPreview; intent: EmailEventRow | null; blocked?: string }>(
      '/api/admin/site00-foundation',
      {
        method: 'POST',
        body: { action: 'dispatch-test-email', intent_id, founder_approved_send },
      },
    ),
  resetTestData: () =>
    foundationFetch<{ ok: true }>('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'reset-test-data' },
    }),
};
