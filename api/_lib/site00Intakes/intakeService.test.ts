import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetIntakeMemoryStore } from './memoryStore.js';
import { resetIntakeStoreModeCache, useMemoryStore, resolveIntakeStoreMode } from './storeAdapter.js';
import { IntakeStoreUnavailableError } from './storeAdapter.js';
import { hashToken } from './tokens.js';
import * as store from './storeAdapter.js';

const sendEmailAsync = vi.fn();
vi.mock('../email/sendEmail.js', () => ({
  sendEmailAsync: (...args: unknown[]) => sendEmailAsync(...args),
}));

async function importService() {
  return await import('./intakeService.js');
}

describe('SITE 00 canonical Identity + Builder intake service', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetIntakeMemoryStore();
    resetIntakeStoreModeCache();
    sendEmailAsync.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetIntakeStoreModeCache();
  });

  it('uses the in-memory store under VITEST (never touches real Supabase in unit tests)', async () => {
    expect(useMemoryStore()).toBe(true);
    expect(await resolveIntakeStoreMode()).toBe('memory');
  });

  it('production mode fails loudly without Supabase — no silent memory fallback', async () => {
    vi.stubEnv('VITEST', '');
    resetIntakeStoreModeCache();
    const { hasSupabaseServiceRole } = await import('../supabase.js');
    if (hasSupabaseServiceRole()) {
      expect(await resolveIntakeStoreMode()).toBe('supabase');
    } else {
      await expect(resolveIntakeStoreMode()).rejects.toBeInstanceOf(IntakeStoreUnavailableError);
    }
    vi.stubEnv('VITEST', 'true');
    resetIntakeStoreModeCache();
  });

  it('guest Identity intake creates a canonical server draft (no account required)', async () => {
    const { startIntake } = await importService();
    const intake = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    expect(intake.id).toBeTruthy();
    expect(intake.intakeType).toBe('IDENTITY');
    expect(intake.status).toBe('DRAFT');
    expect(intake.ownerKind).toBe('GUEST');
    expect(intake.publicReference.startsWith('IDN-')).toBe(true);
  });

  it('guest Builder intake creates a canonical server draft (no account required)', async () => {
    const { startIntake } = await importService();
    const intake = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: null });
    expect(intake.intakeType).toBe('BUILDER');
    expect(intake.ownerKind).toBe('GUEST');
    expect(intake.publicReference.startsWith('BLD-')).toBe(true);
  });

  it('authenticated Identity intake creates a canonical server draft owned by the user', async () => {
    const { startIntake } = await importService();
    const intake = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: 'user-1', email: 'user@example.com' });
    expect(intake.ownerKind).toBe('AUTHENTICATED');
  });

  it('authenticated Builder intake creates a canonical server draft owned by the user', async () => {
    const { startIntake } = await importService();
    const intake = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: 'user-1', email: 'user@example.com' });
    expect(intake.ownerKind).toBe('AUTHENTICATED');
  });

  it('starting again while an active authenticated draft exists resumes it instead of duplicating (XXXI/XXXII)', async () => {
    const { startIntake } = await importService();
    const first = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: 'user-1' });
    const second = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: 'user-1' });
    expect(second.id).toBe(first.id);
    const list = await (await importService()).listMyIntakes('user-1');
    expect(list.filter((i) => i.intakeType === 'IDENTITY').length).toBe(1);
  });

  it('autosave persists draft answers and records last_saved_at', async () => {
    const { startIntake, autosaveIntake } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    const before = started.lastSavedAt;
    const updated = await autosaveIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, {
      draftPayload: { q1: 'answer one' },
      currentStep: 'step-2',
    });
    expect(updated.draftPayload.q1).toBe('answer one');
    expect(updated.lastSavedAt).not.toBe(before);
    expect(updated.currentStep).toBe('step-2');
    expect(updated.status).toBe('ACTIVE');
  });

  it('refresh restores server state — a fresh fetch returns the same persisted draft', async () => {
    const { startIntake, autosaveIntake, getIntakeForAccess } = await importService();
    const started = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: 'user-1' });
    await autosaveIntake('BUILDER', started.id, { kind: 'AUTHENTICATED', userId: 'user-1' }, {
      draftPayload: { audience: 'consumer' },
    });
    const reloaded = await getIntakeForAccess('BUILDER', started.id, { kind: 'AUTHENTICATED', userId: 'user-1' });
    expect(reloaded.draftPayload.audience).toBe('consumer');
  });

  it('guest email association persists on the intake record', async () => {
    const { startIntake, sendGuestAccess } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    const result = await sendGuestAccess('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { email: 'guest@example.com' });
    expect(result.intake.email).toBe('guest@example.com');
    expect(result.intake.status).toBe('AWAITING_EMAIL_VERIFICATION');
  });

  it('secure access token is generated on send-access and the raw token is never persisted', async () => {
    const { startIntake, sendGuestAccess } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    const result = await sendGuestAccess('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { email: 'guest@example.com' });
    expect(result.rawToken).toBeTruthy();
    const stored = await store.getAccessTokenByHash(hashToken(result.rawToken));
    expect(stored).not.toBeNull();
    expect(JSON.stringify(stored)).not.toContain(result.rawToken);
  });

  it('token resolves the correct intake and issues an INTAKE_RESUMED audit event', async () => {
    const { startIntake, sendGuestAccess, resolveIntakeByGuestToken, listIntakeAuditEvents } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    const { rawToken } = await sendGuestAccess('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { email: 'guest@example.com' });
    const resolution = await resolveIntakeByGuestToken(rawToken);
    expect(resolution.ok).toBe(true);
    if (resolution.ok) expect(resolution.intake.id).toBe(started.id);
    const events = await listIntakeAuditEvents('IDENTITY', started.id);
    expect(events.some((e) => e.eventType === 'INTAKE_RESUMED')).toBe(true);
  });

  it('cross-user access is denied at the service boundary', async () => {
    const { startIntake, getIntakeForAccess, autosaveIntake } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: 'user-1' });
    await expect(getIntakeForAccess('IDENTITY', started.id, { kind: 'AUTHENTICATED', userId: 'user-2' })).rejects.toThrow();
    await expect(
      autosaveIntake('IDENTITY', started.id, { kind: 'AUTHENTICATED', userId: 'user-2' }, { draftPayload: { x: 1 } }),
    ).rejects.toThrow();
  });

  it('a guest cannot autosave someone else\'s already-claimed intake even with a stale ANONYMOUS_DIRECT context', async () => {
    const { startIntake, autosaveIntake } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: 'user-1' });
    await expect(
      autosaveIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { draftPayload: { x: 1 } }),
    ).rejects.toThrow();
  });

  it('save failure surfaces as a thrown error rather than a silent success (FAIL LOUD)', async () => {
    const { autosaveIntake } = await importService();
    await expect(
      autosaveIntake('IDENTITY', 'does-not-exist', { kind: 'ANONYMOUS_DIRECT' }, { draftPayload: { x: 1 } }),
    ).rejects.toThrow();
  });

  it('submission persists an immutable snapshot and transitions to SUBMITTED', async () => {
    const { startIntake, autosaveIntake, submitIntake } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null, email: 'guest@example.com' });
    await autosaveIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { draftPayload: { q1: 'final answer' } });
    const submitted = await submitIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' });
    expect(submitted.status).toBe('SUBMITTED');
    expect(submitted.submittedAt).toBeTruthy();
    expect(submitted.submittedPayload?.q1).toBe('final answer');
  });

  it('duplicate submit requests are idempotent — no duplicate submission/version bump', async () => {
    const { startIntake, submitIntake } = await importService();
    const started = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: null, email: 'guest@example.com' });
    const first = await submitIntake('BUILDER', started.id, { kind: 'ANONYMOUS_DIRECT' });
    const second = await submitIntake('BUILDER', started.id, { kind: 'ANONYMOUS_DIRECT' });
    expect(second.submittedAt).toBe(first.submittedAt);
    expect(second.version).toBe(first.version);
  });

  it('submitted snapshot is not silently mutated by a later autosave attempt', async () => {
    const { startIntake, autosaveIntake, submitIntake } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    await autosaveIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { draftPayload: { q1: 'original' } });
    const submitted = await submitIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' });
    expect(submitted.submittedPayload?.q1).toBe('original');

    await expect(
      autosaveIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { draftPayload: { q1: 'tampered' } }),
    ).rejects.toThrow();

    const { getIntakeForAdmin } = await importService();
    const reloaded = await getIntakeForAdmin('IDENTITY', started.id);
    expect(reloaded?.submittedPayload?.q1).toBe('original');
  });

  it('completion email event is created exactly once even across a duplicate submit', async () => {
    const { startIntake, submitIntake } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null, email: 'guest@example.com' });
    await submitIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' });
    await submitIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' });
    const receiptCalls = sendEmailAsync.mock.calls.filter(([opts]) => (opts as { templateType: string }).templateType === 'intake-submission-receipt');
    expect(receiptCalls.length).toBe(1);
  });

  it('email payload contains no secrets (no token, no password, no service-role fields)', async () => {
    const { startIntake, sendGuestAccess } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    await sendGuestAccess('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { email: 'guest@example.com' });
    expect(sendEmailAsync).toHaveBeenCalledTimes(1);
    const [opts] = sendEmailAsync.mock.calls[0] as [{ variables: Record<string, unknown> }];
    const serialized = JSON.stringify(opts.variables);
    expect(serialized).not.toMatch(/token/i);
    expect(serialized).not.toMatch(/password/i);
    expect(serialized).not.toMatch(/service_role/i);
  });

  it('guest claim succeeds after verified authentication and preserves the original intake id', async () => {
    const { startIntake, sendGuestAccess, submitIntake, claimGuestIntakesForVerifiedEmail } = await importService();
    const started = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: null });
    await sendGuestAccess('BUILDER', started.id, { kind: 'ANONYMOUS_DIRECT' }, { email: 'claimable@example.com' });
    await submitIntake('BUILDER', started.id, { kind: 'ANONYMOUS_DIRECT' });

    const claimed = await claimGuestIntakesForVerifiedEmail('user-42', 'claimable@example.com');
    expect(claimed.length).toBe(1);
    expect(claimed[0].id).toBe(started.id);
    expect(claimed[0].ownerKind).toBe('AUTHENTICATED');
  });

  it('claim does not duplicate the intake — the claimed record remains the only record for that user', async () => {
    const { startIntake, sendGuestAccess, submitIntake, claimGuestIntakesForVerifiedEmail, listMyIntakes } = await importService();
    const started = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: null });
    await sendGuestAccess('BUILDER', started.id, { kind: 'ANONYMOUS_DIRECT' }, { email: 'claimable2@example.com' });
    await submitIntake('BUILDER', started.id, { kind: 'ANONYMOUS_DIRECT' });
    await claimGuestIntakesForVerifiedEmail('user-99', 'claimable2@example.com');
    await claimGuestIntakesForVerifiedEmail('user-99', 'claimable2@example.com'); // retry / re-sign-in
    const mine = await listMyIntakes('user-99');
    expect(mine.filter((i) => i.id === started.id).length).toBe(1);
  });

  it('wrong-account claim (different verified email) is denied — nothing is claimed', async () => {
    const { startIntake, sendGuestAccess, submitIntake, claimGuestIntakesForVerifiedEmail } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    await sendGuestAccess('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' }, { email: 'owner@example.com' });
    await submitIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' });

    const claimed = await claimGuestIntakesForVerifiedEmail('user-other', 'someone-else@example.com');
    expect(claimed.length).toBe(0);
  });

  it('authenticated client index returns only that user\'s own intakes', async () => {
    const { startIntake, listMyIntakes } = await importService();
    await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: 'user-a' });
    await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: 'user-b' });
    const listA = await listMyIntakes('user-a');
    const listB = await listMyIntakes('user-b');
    expect(listA.every((i) => i.ownerKind === 'AUTHENTICATED')).toBe(true);
    expect(listA.length).toBe(1);
    expect(listB.length).toBe(1);
    expect(listA[0].id).not.toBe(listB[0].id);
  });

  it('admin inbox returns canonical submissions across both intake types', async () => {
    const { startIntake, submitIntake, listIntakesForAdmin } = await importService();
    const idn = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null, email: 'a@example.com' });
    await submitIntake('IDENTITY', idn.id, { kind: 'ANONYMOUS_DIRECT' });
    const bld = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: null, email: 'b@example.com' });
    await submitIntake('BUILDER', bld.id, { kind: 'ANONYMOUS_DIRECT' });

    const all = await listIntakesForAdmin({});
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all.some((i) => i.id === idn.id)).toBe(true);
    expect(all.some((i) => i.id === bld.id)).toBe(true);
  });

  it('admin filters (type/status/owner) narrow results correctly', async () => {
    const { startIntake, submitIntake, listIntakesForAdmin } = await importService();
    await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: 'user-1' });
    const guestBuilder = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: null, email: 'x@example.com' });
    await submitIntake('BUILDER', guestBuilder.id, { kind: 'ANONYMOUS_DIRECT' });

    const builderOnly = await listIntakesForAdmin({ intakeType: 'BUILDER' });
    expect(builderOnly.every((i) => i.intakeType === 'BUILDER')).toBe(true);

    const submittedOnly = await listIntakesForAdmin({ status: 'SUBMITTED' });
    expect(submittedOnly.every((i) => i.status === 'SUBMITTED')).toBe(true);

    const guestOnly = await listIntakesForAdmin({ ownerKind: 'GUEST' });
    expect(guestOnly.every((i) => i.ownerKind === 'GUEST')).toBe(true);
  });

  it('admin detail shows draft/submitted payload and audit timeline (lineage-ready)', async () => {
    const { startIntake, submitIntake, getIntakeForAdmin, listIntakeAuditEvents } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null, email: 'lineage@example.com' });
    await submitIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' });
    const detail = await getIntakeForAdmin('IDENTITY', started.id);
    expect(detail?.submittedPayload).not.toBeNull();
    const events = await listIntakeAuditEvents('IDENTITY', started.id);
    expect(events.some((e) => e.eventType === 'INTAKE_CREATED')).toBe(true);
    expect(events.some((e) => e.eventType === 'INTAKE_SUBMITTED')).toBe(true);
  });

  it('admin MARK_IN_REVIEW and ARCHIVE transitions are conservative and audited, never rewriting submitted content', async () => {
    const { startIntake, submitIntake, applyAdminIntakeAction, listIntakeAuditEvents } = await importService();
    const started = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: null, email: 'review@example.com' });
    await submitIntake('BUILDER', started.id, { kind: 'ANONYMOUS_DIRECT' });
    const originalPayload = (await (await importService()).getIntakeForAdmin('BUILDER', started.id))?.submittedPayload;

    const inReview = await applyAdminIntakeAction('BUILDER', started.id, 'MARK_IN_REVIEW', 'admin@frontalslayer.com');
    expect(inReview.status).toBe('IN_REVIEW');
    expect(inReview.submittedPayload).toEqual(originalPayload);

    const archived = await applyAdminIntakeAction('BUILDER', started.id, 'ARCHIVE', 'admin@frontalslayer.com');
    expect(archived.status).toBe('ARCHIVED');

    const events = await listIntakeAuditEvents('BUILDER', started.id);
    expect(events.some((e) => e.eventType === 'INTAKE_MARKED_IN_REVIEW')).toBe(true);
    expect(events.some((e) => e.eventType === 'INTAKE_ARCHIVED')).toBe(true);
  });

  it('Identity and Builder intakes remain distinguishable throughout the lifecycle', async () => {
    const { startIntake } = await importService();
    const idn = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null });
    const bld = await startIntake({ intakeType: 'BUILDER', domainLabel: 'site', userId: null });
    expect(idn.intakeType).toBe('IDENTITY');
    expect(bld.intakeType).toBe('BUILDER');
    expect(idn.publicReference).not.toBe(bld.publicReference);
  });

  it('submitting from an illegal status (e.g. already ARCHIVED) is rejected server-side', async () => {
    const { startIntake, submitIntake, applyAdminIntakeAction } = await importService();
    const started = await startIntake({ intakeType: 'IDENTITY', domainLabel: 'discovery', userId: null, email: 'x@example.com' });
    await submitIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' });
    await applyAdminIntakeAction('IDENTITY', started.id, 'ARCHIVE', 'admin@frontalslayer.com');
    await expect(submitIntake('IDENTITY', started.id, { kind: 'ANONYMOUS_DIRECT' })).rejects.toThrow();
  });
});
