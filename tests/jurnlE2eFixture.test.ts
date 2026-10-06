import { describe, expect, it } from 'vitest';
import { buildJurnlE2eBootstrap, JURNL_E2E_USER_ID } from '../src/projects/jurnl/e2e/fixture';

describe('JURNL E2E fixture', () => {
  it('builds deterministic repository v5 snapshot', () => {
    const b = buildJurnlE2eBootstrap();
    expect(b.snapshot.userId).toBe(JURNL_E2E_USER_ID);
    expect(b.snapshot.schemaVersion).toBe(5);
    expect(b.snapshot.accounts.length).toBeGreaterThan(0);
    expect(b.session.status).toBe('ACTIVE');
  });
});
