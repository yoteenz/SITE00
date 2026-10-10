import { beforeEach, describe, expect, it } from 'vitest';
import { buildSendIdempotencyKey } from '../shared/site00-digital-foundation/communications/idempotency.js';
import { DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP, mappingsForEvent } from '../shared/site00-digital-foundation/communications/eventMap.js';
import { isDfCommunicationFlagEnabled, DF_COMM_FEATURE_FLAGS } from '../shared/site00-digital-foundation/communications/featureFlags.js';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { createArtifactForLead, getClientArtifactPayloadByToken } from '../api/_lib/digitalFoundation/service.js';
import { enqueueCommunicationsForEvent } from '../api/_lib/digitalFoundation/communications/dispatch.js';

beforeEach(() => resetDigitalFoundationMemoryStore());

describe('communications governance defaults', () => {
  it('marketing and transactional send flags default off', () => {
    expect(isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_MARKETING_EMAIL_SEND)).toBe(false);
    expect(isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND)).toBe(false);
  });

  it('lifecycle map lists candidate templates without enabling live send', () => {
    expect(DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP.some((m) => m.event_type === 'PAYMENT_CONFIRMED')).toBe(true);
    expect(DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP.every((m) => !m.enabled)).toBe(true);
  });

  it('idempotency keys are stable', () => {
    const a = buildSendIdempotencyKey({
      artifactId: 'art',
      eventType: 'PAYMENT_CONFIRMED',
      templateId: 'payment-confirmed',
      purpose: 'TRANSACTIONAL',
    });
    const b = buildSendIdempotencyKey({
      artifactId: 'art',
      eventType: 'PAYMENT_CONFIRMED',
      templateId: 'payment-confirmed',
      purpose: 'TRANSACTIONAL',
    });
    expect(a).toBe(b);
  });
});

describe('send intent enqueue (dry run)', () => {
  it('does not duplicate intents for the same idempotency key', () => {
    const a = createArtifactForLead({ referral_kind: 'DIRECT', business_name: 'Comm Test LLC' });
    const email = 'client@example.com';
    const first = enqueueCommunicationsForEvent({
      artifactId: a.artifact_id,
      eventType: 'PAYMENT_CONFIRMED',
      recipientEmail: email,
    });
    const second = enqueueCommunicationsForEvent({
      artifactId: a.artifact_id,
      eventType: 'PAYMENT_CONFIRMED',
      recipientEmail: email,
    });
    expect(first.length).toBe(0);
    expect(second.length).toBe(0);
    expect(mappingsForEvent('PAYMENT_CONFIRMED').every((m) => !m.enabled)).toBe(true);
  });

  it('client payload includes communication preferences (marketing off by default)', () => {
    const a = createArtifactForLead({ referral_kind: 'DIRECT', business_name: 'Prefs LLC' });
    const p = getClientArtifactPayloadByToken(a.public_token);
    expect(p.communication_preferences.marketing_opt_in).toBe(false);
    expect(p.communication_preferences.project_operations).toBe(true);
  });
});
