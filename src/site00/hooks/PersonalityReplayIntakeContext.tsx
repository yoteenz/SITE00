import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
/**
 * Shared personality replay intake state — one provider per page tree.
 * Prevents parent review shell and step form from holding divergent hook instances.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { resolvePersonalityReplayResumeStepId } from '../../../shared/site00-brand-lore/personalityReadiness';
import type { ReplayConvergenceReport } from '../../../shared/site00-brand-lore/personalityReplayTypes';
import type { SixDirectionConsistencyRun } from '../../../shared/site00-brand-lore/sixDirectionConsistencyTypes';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { isReplayNotFoundError } from '../utils/personalityReplayErrors';

const LOCAL_KEY_PREFIX = 'site00-personality-replay:';

export type PersonalityReplayIntakeState = {
  projectSlug: string;
  replayId: string | null;
  answers: Record<string, string | string[]>;
  completedSteps: string[];
  status: string | null;
  executionPhase: string | null;
  executionError: string | null;
  executionJobId: string | null;
  nativeProofFormat: string | null;
  heroAsset: { assetId?: string; storagePath?: string } | null;
  comparisonReport: ReplayConvergenceReport | null;
  sixDirectionConsistency: SixDirectionConsistencyRun | null;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
  submitState: 'idle' | 'submitting' | 'submitted' | 'error';
  submitError: string | null;
  lastSavedAt: string | null;
  bootstrapping: boolean;
  bootstrapError: string | null;
  resumeStepId: string | null;
};

type PersonalityReplayIntakeContextValue = PersonalityReplayIntakeState & {
  setAnswer: (stepId: string, value: string | string[]) => void;
  markStepComplete: (stepId: string) => void;
  advanceStep: (stepId: string, value: string | string[]) => Promise<void>;
  submitIntake: () => Promise<boolean>;
  reload: () => Promise<void>;
  bootstrap: () => Promise<string | null>;
  retryBootstrap: () => void;
};

const PersonalityReplayIntakeContext = createContext<PersonalityReplayIntakeContextValue | null>(null);

function localKey(projectSlug: string): string {
  return `${LOCAL_KEY_PREFIX}${projectSlug}`;
}

function readLocal(projectSlug: string): Partial<PersonalityReplayIntakeState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(localKey(projectSlug));
    return raw ? (JSON.parse(raw) as Partial<PersonalityReplayIntakeState>) : null;
  } catch {
    return null;
  }
}

function writeLocal(projectSlug: string, data: Partial<PersonalityReplayIntakeState>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(localKey(projectSlug), JSON.stringify(data));
}

function clearLocal(projectSlug: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(localKey(projectSlug));
}

function hasAnswerValue(value: string | string[] | undefined): boolean {
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

function mergeAnswers(
  localAnswers: Record<string, string | string[]>,
  serverAnswers: Record<string, string | string[]>,
): Record<string, string | string[]> {
  const merged = { ...localAnswers };
  for (const [key, value] of Object.entries(serverAnswers)) {
    if (hasAnswerValue(value)) merged[key] = value;
  }
  return merged;
}

/** Module-level guard — only one bootstrap per slug at a time across remounts. */
const bootstrapInflightBySlug = new Map<string, Promise<string | null>>();

export function PersonalityReplayIntakeProvider({
  projectSlug,
  children,
}: {
  projectSlug: string;
  children: ReactNode;
}) {
  const local = useMemo(() => readLocal(projectSlug), [projectSlug]);
  const [replayId, setReplayId] = useState<string | null>(local?.replayId ?? null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(local?.answers ?? {});
  const [completedSteps, setCompletedSteps] = useState<string[]>(local?.completedSteps ?? []);
  const [status, setStatus] = useState<string | null>(local?.status ?? null);
  const [executionPhase, setExecutionPhase] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionJobId, setExecutionJobId] = useState<string | null>(null);
  const [nativeProofFormat, setNativeProofFormat] = useState<string | null>(null);
  const [heroAsset, setHeroAsset] = useState<{ assetId?: string; storagePath?: string } | null>(null);
  const [comparisonReport, setComparisonReport] = useState<ReplayConvergenceReport | null>(null);
  const [sixDirectionConsistency, setSixDirectionConsistency] = useState<SixDirectionConsistencyRun | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(local?.lastSavedAt ?? null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [resumeStepId, setResumeStepId] = useState<string | null>(() =>
    resolvePersonalityReplayResumeStepId(local?.answers ?? {}),
  );

  const answersRef = useRef(answers);
  const completedStepsRef = useRef(completedSteps);
  const replayIdRef = useRef(replayId);
  answersRef.current = answers;
  completedStepsRef.current = completedSteps;
  replayIdRef.current = replayId;

  const persistLocal = useCallback(
    (next: Partial<PersonalityReplayIntakeState>) => {
      writeLocal(projectSlug, {
        projectSlug,
        replayId: next.replayId ?? replayIdRef.current,
        answers: next.answers ?? answersRef.current,
        completedSteps: next.completedSteps ?? completedStepsRef.current,
        status: next.status ?? status,
        lastSavedAt: next.lastSavedAt ?? lastSavedAt,
      });
    },
    [projectSlug, status, lastSavedAt],
  );

  const applyReplayPayload = useCallback(
    (payload: {
      replayId: string;
      rawPersonalityAnswers?: Record<string, string | string[]>;
      personalityCompletedSteps?: string[];
      status?: string;
      executionPhase?: string | null;
      executionError?: string | null;
      executionJobId?: string | null;
      nativeProofFormat?: string | null;
      heroAsset?: { assetId?: string; storagePath?: string } | null;
      comparisonReport?: ReplayConvergenceReport | null;
      sixDirectionConsistency?: SixDirectionConsistencyRun | null;
    }) => {
      const serverAnswers = payload.rawPersonalityAnswers ?? {};
      const localAnswers = readLocal(projectSlug)?.answers ?? answersRef.current;
      const nextAnswers = mergeAnswers(localAnswers, serverAnswers);
      const nextCompleted = payload.personalityCompletedSteps?.length
        ? payload.personalityCompletedSteps
        : completedStepsRef.current;

      setReplayId(payload.replayId);
      setAnswers(nextAnswers);
      setCompletedSteps(nextCompleted);
      setStatus(payload.status ?? null);
      setExecutionPhase(payload.executionPhase ?? null);
      setExecutionError(payload.executionError ?? null);
      setExecutionJobId(payload.executionJobId ?? null);
      setNativeProofFormat(payload.nativeProofFormat ?? null);
      setHeroAsset(payload.heroAsset ?? null);
      setComparisonReport(payload.comparisonReport ?? null);
      setSixDirectionConsistency(payload.sixDirectionConsistency ?? null);
      setResumeStepId(resolvePersonalityReplayResumeStepId(nextAnswers));
      persistLocal({
        replayId: payload.replayId,
        answers: nextAnswers,
        completedSteps: nextCompleted,
        status: payload.status ?? null,
      });
    },
    [persistLocal, projectSlug],
  );

  /** Stale replayId (e.g. in-memory API restart) — bootstrap fresh run and push local answers. */
  const rebindReplayFromLocal = useCallback(async (): Promise<string | null> => {
    if (!hasProjectCapability(projectSlug, 'PERSONALITY_REPLAY')) return null;

    const localAnswers = answersRef.current;
    const localCompleted = completedStepsRef.current;

    bootstrapInflightBySlug.delete(projectSlug);
    setBootstrapping(true);
    setBootstrapError(null);

    try {
      const result = await site00ProjectsApi.personalityReplayBootstrap(projectSlug);
      const newReplayId = result.replay.replayId;
      replayIdRef.current = newReplayId;
      setReplayId(newReplayId);

      let nextStatus = result.replay.status;
      if (Object.keys(localAnswers).length > 0) {
        const saved = await site00ProjectsApi.personalityReplaySave(projectSlug, newReplayId, {
          answers: localAnswers,
          completedSteps: localCompleted,
        });
        nextStatus = saved.replay.status;
      }

      applyReplayPayload({
        replayId: newReplayId,
        rawPersonalityAnswers: localAnswers,
        personalityCompletedSteps: localCompleted,
        status: nextStatus,
      });
      return newReplayId;
    } catch (err) {
      setBootstrapError(err instanceof Error ? err.message : 'Unable to recover personality intake');
      return null;
    } finally {
      setBootstrapping(false);
      bootstrapInflightBySlug.delete(projectSlug);
    }
  }, [applyReplayPayload, projectSlug]);

  const saveToServer = useCallback(
    async (
      nextAnswers: Record<string, string | string[]>,
      nextCompleted: string[],
      replayIdOverride?: string,
    ) => {
      const activeReplayId = replayIdOverride ?? replayIdRef.current;
      if (!activeReplayId) return;
      setSaveState('saving');
      setSaveError(null);
      try {
        const result = await site00ProjectsApi.personalityReplaySave(projectSlug, activeReplayId, {
          answers: nextAnswers,
          completedSteps: nextCompleted,
        });
        const ts = new Date().toISOString();
        setStatus(result.replay.status);
        setLastSavedAt(ts);
        setSaveState('saved');
        setResumeStepId(resolvePersonalityReplayResumeStepId(nextAnswers));
        persistLocal({
          replayId: activeReplayId,
          answers: nextAnswers,
          completedSteps: nextCompleted,
          status: result.replay.status,
          lastSavedAt: ts,
        });
      } catch (err) {
        if (!replayIdOverride && isReplayNotFoundError(err)) {
          const rebound = await rebindReplayFromLocal();
          if (rebound) {
            await saveToServer(nextAnswers, nextCompleted, rebound);
            return;
          }
        }
        setSaveState('error');
        setSaveError(err instanceof Error ? err.message : 'Save failed');
        persistLocal({ answers: nextAnswers, completedSteps: nextCompleted });
      }
    },
    [projectSlug, persistLocal, rebindReplayFromLocal],
  );

  const reload = useCallback(async () => {
    const activeReplayId = replayIdRef.current;
    if (!activeReplayId) return;
    try {
      const result = await site00ProjectsApi.personalityReplayGet(projectSlug, activeReplayId);
      const replay = result.replay as {
        replayId?: string;
        rawPersonalityAnswers?: Record<string, string | string[]>;
        personalityCompletedSteps?: string[];
        status?: string;
        executionPhase?: string | null;
        executionError?: string | null;
        executionJobId?: string | null;
        nativeProofFormat?: string | null;
        heroAsset?: { assetId?: string; storagePath?: string } | null;
        comparisonReport?: ReplayConvergenceReport | null;
        sixDirectionConsistency?: SixDirectionConsistencyRun | null;
      };
      applyReplayPayload({
        replayId: replay.replayId ?? activeReplayId,
        rawPersonalityAnswers: replay.rawPersonalityAnswers,
        personalityCompletedSteps: replay.personalityCompletedSteps,
        status: replay.status,
        executionPhase: replay.executionPhase,
        executionError: replay.executionError,
        executionJobId: replay.executionJobId,
        nativeProofFormat: replay.nativeProofFormat,
        heroAsset: replay.heroAsset,
        comparisonReport: replay.comparisonReport,
        sixDirectionConsistency: replay.sixDirectionConsistency,
      });
    } catch (err) {
      if (isReplayNotFoundError(err)) {
        await rebindReplayFromLocal();
        return;
      }
      const cached = readLocal(projectSlug);
      if (cached?.answers && Object.keys(cached.answers).length > 0) {
        setAnswers(cached.answers);
        setCompletedSteps(cached.completedSteps ?? []);
        setStatus(cached.status ?? null);
        setResumeStepId(resolvePersonalityReplayResumeStepId(cached.answers));
        return;
      }
      clearLocal(projectSlug);
      setReplayId(null);
      setAnswers({});
      setCompletedSteps([]);
      setStatus(null);
      setResumeStepId(null);
    }
  }, [applyReplayPayload, projectSlug, rebindReplayFromLocal]);

  const bootstrap = useCallback(async (): Promise<string | null> => {
    if (!hasProjectCapability(projectSlug, 'PERSONALITY_REPLAY')) return null;

    const inflight = bootstrapInflightBySlug.get(projectSlug);
    if (inflight) return inflight;

    const promise = (async () => {
      setBootstrapping(true);
      setBootstrapError(null);
      try {
        const result = await site00ProjectsApi.personalityReplayBootstrap(projectSlug);
        applyReplayPayload({
          replayId: result.replay.replayId,
          rawPersonalityAnswers: result.replay.rawPersonalityAnswers,
          personalityCompletedSteps: result.replay.personalityCompletedSteps,
          status: result.replay.status,
          executionPhase: (result.replay as { executionPhase?: string }).executionPhase,
          executionError: (result.replay as { executionError?: string }).executionError,
          executionJobId: (result.replay as { executionJobId?: string }).executionJobId,
          nativeProofFormat: (result.replay as { nativeProofFormat?: string }).nativeProofFormat,
          heroAsset: (result.replay as { heroAsset?: { assetId?: string; storagePath?: string } }).heroAsset,
          comparisonReport: (result.replay as { comparisonReport?: ReplayConvergenceReport }).comparisonReport,
          sixDirectionConsistency: (result.replay as { sixDirectionConsistency?: SixDirectionConsistencyRun })
            .sixDirectionConsistency,
        });
        return result.resumeStepId;
      } catch (err) {
        setBootstrapError(err instanceof Error ? err.message : 'Unable to start personality intake');
        return null;
      } finally {
        setBootstrapping(false);
        bootstrapInflightBySlug.delete(projectSlug);
      }
    })();

    bootstrapInflightBySlug.set(projectSlug, promise);
    return promise;
  }, [applyReplayPayload, projectSlug]);

  const retryBootstrap = useCallback(() => {
    bootstrapInflightBySlug.delete(projectSlug);
    clearLocal(projectSlug);
    setReplayId(null);
    setAnswers({});
    setCompletedSteps([]);
    setStatus(null);
    setResumeStepId(null);
    setBootstrapError(null);
    void bootstrap();
  }, [bootstrap, projectSlug]);

  useEffect(() => {
    if (!replayId) return;
    void reload().catch(() => undefined);
  }, [replayId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasProjectCapability(projectSlug, 'PERSONALITY_REPLAY')) return;
    if (replayId || bootstrapping || bootstrapError) return;
    void bootstrap();
  }, [bootstrap, bootstrapError, bootstrapping, projectSlug, replayId]);

  const advanceStep = useCallback(
    async (stepId: string, value: string | string[]) => {
      const nextAnswers = { ...answersRef.current, [stepId]: value };
      const nextCompleted = completedStepsRef.current.includes(stepId)
        ? completedStepsRef.current
        : [...completedStepsRef.current, stepId];
      setAnswers(nextAnswers);
      setCompletedSteps(nextCompleted);
      await saveToServer(nextAnswers, nextCompleted);
    },
    [saveToServer],
  );

  const setAnswer = useCallback(
    (stepId: string, value: string | string[]) => {
      void advanceStep(stepId, value);
    },
    [advanceStep],
  );

  const markStepComplete = useCallback(
    (stepId: string) => {
      const nextCompleted = completedStepsRef.current.includes(stepId)
        ? completedStepsRef.current
        : [...completedStepsRef.current, stepId];
      setCompletedSteps(nextCompleted);
      void saveToServer(answersRef.current, nextCompleted);
    },
    [saveToServer],
  );

  const submitIntake = useCallback(async (): Promise<boolean> => {
    let activeReplayId = replayIdRef.current;
    if (!activeReplayId) return false;
    setSubmitState('submitting');
    setSubmitError(null);
    try {
      await site00ProjectsApi.personalityReplayComplete(projectSlug, activeReplayId);
      await reload();
      setSubmitState('submitted');
      return true;
    } catch (err) {
      if (isReplayNotFoundError(err)) {
        activeReplayId = await rebindReplayFromLocal();
        if (activeReplayId) {
          try {
            await site00ProjectsApi.personalityReplayComplete(projectSlug, activeReplayId);
            await reload();
            setSubmitState('submitted');
            return true;
          } catch (retryErr) {
            setSubmitState('error');
            setSubmitError(retryErr instanceof Error ? retryErr.message : 'Submit failed');
            return false;
          }
        }
      }
      setSubmitState('error');
      setSubmitError(err instanceof Error ? err.message : 'Submit failed');
      return false;
    }
  }, [projectSlug, reload, rebindReplayFromLocal]);

  const value = useMemo<PersonalityReplayIntakeContextValue>(
    () => ({
      projectSlug,
      replayId,
      answers,
      completedSteps,
      status,
      executionPhase,
      executionError,
      executionJobId,
      nativeProofFormat,
      heroAsset,
      comparisonReport,
      sixDirectionConsistency,
      saveState,
      saveError,
      submitState,
      submitError,
      lastSavedAt,
      bootstrapping,
      bootstrapError,
      resumeStepId,
      setAnswer,
      markStepComplete,
      advanceStep,
      submitIntake,
      reload,
      bootstrap,
      retryBootstrap,
    }),
    [
      projectSlug,
      replayId,
      answers,
      completedSteps,
      status,
      executionPhase,
      executionError,
      executionJobId,
      nativeProofFormat,
      heroAsset,
      comparisonReport,
      sixDirectionConsistency,
      saveState,
      saveError,
      submitState,
      submitError,
      lastSavedAt,
      bootstrapping,
      bootstrapError,
      resumeStepId,
      setAnswer,
      markStepComplete,
      advanceStep,
      submitIntake,
      reload,
      bootstrap,
      retryBootstrap,
    ],
  );

  return (
    <PersonalityReplayIntakeContext.Provider value={value}>{children}</PersonalityReplayIntakeContext.Provider>
  );
}

export function usePersonalityReplayIntake(projectSlug: string): PersonalityReplayIntakeContextValue {
  const ctx = useContext(PersonalityReplayIntakeContext);
  if (!ctx) {
    throw new Error('usePersonalityReplayIntake must be used within PersonalityReplayIntakeProvider');
  }
  if (ctx.projectSlug !== projectSlug) {
    throw new Error(`Personality replay provider slug mismatch: expected ${projectSlug}, got ${ctx.projectSlug}`);
  }
  return ctx;
}
