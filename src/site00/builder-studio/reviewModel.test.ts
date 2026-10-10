/**
 * The client ↔ founder Blueprint loop through the REAL intake service (memory store), read back with the review
 * model both surfaces use. No mocked mutations: every state comes from intakeService.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetIntakeMemoryStore } from '../../../api/_lib/site00Intakes/memoryStore';
import { resetIntakeStoreModeCache } from '../../../api/_lib/site00Intakes/storeAdapter';
import { emptySpatialState } from '../builder-experience/spatialStudio';
import type { SpatialBuilderState } from '../builder-experience/spatialStudio';
import { draftPayloadFromEnvelope, envelopeFromSpatialState, parseBuilderSpatialDraft } from '../builder-experience/spatialStudio/intakeDraft';
import {
  blueprintVersions,
  clientReviewState,
  diffVersions,
  founderActions,
  founderReviewStage,
  revisionExchanges,
  spatialSubmission,
  staleDecisionReason,
  versionFacts,
} from './reviewModel';

vi.mock('../../../api/_lib/email/sendEmail.js', () => ({ sendEmailAsync: vi.fn() }));

const GUEST = { kind: 'ANONYMOUS_DIRECT' as const };
const state = (patch: Partial<SpatialBuilderState> = {}): SpatialBuilderState => ({
  ...emptySpatialState(),
  room: 'BLUEPRINT',
  placePath: 'ADVANCED',
  feelVibe: 'MODERN',
  workModules: ['PAGES', 'SHOP'],
  pace: 'STANDARD',
  savedAt: new Date().toISOString(),
  ...patch,
});

describe('Blueprint review loop (real intake service, memory store)', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    resetIntakeMemoryStore();
    resetIntakeStoreModeCache();
  });

  it('submission → in review → revision → resubmission, with versions preserved and states read from the record', async () => {
    const svc = await import('../../../api/_lib/site00Intakes/intakeService');
    const started = await svc.startIntake({ intakeType: 'BUILDER', domainLabel: 'spatial-studio', sourceRoute: '/bldr/studio' });
    expect(clientReviewState(started).stage).toBe('DRAFT');
    expect(founderReviewStage(started)).toBe('NOT_SUBMITTED');

    await svc.autosaveIntake('BUILDER', started.id, GUEST, { draftPayload: draftPayloadFromEnvelope(envelopeFromSpatialState(state(), null)) });
    const v1 = await svc.submitIntake('BUILDER', started.id, GUEST);
    expect(clientReviewState(v1)).toMatchObject({ stage: 'SUBMISSION_RECEIVED', label: 'SUBMISSION RECEIVED', sub: 'AWAITING FOUNDER REVIEW', version: 1, editable: false });
    expect(founderReviewStage(v1)).toBe('AWAITING_REVIEW');
    expect(founderActions(v1)).toEqual({ markInReview: true, requestRevision: true });
    // Duplicate submission is idempotent on the server: still version 1.
    const again = await svc.submitIntake('BUILDER', started.id, GUEST);
    expect(spatialSubmission(again)!.current.version).toBe(1);

    const inReview = await svc.applyAdminIntakeAction('BUILDER', started.id, 'MARK_IN_REVIEW', 'founder@site00.test');
    expect(clientReviewState(inReview).stage).toBe('UNDER_REVIEW');
    expect(founderActions(inReview)).toEqual({ markInReview: false, requestRevision: true });

    const reopened = await svc.applyAdminIntakeAction('BUILDER', started.id, 'REQUEST_REVISION', 'founder@site00.test', { message: 'Add booking.' });
    const asked = clientReviewState(reopened);
    expect(asked).toMatchObject({ stage: 'REVISION_REQUESTED', version: 1, editable: true });
    expect(asked.request).toMatchObject({ message: 'Add booking.', forVersion: 1 });
    expect(founderReviewStage(reopened)).toBe('REVISION_REQUESTED');
    expect(founderActions(reopened)).toEqual({ markInReview: false, requestRevision: false });

    const prev = parseBuilderSpatialDraft(reopened.draftPayload);
    await svc.autosaveIntake('BUILDER', started.id, GUEST, {
      draftPayload: draftPayloadFromEnvelope(envelopeFromSpatialState(state({ workModules: ['PAGES', 'SHOP', 'BOOKING'], paceNotes: 'Spring launch.' }), prev)),
    });
    const v2 = await svc.submitIntake('BUILDER', started.id, GUEST);
    expect(clientReviewState(v2)).toMatchObject({ stage: 'REVISION_SUBMITTED', version: 2, editable: false });
    expect(founderReviewStage(v2)).toBe('REVISED_AWAITING_REVIEW');

    const versions = blueprintVersions(spatialSubmission(v2));
    expect(versions.map((v) => v.version)).toEqual([1, 2]);
    expect(versions[0].spatialState.workModules).toEqual(['PAGES', 'SHOP']);
    const changes = diffVersions(versionFacts(versions[0]), versionFacts(versions[1]));
    expect(changes.map((c) => c.label)).toEqual(expect.arrayContaining(['WORK', 'CLIENT NOTE']));
    expect(versionFacts(versions[1]).investment).toMatch(/^\$\d+K–\$\d+K$/);

    const exchanges = revisionExchanges(v2);
    expect(exchanges).toHaveLength(1);
    expect(exchanges[0].request.forSubmissionVersion).toBe(1);
    expect(exchanges[0].response?.version).toBe(2);

    // An outdated decision taken on version 1 is detected against the fresh record.
    expect(staleDecisionReason(v2, { version: 1, status: 'IN_REVIEW' })).toMatch(/VERSION 2 ARRIVED/);
    expect(staleDecisionReason(v2, { version: 2, status: 'SUBMITTED' })).toBeNull();
    expect(staleDecisionReason(v2, { version: 2, status: 'IN_REVIEW' })).toMatch(/MOVED FROM IN REVIEW TO SUBMITTED/);
  });

  it('never shows REFINED ESTIMATE or ACCEPTED without the record supporting it', async () => {
    const svc = await import('../../../api/_lib/site00Intakes/intakeService');
    const started = await svc.startIntake({ intakeType: 'BUILDER', domainLabel: 'spatial-studio' });
    await svc.autosaveIntake('BUILDER', started.id, GUEST, { draftPayload: draftPayloadFromEnvelope(envelopeFromSpatialState(state(), null)) });
    const v1 = await svc.submitIntake('BUILDER', started.id, GUEST);
    const stages = new Set([clientReviewState(v1).stage]);
    expect(stages.has('ACCEPTED')).toBe(false);
    expect(clientReviewState({ ...v1, status: 'CONVERTED', projectId: 'p_1' })).toMatchObject({ stage: 'ACCEPTED', sub: 'NEXT STEP AVAILABLE' });
    expect(clientReviewState({ ...v1, status: 'CONVERTED', projectId: null }).sub).toBe('SITE 00 WILL CONTACT YOU WITH THE NEXT STEP');
  });
});

describe('status track reads only the review stage', () => {
  it('marks a step done only when the record holds it', async () => {
    const { reviewTrack } = await import('./reviewModel');
    expect(reviewTrack('DRAFT').map((s) => s.state)).toEqual(['current', 'pending', 'pending']);
    expect(reviewTrack('SUBMISSION_RECEIVED', 1).map((s) => s.state)).toEqual(['done', 'current', 'pending']);
    expect(reviewTrack('SUBMISSION_RECEIVED', 1)[0].sub).toBe('RECEIVED · V1');
    expect(reviewTrack('UNDER_REVIEW', 2)[1].sub).toBe('IN PROGRESS');
    expect(reviewTrack('REVISION_REQUESTED', 1).map((s) => s.state)).toEqual(['done', 'done', 'attention']);
    expect(reviewTrack('ACCEPTED', 1)[2]).toMatchObject({ label: 'ACCEPTED', state: 'done' });
    // Nothing before a decision claims one.
    for (const stage of ['DRAFT', 'SUBMISSION_RECEIVED', 'UNDER_REVIEW'] as const) {
      expect(reviewTrack(stage)[2]).toMatchObject({ label: 'SITE 00 REPLIES', state: 'pending' });
    }
  });
});
