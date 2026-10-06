import { describe, expect, it, beforeEach } from 'vitest';
import { addedEntries } from '../src/projects/jurnl/data/home/money';
import { cachedRepoView, resetCachedRepoViewsForTests } from '../src/projects/jurnl/data/repository/cachedRepoView';
import { getRepository, resetRepositoryForDev, setRepositoryUserId } from '../src/projects/jurnl/data/repository/deviceRepository';

describe('cachedRepoView', () => {
  beforeEach(() => {
    resetCachedRepoViewsForTests();
    setRepositoryUserId('cached-repo-test');
    resetRepositoryForDev();
  });

  it('returns stable array reference until repository updates', () => {
    const a = addedEntries();
    const b = addedEntries();
    expect(a).toBe(b);
    getRepository().appendTransaction({
      merchant: 'TEST',
      amount: 1,
      direction: 'EXPENSE',
      when: 'TODAY',
      account: 'CHECKING',
      category: 'OTHER',
    });
    const c = addedEntries();
    expect(a.length).toBe(0);
    expect(c.length).toBe(1);
    expect(c).not.toBe(a);
    expect(c[0]?.merchant).toBe('TEST');
    expect(cachedRepoView('probe', () => ({ n: 1 }))).toEqual({ n: 1 });
  });
});
