/**
 * Grant + audit atomicity and concurrency (memory store mirrors DB transaction semantics).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  __memoryAuditRowsForTests,
  __setMemoryAuditFailNextForTests,
  listActiveInternalGrants,
  resetInternalGrantStoreForTests,
  revokeInternalGrant,
  upsertInternalGrant,
} from '../api/_lib/jurnlEntitlements/internalGrantStore.js';

const ADMIN = '11111111-1111-4111-8111-000000000099';
const P1 = '11111111-1111-4111-8111-111111111111';

beforeEach(() => {
  resetInternalGrantStoreForTests();
});

describe('Atomic grant + audit (memory)', () => {
  it('successful GRANT creates audit evidence', async () => {
    const r = await upsertInternalGrant({
      grant_type: 'FOUNDER_FULL',
      principal_id: P1,
      project_id: 'jurnl',
      granted_by: ADMIN,
      reason: 'T_GRANT',
    });
    expect(r.ok).toBe(true);
    expect(__memoryAuditRowsForTests()).toHaveLength(1);
    expect(__memoryAuditRowsForTests()[0]?.action).toBe('GRANT');
  });

  it('successful REVOKE creates audit evidence', async () => {
    await upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: P1, project_id: 'jurnl', granted_by: ADMIN, reason: 'X' });
    const r = await revokeInternalGrant('jurnl', P1, 'FOUNDER_FULL', ADMIN, 'T_REVOKE');
    expect(r.ok).toBe(true);
    expect(__memoryAuditRowsForTests().filter((a) => a.action === 'REVOKE')).toHaveLength(1);
  });

  it('forced audit failure rolls back GRANT', async () => {
    __setMemoryAuditFailNextForTests(true);
    const r = await upsertInternalGrant({
      grant_type: 'FOUNDER_FULL',
      principal_id: P1,
      project_id: 'jurnl',
      granted_by: ADMIN,
      reason: 'FAIL',
    });
    expect(r.ok).toBe(false);
    expect(await listActiveInternalGrants('jurnl', P1)).toHaveLength(0);
    expect(__memoryAuditRowsForTests()).toHaveLength(0);
  });

  it('forced audit failure rolls back REVOKE', async () => {
    await upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: P1, project_id: 'jurnl', granted_by: ADMIN, reason: 'X' });
    __setMemoryAuditFailNextForTests(true);
    const r = await revokeInternalGrant('jurnl', P1, 'FOUNDER_FULL', ADMIN, 'FAIL');
    expect(r.ok).toBe(false);
    expect(await listActiveInternalGrants('jurnl', P1)).toHaveLength(1);
    expect(__memoryAuditRowsForTests().filter((a) => a.action === 'REVOKE')).toHaveLength(0);
  });

  it('concurrent GRANT preserves one active grant', async () => {
    await Promise.all([
      upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: P1, project_id: 'jurnl', granted_by: ADMIN, reason: 'A' }),
      upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: P1, project_id: 'jurnl', granted_by: ADMIN, reason: 'B' }),
      upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: P1, project_id: 'jurnl', granted_by: ADMIN, reason: 'C' }),
    ]);
    expect(await listActiveInternalGrants('jurnl', P1)).toHaveLength(1);
  });

  it('revoked grant does not reactivate without new GRANT', async () => {
    await upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: P1, project_id: 'jurnl', granted_by: ADMIN, reason: 'X' });
    await revokeInternalGrant('jurnl', P1, 'FOUNDER_FULL', ADMIN, 'DONE');
    expect(await listActiveInternalGrants('jurnl', P1)).toHaveLength(0);
    const again = await revokeInternalGrant('jurnl', P1, 'FOUNDER_FULL', ADMIN, 'AGAIN');
    expect(again.ok).toBe(false);
  });

  it('new GRANT after REVOKE creates a new active row', async () => {
    await upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: P1, project_id: 'jurnl', granted_by: ADMIN, reason: 'FIRST' });
    await revokeInternalGrant('jurnl', P1, 'FOUNDER_FULL', ADMIN, 'STOP');
    const r = await upsertInternalGrant({ grant_type: 'FOUNDER_FULL', principal_id: P1, project_id: 'jurnl', granted_by: ADMIN, reason: 'SECOND' });
    expect(r.ok).toBe(true);
    expect(await listActiveInternalGrants('jurnl', P1)).toHaveLength(1);
    expect(__memoryAuditRowsForTests().length).toBeGreaterThanOrEqual(3);
  });
});
