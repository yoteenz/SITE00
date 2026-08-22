import { describe, expect, it } from 'vitest';
import { assertIntakeAccess, hasIntakeAccess, IntakeAccessDeniedError } from './authorization.js';
import type { IntakeRecord } from './types.js';

function makeRecord(overrides: Partial<IntakeRecord> = {}): IntakeRecord {
  return {
    id: 'intake-1',
    intakeType: 'IDENTITY',
    identityId: null,
    userId: null,
    email: null,
    verifiedEmailAt: null,
    status: 'DRAFT',
    domainLabel: 'discovery',
    draftPayload: {},
    submittedPayload: null,
    currentStep: null,
    totalSteps: null,
    source: 'WEB',
    sourceRoute: null,
    projectId: null,
    publicReference: 'IDN-TEST0001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSavedAt: null,
    submittedAt: null,
    claimedAt: null,
    claimedByUserId: null,
    version: 1,
    schemaVersion: 1,
    ...overrides,
  };
}

describe('server-authoritative intake authorization', () => {
  it('owner (matching userId) is granted access', () => {
    const record = makeRecord({ userId: 'user-1' });
    expect(() => assertIntakeAccess(record, { kind: 'AUTHENTICATED', userId: 'user-1' })).not.toThrow();
  });

  it('cross-user access is denied — a different authenticated user cannot touch another user\'s intake', () => {
    const record = makeRecord({ userId: 'user-1' });
    expect(() => assertIntakeAccess(record, { kind: 'AUTHENTICATED', userId: 'user-2' })).toThrow(IntakeAccessDeniedError);
  });

  it('cross-org denial is enforced transitively via per-owner ownership — a user from another org has a different userId and is denied', () => {
    const record = makeRecord({ userId: 'org-a-user-1' });
    expect(hasIntakeAccess(record, { kind: 'AUTHENTICATED', userId: 'org-b-user-1' })).toBe(false);
  });

  it('a guest with a token scoped to a DIFFERENT intake id is denied (forged/cross-intake token)', () => {
    const record = makeRecord({ id: 'intake-1', userId: null });
    expect(() =>
      assertIntakeAccess(record, { kind: 'GUEST', tokenIntakeType: 'IDENTITY', tokenIntakeId: 'intake-999' }),
    ).toThrow(IntakeAccessDeniedError);
  });

  it('a guest with a token scoped to a DIFFERENT intake type is denied', () => {
    const record = makeRecord({ id: 'intake-1', intakeType: 'IDENTITY', userId: null });
    expect(() =>
      assertIntakeAccess(record, { kind: 'GUEST', tokenIntakeType: 'BUILDER', tokenIntakeId: 'intake-1' }),
    ).toThrow(IntakeAccessDeniedError);
  });

  it('a valid guest token scoped to this exact intake is granted access', () => {
    const record = makeRecord({ id: 'intake-1', intakeType: 'BUILDER', userId: null });
    expect(() =>
      assertIntakeAccess(record, { kind: 'GUEST', tokenIntakeType: 'BUILDER', tokenIntakeId: 'intake-1' }),
    ).not.toThrow();
  });

  it('a guest token never grants access once the intake has been claimed by an account', () => {
    const record = makeRecord({ id: 'intake-1', userId: 'user-1' });
    expect(() =>
      assertIntakeAccess(record, { kind: 'GUEST', tokenIntakeType: 'IDENTITY', tokenIntakeId: 'intake-1' }),
    ).toThrow(IntakeAccessDeniedError);
  });

  it('ANONYMOUS_DIRECT is only granted for still-unowned drafts', () => {
    const unowned = makeRecord({ userId: null });
    const owned = makeRecord({ userId: 'user-1' });
    expect(hasIntakeAccess(unowned, { kind: 'ANONYMOUS_DIRECT' })).toBe(true);
    expect(hasIntakeAccess(owned, { kind: 'ANONYMOUS_DIRECT' })).toBe(false);
  });

  it('NONE context is always denied (experience/UI context never grants access)', () => {
    const record = makeRecord({ userId: null });
    expect(hasIntakeAccess(record, { kind: 'NONE' })).toBe(false);
  });
});
