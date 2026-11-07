/**
 * Data mode separation and sign-in hydrate (REAL_ACCOUNT_CLEAN_SEED, persistence safety).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { allowsSampleData, dataModeForRuntime, setRepositoryDataMode } from '../../../src/projects/jurnl/data/repository/dataMode';
import { emptySnapshotForUser, getRepository, importSnapshotForUser, setRepositoryUserId } from '../../../src/projects/jurnl/data/repository/deviceRepository';
import { decideHydrate } from '../../../src/projects/jurnl/data/repository/deviceServerMerge';
import { computeSafeToSpend } from '../../../src/projects/jurnl/data/f09/safeToSpend';
import { upcomingFor } from '../../../src/projects/jurnl/data/home/money';
import { seedObligationsFromSetup } from '../../../src/projects/jurnl/data/repository/wave2Seed';
import { MOCK_CASH } from '../../../src/projects/jurnl/data/home/mockScenario';
import { EMPTY_SETUP } from '../../../src/projects/jurnl/data/f02/setupDraft';

afterEach(() => {
  setRepositoryDataMode('DESIGN_PREVIEW');
  setRepositoryUserId('preview-guest');
});

describe('modes', () => {
  it('runtime → data mode: design preview is the only mode with sample data', () => {
    expect(dataModeForRuntime('design-preview')).toBe('DESIGN_PREVIEW');
    expect(dataModeForRuntime('production')).toBe('PRODUCTION');
    expect(dataModeForRuntime('production', 'PROVIDER_SANDBOX')).toBe('PROVIDER_SANDBOX');
    expect(dataModeForRuntime('production', 'DESIGN_PREVIEW')).toBe('PRODUCTION');
    setRepositoryDataMode('PRODUCTION');
    expect(allowsSampleData('DESIGN_PREVIEW')).toBe(false);
  });

  it('the design preview keeps its labelled sample data (unchanged behaviour)', () => {
    setRepositoryDataMode('DESIGN_PREVIEW');
    const s = emptySnapshotForUser('preview-guest');
    expect(s.transactions.length).toBeGreaterThan(0);
    expect(s.transactions.every((t) => t.source === 'MOCK')).toBe(true);
    expect(s.accounts.map((a) => a.account_id)).toEqual(expect.arrayContaining(['acct-checking', 'acct-card']));
  });

  it('a real account: no sample transactions, no sample accounts, no sample cash, no sample bills', () => {
    setRepositoryDataMode('PRODUCTION');
    setRepositoryUserId('real-user-1');
    importSnapshotForUser('real-user-1', emptySnapshotForUser('real-user-1'));
    getRepository().patchSetup({ started: true });
    const sts = computeSafeToSpend();
    expect(sts.cash).toBe(0);
    expect(sts.cash).not.toBe(MOCK_CASH);
    expect(sts.cashSource).toBe('ACCOUNTS');
    expect(sts.completeness).toBe('NEEDS_ACCOUNT');
    expect(sts.upcoming).toBe(0);
    expect(upcomingFor()).toEqual([]);
  });

  it('a real bill named like a sample bill does not borrow the sample amount', () => {
    const setup = { ...EMPTY_SETUP, obligations: [{ name: 'RENT', cadence: 'MONTHLY' }] } as never;
    expect(seedObligationsFromSetup(setup, [], { allowSampleAmounts: false })[0].amount).toBe(0);
  });
});

describe('sign-in hydrate (server revision decides; never timestamps, never another user / mode)', () => {
  const real = (userId: string, rev: number, dirty: boolean) => ({ ...emptySnapshotForUser(userId), dataMode: 'PRODUCTION' as const, syncBase: { revision: rev, dirty, reconciledAt: null } });

  it('server copy wins over a clean device copy', () => {
    setRepositoryDataMode('PRODUCTION');
    const server = real('u', 3, false);
    expect(decideHydrate({ ok: true, snapshot: server, revision: 3 }, real('u', 2, false), 'PRODUCTION', 'u').action).toBe('USE_SERVER');
  });

  it('device changes made on the current server revision upload (compare-and-swap on that revision)', () => {
    setRepositoryDataMode('PRODUCTION');
    const d = decideHydrate({ ok: true, snapshot: real('u', 3, false), revision: 3 }, real('u', 3, true), 'PRODUCTION', 'u');
    expect(d).toMatchObject({ action: 'UPLOAD_DEVICE', expectedRevision: 3 });
  });

  it('device changes on an OLDER revision never overwrite the server: server loads, device kept as conflict copy', () => {
    setRepositoryDataMode('PRODUCTION');
    const d = decideHydrate({ ok: true, snapshot: real('u', 5, false), revision: 5 }, { ...real('u', 2, true), updatedAt: '2099-01-01T00:00:00.000Z' }, 'PRODUCTION', 'u');
    expect(d).toMatchObject({ action: 'USE_SERVER', keepDeviceAsConflictCopy: true });
  });

  it('preview data and other users’ copies are never considered', () => {
    setRepositoryDataMode('PRODUCTION');
    const preview = { ...emptySnapshotForUser('u'), dataMode: 'DESIGN_PREVIEW' as const, syncBase: { revision: 0, dirty: true, reconciledAt: null } };
    expect(decideHydrate({ ok: true, snapshot: null, revision: 0 }, preview, 'PRODUCTION', 'u').action).toBe('START_EMPTY');
    expect(decideHydrate({ ok: true, snapshot: null, revision: 0 }, real('someone-else', 0, true), 'PRODUCTION', 'u').action).toBe('START_EMPTY');
  });

  it('server unreachable: show the device cache, never upload; no cache → nothing invented', () => {
    setRepositoryDataMode('PRODUCTION');
    expect(decideHydrate({ ok: false, code: 'OFFLINE' }, real('u', 4, true), 'PRODUCTION', 'u').action).toBe('USE_DEVICE_OFFLINE');
    expect(decideHydrate({ ok: false, code: 'SERVER' }, null, 'PRODUCTION', 'u').action).toBe('NONE');
  });
});
