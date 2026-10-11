import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetIntakeMemoryStore } from '../site00Intakes/memoryStore.js';
import { resetIntakeStoreModeCache } from '../site00Intakes/storeAdapter.js';

vi.mock('../email/sendEmail.js', () => ({
  sendEmailAsync: vi.fn(),
}));

describe('Builder spatial blueprint submission', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetIntakeMemoryStore();
    resetIntakeStoreModeCache();
  });

  it('submitIntake stores versioned blueprint snapshot for spatial drafts', async () => {
    const { startIntake, autosaveIntake, submitIntake } = await import('../site00Intakes/intakeService.js');
    const intake = await startIntake({
      intakeType: 'BUILDER',
      domainLabel: 'spatial-studio',
      userId: null,
      sourceRoute: '/bldr/studio',
    });

    const spatialState = {
      version: 1 as const,
      room: 'BLUEPRINT' as const,
      placePath: 'SIMPLE' as const,
      feelVibe: 'MODERN' as const,
      workModules: ['PAGES' as const],
      pace: 'STANDARD' as const,
      paceNotes: '',
      blueprintSection: 'OVERVIEW' as const,
      buildObjectView: 'FRONT' as const,
      savedAt: new Date().toISOString(),
    };

    await autosaveIntake('BUILDER', intake.id, { kind: 'ANONYMOUS_DIRECT' }, {
      draftPayload: {
        schemaVersion: 'builder-spatial-v1',
        spatialStudio: spatialState,
        clientRevision: 1,
        serverRevision: 0,
      },
      currentStep: 'spatial:BLUEPRINT',
    });

    const submitted = await submitIntake('BUILDER', intake.id, { kind: 'ANONYMOUS_DIRECT' });
    expect(submitted.status).toBe('SUBMITTED');
    const payload = submitted.submittedPayload as Record<string, unknown>;
    expect(payload.schemaVersion).toBe('builder-spatial-v1');
    const current = payload.current as Record<string, unknown>;
    expect(current.version).toBe(1);
    expect(current.estimatorVersion).toBeTruthy();
    expect((current.snapshot as Record<string, unknown>).submission_ready).toBe(true);
  });

  it('resubmit increments blueprint version after revision request', async () => {
    const { startIntake, autosaveIntake, submitIntake, applyAdminIntakeAction } = await import(
      '../site00Intakes/intakeService.js'
    );
    const intake = await startIntake({ intakeType: 'BUILDER', domainLabel: 'spatial-studio', userId: null });

    const draft = {
      schemaVersion: 'builder-spatial-v1',
      spatialStudio: {
        version: 1,
        room: 'BLUEPRINT',
        placePath: 'SIMPLE',
        feelVibe: 'MODERN',
        workModules: ['PAGES'],
        pace: 'STANDARD',
        paceNotes: '',
        blueprintSection: 'OVERVIEW',
        buildObjectView: 'FRONT',
        savedAt: new Date().toISOString(),
      },
      clientRevision: 1,
      serverRevision: 1,
    };

    await autosaveIntake('BUILDER', intake.id, { kind: 'ANONYMOUS_DIRECT' }, { draftPayload: draft });
    await submitIntake('BUILDER', intake.id, { kind: 'ANONYMOUS_DIRECT' });

    await applyAdminIntakeAction('BUILDER', intake.id, 'REQUEST_REVISION', 'founder@site00.com', {
      message: 'Adjust scope',
    });

    await autosaveIntake('BUILDER', intake.id, { kind: 'ANONYMOUS_DIRECT' }, {
      draftPayload: {
        ...draft,
        spatialStudio: { ...draft.spatialStudio, pace: 'EXPEDITED' },
        clientRevision: 2,
        revisionOpen: true,
      },
    });

    const resubmitted = await submitIntake('BUILDER', intake.id, { kind: 'ANONYMOUS_DIRECT' });
    const current = (resubmitted.submittedPayload as Record<string, unknown>).current as Record<string, unknown>;
    expect(current.version).toBe(2);
    const history = (resubmitted.submittedPayload as Record<string, unknown>).history as unknown[];
    expect(history.length).toBe(1);
  });
});
