import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL,
  formatE2eRunId,
} from '../shared/site00-digital-foundation/founderE2eEmailJourney.js';
import { startAutomatedEmailJourneyRun, summarizeRunEmailStats } from '../api/_lib/digitalFoundation/automatedEmailJourneyRunner.js';
import { buildEmailJourneyGallery } from '../api/_lib/digitalFoundation/emailJourneyGallery.js';
import { getArtifactPayload } from '../api/_lib/digitalFoundation/service.js';
import { listSendIntentsForArtifact } from '../api/_lib/digitalFoundation/communications/deliveryWorker.js';

vi.mock('../api/_lib/digitalFoundation/communications/resendAdapter.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/_lib/digitalFoundation/communications/resendAdapter.js')>();
  let seq = 0;
  return {
    ...actual,
    sendViaResend: vi.fn(async () => {
      seq += 1;
      return { ok: true as const, providerMessageId: `re_mock_${seq}`, status: 'ACCEPTED' as const };
    }),
    fetchResendEmailStatus: vi.fn(async () => ({ ok: true as const, last_event: 'delivered' })),
  };
});

function stubE2eEnv() {
  vi.stubEnv('SITE00_DF_FOUNDER_TEST_MODE', '1');
  vi.stubEnv('SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST', FOUNDER_E2E_AUTHORIZED_TESTER_EMAIL);
  vi.stubEnv('SITE00_DF_TRANSACTIONAL_EMAIL_SEND', '1');
  vi.stubEnv('RESEND_API_KEY', 're_test_key');
  vi.stubEnv('SITE00_PUBLIC_APP_ORIGIN', 'https://carefree-luck-staging.up.railway.app');
  vi.stubEnv('SITE00_DF_FOUNDER_E2E_STRIPE_SIM', '1');
}

beforeEach(() => {
  resetDigitalFoundationMemoryStore();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('formatE2eRunId', () => {
  it('uses IDNTY-E2E prefix and date', () => {
    const id = formatE2eRunId(new Date('2026-10-21T12:00:00.000Z'));
    expect(id).toMatch(/^IDNTY-E2E-20261021-/);
  });
});

describe('startAutomatedEmailJourneyRun', () => {
  it('fails preflight when transactional send is off', async () => {
    stubE2eEnv();
    vi.stubEnv('SITE00_DF_TRANSACTIONAL_EMAIL_SEND', '0');
    const run = await startAutomatedEmailJourneyRun({});
    expect(run.status).toBe('FAILED');
    expect(run.error).toMatch(/TRANSACTIONAL_EMAIL_SEND/);
  });

  it('rejects non-authorized recipient', async () => {
    stubE2eEnv();
    await expect(
      startAutomatedEmailJourneyRun({ contact_email: 'other@example.com' }),
    ).rejects.toThrow(/E2E_RECIPIENT_NOT_AUTHORIZED/);
  });

  it('completes lifecycle with mocked Resend and stripe sim', async () => {
    stubE2eEnv();
    const run = await startAutomatedEmailJourneyRun({ test_run_id: 'IDNTY-E2E-TEST-UNIT' });
    expect(run.status).toBe('COMPLETED');
    expect(run.artifact_id).toBeTruthy();
    expect(run.stages.filter((s) => s.ok).length).toBeGreaterThanOrEqual(7);

    const stats = summarizeRunEmailStats(run);
    expect(stats.triggered).toBeGreaterThanOrEqual(5);
    expect(stats.sent).toBeGreaterThanOrEqual(5);
    expect(stats.duplicated).toBe(0);

    const payload = getArtifactPayload(run.artifact_id!);
    expect(payload.artifact.payment_state).toBe('PAID');
    expect(payload.artifact.completion_state).toBe('COMPLETE');

    const gallery = buildEmailJourneyGallery({
      payload,
      intents: listSendIntentsForArtifact(run.artifact_id!),
    });
    const triggered = gallery.filter((r) => r.approval_status === 'TRIGGERED');
    expect(triggered.some((r) => r.template_id === 'personal-foundation-invitation')).toBe(true);
    expect(triggered.some((r) => r.template_id === 'foundation-complete')).toBe(true);
    const reminders = gallery.filter((r) => r.template_id.includes('reminder'));
    expect(reminders.every((r) => r.approval_status === 'NOT_APPLICABLE')).toBe(true);
  });
});
