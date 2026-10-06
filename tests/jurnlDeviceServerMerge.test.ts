import { describe, expect, it } from 'vitest';
import { decideDeviceServerMerge } from '../src/projects/jurnl/data/repository/deviceServerMerge';
import { REPOSITORY_SCHEMA_VERSION, type RepositorySnapshot } from '../src/projects/jurnl/data/repository/types';
import { EMPTY_SETUP } from '../src/projects/jurnl/data/f02/setupDraft';
import { seedAccountsFromSetup } from '../src/projects/jurnl/data/foundation/accountSeed';
import { DEFAULT_JURNL_SETTINGS } from '../src/projects/jurnl/data/foundation/settings';
import { defaultConsentRecords } from '../src/projects/jurnl/data/foundation/consent';

function emptySnap(userId: string, updatedAt: string): RepositorySnapshot {
  return {
    schemaVersion: REPOSITORY_SCHEMA_VERSION,
    userId,
    setup: { ...EMPTY_SETUP },
    accounts: [],
    transactions: [],
    settings: { ...DEFAULT_JURNL_SETTINGS },
    consent: defaultConsentRecords(),
    incomeSources: [],
    obligations: [],
    planIntentions: [],
    goals: [],
    creditAttributes: [],
    purchases: [],
    trips: [],
    paydownPlan: null,
    records: [],
    updatedAt,
  };
}

describe('deviceServerMerge', () => {
  it('prefers server when only server has data', () => {
    const server = emptySnap('uid', '2026-10-06T10:00:00.000Z');
    server.setup.started = true;
    server.accounts = seedAccountsFromSetup(server.setup, 'uid');
    const d = decideDeviceServerMerge(server, null);
    expect(d?.action).toBe('USE_SERVER');
  });

  it('uploads device when server empty and device has accounts', () => {
    const device = emptySnap('uid', '2026-10-06T10:00:00.000Z');
    device.setup.started = true;
    const d = decideDeviceServerMerge(null, device);
    expect(d?.action).toBe('UPLOAD_DEVICE');
  });
});
