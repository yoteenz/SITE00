import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDfMemoryState, resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { createSyntheticTestClient } from '../api/_lib/digitalFoundation/founderReadiness.js';
import { refreshIntentDeliveryFromResend } from '../api/_lib/digitalFoundation/communications/resendDeliveryPoll.js';
import * as resendAdapter from '../api/_lib/digitalFoundation/communications/resendAdapter.js';

beforeEach(() => {
  resetDigitalFoundationMemoryStore();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('refreshIntentDeliveryFromResend', () => {
  it('maps delivered last_event to DELIVERED', async () => {
    vi.stubEnv('SITE00_DF_FOUNDER_TEST_MODE', '1');
    vi.stubEnv('SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST', 'founder@test.com');
    await createSyntheticTestClient({ display_name: 'X', contact_email: 'founder@test.com' });
    const intent = [...getDfMemoryState().sendIntents.values()][0];
    intent.provider_message_id = 're_poll_1';
    intent.status = 'ACCEPTED';

    vi.spyOn(resendAdapter, 'fetchResendEmailStatus').mockResolvedValue({
      ok: true,
      last_event: 'delivered',
    });

    const r = await refreshIntentDeliveryFromResend(intent.intent_id);
    expect(r.updated).toBe(true);
    expect(r.status).toBe('DELIVERED');
    expect(intent.status).toBe('DELIVERED');
  });
});
