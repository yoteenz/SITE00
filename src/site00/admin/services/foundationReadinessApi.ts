import { foundationFetch } from './foundationAdminApi';

export type FounderReadinessReport = {
  ready: string[];
  needs_founder: string[];
  blocked: string[];
  env: {
    founder_test_mode: boolean;
    transactional_send_flag: boolean;
    resend_configured: boolean;
    allowlist_configured: boolean;
  };
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
  dispatchTestEmail: (intent_id: string) =>
    foundationFetch<{ intent: EmailEventRow; blocked?: string }>('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'dispatch-test-email', intent_id },
    }),
  resetTestData: () =>
    foundationFetch<{ ok: true }>('/api/admin/site00-foundation', {
      method: 'POST',
      body: { action: 'reset-test-data' },
    }),
};
