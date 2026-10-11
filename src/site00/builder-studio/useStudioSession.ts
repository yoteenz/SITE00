/**
 * The studio's view of Composer's server-backed session (`useBuilderSpatialIntakeSession`).
 *
 * This is a presentation adapter, not a second engine: state, persistence, conflict handling and submission all
 * stay in the hook. It adds what the visual layer needs on top — patch-style updates that never drop a change made
 * in the same tick, the submitted version to show once the Blueprint is locked, the client's review stage, and the
 * save status worded for the studio.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { clientEstimatePreviewEnabled } from '../../studioos/estimation/flags';
import {
  SPATIAL_INTAKE_DOMAIN_LABEL,
  SPATIAL_INTAKE_SOURCE_ROUTE,
  draftPayloadFromEnvelope,
  envelopeFromSpatialState,
  parseBuilderSpatialDraft,
} from '../builder-experience/spatialStudio/intakeDraft';
import { snapshotFromSpatialState, useBuilderSpatialIntakeSession } from '../builder-experience/spatialStudio';
import type { BlueprintSessionSnapshot, SpatialBuilderState, SpatialIntakeSyncStatus } from '../builder-experience/spatialStudio';
import { clientReviewState, spatialSubmission, versionSnapshot } from './reviewModel';

export type SaveIndicator = {
  /** Contract status the label was derived from. */
  status: SpatialIntakeSyncStatus;
  tone: 'quiet' | 'busy' | 'ok' | 'warn' | 'error';
  label: string;
  detail: string | null;
  /** A retry makes sense (the server did not take the latest change). */
  retry: boolean;
};

function timeOf(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Save status, worded. SAVED appears only after the canonical intake API confirmed the write; anything that only
 * reached this device says so.
 */
export function saveIndicator(input: {
  status: SpatialIntakeSyncStatus;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
  errorMessage: string | null;
  conflictReason: string | null;
  /** A real conflict was resolved by keeping the device's newer choices (now saved). */
  recoveredLocal?: boolean;
}): SaveIndicator {
  const { status, saveState, lastSavedAt, errorMessage } = input;
  switch (status) {
    case 'restoring':
      return { status, tone: 'busy', label: 'RESTORING', detail: 'LOADING YOUR BLUEPRINT FROM SITE 00', retry: false };
    case 'saving':
      return { status, tone: 'busy', label: 'SAVING', detail: null, retry: false };
    case 'saved':
    case 'restored':
      return {
        status,
        tone: 'ok',
        label: lastSavedAt ? `SAVED · ${timeOf(lastSavedAt)}` : 'SAVED',
        detail: input.recoveredLocal ? 'CONFLICT RESOLVED: YOUR NEWER ON-DEVICE CHANGES WERE KEPT AND SAVED TO SITE 00' : 'SAVED TO SITE 00',
        retry: false,
      };
    case 'unsaved':
      return { status, tone: 'quiet', label: 'UNSAVED CHANGES', detail: null, retry: false };
    case 'local_only':
      return {
        status,
        tone: 'warn',
        label: 'LOCAL ONLY',
        detail: `SAVED ON THIS DEVICE ONLY. SITE 00 COULD NOT BE REACHED${errorMessage ? ` (${errorMessage.toUpperCase()})` : ''}.`,
        retry: true,
      };
    case 'sync_failed':
      return {
        status,
        tone: 'error',
        label: 'SYNC FAILED',
        detail: `YOUR LATEST CHANGE IS ON THIS DEVICE BUT NOT YET WITH SITE 00${errorMessage ? ` (${errorMessage.toUpperCase()})` : ''}.`,
        retry: true,
      };
    case 'conflict':
      // The hook keeps the newer on-device copy and pushes it; say whether the server has taken it yet.
      // Shown only while the device holds newer, different choices than SITE 00 (the hook is pushing them).
      if (saveState === 'error') return { status, tone: 'error', label: 'CONFLICT', detail: 'YOUR NEWER ON-DEVICE CHANGES ARE NOT YET WITH SITE 00', retry: true };
      return { status, tone: 'warn', label: 'CONFLICT · KEEPING NEWER', detail: 'THIS DEVICE HAS NEWER CHOICES THAN SITE 00. KEEPING THEM AND SAVING.', retry: false };
    case 'submitting':
      return { status, tone: 'busy', label: 'SUBMITTING', detail: null, retry: false };
    case 'submitted':
      return { status, tone: 'ok', label: 'SUBMITTED', detail: 'LOCKED WHILE SITE 00 REVIEWS IT', retry: false };
    case 'submission_failed':
      return { status, tone: 'error', label: 'NOT SUBMITTED', detail: errorMessage ? errorMessage.toUpperCase() : 'SITE 00 DID NOT CONFIRM THE SUBMISSION', retry: false };
    case 'idle':
    default:
      return { status, tone: 'quiet', label: '', detail: null, retry: false };
  }
}

/** The client's choices (navigation and timestamps excluded). */
export function sameChoices(a: SpatialBuilderState | null, b: SpatialBuilderState | null): boolean {
  if (!a || !b) return a === b;
  return (
    a.placePath === b.placePath &&
    a.feelVibe === b.feelVibe &&
    a.pace === b.pace &&
    (a.paceNotes ?? '') === (b.paceNotes ?? '') &&
    a.workModules.length === b.workModules.length &&
    a.workModules.every((m, i) => b.workModules[i] === m)
  );
}

type Patch = Partial<SpatialBuilderState> | ((state: SpatialBuilderState) => SpatialBuilderState);

/**
 * `sample` shows the studio on a frozen sample (the Digital Foundation design review): choices are held in memory,
 * nothing is saved, nothing is submitted, and no intake is started.
 */
export function useStudioSession(sample: SpatialBuilderState | null = null) {
  const live = useBuilderSpatialIntakeSession();
  const [frozen, setFrozen] = useState<SpatialBuilderState | null>(sample);
  const reviewSnapshot = useMemo(
    () => (frozen ? snapshotFromSpatialState(frozen, { allowEstimate: frozen.room === 'BLUEPRINT' && clientEstimatePreviewEnabled() }) : null),
    [frozen],
  );
  const session = useMemo(() => {
    if (!frozen || !reviewSnapshot) return live;
    return {
      ...live,
      state: frozen,
      snapshot: reviewSnapshot,
      selection: reviewSnapshot.selection,
      persist: (next: SpatialBuilderState) => {
        setFrozen(next);
        return next;
      },
      canEdit: true,
      isSubmitted: false,
      syncStatus: 'saved' as SpatialIntakeSyncStatus,
      goRoom: (() => false) as typeof live.goRoom,
      resetSession: () => undefined,
      submitForReview: (async () => null) as unknown as typeof live.submitForReview,
      serverIntakeId: null,
      serverIntake: null,
    };
  }, [live, frozen, reviewSnapshot]);
  const { state, persist, canEdit, intakeSync, syncStatus, conflictReason, serverIntake } = session;

  // Patch updates compose against the latest state, including one written earlier in the same tick.
  const latest = useRef(state);
  latest.current = state;

  const update = useCallback(
    (patch: Patch) => {
      if (!canEdit) return;
      const current = latest.current;
      const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch };
      latest.current = persist(next);
    },
    [canEdit, persist],
  );

  // The hook debounces server autosave (~900 ms) and keeps reporting the previous SAVED until that write starts.
  // SAVED is shown only when the server's copy holds the same choices as the screen.
  const serverDraft = useMemo(() => parseBuilderSpatialDraft(intakeSync.serverIntake?.draftPayload), [intakeSync.serverIntake]);
  const serverBehind = Boolean(intakeSync.serverIntakeId) && canEdit && !sameChoices(serverDraft?.spatialStudio ?? null, state);

  const submitted = useMemo(() => spatialSubmission(serverIntake), [serverIntake]);
  const review = useMemo(() => clientReviewState(serverIntake), [serverIntake]);
  const locked = !canEdit;
  const preview = clientEstimatePreviewEnabled();

  /** What the Blueprint shows: the submitted version while locked, otherwise the live configuration. */
  const view: { state: SpatialBuilderState; snapshot: BlueprintSessionSnapshot; fromSubmission: boolean } = useMemo(() => {
    if (locked && submitted) {
      const snap = versionSnapshot(submitted.current);
      // The founder's copy always carries the estimate; the client sees it only when the preview flag allows.
      return {
        state: { ...submitted.current.spatialState, room: 'BLUEPRINT' },
        snapshot: preview ? snap : { ...snap, estimate: null },
        fromSubmission: true,
      };
    }
    return { state, snapshot: session.snapshot, fromSubmission: false };
  }, [locked, submitted, preview, state, session.snapshot]);

  /** The live Blueprint as it would be submitted (room forced to BLUEPRINT), for readiness on rooms 01–04. */
  const readiness = useMemo(() => snapshotFromSpatialState({ ...state, room: 'BLUEPRINT' }, { allowEstimate: false }), [state]);

  // The hook flags a conflict by timestamp (its bootstrap re-stamps the on-device copy on every load). When the
  // device and SITE 00 hold the same choices there is nothing to resolve, so it is not shown as a conflict.
  const contentConflict = syncStatus === 'conflict' && serverBehind;
  // Remember whether the conflict, when first seen, was real (the device held different, newer choices).
  const conflictWasReal = useRef<boolean | null>(null);
  if (syncStatus !== 'conflict') conflictWasReal.current = null;
  else if (conflictWasReal.current === null) conflictWasReal.current = serverBehind;
  let shownStatus: SpatialIntakeSyncStatus = syncStatus;
  if (syncStatus === 'conflict' && !contentConflict) shownStatus = intakeSync.saveState === 'saving' ? 'saving' : intakeSync.saveState === 'error' ? 'sync_failed' : 'saved';
  else if (serverBehind && intakeSync.saveState !== 'error' && ['saved', 'restored', 'unsaved'].includes(syncStatus)) shownStatus = 'saving';
  const indicator = saveIndicator({
    status: shownStatus,
    saveState: intakeSync.saveState,
    lastSavedAt: intakeSync.lastSavedAt,
    errorMessage: intakeSync.errorMessage,
    conflictReason,
    recoveredLocal: syncStatus === 'conflict' && !contentConflict && conflictWasReal.current === true,
  });

  /** Retry a save SITE 00 did not take: start the intake if it never started, otherwise flush the draft again. */
  const retrySave = useCallback(async () => {
    const current = latest.current;
    if (!intakeSync.serverIntakeId) {
      const id = await intakeSync.ensureStarted({
        domainLabel: SPATIAL_INTAKE_DOMAIN_LABEL,
        sourceRoute: SPATIAL_INTAKE_SOURCE_ROUTE,
        draftPayload: draftPayloadFromEnvelope(envelopeFromSpatialState(current, null)),
      });
      return Boolean(id);
    }
    if (!canEdit) return false;
    const envelope = envelopeFromSpatialState(current, parseBuilderSpatialDraft(intakeSync.serverIntake?.draftPayload));
    return intakeSync.flushAutosave({ currentStep: `spatial:${current.room}`, totalSteps: 5, draftPayload: draftPayloadFromEnvelope(envelope) });
  }, [canEdit, intakeSync]);

  return { ...session, update, submitted, review, locked, view, readiness, indicator, retrySave, preview, serverHasChoices: !serverBehind, isSample: frozen !== null };
}

export type StudioSession = ReturnType<typeof useStudioSession>;
