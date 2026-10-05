import { describe, expect, it, beforeEach } from 'vitest';
import { consentGranted, patchConsent, defaultConsentRecords } from '../src/projects/jurnl/data/foundation/consent';
import { JURNL_FAMILY_LINKS, resolveFamilyLinkTarget } from '../src/projects/jurnl/data/foundation/familyLinks';
import { JURNL_QUICK_ADD_TYPES } from '../src/projects/jurnl/data/foundation/quickAddRegistry';
import { JURNL_BANK_CONNECTION_PROVIDER } from '../src/projects/jurnl/data/foundation/connectionProvider';
import { getRepository, resetRepositoryForDev, setRepositoryUserId } from '../src/projects/jurnl/data/repository/deviceRepository';
import { syncSetupConsentsToRepository } from '../src/projects/jurnl/data/repository/consentSync';
import { EMPTY_SETUP } from '../src/projects/jurnl/data/f02/setupDraft';

describe('JURNL Wave 1 global interactions', () => {
  beforeEach(() => {
    setRepositoryUserId('wave1-test@example.com');
    resetRepositoryForDev();
  });

  it('settings persist in repository', () => {
    getRepository().patchSettings({ safeToSpendBuffer: '120' });
    expect(getRepository().getSettings().safeToSpendBuffer).toBe('120');
  });

  it('consent grant and revoke', () => {
    const records = getRepository().patchConsent('ASK_JURNL_CONTEXT', true, 'TEST');
    expect(consentGranted(records, 'ASK_JURNL_CONTEXT')).toBe(true);
    const revoked = getRepository().patchConsent('ASK_JURNL_CONTEXT', false, 'TEST');
    expect(consentGranted(revoked, 'ASK_JURNL_CONTEXT')).toBe(false);
  });

  it('setup consents sync to repository', () => {
    syncSetupConsentsToRepository({ ...EMPTY_SETUP, consentRemember: false });
    expect(consentGranted(getRepository().getConsent(), 'DATA_REMEMBER')).toBe(false);
  });

  it('ledger edit and delete for ADDED entries only', () => {
    const created = getRepository().appendTransaction({
      merchant: 'TEST SHOP',
      amount: 12,
      direction: 'EXPENSE',
      when: 'TODAY',
      account: 'CHECKING',
      category: 'OTHER',
    });
    const updated = getRepository().updateTransaction(created.id, { amount: 20 });
    expect(updated?.amount).toBe(20);
    expect(getRepository().deleteTransaction(created.id)).toBe(true);
    expect(getRepository().listTransactions().some((t) => t.id === created.id)).toBe(false);
  });

  it('mock ledger entries cannot be deleted', () => {
    const mock = getRepository().listTransactions().find((t) => t.source === 'MOCK');
    expect(mock).toBeTruthy();
    if (mock) expect(getRepository().deleteTransaction(mock.id)).toBe(false);
  });

  it('family link registry resolves settings route', () => {
    const settingsLink = JURNL_FAMILY_LINKS.find((l) => l.link_id === 'F03.TO.SETTINGS');
    expect(settingsLink).toBeTruthy();
    expect(resolveFamilyLinkTarget(settingsLink!)).toBe('account');
  });

  it('quick add registry has enabled transaction type', () => {
    expect(JURNL_QUICK_ADD_TYPES.filter((t) => t.enabled).length).toBeGreaterThan(0);
  });

  it('bank provider is unavailable', () => {
    expect(JURNL_BANK_CONNECTION_PROVIDER.availability).toBe('PROVIDER_UNAVAILABLE');
  });

  it('default consent records are versioned', () => {
    expect(defaultConsentRecords()[0].version).toBeTruthy();
    const next = patchConsent(defaultConsentRecords(), 'NO_DATA_SALE', false, 'TEST');
    expect(next.find((r) => r.consent_type === 'NO_DATA_SALE')?.status).toBe('DENIED');
  });
});
