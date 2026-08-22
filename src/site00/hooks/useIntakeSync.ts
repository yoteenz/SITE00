/**
 * SITE 00 — canonical server-side sync layer shared by useIdntyAssessment and useBldrAssessment.
 *
 * Local storage remains for instant UI + resilience/recovery (X), but the server draft created
 * here is the system of record (IX). Autosave failures FAIL LOUD (never silently claim SAVED when
 * only localStorage succeeded) — callers read `saveState` and `errorMessage` to reflect truthful
 * status in the UI.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IntakeDetail, IntakeType } from '../../../shared/site00-intakes/types';
import * as intakesApi from '../api/intakesApi';

export type IntakeSaveState = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DEBOUNCE_MS = 900;

function readLocal(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* local storage unavailable — server sync still governs correctness */
  }
}

export type UseIntakeSyncResult = {
  serverIntakeId: string | null;
  serverIntake: IntakeDetail | null;
  saveState: IntakeSaveState;
  lastSavedAt: string | null;
  errorMessage: string | null;
  guestToken: string | null;
  ensureStarted: (input: { domainLabel: string; sourceRoute?: string; draftPayload?: Record<string, unknown> }) => Promise<string | null>;
  autosave: (patch: {
    currentStep?: string | null;
    totalSteps?: number;
    draftPayload?: Record<string, unknown>;
  }) => void;
  submit: () => Promise<IntakeDetail | null>;
  requestGuestAccess: (email: string) => Promise<{ accessToken: string; expiresAt: string } | null>;
  reset: () => void;
};

export function useIntakeSync(intakeType: IntakeType, storageKeyPrefix: string): UseIntakeSyncResult {
  const idKey = `${storageKeyPrefix}-server-intake-id`;
  const tokenKey = `${storageKeyPrefix}-guest-token`;

  const [serverIntakeId, setServerIntakeId] = useState<string | null>(() => readLocal(idKey));
  const [guestToken, setGuestToken] = useState<string | null>(() => readLocal(tokenKey));
  const [serverIntake, setServerIntake] = useState<IntakeDetail | null>(null);
  const [saveState, setSaveState] = useState<IntakeSaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const serverIntakeIdRef = useRef<string | null>(serverIntakeId);
  const guestTokenRef = useRef<string | null>(guestToken);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPromiseRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    serverIntakeIdRef.current = serverIntakeId;
  }, [serverIntakeId]);
  useEffect(() => {
    guestTokenRef.current = guestToken;
  }, [guestToken]);

  useEffect(
    () => () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    },
    [],
  );

  const ensureStarted = useCallback(
    async (input: { domainLabel: string; sourceRoute?: string; draftPayload?: Record<string, unknown> }) => {
      if (serverIntakeIdRef.current) return serverIntakeIdRef.current;
      if (startPromiseRef.current) return startPromiseRef.current;

      setSaveState('saving');
      const promise = (async () => {
        try {
          const intake = await intakesApi.startIntake({
            intakeType,
            domainLabel: input.domainLabel,
            sourceRoute: input.sourceRoute,
            draftPayload: input.draftPayload,
          });
          writeLocal(idKey, intake.id);
          serverIntakeIdRef.current = intake.id;
          setServerIntakeId(intake.id);
          setServerIntake(intake);
          setSaveState('saved');
          setLastSavedAt(intake.lastSavedAt ?? intake.updatedAt);
          setErrorMessage(null);
          return intake.id;
        } catch (e) {
          setSaveState('error');
          setErrorMessage(e instanceof Error ? e.message : 'Could not reach SITE 00 to save your intake.');
          return null;
        } finally {
          startPromiseRef.current = null;
        }
      })();
      startPromiseRef.current = promise;
      return promise;
    },
    [idKey, intakeType],
  );

  const runAutosave = useCallback(
    async (patch: { currentStep?: string | null; totalSteps?: number; draftPayload?: Record<string, unknown> }) => {
      const id = serverIntakeIdRef.current;
      if (!id) return;
      setSaveState('saving');
      try {
        const intake = await intakesApi.autosaveIntake({
          intakeType,
          id,
          currentStep: patch.currentStep,
          totalSteps: patch.totalSteps,
          draftPayload: patch.draftPayload,
          guestToken: guestTokenRef.current,
        });
        setServerIntake(intake);
        setSaveState('saved');
        setLastSavedAt(intake.lastSavedAt ?? intake.updatedAt);
        setErrorMessage(null);
      } catch (e) {
        // FAIL LOUD — never report SAVED when the server write did not succeed.
        setSaveState('error');
        setErrorMessage(e instanceof Error ? e.message : 'SITE 00 could not save your latest answers.');
      }
    },
    [intakeType],
  );

  const autosave = useCallback(
    (patch: { currentStep?: string | null; totalSteps?: number; draftPayload?: Record<string, unknown> }) => {
      if (!serverIntakeIdRef.current) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        void runAutosave(patch);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [runAutosave],
  );

  const submit = useCallback(async (): Promise<IntakeDetail | null> => {
    const id = serverIntakeIdRef.current;
    if (!id) return null;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSaveState('saving');
    try {
      const intake = await intakesApi.submitIntake({ intakeType, id, guestToken: guestTokenRef.current });
      setServerIntake(intake);
      setSaveState('saved');
      setLastSavedAt(intake.submittedAt ?? intake.updatedAt);
      setErrorMessage(null);
      return intake;
    } catch (e) {
      setSaveState('error');
      setErrorMessage(e instanceof Error ? e.message : 'SITE 00 could not submit your intake. Try again.');
      return null;
    }
  }, [intakeType]);

  const requestGuestAccess = useCallback(
    async (email: string) => {
      const id = serverIntakeIdRef.current;
      if (!id) return null;
      try {
        const result = await intakesApi.requestGuestAccess({ intakeType, id, email });
        writeLocal(tokenKey, result.accessToken);
        guestTokenRef.current = result.accessToken;
        setGuestToken(result.accessToken);
        setServerIntake(result.intake);
        setErrorMessage(null);
        return { accessToken: result.accessToken, expiresAt: result.expiresAt };
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : 'Could not send secure access. Try again.');
        return null;
      }
    },
    [intakeType, tokenKey],
  );

  const reset = useCallback(() => {
    writeLocal(idKey, null);
    writeLocal(tokenKey, null);
    serverIntakeIdRef.current = null;
    guestTokenRef.current = null;
    setServerIntakeId(null);
    setGuestToken(null);
    setServerIntake(null);
    setSaveState('idle');
    setLastSavedAt(null);
    setErrorMessage(null);
  }, [idKey, tokenKey]);

  // Memoized so callers (useIdntyAssessment/useBldrAssessment) that depend on this object — or on
  // callbacks derived from it — get a stable reference across renders that did not actually change
  // any of these values. Without this, a fresh object identity on every render would cascade into
  // "new" useCallback identities downstream, which can retrigger effects that call ensureStarted()
  // on every render (infinite update loop) — see IdntyAssessmentStepPage/BldrAssessmentStepPage.
  return useMemo(
    () => ({
      serverIntakeId,
      serverIntake,
      saveState,
      lastSavedAt,
      errorMessage,
      guestToken,
      ensureStarted,
      autosave,
      submit,
      requestGuestAccess,
      reset,
    }),
    [
      serverIntakeId,
      serverIntake,
      saveState,
      lastSavedAt,
      errorMessage,
      guestToken,
      ensureStarted,
      autosave,
      submit,
      requestGuestAccess,
      reset,
    ],
  );
}
