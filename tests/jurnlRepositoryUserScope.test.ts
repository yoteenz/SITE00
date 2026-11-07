/**
 * Design-preview repository scope: remembered viewer vs preview-guest, and guest → signed-in merge.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createManualAccount } from '../src/projects/jurnl/data/foundation/accountMutations';
import { listActiveAccounts } from '../src/projects/jurnl/data/foundation/accounts';
import {
  getRepository,
  peekDeviceSnapshot,
  resetRepositoryForDev,
  setRepositoryUserId,
} from '../src/projects/jurnl/data/repository/deviceRepository';
import { resolveRepositoryUserId } from '../src/projects/jurnl/data/repository/repositoryUserId';

describe('resolveRepositoryUserId', () => {
  it('prefers the active session email, then remembered, then preview-guest', () => {
    expect(
      resolveRepositoryUserId({ mode: 'design-preview', sessionEmail: 'a@x.com', rememberedEmail: 'b@x.com' }),
    ).toBe('A@X.COM');
    expect(resolveRepositoryUserId({ mode: 'design-preview', sessionEmail: null, rememberedEmail: 'b@x.com' })).toBe(
      'B@X.COM',
    );
    expect(resolveRepositoryUserId({ mode: 'design-preview', sessionEmail: null, rememberedEmail: null })).toBe(
      'preview-guest',
    );
    expect(
      resolveRepositoryUserId({ mode: 'production', sessionEmail: null, rememberedEmail: 'b@x.com' }),
    ).toBe('preview-guest');
  });
});

describe('preview-guest pocket merge on unlock', () => {
  beforeEach(() => {
    resetRepositoryForDev();
    setRepositoryUserId('preview-guest');
    resetRepositoryForDev();
  });

  it('copies manual pockets from preview-guest into the remembered viewer on user switch', () => {
    setRepositoryUserId('preview-guest');
    createManualAccount('MY POCKET', 'SAVINGS', 120);
    expect(listActiveAccounts().some((a) => a.display_name === 'MY POCKET')).toBe(true);

    setRepositoryUserId('founder@jurnl.test');

    const snap = peekDeviceSnapshot('founder@jurnl.test');
    expect(snap?.accounts.some((a) => a.display_name === 'MY POCKET' && a.balance === 120)).toBe(true);
    expect(getRepository().userId).toBe('founder@jurnl.test');
    expect(listActiveAccounts().some((a) => a.display_name === 'MY POCKET')).toBe(true);
  });
});
