import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DF_COMM_FEATURE_FLAGS,
  isDfCommunicationFlagEnabled,
} from '../shared/site00-digital-foundation/communications/featureFlags.js';

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('transactional email send flag', () => {
  it('requires both VITE and server env in browser context', () => {
    vi.stubGlobal('window', {} as Window);
    vi.stubEnv('SITE00_DF_TRANSACTIONAL_EMAIL_SEND', '1');
    expect(isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND)).toBe(false);
    vi.stubEnv('VITE_SITE00_DF_TRANSACTIONAL_EMAIL_SEND', '1');
    expect(isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND)).toBe(true);
    vi.unstubAllGlobals();
  });

  it('enables on server when SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1 only', () => {
    vi.stubEnv('SITE00_DF_TRANSACTIONAL_EMAIL_SEND', '1');
    expect(isDfCommunicationFlagEnabled(DF_COMM_FEATURE_FLAGS.SITE00_DF_TRANSACTIONAL_EMAIL_SEND)).toBe(true);
  });
});
