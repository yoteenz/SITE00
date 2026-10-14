import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  buildFounderReadinessReport,
  createSyntheticTestClient,
  advanceSyntheticIntakeSubmitted,
} from '../api/_lib/digitalFoundation/founderReadiness.js';
import { intakeIncompleteReminderEligibility, quoteUnpaidReminderEligibility } from '../shared/site00-digital-foundation/communications/reminderEligibility.js';
import { fixtureFor } from '../shared/site00-correspondence-studio/fndatn01/index.js';
import { sendViaResend, resendApiKeyConfigured } from '../api/_lib/digitalFoundation/communications/resendAdapter.js';
import { fndatnEmailIdForTemplate } from '../api/_lib/digitalFoundation/communications/fndatnTemplateBridge.js';

beforeEach(() => {
  resetDigitalFoundationMemoryStore();
  vi.unstubAllEnvs();
});

describe('founder test mode guards', () => {
  it('blocks synthetic client creation when founder test mode is off', () => {
    expect(() =>
      createSyntheticTestClient({ display_name: 'X', contact_email: 'test@example.com' }),
    ).toThrow(/FOUNDER_TEST_MODE_DISABLED/);
  });

  it('creates synthetic artifact and DRY_RUN/QUEUED invitation intent when test mode on', () => {
    vi.stubEnv('SITE00_DF_FOUNDER_TEST_MODE', '1');
    const out = createSyntheticTestClient({ display_name: 'Anthony Test', contact_email: 'founder@test.com' });
    expect(out.lead.business_name).toMatch(/^SYNTH · /);
    expect(out.personalized_url).toMatch(/^\/foundation\//);
    const journey = advanceSyntheticIntakeSubmitted(out.artifact.artifact_id);
    expect(journey.intake_state).toBe('COMPLETE');
    expect(journey.email_events.some((e) => e.template_id === 'intake-completed')).toBe(true);
  });
});

describe('reminder eligibility', () => {
  it('suppresses intake reminder when already complete', () => {
    const payload = fixtureFor('02');
    const r = intakeIncompleteReminderEligibility(payload, { lastReminderSentAt: null, now: new Date() });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('INTAKE_ALREADY_COMPLETE');
  });

  it('suppresses quote reminder when paid', () => {
    const payload = fixtureFor('04');
    payload.artifact.payment_state = 'PAID';
    const r = quoteUnpaidReminderEligibility(payload, { lastReminderSentAt: null, quoteExpiresAt: null, now: new Date() });
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('ALREADY_PAID');
  });
});

describe('FNDATN template bridge', () => {
  it('maps lifecycle template ids to FNDATN 01–07', () => {
    expect(fndatnEmailIdForTemplate('personal-foundation-invitation')).toBe('01');
    expect(fndatnEmailIdForTemplate('quote-expiry-reminder')).toBe('07');
  });
});

describe('Resend adapter', () => {
  it('reports not configured without API key', () => {
    expect(resendApiKeyConfigured()).toBe(false);
  });

  it('fails closed without API key', async () => {
    const r = await sendViaResend({ from: 'x@y.com', to: 'a@b.com', subject: 'S', html: '<p>x</p>' });
    expect(r.ok).toBe(false);
  });
});

describe('readiness report', () => {
  it('lists blocked founder test mode when env off', () => {
    const r = buildFounderReadinessReport();
    expect(r.blocked.some((b) => b.includes('FOUNDER_TEST_MODE'))).toBe(true);
  });
});
