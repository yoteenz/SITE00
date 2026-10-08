/**
 * Hybrid Spatial Studio + canonical Builder intake (server-backed).
 * Presentation-neutral — Opus consumes syncStatus + session methods.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { IntakeDetail } from '../../../../shared/site00-intakes/types';
import { normalizeIntakeStatus } from '../../../../shared/site00-intakes/types';
import { clientEstimatePreviewEnabled } from '../../../studioos/estimation/flags';
import { useIntakeSync } from '../../hooks/useIntakeSync';
import { loadSpatialBuilderState, saveSpatialBuilderState } from './persistence';
import {
  applyLegacyIntakeHints,
  draftPayloadFromEnvelope,
  envelopeFromSpatialState,
  parseBuilderSpatialDraft,
  resolveSpatialDraftConflict,
  SPATIAL_INTAKE_DOMAIN_LABEL,
  SPATIAL_INTAKE_SOURCE_ROUTE,
} from './intakeDraft';
import { snapshotFromSpatialState, revealEstimateForRoom } from './blueprintSessionContract';
import { buildObjectParametersFromSpatialState } from './buildObjectContract';
import { canEnterRoom, spatialSelectionToBuilder } from './mapping';
import type { SpatialBuilderState, SpatialRoomId } from './types';
import { emptySpatialState } from './types';

export type SpatialIntakeSyncStatus =
  | 'idle'
  | 'restoring'
  | 'restored'
  | 'unsaved'
  | 'saving'
  | 'saved'
  | 'local_only'
  | 'sync_failed'
  | 'conflict'
  | 'submitting'
  | 'submitted'
  | 'submission_failed';

const STORAGE_PREFIX = 'site00-bldr-spatial';

export function useBuilderSpatialIntakeSession() {
  const intakeSync = useIntakeSync('BUILDER', STORAGE_PREFIX);
  const [searchParams] = useSearchParams();
  const queryIntakeId = searchParams.get('intakeId');

  const [state, setState] = useState<SpatialBuilderState>(() => loadSpatialBuilderState());
  const [hydrationStatus, setHydrationStatus] = useState<'pending' | 'done'>('pending');
  const [conflictReason, setConflictReason] = useState<string | null>(null);
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');
  const startedRef = useRef(false);

  const intakeStatus = intakeSync.serverIntake ? normalizeIntakeStatus(intakeSync.serverIntake.status) : null;
  const isSubmitted =
    intakeStatus === 'SUBMITTED' || intakeStatus === 'IN_REVIEW' || intakeStatus === 'CONVERTED';
  const canEdit = !isSubmitted || Boolean(parseBuilderSpatialDraft(intakeSync.serverIntake?.draftPayload)?.revisionOpen);

  const syncStatus: SpatialIntakeSyncStatus = useMemo(() => {
    if (hydrationStatus === 'pending') return 'restoring';
    if (submitPhase === 'submitting') return 'submitting';
    if (submitPhase === 'submitted' || (isSubmitted && !canEdit)) return 'submitted';
    if (submitPhase === 'failed') return 'submission_failed';
    if (conflictReason) return 'conflict';
    if (intakeSync.saveState === 'saving') return 'saving';
    if (intakeSync.saveState === 'error') return intakeSync.serverIntakeId ? 'sync_failed' : 'local_only';
    if (intakeSync.saveState === 'saved') return 'saved';
    if (!intakeSync.serverIntakeId) return 'local_only';
    return 'unsaved';
  }, [hydrationStatus, submitPhase, isSubmitted, canEdit, conflictReason, intakeSync.saveState, intakeSync.serverIntakeId]);

  const persistLocal = useCallback((next: SpatialBuilderState) => {
    const saved = saveSpatialBuilderState(next);
    setState(saved);
    return saved;
  }, []);

  const pushServerDraft = useCallback(
    (next: SpatialBuilderState, envelopePrev: ReturnType<typeof parseBuilderSpatialDraft>) => {
      const envelope = envelopeFromSpatialState(next, envelopePrev);
      intakeSync.autosave({
        currentStep: `spatial:${next.room}`,
        totalSteps: 5,
        draftPayload: draftPayloadFromEnvelope(envelope),
      });
    },
    [intakeSync],
  );

  const persist = useCallback(
    (next: SpatialBuilderState) => {
      const local = persistLocal(next);
      if (!intakeSync.serverIntakeId || !canEdit) return local;
      const prev = parseBuilderSpatialDraft(intakeSync.serverIntake?.draftPayload);
      pushServerDraft(local, prev);
      return local;
    },
    [canEdit, intakeSync.serverIntake, intakeSync.serverIntakeId, persistLocal, pushServerDraft],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    (async () => {
      setHydrationStatus('pending');
      let remote: IntakeDetail | null = null;
      if (queryIntakeId) {
        remote = await intakeSync.adoptIntakeId(queryIntakeId);
      }
      if (!remote) {
        await intakeSync.ensureStarted({
          domainLabel: SPATIAL_INTAKE_DOMAIN_LABEL,
          sourceRoute: SPATIAL_INTAKE_SOURCE_ROUTE,
          draftPayload: draftPayloadFromEnvelope(envelopeFromSpatialState(loadSpatialBuilderState(), null)),
        });
        remote = await intakeSync.reloadIntake();
      }
      if (cancelled) return;

      const serverEnvelope = parseBuilderSpatialDraft(remote?.draftPayload);
      const local = loadSpatialBuilderState();
      const resolved = resolveSpatialDraftConflict({
        serverEnvelope,
        localState: local.savedAt ? local : null,
        serverLastSavedAt: remote?.lastSavedAt ?? null,
      });

      let merged = resolved.state;
      if (serverEnvelope?.legacy) {
        merged = applyLegacyIntakeHints(merged, serverEnvelope.legacy);
      } else if (remote?.draftPayload) {
        merged = applyLegacyIntakeHints(merged, remote.draftPayload as Record<string, unknown>);
      }

      setConflictReason(resolved.kind === 'use_local' && resolved.reason !== 'LOCAL_CACHE_MISSING' ? resolved.reason : null);
      persistLocal(merged);

      const revisionOpen = Boolean(serverEnvelope?.revisionOpen);
      const editable = !remote || !['SUBMITTED', 'IN_REVIEW', 'CONVERTED'].includes(normalizeIntakeStatus(remote.status)) || revisionOpen;
      if (resolved.kind === 'use_local' && intakeSync.serverIntakeId && editable) {
        pushServerDraft(merged, serverEnvelope);
      }

      setHydrationStatus('done');
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time bootstrap
  }, []);

  const selection = useMemo(() => spatialSelectionToBuilder(state), [state]);
  const showEstimate = revealEstimateForRoom(state.room, clientEstimatePreviewEnabled());
  const snapshot = useMemo(
    () => snapshotFromSpatialState(state, { allowEstimate: showEstimate }),
    [state, showEstimate],
  );
  const buildObject = useMemo(
    () =>
      buildObjectParametersFromSpatialState({
        placePath: state.placePath,
        feelVibe: state.feelVibe,
        workModules: state.workModules,
        pace: state.pace,
      }),
    [state.placePath, state.feelVibe, state.workModules, state.pace],
  );

  const goRoom = useCallback(
    (room: SpatialRoomId) => {
      if (!canEdit && room !== 'BLUEPRINT') return false;
      if (!canEnterRoom(state, room)) return false;
      persist({ ...state, room });
      return true;
    },
    [persist, state, canEdit],
  );

  const resetSession = useCallback(() => {
    intakeSync.reset();
    persistLocal(emptySpatialState());
    startedRef.current = false;
    setHydrationStatus('pending');
    setSubmitPhase('idle');
  }, [intakeSync, persistLocal]);

  const submitForReview = useCallback(async () => {
    if (!snapshot.submission_ready) {
      setSubmitPhase('failed');
      return null;
    }
    if (!intakeSync.serverIntakeId) {
      setSubmitPhase('failed');
      return null;
    }
    setSubmitPhase('submitting');
    const prev = parseBuilderSpatialDraft(intakeSync.serverIntake?.draftPayload);
    const envelope = envelopeFromSpatialState(state, prev);
    try {
      await intakeSync.flushAutosave({
        currentStep: 'spatial:BLUEPRINT',
        totalSteps: 5,
        draftPayload: draftPayloadFromEnvelope(envelope),
      });
      const result = await intakeSync.submit();
      if (!result) {
        setSubmitPhase('failed');
        return null;
      }
      setSubmitPhase('submitted');
      return result;
    } catch {
      setSubmitPhase('failed');
      return null;
    }
  }, [intakeSync, snapshot.submission_ready, state]);

  return {
    state,
    persist,
    selection,
    snapshot,
    buildObject,
    goRoom,
    resetSession,
    showEstimate,
    syncStatus,
    conflictReason,
    canEdit,
    isSubmitted,
    intakeSync,
    submitForReview,
    serverIntakeId: intakeSync.serverIntakeId,
    serverIntake: intakeSync.serverIntake,
  };
}

export type BuilderSpatialIntakeSession = ReturnType<typeof useBuilderSpatialIntakeSession>;
